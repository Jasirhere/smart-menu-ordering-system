import logging
import app.models
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.api.routes.public_tables import router as public_tables_router
from app.api.routes.admin_tables import router as admin_tables_router
from app.core.config import settings
from app.db.session import engine


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

app.include_router(admin_tables_router)
app.include_router(public_tables_router)

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