import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Home.css';

const Home = () => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [liveCricket, setLiveCricket] = useState([]);
  const [liveAsiaCup, setLiveAsiaCup] = useState([]);
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
        
        console.log('Fetching live cricket matches...');
        const cricket = await api.getLiveCricketMatches();
        setLiveCricket(cricket);
        console.log(`Found ${cricket.length} live cricket matches`);
        
        console.log('Fetching live Asia Cup matches...');
        const asiaCup = await api.getLiveAsiaCupMatches();
        setLiveAsiaCup(asiaCup);
        console.log(`Found ${asiaCup.length} live Asia Cup matches`);
        
        setValidatingStreams(false);
        
        console.log('Fetching upcoming F1 matches...');
        const upcoming = await api.getUpcomingF1Matches();
        setUpcomingMatches(upcoming);
        console.log(`Found ${upcoming.length} upcoming races`);
        
        setError(null);
      } catch (err) {
        setError('Failed to load sports matches');
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
            🏎️ Sports Streaming Hub
          </h1>
          <p className="hero-subtitle">
            Formula 1, Cricket, Asia Cup & More - All Live Streams
          </p>
          
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">{liveMatches.length + liveCricket.length}</span>
              <span className="stat-label">
                {validatingStreams ? 'Validating...' : 'Live Now'}
              </span>
            </div>
            <div className="stat">
              <span className="stat-number">{upcomingMatches.length}</span>
              <span className="stat-label">Upcoming</span>
            </div>
            <div className="stat">
              <span className="stat-number">{liveAsiaCup.length}</span>
              <span className="stat-label">Asia Cup Live</span>
            </div>
          </div>
          
          {validatingStreams && (
            <div className="validation-notice">
              🔍 Checking stream availability...
            </div>
          )}
          
          <div className="hero-buttons">
            <Link to="/f1" className="btn btn-primary hero-cta">
              🏎️ F1 Races
            </Link>
            <Link to="/cricket" className="btn btn-secondary hero-cta">
              🏏 Cricket
            </Link>
          </div>
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

      {liveAsiaCup.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">🏆 Live Asia Cup</h2>
            <div className="matches-grid">
              {liveAsiaCup.slice(0, 3).map((match) => (
                <CricketMatchCard key={match.id} match={match} isLive={true} />
              ))}
            </div>
            <div className="section-actions">
              <Link to="/cricket?filter=asia-cup-live" className="btn btn-outline">
                View All Asia Cup Matches
              </Link>
            </div>
          </div>
        </section>
      )}

      {liveCricket.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">🏏 Live Cricket</h2>
            <div className="matches-grid">
              {liveCricket.slice(0, 3).map((match) => (
                <CricketMatchCard key={match.id} match={match} isLive={true} />
              ))}
            </div>
            <div className="section-actions">
              <Link to="/cricket" className="btn btn-outline">
                View All Cricket Matches
              </Link>
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

      {upcomingMatches.length === 0 && liveMatches.length === 0 && liveCricket.length === 0 && liveAsiaCup.length === 0 && !loading && (
        <section className="section">
          <div className="container">
            <div className="no-races-today">
              <div className="no-races-icon">🏁</div>
              <h3>No Live Sports Available</h3>
              <p>
                There are no live sports matches at the moment. 
                Check out upcoming events or browse by sport!
              </p>
              <div className="sport-links">
                <Link to="/f1" className="btn btn-primary">
                  🏎️ F1 Races
                </Link>
                <Link to="/cricket" className="btn btn-primary">
                  🏏 Cricket
                </Link>
                <Link to="/basketball" className="btn btn-primary">
                  🏀 Basketball
                </Link>
              </div>
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

const CricketMatchCard = ({ match, isLive = false }) => {
  const hasValidSource = match.sources && match.sources.length > 0;
  const isUpcoming = match.status === 'upcoming';
  const actuallyLive = match.status === 'live' || isLive;
  
  return (
    <div className={`match-card ${actuallyLive ? 'live' : ''} ${isUpcoming ? 'upcoming' : ''} cricket-card`}>
      {actuallyLive && <div className="live-indicator">🔴 LIVE</div>}
      {isUpcoming && <div className="upcoming-indicator">📅 UPCOMING</div>}
      {match.category === 'asia cup' && <div className="tournament-badge">🏆 Asia Cup</div>}
      
      <div className="match-poster-placeholder cricket">
        <div className="cricket-icon">🏏</div>
      </div>
      
      <div className="match-info">
        <h3 className="match-title">{match.title}</h3>
        
        {match.teams && (
          <div className="teams cricket-teams">
            <div className="team">
              <span>{match.teams.team1 || match.teams.home}</span>
              {match.score && match.score.home && (
                <div className="score">{match.score.home}</div>
              )}
            </div>
            <span className="vs">vs</span>
            <div className="team">
              <span>{match.teams.team2 || match.teams.away}</span>
              {match.score && match.score.away && (
                <div className="score">{match.score.away}</div>
              )}
            </div>
          </div>
        )}
        
        {match.format && (
          <div className="match-format">
            {match.format} • {match.venue || 'TBA'}
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
              {match.time ? new Date(match.time).toLocaleTimeString() : 'Starting Soon'}
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
