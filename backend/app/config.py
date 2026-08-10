from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./erasmus_connect.db"
    secret_key: str = "secretKeyMarin"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60


settings = Settings()
