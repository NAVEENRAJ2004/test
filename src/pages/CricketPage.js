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
  const [filter, setFilter] = useState('live'); // 'live', 'upcoming', 'asia-cup', 'asia-cup-live', 'asia-cup-upcoming'
  const [selectedTournament, setSelectedTournament] = useState('all'); // 'all', 'ipl', 'asia-cup', 'world-cup'

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
        } else if (filter === 'asia-cup') {
          data = await api.getAllAsiaCupMatches();
        } else if (filter === 'asia-cup-live') {
          setValidating(true);
          console.log('Fetching and validating live Asia Cup matches...');
          data = await api.getLiveAsiaCupMatches();
          console.log(`Found ${data.length} validated live Asia Cup matches`);
          setValidating(false);
        } else if (filter === 'asia-cup-upcoming') {
          data = await api.getUpcomingAsiaCupMatches();
        }

        // Filter by tournament if not 'all'
        if (selectedTournament !== 'all' && selectedTournament !== filter) {
          data = data.filter(match => 
            match.series?.toLowerCase().includes(selectedTournament) ||
            match.tournament?.toLowerCase().includes(selectedTournament) ||
            match.category?.toLowerCase().includes(selectedTournament)
          );
        }
        
        setMatches(data);
        
        // Also get live matches for the live indicator
        if (!filter.includes('live')) {
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
  }, [filter, selectedTournament]);

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

      <div className="filter-container">
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
          <button 
            className={`filter-tab ${filter === 'asia-cup' ? 'active' : ''}`}
            onClick={() => setFilter('asia-cup')}
          >
            🏆 Asia Cup
          </button>
          <button 
            className={`filter-tab ${filter === 'asia-cup-live' ? 'active' : ''}`}
            onClick={() => setFilter('asia-cup-live')}
          >
            🔴 Asia Cup Live
          </button>
          <button 
            className={`filter-tab ${filter === 'asia-cup-upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('asia-cup-upcoming')}
          >
            📅 Asia Cup Upcoming
          </button>
        </div>

        <div className="tournament-filter">
          <label htmlFor="tournament-select">Tournament:</label>
          <select 
            id="tournament-select"
            value={selectedTournament} 
            onChange={(e) => setSelectedTournament(e.target.value)}
            className="tournament-select"
          >
            <option value="all">All Tournaments</option>
            <option value="ipl">IPL</option>
            <option value="asia cup">Asia Cup</option>
            <option value="world cup">World Cup</option>
            <option value="test">Test Series</option>
            <option value="odi">ODI Series</option>
            <option value="t20">T20 Series</option>
            <option value="big bash">Big Bash League</option>
            <option value="caribbean premier">Caribbean Premier League</option>
          </select>
        </div>
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
                <div className="match-badges">
                  {(filter.includes('live') || match.status === 'live') && (
                    <div className="live-badge">
                      <span className="live-dot"></span>
                      LIVE
                    </div>
                  )}
                  {match.category === 'asia cup' && (
                    <div className="tournament-badge asia-cup">
                      🏆 Asia Cup
                    </div>
                  )}
                  {match.series?.toLowerCase().includes('ipl') && (
                    <div className="tournament-badge ipl">
                      🏏 IPL
                    </div>
                  )}
                  {match.format && (
                    <div className="format-badge">
                      {match.format}
                    </div>
                  )}
                </div>
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

                {match.tournament && (
                  <div className="match-info">
                    <span className="info-label">Tournament:</span>
                    <span className="info-value">{match.tournament}</span>
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

                {match.weather && (
                  <div className="match-info weather-info">
                    <span className="info-label">Weather:</span>
                    <span className="info-value">
                      {match.weather.condition} • {match.weather.temperature}
                      {match.weather.humidity && ` • ${match.weather.humidity} humidity`}
                    </span>
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
