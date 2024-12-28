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
        this.navigate(e.target.href);
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
      const teamId = path === '/' ? null : path.slice(1); // No teamId on root path
      await handler({ teamId, params });
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