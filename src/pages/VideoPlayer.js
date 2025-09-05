import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const { source, id } = useParams();
  const navigate = useNavigate();
  const [streams, setStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchInfo, setMatchInfo] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fullscreen functionality
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const handleUserInteraction = () => {
    setUserInteracted(true);
  };

  const toggleFullscreen = async () => {
    const videoPlayer = document.querySelector('.video-player');
    
    if (!videoPlayer) return;

    try {
      if (!isFullscreen) {
        // Enter fullscreen
        if (videoPlayer.requestFullscreen) {
          await videoPlayer.requestFullscreen();
        } else if (videoPlayer.webkitRequestFullscreen) {
          await videoPlayer.webkitRequestFullscreen();
        } else if (videoPlayer.mozRequestFullScreen) {
          await videoPlayer.mozRequestFullScreen();
        } else if (videoPlayer.msRequestFullscreen) {
          await videoPlayer.msRequestFullscreen();
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
      }
    } catch (error) {
      console.warn('Fullscreen operation failed:', error);
      // Fallback for mobile devices
      if (isMobile) {
        const iframe = document.querySelector('.video-player iframe');
        if (iframe && iframe.requestFullscreen) {
          try {
            await iframe.requestFullscreen();
          } catch (fallbackError) {
            console.warn('Iframe fullscreen fallback failed:', fallbackError);
          }
        }
      }
    }
  };

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const streamData = await api.getStreams(source, id);
        
        if (streamData && streamData.length > 0) {
          setStreams(streamData);
          setSelectedStream(0);
        } else {
          setError('No streams available for this match');
        }
        
        // Try to get match info by searching recent matches
        try {
          const [allMatches, liveMatches, todayMatches] = await Promise.all([
            api.getF1Matches(),
            api.getLiveF1Matches(),
            api.getTodayF1Matches()
          ]);
          
          const allMatchesData = [...liveMatches, ...todayMatches, ...allMatches];
          const match = allMatchesData.find(m => 
            m.sources && m.sources.some(s => s.source === source && s.id === id)
          );
          
          if (match) {
            setMatchInfo(match);
          }
        } catch (matchError) {
          console.warn('Could not load match info:', matchError);
        }
        
      } catch (err) {
        setError('Failed to load stream. Please try again.');
        console.error('Error loading streams:', err);
      } finally {
        setLoading(false);
      }
    };

    if (source && id) {
      fetchStreams();
    }
  }, [source, id]);

  const currentStream = streams[selectedStream];

  if (loading) {
    return (
      <div className="video-player-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading stream...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-player-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Stream Unavailable</h2>
          <p>{error}</p>
          <div className="stream-notice">
            <div className="notice-icon">🌐</div>
            
          </div>
          <div className="error-actions">
            <button 
              className="btn btn-primary"
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
            <Link to="/f1" className="btn btn-secondary">
              Browse F1 Races
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="video-player-page">
      <div className="player-header">
        <div className="container">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          
          {matchInfo && (
            <div className="match-title-header">
              <h1>{matchInfo.title}</h1>
              <div className="match-meta">
                <span>📅 {api.formatDate(matchInfo.date)}</span>
                {api.isMatchLive(matchInfo.date) && (
                  <span className="live-badge">🔴 LIVE</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="player-container">
        <div className="video-section">
          <div className={`video-player ${isMobile ? 'mobile' : ''} ${isFullscreen ? 'fullscreen' : ''}`}>
            {currentStream ? (
              <>
                {isMobile && !userInteracted ? (
                  <div className="mobile-play-overlay" onClick={handleUserInteraction}>
                    <div className="play-button">
                      <div className="play-icon">▶</div>
                      <p>Tap to start stream</p>
                      <small>Required for mobile devices</small>
                    </div>
                  </div>
                ) : (
                  <>
                    <iframe
                      src={currentStream.embedUrl}
                      title="F1 Live Stream"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allowFullScreen
                      allow="autoplay; picture-in-picture; fullscreen; encrypted-media; gyroscope; accelerometer"
                      referrerPolicy="no-referrer-when-downgrade"
                      loading="lazy"
                      style={{
                        border: 'none',
                        outline: 'none'
                      }}
                    />
                    {/* Custom fullscreen button */}
                    <button 
                      className="fullscreen-btn"
                      onClick={toggleFullscreen}
                      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    >
                      {isFullscreen ? '🗗' : '⛶'}
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="no-stream">
                <div className="no-stream-icon">📺</div>
                <h3>Stream Not Available</h3>
                <p>The selected stream is currently unavailable.</p>
                <button 
                  className="retry-stream-btn"
                  onClick={() => window.location.reload()}
                >
                  🔄 Retry
                </button>
              </div>
            )}
          </div>
          
          {isMobile && (
            <div className="mobile-stream-notice">
              <div className="notice-content">
                <span className="notice-icon">📱</span>
                <div className="notice-text">
                  <strong>Mobile Tip:</strong> Use the fullscreen button (⛶) in the top-right corner of the video for better viewing experience.
                </div>
              </div>
            </div>
          )}
          
          {streams.length > 1 && (
            <div className="stream-selector">
              <h3>Available Streams</h3>
              <div className="stream-options">
                {streams.map((stream, index) => (
                  <button
                    key={stream.id}
                    className={`stream-option ${selectedStream === index ? 'active' : ''}`}
                    onClick={() => setSelectedStream(index)}
                  >
                    <div className="stream-info">
                      <span className="stream-number">Stream {stream.streamNo}</span>
                      <span className="stream-language">{stream.language}</span>
                      {stream.hd && <span className="hd-badge">HD</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="info-sidebar">
          <div className="stream-details">
            <h3>📺 Stream Information</h3>
            
            {currentStream && (
              <div className="current-stream-info">
                <div className="info-row">
                  <span className="label">Stream Quality:</span>
                  <span className="value quality-badge">
                    {currentStream.quality || 'HD 1080p'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Language:</span>
                  <span className="value">{currentStream.language || 'English'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Commentators:</span>
                  <span className="value">{currentStream.commentators || 'Professional Commentary'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Broadcast Delay:</span>
                  <span className="value delay-badge">
                    {currentStream.delay || 'Live'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Region:</span>
                  <span className="value">{currentStream.region || 'International'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Source:</span>
                  <span className="value source-badge">
                    {currentStream.source?.toUpperCase() || 'PREMIUM'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {matchInfo && (
            <div className="match-details">
              <h3>🏁 Race Details</h3>
              
              {matchInfo.circuit && (
                <div className="circuit-info">
                  <h4>Circuit Information</h4>
                  <div className="info-row">
                    <span className="label">Circuit:</span>
                    <span className="value">{matchInfo.circuit.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Location:</span>
                    <span className="value">{matchInfo.circuit.location}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Track Length:</span>
                    <span className="value">{matchInfo.circuit.length}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Race Laps:</span>
                    <span className="value">{matchInfo.circuit.laps}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Lap Record:</span>
                    <span className="value record-badge">{matchInfo.circuit.lapRecord}</span>
                  </div>
                </div>
              )}
              
              {matchInfo.weather && (
                <div className="weather-info">
                  <h4>🌤️ Weather Conditions</h4>
                  <div className="info-row">
                    <span className="label">Conditions:</span>
                    <span className="value">{matchInfo.weather.condition}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Temperature:</span>
                    <span className="value temp-badge">{matchInfo.weather.temperature}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Humidity:</span>
                    <span className="value">{matchInfo.weather.humidity}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Wind Speed:</span>
                    <span className="value">{matchInfo.weather.windSpeed}</span>
                  </div>
                </div>
              )}
              
              {matchInfo.session && (
                <div className="session-info">
                  <h4>⏱️ Session Details</h4>
                  <div className="info-row">
                    <span className="label">Session Type:</span>
                    <span className="value session-badge">{matchInfo.session.type}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Duration:</span>
                    <span className="value">{matchInfo.session.duration}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Status:</span>
                    <span className="value time-badge">{matchInfo.session.timeRemaining}</span>
                  </div>
                </div>
              )}
              
              {matchInfo.teams && (
                <div className="teams-info">
                  <h4>🏎️ Featured Teams</h4>
                  <div className="teams-grid">
                    {Array.isArray(matchInfo.teams) ? (
                      matchInfo.teams.map((team, index) => (
                        <div key={index} className="team-item">
                          <span className="team-name-badge">{typeof team === 'string' ? team : team.name || 'Team'}</span>
                          {team.drivers && (
                            <div className="drivers">
                              {team.drivers.map((driver, driverIndex) => (
                                <span key={driverIndex} className="driver-badge">{driver}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <>
                        {matchInfo.teams.home && (
                          <div className="team-info">
                            {matchInfo.teams.home.badge && (
                              <img 
                                src={api.getImageUrl(matchInfo.teams.home.badge)} 
                                alt={matchInfo.teams.home.name}
                                className="team-badge"
                                onError={(e) => e.target.style.display = 'none'}
                              />
                            )}
                            <span>{matchInfo.teams.home.name}</span>
                          </div>
                        )}
                        
                        {matchInfo.teams.home && matchInfo.teams.away && (
                          <div className="vs">VS</div>
                        )}
                        
                        {matchInfo.teams.away && (
                          <div className="team-info">
                            {matchInfo.teams.away.badge && (
                              <img 
                                src={api.getImageUrl(matchInfo.teams.away.badge)} 
                                alt={matchInfo.teams.away.name}
                                className="team-badge"
                                onError={(e) => e.target.style.display = 'none'}
                              />
                            )}
                            <span>{matchInfo.teams.away.name}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {matchInfo.championship && (
                <div className="championship-info">
                  <h4>🏆 Championship Standings</h4>
                  <div className="info-row">
                    <span className="label">Points Leader:</span>
                    <span className="value championship-badge">{matchInfo.championship.leader}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Points:</span>
                    <span className="value">{matchInfo.championship.points}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Constructors Leader:</span>
                    <span className="value championship-badge">{matchInfo.championship.constructorLeader}</span>
                  </div>
                </div>
              )}
              
              <div className="race-info">
                <div className="info-row">
                  <span className="label">Event:</span>
                  <span className="value">{matchInfo.title}</span>
                </div>
                <div className="info-row">
                  <span className="label">Date & Time:</span>
                  <span className="value">{api.formatDate(matchInfo.date)}</span>
                </div>
                {matchInfo.popular && (
                  <div className="info-row">
                    <span className="label">Status:</span>
                    <span className="value">⭐ Popular Race</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="navigation-links">
            <Link to="/f1" className="btn btn-secondary">
              Browse More Races
            </Link>
            <Link to="/" className="btn btn-primary">
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
