from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.config import settings

connect_args = {}
if settings.database_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def run_migrations():
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    if "users" in tables:
        columns = {col["name"] for col in inspector.get_columns("users")}
        if "city_locked" not in columns:
            with engine.begin() as conn:
                conn.execute(
                    text("ALTER TABLE users ADD COLUMN city_locked BOOLEAN NOT NULL DEFAULT 0")
                )

    if "posts" in tables:
        columns = {col["name"] for col in inspector.get_columns("posts")}
        if "city" not in columns:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE posts ADD COLUMN city VARCHAR(100) DEFAULT ''"))
                conn.execute(
                    text(
                        "UPDATE posts SET city = (SELECT city FROM users WHERE users.id = posts.user_id) "
                        "WHERE city = '' OR city IS NULL"
                    )
                )

    if "users" in tables:
        with engine.begin() as conn:
            conn.execute(
                text("CREATE UNIQUE INDEX IF NOT EXISTS uniqueUser ON users (lower(name))")
            )
