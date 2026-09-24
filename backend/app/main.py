import logging
import app.models
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.api.routes.public_tables import router as public_tables_router
from app.core.config import settings
from app.db.session import engine
from app.api.routes.orders import router as orders_router
from app.api.routes.admin_tables import router as admin_tables_router
from app.api.routes.admin_orders import router as admin_orders_router
from app.api.routes.admin_dashboard import router as admin_dashboard_router
from app.api.routes.admin_menu import router as admin_menu_router
from app.api.routes.admin_analytics import router as admin_analytics_router
from app.api.routes.public_feedback import router as public_feedback_router
from app.api.routes.admin_feedback import router as admin_feedback_router
from app.api.routes.ai_menu import router as ai_menu_router
from app.api.routes.public_staff_requests import router as public_staff_requests_router
from app.api.routes.admin_staff_requests import router as admin_staff_requests_router
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Smart Menu Ordering API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(public_tables_router)
app.include_router(orders_router)
app.include_router(admin_tables_router)
app.include_router(admin_orders_router)
app.include_router(admin_dashboard_router)
app.include_router(admin_menu_router)
app.include_router(admin_analytics_router)
app.include_router(public_feedback_router)
app.include_router(admin_feedback_router)
app.include_router(ai_menu_router)
app.include_router(public_staff_requests_router)
app.include_router(admin_staff_requests_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/db-health")
async def database_health_check():
    try:
        async with engine.connect() as connection:
            await connection.execute(text("SELECT 1"))

        return {
            "status": "ok",
            "database": "connected",
        }

    except Exception as error:
        logger.exception("Database connection failed")

        raise HTTPException(
            status_code=503,
            detail="Database connection failed",
        ) from error