import { getScores, ALL_TEAMS, getTeamRecord, getTeamById } from '../espn.js';
import { renderScoresControls, updateSpringTrainingButton } from './ScoresControls.js';

export async function renderScores(teamId, season) {
  const scoresContainer = document.getElementById('scores');
  
  try {
    scoresContainer.innerHTML = '<div class="mt-6">Loading scores...</div>';
    
    const data = await getScores(teamId, season);
    const teamData = await getTeamRecord(teamId, season);
    
    if (!data.events || data.events.length === 0) {
      scoresContainer.innerHTML = '<div class="mt-6">No games scheduled.</div>';
      return;
    }

    // Get the current team's info
    const currentTeam = ALL_TEAMS.find(team => team.teamId === teamId);
    if (!currentTeam) {
      throw new Error(`Team not found: ${teamId}`);
    }

    const html = `
      <div>
        <!-- Team Header -->
        <div class="flex items-center mb-2">
          <img 
            alt="Logo"
            src="${currentTeam.logo}"
            class="h-6 w-6"
            width="24"
            height="24"
          />
          <h1 class="font-semibold text-2xl ml-2">${currentTeam.name}</h1>
        </div>

        <!-- Team Record -->
        <h3 class="text-gray-700 dark:text-gray-300 mb-4">${teamData.record} • ${teamData.standing}</h3>

        <!-- Controls -->
        <div class="flex items-center justify-between mb-4">
          <div class="text-sm text-gray-500">
            ${data.events.length} Games
          </div>
          ${renderScoresControls()}
        </div>

        <!-- Games List -->
        <div id="games-list">
          <!-- Games will be rendered here -->
        </div>
      </div>
    `;

    scoresContainer.innerHTML = html;

    // Filter functions
    const filterBySeasonType = (events, showSpringTraining) => {
      if (showSpringTraining) {
        // Show all games in chronological order
        return events;
      }
      // Hide spring training games, keep everything else
      return events.filter(e => !e.isSpringTraining);
    };

    // Initial render with all events
    let filteredEvents = [...data.events];

    const renderFilteredGames = () => {
      const springTrainingEnabled = document.getElementById('spring-training-toggle').dataset.enabled === 'true';
      const sortDirection = document.getElementById('date-sort-toggle').dataset.sort;
      
      // First filter the events
      filteredEvents = filterBySeasonType(data.events, springTrainingEnabled);
      
      // Then sort them
      filteredEvents.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
      });
      
      // Update game count
      document.querySelector('.text-gray-500').textContent = `${filteredEvents.length} Games`;
      
      renderGamesList();
    };

    const renderGamesList = () => {
      const gamesHtml = `
        <div class="divide-y divide-gray-200 dark:divide-gray-800">
          ${filteredEvents.map(game => {
            const competition = game.competitions;
            if (!competition?.competitors) return '';
            
            const selectedTeam = competition.competitors.find(c => c.team.id === teamId);
            const opposingTeam = competition.competitors.find(c => c.team.id !== teamId);
            
            if (!selectedTeam || !opposingTeam) return '';

            const date = new Date(game.date);
            const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const isWin = selectedTeam.winner;
            const isHome = selectedTeam.homeAway === 'home';
            
            const displayTeam = opposingTeam;
            // Get full team info to access slug
            const displayTeamInfo = getTeamById(displayTeam.team.id);
            
            const score = isHome 
              ? `${opposingTeam.score}-${selectedTeam.score}`
              : `${selectedTeam.score}-${opposingTeam.score}`;

            return `
              <div class="flex items-center justify-between px-0 min-[450px]:px-4 py-2 border-b border-gray-200 dark:border-gray-800 ${
                game.isSpringTraining ? 'bg-yellow-50 bg-opacity-50 dark:bg-yellow-900 dark:bg-opacity-40' : 
                game.isPostseason ? 'bg-green-50 bg-opacity-50 dark:bg-green-900 dark:bg-opacity-40' :
                game.isDoubleHeader ? 'bg-blue-50 bg-opacity-50 dark:bg-blue-900 dark:bg-opacity-40' : ''
              }">
                <div class="flex items-center">
                  <div class="w-14 text-sm text-gray-600 dark:text-gray-400">${formattedDate}</div>
                  <img 
                    alt="${displayTeam.team.name}"
                    src="${displayTeam.team.logo}"
                    class="h-5 w-5"
                    width="20"
                    height="20"
                  />
                  <a class="font-semibold ml-4" href="/${displayTeamInfo?.slug || ''}">${displayTeam.team.name}</a>
                </div>
                <div class="flex items-center gap-4">
                  <p class="text-gray-700 dark:text-gray-300 tabular-nums">${score}</p>
                  <p class="font-semibold w-5 text-center ${
                    isWin 
                      ? 'text-green-700 dark:text-green-500'
                      : 'text-red-700 dark:text-red-500'
                  }">${isWin ? 'W' : 'L'}</p>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      document.getElementById('games-list').innerHTML = gamesHtml;
    }

    // Initial render
    renderFilteredGames();

    // Add event listeners for controls
    const springTrainingToggle = document.getElementById('spring-training-toggle');
    const dateSortToggle = document.getElementById('date-sort-toggle');

    springTrainingToggle.addEventListener('click', () => {
      const isEnabled = springTrainingToggle.dataset.enabled === 'true';
      springTrainingToggle.dataset.enabled = (!isEnabled).toString();
      updateSpringTrainingButton(!isEnabled);
      renderFilteredGames();
    });

    dateSortToggle.addEventListener('click', () => {
      const currentSort = dateSortToggle.dataset.sort;
      const newSort = currentSort === 'desc' ? 'asc' : 'desc';
      dateSortToggle.dataset.sort = newSort;
      
      // Update icon rotation
      const icon = dateSortToggle.querySelector('svg');
      icon.style.transform = newSort === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)';
      
      renderFilteredGames();
    });

  } catch (error) {
    console.error('Error rendering scores:', error);
    scoresContainer.innerHTML = '<div class="text-red-500">Error loading scores</div>';
  }
} 