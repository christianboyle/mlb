export const AL_CENTRAL_TEAMS = [
  {
    name: 'Minnesota Twins',
    teamId: '9',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/min.png',
    color: '002B5C'
  },
  {
    name: 'Detroit Tigers',
    teamId: '6',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/det.png',
    color: '0C2340'
  },
  {
    name: 'Cleveland Guardians',
    teamId: '5',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/cle.png',
    color: 'E31937'
  },
  {
    name: 'Chicago White Sox',
    teamId: '4',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
    color: '000000'
  },
  {
    name: 'Kansas City Royals',
    teamId: '7',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/kc.png',
    color: '004687'
  }
];

export const CURRENT_SEASON = 2024;
export const DISPLAY_YEAR = 2025;

export async function getScores(teamId, season) {
  try {
    // Fetch spring training games
    const springRes = await fetch(
      `/api/apis/site/v2/sports/baseball/mlb/teams/${teamId}/schedule?season=${season}&seasontype=1`
    );
    const springData = await springRes.json();

    // Fetch regular season games
    const regularRes = await fetch(
      `/api/apis/site/v2/sports/baseball/mlb/teams/${teamId}/schedule?season=${season}&seasontype=2`
    );
    const regularData = await regularRes.json();

    // Fetch postseason games
    const postRes = await fetch(
      `/api/apis/site/v2/sports/baseball/mlb/teams/${teamId}/schedule?season=${season}&seasontype=3`
    );
    const postData = await postRes.json();

    // Debug logging
    console.log('Spring Training games:', springData.events?.length || 0);
    console.log('Regular Season games:', regularData.events?.length || 0);
    
    // Group games by date to identify double-headers
    const gamesByDate = {};
    regularData.events?.forEach(e => {
      const date = new Date(e.date).toLocaleDateString();
      if (!gamesByDate[date]) {
        gamesByDate[date] = [];
      }
      gamesByDate[date].push(e.id);
    });

    // Log any dates with multiple games
    console.log('Dates with multiple games:', 
      Object.entries(gamesByDate)
        .filter(([date, games]) => games.length > 1)
    );

    console.log('Postseason games:', postData.events?.length || 0);
    console.log('Total before deduplication:', 
      (springData.events?.length || 0) + 
      (regularData.events?.length || 0) + 
      (postData.events?.length || 0)
    );

    // Transform the data to match our needs
    const transformedData = {
      events: [
        // Spring Training games
        ...(springData.events?.map(event => ({
          id: event.id,
          name: event.name,
          date: new Date(event.date),
          status: event.status?.type?.name,
          isPostseason: false,
          isSpringTraining: true,
          competitions: event.competitions?.map(comp => ({
            competitors: comp.competitors?.map(team => ({
              score: team.score?.displayValue || '-',
              winner: team.winner,
              homeAway: team.homeAway,
              team: {
                name: team.team?.displayName || team.team?.name,
                logo: team.team?.logo || `https://a.espncdn.com/i/teamlogos/mlb/500/${team.team?.abbreviation?.toLowerCase()}.png`,
                id: team.team?.id
              }
            }))
          }))?.[0]
        })) || []),
        // Regular Season games
        ...(regularData.events?.map(event => ({
          id: event.id,
          name: event.name,
          date: new Date(event.date),
          status: event.status?.type?.name,
          isPostseason: false,
          isSpringTraining: false,
          isDoubleHeader: gamesByDate[new Date(event.date).toLocaleDateString()].length > 1,
          competitions: event.competitions?.map(comp => ({
            competitors: comp.competitors?.map(team => ({
              score: team.score?.displayValue || '-',
              winner: team.winner,
              homeAway: team.homeAway,
              team: {
                name: team.team?.displayName || team.team?.name,
                logo: team.team?.logo || `https://a.espncdn.com/i/teamlogos/mlb/500/${team.team?.abbreviation?.toLowerCase()}.png`,
                id: team.team?.id
              }
            }))
          }))?.[0]
        })) || []),
        // Postseason games
        ...(postData.events?.map(event => ({
          id: event.id,
          name: event.name,
          date: new Date(event.date),
          status: event.status?.type?.name,
          isPostseason: true,
          isSpringTraining: false,
          competitions: event.competitions?.map(comp => ({
            competitors: comp.competitors?.map(team => ({
              score: team.score?.displayValue || '-',
              winner: team.winner,
              homeAway: team.homeAway,
              team: {
                name: team.team?.displayName || team.team?.name,
                logo: team.team?.logo || `https://a.espncdn.com/i/teamlogos/mlb/500/${team.team?.abbreviation?.toLowerCase()}.png`,
                id: team.team?.id
              }
            }))
          }))?.[0]
        })) || [])
      ]
        // Remove duplicates based on event ID
        .filter((event, index, self) => 
          index === self.findIndex((e) => e.id === event.id)
        )
        .sort((a, b) => b.date - a.date)
    };

    // Debug logging after deduplication
    console.log('Total after deduplication:', transformedData.events.length);
    console.log('Games by type:', {
      spring: transformedData.events.filter(e => e.isSpringTraining).length,
      regular: transformedData.events.filter(e => !e.isSpringTraining && !e.isPostseason).length,
      post: transformedData.events.filter(e => e.isPostseason).length
    });

    return transformedData;
  } catch (error) {
    console.error('Error fetching scores:', error);
    throw new Error('Failed to fetch scores');
  }
}

export async function getTeamRecord(teamId, season) {
  try {
    // Get all division standings to determine position
    const standings = await getDivisionStandings(season);
    const teamStanding = standings.find(team => team.id === teamId);

    return {
      record: teamStanding?.record || '0-0',
      standing: teamStanding?.standingSummary || 'AL Central'
    };
  } catch (error) {
    console.error('Error fetching team record:', error);
    return {
      record: '0-0',
      standing: 'AL Central'
    };
  }
}

export async function getDivisionStandings(season) {
  try {
    // Fetch each team's data to get their standings
    const teamPromises = AL_CENTRAL_TEAMS.map(async (team) => {
      // Fetch regular season games for record
      const scheduleRes = await fetch(
        `/api/apis/site/v2/sports/baseball/mlb/teams/${team.teamId}/schedule?season=${season}&seasontype=2`
      );
      const scheduleData = await scheduleRes.json();
      
      // Calculate record from regular season games
      let wins = 0;
      let losses = 0;
      scheduleData.events?.forEach(event => {
        const teamInGame = event.competitions?.[0]?.competitors?.find(c => c.team.id === team.teamId);
        if (teamInGame?.winner) wins++;
        else if (teamInGame?.winner === false) losses++;
      });

      return {
        id: team.teamId,
        name: team.name,
        logo: team.logo,
        color: team.color,
        wins,
        losses,
        record: `${wins}-${losses}`,
        winPct: wins / (wins + losses) || 0
      };
    });

    const teams = await Promise.all(teamPromises);
    
    // Sort by win percentage
    const sortedTeams = teams.sort((a, b) => b.winPct - a.winPct);
    
    // Add position and standing summary
    return sortedTeams.map((team, index) => {
      const position = index + 1;
      const suffix = position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th';
      return {
        ...team,
        standingSummary: `${position}${suffix} in AL Cent`
      };
    });
  } catch (error) {
    console.error('Error fetching division standings:', error);
    return [];
  }
}

export async function getSchedule(teamId, season) {
  try {
    // Fetch spring training games
    const springRes = await fetch(
      `/api/apis/site/v2/sports/baseball/mlb/teams/${teamId}/schedule?season=${season}&seasontype=1`
    );
    const springData = await springRes.json();

    // Fetch regular season games
    const regularRes = await fetch(
      `/api/apis/site/v2/sports/baseball/mlb/teams/${teamId}/schedule?season=${season}&seasontype=2`
    );
    const regularData = await regularRes.json();

    // Fetch postseason games
    const postRes = await fetch(
      `/api/apis/site/v2/sports/baseball/mlb/teams/${teamId}/schedule?season=${season}&seasontype=3`
    );
    const postData = await postRes.json();

    return {
      events: [
        // Spring Training games
        ...(springData.events?.map(event => ({
          id: event.id,
          date: new Date(event.date),
          name: event.name,
          shortName: event.shortName,
          isSpringTraining: true,
          competitions: event.competitions?.map(comp => ({
            competitors: comp.competitors?.map(team => ({
              homeAway: team.homeAway,
              team: {
                name: team.team?.displayName || team.team?.name,
                logo: team.team?.logo || `https://a.espncdn.com/i/teamlogos/mlb/500/${team.team?.abbreviation?.toLowerCase()}.png`,
                id: team.team?.id
              }
            }))
          }))?.[0]
        })) || []),
        // Regular Season games
        ...(regularData.events?.map(event => ({
          id: event.id,
          date: new Date(event.date),
          name: event.name,
          shortName: event.shortName,
          isSpringTraining: false,
          competitions: event.competitions?.map(comp => ({
            competitors: comp.competitors?.map(team => ({
              homeAway: team.homeAway,
              team: {
                name: team.team?.displayName || team.team?.name,
                logo: team.team?.logo || `https://a.espncdn.com/i/teamlogos/mlb/500/${team.team?.abbreviation?.toLowerCase()}.png`,
                id: team.team?.id
              }
            }))
          }))?.[0]
        })) || []),
        // Postseason games
        ...(postData.events?.map(event => ({
          id: event.id,
          date: new Date(event.date),
          name: event.name,
          shortName: event.shortName,
          isSpringTraining: false,
          competitions: event.competitions?.map(comp => ({
            competitors: comp.competitors?.map(team => ({
              homeAway: team.homeAway,
              team: {
                name: team.team?.displayName || team.team?.name,
                logo: team.team?.logo || `https://a.espncdn.com/i/teamlogos/mlb/500/${team.team?.abbreviation?.toLowerCase()}.png`,
                id: team.team?.id
              }
            }))
          }))?.[0]
        })) || [])
      ]
        // Remove duplicates based on event ID
        .filter((event, index, self) => 
          index === self.findIndex((e) => e.id === event.id)
        )
        // Sort by date
        .sort((a, b) => a.date - b.date)
    };
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return { events: [] };
  }
} 