import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './CricketPage.css';

const CricketPage = () => {
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
          console.log('Fetching and validating live Cricket matches...');
          data = await api.getLiveCricketMatches();
          console.log(`Found ${data.length} validated live cricket matches`);
          setValidating(false);
        } else if (filter === 'upcoming') {
          data = await api.getUpcomingCricketMatches();
        }
        
        setMatches(data);
        
        // Also get live matches for the live indicator
        if (filter !== 'live') {
          const live = await api.getLiveCricketMatches();
          setLiveMatches(live);
        } else {
          setLiveMatches(data); // Use the same data if we're already on live tab
        }
        
      } catch (err) {
        setError('Failed to load Cricket matches');
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

  const formatMatchTime = (time) => {
    if (!time) return 'Time TBD';
    
    // If it's already a formatted string, return as is
    if (typeof time === 'string' && !time.match(/^\d+$/)) {
      return time;
    }
    
    // If it's a timestamp, format it
    const date = new Date(time);
    if (isNaN(date.getTime())) {
      return time; // Return original if can't parse
    }
    
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  if (loading) {
    return (
      <div className="cricket-page">
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
      <div className="cricket-page">
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
    <div className="cricket-page">
      <div className="cricket-header">
        <h1>🏏 Cricket Matches</h1>
        <p>Watch live Cricket matches and upcoming games</p>
        
        {liveMatches.length > 0 && (
          <div className="live-indicator">
            <span className="live-dot"></span>
            {liveMatches.length} Live {liveMatches.length === 1 ? 'Match' : 'Matches'}
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
            <h3>🏏 No {filter} Cricket matches available</h3>
            <p>
              {filter === 'live' 
                ? 'There are currently no live Cricket matches with available streams.'
                : 'No upcoming Cricket matches scheduled at the moment.'
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
                        : (match.teams.home?.name || match.teams.team1 || 'Team 1')
                      }
                    </span>
                    {match.score && match.score.home && (
                      <div className="team-score">{match.score.home}</div>
                    )}
                  </div>
                  <div className="vs">VS</div>
                  <div className="team">
                    <span className="team-name">
                      {typeof match.teams.away === 'string' 
                        ? match.teams.away 
                        : (match.teams.away?.name || match.teams.team2 || 'Team 2')
                      }
                    </span>
                    {match.score && match.score.away && (
                      <div className="team-score">{match.score.away}</div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="match-details">
                {match.series && (
                  <div className="match-info">
                    <span className="info-label">Series:</span>
                    <span className="info-value">{match.series}</span>
                  </div>
                )}
                
                {match.format && (
                  <div className="match-info">
                    <span className="info-label">Format:</span>
                    <span className="info-value">{match.format}</span>
                  </div>
                )}
                
                {match.venue && (
                  <div className="match-info">
                    <span className="info-label">Venue:</span>
                    <span className="info-value">{match.venue}</span>
                  </div>
                )}
                
                {match.time && (
                  <div className="match-info">
                    <span className="info-label">Time:</span>
                    <span className="info-value">{formatMatchTime(match.time)}</span>
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

export default CricketPage;
