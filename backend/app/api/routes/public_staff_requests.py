import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.restaurant_table import RestaurantTable
from app.models.staff_request import StaffRequest
from app.schemas.staff_request import (
    StaffRequestCreate,
    StaffRequestResponse,
)


router = APIRouter(
    prefix="/public/tables",
    tags=["Public Staff Requests"],
)


@router.post(
    "/{table_public_token}/staff-requests",
    response_model=StaffRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_staff_request(
    table_public_token: uuid.UUID,
    payload: StaffRequestCreate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(RestaurantTable).where(
            RestaurantTable.public_token == table_public_token,
            RestaurantTable.is_active.is_(True),
        )
    )

    table = result.scalar_one_or_none()

    if table is None:
        raise HTTPException(
            status_code=404,
            detail="Table not found.",
        )

    staff_request = StaffRequest(
        restaurant_id=table.restaurant_id,
        table_id=table.id,
        reason=payload.reason,
        message=payload.message,
    )

    db.add(staff_request)

    await db.commit()
    await db.refresh(staff_request)

    return StaffRequestResponse(
        public_token=staff_request.public_token,
        reason=staff_request.reason,
        message=staff_request.message,
        status=staff_request.status,
        created_at=staff_request.created_at,
        accepted_at=staff_request.accepted_at,
        completed_at=staff_request.completed_at,
    )


@router.get(
    "/staff-requests/{request_public_token}",
    response_model=StaffRequestResponse,
)
async def get_staff_request_status(
    request_public_token: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(StaffRequest).where(
            StaffRequest.public_token == request_public_token
        )
    )

    staff_request = result.scalar_one_or_none()

    if staff_request is None:
        raise HTTPException(
            status_code=404,
            detail="Staff request not found.",
        )

    return StaffRequestResponse(
        public_token=staff_request.public_token,
        reason=staff_request.reason,
        message=staff_request.message,
        status=staff_request.status,
        created_at=staff_request.created_at,
        accepted_at=staff_request.accepted_at,
        completed_at=staff_request.completed_at,
    )