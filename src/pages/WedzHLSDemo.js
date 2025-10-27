import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import './WedzHLSDemo.css';

const WedzHLSDemo = () => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [playlists, setPlaylists] = useState([]);
  const [selectedStream, setSelectedStream] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qualityLevels, setQualityLevels] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  // Fetch HLS playlists from API
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        console.log('Fetching playlists...');
        const response = await fetch('https://dev-api.wedzat.com/hub/master-playlists');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched playlists:', data);
        
        setPlaylists(data);
        
        // Set the first stream as default
        if (data && data.length > 0) {
          setSelectedStream(data[0]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching playlists:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  // Initialize HLS.js player when stream is selected
  useEffect(() => {
    if (!selectedStream || !videoRef.current) return;

    const video = videoRef.current;

    // Dispose existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Check if HLS is supported
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      
      hlsRef.current = hls;

      hls.loadSource(selectedStream);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
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
      video.src = selectedStream;
    } else {
      setError('HLS is not supported in this browser');
    }

    console.log('HLS.js player initialized with stream:', selectedStream);

    // Cleanup function
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [selectedStream]);

  const handleStreamChange = (event) => {
    setSelectedStream(event.target.value);
  };

  const getStreamName = (streamUrl) => {
    const parts = streamUrl.split('/');
    const folder = parts[parts.length - 2];
    return `Stream - ${folder}`;
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

  if (loading) {
    return (
      <div className="video-player-container">
        <h2>HLS Video Player</h2>
        <div className="loading-message">
          <p>Loading playlists from API...</p>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-player-container">
        <h2>HLS Video Player</h2>
        <div className="error-message">
          <p>Error loading playlists: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-player-container">
      <h2>HLS Video Player - Wedzat Streams</h2>
      
      {playlists.length > 0 && (
        <div className="stream-selector">
          <label htmlFor="stream-select">Select Stream ({playlists.length} available): </label>
          <select 
            id="stream-select" 
            value={selectedStream} 
            onChange={handleStreamChange}
            className="stream-dropdown"
          >
            {playlists.map((stream, index) => (
              <option key={index} value={stream}>
                {getStreamName(stream)}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {selectedStream && (
        <div className="video-wrapper">
          <div className="video-container">
            <video
              ref={videoRef}
              controls
              autoPlay={false}
              muted={false}
              playsInline
              className="hls-video"
              width="100%"
              height="400"
            />
            
            {/* Quality selector overlay */}
            {qualityLevels.length > 0 && (
              <div className="quality-selector-overlay">
                <button 
                  className="quality-btn"
                  onClick={toggleQualityMenu}
                  title="Video Quality Settings"
                >
                  <span className="quality-icon">HD</span>
                  <span className="quality-text">{getCurrentQualityName()}</span>
                </button>
                
                {showQualityMenu && (
                  <div className="quality-menu">
                    <div className="quality-header">Select Quality</div>
                    <div 
                      className={`quality-option ${currentQuality === -1 ? 'active' : ''}`}
                      onClick={() => changeQuality(-1)}
                    >
                      <span>🔄 Auto</span>
                      <small>Adaptive</small>
                    </div>
                    {qualityLevels.map((level) => (
                      <div 
                        key={level.index}
                        className={`quality-option ${currentQuality === level.index ? 'active' : ''}`}
                        onClick={() => changeQuality(level.index)}
                      >
                        <span>{level.name}</span>
                        <small>{Math.round(level.bitrate / 1000)}k</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="stream-info">
        <h3>Current Stream Info:</h3>
        <p><strong>URL:</strong> <code>{selectedStream}</code></p>
        <p><strong>Total Streams:</strong> {playlists.length}</p>
        {qualityLevels.length > 0 && (
          <p><strong>Quality Levels:</strong> {qualityLevels.length} available</p>
        )}
      </div>
    </div>
  );
};

export default WedzHLSDemo;