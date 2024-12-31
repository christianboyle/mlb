export function renderMobileNav(currentPath) {
  const isRoot = currentPath === '/';
  const teamId = isRoot ? null : currentPath.slice(1);
  const params = new URLSearchParams(window.location.search);
  const currentTab = params.get('tab');
  const season = params.get('season');

  const getTabClass = (tabName) => {
    const baseClasses = 'flex flex-col items-center justify-center w-full h-full';
    
    // No team selected = all tabs gray
    if (!teamId) {
      return `${baseClasses} !text-gray-500 dark:!text-gray-400`;
    }

    // Only highlight if tab parameter exactly matches
    const isActive = currentTab === tabName;
    const colorClass = isActive ? '!text-gray-900 dark:!text-gray-100' : '!text-gray-500 dark:!text-gray-400';
    return `${baseClasses} ${colorClass}`;
  };

  const getTabUrl = (tab) => {
    if (!teamId) return '';
    const url = `/${teamId}?tab=${tab}`;
    return season ? `${url}&season=${season}` : url;
  };

  return `
    <nav class="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
      <div class="flex justify-around items-center h-16">
        <a 
          href="${getTabUrl('scores')}" 
          class="${getTabClass('scores')}"
          ${!teamId ? 'aria-disabled="true" style="pointer-events: none;"' : ''}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6">
            <path d="M2 12h20"></path>
            <path d="M10 16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4"></path>
            <path d="M10 8V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4"></path>
            <path d="M20 16v1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-1"></path>
            <path d="M14 8V7c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span class="text-xs mt-1">Scores</span>
        </a>
        <a 
          href="${getTabUrl('schedule')}" 
          class="${getTabClass('schedule')}"
          ${!teamId ? 'aria-disabled="true" style="pointer-events: none;"' : ''}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
            <line x1="16" x2="16" y1="2" y2="6"></line>
            <line x1="8" x2="8" y1="2" y2="6"></line>
            <line x1="3" x2="21" y1="10" y2="10"></line>
          </svg>
          <span class="text-xs mt-1">Schedule</span>
        </a>
        <a 
          href="${getTabUrl('division')}" 
          class="${getTabClass('division')}"
          ${!teamId ? 'aria-disabled="true" style="pointer-events: none;"' : ''}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
          <span class="text-xs mt-1">Division</span>
        </a>
      </div>
    </nav>
  `;
} 