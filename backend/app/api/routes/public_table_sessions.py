import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.restaurant_table import RestaurantTable
from app.models.table_participant import TableParticipant
from app.models.table_session import TableSession
from app.schemas.table_session import (
    JoinTableSessionRequest,
    JoinTableSessionResponse,
)


router = APIRouter(
    prefix="/public/tables",
    tags=["Public Table Sessions"],
)


@router.post(
    "/{table_public_token}/session/join",
    response_model=JoinTableSessionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def join_table_session(
    table_public_token: uuid.UUID,
    payload: JoinTableSessionRequest,
    db: AsyncSession = Depends(get_db),
):
    table_result = await db.execute(
        select(RestaurantTable).where(
            RestaurantTable.public_token == table_public_token,
            RestaurantTable.is_active.is_(True),
        )
    )

    table = table_result.scalar_one_or_none()

    if table is None:
        raise HTTPException(
            status_code=404,
            detail="Table not found.",
        )

    session_result = await db.execute(
        select(TableSession).where(
            TableSession.table_id == table.id,
            TableSession.status == "active",
        )
    )

    table_session = session_result.scalar_one_or_none()

    if table_session is None:
        table_session = TableSession(
            restaurant_id=table.restaurant_id,
            table_id=table.id,
        )

        db.add(table_session)
        await db.flush()

    participant = TableParticipant(
        session_id=table_session.id,
        display_name=payload.display_name.strip(),
    )

    db.add(participant)

    await db.commit()
    await db.refresh(table_session)
    await db.refresh(participant)

    return JoinTableSessionResponse(
        session_public_token=table_session.public_token,
        participant_public_token=participant.public_token,
        display_name=participant.display_name,
        table_number=table.table_number,
    )