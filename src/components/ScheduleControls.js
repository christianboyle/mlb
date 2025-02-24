export function renderScheduleControls() {
  return `
    <div class="flex items-center gap-4">
      <button 
        id="schedule-spring-training-toggle"
        class="text-sm px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-gray-900 dark:text-gray-100"
        data-enabled="true"
      >
        Spring Training
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye h-4 w-4">
          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>
    </div>
  `;
}

export function updateScheduleSpringTrainingButton(enabled) {
  const button = document.getElementById('schedule-spring-training-toggle');
  if (!button) return;

  button.dataset.enabled = enabled;
  button.className = `text-sm px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 ${
    enabled ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
  }`;

  button.innerHTML = `
    Spring Training
    ${enabled ? `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye h-4 w-4">
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    ` : `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off h-4 w-4">
        <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"></path>
        <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"></path>
        <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"></path>
        <path d="m2 2 20 20"></path>
      </svg>
    `}
  `;
} 