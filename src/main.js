import { AL_CENTRAL_TEAMS, getDivisionStandings, CURRENT_SEASON, DISPLAY_YEAR } from './espn.js';
import { renderTeamSelect } from './components/TeamSelect.js';
import { renderScores } from './components/Scores.js';
import { Router } from './router.js';
import './style.css';
import { renderSchedule } from './components/Schedule.js';

const router = new Router();

async function renderHome({ teamId, params }) {
  const season = params.get('season') || CURRENT_SEASON;
  const app = document.getElementById('app');

  const mainContent = `
    <main class="grid md:grid-cols-2 lg:grid-cols-3">
      <section class="w-full mx-auto p-6 border-r border-gray-200 dark:border-gray-800">
        ${teamId ? '<div id="scores"></div>' : ''}
      </section>
      <section class="w-full mx-auto p-6 border-r border-gray-200 dark:border-gray-800">
        <h2 class="font-semibold text-2xl mb-4">Schedule • ${DISPLAY_YEAR}</h2>
        <div id="schedule"></div>
      </section>
      <section class="w-full mx-auto p-6">
        <h2 class="font-semibold text-2xl mb-4">Division Standings</h2>
        <div id="standings"></div>
      </section>
    </main>
  `;

  app.innerHTML = mainContent;

  // Wait for next tick to ensure DOM is updated
  setTimeout(async () => {
    if (teamId) {
      renderScores(teamId, season);
      renderSchedule(teamId, DISPLAY_YEAR);
    }
    
    // Render division standings
    const standings = await getDivisionStandings(season);
    const standingsHtml = `
      <div class="divide-y divide-gray-200 dark:divide-gray-800">
        ${standings.map((team, index) => `
          <div class="flex flex-col min-[450px]:flex-row justify-between px-0 min-[450px]:px-4 py-2">
            <div class="flex">
              <img 
                src="${team.logo}"
                alt="${team.name}"
                class="h-5 w-5 ${team.color === '000000' ? 'dark:invert' : ''}"
                width="20"
                height="20"
              />
              <a href="/${team.id}" class="font-semibold ml-4">${team.name}</a>
            </div>
            <div class="flex flex-row-reverse justify-end min-[450px]:flex-row">
              <p class="text-gray-700 dark:text-gray-300 tabular-nums">
                ${team.record}
              </p>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    document.getElementById('standings').innerHTML = standingsHtml;
  }, 0);
}

// Add routes
router.addRoute('/', renderHome);
router.addRoute('/:teamId', renderHome);

// Initial route handling
router.handleRoute(); 