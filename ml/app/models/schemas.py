from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class AppDocument(BaseModel):
    id: int
    name: str
    package_name: str
    developer: str
    category: str
    description: str
    short_description: str
    rating: float
    downloads: int
    is_free: bool
    icon_url: str

class SearchQuery(BaseModel):
    query: str = Field(..., min_length=1, max_length=200)
    top_k: Optional[int] = Field(default=10, ge=1, le=50)
    semantic_weight: Optional[float] = Field(default=0.6, ge=0.0, le=1.0)
    category_filter: Optional[str] = None
    free_only: Optional[bool] = None

class SearchResult(BaseModel):
    app_id: int
    name: str
    developer: str
    category: str
    short_description: str
    rating: float
    downloads: int
    icon_url: str
    relevance_score: float
    match_type: str  # "semantic", "keyword", "hybrid"

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total_results: int
    search_time_ms: float
    metadata: Dict

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    index_size: int
    version: str
