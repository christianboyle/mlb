import { getSchedule, getTeamById } from '../espn.js';
import { renderScheduleControls, updateScheduleSpringTrainingButton } from './ScheduleControls.js';

// Store intervals by game ID to clean them up later
const liveGameIntervals = new Map();

// Add function to fetch live game details
async function getLiveGameDetails(gameId) {
  try {
    const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/summary?event=${gameId}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching live game details:', error);
    return null;
  }
}

// Function to update live game details in the DOM
async function updateLiveGameDetails(gameId) {
  const liveGameDetails = await getLiveGameDetails(gameId);
  if (!liveGameDetails) return;

  const liveGameElement = document.querySelector(`[data-game-id="${gameId}"] .live-game-details`);
  if (!liveGameElement) return;

  // Get current values before update
  const previousInning = liveGameElement.querySelector('.font-medium.text-gray-900')?.textContent;
  const previousScores = Array.from(liveGameElement.querySelectorAll('.flex.items-center.gap-2 span')).map(span => span.textContent);

  // Get new values
  const newInning = liveGameDetails.header?.competitions?.[0]?.status?.type?.detail || 'In Progress';
  const newScores = liveGameDetails.boxscore?.teams?.map(team => 
    team.statistics?.find(stat => stat.name === 'batting')?.stats?.find(stat => stat.name === 'runs')?.displayValue || '0'
  ) || [];

  // Check if game is complete
  const isComplete = liveGameDetails.header?.competitions?.[0]?.status?.type?.completed || false;

  // Format outs text with correct pluralization
  const outsCount = liveGameDetails.situation?.outs || 0;
  const outsText = outsCount === 1 ? '1 out' : `${outsCount} outs`;

  // Format runners text
  const runnersText = [
    liveGameDetails.situation?.onFirst ? '🏃1B' : '',
    liveGameDetails.situation?.onSecond ? '🏃2B' : '',
    liveGameDetails.situation?.onThird ? '🏃3B' : ''
  ].filter(Boolean).join(' ');

  // Determine what changed
  const inningChanged = previousInning !== newInning;
  const scoresChanged = previousScores.some((score, i) => score !== newScores[i]);

  liveGameElement.innerHTML = `
    <div class="flex flex-col gap-1">
      <div class="flex items-center justify-between">
        <div class="font-medium text-gray-900 dark:text-white ${inningChanged ? 'font-bold' : ''}">
          ${isComplete ? 'FINAL' : newInning}
        </div>
        <div class="flex items-center gap-6">
          ${liveGameDetails.boxscore?.teams?.map((team, index) => `
            <div class="flex items-center gap-2">
              <img 
                src="${team.team?.logo}"
                alt="${team.team?.displayName || ''}"
                class="h-4 w-4"
              />
              <span class="font-medium text-gray-900 dark:text-white ${previousScores[index] !== newScores[index] ? 'font-bold' : ''}">${team.statistics?.find(stat => stat.name === 'batting')?.stats?.find(stat => stat.name === 'runs')?.displayValue || '0'}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ${!isComplete ? `
        <div class="flex items-center justify-between">
          <div class="text-gray-600 dark:text-white">
            ${outsText}
          </div>
          ${runnersText ? `
            <div class="text-gray-600 dark:text-white text-right">
              ${runnersText}
            </div>
          ` : ''}
        </div>
      ` : ''}
    </div>
  `;

  // If anything changed, add flash effect
  if (inningChanged || scoresChanged) {
    liveGameElement.style.transition = 'background-color 0.5s ease';
    liveGameElement.style.backgroundColor = 'rgba(34, 197, 94, 0.2)'; // Light green
    
    // Reset background color and bold after animation
    setTimeout(() => {
      liveGameElement.style.backgroundColor = '';
      // Remove bold from all elements
      const boldElements = liveGameElement.querySelectorAll('.font-bold');
      boldElements.forEach(el => el.classList.remove('font-bold'));
      // Remove transition after reset to prevent affecting future updates
      setTimeout(() => {
        liveGameElement.style.transition = '';
      }, 500);
    }, 500);
  }

  // If game is complete, stop polling
  if (isComplete) {
    stopLiveGamePolling(gameId);
  }
}

// Function to start polling for a live game
function startLiveGamePolling(gameId) {
  // Clear any existing interval for this game
  if (liveGameIntervals.has(gameId)) {
    clearInterval(liveGameIntervals.get(gameId));
  }

  // Set up new polling interval
  const interval = setInterval(() => {
    updateLiveGameDetails(gameId);
  }, 30000); // Update every 30 seconds

  // Store the interval ID
  liveGameIntervals.set(gameId, interval);
}

// Function to stop polling for a game
function stopLiveGamePolling(gameId) {
  if (liveGameIntervals.has(gameId)) {
    clearInterval(liveGameIntervals.get(gameId));
    liveGameIntervals.delete(gameId);
  }
}

// Clean up all intervals
function cleanupAllPolling() {
  liveGameIntervals.forEach((interval) => clearInterval(interval));
  liveGameIntervals.clear();
}

export async function renderSchedule(teamId, season) {
  // Clean up any existing polling intervals when re-rendering
  cleanupAllPolling();

  try {
    const data = await getSchedule(teamId, season);
    
    // Filter out games that have already happened
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    // Filter to only include upcoming games
    const upcomingGames = data.events.filter(game => {
      const gameDate = new Date(game.date);
      gameDate.setHours(0, 0, 0, 0); // Start of game day
      return gameDate >= today;
    });
    
    // Count spring training and regular season upcoming games
    const upcomingSpringTrainingGames = upcomingGames.filter(e => e.isSpringTraining);
    const upcomingRegularGames = upcomingGames.filter(e => !e.isSpringTraining);
    
    // Build games list HTML
    let gamesListHtml = '<div class="mt-6 text-gray-600 dark:text-gray-400">No upcoming games scheduled.</div>';
    
    if (upcomingGames.length > 0) {
      const gamesList = await Promise.all(upcomingGames.map(async game => {
        const competition = game.competitions;
        if (!competition?.competitors) return '';
        
        const selectedTeam = competition.competitors.find(c => c.team.id === teamId);
        const opposingTeam = competition.competitors.find(c => c.team.id !== teamId);
        
        if (!selectedTeam || !opposingTeam) return '';

        const date = new Date(game.date);
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const isHome = selectedTeam.homeAway === 'home';
        
        // Check if game is today using current time
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        
        // Format game time for all games
        const gameTime = date.toLocaleTimeString('en-US', { 
          hour: 'numeric',
          minute: '2-digit'
        });

        // Check if game is live using actual current time
        const gameStartTime = date.getTime();
        const currentTime = now.getTime();
        const fourHoursInMs = 4 * 60 * 60 * 1000;
        const isLive = currentTime >= gameStartTime && currentTime <= (gameStartTime + fourHoursInMs);

        // Get live game details if the game is today (either live or completed)
        let liveGameDetails = null;
        if (isToday && currentTime >= gameStartTime) {
          liveGameDetails = await getLiveGameDetails(game.id);
        }

        // Check if game is complete
        const isComplete = liveGameDetails?.header?.competitions?.[0]?.status?.type?.completed || false;

        // Get ESPN gamecast URL
        const gamecastUrl = `https://www.espn.com/mlb/game/_/gameId/${game.id}`;
        
        // Get full team info to access slug
        const opposingTeamInfo = getTeamById(opposingTeam.team.id);
        
        return `
          <div data-game-id="${game.id}" ${game.isSpringTraining ? 'data-spring-training="true"' : ''} style="${game.isSpringTraining && season !== 2025 ? 'display: none;' : ''}">
            <div class="flex items-center justify-between px-0 min-[450px]:px-4 py-2 ${
              game.isSpringTraining ? 'bg-yellow-50 bg-opacity-50 dark:bg-yellow-900 dark:bg-opacity-40' : 
              isToday ? 'bg-blue-50 bg-opacity-50 dark:bg-blue-900 dark:bg-opacity-40' : ''
            }">
              <div class="flex items-center">
                <div class="w-14 text-sm text-gray-600 dark:text-gray-400">
                  ${formattedDate}
                  <div class="text-xs">${gameTime}</div>
                </div>
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
                ${isToday ? 
                  currentTime >= gameStartTime ? `
                    <a href="${gamecastUrl}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="ml-4 px-2 py-0.5 ${isComplete ? 'bg-gray-600' : 'bg-red-600'} text-white text-xs font-medium rounded-md hover:${isComplete ? 'bg-gray-700' : 'bg-red-700'} transition-colors inline-flex items-center gap-1">
                      ${isComplete ? 'ENDED' : 'LIVE'}
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
                    </a>
                  ` : `
                    <span class="ml-4 px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium rounded-md">
                      UPCOMING
                    </span>
                  `
                : ''}
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
            ${(isLive || (isToday && liveGameDetails?.header?.competitions?.[0]?.status?.type?.completed)) && liveGameDetails ? `
              <div class="px-0 min-[450px]:px-4 py-2 bg-gray-50 dark:bg-yellow-900 dark:bg-opacity-40 text-sm live-game-details">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center justify-between">
                    <div class="font-medium text-gray-900 dark:text-white">
                      ${isComplete ? 'FINAL' : liveGameDetails.header?.competitions?.[0]?.status?.type?.detail || 'In Progress'}
                    </div>
                    <div class="flex items-center gap-6">
                      ${liveGameDetails.boxscore?.teams?.map(team => `
                        <div class="flex items-center gap-2">
                          <img 
                            src="${team.team?.logo}"
                            alt="${team.team?.displayName || ''}"
                            class="h-4 w-4"
                          />
                          <span class="font-medium text-gray-900 dark:text-white">${team.statistics?.find(stat => stat.name === 'batting')?.stats?.find(stat => stat.name === 'runs')?.displayValue || '0'}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                  ${!isComplete ? `
                    <div class="flex items-center justify-between">
                      <div class="text-gray-600 dark:text-white">
                        ${liveGameDetails.situation?.outs === 1 ? '1 out' : `${liveGameDetails.situation?.outs || '0'} outs`}
                      </div>
                      ${[
                        liveGameDetails.situation?.onFirst ? '🏃1B' : '',
                        liveGameDetails.situation?.onSecond ? '🏃2B' : '',
                        liveGameDetails.situation?.onThird ? '🏃3B' : ''
                      ].filter(Boolean).length > 0 ? `
                        <div class="text-gray-600 dark:text-white text-right">
                          ${[
                            liveGameDetails.situation?.onFirst ? '🏃1B' : '',
                            liveGameDetails.situation?.onSecond ? '🏃2B' : '',
                            liveGameDetails.situation?.onThird ? '🏃3B' : ''
                          ].filter(Boolean).join(' ')}
                        </div>
                      ` : ''}
                    </div>
                  ` : ''}
                </div>
              </div>
            ` : ''}
          </div>
        `;
      }));
      
      gamesListHtml = gamesList.join('');

      // After rendering, start polling for any live games
      upcomingGames.forEach(async game => {
        const now = new Date();
        const gameStartTime = new Date(game.date).getTime();
        const currentTime = now.getTime();
        const fourHoursInMs = 4 * 60 * 60 * 1000;
        const isLive = currentTime >= gameStartTime && currentTime <= (gameStartTime + fourHoursInMs);

        if (isLive) {
          // Check if game is already complete before starting polling
          const liveGameDetails = await getLiveGameDetails(game.id);
          const isComplete = liveGameDetails?.header?.competitions?.[0]?.status?.type?.completed || false;
          
          if (!isComplete) {
            startLiveGamePolling(game.id);
          }
        }
      });
    }

    const scheduleHtml = `
      <div>
        <!-- Controls -->
        <div class="flex items-center justify-between mb-4">
          <div id="schedule-game-count" class="text-sm text-gray-500">
            ${upcomingRegularGames.length} Games
          </div>
          ${renderScheduleControls()}
        </div>

        <!-- Games List -->
        <div id="schedule-list" class="divide-y divide-gray-200 dark:divide-gray-800">
          ${gamesListHtml}
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
        const games = document.querySelectorAll('#schedule-list > div[data-spring-training="true"]');
        games.forEach(game => {
          game.style.display = newEnabled ? 'block' : 'none';
        });

        // Update game count
        const visibleGames = Array.from(document.querySelectorAll('#schedule-list > div')).filter(
          div => div.style.display !== 'none' && !div.classList.contains('mt-6')
        );
        document.getElementById('schedule-game-count').textContent = `${visibleGames.length} Games`;
      });
    }

    // Initial state - show spring training games for 2025, hide for other years
    if (springTrainingToggle) {
      const shouldShowSpringTraining = season === 2025;
      updateScheduleSpringTrainingButton(shouldShowSpringTraining);
      
      // Update initial visibility of spring training games
      const games = document.querySelectorAll('#schedule-list > div[data-spring-training="true"]');
      games.forEach(game => {
        game.style.display = shouldShowSpringTraining ? 'block' : 'none';
      });

      // Update game count
      const visibleGames = Array.from(document.querySelectorAll('#schedule-list > div')).filter(
        div => div.style.display !== 'none' && !div.classList.contains('mt-6')
      );
      document.getElementById('schedule-game-count').textContent = `${visibleGames.length} Games`;
    }

  } catch (error) {
    console.error('Error rendering schedule:', error);
    document.getElementById('schedule').innerHTML = '<div class="text-red-500">Error loading schedule</div>';
  }
}

// Add cleanup on page unload
window.addEventListener('unload', cleanupAllPolling); 