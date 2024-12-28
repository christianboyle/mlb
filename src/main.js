import { AL_CENTRAL_TEAMS, getDivisionStandings, CURRENT_SEASON, DISPLAY_YEAR } from './espn.js';
import { renderScores } from './components/Scores.js';
import { renderSchedule } from './components/Schedule.js';
import { Router } from './router.js';
import './style.css';

const router = new Router();

async function renderHome({ teamId, params }) {
  const season = params.get('season') || CURRENT_SEASON;
  const app = document.getElementById('app');

  const mainContent = `
    <div class="flex-grow overflow-y-scroll h-[calc(100vh_-_48px)] border-b border-gray-200 dark:border-gray-800">
      <main class="grid md:grid-cols-2 lg:grid-cols-3">
        <section class="w-full mx-auto p-6 border-r border-gray-200 dark:border-gray-800">
          ${teamId ? 
            '<div id="scores"></div>' : 
            `<h2 class="font-semibold text-2xl mb-4">Team Stats</h2>
             <p class="text-gray-600 dark:text-gray-400 mb-6">Select a team to view their stats</p>
             <div class="max-w-xs">
               <div class="relative">
                 <div class="flex items-center gap-2">
                   <div class="relative flex-grow">
                     <select class="appearance-none w-full bg-white dark:bg-black text-gray-800 dark:text-gray-200 font-semibold px-3 py-2 pr-8 rounded-md border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-sans">
                       <option value="">Select a team</option>
                       ${AL_CENTRAL_TEAMS.map(team => `
                         <option value="${team.teamId}">${team.name}</option>
                       `).join('')}
                     </select>
                     <div class="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 flex items-center px-2 text-gray-700 dark:text-gray-300">
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down h-4 w-4">
                         <path d="m6 9 6 6 6-6"></path>
                       </svg>
                     </div>
                   </div>
                 </div>
               </div>
             </div>`
          }
        </section>
        <section class="w-full mx-auto p-6 border-r border-gray-200 dark:border-gray-800">
          <h2 class="font-semibold text-2xl mb-4">Schedule • ${DISPLAY_YEAR}</h2>
          ${teamId ? 
            '<div id="schedule"></div>' : 
            '<div class="text-gray-600 dark:text-gray-400">Select a team to view their schedule</div>'
          }
        </section>
        <section class="w-full mx-auto p-6">
          <h2 class="font-semibold text-2xl mb-4">Division Standings</h2>
          ${teamId ? 
            '<div id="standings"></div>' : 
            '<div class="text-gray-600 dark:text-gray-400">Select a team to view division standings</div>'
          }
        </section>
      </main>
    </div>
  `;

  app.innerHTML = mainContent;

  // Wait for next tick to ensure DOM is updated
  setTimeout(async () => {
    if (teamId) {
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
    } else {
      // Add event listener for team select
      document.querySelector('select').addEventListener('change', (e) => {
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