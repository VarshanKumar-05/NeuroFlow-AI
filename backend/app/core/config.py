from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = 'sqlite+aiosqlite:///./neuroflow.db'
    REDIS_URL: str = 'redis://localhost:6379/0'
    JWT_SECRET: str = 'dev-secret-change-me'
    JWT_ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    OPENAI_API_KEY: str | None = None
    GEMINI_API_KEY: str | None = None
    MODEL_PATH: str = 'models/'
    LOG_LEVEL: str = 'INFO'
    CORS_ORIGINS: List[str] = ['http://localhost:5173']
    PROJECT_NAME: str = 'NeuroFlow AI'
    API_V1_PREFIX: str = '/api/v1'

    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

settings = Settings()
