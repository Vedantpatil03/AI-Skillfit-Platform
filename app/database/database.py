"""
Small wrapper module for database access.

This keeps imports stable (`from app.database.database import get_db`)
even if we later swap connection logic or add pooling/health checks.
"""

from app.database.mongo import get_client, get_db

__all__ = ["get_client", "get_db"]

