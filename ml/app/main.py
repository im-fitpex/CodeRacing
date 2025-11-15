from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import httpx
import time
import logging
from contextlib import asynccontextmanager

from app.config import get_settings
from app.models.schemas import (
    SearchQuery, 
    SearchResponse, 
    HealthResponse,
    SearchResult
)
from app.services.hybrid_search import hybrid_search_service

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services on startup"""
    logger.info("Starting RuStore ML Search API")
    
    try:
        # Fetch apps from backend
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{settings.BACKEND_API_URL}/apps")
            apps = response.json()
        
        # Initialize hybrid search
        hybrid_search_service.initialize(apps)
        
        logger.info(f"Initialized with {len(apps)} apps")
        
    except Exception as e:
        logger.error(f"Startup error: {str(e)}")
        raise
    
    yield
    
    logger.info("Shutting down")

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "running"
    }

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        model_loaded=True,
        index_size=len(hybrid_search_service.documents),
        version=settings.VERSION
    )

@app.post("/search", response_model=SearchResponse, tags=["Search"])
async def search_apps(search_query: SearchQuery):
    """
    Hybrid search endpoint
    
    Combines semantic (vector) and keyword (BM25) search
    """
    start_time = time.time()
    
    try:
        logger.info(f"Search query: {search_query.query}")
        
        # Perform hybrid search
        results = hybrid_search_service.search(search_query)
        
        search_time = (time.time() - start_time) * 1000
        
        return SearchResponse(
            query=search_query.query,
            results=results,
            total_results=len(results),
            search_time_ms=round(search_time, 2),
            metadata={
                "semantic_weight": search_query.semantic_weight or settings.SEMANTIC_WEIGHT,
                "keyword_weight": 1.0 - (search_query.semantic_weight or settings.SEMANTIC_WEIGHT),
                "model": settings.EMBEDDING_MODEL
            }
        )
        
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reindex", tags=["Admin"])
async def reindex(background_tasks: BackgroundTasks):
    """Reindex all apps (admin endpoint)"""
    async def do_reindex():
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{settings.BACKEND_API_URL}/apps")
                apps = response.json()
            
            hybrid_search_service.initialize(apps)
            logger.info("Reindexing completed")
        except Exception as e:
            logger.error(f"Reindexing error: {str(e)}")
    
    background_tasks.add_task(do_reindex)
    return {"message": "Reindexing started in background"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
