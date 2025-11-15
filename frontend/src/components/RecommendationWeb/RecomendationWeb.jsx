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
    width: window.innerWidth * 0.9,
    height: window.innerHeight * 0.85,
  });

  useEffect(() => {
    loadRecommendationWeb();
    
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth * 0.9,
        height: window.innerHeight * 0.85,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [userId]);

  const loadRecommendationWeb = async () => {
    setLoading(true);
    try {
      // Get user's installed apps
      const installedApps = JSON.parse(localStorage.getItem('installedApps') || '[]');
      
      // Fetch recommendation graph
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
      setGraphData(data);
    } catch (error) {
      console.error('Error loading recommendation web:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    
    // Center on node
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 1000);
      graphRef.current.zoom(3, 1000);
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
      graphRef.current.zoomToFit(500, 50);
    }
  };

  // Category color mapping
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
        {/* Header */}
        <div className="web-header">
          <div className="web-title">
            <h2>🕸️ Паутина рекомендаций</h2>
            <p>Откройте для себя похожие приложения</p>
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

        {/* Legend */}
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

        {/* Graph */}
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
            nodeLabel={(node) => `
              <div class="graph-tooltip">
                <img src="${node.icon_url}" alt="${node.name}" />
                <div>
                  <strong>${node.name}</strong><br/>
                  ${node.category}<br/>
                  ⭐ ${node.rating.toFixed(1)} • ${node.downloads.toLocaleString()} загрузок
                </div>
              </div>
            `}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const size = node.is_installed ? 12 : 8;
              const color = node.is_installed
                ? '#0066FF'
                : getCategoryColor(node.category);
              
              // Draw node circle
              ctx.beginPath();
              ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
              ctx.fillStyle = color;
              ctx.fill();
              
              // Draw border for installed apps
              if (node.is_installed) {
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 2;
                ctx.stroke();
              }
              
              // Draw label
              if (globalScale > 1.5) {
                ctx.font = `${10 / globalScale}px Sans-Serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#1F2937';
                ctx.fillText(node.name, node.x, node.y + size + 8);
              }
            }}
            linkColor={(link) => {
              const opacity = link.similarity / 100;
              return `rgba(107, 114, 128, ${opacity})`;
            }}
            linkWidth={(link) => link.similarity / 25}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleSpeed={0.005}
            onNodeClick={handleNodeClick}
            cooldownTicks={100}
            onEngineStop={() => graphRef.current && graphRef.current.zoomToFit(400, 50)}
          />
        )}

        {/* Selected Node Info */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              className="node-info-panel"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
            >
              <button
                className="close-panel-btn"
                onClick={() => setSelectedNode(null)}
              >
                <FiX />
              </button>
              
              <img
                src={selectedNode.icon_url}
                alt={selectedNode.name}
                className="node-icon"
              />
              
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

        {/* Stats */}
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
