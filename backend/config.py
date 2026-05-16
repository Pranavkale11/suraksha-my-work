import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union
import json

class Settings(BaseSettings):
    mongodb_uri: str = "mongodb://localhost:27017"
    jwt_secret: str = "your-jwt-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    backend_cors_origins: Union[str, List[str]] = ["http://localhost:5173", "https://your-frontend.vercel.app"]
    environment: str = "development"
    embedding_model: str = "all-MiniLM-L6-v2"
    demo_mode: bool = True

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")
    
    def get_cors_origins(self) -> List[str]:
        if isinstance(self.backend_cors_origins, str):
            try:
                return json.loads(self.backend_cors_origins)
            except json.JSONDecodeError:
                return [origin.strip() for origin in self.backend_cors_origins.split(",")]
        return self.backend_cors_origins

settings = Settings()
