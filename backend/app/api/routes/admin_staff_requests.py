import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.restaurant import Restaurant
from app.models.restaurant_table import RestaurantTable
from app.models.staff_request import StaffRequest
from app.schemas.admin_staff_request import (
    AdminStaffRequestResponse,
    AdminStaffRequestUpdate,
)


router = APIRouter(
    prefix="/admin/staff-requests",
    tags=["Admin Staff Requests"],
)

DEV_RESTAURANT_SLUG = "the-bistro-downtown"


@router.get(
    "",
    response_model=list[AdminStaffRequestResponse],
)
async def get_staff_requests(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(StaffRequest, RestaurantTable)
        .join(
            RestaurantTable,
            StaffRequest.table_id == RestaurantTable.id,
        )
        .join(
            Restaurant,
            StaffRequest.restaurant_id == Restaurant.id,
        )
        .where(
            Restaurant.slug == DEV_RESTAURANT_SLUG
        )
        .order_by(StaffRequest.created_at.desc())
    )

    rows = result.all()

    return [
        AdminStaffRequestResponse(
            id=staff_request.id,
            public_token=staff_request.public_token,
            table_id=staff_request.table_id,
            table_number=str(table.table_number),
            reason=staff_request.reason,
            message=staff_request.message,
            status=staff_request.status,
            created_at=staff_request.created_at,
            accepted_at=staff_request.accepted_at,
            completed_at=staff_request.completed_at,
        )
        for staff_request, table in rows
    ]


@router.patch(
    "/{staff_request_id}",
    response_model=AdminStaffRequestResponse,
)
async def update_staff_request(
    staff_request_id: uuid.UUID,
    payload: AdminStaffRequestUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(StaffRequest, RestaurantTable)
        .join(
            RestaurantTable,
            StaffRequest.table_id == RestaurantTable.id,
        )
        .join(
            Restaurant,
            StaffRequest.restaurant_id == Restaurant.id,
        )
        .where(
            StaffRequest.id == staff_request_id,
            Restaurant.slug == DEV_RESTAURANT_SLUG,
        )
    )

    row = result.first()

    if row is None:
        raise HTTPException(
            status_code=404,
            detail="Staff request not found.",
        )

    staff_request, table = row
    now = datetime.now(timezone.utc)

    if payload.status == "accepted":
        if staff_request.status != "new":
            raise HTTPException(
                status_code=400,
                detail="Only new requests can be accepted.",
            )

        staff_request.status = "accepted"
        staff_request.accepted_at = now

    elif payload.status == "completed":
        if staff_request.status != "accepted":
            raise HTTPException(
                status_code=400,
                detail="Only accepted requests can be completed.",
            )

        staff_request.status = "completed"
        staff_request.completed_at = now

    await db.commit()
    await db.refresh(staff_request)

    return AdminStaffRequestResponse(
        id=staff_request.id,
        public_token=staff_request.public_token,
        table_id=staff_request.table_id,
        table_number=str(table.table_number),
        reason=staff_request.reason,
        message=staff_request.message,
        status=staff_request.status,
        created_at=staff_request.created_at,
        accepted_at=staff_request.accepted_at,
        completed_at=staff_request.completed_at,
    )