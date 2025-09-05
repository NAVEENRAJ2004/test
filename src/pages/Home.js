import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Home.css';

const Home = () => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validatingStreams, setValidatingStreams] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setValidatingStreams(true);
        
        console.log('Fetching and validating live F1 matches...');
        const live = await api.getLiveF1Matches();
        setLiveMatches(live);
        console.log(`Found ${live.length} validated live races`);
        
        setValidatingStreams(false);
        
        console.log('Fetching upcoming F1 matches...');
        const upcoming = await api.getUpcomingF1Matches();
        setUpcomingMatches(upcoming);
        console.log(`Found ${upcoming.length} upcoming races`);
        
        setError(null);
      } catch (err) {
        setError('Failed to load F1 matches');
        console.error('Error:', err);
        setValidatingStreams(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="home">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            🏎️ Formula 1 & Motorsports Hub
          </h1>
          <p className="hero-subtitle">
            Your Ultimate Formula 1 & Motorsports Streaming Destination
          </p>
          
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">{liveMatches.length}</span>
              <span className="stat-label">
                {validatingStreams ? 'Validating...' : 'Live Now'}
              </span>
            </div>
            <div className="stat">
              <span className="stat-number">{upcomingMatches.length}</span>
              <span className="stat-label">Upcoming</span>
            </div>
          </div>
          
          {validatingStreams && (
            <div className="validation-notice">
              🔍 Checking stream availability...
            </div>
          )}
          
          <Link to="/f1" className="btn btn-primary hero-cta">
            Explore F1 Races
          </Link>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {liveMatches.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">🔴 Live F1 Races</h2>
            <div className="matches-grid">
              {liveMatches.slice(0, 3).map((match) => (
                <MatchCard key={match.id} match={match} isLive={true} />
              ))}
            </div>
          </div>
        </section>
      )}

      {upcomingMatches.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">📅 Upcoming F1 Races</h2>
            <div className="matches-grid">
              {upcomingMatches.slice(0, 6).map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        </section>
      )}

      {upcomingMatches.length === 0 && liveMatches.length === 0 && !loading && (
        <section className="section">
          <div className="container">
            <div className="no-races-today">
              <div className="no-races-icon">🏁</div>
              <h3>No F1 Races Available</h3>
              <p>
                There are no Formula 1 races scheduled for today. 
                Check out the full F1 schedule or catch up on recent races!
              </p>
              <Link to="/f1" className="btn btn-primary">
                Browse All F1 Races
              </Link>
            </div>
          </div>
        </section>
      )}

      
    </div>
  );
};

const MatchCard = ({ match, isLive = false }) => {
  const hasValidSource = match.sources && match.sources.length > 0;
  const isUpcoming = match.status === 'upcoming';
  const actuallyLive = match.status === 'live' || isLive;
  
  return (
    <div className={`match-card ${actuallyLive ? 'live' : ''} ${isUpcoming ? 'upcoming' : ''}`}>
      {actuallyLive && <div className="live-indicator">🔴 LIVE</div>}
      {isUpcoming && <div className="upcoming-indicator">📅 UPCOMING</div>}
      
      <div className="match-poster-placeholder">
        <div className="f1-icon">🏎️</div>
      </div>
      
      <div className="match-info">
        <h3 className="match-title">{match.title}</h3>
        <p className="match-time">
          {api.formatDate(match.date)}
        </p>
        
        {match.teams && (
          <div className="teams">
            {match.teams.home && (
              <div className="team">
                <div className="team-badge-placeholder">
                  {match.teams.home.name.charAt(0)}
                </div>
                <span>{match.teams.home.name}</span>
              </div>
            )}
            {match.teams.home && match.teams.away && <span className="vs">vs</span>}
            {match.teams.away && (
              <div className="team">
                <div className="team-badge-placeholder">
                  {match.teams.away.name.charAt(0)}
                </div>
                <span>{match.teams.away.name}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="match-actions">
          {hasValidSource && actuallyLive ? (
            <Link 
              to={`/player/${match.sources[0].source}/${match.sources[0].id}`}
              className="btn btn-primary"
            >
              Watch Stream
            </Link>
          ) : isUpcoming ? (
            <button className="btn btn-secondary" disabled>
              Starts {new Date(match.date).toLocaleTimeString()}
            </button>
          ) : (
            <button className="btn btn-secondary" disabled>
              No Stream Available
            </button>
          )}
          
          {match.sources && match.sources.length > 1 && (
            <span className="sources-count">
              +{match.sources.length - 1} more sources
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
