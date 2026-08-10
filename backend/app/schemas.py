from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserUpdate(BaseModel):
    name: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    faculty: Optional[str] = None
    bio: Optional[str] = None
    interests: Optional[list[str]] = None


class UserPublic(BaseModel):
    id: int
    email: str
    name: str
    country: str
    city: str
    faculty: str
    bio: str
    profile_image_url: str
    interests: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class AuthorBrief(BaseModel):
    id: int
    name: str
    profile_image_url: str

    model_config = {"from_attributes": True}


class PostCreate(BaseModel):
    content: str = Field(min_length=1)


class PostResponse(BaseModel):
    id: int
    content: str
    image_url: str
    created_at: datetime
    author: AuthorBrief
    likes_count: int
    comments_count: int
    liked_by_me: bool

    model_config = {"from_attributes": True}


class CommentCreate(BaseModel):
    content: str = Field(min_length=1)


class CommentResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    author: AuthorBrief

    model_config = {"from_attributes": True}


class LikeResponse(BaseModel):
    liked: bool
    likes_count: int
