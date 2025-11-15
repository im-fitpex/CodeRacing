from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import httpx
import time
import logging
from contextlib import asynccontextmanager
from typing import List
from pydantic import BaseModel

from app.config import get_settings
from app.models.schemas import (
    SearchQuery, 
    SearchResponse, 
    HealthResponse,
    SearchResult
)
from app.services.hybrid_search import hybrid_search_service
from app.services.recommendation_graph import recommendation_graph_service

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
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{settings.BACKEND_API_URL}/apps")
            apps = response.json()
        
        logger.info(f"Fetched {len(apps)} apps from backend")
        
        # Initialize hybrid search
        hybrid_search_service.initialize(apps)
        logger.info("Hybrid search initialized")
        
        # Initialize recommendation graph
        from app.services.embedding_service import embedding_service
        embeddings = embedding_service.encode_documents(
            hybrid_search_service.documents
        )
        recommendation_graph_service.initialize(
            hybrid_search_service.documents,
            embeddings
        )
        logger.info("Recommendation graph initialized")
        
        logger.info(f"✅ All services initialized with {len(apps)} apps")
        
    except Exception as e:
        logger.error(f"❌ Startup error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise
    
    yield
    
    logger.info("Shutting down")

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    description="ML-powered search and recommendation API for RuStore"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for requests
class RecommendationWebRequest(BaseModel):
    installed_app_ids: List[int]
    max_depth: int = 2
    max_recommendations: int = 30

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "running",
        "endpoints": {
            "health": "/health",
            "search": "/search",
            "recommendation_web": "/recommendation-web",
            "reindex": "/reindex"
        }
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
    
    Combines semantic (vector) and keyword (BM25) search for relevant results
    """
    start_time = time.time()
    
    try:
        logger.info(f"Search query: '{search_query.query}'")
        
        # Perform hybrid search
        results = hybrid_search_service.search(search_query)
        
        search_time = (time.time() - start_time) * 1000
        
        logger.info(f"Found {len(results)} results in {search_time:.2f}ms")
        
        return SearchResponse(
            query=search_query.query,
            results=results,
            total_results=len(results),
            search_time_ms=round(search_time, 2),
            metadata={
                "semantic_weight": search_query.semantic_weight or settings.SEMANTIC_WEIGHT,
                "keyword_weight": 1.0 - (search_query.semantic_weight or settings.SEMANTIC_WEIGHT),
                "model": settings.EMBEDDING_MODEL,
                "category_filter": search_query.category_filter,
                "free_only": search_query.free_only
            }
        )
        
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommendation-web", tags=["Recommendations"])
async def get_recommendation_web(request: RecommendationWebRequest):
    """
    Generate recommendation web/graph for user's installed apps
    
    Returns graph data for interactive network visualization with:
    - Nodes: apps (installed + recommended)
    - Links: similarity connections
    - Stats: graph metrics
    """
    try:
        start_time = time.time()
        
        logger.info(f"Generating recommendation web for {len(request.installed_app_ids)} installed apps")
        
        graph_data = recommendation_graph_service.get_user_recommendation_web(
            installed_app_ids=request.installed_app_ids,
            max_depth=request.max_depth,
            max_recommendations=request.max_recommendations
        )
        
        processing_time = (time.time() - start_time) * 1000
        logger.info(f"Generated web with {graph_data['stats']['total_nodes']} nodes in {processing_time:.2f}ms")
        
        # Add processing time to response
        graph_data['processing_time_ms'] = round(processing_time, 2)
        
        return graph_data
        
    except Exception as e:
        logger.error(f"Recommendation web error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reindex", tags=["Admin"])
async def reindex(background_tasks: BackgroundTasks):
    """
    Reindex all apps (admin endpoint)
    
    Fetches latest data from backend and rebuilds all indices
    """
    async def do_reindex():
        try:
            logger.info("Starting reindexing...")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(f"{settings.BACKEND_API_URL}/apps")
                apps = response.json()
            
            # Reinitialize hybrid search
            hybrid_search_service.initialize(apps)
            
            # Reinitialize recommendation graph
            from app.services.embedding_service import embedding_service
            embeddings = embedding_service.encode_documents(
                hybrid_search_service.documents
            )
            recommendation_graph_service.initialize(
                hybrid_search_service.documents,
                embeddings
            )
            
            logger.info(f"✅ Reindexing completed: {len(apps)} apps")
            
        except Exception as e:
            logger.error(f"❌ Reindexing error: {str(e)}")
            import traceback
            traceback.print_exc()
    
    background_tasks.add_task(do_reindex)
    return {
        "message": "Reindexing started in background",
        "status": "processing"
    }

@app.get("/stats", tags=["Statistics"])
async def get_stats():
    """Get API statistics"""
    return {
        "total_apps": len(hybrid_search_service.documents),
        "graph_nodes": recommendation_graph_service.graph.number_of_nodes() if recommendation_graph_service.graph else 0,
        "graph_edges": recommendation_graph_service.graph.number_of_edges() if recommendation_graph_service.graph else 0,
        "model": settings.EMBEDDING_MODEL,
        "embedding_dim": settings.EMBEDDING_DIM
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
