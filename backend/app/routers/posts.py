from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.cloudinary_utils import upload_image
from app.database import get_db
from app.models import Comment, Like, Post, User
from app.schemas import (
    AuthorBrief,
    CommentCreate,
    CommentResponse,
    LikeResponse,
    PostCreate,
    PostResponse,
)

router = APIRouter(prefix="/api/posts", tags=["posts"])


def _build_post_response(post: Post, current_user: User) -> PostResponse:
    liked = any(like.user_id == current_user.id for like in post.likes)
    return PostResponse(
        id=post.id,
        content=post.content,
        image_url=post.image_url,
        created_at=post.created_at,
        author=AuthorBrief.model_validate(post.author),
        likes_count=len(post.likes),
        comments_count=len(post.comments),
        liked_by_me=liked,
    )


@router.get("", response_model=list[PostResponse])
def list_posts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    posts = db.query(Post).order_by(Post.created_at.desc()).all()
    return [_build_post_response(p, current_user) for p in posts]


@router.post("", response_model=PostResponse, status_code=201)
async def create_post(
    content: str = Form(...),
    image: UploadFile | None = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    image_url = ""
    if image and image.filename:
        if not image.content_type or not image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        file_bytes = await image.read()
        try:
            image_url = upload_image(file_bytes, folder="erasmus-connect/posts")
        except Exception:
            raise HTTPException(status_code=503, detail="Image upload failed")

    post = Post(user_id=current_user.id, content=content, image_url=image_url)
    db.add(post)
    db.commit()
    db.refresh(post)
    return _build_post_response(post, current_user)


@router.post("/{post_id}/like", response_model=LikeResponse)
def toggle_like(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing = (
        db.query(Like)
        .filter(Like.post_id == post_id, Like.user_id == current_user.id)
        .first()
    )

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


@router.get("/{post_id}/comments", response_model=list[CommentResponse])
def list_comments(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comments = (
        db.query(Comment)
        .filter(Comment.post_id == post_id)
        .order_by(Comment.created_at.asc())
        .all()
    )
    return [
        CommentResponse(
            id=c.id,
            content=c.content,
            created_at=c.created_at,
            author=AuthorBrief.model_validate(c.author),
        )
        for c in comments
    ]


@router.post("/{post_id}/comments", response_model=CommentResponse, status_code=201)
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
