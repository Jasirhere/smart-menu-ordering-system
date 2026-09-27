import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.menu_item import MenuItem
from app.models.shared_cart_item import SharedCartItem
from app.models.table_participant import TableParticipant
from app.models.table_session import TableSession
from app.models.restaurant_table import RestaurantTable
from app.schemas.order import OrderResponse
from app.schemas.shared_cart import (
    SharedCartCheckoutRequest,
    SharedCartItemResponse,
    SharedCartItemUpdate,
    SharedCartResponse,
)
from app.services.order_service import (
    OrderItemInput,
    create_order_for_table,
)


router = APIRouter(
    prefix="/public/table-sessions",
    tags=["Public Shared Cart"],
)


async def build_cart_response(
    session: TableSession,
    db: AsyncSession,
):
    result = await db.execute(
        select(
            SharedCartItem,
            MenuItem,
            TableParticipant,
        )
        .join(
            MenuItem,
            SharedCartItem.menu_item_id == MenuItem.id,
        )
        .join(
            TableParticipant,
            SharedCartItem.participant_id == TableParticipant.id,
        )
        .where(
            SharedCartItem.session_id == session.id
        )
        .order_by(SharedCartItem.created_at)
    )

    rows = result.all()

    return SharedCartResponse(
        session_public_token=session.public_token,
        items=[
            SharedCartItemResponse(
                menu_item_id=cart_item.menu_item_id,
                name=menu_item.name,
                price=menu_item.price,
                quantity=cart_item.quantity,
                participant_public_token=participant.public_token,
                participant_name=participant.display_name,
            )
            for cart_item, menu_item, participant in rows
        ],
    )


@router.get(
    "/{session_public_token}/cart",
    response_model=SharedCartResponse,
)
async def get_shared_cart(
    session_public_token: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TableSession).where(
            TableSession.public_token == session_public_token,
            TableSession.status == "active",
        )
    )

    session = result.scalar_one_or_none()

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Active table session not found.",
        )

    return await build_cart_response(session, db)


@router.put(
    "/{session_public_token}/cart/{menu_item_id}",
    response_model=SharedCartResponse,
)
async def update_shared_cart_item(
    session_public_token: uuid.UUID,
    menu_item_id: uuid.UUID,
    payload: SharedCartItemUpdate,
    db: AsyncSession = Depends(get_db),
):
    session_result = await db.execute(
        select(TableSession).where(
            TableSession.public_token == session_public_token,
            TableSession.status == "active",
        )
    )

    session = session_result.scalar_one_or_none()

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Active table session not found.",
        )

    participant_result = await db.execute(
        select(TableParticipant).where(
            TableParticipant.public_token
            == payload.participant_public_token,
            TableParticipant.session_id == session.id,
        )
    )

    participant = participant_result.scalar_one_or_none()

    if participant is None:
        raise HTTPException(
            status_code=403,
            detail="Participant does not belong to this session.",
        )

    menu_result = await db.execute(
        select(MenuItem).where(
            MenuItem.id == menu_item_id,
            MenuItem.restaurant_id == session.restaurant_id,
            MenuItem.is_available.is_(True),
        )
    )

    menu_item = menu_result.scalar_one_or_none()

    if menu_item is None:
        raise HTTPException(
            status_code=404,
            detail="Menu item not found.",
        )

    existing_result = await db.execute(
        select(SharedCartItem).where(
            SharedCartItem.session_id == session.id,
            SharedCartItem.participant_id == participant.id,
            SharedCartItem.menu_item_id == menu_item.id,
        )
    )

    cart_item = existing_result.scalar_one_or_none()

    if payload.quantity == 0:
        if cart_item is not None:
            await db.delete(cart_item)

    elif cart_item is None:
        db.add(
            SharedCartItem(
                session_id=session.id,
                participant_id=participant.id,
                menu_item_id=menu_item.id,
                quantity=payload.quantity,
            )
        )

    else:
        cart_item.quantity = payload.quantity

    await db.commit()

    return await build_cart_response(session, db)


@router.post(
    "/{session_public_token}/checkout",
    response_model=OrderResponse,
    status_code=201,
)
async def checkout_shared_cart(
    session_public_token: uuid.UUID,
    payload: SharedCartCheckoutRequest,
    db: AsyncSession = Depends(get_db),
):
    session_result = await db.execute(
        select(TableSession)
        .where(
            TableSession.public_token == session_public_token,
            TableSession.status == "active",
        )
        .with_for_update()
    )
    session = session_result.scalar_one_or_none()

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Active table session not found.",
        )

    participant_result = await db.execute(
        select(TableParticipant).where(
            TableParticipant.public_token
            == payload.participant_public_token,
            TableParticipant.session_id == session.id,
        )
    )
    participant = participant_result.scalar_one_or_none()

    if participant is None:
        raise HTTPException(
            status_code=403,
            detail="Participant does not belong to this session.",
        )

    table_result = await db.execute(
        select(RestaurantTable).where(
            RestaurantTable.id == session.table_id,
        )
    )
    table = table_result.scalar_one_or_none()

    if table is None:
        raise HTTPException(
            status_code=404,
            detail="Restaurant table not found.",
        )

    cart_result = await db.execute(
        select(SharedCartItem).where(
            SharedCartItem.session_id == session.id,
        )
    )
    cart_items = cart_result.scalars().all()

    if not cart_items:
        raise HTTPException(
            status_code=400,
            detail="Shared cart is empty.",
        )

    quantities_by_menu_item: dict[uuid.UUID, int] = {}

    for cart_item in cart_items:
        quantities_by_menu_item[cart_item.menu_item_id] = (
            quantities_by_menu_item.get(cart_item.menu_item_id, 0)
            + cart_item.quantity
        )

    requested_items = [
        OrderItemInput(
            menu_item_id=menu_item_id,
            quantity=quantity,
        )
        for menu_item_id, quantity in quantities_by_menu_item.items()
    ]

    order = await create_order_for_table(
        db=db,
        table=table,
        requested_items=requested_items,
    )

    await db.execute(
        delete(SharedCartItem).where(
            SharedCartItem.session_id == session.id,
        )
    )
    await db.commit()
    await db.refresh(order)

    return OrderResponse(
        id=order.id,
        public_token=order.public_token,
        status=order.status,
        subtotal=order.subtotal,
        table_number=table.table_number,
        created_at=order.created_at,
    )