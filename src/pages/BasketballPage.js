import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './BasketballPage.css';

const BasketballPage = () => {
  const [matches, setMatches] = useState([]);
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('live'); // 'live', 'upcoming'

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let data = [];
        if (filter === 'live') {
          setValidating(true);
          console.log('Fetching and validating live Basketball matches...');
          data = await api.getLiveBasketballMatches();
          console.log(`Found ${data.length} validated live basketball games`);
          setValidating(false);
        } else if (filter === 'upcoming') {
          data = await api.getUpcomingBasketballMatches();
        }
        
        setMatches(data);
        
        // Also get live matches for the live indicator
        if (filter !== 'live') {
          const live = await api.getLiveBasketballMatches();
          setLiveMatches(live);
        } else {
          setLiveMatches(data); // Use the same data if we're already on live tab
        }
        
      } catch (err) {
        setError('Failed to load Basketball matches');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [filter]);

  const handleWatchClick = (match) => {
    if (!match.sources || match.sources.length === 0) {
      alert('No streams available for this match');
      return;
    }
    
    // Use the first working source
    const source = match.sources[0];
    console.log(`Navigating to stream: ${source.source}/${source.id}`);
  };

  if (loading) {
    return (
      <div className="basketball-page">
        <div className="loading">
          <div className="spinner"></div>
          {validating && (
            <p className="validating-text">Validating stream availability...</p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="basketball-page">
        <div className="error">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="basketball-page">
      <div className="basketball-header">
        <h1>🏀 Basketball Matches</h1>
        <p>Watch live Basketball games and upcoming matches</p>
        
        {liveMatches.length > 0 && (
          <div className="live-indicator">
            <span className="live-dot"></span>
            {liveMatches.length} Live {liveMatches.length === 1 ? 'Game' : 'Games'}
          </div>
        )}
      </div>

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'live' ? 'active' : ''}`}
          onClick={() => setFilter('live')}
        >
          🔴 Live
          {liveMatches.length > 0 && (
            <span className="filter-count">{liveMatches.length}</span>
          )}
        </button>
        <button 
          className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          📅 Upcoming
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="no-matches">
          <div className="no-matches-content">
            <h3>🏀 No {filter} Basketball matches available</h3>
            <p>
              {filter === 'live' 
                ? 'There are currently no live Basketball games with available streams.'
                : 'No upcoming Basketball matches scheduled at the moment.'
              }
            </p>
            <button onClick={() => window.location.reload()}>
              🔄 Refresh
            </button>
          </div>
        </div>
      ) : (
        <div className="matches-grid">
          {matches.map((match, index) => (
            <div key={index} className="match-card">
              <div className="match-header">
                <h3 className="match-title">{match.title}</h3>
                {filter === 'live' && (
                  <div className="live-badge">
                    <span className="live-dot"></span>
                    LIVE
                  </div>
                )}
              </div>
              
              {match.teams && (
                <div className="match-teams">
                  <div className="team">
                    <span className="team-name">
                      {typeof match.teams.home === 'string' 
                        ? match.teams.home 
                        : (match.teams.home?.name || 'Home Team')
                      }
                    </span>
                  </div>
                  <div className="vs">VS</div>
                  <div className="team">
                    <span className="team-name">
                      {typeof match.teams.away === 'string' 
                        ? match.teams.away 
                        : (match.teams.away?.name || 'Away Team')
                      }
                    </span>
                  </div>
                </div>
              )}
              
              <div className="match-details">
                {match.league && (
                  <div className="match-info">
                    <span className="info-label">League:</span>
                    <span className="info-value">{match.league}</span>
                  </div>
                )}
                
                {match.time && (
                  <div className="match-info">
                    <span className="info-label">Time:</span>
                    <span className="info-value">{match.time}</span>
                  </div>
                )}
                
                {match.sources && match.sources.length > 0 && (
                  <div className="match-info">
                    <span className="info-label">Streams:</span>
                    <span className="info-value">{match.sources.length} available</span>
                  </div>
                )}
              </div>
              
              <div className="match-actions">
                {match.sources && match.sources.length > 0 ? (
                  <div className="stream-sources">
                    {match.sources.map((source, sourceIndex) => (
                      <Link
                        key={sourceIndex}
                        to={`/player/${source.source}/${source.id}`}
                        className="watch-btn"
                        onClick={() => handleWatchClick(match)}
                      >
                        🎬 Watch Stream {sourceIndex + 1}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="no-streams">
                    <span>No streams available</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BasketballPage;
