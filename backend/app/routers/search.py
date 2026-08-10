from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import UserPublic

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("/users", response_model=list[UserPublic])
def search_users(
    q: Optional[str] = Query(None, description="Search by name"),
    country: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(User)

    if q:
        query = query.filter(User.name.ilike(f"%{q}%"))
    if country:
        query = query.filter(User.country.ilike(f"%{country}%"))
    if city:
        query = query.filter(User.city.ilike(f"%{city}%"))

    return query.order_by(User.name.asc()).limit(50).all()
