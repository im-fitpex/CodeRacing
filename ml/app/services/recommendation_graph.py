import networkx as nx
import numpy as np
from typing import List, Dict, Tuple
import logging
from sklearn.metrics.pairwise import cosine_similarity

from app.services.embedding_service import embedding_service
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class RecommendationGraphService:
    """Service for building recommendation graph/network"""
    
    def __init__(self):
        self.graph = None
        self.documents = []
        self.embeddings = None
        self.app_id_to_idx = {}
        self.idx_to_app_id = {}
    
    def initialize(self, documents: List[Dict], embeddings: np.ndarray):
        """
        Initialize recommendation graph
        
        Args:
            documents: List of app documents
            embeddings: Document embeddings matrix
        """
        logger.info("Building recommendation graph")
        
        self.documents = documents
        self.embeddings = embeddings
        
        # Create ID mappings
        for idx, doc in enumerate(documents):
            app_id = doc['id']
            self.app_id_to_idx[app_id] = idx
            self.idx_to_app_id[idx] = app_id
        
        # Build graph
        self._build_graph()
        
        logger.info(f"Graph built: {self.graph.number_of_nodes()} nodes, {self.graph.number_of_edges()} edges")
    
    def _build_graph(self):
        """Build NetworkX graph with similarity edges"""
        self.graph = nx.Graph()
        
        # Add nodes
        for doc in self.documents:
            self.graph.add_node(
                doc['id'],
                name=doc['name'],
                category=doc['category'],
                rating=doc['rating'],
                downloads=doc['downloads'],
                icon_url=doc['icon_url'],
                is_free=doc['is_free']
            )
        
        # Compute pairwise similarities
        similarity_matrix = cosine_similarity(self.embeddings)
        
        # Add edges for similar apps
        n_apps = len(self.documents)
        for i in range(n_apps):
            # Get top K similar apps (excluding self)
            similarities = similarity_matrix[i]
            similar_indices = np.argsort(similarities)[::-1][1:6]  # Top 5 similar (excluding self)
            
            for j in similar_indices:
                similarity_score = float(similarities[j])
                
                # Only add edge if similarity is above threshold
                if similarity_score > 0.5:
                    app_id_i = self.idx_to_app_id[i]
                    app_id_j = self.idx_to_app_id[j]
                    
                    # Add edge with weight
                    self.graph.add_edge(
                        app_id_i,
                        app_id_j,
                        weight=similarity_score,
                        similarity=round(similarity_score * 100, 1)
                    )
    
    def get_user_recommendation_web(
        self,
        installed_app_ids: List[int],
        max_depth: int = 2,
        max_recommendations: int = 20
    ) -> Dict:
        """
        Generate recommendation web for user's installed apps
        
        Args:
            installed_app_ids: List of app IDs user has installed
            max_depth: Maximum depth to traverse from installed apps
            max_recommendations: Maximum number of apps to recommend
            
        Returns:
            Graph data in format for visualization
        """
        if not self.graph:
            raise ValueError("Graph not initialized")
        
        # Filter valid app IDs
        valid_installed = [aid for aid in installed_app_ids if aid in self.graph.nodes]
        
        if not valid_installed:
            return self._get_popular_apps_web(max_recommendations)
        
        # Get subgraph around installed apps
        nodes_to_include = set(valid_installed)
        
        # BFS traversal from installed apps
        for app_id in valid_installed:
            # Get neighbors at each depth level
            for depth in range(1, max_depth + 1):
                if depth == 1:
                    neighbors = list(self.graph.neighbors(app_id))
                else:
                    neighbors = []
                    for node in list(nodes_to_include):
                        neighbors.extend(self.graph.neighbors(node))
                
                # Sort by similarity and take top ones
                neighbor_scores = []
                for neighbor in neighbors:
                    if neighbor not in valid_installed and neighbor not in nodes_to_include:
                        # Get edge weight (similarity)
                        try:
                            weight = self.graph[app_id][neighbor]['weight']
                            neighbor_scores.append((neighbor, weight))
                        except KeyError:
                            pass
                
                # Add top neighbors
                neighbor_scores.sort(key=lambda x: x[1], reverse=True)
                for neighbor, _ in neighbor_scores[:5]:  # Top 5 per level
                    nodes_to_include.add(neighbor)
        
        # Limit total nodes
        if len(nodes_to_include) > max_recommendations + len(valid_installed):
            # Keep installed + top recommendations by PageRank
            pagerank = nx.pagerank(self.graph.subgraph(nodes_to_include))
            sorted_nodes = sorted(pagerank.items(), key=lambda x: x[1], reverse=True)
            
            nodes_to_include = set(valid_installed)
            for node, _ in sorted_nodes:
                if node not in valid_installed:
                    nodes_to_include.add(node)
                    if len(nodes_to_include) >= max_recommendations + len(valid_installed):
                        break
        
        # Build subgraph
        subgraph = self.graph.subgraph(nodes_to_include)
        
        # Convert to visualization format
        return self._graph_to_viz_format(subgraph, valid_installed)
    
    def _graph_to_viz_format(self, graph: nx.Graph, installed_apps: List[int]) -> Dict:
        """Convert NetworkX graph to React Force Graph format"""
        nodes = []
        links = []
        
        # Compute centrality for node sizing
        try:
            degree_centrality = nx.degree_centrality(graph)
        except:
            degree_centrality = {node: 1.0 for node in graph.nodes}
        
        # Create nodes
        for node_id in graph.nodes:
            node_data = graph.nodes[node_id]
            
            is_installed = node_id in installed_apps
            
            nodes.append({
                'id': node_id,
                'name': node_data['name'],
                'category': node_data['category'],
                'rating': node_data['rating'],
                'downloads': node_data['downloads'],
                'icon_url': node_data['icon_url'],
                'is_free': node_data['is_free'],
                'is_installed': is_installed,
                'centrality': round(degree_centrality.get(node_id, 0), 3),
                'group': node_data['category']  # For coloring
            })
        
        # Create links
        for source, target, data in graph.edges(data=True):
            links.append({
                'source': source,
                'target': target,
                'weight': data.get('weight', 0.5),
                'similarity': data.get('similarity', 50)
            })
        
        return {
            'nodes': nodes,
            'links': links,
            'stats': {
                'total_nodes': len(nodes),
                'total_edges': len(links),
                'installed_apps': len(installed_apps),
                'recommended_apps': len(nodes) - len(installed_apps)
            }
        }
    
    def _get_popular_apps_web(self, max_apps: int = 20) -> Dict:
        """Fallback: return popular apps as disconnected graph"""
        # Sort by downloads
        sorted_docs = sorted(
            self.documents,
            key=lambda x: x['downloads'],
            reverse=True
        )[:max_apps]
        
        nodes = []
        for doc in sorted_docs:
            nodes.append({
                'id': doc['id'],
                'name': doc['name'],
                'category': doc['category'],
                'rating': doc['rating'],
                'downloads': doc['downloads'],
                'icon_url': doc['icon_url'],
                'is_free': doc['is_free'],
                'is_installed': False,
                'centrality': 0.5,
                'group': doc['category']
            })
        
        return {
            'nodes': nodes,
            'links': [],
            'stats': {
                'total_nodes': len(nodes),
                'total_edges': 0,
                'installed_apps': 0,
                'recommended_apps': len(nodes)
            }
        }

# Singleton instance
recommendation_graph_service = RecommendationGraphService()
