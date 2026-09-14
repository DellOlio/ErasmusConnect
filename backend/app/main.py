import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from fastapi import Depends, FastAPI, File, Form, HTTPException, Query, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from typing import cast
from app.auth import create_access_token, get_current_user, hash_password, verify_password
from app.database import Base, engine, get_db, run_migrations
from app.models import Comment, Like, Post, User

Base.metadata.create_all(bind=engine)
run_migrations()

app = FastAPI(title="ErasMate")

uploads_dir = Path(__file__).resolve().parent.parent / "uploads"
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1, max_length=100)


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
    city_locked: bool
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


def upload_image(file_bytes: bytes, folder: str = "erasmate") -> str:
    filename = f"{folder.replace('/', '_')}_{uuid.uuid4().hex}.jpg"
    filepath = uploads_dir / filename
    filepath.write_bytes(file_bytes)
    return f"/uploads/{filename}"


def normalize_name(name: str) -> str:
    return " ".join(name.strip().split())


def name_taken(db: Session, name: str, exclude_id: int | None = None) -> bool:
    q = db.query(User).filter(func.lower(User.name) == normalize_name(name).lower())
    if exclude_id:
        q = q.filter(User.id != exclude_id)
    return q.first() is not None


def post_to_json(post: Post, current_user: User) -> PostResponse:
    liked = any(l.user_id == current_user.id for l in post.likes)
    return PostResponse(
        id=cast(int, post.id),
        content=cast(str, post.content),
        image_url=cast(str, post.image_url),
        created_at=cast(datetime,post.created_at),
        author=AuthorBrief.model_validate(post.author),
        likes_count=len(post.likes),
        comments_count=len(post.comments),
        liked_by_me=liked,
    )


@app.get("/", response_class=HTMLResponse)
def root():
    return """
    <html>
      <head><title>ErasMate</title></head>
      <body>
        <p>ErasMate backend</p>
      </body>
    </html>
    """



@app.post("/api/auth/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    name = normalize_name(data.name)
    if name_taken(db, name):
        raise HTTPException(status_code=400, detail="Ime je već zauzeto")

    user = User(email=data.email, hashed_password=hash_password(data.password), name=name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/api/auth/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, cast(str,user.hashed_password)):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return Token(access_token=create_access_token(cast(int,user.id)))


@app.get("/api/users/me", response_model=UserPublic)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.put("/api/users/me", response_model=UserPublic)
def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    updates = data.model_dump(exclude_unset=True)

    if cast(bool,current_user.city_locked) and "city" in updates and updates["city"] != current_user.city:
        raise HTTPException(status_code=400, detail="Grad je zaključan na profilu")

    if "name" in updates:
        updates["name"] = normalize_name(updates["name"])
        if name_taken(db, updates["name"], exclude_id=cast(int,current_user.id)):
            raise HTTPException(status_code=400, detail="Ime je već zauzeto")

    for field, value in updates.items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@app.post("/api/users/me/lock-city", response_model=UserPublic)
def lock_city(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.city.strip():
        raise HTTPException(status_code=400, detail="Prvo postavi grad Erasmusa na profilu")
    if cast(int,current_user.city_locked):
        raise HTTPException(status_code=400, detail="Grad je već zaključan")
    
    current_user.city_locked = True
    db.commit()
    db.refresh(current_user)
    return current_user


@app.post("/api/users/me/unlock-city", response_model=UserPublic)
def unlock_city(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.city_locked:
        raise HTTPException(status_code=400, detail="Grad nije zaključan")
    current_user.city_locked = False
    db.commit()
    db.refresh(current_user)
    return current_user


@app.post("/api/users/me/avatar", response_model=UserPublic)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    content = await file.read()
    try:
        current_user.profile_image_url = upload_image(content, folder="erasmate/avatars")
    except Exception:
        raise HTTPException(status_code=503, detail="Image upload failed")

    db.commit()
    db.refresh(current_user)
    return current_user


@app.get("/api/users/cities", response_model=list[str])
def list_cities(db: Session = Depends(get_db)):
    rows = db.query(User.city).filter(User.city != "").distinct().order_by(User.city.asc()).all()
    return [r[0] for r in rows]


@app.get("/api/users/{user_id}", response_model=UserPublic)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.get("/api/posts", response_model=list[PostResponse])
def list_posts(
    city: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    posts = (
        db.query(Post)
        .options(joinedload(Post.author), joinedload(Post.likes), joinedload(Post.comments))
        .filter(Post.city.ilike(city.strip()))
        .order_by(Post.created_at.desc())
        .all()
    )
    return [post_to_json(p, current_user) for p in posts]


@app.post("/api/posts", response_model=PostResponse, status_code=201)
async def create_post(
    content: str = Form(...),
    city: str = Form(...),
    image: UploadFile | None = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    feed_city = city.strip()
    if not feed_city:
        raise HTTPException(status_code=400, detail="Grad feeda je obavezan")

    if current_user.city_locked:
        if not current_user.city:
            raise HTTPException(status_code=400, detail="Profil nema postavljen grad")
        if current_user.city.lower() != feed_city.lower():
            raise HTTPException(
                status_code=400,
                detail=f"Objavu možeš objaviti samo u feedu svog grada ({current_user.city})",
            )
    else:
        current_user.city = feed_city

    image_url = ""
    if image and image.filename:
        if not image.content_type or not image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        file_bytes = await image.read()
        try:
            image_url = upload_image(file_bytes, folder="erasmate/posts")
        except Exception:
            raise HTTPException(status_code=503, detail="Image upload failed")

    post = Post(user_id=current_user.id, content=content, city=feed_city, image_url=image_url)
    db.add(current_user)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post_to_json(post, current_user)


@app.post("/api/posts/{post_id}/like", response_model=LikeResponse)
def toggle_like(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing = db.query(Like).filter(Like.post_id == post_id, Like.user_id == current_user.id).first()
    if existing:
        db.delete(existing)
        db.commit()
        liked = False
    else:
        db.add(Like(post_id=post_id, user_id=current_user.id))
        db.commit()
        liked = True

    likes_count = db.query(Like).filter(Like.post_id == post_id).count()
    return LikeResponse(liked=liked, likes_count=likes_count)


@app.get("/api/posts/{post_id}/comments", response_model=list[CommentResponse])
def list_comments(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comments = db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.asc()).all()
    return [
        CommentResponse(
            id=c.id,
            content=c.content,
            created_at=c.created_at,
            author=AuthorBrief.model_validate(c.author),
        )
        for c in comments
    ]


@app.post("/api/posts/{post_id}/comments", response_model=CommentResponse, status_code=201)
def add_comment(
    post_id: int,
    data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comment = Comment(post_id=post_id, user_id=current_user.id, content=data.content)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return CommentResponse(
        id=comment.id,
        content=comment.content,
        created_at=comment.created_at,
        author=AuthorBrief.model_validate(current_user),
    )


@app.get("/api/search/users", response_model=list[UserPublic])
def search_users(
    q: Optional[str] = Query(None),
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
