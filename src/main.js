import { AL_EAST_TEAMS, AL_CENTRAL_TEAMS, AL_WEST_TEAMS, NL_EAST_TEAMS, NL_CENTRAL_TEAMS, NL_WEST_TEAMS, getDivisionStandings, CURRENT_SEASON, DISPLAY_YEAR, ALL_TEAMS, getTeamById, getTeamBySlug } from './espn.js';
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
      <main class="flex-1 grid md:grid-cols-2 lg:grid-cols-3 pb-16 sm:pb-0">
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
                    ${[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003, 2002, 2001, 2000].map(year => `
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
          <h2 class="font-semibold text-2xl mb-4">Division Standings <span id="division-name-header" class="text-gray-500 dark:text-gray-400 text-lg"></span></h2>
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
    // Add dark mode toggle listener
    document.getElementById('dark-mode-toggle')?.addEventListener('click', toggleDarkMode);

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
        // Simple standings HTML without toggle
        const standingsHtml = `
          <div>
            <div class="flex items-center justify-between mb-4">
              <div id="standings-count" class="text-sm text-gray-500"></div>
            </div>
            <div id="standings-list" class="divide-y divide-gray-200 dark:divide-gray-800"></div>
          </div>
        `;
        document.getElementById('standings').innerHTML = standingsHtml;
        
        // For 2025 always show spring training standings, otherwise show regular season
        // Make sure we're converting to string for comparison
        const showSpringTraining = season.toString() === '2025' ? true : false;
        
        // Render standings with appropriate type
        await renderDivisionStandings(teamId, season, showSpringTraining);
      }
    }

    // Add event listener for team select
    const select = document.querySelector('select');
    if (select) {
      select.addEventListener('change', (e) => {
        if (e.target.value) {
          const selectedTeam = ALL_TEAMS.find(team => team.teamId === e.target.value);
          const isMobile = window.innerWidth < 640; // sm breakpoint
          if (isMobile) {
            window.location.href = `/${selectedTeam.slug}?tab=scores`;
          } else {
            // On desktop, just load the team without a tab parameter
            window.location.href = `/${selectedTeam.slug}`;
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
        const team = getTeamById(teamId);
        // Only include season parameter if we're in scores or division tab
        const seasonParam = tab === 'schedule' ? '' : `&season=${newSeason}`;
        
        // Navigate to new URL
        window.location.href = `/${team?.slug || ''}?tab=${tab}${seasonParam}`;
      });
    }
  }, 0);
}

// Add routes
router.addRoute('/', renderHome);
router.addRoute('/:teamSlug', renderHome);

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
    const slug = path === '/' ? null : path.slice(1);
    const team = slug ? getTeamBySlug(slug) : null;
    
    if (team) {
      if (isMobile && !params.get('tab')) {
        // Add tab=scores when entering mobile breakpoint
        router.navigate(`/${team.slug}?tab=scores`, true);
      } else if (!isMobile && params.get('tab')) {
        // Remove tab parameter when entering desktop breakpoint
        router.navigate(`/${team.slug}`, true);
      }
    }
  }
});

// Function to render division standings
async function renderDivisionStandings(teamId, season, showSpringTraining) {
  const standingsList = document.getElementById('standings-list');
  if (!standingsList) return;
  
  // Force spring training for 2025
  if (season.toString() === '2025') {
    showSpringTraining = true;
  }
  
  standingsList.innerHTML = '<div class="mt-6">Loading standings...</div>';
  
  try {
    // Normal flow - use the getDivisionStandings function
    const standings = await getDivisionStandings(season, teamId, showSpringTraining);
    
    // Get division name from the first team
    const divisionName = standings.length > 0 ? 
      standings[0].standingSummary.split(' in ')[1] : '';
    
    // Update the division name in the header
    const divisionNameHeader = document.getElementById('division-name-header');
    if (divisionNameHeader && divisionName) {
      divisionNameHeader.innerHTML = `• ${divisionName}`;
    }
    
    // Update standings count if element exists
    const standingsCount = document.getElementById('standings-count');
    if (standingsCount) {
      const standingsType = showSpringTraining ? 'Spring Training' : 'Regular Season';
      standingsCount.innerHTML = `<div>${standingsType} Standings</div>`;
    }
    
    const standingsHtml = standings.map((team) => {
      const teamInfo = getTeamById(team.id);
      return `
        <div class="flex items-center justify-between px-0 min-[450px]:px-4 py-2" ${team.isSpringTraining && season !== 2025 ? 'style="display: none;"' : ''}>
          <div class="flex items-center">
            <img 
              src="${team.logo}"
              alt="${team.name}"
              class="h-5 w-5 ${team.color === '000000' ? 'dark:invert' : ''}"
              width="20"
              height="20"
            />
            <a href="/${teamInfo?.slug || ''}" class="font-semibold ml-4">${team.name}</a>
          </div>
          <div class="flex items-center gap-4">
            <p class="text-gray-700 dark:text-gray-300 tabular-nums">
              ${team.record}
            </p>
            <p class="px-2 py-0.5 rounded-md font-medium text-xs min-w-[36px] text-center ${
              team.standingSummary.startsWith('1st') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              team.standingSummary.startsWith('2nd') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
              team.standingSummary.startsWith('3rd') ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }">
              ${team.standingSummary.split(' in ')[0]}
            </p>
          </div>
        </div>
      `;
    }).join('');
    
    standingsList.innerHTML = standingsHtml || '<div class="mt-6 text-gray-600 dark:text-gray-400">No standings available.</div>';
  } catch (error) {
    console.error('Error rendering standings:', error);
    standingsList.innerHTML = '<div class="text-red-500">Error loading standings</div>';
  }
} 