import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "National Labour Market Intelligence System (LMIS)"
    PROJECT_SUBTITLE: str = "AI-Enabled Skill Demand-Supply Forecasting & Planning Engine"
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    DATABASE_URL: str = "sqlite:///./lmis.db"
    DEMO_MODE: bool = True
    RANDOM_SEED: int = 42
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
