import { getSchedule, getTeamById } from '../espn.js';
import { renderScheduleControls, updateScheduleSpringTrainingButton } from './ScheduleControls.js';

export async function renderSchedule(teamId, season) {
  try {
    const data = await getSchedule(teamId, season);
    
    const scheduleHtml = `
      <div>
        <!-- Controls -->
        <div class="flex items-center justify-between mb-4">
          <div id="schedule-game-count" class="text-sm text-gray-500">
            ${data.events.filter(e => !e.isSpringTraining).length} Games
          </div>
          ${renderScheduleControls()}
        </div>

        <!-- Games List -->
        <div id="schedule-list" class="divide-y divide-gray-200 dark:divide-gray-800">
          ${data.events.map(game => {
            const competition = game.competitions;
            if (!competition?.competitors) return '';
            
            const selectedTeam = competition.competitors.find(c => c.team.id === teamId);
            const opposingTeam = competition.competitors.find(c => c.team.id !== teamId);
            
            if (!selectedTeam || !opposingTeam) return '';

            const date = new Date(game.date);
            const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const isHome = selectedTeam.homeAway === 'home';
            
            // Get full team info to access slug
            const opposingTeamInfo = getTeamById(opposingTeam.team.id);
            
            return `
              <div class="flex items-center justify-between px-0 min-[450px]:px-4 py-2 border-b border-gray-200 dark:border-gray-800 ${
                game.isSpringTraining ? 'bg-yellow-50 bg-opacity-50 dark:bg-yellow-900 dark:bg-opacity-40' : ''
              }" ${game.isSpringTraining ? 'style="display: none;"' : ''}>
                <div class="flex items-center">
                  <div class="w-14 text-sm text-gray-600 dark:text-gray-400">${formattedDate}</div>
                  <img 
                    alt="${opposingTeam.team.name}"
                    src="${opposingTeam.team.logo}"
                    class="h-5 w-5"
                    width="20"
                    height="20"
                  />
                  <a class="font-semibold ml-4" href="/${opposingTeamInfo?.slug || ''}">
                    ${opposingTeam.team.name}
                  </a>
                </div>
                <div class="text-gray-500 dark:text-gray-400">
                  ${isHome ? `
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house h-4 w-4">
                      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
                      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    </svg>
                  ` : `
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin h-4 w-4">
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    document.getElementById('schedule').innerHTML = scheduleHtml;

    // Add event listener for spring training toggle
    const springTrainingToggle = document.getElementById('schedule-spring-training-toggle');
    if (springTrainingToggle) {
      springTrainingToggle.addEventListener('click', (e) => {
        const button = e.currentTarget;
        const newEnabled = button.dataset.enabled !== 'true';
        updateScheduleSpringTrainingButton(newEnabled);

        // Filter games
        const games = document.querySelectorAll('#schedule-list > div');
        games.forEach(game => {
          if (game.classList.contains('bg-yellow-50') || game.classList.contains('dark:bg-yellow-900')) {
            game.style.display = newEnabled ? 'flex' : 'none';
          }
        });

        // Update game count
        const visibleGames = Array.from(document.querySelectorAll('#schedule-list > div')).filter(
          div => div.style.display !== 'none'
        );
        document.getElementById('schedule-game-count').textContent = `${visibleGames.length} Games`;
      });
    }

    // Initial state - hide spring training games
    updateScheduleSpringTrainingButton(false);

  } catch (error) {
    console.error('Error rendering schedule:', error);
    document.getElementById('schedule').innerHTML = '<div class="text-red-500">Error loading schedule</div>';
  }
} 