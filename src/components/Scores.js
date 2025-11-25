import { getScores, ALL_TEAMS, getTeamRecord, getTeamById, isPastOpeningDay } from '../espn.js';
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
      
      // For 2026, show regular season games after opening day
      if (season === 2026) {
        if (isPastOpeningDay(season)) {
          return completedGames.filter(e => !e.isSpringTraining);
        }
        return showSpringTraining ? completedGames.filter(e => e.isSpringTraining) : [];
      }
      
      // For other years, show all games except spring training unless enabled
      if (showSpringTraining) {
        return completedGames;
      }
      return completedGames.filter(e => !e.isSpringTraining);
    };

    // Check if we have spring training games and if we're past opening day
    const hasSpringTraining = data.events?.some(e => e.isSpringTraining);
    const pastOpeningDay = isPastOpeningDay(season);

    // Initialize spring training state - show spring training only before opening day
    let showSpringTraining = season === 2026 && !pastOpeningDay;

    // Initial render with filtered events
    let filteredEvents = filterBySeasonType(data.events, showSpringTraining);

    const renderGamesList = () => {
      const gamesListContainer = document.getElementById('games-list');
      if (!gamesListContainer) return;

      // Show empty state only if we have no games to display
      if (filteredEvents.length === 0) {
        // If we're past opening day, show a different message
        const message = isPastOpeningDay(season) 
          ? 'No games played yet.'
          : 'Regular season starts March 25. Home opener is March 30.';
        gamesListContainer.innerHTML = `<div class="mt-6 text-gray-600 dark:text-gray-400">${message}</div>`;
        const gamesCount = document.querySelector('.text-gray-500');
        if (gamesCount) gamesCount.textContent = '0 Games';
        return;
      }

      // Sort events based on current sort direction if sort toggle exists
      const sortToggle = document.getElementById('scores-sort-toggle');
      if (sortToggle) {
        const sortDirection = sortToggle.dataset.sort || 'desc';
        filteredEvents.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        });
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
                game.isPostseason ? 'bg-green-50 bg-opacity-50 dark:bg-green-900 dark:bg-opacity-40' : ''
              }">
                <div class="flex items-center">
                  <div class="w-14 text-sm text-gray-600 dark:text-gray-400">${formattedDate}</div>
                  <a href="/${displayTeamInfo?.slug || ''}" class="hover:opacity-80 transition-opacity">
                    <img 
                      alt="${displayTeam.team.name}"
                      src="${displayTeam.team.logo}"
                      class="h-5 w-5"
                      width="20"
                      height="20"
                    />
                  </a>
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
          <a href="/${currentTeam.slug || ''}" class="hover:opacity-80 transition-opacity">
            <img 
              alt="Logo"
              src="${currentTeam.logo}"
              class="h-6 w-6"
              width="24"
              height="24"
            />
          </a>
          <h1 class="font-semibold text-2xl ml-2">${currentTeam.name}</h1>
        </div>

        <!-- Team Record -->
        <h3 class="text-gray-700 dark:text-gray-300 mb-4">${teamData.record} • ${teamData.standing}</h3>

        <!-- Controls -->
        <div class="flex items-center justify-between mb-4">
          <div class="text-sm text-gray-500">
            ${filteredEvents.length} Games
          </div>
          ${renderScoresControls(hasSpringTraining && !pastOpeningDay)}
        </div>

        <!-- Games List -->
        <div id="games-list"></div>
      </div>
    `;

    scoresContainer.innerHTML = html;

    // Add event listeners for controls
    const springTrainingToggle = document.getElementById('spring-training-toggle');
    const dateSortToggle = document.getElementById('scores-sort-toggle');

    // Initialize controls
    if (springTrainingToggle && hasSpringTraining && !pastOpeningDay) {
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
      dateSortToggle.dataset.sort = 'desc';
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