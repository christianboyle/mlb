export class Router {
  constructor() {
    this.routes = new Map();
    this.init();
  }

  init() {
    window.addEventListener('popstate', () => this.handleRoute());
    
    // Intercept link clicks for client-side routing
    document.addEventListener('click', (e) => {
      if (e.target.matches('a[href^="/"]')) {
        e.preventDefault();
        const href = e.target.getAttribute('href');
        this.navigate(href);
      }
    });
  }

  addRoute(path, handler) {
    this.routes.set(path, handler);
  }

  async handleRoute() {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    
    // Find matching route handler
    let handler = this.routes.get(path);
    
    // If no exact match, try to match pattern with :teamId
    if (!handler && path.match(/^\/\d+$/)) {
      handler = this.routes.get('/:teamId');
    }

    if (handler) {
      const teamId = path === '/' ? null : path.slice(1);
      await handler({ teamId, params });

      // Update active state in mobile nav based on tab
      const tab = params.get('tab');
      if (teamId) {
        const links = document.querySelectorAll('nav a');
        links.forEach(link => {
          const isActive = tab === 'schedule' ? 
            link.href.includes('schedule') : 
            !link.href.includes('schedule') && link.href !== '/';
          
          if (isActive) {
            link.classList.remove('text-gray-500', 'dark:text-gray-400');
            link.classList.add('text-gray-900', 'dark:text-gray-100');
          } else if (!link.href.endsWith('/')) {
            link.classList.add('text-gray-500', 'dark:text-gray-400');
            link.classList.remove('text-gray-900', 'dark:text-gray-100');
          }
        });
      }
    } else {
      // Default to home page without teamId
      const defaultHandler = this.routes.get('/');
      if (defaultHandler) await defaultHandler({ teamId: null, params });
    }
  }

  async navigate(url, replace = false) {
    if (replace) {
      window.history.replaceState({}, '', url);
    } else {
      window.history.pushState({}, '', url);
    }
    await this.handleRoute();
  }
} 