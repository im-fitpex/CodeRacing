import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiHeart,
    FiShare2,
    FiX,
    FiDownload,
    FiStar,
    FiXCircle,
    FiPlay,
    FiPause,
} from 'react-icons/fi';
import './VideoFeed.css';

const VideoFeed = () => {
    const [videos, setVideos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showDemo, setShowDemo] = useState(false);
    const [demoTimeLeft, setDemoTimeLeft] = useState(90);
    const [demoSessionId, setDemoSessionId] = useState(null);

    const videoRefs = useRef([]);
    const demoTimerRef = useRef(null);
    const touchStartRef = useRef(null);
    const touchStartTimeRef = useRef(null);
    const navigate = useNavigate();
    const userId = 1; // TODO: Get from auth

    useEffect(() => {
        loadVideos();
    }, []);

    useEffect(() => {
        playCurrentVideo();
        recordView();
    }, [currentIndex]);

    useEffect(() => {
        const handleWheel = (e) => {
            if (showDemo) return; // Disable scroll in demo

            if (e.deltaY > 50) {
                scrollToNext();
            } else if (e.deltaY < -50) {
                scrollToPrev();
            }
        };

        const handleKeyDown = (e) => {
            if (showDemo) return;

            if (e.key === 'ArrowDown') scrollToNext();
            if (e.key === 'ArrowUp') scrollToPrev();
            if (e.key === ' ') togglePlayPause();
        };

        const handleTouchStart = (e) => {
            touchStartRef.current = e.touches[0].clientY;
            touchStartTimeRef.current = Date.now();
        };

        const handleTouchEnd = (e) => {
            if (!touchStartRef.current || !touchStartTimeRef.current) return;

            const touchEndY = e.changedTouches[0].clientY;
            const touchDuration = Date.now() - touchStartTimeRef.current;
            const swipeDistance = touchStartRef.current - touchEndY;

            // Only register swipes longer than 30px and faster than 300ms
            if (Math.abs(swipeDistance) > 30 && touchDuration < 500) {
                if (swipeDistance > 0) {
                    scrollToNext(); // Swipe up
                } else {
                    scrollToPrev(); // Swipe down
                }
            }

            touchStartRef.current = null;
            touchStartTimeRef.current = null;
        };

        window.addEventListener('wheel', handleWheel);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('touchstart', handleTouchStart, false);
        window.addEventListener('touchend', handleTouchEnd, false);

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [currentIndex, showDemo]);

    const loadVideos = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/video-feed?userId=${userId}&limit=20`
            );
            const data = await response.json();
            // Handle both array and object responses
            const videoArray = Array.isArray(data) ? data : (data.data || data.videos || []);
            console.log('Videos loaded:', videoArray.length);
            console.log('Video data:', videoArray);
            setVideos(videoArray);
        } catch (error) {
            console.error('Error loading videos:', error);
            setVideos([]);
        } finally {
            setLoading(false);
        }
    };

    const playCurrentVideo = () => {
        videoRefs.current.forEach((video, index) => {
            if (video) {
                if (index === currentIndex) {
                    video.play().catch(console.error);
                    setIsPlaying(true);
                } else {
                    video.pause();
                }
            }
        });
    };

    const togglePlayPause = () => {
        const video = videoRefs.current[currentIndex];
        if (video) {
            if (video.paused) {
                video.play();
                setIsPlaying(true);
            } else {
                video.pause();
                setIsPlaying(false);
            }
        }
    };

    const scrollToNext = () => {
        if (currentIndex < videos.length - 1) {
            const nextIndex = currentIndex + 1;
            console.log(`Moving to next video: ${nextIndex} / ${videos.length}`);
            setCurrentIndex(nextIndex);
        } else {
            console.log('Already at last video');
        }
    };

    const scrollToPrev = () => {
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            console.log(`Moving to previous video: ${prevIndex} / ${videos.length}`);
            setCurrentIndex(prevIndex);
        } else {
            console.log('Already at first video');
        }
    };

    const recordView = async () => {
        if (videos[currentIndex]) {
            const video = videos[currentIndex];
            try {
                await fetch(
                    `http://localhost:8080/api/video-feed/${video.id}/view?userId=${userId}`,
                    { method: 'POST' }
                );
            } catch (error) {
                console.error('Error recording view:', error);
            }
        }
    };

    const handleLike = async () => {
        const video = videos[currentIndex];
        try {
            const response = await fetch(
                `http://localhost:8080/api/video-feed/${video.id}/like?userId=${userId}`,
                { method: 'POST' }
            );
            const data = await response.json();

            // Update local state
            setVideos(prev => prev.map((v, i) =>
                i === currentIndex
                    ? { ...v, isLiked: data.liked, likes: data.likeCount }
                    : v
            ));
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleWishlist = async () => {
        const video = videos[currentIndex];
        try {
            const response = await fetch(
                `http://localhost:8080/api/video-feed/${video.id}/wishlist?userId=${userId}`,
                { method: 'POST' }
            );
            const data = await response.json();

            setVideos(prev => prev.map((v, i) =>
                i === currentIndex
                    ? { ...v, isInWishlist: data.inWishlist }
                    : v
            ));
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        }
    };

    const handleNotInterested = async () => {
        const video = videos[currentIndex];
        try {
            await fetch(
                `http://localhost:8080/api/video-feed/${video.id}/not-interested?userId=${userId}`,
                { method: 'POST' }
            );

            // Remove from feed
            setVideos(prev => prev.filter((_, i) => i !== currentIndex));
            if (currentIndex >= videos.length - 1) {
                setCurrentIndex(Math.max(0, currentIndex - 1));
            }
        } catch (error) {
            console.error('Error marking not interested:', error);
        }
    };

    const startDemo = async () => {
        const video = videos[currentIndex];
        try {
            const response = await fetch(
                `http://localhost:8080/api/video-feed/${video.id}/demo/start?userId=${userId}`,
                { method: 'POST' }
            );
            const data = await response.json();

            setDemoSessionId(data.sessionId);
            setDemoTimeLeft(data.timeLimitSec);
            setShowDemo(true);

            // Start timer
            demoTimerRef.current = setInterval(() => {
                setDemoTimeLeft(prev => {
                    if (prev <= 1) {
                        endDemo(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error) {
            console.error('Error starting demo:', error);
        }
    };

    const endDemo = async (completed = false) => {
        const video = videos[currentIndex];
        const playedSec = 90 - demoTimeLeft;

        try {
            await fetch(
                `http://localhost:8080/api/video-feed/${video.id}/demo/end?userId=${userId}&sessionId=${demoSessionId}&playedSec=${playedSec}&completed=${completed}`,
                { method: 'POST' }
            );
        } catch (error) {
            console.error('Error ending demo:', error);
        }

        if (demoTimerRef.current) {
            clearInterval(demoTimerRef.current);
        }

        setShowDemo(false);
        setDemoTimeLeft(90);
        setDemoSessionId(null);
    };

    const handleShare = async () => {
        const video = videos[currentIndex];
        if (navigator.share) {
            try {
                await navigator.share({
                    title: video.title,
                    text: `Смотри ${video.title} в RuStore!`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Ссылка скопирована!');
        }
    };

    const goToApp = () => {
        const video = videos[currentIndex];
        navigate(`/app/${video.appId}`);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="video-feed-loading">
                <div className="spinner-large"></div>
                <p>Загружаем видео...</p>
            </div>
        );
    }

    const currentVideo = videos[currentIndex];

    if (loading) {
        return (
            <div className="video-feed-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner-large"></div>
            </div>
        );
    }

    if (!videos || videos.length === 0) {
        return (
            <div className="video-feed-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#6B7280' }}>
                    <h2>Видео не найдены</h2>
                    <p>Попробуйте позже или посетите другие разделы</p>
                </div>
            </div>
        );
    }

    return (
        <div className="video-feed-container">
            {/* Video Player */}
            <div className="video-wrapper">
                {videos.map((video, index) => (
                    <div
                        key={video.id}
                        className={`video-item ${index === currentIndex ? 'active' : ''}`}
                        style={{ display: index === currentIndex ? 'block' : 'none' }}
                    >
                        <video
                            ref={(el) => (videoRefs.current[index] = el)}
                            className="video-player"
                            src={`http://localhost:8080${video.videoUrl}`}
                            poster={video.thumbnailUrl ? `http://localhost:8080${video.thumbnailUrl}` : undefined}
                            loop
                            playsInline
                            onClick={togglePlayPause}
                        />

                        {/* Gradient Overlays */}
                        <div className="video-gradient-top"></div>
                        <div className="video-gradient-bottom"></div>

                        {/* Top Info */}
                        <div className="video-top-info">
                            <div className="app-info" onClick={goToApp}>
                                <img src={video.appIconUrl} alt={video.appName} className="app-avatar" />
                                <div className="app-details">
                                    <span className="app-name">{video.appName}</span>
                                    <div className="app-meta">
                                        <FiStar className="star" />
                                        <span>{video.appRating?.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Video Title & Description */}
                        <div className="video-info">
                            <h3 className="video-title">{video.title}</h3>
                            <p className="video-description">{video.description}</p>
                        </div>

                        {/* Right Actions */}
                        <div className="video-actions">
                            <button
                                className={`action-btn ${video.isLiked ? 'active' : ''}`}
                                onClick={handleLike}
                            >
                                <FiHeart className={video.isLiked ? 'filled' : ''} />
                                <span>{video.likes}</span>
                            </button>

                            <button
                                className={`action-btn ${video.isInWishlist ? 'active' : ''}`}
                                onClick={handleWishlist}
                            >
                                <FiStar className={video.isInWishlist ? 'filled' : ''} />
                                <span>{video.isInWishlist ? 'В списке' : 'Желаемое'}</span>
                            </button>

                            <button className="action-btn" onClick={handleShare}>
                                <FiShare2 />
                                <span>Поделиться</span>
                            </button>

                            <button className="action-btn danger" onClick={handleNotInterested}>
                                <FiXCircle />
                                <span>Не интересно</span>
                            </button>
                        </div>

                        {/* Bottom Actions */}
                        <div className="video-bottom-actions">
                            {video.isPlayable && (
                                <motion.button
                                    className="btn-demo"
                                    onClick={startDemo}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FiPlay />
                                    Опробовать демо
                                </motion.button>
                            )}

                            <button className="btn-download" onClick={goToApp}>
                                <FiDownload />
                                {video.appIsFree ? 'Установить' : `${video.appPrice} ₽`}
                            </button>
                        </div>

                        {/* Play/Pause Indicator */}
                        {!isPlaying && (
                            <motion.div
                                className="play-indicator"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                            >
                                <FiPlay />
                            </motion.div>
                        )}
                    </div>
                ))}
            </div>

            {/* Demo Iframe */}
            <AnimatePresence>
                {showDemo && currentVideo?.isPlayable && (
                    <motion.div
                        className="demo-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="demo-container">
                            <div className="demo-header">
                                <div className="demo-timer">
                                    <span className="timer-label">Осталось времени:</span>
                                    <span className="timer-value">{formatTime(demoTimeLeft)}</span>
                                </div>
                                <button className="demo-close" onClick={() => endDemo(false)}>
                                    <FiX />
                                    Выход
                                </button>
                            </div>

                            <iframe
                                src={currentVideo.demoUrl}
                                className="demo-iframe"
                                title="Game Demo"
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />

                            <div className="demo-footer">
                                <button className="btn btn-primary" onClick={goToApp}>
                                    <FiDownload />
                                    Скачать полную версию
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Progress Indicator */}
            <div className="video-progress">
                <span>{currentIndex + 1} / {videos.length}</span>
            </div>
        </div>
    );
};

export default VideoFeed;
