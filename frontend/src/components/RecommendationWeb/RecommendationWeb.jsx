import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { FiX, FiZoomIn, FiZoomOut, FiMaximize2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './RecommendationWeb.css';

const RecommendationWeb = ({ userId, onClose }) => {
  const graphRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth * 0.95,
    height: window.innerHeight * 0.9,
  });
  const [hoveredNode, setHoveredNode] = useState(null);

  // Preload images
  const imageCache = useRef({});

  useEffect(() => {
    loadRecommendationWeb();
    
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth * 0.95,
        height: window.innerHeight * 0.9,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [userId]);

  useEffect(() => {
    // Принудительно устанавливаем длину связей после инициализации
    if (graphRef.current && graphData.nodes.length > 0) {
      const fg = graphRef.current;
      
      fg.d3Force('link')
        .distance((link) => {
          const sim = link.similarity || 50;
          if (sim > 90) return 350;    // Похожие приложения - короче
          if (sim > 70) return 500;    // Менее похожие - средняя длина
          return 250;                 // РАЗНЫЕ ПАУТИНЫ - ЕЩЕ ДАЛЬШЕ!
        })
        .strength(0.5);
      
      fg.d3Force('charge')
        .strength(-400)
        .distanceMax(1000);
        
      fg.d3ReheatSimulation();
    }
  }, [graphData]);

  const loadRecommendationWeb = async () => {
    setLoading(true);
    try {
      const installedApps = JSON.parse(localStorage.getItem('installedApps') || '[]');
      
      const response = await fetch('http://localhost:8000/recommendation-web', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          installed_app_ids: installedApps.length > 0 ? installedApps : [1, 2, 4, 6, 8],
          max_depth: 2,
          max_recommendations: 30,
        }),
      });
      
      const data = await response.json();
      
      // Preload all images
      data.nodes.forEach(node => {
        const img = new Image();
        img.src = node.icon_url;
        img.onload = () => {
          imageCache.current[node.id] = img;
        };
      });
      
      setGraphData(data);
    } catch (error) {
      console.error('Error loading recommendation web:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 1000);
      graphRef.current.zoom(2.5, 1000);
    }
  };

  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() * 1.5, 500);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() / 1.5, 500);
    }
  };

  const handleFitView = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(500, 200);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Финансы': '#10B981',
      'Инструменты': '#3B82F6',
      'Игры': '#8B5CF6',
      'Государственные': '#F59E0B',
      'Транспорт': '#EF4444',
      'Образование': '#06B6D4',
      'Социальные сети': '#EC4899',
      'Музыка и аудио': '#F97316',
      'Фото и видео': '#14B8A6',
    };
    return colors[category] || '#6B7280';
  };

  return (
    <div className="recommendation-web-overlay">
      <div className="web-container">
        <div className="web-header">
          <div className="web-title">
            <h2>🕸️ Паутина рекомендаций</h2>
            <p>Наведите на приложение для просмотра информации</p>
          </div>
          
          <div className="web-controls">
            <button className="control-btn" onClick={handleZoomIn} title="Приблизить">
              <FiZoomIn />
            </button>
            <button className="control-btn" onClick={handleZoomOut} title="Отдалить">
              <FiZoomOut />
            </button>
            <button className="control-btn" onClick={handleFitView} title="По размеру">
              <FiMaximize2 />
            </button>
            <button className="close-btn" onClick={onClose}>
              <FiX />
            </button>
          </div>
        </div>

        <div className="web-legend">
          <div className="legend-item">
            <div className="legend-dot installed"></div>
            <span>Установлено</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot recommended"></div>
            <span>Рекомендовано</span>
          </div>
        </div>

        {loading ? (
          <div className="web-loading">
            <div className="spinner-large"></div>
            <p>Строим паутину рекомендаций...</p>
          </div>
        ) : (
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            width={dimensions.width}
            height={dimensions.height}
            backgroundColor="#1F2937"
            
            warmupTicks={100}
            cooldownTicks={200}
            
            d3VelocityDecay={0.3}
            d3AlphaDecay={0.01}
            nodeRelSize={10}
            
            // ДЛИНА ВЕТОК - МАКСИМАЛЬНО РАЗВЕРНУТО!
            linkDistance={(link) => {
              const sim = link.similarity || 50;
              if (sim > 90) return 500;   
              if (sim > 70) return 700;   
              return 1000;                
            }}
            
            nodeVal={(node) => node.is_installed ? 80 : 70}
            
            nodeCanvasObject={(node, ctx, globalScale) => {
              const nodeSize = node.is_installed ? 60 : 50;
              const img = imageCache.current[node.id];
              
              // Draw icon image
              if (img && img.complete) {
                ctx.save();
                
                // Clip to circle
                ctx.beginPath();
                ctx.arc(node.x, node.y, nodeSize / 2, 0, 2 * Math.PI);
                ctx.clip();
                
                // Draw image
                ctx.drawImage(
                  img,
                  node.x - nodeSize / 2,
                  node.y - nodeSize / 2,
                  nodeSize,
                  nodeSize
                );
                
                ctx.restore();
                
                // Border for installed apps
                if (node.is_installed) {
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, nodeSize / 2, 0, 2 * Math.PI);
                  ctx.strokeStyle = '#FFD700';
                  ctx.lineWidth = 4;
                  ctx.stroke();
                }
                
                // Ring around icon
                ctx.beginPath();
                ctx.arc(node.x, node.y, nodeSize / 2, 0, 2 * Math.PI);
                ctx.strokeStyle = node.is_installed 
                  ? '#0066FF' 
                  : getCategoryColor(node.category);
                ctx.lineWidth = 3;
                ctx.stroke();
              } else {
                // Fallback: colored circle
                const color = node.is_installed ? '#0066FF' : getCategoryColor(node.category);
                ctx.beginPath();
                ctx.arc(node.x, node.y, nodeSize / 2, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.fill();
                
                if (node.is_installed) {
                  ctx.strokeStyle = '#FFD700';
                  ctx.lineWidth = 3;
                  ctx.stroke();
                }
              }
              
              
              // TEXT - скрыто полностью
            }}
            
            nodePointerAreaPaint={(node, color, ctx) => {
              const nodeSize = node.is_installed ? 60 : 50;
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(node.x, node.y, nodeSize / 2 + 8, 0, 2 * Math.PI);
              ctx.fill();
            }}
            
            onNodeHover={(node) => {
              setHoveredNode(node?.id || null);
            }}
            
            linkColor={(link) => {
              const opacity = link.similarity / 150;
              return `rgba(139, 92, 246, ${opacity})`;
            }}
            linkWidth={(link) => Math.max(1, link.similarity / 35)}
            linkDirectionalParticles={3}
            linkDirectionalParticleWidth={3}
            linkDirectionalParticleSpeed={0.006}
            
            onNodeClick={handleNodeClick}
            
            onEngineStop={() => {
              // Auto-zoom disabled
            }}
          />
        )}

        <AnimatePresence>
          {selectedNode && (
            <motion.div
              className="node-info-panel"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
            >
              <button className="close-panel-btn" onClick={() => setSelectedNode(null)}>
                <FiX />
              </button>
              
              <img src={selectedNode.icon_url} alt={selectedNode.name} className="node-icon" />
              
              <h3>{selectedNode.name}</h3>
              <p className="node-category">{selectedNode.category}</p>
              
              <div className="node-stats">
                <div className="stat">
                  <span className="label">Рейтинг</span>
                  <span className="value">⭐ {selectedNode.rating.toFixed(1)}</span>
                </div>
                <div className="stat">
                  <span className="label">Загрузок</span>
                  <span className="value">{selectedNode.downloads.toLocaleString()}</span>
                </div>
              </div>
              
              {selectedNode.is_installed && (
                <div className="installed-badge">✓ Установлено</div>
              )}
              
              <button
                className="btn btn-primary"
                onClick={() => window.open(`/app/${selectedNode.id}`, '_blank')}
              >
                Подробнее
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="web-stats">
          <div className="stat-item">
            <strong>{graphData.stats?.total_nodes || 0}</strong>
            <span>Приложений</span>
          </div>
          <div className="stat-item">
            <strong>{graphData.stats?.total_edges || 0}</strong>
            <span>Связей</span>
          </div>
          <div className="stat-item">
            <strong>{graphData.stats?.recommended_apps || 0}</strong>
            <span>Рекомендаций</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationWeb;