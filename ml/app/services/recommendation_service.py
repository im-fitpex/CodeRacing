import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from collections import defaultdict
import logging
from typing import List, Dict, Tuple

from app.services.embedding_service import embedding_service
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class RecommendationService:
    """Advanced recommendation system using collaborative + content-based filtering"""
    
    def __init__(self):
        self.documents = []
        self.embeddings = None
        self.user_app_matrix = None  # Collaborative filtering matrix
        self.app_similarity_matrix = None
        self.app_id_to_idx = {}
        self.idx_to_app_id = {}
        
    def initialize(self, documents: List[Dict], embeddings: np.ndarray):
        """Initialize recommendation system"""
        logger.info("Initializing recommendation service")
        
        self.documents = documents
        self.embeddings = embeddings
        
        # Create ID mappings
        for idx, doc in enumerate(documents):
            app_id = doc['id']
            self.app_id_to_idx[app_id] = idx
            self.idx_to_app_id[idx] = app_id
        
        # Compute app similarity matrix (content-based)
        self.app_similarity_matrix = cosine_similarity(embeddings)
        
        logger.info("Recommendation service initialized")
    
    def get_personalized_recommendations(
        self,
        user_id: int,
        installed_apps: List[int],
        wishlist_apps: List[int],
        user_interactions: Dict[int, float],
        top_k: int = 20,
        diversity_factor: float = 0.3
    ) -> List[Dict]:
        """
        Get personalized recommendations using hybrid approach
        
        Args:
            user_id: User ID
            installed_apps: List of installed app IDs
            wishlist_apps: List of wishlisted app IDs
            user_interactions: Dict of {app_id: interaction_score}
            top_k: Number of recommendations
            diversity_factor: Weight for diversity (0-1)
        """
        
        # 1. Content-based recommendations (from installed apps)
        content_scores = self._get_content_based_scores(installed_apps)
        
        # 2. Collaborative filtering scores (from similar users)
        collab_scores = self._get_collaborative_scores(user_id, user_interactions)
        
        # 3. Trending/Popular scores
        trending_scores = self._get_trending_scores()
        
        # 4. Combine scores with weights
        combined_scores = {}
        for app_id in range(len(self.documents)):
            if app_id in installed_apps or app_id in wishlist_apps:
                continue  # Skip already installed/wishlisted
            
            content_weight = 0.5
            collab_weight = 0.3
            trending_weight = 0.2
            
            score = (
                content_weight * content_scores.get(app_id, 0) +
                collab_weight * collab_scores.get(app_id, 0) +
                trending_weight * trending_scores.get(app_id, 0)
            )
            
            combined_scores[app_id] = score
        
        # 5. Apply diversity
        final_recommendations = self._apply_diversity(
            combined_scores, 
            top_k, 
            diversity_factor
        )
        
        # 6. Convert to response format
        results = []
        for app_idx, score in final_recommendations:
            doc = self.documents[app_idx]
            results.append({
                'app_id': doc['id'],
                'name': doc['name'],
                'category': doc['category'],
                'rating': doc['rating'],
                'downloads': doc['downloads'],
                'icon_url': doc['icon_url'],
                'is_free': doc['is_free'],
                'recommendation_score': round(score, 4),
                'recommendation_reason': self._get_recommendation_reason(
                    app_idx, installed_apps
                )
            })
        
        return results
    
    def _get_content_based_scores(self, installed_apps: List[int]) -> Dict[int, float]:
        """Get recommendations based on similar apps to installed ones"""
        scores = defaultdict(float)
        
        for app_id in installed_apps:
            if app_id not in self.app_id_to_idx:
                continue
            
            app_idx = self.app_id_to_idx[app_id]
            similarities = self.app_similarity_matrix[app_idx]
            
            for other_idx, sim in enumerate(similarities):
                if other_idx != app_idx:
                    scores[other_idx] += sim
        
        # Normalize by number of installed apps
        if installed_apps:
            for idx in scores:
                scores[idx] /= len(installed_apps)
        
        return dict(scores)
    
    def _get_collaborative_scores(
        self, 
        user_id: int, 
        user_interactions: Dict[int, float]
    ) -> Dict[int, float]:
        """Get recommendations based on similar users' behavior"""
        # TODO: Implement collaborative filtering using user-app interaction matrix
        # For now, return empty scores
        return {}
    
    def _get_trending_scores(self) -> Dict[int, float]:
        """Get popularity/trending scores"""
        scores = {}
        
        # Calculate popularity based on downloads and rating
        max_downloads = max(doc['downloads'] for doc in self.documents)
        
        for idx, doc in enumerate(self.documents):
            popularity = (
                0.7 * (doc['downloads'] / max_downloads) +
                0.3 * (doc['rating'] / 5.0)
            )
            scores[idx] = popularity
        
        return scores
    
    def _apply_diversity(
        self, 
        scores: Dict[int, float], 
        top_k: int, 
        diversity_factor: float
    ) -> List[Tuple[int, float]]:
        """Apply diversity to recommendations using MMR (Maximal Marginal Relevance)"""
        
        if not scores:
            return []
        
        # Sort by score
        sorted_apps = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        
        if diversity_factor == 0:
            return sorted_apps[:top_k]
        
        # MMR algorithm
        selected = []
        candidates = sorted_apps[:top_k * 3]  # Consider top 3*k candidates
        
        # Select first item (highest score)
        selected.append(candidates[0])
        candidates = candidates[1:]
        
        # Select remaining items balancing relevance and diversity
        while len(selected) < top_k and candidates:
            best_mmr_score = -float('inf')
            best_candidate = None
            best_idx = None
            
            for idx, (app_idx, relevance_score) in enumerate(candidates):
                # Calculate minimum similarity to already selected items
                min_similarity = min(
                    self.app_similarity_matrix[app_idx][selected_app[0]]
                    for selected_app in selected
                )
                
                # MMR score: balance relevance and diversity
                mmr_score = (
                    (1 - diversity_factor) * relevance_score -
                    diversity_factor * min_similarity
                )
                
                if mmr_score > best_mmr_score:
                    best_mmr_score = mmr_score
                    best_candidate = (app_idx, relevance_score)
                    best_idx = idx
            
            if best_candidate:
                selected.append(best_candidate)
                candidates.pop(best_idx)
        
        return selected
    
    def _get_recommendation_reason(
        self, 
        app_idx: int, 
        installed_apps: List[int]
    ) -> str:
        """Generate human-readable recommendation reason"""
        
        # Find most similar installed app
        max_similarity = 0
        most_similar_app = None
        
        for installed_id in installed_apps:
            if installed_id not in self.app_id_to_idx:
                continue
            
            installed_idx = self.app_id_to_idx[installed_id]
            similarity = self.app_similarity_matrix[app_idx][installed_idx]
            
            if similarity > max_similarity:
                max_similarity = similarity
                most_similar_app = self.documents[installed_idx]['name']
        
        if most_similar_app and max_similarity > 0.7:
            return f"Похоже на {most_similar_app}"
        
        app_category = self.documents[app_idx]['category']
        return f"Популярно в категории {app_category}"
    
    def get_similar_apps(
        self, 
        app_id: int, 
        top_k: int = 10
    ) -> List[Dict]:
        """Get similar apps to a given app"""
        
        if app_id not in self.app_id_to_idx:
            return []
        
        app_idx = self.app_id_to_idx[app_id]
        similarities = self.app_similarity_matrix[app_idx]
        
        # Get top K similar (excluding self)
        similar_indices = np.argsort(similarities)[::-1][1:top_k+1]
        
        results = []
        for idx in similar_indices:
            doc = self.documents[idx]
            results.append({
                'app_id': doc['id'],
                'name': doc['name'],
                'category': doc['category'],
                'rating': doc['rating'],
                'downloads': doc['downloads'],
                'icon_url': doc['icon_url'],
                'is_free': doc['is_free'],
                'similarity_score': round(float(similarities[idx]), 4)
            })
        
        return results

# Singleton instance
recommendation_service = RecommendationService()
