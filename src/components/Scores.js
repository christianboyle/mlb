import { getScores, AL_CENTRAL_TEAMS, getTeamRecord } from '../espn.js';
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
    const currentTeam = AL_CENTRAL_TEAMS.find(team => team.teamId === teamId);

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

        <!-- Team Select and Year Filter -->
        <div class="flex items-center gap-4 mb-6">
          <div class="relative">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 flex-shrink-0">
                <img 
                  alt="Team logo"
                  src="${currentTeam.logo}"
                  class="w-full h-full"
                  width="24"
                  height="24"
                />
              </div>
              <div class="relative flex-grow">
                <select 
                  class="appearance-none w-full bg-white dark:bg-black text-gray-800 dark:text-gray-200 font-semibold px-3 py-2 pr-8 rounded-md border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-sans"
                >
                  <option value="">Select a team</option>
                  ${AL_CENTRAL_TEAMS.map(team => `
                    <option value="${team.teamId}" ${team.teamId === teamId ? 'selected' : ''}>
                      ${team.name}
                    </option>
                  `).join('')}
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-gray-500">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Year Filter -->
          <div class="relative">
            <select 
              class="appearance-none bg-white dark:bg-black text-gray-800 dark:text-gray-200 font-semibold px-3 py-2 pr-8 rounded-md border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value="${season}"
            >
              ${[2024, 2023, 2022, 2021, 2020].map(year => `
                <option value="${year}" ${year === parseInt(season) ? 'selected' : ''}>
                  ${year}
                </option>
              `).join('')}
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Scores Section -->
        <div class="flex items-center justify-between mb-4">
          <div class="text-sm text-gray-500">
            ${data.events.length} Games
          </div>
        </div>
        ${renderScoresControls()}
        <div id="games-list">
          <!-- Games will be rendered here -->
        </div>
      </div>
    `;

    scoresContainer.innerHTML = html;

    // Add team select event listener
    document.querySelector('select').addEventListener('change', (e) => {
      const newTeamId = e.target.value;
      if (newTeamId) {
        window.location.href = `/${newTeamId}`;
      }
    });

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
            
            const score = isHome 
              ? `${opposingTeam.score}-${selectedTeam.score}`
              : `${selectedTeam.score}-${opposingTeam.score}`;

            return `
              <div class="flex flex-col min-[450px]:flex-row justify-between px-0 min-[450px]:px-4 py-2 border-b border-gray-200 dark:border-gray-800 ${
                game.isSpringTraining ? 'bg-yellow-50/30 dark:bg-yellow-900/20' : 
                game.isPostseason ? 'bg-green-50/30 dark:bg-green-900/20' :
                game.isDoubleHeader ? 'bg-blue-50/30 dark:bg-blue-900/20' : ''
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
                  <a class="font-semibold ml-4" href="/${displayTeam.team.id}">${displayTeam.team.name}</a>
                </div>
                <div class="flex flex-row-reverse justify-end min-[450px]:flex-row items-center">
                  <p class="text-gray-700 dark:text-gray-300 tabular-nums">${score}</p>
                  <p class="font-semibold ml-0 min-[450px]:ml-2 w-5 mr-4 min-[450px]:mr-0 text-center ${
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
    };

    // Add event listeners
    document.getElementById('spring-training-toggle').addEventListener('click', (e) => {
      const button = e.currentTarget;
      const newEnabled = button.dataset.enabled !== 'true';
      updateSpringTrainingButton(newEnabled);
      renderFilteredGames();
    });

    document.getElementById('date-sort-toggle').addEventListener('click', (e) => {
      const button = e.currentTarget;
      const newSort = button.dataset.sort === 'desc' ? 'asc' : 'desc';
      button.dataset.sort = newSort;
      renderFilteredGames();
    });

    // Initial render
    updateSpringTrainingButton(false);
    renderFilteredGames();

    // Add event listeners
    document.querySelector('select[value="' + season + '"]').addEventListener('change', (e) => {
      const newSeason = e.target.value;
      window.location.href = `/${teamId}?season=${newSeason}`;
    });

  } catch (error) {
    console.error('Error loading scores:', error);
    scoresContainer.innerHTML = '<div class="mt-6 text-red-500">Error loading scores</div>';
  }
} 