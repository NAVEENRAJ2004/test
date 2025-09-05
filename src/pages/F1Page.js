import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './F1Page.css';

const F1Page = () => {
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
          console.log('Fetching and validating live F1 matches for F1 page...');
          data = await api.getLiveF1Matches();
          console.log(`Found ${data.length} validated live races for F1 page`);
          setValidating(false);
        } else if (filter === 'upcoming') {
          data = await api.getUpcomingF1Matches();
        }
        
        setMatches(data);
        
        // Also get live matches for the live indicator
        if (filter !== 'live') {
          const live = await api.getLiveF1Matches();
          setLiveMatches(live);
        } else {
          setLiveMatches(data); // Use the same data if we're already on live tab
        }
        
      } catch (err) {
        setError('Failed to load F1 matches');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [filter]);

  const isLiveMatch = (matchId) => {
    return liveMatches.some(live => live.id === matchId);
  };

  if (loading) {
    return (
      <div className="f1-page">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="f1-page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">🏎️ Formula 1 Races</h1>
          <p className="page-subtitle">
            Watch live F1 races and catch up on the latest Grand Prix events
          </p>
          
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'live' ? 'active' : ''}`}
              onClick={() => setFilter('live')}
              disabled={validating}
            >
              🔴 Live Now ({validating ? '...' : liveMatches.length})
            </button>
            <button 
              className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilter('upcoming')}
              disabled={validating}
            >
              📅 Upcoming
            </button>
          </div>
          
          {validating && (
            <div className="validation-notice-f1">
              🔍 Validating stream availability - Only working streams will be shown
            </div>
          )}
        </div>
      </div>

      <div className="container">
        {error && <div className="error-message">{error}</div>}
        
        {matches.length === 0 && !loading ? (
          <div className="no-matches">
            <div className="no-matches-icon">🏁</div>
            <h3>No F1 races found</h3>
            <p>
              {filter === 'live' 
                ? 'No live races at the moment. Check back during race weekends!' 
                : filter === 'upcoming'
                ? 'No upcoming races scheduled. Check back later!'
                : 'No F1 races available. Please try again later.'
              }
            </p>
            {filter === 'upcoming' && (
              <button 
                className="btn btn-primary"
                onClick={() => setFilter('live')}
              >
                View Live Races
              </button>
            )}
          </div>
        ) : (
          <div className="matches-grid">
            {matches.map((match) => (
              <F1MatchCard 
                key={match.id} 
                match={match} 
                isLive={isLiveMatch(match.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const F1MatchCard = ({ match, isLive = false }) => {
  const [selectedSource, setSelectedSource] = useState(0);
  const [showSources, setShowSources] = useState(false);

  const hasValidSources = match.sources && match.sources.length > 0;
  const currentSource = hasValidSources ? match.sources[selectedSource] : null;
  const isUpcoming = match.status === 'upcoming';
  const actuallyLive = match.status === 'live' || isLive;

  return (
    <div className={`f1-match-card ${actuallyLive ? 'live' : ''} ${isUpcoming ? 'upcoming' : ''}`}>
      {actuallyLive && <div className="live-indicator">🔴 LIVE</div>}
      {isUpcoming && <div className="upcoming-indicator">📅 UPCOMING</div>}
      
      {match.popular && <div className="popular-badge">⭐ Popular</div>}
      
      <div className="match-header">
        <div className="match-poster-placeholder">
          <div className="f1-icon">🏎️</div>
        </div>
        
        <div className="match-info">
          <h3 className="match-title">{match.title}</h3>
          <div className="match-meta">
            <span className="match-time">
              📅 {api.formatDate(match.date)}
            </span>
            {actuallyLive && (
              <span className="live-status">
                🔴 Live Now
              </span>
            )}
            {isUpcoming && (
              <span className="upcoming-status">
                � {new Date(match.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })} at {new Date(match.date).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      {match.teams && (
        <div className="teams-section">
          <div className="teams-container">
            {match.teams.home && (
              <div className="team">
                <div className="team-badge-placeholder">
                  {typeof match.teams.home === 'string' 
                    ? match.teams.home.charAt(0) 
                    : (match.teams.home.name ? match.teams.home.name.charAt(0) : 'T')
                  }
                </div>
                <span className="team-name">
                  {typeof match.teams.home === 'string' 
                    ? match.teams.home 
                    : (match.teams.home.name || 'Team')
                  }
                </span>
              </div>
            )}
            
            {match.teams.home && match.teams.away && (
              <div className="vs-divider">
                <span>VS</span>
              </div>
            )}
            
            {match.teams.away && (
              <div className="team">
                <div className="team-badge-placeholder">
                  {typeof match.teams.away === 'string' 
                    ? match.teams.away.charAt(0) 
                    : (match.teams.away.name ? match.teams.away.name.charAt(0) : 'T')
                  }
                </div>
                <span className="team-name">
                  {typeof match.teams.away === 'string' 
                    ? match.teams.away 
                    : (match.teams.away.name || 'Team')
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="sources-section">
        {hasValidSources ? (
          <>
            <div className="sources-header">
              <h4>Available Streams ({match.sources.length})</h4>
              {match.sources.length > 1 && (
                <button 
                  className="toggle-sources"
                  onClick={() => setShowSources(!showSources)}
                >
                  {showSources ? 'Hide Sources' : 'Show All Sources'}
                </button>
              )}
            </div>
            
            {match.sources.length > 1 && showSources && (
              <div className="sources-list">
                {match.sources.map((source, index) => (
                  <button
                    key={index}
                    className={`source-option ${selectedSource === index ? 'active' : ''}`}
                    onClick={() => setSelectedSource(index)}
                  >
                    {source.source.toUpperCase()} - {source.id}
                  </button>
                ))}
              </div>
            )}
            
            <div className="primary-actions">
              <Link 
                to={`/player/${currentSource.source}/${currentSource.id}`}
                className="btn btn-primary watch-btn"
              >
                <span>🎬</span>
                Watch Stream
              </Link>
              
              {match.sources.length > 1 && (
                <span className="sources-count">
                  +{match.sources.length - 1} more available
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="no-sources">
            <p>No streams available for this race</p>
            <button className="btn btn-secondary" disabled>
              Stream Unavailable
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default F1Page;
