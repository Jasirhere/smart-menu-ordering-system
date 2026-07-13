import logging

from fastapi import FastAPI, HTTPException
from sqlalchemy import text

from app.db.session import engine


logger = logging.getLogger(__name__)

app = FastAPI(
    title="Smart Menu Ordering API",
    version="0.1.0",
)


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