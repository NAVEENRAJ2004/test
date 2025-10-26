import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import './WedzHLSDemo.css';

const WedzHLSDemo = () => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [qualityLevels, setQualityLevels] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  // HLS stream URL for internal testing
  const streamUrl = 'https://pub-10ca6c07ebc141c8ba1ea976882f26b0.r2.dev/wedzat-internal-testing/37665b5a-570c-4cb4-83b8-2be6350496de/master.m3u8';

  useEffect(() => {
    const video = videoRef.current;
    
    if (!video) return;

    // Check if HLS is supported
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        console.log('HLS manifest loaded, found ' + hls.levels.length + ' quality level(s)');
        
        // Set up quality levels
        const levels = hls.levels.map((level, index) => ({
          index,
          height: level.height,
          width: level.width,
          bitrate: level.bitrate,
          name: level.height ? `${level.height}p` : `${Math.round(level.bitrate / 1000)}k`
        }));
        setQualityLevels(levels);
        setCurrentQuality(hls.currentLevel);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentQuality(data.level);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Network error occurred');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media error occurred');
              hls.recoverMediaError();
              break;
            default:
              setError('Fatal error occurred');
              hls.destroy();
              break;
          }
        }
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari which has native HLS support
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
      });
    } else {
      setError('HLS is not supported in this browser');
      setIsLoading(false);
    }

    // Video event listeners
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => setError('Video playback error');

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (video) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        video.requestFullscreen();
      }
    }
  };

  const changeQuality = (levelIndex) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
      setShowQualityMenu(false);
    }
  };

  const toggleQualityMenu = () => {
    setShowQualityMenu(!showQualityMenu);
  };

  const getCurrentQualityName = () => {
    if (currentQuality === -1) return 'Auto';
    const level = qualityLevels.find(l => l.index === currentQuality);
    return level ? level.name : 'Auto';
  };

  return (
    <div className="wedz-hls-demo">
      <div className="demo-header">
        <h1>Wedzat HLS Video Player Demo</h1>
        <p>Internal Testing Stream</p>
      </div>

      <div className="video-container">
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Loading stream...</p>
          </div>
        )}

        {error && (
          <div className="error-overlay">
            <div className="error-message">
              <h3>Playback Error</h3>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          controls
          autoPlay={false}
          muted={false}
          playsInline
          className="hls-video"
          poster=""
        />

        {/* Overlay controls only for quality selection */}
        <div className="video-overlay-controls">
          <div className="quality-selector-overlay">
            <button 
              className="quality-btn-overlay"
              onClick={toggleQualityMenu}
              disabled={isLoading || error}
              title="Video Quality Settings"
            >
              <span className="quality-icon">HD</span>
              <span className="quality-text">{getCurrentQualityName()}</span>
            </button>
            
            {showQualityMenu && (
              <div className="quality-menu-overlay">
                <div className="quality-header">Select Quality</div>
                <div 
                  className={`quality-option ${currentQuality === -1 ? 'active' : ''}`}
                  onClick={() => changeQuality(-1)}
                >
                  <span>🔄 Auto</span>
                  <small>Adaptive</small>
                </div>
                {qualityLevels.length > 0 ? (
                  qualityLevels.map((level) => (
                    <div 
                      key={level.index}
                      className={`quality-option ${currentQuality === level.index ? 'active' : ''}`}
                      onClick={() => changeQuality(level.index)}
                    >
                      <span>{level.name}</span>
                      <small>{Math.round(level.bitrate / 1000)}k</small>
                    </div>
                  ))
                ) : (
                  <div className="quality-option disabled">
                    <span>No quality levels detected</span>
                    <small>Stream may not be loaded yet</small>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="demo-info">
        <h3>Stream Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <strong>Format:</strong> HLS (HTTP Live Streaming)
          </div>
          <div className="info-item">
            <strong>Player:</strong> HLS.js
          </div>
          <div className="info-item">
            <strong>Status:</strong> Internal Testing
          </div>
          <div className="info-item">
            <strong>URL:</strong> 
            <code>{streamUrl}</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WedzHLSDemo;