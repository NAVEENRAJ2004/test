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
            <div className="notice-content">
              <strong>Note for Indian Users:</strong> This is a demonstration app with sample F1 data. 
              Real streams are not available. Use a VPN and access legitimate F1 streaming services 
              like F1 TV Pro, Hotstar, or other official broadcasters.
            </div>
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
          <div className="video-player">
            {currentStream ? (
              <iframe
                src={currentStream.embedUrl}
                title="F1 Live Stream"
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; picture-in-picture; fullscreen"
              />
            ) : (
              <div className="no-stream">
                <div className="no-stream-icon">📺</div>
                <h3>Stream Not Available</h3>
                <p>The selected stream is currently unavailable.</p>
              </div>
            )}
          </div>
          
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
            <h3>Stream Information</h3>
            
            {currentStream && (
              <div className="current-stream-info">
                <div className="info-row">
                  <span className="label">Stream:</span>
                  <span className="value">#{currentStream.streamNo}</span>
                </div>
                <div className="info-row">
                  <span className="label">Language:</span>
                  <span className="value">{currentStream.language}</span>
                </div>
                <div className="info-row">
                  <span className="label">Quality:</span>
                  <span className="value">
                    {currentStream.hd ? (
                      <span className="hd-quality">🎬 HD Quality</span>
                    ) : (
                      <span className="sd-quality">📱 Standard</span>
                    )}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Source:</span>
                  <span className="value">{currentStream.source.toUpperCase()}</span>
                </div>
              </div>
            )}
          </div>

          {matchInfo && (
            <div className="match-details">
              <h3>Race Details</h3>
              
              {matchInfo.teams && (
                <div className="teams-info">
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
