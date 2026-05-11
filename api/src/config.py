from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "金融AI投资助手API"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000
    
    cors_origins: list[str] = ["*"]
    
    refresh_interval_opportunity: int = 300
    refresh_interval_anomaly: int = 30
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
