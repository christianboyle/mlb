import { AL_EAST_TEAMS, AL_CENTRAL_TEAMS, AL_WEST_TEAMS, NL_EAST_TEAMS, NL_CENTRAL_TEAMS, NL_WEST_TEAMS, getDivisionStandings, CURRENT_SEASON, DISPLAY_YEAR, ALL_TEAMS, getTeamById, getTeamBySlug, getScores, getTeamRecord, isPastOpeningDay } from './espn.js';
import { renderScores } from './components/Scores.js';
import { renderSchedule } from './components/Schedule.js';
import { renderMobileNav } from './components/MobileNav.js';
import { startLiveScoresTicker } from './components/LiveScoresTicker.js';
import { Router } from './router.js';
import './style.css';

const router = new Router();
let liveScoresCleanup = null;

// Initialize theme based on OS preference
function initializeTheme() {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Listen for OS theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (e.matches) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});

// Initialize theme on load
initializeTheme();

// Clean up on page unload
window.addEventListener('unload', () => {
  if (liveScoresCleanup) {
    liveScoresCleanup();
  }
});

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
      <div id="live-scores-ticker"></div>
      <main class="flex-1 grid md:grid-cols-2 lg:grid-cols-3 pb-16 sm:pb-0">
        <div class="border-r border-gray-200 dark:border-gray-800 ${tab !== 'scores' ? 'sm:block hidden' : ''}">
          <section class="w-full mx-auto p-6 mb-[200px]">
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
        </div>
        <div class="border-r border-gray-200 dark:border-gray-800 ${tab !== 'schedule' ? 'sm:block hidden' : ''}">
          <section class="w-full mx-auto p-6 mb-[200px]">
            <h2 class="font-semibold text-2xl mb-4">Schedule • ${DISPLAY_YEAR}</h2>
            ${teamId ? '<div id="schedule"></div>' : 
              '<p class="text-gray-600 dark:text-gray-400">Select a team to view schedule</p>'}
          </section>
        </div>
        <div class="${tab !== 'division' ? 'sm:block hidden' : ''}">
          <section class="w-full mx-auto p-6 mb-[200px]">
            <div class="mb-6">
              <h2 class="font-semibold text-2xl">Division Standings <span id="division-name-header" class="text-gray-500 dark:text-gray-400 text-lg"></span></h2>
            </div>
            ${teamId ? '<div id="standings"></div>' : 
              '<p class="text-gray-600 dark:text-gray-400">Select a team to view standings</p>'}
          </section>
        </div>
      </main>
    </div>
  `;

  // First time setup
  if (!document.getElementById('app-content')) {
    app.innerHTML = `
      <div id="app-content"></div>
      <div id="mobile-nav" class="sm:hidden"></div>
    `;
    
    // Initial mobile nav render
    const mobileNav = document.getElementById('mobile-nav');
    mobileNav.innerHTML = renderMobileNav(window.location.pathname);
  }
  
  // Always update main content
  document.getElementById('app-content').innerHTML = mainContent;
  
  // Update mobile nav classes without full re-render
  const mobileNav = document.getElementById('mobile-nav');
  const currentTab = params.get('tab') || 'scores';
  const links = mobileNav.querySelectorAll('a');
  links.forEach(link => {
    const tab = new URL(link.href).searchParams.get('tab');
    const baseClasses = 'flex flex-col items-center justify-center w-full h-full';
    const isActive = tab === currentTab;
    link.className = `${baseClasses} ${isActive ? '!text-gray-900 dark:!text-gray-100' : '!text-gray-500 dark:!text-gray-400'}`;
  });

  // Wait for next tick to ensure DOM is updated
  setTimeout(async () => {
    if (teamId) {
      // Render main content first
      const renderPromises = [];

      // On desktop or if scores tab is active, render scores
      if (!tab || tab === 'scores') {
        renderPromises.push(renderScores(teamId, season));
      }

      // On desktop or if schedule tab is active, render schedule
      if (!tab || tab === 'schedule') {
        renderPromises.push(renderSchedule(teamId, DISPLAY_YEAR));
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
        
        // For 2025, show spring training only if we're not past opening day
        const showSpringTraining = season.toString() === '2025' ? !isPastOpeningDay(season) : false;
        
        // Render standings with appropriate type
        renderPromises.push(renderDivisionStandings(teamId, season, showSpringTraining));
      }

      // Wait for all content to render
      await Promise.all(renderPromises);

      // Start live scores ticker after main content is loaded
      if (liveScoresCleanup) {
        liveScoresCleanup();
      }
      liveScoresCleanup = startLiveScoresTicker();
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
  
  // For 2025, show spring training only if we're not past opening day
  if (season.toString() === '2025') {
    showSpringTraining = !isPastOpeningDay(season);
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