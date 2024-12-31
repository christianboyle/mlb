import { AL_EAST_TEAMS, AL_CENTRAL_TEAMS, AL_WEST_TEAMS, NL_EAST_TEAMS, NL_CENTRAL_TEAMS, NL_WEST_TEAMS, getDivisionStandings, CURRENT_SEASON, DISPLAY_YEAR } from './espn.js';
import { renderScores } from './components/Scores.js';
import { renderSchedule } from './components/Schedule.js';
import { renderMobileNav } from './components/MobileNav.js';
import { Router } from './router.js';
import './style.css';

const router = new Router();

// Toggle dark mode
const toggleDarkMode = () => {
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
    localStorage.theme = 'light';
  } else {
    document.documentElement.classList.add('dark');
    localStorage.theme = 'dark';
  }
};

async function renderHome({ teamId, params }) {
  const season = params.get('season') || CURRENT_SEASON;
  const isMobile = window.innerWidth < 640; // sm breakpoint
  const tab = isMobile ? (params.get('tab') || 'scores') : null;  // Only use tab on mobile
  const app = document.getElementById('app');

  const teamSelect = `
    <select 
      class="appearance-none w-full bg-[#ccc] dark:bg-black text-gray-800 dark:text-gray-200 font-semibold px-3 py-2 pr-8 rounded-md border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
    >
      <option value="">Select a team</option>
      <optgroup label="AL East">
        ${AL_EAST_TEAMS.map(team => `
          <option value="${team.teamId}" ${team.teamId === teamId ? 'selected' : ''}>
            ${team.name}
          </option>
        `).join('')}
      </optgroup>
      <optgroup label="AL Central">
        ${AL_CENTRAL_TEAMS.map(team => `
          <option value="${team.teamId}" ${team.teamId === teamId ? 'selected' : ''}>
            ${team.name}
          </option>
        `).join('')}
      </optgroup>
      <optgroup label="AL West">
        ${AL_WEST_TEAMS.map(team => `
          <option value="${team.teamId}" ${team.teamId === teamId ? 'selected' : ''}>
            ${team.name}
          </option>
        `).join('')}
      </optgroup>
      <optgroup label="NL East">
        ${NL_EAST_TEAMS.map(team => `
          <option value="${team.teamId}" ${team.teamId === teamId ? 'selected' : ''}>
            ${team.name}
          </option>
        `).join('')}
      </optgroup>
      <optgroup label="NL Central">
        ${NL_CENTRAL_TEAMS.map(team => `
          <option value="${team.teamId}" ${team.teamId === teamId ? 'selected' : ''}>
            ${team.name}
          </option>
        `).join('')}
      </optgroup>
      <optgroup label="NL West">
        ${NL_WEST_TEAMS.map(team => `
          <option value="${team.teamId}" ${team.teamId === teamId ? 'selected' : ''}>
            ${team.name}
          </option>
        `).join('')}
      </optgroup>
    </select>
  `;

  const mainContent = `
    <div class="flex flex-col h-[calc(100vh_-_48px)] relative">
      <button 
        id="dark-mode-toggle"
        class="absolute top-6 right-6 p-2 rounded-lg hover:bg-[#bbb] dark:hover:bg-gray-800 z-10"
        aria-label="Toggle dark mode"
        onclick="(${toggleDarkMode.toString()})()"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="hidden dark:block h-5 w-5">
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2"></path>
          <path d="M12 20v2"></path>
          <path d="m4.93 4.93 1.41 1.41"></path>
          <path d="m17.66 17.66 1.41 1.41"></path>
          <path d="M2 12h2"></path>
          <path d="M20 12h2"></path>
          <path d="m6.34 17.66-1.41 1.41"></path>
          <path d="m19.07 4.93-1.41 1.41"></path>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="block dark:hidden h-5 w-5">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
        </svg>
      </button>
      <main class="flex-1 grid md:grid-cols-2 lg:grid-cols-3 pb-16 sm:pb-0 overflow-y-auto">
        <section class="w-full mx-auto p-6 border-r border-gray-200 dark:border-gray-800 ${tab !== 'scores' ? 'sm:block hidden' : ''}">
          <div>
            ${teamId ? 
              `<div class="mb-6">
                <h2 class="font-semibold text-2xl">Scores</h2>
              </div>
              <div id="scores-container">
                <div class="flex items-center gap-4 mb-6">
                  ${teamSelect}
                  <select 
                    id="year-select"
                    class="appearance-none bg-[#ccc] dark:bg-black text-gray-800 dark:text-gray-200 font-semibold px-3 py-2 pr-8 rounded-md border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
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
          </div>
        </section>
        <section class="w-full mx-auto p-6 border-r border-gray-200 dark:border-gray-800 ${tab !== 'schedule' ? 'sm:block hidden' : ''}">
          <h2 class="font-semibold text-2xl mb-4">Schedule • ${DISPLAY_YEAR}</h2>
          ${teamId ? '<div id="schedule"></div>' : 
            '<p class="text-gray-600 dark:text-gray-400">Select a team to view schedule</p>'}
        </section>
        <section class="w-full mx-auto p-6 ${tab !== 'division' ? 'sm:block hidden' : ''}">
          <h2 class="font-semibold text-2xl mb-4">Division Standings <span class="text-gray-500 dark:text-gray-400 text-lg">• ${season}</span></h2>
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
      // On desktop or if scores tab is active, render scores
      if (!tab || tab === 'scores') {
        renderScores(teamId, season);
      }

      // On desktop or if schedule tab is active, render schedule
      if (!tab || tab === 'schedule') {
        renderSchedule(teamId, DISPLAY_YEAR);
      }

      // On desktop or if division tab is active, render standings
      if (!tab || tab === 'division') {
        const standings = await getDivisionStandings(season, teamId);
        const standingsHtml = `
          <div class="divide-y divide-gray-200 dark:divide-gray-800">
            ${standings.map((team) => `
              <div class="flex items-center justify-between px-0 min-[450px]:px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                <div class="flex items-center">
                  <img 
                    src="${team.logo}"
                    alt="${team.name}"
                    class="h-5 w-5 ${team.color === '000000' ? 'dark:invert' : ''}"
                    width="20"
                    height="20"
                  />
                  <a href="/${team.id}" class="font-semibold ml-4">${team.name}</a>
                </div>
                <div class="flex items-center gap-4">
                  <p class="text-gray-700 dark:text-gray-300 tabular-nums">
                    ${team.record}
                  </p>
                  <p class="text-gray-500 dark:text-gray-400 text-sm">
                    ${team.standingSummary}
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
          const isMobile = window.innerWidth < 640; // sm breakpoint
          if (isMobile) {
            window.location.href = `/${e.target.value}?tab=scores`;
          } else {
            // On desktop, just load the team without a tab parameter
            window.location.href = `/${e.target.value}`;
          }
        } else {
          window.location.href = '/';
        }
      });
    }

    // Add event listener for year select
    const yearSelect = document.getElementById('year-select');
    if (yearSelect) {
      yearSelect.addEventListener('change', (e) => {
        const newSeason = e.target.value;
        // Only include season parameter if we're in scores or division tab
        const seasonParam = tab === 'schedule' ? '' : `&season=${newSeason}`;
        window.location.href = `/${teamId}?tab=${tab}${seasonParam}`;
      });
    }
  }, 0);
}

// Add routes
router.addRoute('/', renderHome);
router.addRoute('/:teamId', renderHome);

// Initial route handling
router.handleRoute();

// Add resize listener to handle mobile/desktop breakpoint changes
let wasMobile = window.innerWidth < 640;
window.addEventListener('resize', () => {
  const isMobile = window.innerWidth < 640;
  // Only handle when crossing the breakpoint
  if (isMobile !== wasMobile) {
    wasMobile = isMobile;
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const teamId = path === '/' ? null : path.slice(1);
    
    if (teamId) {
      if (isMobile && !params.get('tab')) {
        // Add tab=scores when entering mobile breakpoint
        router.navigate(`/${teamId}?tab=scores`, true);
      } else if (!isMobile && params.get('tab')) {
        // Remove tab parameter when entering desktop breakpoint
        router.navigate(`/${teamId}`, true);
      }
    }
  }
}); 