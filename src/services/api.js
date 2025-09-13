// API service for api.naveenraj30.me API
const BASE_URL = 'https://api.naveenraj30.me/api';

class StreamedAPI {
  // Enhanced F1 filtering function with comprehensive keywords
  isF1Match(match) {
    return (
      // Category checks
      match.category === 'f1' || 
      match.category === 'formula1' || 
      match.category === 'formula-1' ||
      match.category === 'formula one' ||
      match.category === 'fia f1' ||
      match.category === 'fia formula 1' ||
      match.category === 'f1 world championship' ||
      
      // Title checks - general F1 terms
      match.title.toLowerCase().includes('formula') ||
      match.title.toLowerCase().includes('f1') ||
      match.title.toLowerCase().includes('formula one') ||
      match.title.toLowerCase().includes('fia f1') ||
      match.title.toLowerCase().includes('fia formula 1') ||
      match.title.toLowerCase().includes('grand prix') ||
      match.title.toLowerCase().includes('gp ') ||   // with space to reduce false matches
      match.title.toLowerCase().includes(' prix') // covers just "Prix"

    );
  }

  // Enhanced Cricket filtering function with comprehensive keywords
  isCricketMatch(match) {
    return (
      // Category checks
      match.category === 'cricket' ||
      match.category === 'ipl' ||
      match.category === 'test' ||
      match.category === 'odi' ||
      match.category === 't20' ||
      match.category === 't20i' ||
      match.category === 'asia cup' ||
      match.category === 'world cup' ||
      match.category === 'champions trophy' ||
      match.category === 'wt20' ||
      match.category === 'bbl' ||
      match.category === 'cpl' ||
      match.category === 'psl' ||
      match.category === 'county' ||
      
      // Title checks - general cricket terms
      match.title.toLowerCase().includes('cricket') ||
      match.title.toLowerCase().includes('ipl') ||
      match.title.toLowerCase().includes('test match') ||
      match.title.toLowerCase().includes('one day') ||
      match.title.toLowerCase().includes('t20') ||
      match.title.toLowerCase().includes('twenty20') ||
      match.title.toLowerCase().includes('asia cup') ||
      match.title.toLowerCase().includes('world cup cricket') ||
      match.title.toLowerCase().includes('champions trophy') ||
      match.title.toLowerCase().includes('big bash') ||
      match.title.toLowerCase().includes('caribbean premier') ||
      match.title.toLowerCase().includes('pakistan super league') ||
      match.title.toLowerCase().includes('county championship') ||
      match.title.toLowerCase().includes('ranji trophy') ||
      match.title.toLowerCase().includes('vijay hazare') ||
      match.title.toLowerCase().includes('syed mushtaq') ||
      
      // Team names that indicate cricket
      match.title.toLowerCase().includes('vs') && (
        match.title.toLowerCase().includes('india') ||
        match.title.toLowerCase().includes('pakistan') ||
        match.title.toLowerCase().includes('australia') ||
        match.title.toLowerCase().includes('england') ||
        match.title.toLowerCase().includes('south africa') ||
        match.title.toLowerCase().includes('new zealand') ||
        match.title.toLowerCase().includes('sri lanka') ||
        match.title.toLowerCase().includes('bangladesh') ||
        match.title.toLowerCase().includes('afghanistan') ||
        match.title.toLowerCase().includes('west indies') ||
        match.title.toLowerCase().includes('zimbabwe') ||
        match.title.toLowerCase().includes('ireland') ||
        match.title.toLowerCase().includes('netherlands')
      )
    );
  }

  // Asia Cup specific filtering function
  isAsiaCupMatch(match) {
    return (
      match.category === 'asia cup' ||
      match.category === 'asiacup' ||
      match.title.toLowerCase().includes('asia cup') ||
      match.title.toLowerCase().includes('asian cup cricket') ||
      match.series?.toLowerCase().includes('asia cup') ||
      (match.tournament && match.tournament.toLowerCase().includes('asia cup'))
    );
  }

  // Check if a stream URL is available (simplified version)
  async checkStreamAvailability(source, id) {
    try {
      // For now, we'll check if the API returns valid stream data
      // In a real implementation, this would check the actual stream URL
      const streamData = await this.getStreams(source, id);
      
      if (!streamData) {
        console.log(`No stream data returned for ${source}/${id}`);
        return false;
      }
      
      // Check if we have any stream data
      if (Array.isArray(streamData) && streamData.length === 0) {
        console.log(`Empty stream array for ${source}/${id}`);
        return false;
      }
      
      // For any streams, we'll assume they're working if the API returns data
      // In production, you'd implement actual stream URL checking here
      console.log(`✓ Stream data found for ${source}/${id}, assuming available`);
      return true;
      
    } catch (error) {
      console.error(`✗ Stream check failed for ${source}/${id}:`, error.message);
      return false;
    }
  }

  // Validate races by checking stream availability
  async validateRaceStreams(races) {
    const validatedRaces = [];
    
    for (const race of races) {
      if (!race.sources || race.sources.length === 0) {
        continue; // Skip races without sources
      }
      
      // Check if at least one source is working
      let hasWorkingStream = false;
      const workingSources = [];
      
      for (const source of race.sources) {
        const isAvailable = await this.checkStreamAvailability(source.source, source.id);
        if (isAvailable) {
          hasWorkingStream = true;
          workingSources.push(source);
        }
      }
      
      // Only include races with working streams
      if (hasWorkingStream) {
        validatedRaces.push({
          ...race,
          sources: workingSources // Only include working sources
        });
      }
    }
    
    return validatedRaces;
  }

  // Get all F1 matches - Only return real data from API
  async getF1Matches() {
    try {
      // Try to get live matches from API
      const liveResponse = await fetch(`${BASE_URL}/matches/live`);
      if (liveResponse.ok) {
        const liveMatches = await liveResponse.json();
        const f1Live = liveMatches.filter(match => this.isF1Match(match));
        
        if (f1Live.length > 0) {
          // Validate streams before returning
          const validatedRaces = await this.validateRaceStreams(f1Live);
          return validatedRaces;
        }
      }
      
      // If no live data, try upcoming matches
      const upcomingResponse = await fetch(`${BASE_URL}/matches/upcoming`);
      if (upcomingResponse.ok) {
        const upcomingMatches = await upcomingResponse.json();
        const f1Upcoming = upcomingMatches.filter(match => this.isF1Match(match));
        
        return f1Upcoming;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching F1 matches:', error);
      return [];
    }
  }

  // Get live F1 matches with stream validation
  async getLiveF1Matches() {
    try {
      const response = await fetch(`${BASE_URL}/matches/live`);
      if (!response.ok) {
        return [];
      }
      const allLive = await response.json();
      // Filter for F1 matches only using comprehensive filter
      const f1Live = allLive.filter(match => this.isF1Match(match));
      
      // Validate streams before returning
      return await this.validateRaceStreams(f1Live);
    } catch (error) {
      console.error('Error fetching live F1 matches:', error);
      return [];
    }
  }

  // Get today's F1 matches - return live races
  async getTodayF1Matches() {
    try {
      // First try to get today's matches
      const response = await fetch(`${BASE_URL}/matches/all-today`);
      if (response.ok) {
        const todayMatches = await response.json();
        const f1Today = todayMatches.filter(match => this.isF1Match(match));
        
        if (f1Today.length > 0) {
          return f1Today;
        }
      }
      
      // Fallback to live races
      return await this.getLiveF1Matches();
    } catch (error) {
      console.error('Error fetching today\'s F1 matches:', error);
      // Fallback to live races
      return await this.getLiveF1Matches();
    }
  }

  // Get recent F1 matches as fallback
  async getRecentF1Matches() {
    try {
      const response = await fetch(`${BASE_URL}/matches/f1`);
      if (!response.ok) {
        // If f1 category doesn't exist, try getting all matches and filter
        const allResponse = await fetch(`${BASE_URL}/matches/all`);
        if (!allResponse.ok) {
          return [];
        }
        const allMatches = await allResponse.json();
        const f1Matches = allMatches.filter(match => this.isF1Match(match));
        
        return f1Matches.slice(0, 6); // Limit to 6 recent matches
      }
      const f1Matches = await response.json();
      return f1Matches.slice(0, 6); // Limit to 6 recent matches
    } catch (error) {
      console.error('Error fetching recent F1 matches:', error);
      return [];
    }
  }

  // Sample F1 data for demonstration - Enhanced Motorsport Data
  getSampleF1Data() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;
    
    return [
      // Live races
      {
        id: 'live-f1-1',
        title: 'FIA F1 World Championship: Italian Grand Prix - Free Practice 2',
        category: 'f1',
        date: now - (30 * 60 * 1000), // Started 30 minutes ago
        poster: null,
        popular: true,
        status: 'live',
        circuit: {
          name: 'Autodromo Nazionale Monza',
          location: 'Monza, Italy',
          length: '5.793 km',
          laps: 53,
          lapRecord: '1:21.046 (Lewis Hamilton, 2020)'
        },
        weather: {
          condition: 'Sunny',
          temperature: '24°C',
          humidity: '45%',
          windSpeed: '8 km/h'
        },
        session: {
          type: 'Free Practice 2',
          duration: '90 minutes',
          timeRemaining: '45 minutes'
        },
        teams: {
          home: { name: 'Ferrari', badge: null },
          away: { name: 'Red Bull Racing', badge: null }
        },
        sources: [
          { 
            source: 'charlie', 
            id: 'formula-1-pirelli-gran-premio-ditalia-friday-practice-2-10294f60247',
            quality: 'HD 1080p',
            language: 'English',
            commentators: 'Martin Brundle, David Croft',
            delay: 'Live',
            region: 'International'
          },
          {
            source: 'stream2',
            id: 'f1-italia-fp2-alt',
            quality: 'HD 720p',
            language: 'Italian',
            commentators: 'Carlo Vanzini, Marc Genè',
            delay: '30 seconds',
            region: 'Italy'
          }
        ]
      },
      {
        id: 'live-f1-2',
        title: 'Formula 1 Singapore Grand Prix - Qualifying Session',
        category: 'f1',
        date: now - (15 * 60 * 1000), // Started 15 minutes ago
        poster: null,
        popular: false,
        status: 'live',
        circuit: {
          name: 'Marina Bay Street Circuit',
          location: 'Singapore',
          length: '5.063 km',
          laps: 61,
          lapRecord: '1:35.867 (Lewis Hamilton, 2023)'
        },
        weather: {
          condition: 'Night Race',
          temperature: '28°C',
          humidity: '75%',
          windSpeed: '12 km/h'
        },
        session: {
          type: 'Qualifying',
          duration: '60 minutes',
          timeRemaining: '35 minutes'
        },
        teams: {
          home: { name: 'Mercedes AMG', badge: null },
          away: { name: 'McLaren', badge: null }
        },
        sources: [
          { 
            source: 'stream1', 
            id: 'singapore-qualifying-live',
            quality: 'UHD 4K',
            language: 'English',
            commentators: 'Martin Brundle, Ted Kravitz',
            delay: 'Live',
            region: 'Global'
          }
        ]
      },
      // Upcoming races
      {
        id: 'upcoming-f1-1',
        title: 'Formula 1 Italian Grand Prix - Race Day',
        category: 'f1',
        date: now + (2 * oneHour), // In 2 hours
        poster: null,
        popular: true,
        status: 'upcoming',
        circuit: {
          name: 'Autodromo Nazionale Monza',
          location: 'Monza, Italy',
          length: '5.793 km',
          laps: 53,
          lapRecord: '1:21.046 (Lewis Hamilton, 2020)'
        },
        weather: {
          condition: 'Partly Cloudy',
          temperature: '26°C',
          humidity: '50%',
          windSpeed: '10 km/h'
        },
        session: {
          type: 'Grand Prix Race',
          duration: '2 hours maximum',
          timeRemaining: 'Starts in 2 hours'
        },
        teams: {
          home: { name: 'Red Bull Racing', badge: null },
          away: { name: 'Ferrari', badge: null }
        },
        sources: [
          { 
            source: 'charlie', 
            id: 'italian-gp-race',
            quality: 'UHD 4K',
            language: 'English',
            commentators: 'Martin Brundle, David Croft, Karun Chandhok',
            delay: 'Live',
            region: 'International'
          },
          {
            source: 'stream3',
            id: 'italia-gp-sky',
            quality: 'HD 1080p',
            language: 'Italian',
            commentators: 'Carlo Vanzini, Davide Valsecchi',
            delay: 'Live',
            region: 'Italy'
          }
        ]
      },
      {
        id: 'upcoming-f1-2',
        title: 'Formula 1 Singapore Grand Prix - Race Day',
        category: 'f1',
        date: now + (oneDay), // Tomorrow
        poster: null,
        popular: true,
        status: 'upcoming',
        circuit: {
          name: 'Marina Bay Street Circuit',
          location: 'Singapore',
          length: '5.063 km',
          laps: 61,
          lapRecord: '1:35.867 (Lewis Hamilton, 2023)'
        },
        weather: {
          condition: 'Night Race',
          temperature: '29°C',
          humidity: '80%',
          windSpeed: '8 km/h'
        },
        session: {
          type: 'Grand Prix Race',
          duration: '2 hours maximum',
          timeRemaining: 'Starts tomorrow'
        },
        teams: {
          home: { name: 'McLaren', badge: null },
          away: { name: 'Aston Martin', badge: null }
        },
        sources: [
          { 
            source: 'charlie', 
            id: 'singapore-gp-race',
            quality: 'UHD 4K',
            language: 'English',
            commentators: 'Martin Brundle, David Croft, Jenson Button',
            delay: 'Live',
            region: 'Global'
          }
        ]
      },
      {
        id: 'upcoming-f1-3',
        title: 'Formula 1 Japanese Grand Prix - Free Practice 1',
        category: 'f1',
        date: now + (2 * oneDay), // Day after tomorrow
        poster: null,
        popular: false,
        status: 'upcoming',
        circuit: {
          name: 'Suzuka International Racing Course',
          location: 'Suzuka, Japan',
          length: '5.807 km',
          laps: 53,
          lapRecord: '1:30.983 (Lewis Hamilton, 2019)'
        },
        weather: {
          condition: 'Overcast',
          temperature: '22°C',
          humidity: '65%',
          windSpeed: '15 km/h'
        },
        session: {
          type: 'Free Practice 1',
          duration: '90 minutes',
          timeRemaining: 'Starts in 2 days'
        },
        teams: {
          home: { name: 'Mercedes AMG', badge: null },
          away: { name: 'Alpine', badge: null }
        },
        sources: [
          { 
            source: 'charlie', 
            id: 'japanese-gp-fp1',
            quality: 'HD 1080p',
            language: 'English',
            commentators: 'Martin Brundle, Alex Jacques',
            delay: 'Live',
            region: 'Asia-Pacific'
          }
        ]
      }
    ];
  }

  // Get sample live races only
  getSampleLiveRaces() {
    const allRaces = this.getSampleF1Data();
    return allRaces.filter(race => race.status === 'live');
  }

  // Get upcoming F1 matches
  async getUpcomingF1Matches() {
    try {
      const response = await fetch(`${BASE_URL}/matches/upcoming`);
      if (!response.ok) {
        return [];
      }
      const allUpcoming = await response.json();
      // Filter for F1 matches only using comprehensive filter
      const f1Upcoming = allUpcoming.filter(match => this.isF1Match(match));
      
      return f1Upcoming;
    } catch (error) {
      console.error('Error fetching upcoming F1 matches:', error);
      return [];
    }
  }

  // Get streams for a specific match
  async getStreams(source, id) {
    try {
      const response = await fetch(`${BASE_URL}/stream/${source}/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch streams for ${source}/${id}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching streams:', error);
      return [];
    }
  }

  // Basketball API Methods
  
  // Get all Basketball matches
  async getBasketballMatches() {
    try {
      // First try to get live matches from API
      const liveResponse = await fetch(`${BASE_URL}/matches/live`);
      if (liveResponse.ok) {
        const liveMatches = await liveResponse.json();
        const basketballLive = liveMatches.filter(match => 
          match.category === 'basketball' || 
          match.category === 'nba' || 
          match.category === 'wnba' ||
          match.category === 'ncaa' ||
          match.title.toLowerCase().includes('basketball') ||
          match.title.toLowerCase().includes('nba') ||
          match.title.toLowerCase().includes('wnba') ||
          match.title.toLowerCase().includes('ncaa')
        );
        
        if (basketballLive.length > 0) {
          // Validate streams before returning
          const validatedGames = await this.validateBasketballStreams(basketballLive);
          if (validatedGames.length > 0) {
            return validatedGames;
          }
        }
      }
      
      // Fallback to sample live data
      const sampleGames = this.getSampleLiveBasketball();
      return await this.validateBasketballStreams(sampleGames);
    } catch (error) {
      console.error('Error fetching Basketball matches:', error);
      // Return sample data without validation as fallback
      return this.getSampleLiveBasketball();
    }
  }

  // Get live Basketball matches with stream validation
  async getLiveBasketballMatches() {
    try {
      const response = await fetch(`${BASE_URL}/matches/live`);
      if (!response.ok) {
        const sampleGames = this.getSampleLiveBasketball();
        return await this.validateBasketballStreams(sampleGames);
      }
      const allLive = await response.json();
      // Filter for Basketball matches only
      const basketballLive = allLive.filter(match => 
        match.category === 'basketball' || 
        match.category === 'nba' || 
        match.category === 'wnba' ||
        match.category === 'ncaa' ||
        match.title.toLowerCase().includes('basketball') ||
        match.title.toLowerCase().includes('nba') ||
        match.title.toLowerCase().includes('wnba') ||
        match.title.toLowerCase().includes('ncaa')
      );
      
      if (basketballLive.length === 0) {
        const sampleGames = this.getSampleLiveBasketball();
        return await this.validateBasketballStreams(sampleGames);
      }
      
      // Validate streams before returning
      const validatedGames = await this.validateBasketballStreams(basketballLive);
      if (validatedGames.length > 0) {
        return validatedGames;
      }
      
      // If no validated games, fall back to sample data
      const sampleGames = this.getSampleLiveBasketball();
      return await this.validateBasketballStreams(sampleGames);
    } catch (error) {
      console.error('Error fetching live Basketball matches:', error);
      // Return sample data without validation as final fallback
      return this.getSampleLiveBasketball();
    }
  }

  // Get upcoming Basketball matches
  async getUpcomingBasketballMatches() {
    try {
      // For now, return sample upcoming games
      return this.getSampleUpcomingBasketball();
    } catch (error) {
      console.error('Error fetching upcoming Basketball matches:', error);
      return this.getSampleUpcomingBasketball();
    }
  }

  // Validate basketball streams
  async validateBasketballStreams(games) {
    const validatedGames = [];
    
    for (const game of games) {
      if (!game.sources || game.sources.length === 0) {
        continue; // Skip games without sources
      }
      
      // Check if at least one source is working
      let hasWorkingStream = false;
      const workingSources = [];
      
      for (const source of game.sources) {
        const isAvailable = await this.checkStreamAvailability(source.source, source.id);
        if (isAvailable) {
          hasWorkingStream = true;
          workingSources.push(source);
        }
      }
      
      // Only include games with working streams
      if (hasWorkingStream) {
        validatedGames.push({
          ...game,
          sources: workingSources // Only include working sources
        });
      }
    }
    
    return validatedGames;
  }

  // Get sample basketball data
  getSampleBasketballData() {
    return [
      {
        title: "Lakers vs Warriors - NBA Regular Season",
        league: "NBA",
        teams: {
          home: "Los Angeles Lakers",
          away: "Golden State Warriors"
        },
        time: "8:00 PM ET",
        status: "live",
        sources: [
          { source: 'sports1', id: 'nba-lakers-warriors-live' },
          { source: 'sports2', id: 'lakers-warriors-stream' }
        ]
      },
      {
        title: "Celtics vs Heat - NBA Eastern Conference",
        league: "NBA",
        teams: {
          home: "Boston Celtics",
          away: "Miami Heat"
        },
        time: "7:30 PM ET",
        status: "live",
        sources: [
          { source: 'sports1', id: 'nba-celtics-heat-live' }
        ]
      },
      {
        title: "Nuggets vs Suns - NBA Western Conference",
        league: "NBA",
        teams: {
          home: "Denver Nuggets",
          away: "Phoenix Suns"
        },
        time: "9:00 PM ET",
        status: "upcoming",
        sources: [
          { source: 'sports3', id: 'nba-nuggets-suns' }
        ]
      },
      {
        title: "Duke vs UNC - NCAA Basketball",
        league: "NCAA",
        teams: {
          home: "Duke Blue Devils",
          away: "UNC Tar Heels"
        },
        time: "6:00 PM ET",
        status: "upcoming",
        sources: [
          { source: 'college1', id: 'ncaa-duke-unc' }
        ]
      },
      {
        title: "Aces vs Storm - WNBA Championship",
        league: "WNBA",
        teams: {
          home: "Las Vegas Aces",
          away: "Seattle Storm"
        },
        time: "8:00 PM ET",
        status: "live",
        sources: [
          { source: 'wnba1', id: 'wnba-aces-storm-championship' }
        ]
      }
    ];
  }

  // Get sample live basketball games only
  getSampleLiveBasketball() {
    const allGames = this.getSampleBasketballData();
    return allGames.filter(game => game.status === 'live');
  }

  // Get sample upcoming basketball games
  getSampleUpcomingBasketball() {
    const allGames = this.getSampleBasketballData();
    return allGames.filter(game => game.status === 'upcoming');
  }

  // Cricket API Methods
  
  // Get all Cricket matches
  async getCricketMatches() {
    try {
      // First try to get live matches from API
      const liveResponse = await fetch(`${BASE_URL}/matches/live`);
      if (liveResponse.ok) {
        const liveMatches = await liveResponse.json();
        const cricketLive = liveMatches.filter(match => 
          match.category === 'cricket' || 
          match.category === 'ipl' || 
          match.category === 'test' ||
          match.category === 'odi' ||
          match.category === 't20' ||
          match.title.toLowerCase().includes('cricket') ||
          match.title.toLowerCase().includes('ipl') ||
          match.title.toLowerCase().includes('test') ||
          match.title.toLowerCase().includes('odi') ||
          match.title.toLowerCase().includes('t20')
        );
        
        if (cricketLive.length > 0) {
          // Validate streams before returning
          const validatedMatches = await this.validateCricketStreams(cricketLive);
          if (validatedMatches.length > 0) {
            return validatedMatches;
          }
        }
      }
      
      // Fallback to sample live data
      const sampleMatches = this.getSampleLiveCricket();
      return await this.validateCricketStreams(sampleMatches);
    } catch (error) {
      console.error('Error fetching Cricket matches:', error);
      // Return sample data without validation as fallback
      return this.getSampleLiveCricket();
    }
  }

  // Get live Cricket matches with stream validation
  async getLiveCricketMatches() {
    try {
      const response = await fetch(`${BASE_URL}/matches/live`);
      if (!response.ok) {
        const sampleMatches = this.getSampleLiveCricket();
        return await this.validateCricketStreams(sampleMatches);
      }
      const allLive = await response.json();
      // Filter for Cricket matches only using enhanced filter
      const cricketLive = allLive.filter(match => this.isCricketMatch(match));
      
      if (cricketLive.length === 0) {
        const sampleMatches = this.getSampleLiveCricket();
        return await this.validateCricketStreams(sampleMatches);
      }
      
      // Validate streams before returning
      const validatedMatches = await this.validateCricketStreams(cricketLive);
      if (validatedMatches.length > 0) {
        return validatedMatches;
      }
      
      // If no validated matches, fall back to sample data
      const sampleMatches = this.getSampleLiveCricket();
      return await this.validateCricketStreams(sampleMatches);
    } catch (error) {
      console.error('Error fetching live Cricket matches:', error);
      // Return sample data without validation as final fallback
      return this.getSampleLiveCricket();
    }
  }

  // Get upcoming Cricket matches
  async getUpcomingCricketMatches() {
    try {
      const response = await fetch(`${BASE_URL}/matches/upcoming`);
      if (response.ok) {
        const allUpcoming = await response.json();
        const cricketUpcoming = allUpcoming.filter(match => this.isCricketMatch(match));
        if (cricketUpcoming.length > 0) {
          return cricketUpcoming;
        }
      }
      // Fallback to sample upcoming matches
      return this.getSampleUpcomingCricket();
    } catch (error) {
      console.error('Error fetching upcoming Cricket matches:', error);
      return this.getSampleUpcomingCricket();
    }
  }

  // Get live Asia Cup matches specifically
  async getLiveAsiaCupMatches() {
    try {
      const response = await fetch(`${BASE_URL}/matches/live`);
      if (!response.ok) {
        const sampleMatches = this.getSampleAsiaCupData();
        return await this.validateCricketStreams(sampleMatches.filter(m => m.status === 'live'));
      }
      const allLive = await response.json();
      // Filter for Asia Cup matches specifically
      const asiaCupLive = allLive.filter(match => this.isAsiaCupMatch(match));
      
      if (asiaCupLive.length === 0) {
        const sampleMatches = this.getSampleAsiaCupData();
        return await this.validateCricketStreams(sampleMatches.filter(m => m.status === 'live'));
      }
      
      return await this.validateCricketStreams(asiaCupLive);
    } catch (error) {
      console.error('Error fetching live Asia Cup matches:', error);
      const sampleMatches = this.getSampleAsiaCupData();
      return sampleMatches.filter(m => m.status === 'live');
    }
  }

  // Get upcoming Asia Cup matches
  async getUpcomingAsiaCupMatches() {
    try {
      const response = await fetch(`${BASE_URL}/matches/upcoming`);
      if (response.ok) {
        const allUpcoming = await response.json();
        const asiaCupUpcoming = allUpcoming.filter(match => this.isAsiaCupMatch(match));
        if (asiaCupUpcoming.length > 0) {
          return asiaCupUpcoming;
        }
      }
      // Fallback to sample upcoming Asia Cup matches
      const sampleMatches = this.getSampleAsiaCupData();
      return sampleMatches.filter(m => m.status === 'upcoming');
    } catch (error) {
      console.error('Error fetching upcoming Asia Cup matches:', error);
      const sampleMatches = this.getSampleAsiaCupData();
      return sampleMatches.filter(m => m.status === 'upcoming');
    }
  }

  // Get all Asia Cup matches (live and upcoming)
  async getAllAsiaCupMatches() {
    try {
      const [liveMatches, upcomingMatches] = await Promise.all([
        this.getLiveAsiaCupMatches(),
        this.getUpcomingAsiaCupMatches()
      ]);
      
      return [...liveMatches, ...upcomingMatches];
    } catch (error) {
      console.error('Error fetching all Asia Cup matches:', error);
      return this.getSampleAsiaCupData();
    }
  }

  // Get cricket matches by tournament/series
  async getCricketMatchesByTournament(tournament) {
    try {
      const response = await fetch(`${BASE_URL}/matches/all`);
      if (!response.ok) {
        return this.getSampleCricketData().filter(match => 
          match.series?.toLowerCase().includes(tournament.toLowerCase()) ||
          match.tournament?.toLowerCase().includes(tournament.toLowerCase())
        );
      }
      
      const allMatches = await response.json();
      const tournamentMatches = allMatches.filter(match => 
        this.isCricketMatch(match) && (
          match.series?.toLowerCase().includes(tournament.toLowerCase()) ||
          match.tournament?.toLowerCase().includes(tournament.toLowerCase()) ||
          match.title.toLowerCase().includes(tournament.toLowerCase())
        )
      );
      
      return tournamentMatches;
    } catch (error) {
      console.error(`Error fetching ${tournament} matches:`, error);
      return [];
    }
  }

  // Validate cricket streams
  async validateCricketStreams(matches) {
    const validatedMatches = [];
    
    for (const match of matches) {
      if (!match.sources || match.sources.length === 0) {
        continue; // Skip matches without sources
      }
      
      // Check if at least one source is working
      let hasWorkingStream = false;
      const workingSources = [];
      
      for (const source of match.sources) {
        const isAvailable = await this.checkStreamAvailability(source.source, source.id);
        if (isAvailable) {
          hasWorkingStream = true;
          workingSources.push(source);
        }
      }
      
      // Only include matches with working streams
      if (hasWorkingStream) {
        validatedMatches.push({
          ...match,
          sources: workingSources // Only include working sources
        });
      }
    }
    
    return validatedMatches;
  }

  // Get sample cricket data with time information
  getSampleCricketData() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    
    return [
      {
        title: "India vs Australia - 1st Test",
        series: "Border-Gavaskar Trophy 2024",
        format: "Test",
        venue: "Adelaide Oval, Australia",
        teams: {
          team1: "India",
          team2: "Australia"
        },
        score: {
          home: "245/4 (85.2 overs)",
          away: "180 all out"
        },
        time: now.toISOString(),
        status: "live",
        sources: [
          { source: 'cricket1', id: 'ind-vs-aus-test1-live' },
          { source: 'sports1', id: 'india-australia-test-adelaide' }
        ]
      },
      {
        title: "England vs Pakistan - 2nd ODI",
        series: "Pakistan tour of England 2024",
        format: "ODI",
        venue: "Lord's, London",
        teams: {
          team1: "England",
          team2: "Pakistan"
        },
        score: {
          home: "287/8 (50 overs)",
          away: "156/3 (28.4 overs)"
        },
        time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        status: "live",
        sources: [
          { source: 'cricket2', id: 'eng-vs-pak-odi2-live' }
        ]
      },
      {
        title: "Mumbai Indians vs Chennai Super Kings - IPL Final",
        series: "Indian Premier League 2024",
        format: "T20",
        venue: "Wankhede Stadium, Mumbai",
        teams: {
          team1: "Mumbai Indians",
          team2: "Chennai Super Kings"
        },
        time: tomorrow.setHours(19, 30, 0, 0), // Tomorrow 7:30 PM
        status: "upcoming",
        sources: [
          { source: 'ipl1', id: 'mi-vs-csk-final' },
          { source: 'cricket3', id: 'ipl-final-2024' }
        ]
      },
      {
        title: "South Africa vs New Zealand - T20I Series",
        series: "New Zealand tour of South Africa 2024",
        format: "T20I",
        venue: "Centurion, South Africa",
        teams: {
          team1: "South Africa",
          team2: "New Zealand"
        },
        time: dayAfter.setHours(16, 0, 0, 0), // Day after tomorrow 4:00 PM
        status: "upcoming",
        sources: [
          { source: 'cricket4', id: 'sa-vs-nz-t20i' }
        ]
      },
      {
        title: "Bangladesh vs Sri Lanka - Asia Cup",
        series: "Asia Cup 2024",
        format: "ODI",
        venue: "R.Premadasa Stadium, Colombo",
        teams: {
          team1: "Bangladesh",
          team2: "Sri Lanka"
        },
        score: {
          home: "278/9 (50 overs)",
          away: "234/7 (45.2 overs)"
        },
        time: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        status: "live",
        sources: [
          { source: 'cricket5', id: 'ban-vs-sl-asia-cup' }
        ]
      }
    ];
  }

  // Get sample live cricket matches only
  getSampleLiveCricket() {
    const allMatches = this.getSampleCricketData();
    return allMatches.filter(match => match.status === 'live');
  }

  // Get sample upcoming cricket matches
  getSampleUpcomingCricket() {
    const allMatches = this.getSampleCricketData();
    return allMatches.filter(match => match.status === 'upcoming');
  }

  // Get sample Asia Cup data specifically
  getSampleAsiaCupData() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return [
      {
        id: 'asia-cup-1',
        title: "India vs Pakistan - Asia Cup 2024 Super 4",
        series: "Asia Cup 2024",
        tournament: "Asia Cup",
        format: "ODI",
        venue: "R.Premadasa Stadium, Colombo",
        teams: {
          team1: "India",
          team2: "Pakistan",
          home: "India",
          away: "Pakistan"
        },
        score: {
          home: "348/8 (50 overs)",
          away: "128/4 (25.3 overs)"
        },
        time: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        status: "live",
        category: "asia cup",
        weather: {
          condition: 'Partly Cloudy',
          temperature: '28°C',
          humidity: '78%'
        },
        sources: [
          { 
            source: 'cricket1', 
            id: 'ind-vs-pak-asia-cup-live',
            quality: 'HD 1080p',
            language: 'English'
          },
          { 
            source: 'sports2', 
            id: 'asia-cup-ind-pak-super4',
            quality: 'HD 720p',
            language: 'Hindi'
          }
        ]
      },
      {
        id: 'asia-cup-2',
        title: "Sri Lanka vs Bangladesh - Asia Cup 2024 Super 4",
        series: "Asia Cup 2024",
        tournament: "Asia Cup",
        format: "ODI",
        venue: "Galle International Stadium, Sri Lanka",
        teams: {
          team1: "Sri Lanka",
          team2: "Bangladesh",
          home: "Sri Lanka",
          away: "Bangladesh"
        },
        score: {
          home: "275/9 (50 overs)",
          away: "198/6 (35.2 overs)"
        },
        time: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        status: "live",
        category: "asia cup",
        weather: {
          condition: 'Sunny',
          temperature: '31°C',
          humidity: '65%'
        },
        sources: [
          { 
            source: 'cricket3', 
            id: 'sl-vs-ban-asia-cup-live',
            quality: 'HD 1080p',
            language: 'English'
          }
        ]
      },
      {
        id: 'asia-cup-3',
        title: "Afghanistan vs Nepal - Asia Cup 2024 Group A",
        series: "Asia Cup 2024",
        tournament: "Asia Cup",
        format: "ODI",
        venue: "Mulpani Cricket Ground, Kathmandu",
        teams: {
          team1: "Afghanistan",
          team2: "Nepal",
          home: "Afghanistan",
          away: "Nepal"
        },
        time: tomorrow.setHours(14, 30, 0, 0), // Tomorrow 2:30 PM
        status: "upcoming",
        category: "asia cup",
        weather: {
          condition: 'Clear',
          temperature: '25°C',
          humidity: '45%'
        },
        sources: [
          { 
            source: 'cricket4', 
            id: 'afg-vs-nep-asia-cup',
            quality: 'HD 720p',
            language: 'English'
          }
        ]
      },
      {
        id: 'asia-cup-4',
        title: "India vs Sri Lanka - Asia Cup 2024 Final",
        series: "Asia Cup 2024",
        tournament: "Asia Cup",
        format: "ODI",
        venue: "R.Premadasa Stadium, Colombo",
        teams: {
          team1: "India",
          team2: "Sri Lanka",
          home: "India",
          away: "Sri Lanka"
        },
        time: dayAfter.setHours(19, 30, 0, 0), // Day after tomorrow 7:30 PM
        status: "upcoming",
        category: "asia cup",
        weather: {
          condition: 'Partly Cloudy',
          temperature: '29°C',
          humidity: '70%'
        },
        sources: [
          { 
            source: 'cricket1', 
            id: 'ind-vs-sl-asia-cup-final',
            quality: 'HD 1080p',
            language: 'English'
          },
          { 
            source: 'sports1', 
            id: 'asia-cup-final-2024',
            quality: 'HD 1080p',
            language: 'Hindi'
          }
        ]
      },
      {
        id: 'asia-cup-5',
        title: "Pakistan vs Bangladesh - Asia Cup 2024 3rd Place Playoff",
        series: "Asia Cup 2024",
        tournament: "Asia Cup",
        format: "ODI",
        venue: "Galle International Stadium, Sri Lanka",
        teams: {
          team1: "Pakistan",
          team2: "Bangladesh",
          home: "Pakistan",
          away: "Bangladesh"
        },
        time: nextWeek.setHours(14, 0, 0, 0), // Next week 2:00 PM
        status: "upcoming",
        category: "asia cup",
        weather: {
          condition: 'Sunny',
          temperature: '32°C',
          humidity: '60%'
        },
        sources: [
          { 
            source: 'cricket5', 
            id: 'pak-vs-ban-asia-cup-playoff',
            quality: 'HD 720p',
            language: 'English'
          }
        ]
      }
    ];
  }

  // Get sample live Asia Cup matches only
  getSampleLiveAsiaCup() {
    const allMatches = this.getSampleAsiaCupData();
    return allMatches.filter(match => match.status === 'live');
  }

  // Get sample upcoming Asia Cup matches
  getSampleUpcomingAsiaCup() {
    const allMatches = this.getSampleAsiaCupData();
    return allMatches.filter(match => match.status === 'upcoming');
  }

  // Get all available sports
  async getSports() {
    try {
      const response = await fetch(`${BASE_URL}/sports`);
      if (!response.ok) {
        throw new Error('Failed to fetch sports');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching sports:', error);
      return [];
    }
  }

  // Get image URL for team badges or event posters
  getImageUrl(imagePath) {
    if (!imagePath) return null;
    return `https://api.naveenraj30.me/api/images/${imagePath}`;
  }

  // Format date for display
  formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
  }

  // Check if match is live (within 4 hours of start time)
  isMatchLive(timestamp) {
    const now = Date.now();
    const matchTime = timestamp;
    const fourHours = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
    
    return (now >= matchTime - fourHours) && (now <= matchTime + fourHours);
  }
}

const streamedAPI = new StreamedAPI();
export default streamedAPI;
