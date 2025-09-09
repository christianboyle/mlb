import { getTeamByAbbrev } from '../espn.js';

// Function to fetch live scores from the API
async function fetchLiveScores() {
  try {
    const response = await fetch('https://scores.christianboyle.com/api/v1/sports/mlb/events');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching live scores:', error);
    return null;
  }
}

// Function to render live scores in the ticker
export async function renderLiveScoresTicker() {
  const liveScoresContainer = document.getElementById('live-scores-ticker');
  if (!liveScoresContainer) return;

  try {
    const data = await fetchLiveScores();
    if (!data?.scores) {
      liveScoresContainer.style.display = 'none';
      return;
    }

    // Filter for live/in-progress games
    const liveGames = data.scores.filter(game => 
      game.status.state === 'in' || 
      (game.status.state === 'post' && !game.status.completed && game.status.detail !== 'Postponed')
    );

    // Filter for postponed games
    const postponedGames = data.scores.filter(game => 
      game.status.state === 'post' && 
      game.status.detail === 'Postponed' && 
      !game.status.completed
    );

    // Hide ticker if there are no live games
    if (liveGames.length === 0) {
      liveScoresContainer.style.display = 'none';
      return;
    }

    // Create the live scores HTML - include both live games and postponed games
    const scoresHtml = [...liveGames, ...postponedGames].map(game => {
      const awayTeam = game.teams.awayTeam;
      const homeTeam = game.teams.homeTeam;
      const inningInfo = game.status.shortDetail || game.status.detail;
      
      // Get team info from our internal mapping using abbreviations
      const awayTeamInfo = getTeamByAbbrev(awayTeam.abbrev);
      const homeTeamInfo = getTeamByAbbrev(homeTeam.abbrev);
      
      return `
        <div class="flex-none text-center px-4 py-2">
          <div class="flex justify-center items-center space-x-2">
            <a href="/${awayTeamInfo?.slug || ''}" class="hover:opacity-80 transition-opacity">
              <img src="${awayTeam.logo}" alt="${awayTeam.displayName}" class="h-4 w-4" />
            </a>
            <span class="font-medium">${awayTeam.runs || '0'}</span>
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">${inningInfo}</div>
          <div class="flex justify-center items-center space-x-2">
            <a href="/${homeTeamInfo?.slug || ''}" class="hover:opacity-80 transition-opacity">
              <img src="${homeTeam.logo}" alt="${homeTeam.displayName}" class="h-4 w-4" />
            </a>
            <span class="font-medium">${homeTeam.runs || '0'}</span>
          </div>
        </div>
      `;
    }).join('');

    // Update the live scores container
    liveScoresContainer.style.display = 'block';
    liveScoresContainer.innerHTML = `
      <div class="bg-[#ccc] dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div class="flex overflow-x-auto whitespace-nowrap scrollbar-hide justify-center">
          ${scoresHtml}
        </div>
      </div>
    `;

  } catch (error) {
    console.error('Error rendering live scores ticker:', error);
    liveScoresContainer.style.display = 'none';
  }
}

// Function to start auto-updating live scores
export function startLiveScoresTicker() {
  // Initial render
  renderLiveScoresTicker();
  
  // Update every 30 seconds
  const interval = setInterval(renderLiveScoresTicker, 30000);
  
  // Return cleanup function
  return () => clearInterval(interval);
} 
