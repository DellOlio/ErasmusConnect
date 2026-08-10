import uuid
from pathlib import Path

import cloudinary
import cloudinary.uploader

from app.config import settings

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

if settings.cloudinary_cloud_name:
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
    )


def upload_image(file_bytes: bytes, folder: str = "erasmus-connect") -> str:
    if settings.cloudinary_cloud_name:
        result = cloudinary.uploader.upload(file_bytes, folder=folder)
        return result["secure_url"]

    ext = "jpg"
    filename = f"{folder.replace('/', '_')}_{uuid.uuid4().hex}.{ext}"
    filepath = UPLOAD_DIR / filename
    filepath.write_bytes(file_bytes)
    return f"/uploads/{filename}"
