import { Router } from '../router.js';
import { getTeamById } from '../espn.js';

const router = new Router();

export function renderTeamSelect(teams, selectedTeamId) {
  const teamSelect = document.getElementById('team-select');
  
  const html = `
    <h2 class="font-semibold text-2xl mb-4">Team Stats</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-6">
      Select a team to view their stats
    </p>
    <div class="relative">
      <select 
        class="w-full appearance-none bg-[#ccc] dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 pr-8 text-sm"
        id="team-dropdown"
      >
        <option value="" ${!selectedTeamId ? 'selected' : ''}>Select a team...</option>
        ${teams.map(team => `
          <option 
            value="${team.teamId}" 
            ${team.teamId === selectedTeamId ? 'selected' : ''}
          >
            ${team.name}
          </option>
        `).join('')}
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  `;

  teamSelect.innerHTML = html;

  // Add event listener
  const dropdown = document.getElementById('team-dropdown');
  dropdown.addEventListener('change', (e) => {
    const teamId = e.target.value;
    if (teamId) {
      const team = getTeamById(teamId);
      router.navigate(`/${team.slug}`);
    } else {
      router.navigate('/');
    }
  });
} 