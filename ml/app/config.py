from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    APP_NAME: str = "RuStore ML Search API"
    VERSION: str = "1.0.0"
    
    # Model Configuration
    EMBEDDING_MODEL: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    EMBEDDING_DIM: int = 384
    MAX_SEQ_LENGTH: int = 256
    
    # Search Configuration
    SEMANTIC_WEIGHT: float = 0.6
    KEYWORD_WEIGHT: float = 0.4
    TOP_K_RESULTS: int = 20
    MIN_SIMILARITY_SCORE: float = 0.3
    
    # FAISS Configuration
    FAISS_NLIST: int = 100
    FAISS_NPROBE: int = 10
    
    # Redis Configuration (optional caching)
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    CACHE_TTL: int = 3600
    
    # Backend API
    BACKEND_API_URL: str = "http://localhost:8080/api"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()
