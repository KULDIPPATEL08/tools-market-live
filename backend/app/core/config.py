import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Scoutboard"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "sqlite:///./scoutboard.db"
    
    # Security
    SECRET_KEY: str = "dev-secret-key-scoutboard-super-secure-change-in-prod-xyz-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
    
    # SSRF Protection
    ALLOW_PRIVATE_IPS: bool = False
    REQUEST_TIMEOUT_SECONDS: int = 15
    MAX_CONTENT_LENGTH_BYTES: int = 5 * 1024 * 1024  # 5MB
    
    # AI Assistant configuration
    AI_PROVIDER: str = "local"  # local, ollama, openai_compatible
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"
    OPENAI_COMPATIBLE_API_KEY: str = ""
    OPENAI_COMPATIBLE_BASE_URL: str = "https://api.openai.com/v1"
    OPENAI_COMPATIBLE_MODEL: str = "gpt-4o-mini"
    
    # Connectors
    GITHUB_API_TOKEN: str = ""
    
    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

