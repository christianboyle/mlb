// Constants
const DEFAULT_LOGO = 'https://a.espncdn.com/i/teamlogos/mlb/500/default-team-logo.png';
const VALID_TEAM_IDS = ['4', '5', '6', '7', '9'];
export const AL_CENTRAL_TEAMS = [
  {
    id: '7',
    displayName: 'Kansas City Royals',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/kc.png',
    color: '004687'
  },
  {
    id: '9',
    displayName: 'Minnesota Twins',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/min.png',
    color: '002B5C'
  },
  {
    id: '5',
    displayName: 'Cleveland Guardians',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/cle.png',
    color: 'E31937'
  },
  {
    id: '6',
    displayName: 'Detroit Tigers',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/det.png',
    color: '0C2340'
  },
  {
    id: '4',
    displayName: 'Chicago White Sox',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
    color: '000000'
  }
];
export const CURRENT_SEASON = 2024;
export const DISPLAY_YEAR = 2025;
const AVAILABLE_SEASONS = [2024, 2023, 2022, 2021, 2020];
const DEBUG = false;  // Easy toggle for debug mode

// Types
export type TeamBasicInfo = {
  id: string;
  displayName: string;
  logo: string;
  color: string;
};

interface ESPNCompetitor {
  id: string;
  homeAway: 'home' | 'away';
  score?: string;
  winner: boolean;
  team: {
    id: string;
    displayName: string;
    abbreviation: string;
    logos?: Array<{ href: string }>;
  };
}

interface ESPNGame {
  id: string;
  date: string;
  competitions: Array<{
    competitors: ESPNCompetitor[];
  }>;
}

interface CompetitorData {
  team: {
    displayName: string;
    id: string;
    logo?: string;
  };
  curatedRank: {
    current: number;
  };
  score: string;
  winner: boolean;
  records?: Array<{
    summary: string;
  }>;
}

// Type for historical records
type Season = 2020 | 2021 | 2022 | 2023 | 2024 | 2025;
type TeamRecord = { record: string; standing: string };
type SeasonRecords = Record<string, TeamRecord>; // '4' | '5' | '6' | '7' | '9'

const historicalRecords: Record<Season, SeasonRecords> = {
  2020: {
    '4': { record: '35-25', standing: '3rd in AL Central' },
    '5': { record: '35-25', standing: '2nd in AL Central' },
    '6': { record: '23-35', standing: '5th in AL Central' },
    '7': { record: '26-34', standing: '4th in AL Central' },
    '9': { record: '36-24', standing: '1st in AL Central' },
  },
  2021: {
    '4': { record: '93-69', standing: '1st in AL Central' },
    '5': { record: '80-82', standing: '2nd in AL Central' },
    '6': { record: '77-85', standing: '3rd in AL Central' },
    '7': { record: '74-88', standing: '4th in AL Central' },
    '9': { record: '73-89', standing: '5th in AL Central' },
  },
  2022: {
    '4': { record: '81-81', standing: '2nd in AL Central' },
    '5': { record: '92-70', standing: '1st in AL Central' },
    '6': { record: '66-96', standing: '4th in AL Central' },
    '7': { record: '65-97', standing: '5th in AL Central' },
    '9': { record: '78-84', standing: '3rd in AL Central' },
  },
  2023: {
    '4': { record: '61-101', standing: '4th in AL Central' },
    '5': { record: '76-86', standing: '3rd in AL Central' },
    '6': { record: '78-84', standing: '2nd in AL Central' },
    '7': { record: '56-106', standing: '5th in AL Central' },
    '9': { record: '87-75', standing: '1st in AL Central' },
  },
  2024: {
    '4': { record: '41-121', standing: '5th in AL Central' },
    '5': { record: '92-69', standing: '1st in AL Central' },
    '6': { record: '86-76', standing: '3rd in AL Central' },
    '7': { record: '86-76', standing: '2nd in AL Central' },
    '9': { record: '82-80', standing: '4th in AL Central' },
  },
  2025: {
    '4': { record: '0-0', standing: 'AL Central' },
    '5': { record: '0-0', standing: 'AL Central' },
    '6': { record: '0-0', standing: 'AL Central' },
    '7': { record: '0-0', standing: 'AL Central' },
    '9': { record: '0-0', standing: 'AL Central' },
  }
} as const;

// Type for standings
interface StandingsEntry {
  name: string;
  teamId: string;
  logo: string;
  color: string;
  conferenceWinLoss: string;
  gamesBack: string;
  overallWinLoss: string;
}

// Add these interfaces near the top with other types
export interface Game {
  id: string;
  date: string;
  name: string;
  teamId: string;
  logo: string;
  color: string;
  homeScore: string | null;
  awayScore: string | null;
  winner: boolean | null;
  isPostseason: boolean;
  isHome: boolean;
  formattedDate: string;
  isFutureGame: boolean;
  status?: string;  // Add status field for postponed games
  isSpringTraining: boolean;
  promotions?: Promotion[];
}

interface TeamData {
  id: string;
  name: string;
  logo: string;
  color: string;
  record: string;
  standing: string;
  games: Game[];
}

// Update the standings type to include all years
const standings: Partial<Record<Season, StandingsEntry[]>> = {
  2023: [
    {
      name: 'Minnesota Twins',
      teamId: '9',
      logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/min.png',
      color: '002B5C',
      conferenceWinLoss: '47-29',
      gamesBack: '-',
      overallWinLoss: '87-75'
    },
    {
      name: 'Detroit Tigers',
      teamId: '6',
      logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/det.png',
      color: '0C2340',
      conferenceWinLoss: '34-42',
      gamesBack: '13.0',
      overallWinLoss: '78-84'
    },
    {
      name: 'Cleveland Guardians',
      teamId: '5',
      logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/cle.png',
      color: 'E31937',
      conferenceWinLoss: '39-37',
      gamesBack: '14.0',
      overallWinLoss: '76-86'
    },
    {
      name: 'Chicago White Sox',
      teamId: '4',
      logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
      color: '000000',
      conferenceWinLoss: '30-46',
      gamesBack: '21.0',
      overallWinLoss: '61-101'
    },
    {
      name: 'Kansas City Royals',
      teamId: '7',
      logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/kc.png',
      color: '004687',
      conferenceWinLoss: '30-46',
      gamesBack: '22.0',
      overallWinLoss: '56-106'
    }
  ],
  2024: [
    {
      name: 'Cleveland Guardians',
      teamId: '5',
      logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/cle.png',
      color: 'E31937',
      conferenceWinLoss: '50-30',
      gamesBack: '-',
      overallWinLoss: '92-69'
    },
    {
      name: 'Kansas City Royals',
      teamId: '7',
      logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/kc.png',
      color: '004687',
      conferenceWinLoss: '45-36',
      gamesBack: '6.5',
      overallWinLoss: '86-76'
    },
    {
      name: 'Detroit Tigers',
      teamId: '6',
      logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/det.png',
      color: '0C2340',
      conferenceWinLoss: '43-38',
      gamesBack: '6.5',
      overallWinLoss: '86-76'
    },
    {
      name: 'Minnesota Twins',
      teamId: '9',
      logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/min.png',
      color: '002B5C',
      conferenceWinLoss: '43-38',
      gamesBack: '10.5',
      overallWinLoss: '82-80'
    },
    {
      name: 'Chicago White Sox',
      teamId: '4',
      logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
      color: '000000',
      conferenceWinLoss: '23-58',
      gamesBack: '51.5',
      overallWinLoss: '41-121'
    }
  ],
  2025: [
    {
      name: 'Minnesota Twins',
      teamId: '9',
      logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/min.png',
      color: '002B5C',
      conferenceWinLoss: '-',
      gamesBack: '-',
      overallWinLoss: '0-0'
    },
    {
      name: 'Cleveland Guardians',
      teamId: '5',
      logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/cle.png',
      color: 'E31937',
      conferenceWinLoss: '-',
      gamesBack: '-',
      overallWinLoss: '0-0'
    },
    {
      name: 'Detroit Tigers',
      teamId: '6',
      logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/det.png',
      color: '0C2340',
      conferenceWinLoss: '-',
      gamesBack: '-',
      overallWinLoss: '0-0'
    },
    {
      name: 'Kansas City Royals',
      teamId: '7',
      logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/kc.png',
      color: '004687',
      conferenceWinLoss: '-',
      gamesBack: '-',
      overallWinLoss: '0-0'
    },
    {
      name: 'Chicago White Sox',
      teamId: '4',
      logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
      color: '000000',
      conferenceWinLoss: '-',
      gamesBack: '-',
      overallWinLoss: '0-0'
    }
  ]
} as const;

// Fix the team colors type
const teamColors: Record<string, string> = {
  'Chicago White Sox': '000000',
  'Cleveland Guardians': 'E31937',
  'Detroit Tigers': '0C2340',
  'Kansas City Royals': '004687',
  'Minnesota Twins': '002B5C'
} as const;

// Helper function to get default team data
function getDefaultTeam(): TeamData {
  return {
    id: '7',
    name: 'Kansas City Royals',
    logo: AL_CENTRAL_TEAMS[0].logo,
    color: AL_CENTRAL_TEAMS[0].color,
    record: '0-0',
    standing: 'AL Central',
    games: [],
  };
}

// API functions
export async function getTeamData(teamId: string, season: Season = CURRENT_SEASON): Promise<TeamData> {
  try {
    // Use the selected season for scores, not just CURRENT_SEASON
    const todaySchedule = await getTodaySchedule(season, teamId, false);
    const todayGames = todaySchedule?.events || [];

    // Get the historical record for the requested season
    let record = '0-0';
    let standing = 'AL Central';
    
    if (historicalRecords[season]?.[teamId]) {
      record = historicalRecords[season][teamId].record;
      standing = historicalRecords[season][teamId].standing;
    } else {
      // Fetch team standings for current season
      const standingsUrl = `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb`;
      const standingsRes = await fetch(standingsUrl, { next: { revalidate: 3600 } });
      const standingsData = await standingsRes.json();
      record = standingsData.team?.record?.items?.[0]?.summary || '0-0';
      standing = standingsData.team?.standingSummary || 'AL Central';
    }

    const team = AL_CENTRAL_TEAMS.find(t => t.id === teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    return {
      id: teamId,
      name: team.displayName,
      logo: team.logo,
      color: team.color,
      record,
      standing,
      games: todayGames as Game[]
    };
  } catch (error) {
    console.error('Error in getTeamData:', error);
    return getDefaultTeam();
  }
}

// Add division mappings
const DIVISION_MAPPINGS = {
  // AL Central
  '4': { name: 'AL Central', teams: ['4', '5', '6', '7', '9'] }, // CHW
  '5': { name: 'AL Central', teams: ['4', '5', '6', '7', '9'] }, // CLE
  '6': { name: 'AL Central', teams: ['4', '5', '6', '7', '9'] }, // DET
  '7': { name: 'AL Central', teams: ['4', '5', '6', '7', '9'] }, // KC
  '9': { name: 'AL Central', teams: ['4', '5', '6', '7', '9'] }, // MIN
  // Add other divisions as needed
};

// Add VALID_SEASONS near the top with other constants
const VALID_SEASONS: Season[] = [2020, 2021, 2022, 2023, 2024, 2025];

// Update generateStandings function to fix isFutureYear scope
function generateStandings(year: Season, records: Record<Season, SeasonRecords>): StandingsEntry[] {
  const teams = AL_CENTRAL_TEAMS.map(team => {
    const teamRecord = records[year][team.id];
    const isCurrentYear = year === CURRENT_SEASON;
    const isFutureYear = year > CURRENT_SEASON;

    return {
      name: team.displayName,
      teamId: team.id,
      logo: team.logo,
      color: team.color,
      conferenceWinLoss: isFutureYear ? '-' : '-',
      gamesBack: isFutureYear ? '-' : '-',
      overallWinLoss: isFutureYear ? '0-0' : teamRecord.record
    };
  });

  const isFutureYear = year > CURRENT_SEASON;

  // Sort teams by winning percentage for the year
  if (!isFutureYear) {
    teams.sort((a, b) => {
      const aRecord = a.overallWinLoss.split('-').map(Number);
      const bRecord = b.overallWinLoss.split('-').map(Number);
      
      const aWinPct = aRecord[0] / (aRecord[0] + aRecord[1]);
      const bWinPct = bRecord[0] / (bRecord[0] + bRecord[1]);
      
      return bWinPct - aWinPct;
    });

    // Calculate games back
    const leaderWins = teams[0].overallWinLoss.split('-').map(Number);
    const leaderPct = leaderWins[0] / (leaderWins[0] + leaderWins[1]);

    teams.forEach((team, index) => {
      if (index === 0) {
        team.gamesBack = '-';
      } else {
        const teamWins = team.overallWinLoss.split('-').map(Number);
        const teamPct = teamWins[0] / (teamWins[0] + teamWins[1]);
        const gamesBehind = ((leaderPct - teamPct) * 162).toFixed(1);
        team.gamesBack = gamesBehind;
      }
    });
  }

  return teams;
}

// Update getFallbackStandings with proper typing
function getFallbackStandings(year: Season = 2025): StandingsEntry[] {
  const standings = VALID_SEASONS.reduce((acc, season) => {
    acc[season] = generateStandings(season, historicalRecords);
    return acc;
  }, {} as Record<Season, StandingsEntry[]>);

  return standings[year] ?? standings[CURRENT_SEASON];
}

// Update getConferenceRankings to handle all years
export async function getConferenceRankings(teamId: string = '7', year: Season = 2024) {
  try {
    // In the future, we could fetch real-time data for the current season
    if (year === CURRENT_SEASON) {
      // Attempt to fetch current standings
      // If that fails, fall back to generated standings
    }
    
    return getFallbackStandings(year);
  } catch (error) {
    console.error('Error fetching conference rankings:', error);
    return getFallbackStandings(year);
  }
}

// Add these function declarations outside of getTodaySchedule
function isValidGame(game: any): game is Game {
  return (
    typeof game === 'object' &&
    typeof game.id === 'string' &&
    typeof game.date === 'string' &&
    typeof game.name === 'string' &&
    typeof game.teamId === 'string' &&
    typeof game.logo === 'string' &&
    typeof game.color === 'string' &&
    (game.homeScore === null || typeof game.homeScore === 'string') &&
    (game.awayScore === null || typeof game.awayScore === 'string') &&
    (game.winner === null || typeof game.winner === 'boolean') &&
    typeof game.isPostseason === 'boolean' &&
    typeof game.isHome === 'boolean' &&
    typeof game.formattedDate === 'string' &&
    typeof game.isFutureGame === 'boolean' &&
    (game.promotions === undefined || 
      (Array.isArray(game.promotions) && 
        game.promotions.every((p: any) => 
          typeof p.description === 'string' && 
          typeof p.name === 'string'
        )
      )
    )
  );
}

// Update the formatGames function signature to include year parameter
function formatGames(events: ESPNGame[] = [], teamId: string, year: number = CURRENT_SEASON): Game[] {
  if (!Array.isArray(events)) {
    console.error('Events is not an array:', events);
    return [];
  }

  return events
    .map(event => {
      try {
        if (!event?.competitions?.[0]) {
          console.error('Invalid event structure:', event);
          return null;
        }

        const competition = event.competitions[0];
        const homeTeam = competition.competitors?.find(team => team?.homeAway === 'home');
        const awayTeam = competition.competitors?.find(team => team?.homeAway === 'away');

        if (!homeTeam || !awayTeam) {
          console.error('Missing team data:', competition);
          return null;
        }

        console.log('Raw scores before processing:', {
          homeTeamScore: homeTeam.score,
          awayTeamScore: awayTeam.score,
          homeTeamRaw: homeTeam,
          awayTeamRaw: awayTeam
        });

        const selectedTeamIsHome = homeTeam.id === teamId;
        const opponent = selectedTeamIsHome ? awayTeam : homeTeam;
        
        const teamAbbrev = opponent.team?.abbreviation?.toLowerCase() || '';
        const logoUrl = teamAbbrev ? 
          `https://a.espncdn.com/i/teamlogos/mlb/500/${teamAbbrev}.png` : 
          DEFAULT_LOGO;

        const alCentralTeam = AL_CENTRAL_TEAMS.find(
          team => team.id === opponent.team?.id
        );

        const gameDate = new Date(event.date);
        const formattedDate = gameDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'America/Chicago'
        });
        
        const isCurrentYear = year === CURRENT_SEASON;
        const isFutureGame = new Date(event.date) > new Date();

        // Add more detailed logging
        console.log('Raw competition data:', competition);
        console.log('Raw home team:', homeTeam);
        console.log('Raw away team:', awayTeam);

        // Handle undefined scores
        const homeScoreStr = !isFutureGame && homeTeam.score !== undefined 
          ? String(homeTeam.score) 
          : null;
        const awayScoreStr = !isFutureGame && awayTeam.score !== undefined 
          ? String(awayTeam.score) 
          : null;

        console.log('Processed scores:', { 
          homeScoreStr, 
          awayScoreStr,
          isFutureGame,
          rawHomeScore: homeTeam.score,
          rawAwayScore: awayTeam.score
        });
        
        return {
          id: event.id,
          date: event.date,
          name: opponent.team?.displayName || 'Unknown Team',
          teamId: opponent.team?.id,
          logo: logoUrl,
          color: alCentralTeam?.color || '1D428A',
          homeScore: homeScoreStr,
          awayScore: awayScoreStr,
          winner: isFutureGame ? null : opponent.winner,
          isPostseason: false,
          isHome: selectedTeamIsHome,
          formattedDate,
          isFutureGame
        };
      } catch (error) {
        console.error('Error formatting game:', error);
        return null;
      }
    })
    .filter((game): game is Game => game !== null && isValidGame(game));
}

// Add team abbreviation mapping
const TEAM_ABBREVIATIONS: Record<string, string> = {
  '4': 'chw', // Chicago White Sox
  '5': 'cle', // Cleveland Guardians
  '6': 'det', // Detroit Tigers
  '7': 'kc',  // Kansas City Royals
  '9': 'min'  // Minnesota Twins
};

// Add a simple debug utility
function debug(area: string, message: string, data?: any) {
  if (!DEBUG) return;
  
  const log = data ? 
    `[${area}] ${message}:` :
    `[${area}] ${message}`;
    
  if (data) {
    console.log(log, data);
  } else {
    console.log(log);
  }
}

// Update getTodaySchedule to include spring training games
export async function getTodaySchedule(year = 2025, teamId = '7', isSchedule = false) {
  try {
    debug('getTodaySchedule', 'Called with', { year, teamId, isSchedule });
    
    const teamAbbr = TEAM_ABBREVIATIONS[teamId];
    if (!teamAbbr) {
      debug('getTodaySchedule', 'Invalid team ID:', teamId);
      return { events: [] };
    }

    const url = `https://statsapi.mlb.com/api/v1/schedule?teamId=${MLB_TEAM_IDS[teamId]}&startDate=${year}-01-01&endDate=${year}-12-31&sportId=1&gameType=S,R,D,F,L,W&hydrate=promotions`;
    debug('getTodaySchedule', 'Fetching URL', url);
    
    const res = await fetch(url, { 
      next: { revalidate: 3600 },
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      return { events: [] };
    }

    const data = await res.json();

    const games = formatMLBGames(data.dates, teamId, year);

    return { events: games };
  } catch (error) {
    debug('getTodaySchedule', 'Error:', error);
    return { events: [] };
  }
}

// Add MLB team ID mapping
const MLB_TEAM_IDS: Record<string, number> = {
  '4': 145,  // Chicago White Sox
  '5': 114,  // Cleveland Guardians
  '6': 116,  // Detroit Tigers
  '7': 118,  // Kansas City Royals
  '9': 142,  // Minnesota Twins
  '1': 110,  // Baltimore Orioles
  '2': 111,  // Boston Red Sox
  '3': 147,  // New York Yankees
  '8': 139,  // Tampa Bay Rays
  '10': 141, // Toronto Blue Jays
  '11': 117, // Houston Astros
  '12': 108, // Los Angeles Angels
  '13': 133, // Oakland Athletics
  '14': 136, // Seattle Mariners
  '15': 140, // Texas Rangers
  '16': 144, // Atlanta Braves
  '17': 146, // Miami Marlins
  '18': 121, // New York Mets
  '19': 143, // Philadelphia Phillies
  '20': 120, // Washington Nationals
  '21': 112, // Chicago Cubs
  '22': 113, // Cincinnati Reds
  '23': 158, // Milwaukee Brewers
  '24': 134, // Pittsburgh Pirates
  '25': 138, // St. Louis Cardinals
  '26': 109, // Arizona Diamondbacks
  '27': 115, // Colorado Rockies
  '28': 119, // Los Angeles Dodgers
  '29': 135, // San Diego Padres
  '30': 137  // San Francisco Giants
};

// Add complete MLB team logo mapping
const MLB_TEAM_LOGOS: Record<string, string> = {
  // AL Central
  '4': 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
  '5': 'https://a.espncdn.com/i/teamlogos/mlb/500/cle.png',
  '6': 'https://a.espncdn.com/i/teamlogos/mlb/500/det.png',
  '7': 'https://a.espncdn.com/i/teamlogos/mlb/500/kc.png',
  '9': 'https://a.espncdn.com/i/teamlogos/mlb/500/min.png',
  // AL East
  '1': 'https://a.espncdn.com/i/teamlogos/mlb/500/bal.png',
  '2': 'https://a.espncdn.com/i/teamlogos/mlb/500/bos.png',
  '3': 'https://a.espncdn.com/i/teamlogos/mlb/500/nyy.png',
  '8': 'https://a.espncdn.com/i/teamlogos/mlb/500/tb.png',
  '10': 'https://a.espncdn.com/i/teamlogos/mlb/500/tor.png',
  // ... add more teams as needed
};

// Add MLB team abbreviations mapping
const MLB_TEAM_ABBR: Record<number, string> = {
  145: 'chw', // Chicago White Sox
  114: 'cle', // Cleveland Guardians
  116: 'det', // Detroit Tigers
  118: 'kc',  // Kansas City Royals
  142: 'min', // Minnesota Twins
  110: 'bal', // Baltimore Orioles
  111: 'bos', // Boston Red Sox
  147: 'nyy', // New York Yankees
  139: 'tb',  // Tampa Bay Rays
  141: 'tor', // Toronto Blue Jays
  117: 'hou', // Houston Astros
  108: 'laa', // Los Angeles Angels
  133: 'oak', // Oakland Athletics
  136: 'sea', // Seattle Mariners
  140: 'tex', // Texas Rangers
  144: 'atl', // Atlanta Braves
  146: 'mia', // Miami Marlins
  121: 'nym', // New York Mets
  143: 'phi', // Philadelphia Phillies
  120: 'was', // Washington Nationals
  112: 'chc', // Chicago Cubs
  113: 'cin', // Cincinnati Reds
  158: 'mil', // Milwaukee Brewers
  134: 'pit', // Pittsburgh Pirates
  138: 'stl', // St. Louis Cardinals
  109: 'ari', // Arizona Diamondbacks
  115: 'col', // Colorado Rockies
  119: 'lad', // Los Angeles Dodgers
  135: 'sd',  // San Diego Padres
  137: 'sf'   // San Francisco Giants
};

// Add this interface near other types
interface Promotion {
  description: string;
  name: string;
  imageUrl?: string;
}

// Add function to format MLB data
function formatMLBGames(dates: any[], teamId: string, year: number): Game[] {
  debug('formatMLBGames', 'Called with year', year);
  
  if (!Array.isArray(dates)) {
    debug('formatMLBGames', 'No dates array found');
    return [];
  }

  const games: Game[] = [];
  let skippedGames = 0;

  dates.forEach((date, dateIndex) => {
    if (!date?.games) {
      return;
    }

    date.games.forEach((game: any, gameIndex: number) => {
      try {
        if (!game?.teams?.home || !game?.teams?.away) {
          skippedGames++;
          return;
        }

        const homeTeam = game.teams.home;
        const awayTeam = game.teams.away;
        const selectedTeamIsHome = homeTeam.team.id === MLB_TEAM_IDS[teamId];
        const opponent = selectedTeamIsHome ? awayTeam : homeTeam;

        const opponentEspnId = Object.entries(MLB_TEAM_IDS)
          .find(([_, id]) => id === opponent.team.id)?.[0];

        if (!opponentEspnId) {
          return;
        }

        const gameDate = new Date(game.gameDate);
        if (isNaN(gameDate.getTime())) {
          return;
        }

        // Use UTC dates for consistent comparison
        const now = new Date();
        const isFutureGame = gameDate.getTime() > Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          now.getUTCHours(),
          now.getUTCMinutes()
        );

        // Simplified promotions handling
        const promotions = selectedTeamIsHome && game.promotions 
          ? game.promotions.map((promo: any) => ({
              description: promo.description || '',
              name: promo.name || '',
              imageUrl: promo.imageUrl || undefined
            }))
          : undefined;

        const formattedGame = {
          id: `${game.gamePk}-${dateIndex}-${gameIndex}`,
          date: game.gameDate,
          name: opponent.team.name,
          teamId: opponentEspnId,
          logo: `https://a.espncdn.com/i/teamlogos/mlb/500/${MLB_TEAM_ABBR[opponent.team.id]}.png`,
          color: getTeamColor(opponent.team.name),
          homeScore: isFutureGame ? null : homeTeam.score?.toString() || null,
          awayScore: isFutureGame ? null : awayTeam.score?.toString() || null,
          winner: isFutureGame ? null : (selectedTeamIsHome ? homeTeam.isWinner : awayTeam.isWinner),
          isPostseason: game.gameType !== 'R' && game.gameType !== 'S',  // Postseason games
          isSpringTraining: game.gameType === 'S',  // Add spring training flag
          isHome: selectedTeamIsHome,
          formattedDate: new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZone: 'UTC'
          }).format(gameDate),
          isFutureGame,
          status: game.status?.detailedState || '',
          promotions,
        };

        games.push(formattedGame);
      } catch (error) {
        skippedGames++;
      }
    });
  });

  return games;
}

function formatTeamData(teamData: CompetitorData) {
  return {
    name: teamData.team.displayName,
    teamId: teamData.team.id,
    rank: teamData.curatedRank.current,
    logo: teamData.team.logo ?? DEFAULT_LOGO,
    color: getTeamColor(teamData.team.displayName),
    score: teamData.score,
    winner: teamData.winner,
    record: teamData.records
      ? `(${teamData.records[0].summary}, ${teamData.records[3]?.summary ?? 'N/A'})`
      : 'N/A',
  };
}

// Add this function near the top of the file with other utility functions
function getTeamColor(teamName: string): string {
  return teamColors[teamName] || 'FFFFFF';
}
