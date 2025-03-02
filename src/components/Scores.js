import { getScores, ALL_TEAMS, getTeamRecord, getTeamById } from '../espn.js';
import { renderScoresControls, updateSpringTrainingButton } from './ScoresControls.js';

export async function renderScores(teamId, season) {
  const scoresContainer = document.getElementById('scores');
  
  try {
    scoresContainer.innerHTML = '<div class="mt-6">Loading scores...</div>';
    
    const data = await getScores(teamId, season);
    const teamData = await getTeamRecord(teamId, season);
    
    // Get the current team's info
    const currentTeam = ALL_TEAMS.find(team => team.teamId === teamId);
    if (!currentTeam) {
      throw new Error(`Team not found: ${teamId}`);
    }

    // Filter functions
    const filterBySeasonType = (events, showSpringTraining) => {
      if (!events || events.length === 0) return [];
      
      // First filter out upcoming games (no winner set)
      const completedGames = events.filter(e => e.competitions?.competitors?.some(c => c.winner !== undefined));
      
      // For 2025, only show spring training games
      if (season === 2025) {
        return showSpringTraining ? completedGames.filter(e => e.isSpringTraining) : [];
      }
      
      // For other years, show all games except spring training unless enabled
      if (showSpringTraining) {
        return completedGames;
      }
      return completedGames.filter(e => !e.isSpringTraining);
    };

    // Check if we have spring training games
    const hasSpringTraining = data.events?.some(e => e.isSpringTraining);

    // Initialize spring training state - default to true for 2025, false otherwise
    let showSpringTraining = season === 2025;

    // Initial render with filtered events
    let filteredEvents = filterBySeasonType(data.events, showSpringTraining);

    const renderGamesList = () => {
      const gamesListContainer = document.getElementById('games-list');
      if (!gamesListContainer) return;

      // For 2025 or when no filtered events, show empty state
      if ((season === 2025 && !showSpringTraining) || filteredEvents.length === 0) {
        gamesListContainer.innerHTML = '<div class="mt-6 text-gray-600 dark:text-gray-400">Opening Day is on Thursday, March 27.</div>';
        const gamesCount = document.querySelector('.text-gray-500');
        if (gamesCount) gamesCount.textContent = '0 Games';
        return;
      }

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
              <div class="flex items-center justify-between px-0 min-[450px]:px-4 py-2 ${
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
                    selectedTeam.winner === true
                      ? 'text-green-700 dark:text-green-500'
                      : selectedTeam.winner === false
                        ? 'text-red-700 dark:text-red-500'
                        : selectedTeam.winner === null
                          ? 'text-gray-500 dark:text-gray-400'
                          : 'text-gray-500 dark:text-gray-400'
                  }">${selectedTeam.winner === true ? 'W' : selectedTeam.winner === false ? 'L' : selectedTeam.winner === null ? 'T' : '-'}</p>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      gamesListContainer.innerHTML = gamesHtml;
      const gamesCount = document.querySelector('.text-gray-500');
      if (gamesCount) gamesCount.textContent = `${filteredEvents.length} Games`;
    };

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
            ${filteredEvents.length} Games
          </div>
          ${renderScoresControls()}
        </div>

        <!-- Games List -->
        <div id="games-list"></div>
      </div>
    `;

    scoresContainer.innerHTML = html;

    // Add event listeners for controls
    const springTrainingToggle = document.getElementById('spring-training-toggle');
    const dateSortToggle = document.getElementById('date-sort-toggle');

    // Initialize controls
    if (springTrainingToggle && hasSpringTraining) {
      springTrainingToggle.classList.remove('hidden');
      springTrainingToggle.dataset.enabled = showSpringTraining.toString();
      updateSpringTrainingButton(showSpringTraining);
      
      springTrainingToggle.addEventListener('click', () => {
        showSpringTraining = !showSpringTraining;
        springTrainingToggle.dataset.enabled = showSpringTraining.toString();
        updateSpringTrainingButton(showSpringTraining);
        
        // Update filtered events
        filteredEvents = filterBySeasonType(data.events, showSpringTraining);
        
        // Sort events if we have any
        if (filteredEvents.length > 0) {
          const sortDirection = dateSortToggle?.dataset.sort || 'asc';
          filteredEvents.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
          });
        }
        
        renderGamesList();
      });
    }

    if (dateSortToggle) {
      dateSortToggle.dataset.sort = 'asc';
      dateSortToggle.addEventListener('click', () => {
        const currentSort = dateSortToggle.dataset.sort;
        const newSort = currentSort === 'desc' ? 'asc' : 'desc';
        dateSortToggle.dataset.sort = newSort;
        
        // Update icon rotation
        const icon = dateSortToggle.querySelector('svg');
        icon.style.transform = newSort === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)';
        
        // Sort events
        filteredEvents.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return newSort === 'asc' ? dateA - dateB : dateB - dateA;
        });
        
        renderGamesList();
      });
    }

    // Always render games list
    renderGamesList();

  } catch (error) {
    console.error('Error rendering scores:', error);
    scoresContainer.innerHTML = '<div class="text-red-500">Error loading scores</div>';
  }
} 