import { AL_CENTRAL_TEAMS, getDivisionStandings, CURRENT_SEASON, DISPLAY_YEAR } from './espn.js';
import { renderScores } from './components/Scores.js';
import { renderSchedule } from './components/Schedule.js';
import { renderMobileNav } from './components/MobileNav.js';
import { Router } from './router.js';
import './style.css';

const router = new Router();

async function renderHome({ teamId, params }) {
  const season = params.get('season') || CURRENT_SEASON;
  const tab = params.get('tab');
  const app = document.getElementById('app');

  const teamSelect = `
    <select 
      class="appearance-none w-full bg-white dark:bg-black text-gray-800 dark:text-gray-200 font-semibold px-3 py-2 pr-8 rounded-md border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
    >
      <option value="">Select a team</option>
      <optgroup label="AL Central">
        ${AL_CENTRAL_TEAMS.map(team => `
          <option value="${team.teamId}" ${team.teamId === teamId ? 'selected' : ''}>
            ${team.name}
          </option>
        `).join('')}
      </optgroup>
    </select>
  `;

  const mainContent = `
    <div class="flex flex-col h-[calc(100vh_-_48px)]">
      <main class="flex-1 grid md:grid-cols-2 lg:grid-cols-3 pb-16 sm:pb-0 overflow-y-auto border-b border-gray-200 dark:border-gray-800">
        <section class="w-full mx-auto p-6 border-r border-gray-200 dark:border-gray-800">
          ${tab === 'schedule' ? 
            `<h2 class="font-semibold text-2xl mb-4">Schedule • ${DISPLAY_YEAR}</h2>
             <div id="schedule"></div>` : 
            tab === 'division' ?
            `<h2 class="font-semibold text-2xl mb-4">Division Standings</h2>
             <div id="standings"></div>` :
            `<div>
               ${teamId ? 
                 `<div class="mb-6">
                    <h2 class="font-semibold text-2xl">Scores</h2>
                  </div>
                  <div id="scores-container">
                    <div class="flex items-center gap-4 mb-6">
                      ${teamSelect}
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
                    </div>
                    <div id="scores"></div>
                  </div>` : 
                 `<h2 class="font-semibold text-2xl mb-4">Scores</h2>
                  <p class="text-gray-600 dark:text-gray-400 mb-6">Select a team to view scores</p>
                  <div class="max-w-xs">
                    ${teamSelect}
                  </div>`
               }
             </div>`
          }
        </section>
        <section class="w-full mx-auto p-6 border-r border-gray-200 dark:border-gray-800">
          <h2 class="font-semibold text-2xl mb-4">Schedule • ${DISPLAY_YEAR}</h2>
          ${teamId ? '<div id="schedule"></div>' : 
            '<p class="text-gray-600 dark:text-gray-400">Select a team to view schedule</p>'}
        </section>
        <section class="w-full mx-auto p-6">
          <h2 class="font-semibold text-2xl mb-4">Division Standings</h2>
          ${teamId ? '<div id="standings"></div>' : 
            '<p class="text-gray-600 dark:text-gray-400">Select a team to view standings</p>'}
        </section>
      </main>
    </div>
    ${renderMobileNav(window.location.pathname)}
  `;

  app.innerHTML = mainContent;

  // Wait for next tick to ensure DOM is updated
  setTimeout(async () => {
    if (teamId) {
      if (tab === 'schedule') {
        renderSchedule(teamId, DISPLAY_YEAR);
      } else if (tab === 'division') {
        const standings = await getDivisionStandings(season);
        const standingsHtml = `
          <div class="divide-y divide-gray-200 dark:divide-gray-800">
            ${standings.map((team) => `
              <div class="flex flex-col min-[450px]:flex-row justify-between px-0 min-[450px]:px-4 py-2 border-b border-gray-200 dark:border-gray-800">
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
      } else {
        renderScores(teamId, season);
        renderSchedule(teamId, DISPLAY_YEAR);
        
        // Render division standings
        const standings = await getDivisionStandings(season);
        const standingsHtml = `
          <div class="divide-y divide-gray-200 dark:divide-gray-800">
            ${standings.map((team) => `
              <div class="flex flex-col min-[450px]:flex-row justify-between px-0 min-[450px]:px-4 py-2 border-b border-gray-200 dark:border-gray-800">
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
      }
    }

    // Add event listener for team select
    const select = document.querySelector('select');
    if (select) {
      select.addEventListener('change', (e) => {
        if (e.target.value) {
          window.location.href = `/${e.target.value}`;
        }
      });
    }
  }, 0);
}

// Add routes
router.addRoute('/', renderHome);
router.addRoute('/:teamId', renderHome);

// Initial route handling
router.handleRoute(); 