import { getSchedule, getTeamById, getLiveGameDetails, isPastOpeningDay } from '../espn.js';
import { renderScheduleControls, updateScheduleSpringTrainingButton } from './ScheduleControls.js';
import { getTeamPromotions } from '../promotions.js';
import { initPromotionModal, showPromotionModal } from './PromotionModal.js';

// Store intervals by game ID to clean them up later
const liveGameIntervals = new Map();

// Function to update live game details in the DOM
async function updateLiveGameDetails(gameId) {
  const liveGameDetails = await getLiveGameDetails(gameId);
  if (!liveGameDetails) {
    return;
  }

  const gameContainer = document.querySelector(`[data-game-id="${gameId}"]`);
  if (!gameContainer) {
    return;
  }

  const liveGameElement = gameContainer.querySelector('.live-game-details');
  const badgeElement = gameContainer.querySelector('a[target="_blank"]');
  
  // Check game state from API
  const isComplete = liveGameDetails.header?.competitions?.[0]?.status?.type?.completed || false;
  const gameState = liveGameDetails.header?.competitions?.[0]?.status?.type?.state;
  const detail = liveGameDetails.header?.competitions?.[0]?.status?.type?.detail;
  
  // More comprehensive game state check
  const isInProgress = gameState === 'in' || 
                      (gameState === 'post' && !isComplete) ||
                      (gameState === 'pre' && detail && detail !== 'Scheduled');

  // If game is transitioning to live state
  const currentBadgeText = badgeElement?.textContent?.trim();
  
  if (currentBadgeText === 'UPCOMING' && isInProgress) {
    // Update the badge
    badgeElement.className = 'px-3 py-0.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors';
    badgeElement.textContent = 'LIVE';

    // Show and populate the live game details section
    if (liveGameElement) {
      liveGameElement.style.display = 'block';
      // Populate the scoreboard content immediately
      liveGameElement.innerHTML = `
        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between">
            <div class="font-medium text-gray-900 dark:text-white">
              ${isComplete ? 'FINAL' : liveGameDetails?.header?.competitions?.[0]?.status?.type?.detail || 'In Progress'}
            </div>
            <div class="flex items-center gap-6">
              ${liveGameDetails?.boxscore?.teams?.map((team, index) => `
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
      `;
    }
  }

  // If no live game element or game isn't in progress/complete, don't proceed with updates
  if (!liveGameElement || (!isInProgress && !isComplete)) {
    return;
  }

  // Get current values before update
  const previousInning = liveGameElement.querySelector('.font-medium.text-gray-900')?.textContent;
  const previousScores = Array.from(liveGameElement.querySelectorAll('.flex.items-center.gap-2 span')).map(span => span.textContent);
  const previousOuts = liveGameElement.querySelector('.text-gray-600')?.textContent.split(' ')[0] || '0';

  // Get new values
  const newInning = liveGameDetails.header?.competitions?.[0]?.status?.type?.detail || 'In Progress';
  const newScores = liveGameDetails.boxscore?.teams?.map(team => 
    team.statistics?.find(stat => stat.name === 'batting')?.stats?.find(stat => stat.name === 'runs')?.displayValue || '0'
  ) || [];
  const newOuts = liveGameDetails.situation?.outs || 0;

  // Format outs text with correct pluralization
  const outsText = newOuts === 1 ? '1 out' : `${newOuts} outs`;

  // Format runners text
  const runnersText = [
    liveGameDetails.situation?.onFirst ? '🏃1B' : '',
    liveGameDetails.situation?.onSecond ? '🏃2B' : '',
    liveGameDetails.situation?.onThird ? '🏃3B' : ''
  ].filter(Boolean).join(' ');

  // Determine what changed
  const inningChanged = previousInning !== newInning;
  const scoresChanged = previousScores.some((score, i) => {
    const prevScore = parseInt(score) || 0;
    const newScore = parseInt(newScores[i]) || 0;
    return prevScore !== newScore;
  });
  const outsIncreased = parseInt(newOuts) > parseInt(previousOuts);

  // Determine flash color based on type of change
  let flashColor = 'rgba(34, 197, 94, 0.2)'; // Default green for positive changes
  if (outsIncreased) {
    flashColor = 'rgba(239, 68, 68, 0.2)'; // Red for increased outs
  } else if (scoresChanged) {
    // Keep green for scoring changes as it's a positive event
    flashColor = 'rgba(34, 197, 94, 0.2)';
  }

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
  if (inningChanged || scoresChanged || outsIncreased) {
    liveGameElement.style.transition = 'background-color 0.5s ease';
    liveGameElement.style.backgroundColor = flashColor;
    
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
    
    // Update the LIVE/ENDED badge
    if (badgeElement) {
      badgeElement.className = 'px-3 py-0.5 bg-gray-600 text-white text-xs font-medium rounded-md hover:bg-gray-700 transition-colors';
      badgeElement.textContent = 'ENDED';
    }
  }
}

// Function to start polling for a live game
function startLiveGamePolling(gameId, startTime) {
  // Clear any existing interval for this game
  if (liveGameIntervals.has(gameId)) {
    clearInterval(liveGameIntervals.get(gameId));
  }

  // Immediately check current state
  const now = new Date().getTime();
  const gameStartTime = startTime.getTime();

  // If game has already started
  if (now >= gameStartTime) {
    const liveInterval = setInterval(() => updateLiveGameDetails(gameId), 30000);
    liveGameIntervals.set(gameId, liveInterval);
    // Immediately update to show live status
    updateLiveGameDetails(gameId);
    return;
  }
  
  // If we're within 5 minutes of start time
  if (now >= gameStartTime - 300000) {
    const newInterval = setInterval(async () => {
      const currentTime = new Date().getTime();
      if (currentTime >= gameStartTime) {
        clearInterval(newInterval);
        const liveInterval = setInterval(() => updateLiveGameDetails(gameId), 30000);
        liveGameIntervals.set(gameId, liveInterval);
        // Immediately update to show live status
        updateLiveGameDetails(gameId);
      } else {
        // Still check for early starts
        updateLiveGameDetails(gameId);
      }
    }, 10000);
    liveGameIntervals.set(gameId, newInterval);
    return;
  }

  // Otherwise start with 1-minute polling
  const interval = setInterval(async () => {
    const now = new Date().getTime();
    const gameStartTime = startTime.getTime();
    
    // If we get within 5 minutes of start time
    if (now >= gameStartTime - 300000) {
      clearInterval(interval);
      const newInterval = setInterval(async () => {
        const currentTime = new Date().getTime();
        if (currentTime >= gameStartTime) {
          clearInterval(newInterval);
          const liveInterval = setInterval(() => updateLiveGameDetails(gameId), 30000);
          liveGameIntervals.set(gameId, liveInterval);
          // Immediately update to show live status
          updateLiveGameDetails(gameId);
        } else {
          // Still check for early starts
          updateLiveGameDetails(gameId);
        }
      }, 10000);
      liveGameIntervals.set(gameId, newInterval);
      return;
    }
    
    // If the game should have started
    if (now >= gameStartTime) {
      clearInterval(interval);
      const liveInterval = setInterval(() => updateLiveGameDetails(gameId), 30000);
      liveGameIntervals.set(gameId, liveInterval);
      // Immediately update to show live status
      updateLiveGameDetails(gameId);
      return;
    }
    
    // Otherwise just check if game started early
    updateLiveGameDetails(gameId);
  }, 60000);

  liveGameIntervals.set(gameId, interval);
  
  // Do an immediate check for early starts
  updateLiveGameDetails(gameId);
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
  // Initialize the promotion modal
  initPromotionModal();

  // Clean up any existing polling intervals when re-rendering
  cleanupAllPolling();

  try {
    const [data, promotions] = await Promise.all([
      getSchedule(teamId, season),
      getTeamPromotions(teamId)
    ]);
    
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

        // Get live game details if the game is today
        let liveGameDetails = null;
        if (isToday) {
          liveGameDetails = await getLiveGameDetails(game.id);
        }

        // Check if game is complete or in progress
        const isComplete = liveGameDetails?.header?.competitions?.[0]?.status?.type?.completed || false;
        const gameState = liveGameDetails?.header?.competitions?.[0]?.status?.type?.state;
        const isInProgress = gameState === 'in' || (gameState === 'post' && !isComplete);

        // Get ESPN gamecast URL
        const gamecastUrl = `https://www.espn.com/mlb/game/_/gameId/${game.id}`;
        
        // Get full team info to access slug
        const opposingTeamInfo = getTeamById(opposingTeam.team.id);

        // Check for promotions
        const gameDate = date.toISOString().split('T')[0];
        const hasPromotion = promotions[gameDate];
        
        return `
          <div data-game-id="${game.id}" ${game.isSpringTraining ? 'data-spring-training="true"' : ''} style="${game.isSpringTraining && season !== 2025 ? 'display: none;' : ''}">
            <div class="flex items-center justify-between px-0 min-[450px]:px-4 py-2">
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
              </div>
              <div class="flex items-center gap-4">
                ${isToday ? 
                  isComplete || isInProgress ? `
                    <a href="${gamecastUrl}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="px-3 py-0.5 ${isComplete ? 'bg-gray-600' : 'bg-red-600'} text-white text-xs font-medium rounded-md hover:${isComplete ? 'bg-gray-700' : 'bg-red-700'} transition-colors">
                      ${isComplete ? 'ENDED' : 'LIVE'}
                    </a>
                  ` : `
                    <a href="${gamecastUrl}"
                       target="_blank"
                       rel="noopener noreferrer"
                       class="px-3 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                      UPCOMING
                    </a>
                  `
                : ''}
                <div class="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <div class="relative">
                    ${isHome ? `
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house h-4 w-4 ${hasPromotion ? 'text-green-600 dark:text-green-400' : ''}" ${hasPromotion ? `title="${hasPromotion.name.replace(/"/g, '&quot;')}" onclick="window.showPromotionModal('${hasPromotion.name.replace(/'/g, "\\'")}', ${JSON.stringify(hasPromotion.promotions).replace(/"/g, '&quot;')})"` : ''}>
                        <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
                        <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      </svg>
                    ` : `
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plane h-4 w-4 ${hasPromotion ? 'text-green-600 dark:text-green-400' : ''}" ${hasPromotion ? `title="${hasPromotion.name.replace(/"/g, '&quot;')}" onclick="window.showPromotionModal('${hasPromotion.name.replace(/'/g, "\\'")}', ${JSON.stringify(hasPromotion.promotions).replace(/"/g, '&quot;')})"` : ''}>
                        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
                      </svg>
                    `}
                    ${game.isSpringTraining ? `
                      <div class="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full absolute -right-2 top-1/2 -translate-y-1/2"></div>
                    ` : ''}
                  </div>
                </div>
              </div>
            </div>
            ${isComplete || isInProgress ? `
              <div class="px-0 min-[450px]:px-4 py-2 text-sm live-game-details border-t border-dotted border-gray-200 dark:border-gray-700" style="display: ${isComplete || isInProgress ? 'block' : 'none'}">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center justify-between">
                    <div class="font-medium text-gray-900 dark:text-white">
                      ${isComplete ? 'FINAL' : liveGameDetails?.header?.competitions?.[0]?.status?.type?.detail || 'In Progress'}
                    </div>
                    <div class="flex items-center gap-6">
                      ${liveGameDetails?.boxscore?.teams?.map(team => `
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
                  ${liveGameDetails?.situation ? `
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

      // After rendering, start polling for any live games and upcoming games
      upcomingGames.forEach(async game => {
        const now = new Date();
        const gameDate = new Date(game.date);
        const gameStartTime = gameDate.getTime();
        const currentTime = now.getTime();
        const fourHoursInMs = 4 * 60 * 60 * 1000;
        const isLive = currentTime >= gameStartTime && currentTime <= (gameStartTime + fourHoursInMs);
        const isUpcomingToday = gameDate.toDateString() === now.toDateString() && currentTime < gameStartTime;

        // Start polling for both live games and upcoming games today
        if (isLive || isUpcomingToday) {
          // Check if game is already complete before starting polling
          const liveGameDetails = await getLiveGameDetails(game.id);
          const isComplete = liveGameDetails?.header?.competitions?.[0]?.status?.type?.completed || false;
          
          if (!isComplete) {
            startLiveGamePolling(game.id, gameDate);
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
          ${!isPastOpeningDay(season) ? renderScheduleControls() : '<div></div>'}
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
    if (springTrainingToggle && !isPastOpeningDay(season)) {
      springTrainingToggle.addEventListener('click', (e) => {
        const button = e.currentTarget;
        const newEnabled = button.dataset.enabled !== 'true';
        updateScheduleSpringTrainingButton(newEnabled);

        // Filter games and update borders
        const games = document.querySelectorAll('#schedule-list > div[data-spring-training="true"]');
        games.forEach(game => {
          game.style.display = newEnabled ? 'block' : 'none';
        });

        // Update first visible item's border
        const firstVisibleItem = document.querySelector('#schedule-list > div:not([style*="display: none"])');
        if (firstVisibleItem) {
          // Remove top border from first visible item
          firstVisibleItem.style.borderTopWidth = '0';
        }

        // Update game count
        const visibleGames = Array.from(document.querySelectorAll('#schedule-list > div')).filter(
          div => div.style.display !== 'none' && !div.classList.contains('mt-6')
        );
        document.getElementById('schedule-game-count').textContent = `${visibleGames.length} Games`;
      });
    }

    // Initial state - show spring training games for 2025 only if we're not past opening day
    if (springTrainingToggle) {
      const shouldShowSpringTraining = season === 2025 && !isPastOpeningDay(season);
      updateScheduleSpringTrainingButton(shouldShowSpringTraining);
      
      // Update initial visibility of spring training games
      const games = document.querySelectorAll('#schedule-list > div[data-spring-training="true"]');
      games.forEach(game => {
        game.style.display = shouldShowSpringTraining ? 'block' : 'none';
      });

      // Update first visible item's border
      const firstVisibleItem = document.querySelector('#schedule-list > div:not([style*="display: none"])');
      if (firstVisibleItem) {
        // Remove top border from first visible item
        firstVisibleItem.style.borderTopWidth = '0';
      }

      // Update game count to only include visible games
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