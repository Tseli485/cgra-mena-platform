/**
 * Dashboard Module for CGRA
 * Displays quick statistics and navigation shortcuts
 * Independent module that can be loaded without other modules
 */

class DashboardModule {
  constructor(database = null) {
    this.db = database || window.cgraDB;
    this.containerElement = null;
    this.stats = {
      totalResources: 0,
      totalProjects: 0,
      activeTasks: 0,
      menaPhasesCount: 0,
      recentCacheItems: 0
    };
    this.initialized = false;
  }

  /**
   * Initialize the dashboard module
   * Waits for database to be ready if not provided
   */
  async init() {
    console.log('[Dashboard] Initializing Dashboard Module');

    // Wait for database if not yet available
    if (!this.db && !window.cgraDB) {
      console.log('[Dashboard] Waiting for database initialization');
      await this.waitForDatabase();
    }

    if (!this.db) {
      this.db = window.cgraDB;
    }

    if (!this.db) {
      console.error('[Dashboard] Database not available after initialization');
      return false;
    }

    this.initialized = true;
    console.log('[Dashboard] Dashboard Module initialized');
    return true;
  }

  /**
   * Wait for database ready event
   */
  waitForDatabase() {
    return new Promise((resolve) => {
      if (window.cgraDB) {
        resolve();
      } else {
        const handler = () => {
          window.removeEventListener('cgradb-ready', handler);
          resolve();
        };
        window.addEventListener('cgradb-ready', handler);
        // Timeout after 10 seconds
        setTimeout(resolve, 10000);
      }
    });
  }

  /**
   * Load summary statistics from IndexedDB
   */
  async loadStats() {
    console.log('[Dashboard] Loading statistics from database');

    try {
      // Load data from all stores
      const projects = await this.db.getAll('projects');
      const tasks = await this.db.getAll('tasks');
      const cache = await this.db.getAll('cache');

      // Calculate statistics
      this.stats.totalProjects = projects.length;
      this.stats.totalResources = projects.length + tasks.length;

      // Count active tasks (assuming tasks have a status field)
      this.stats.activeTasks = tasks.filter(task =>
        task.status && task.status !== 'completed' && task.status !== 'archived'
      ).length;

      // Count MENA phases (assuming some tasks/projects are tagged with MENA)
      this.stats.menaPhasesCount = tasks.filter(task =>
        task.phase && task.phase.toLowerCase().includes('mena')
      ).length;

      // Count recent cache items
      this.stats.recentCacheItems = cache.length;

      console.log('[Dashboard] Statistics loaded:', this.stats);
      return this.stats;
    } catch (error) {
      console.error('[Dashboard] Error loading statistics:', error);
      return this.stats;
    }
  }

  /**
   * Render the dashboard UI
   * Creates a responsive dashboard with stat cards and navigation
   */
  async render(targetSelector = '#dashboard') {
    console.log('[Dashboard] Rendering dashboard');

    if (!this.initialized) {
      const success = await this.init();
      if (!success) {
        console.error('[Dashboard] Failed to initialize before rendering');
        return;
      }
    }

    // Find target element
    this.containerElement = document.querySelector(targetSelector);
    if (!this.containerElement) {
      console.error(`[Dashboard] Target element not found: ${targetSelector}`);
      return;
    }

    // Load statistics
    await this.loadStats();

    // Build dashboard HTML
    const dashboardHTML = this.buildDashboardHTML();
    this.containerElement.innerHTML = dashboardHTML;

    // Attach event listeners
    this.attachEventListeners();

    console.log('[Dashboard] Dashboard rendered successfully');
  }

  /**
   * Build the dashboard HTML structure
   */
  buildDashboardHTML() {
    return `
      <div class="dashboard-container">
        <!-- Dashboard Header -->
        <div class="dashboard-header">
          <h1>Dashboard</h1>
          <p class="subtitle">Quick Overview & Navigation</p>
        </div>

        <!-- Stats Grid -->
        <div class="dashboard-stats-grid">
          <!-- Total Resources Card -->
          <div class="stat-card stat-resources">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <div class="stat-value">${this.stats.totalResources}</div>
              <div class="stat-label">Total Resources</div>
            </div>
            <div class="stat-trend">All projects and tasks</div>
          </div>

          <!-- Total Projects Card -->
          <div class="stat-card stat-projects">
            <div class="stat-icon">📁</div>
            <div class="stat-content">
              <div class="stat-value">${this.stats.totalProjects}</div>
              <div class="stat-label">Projects</div>
            </div>
            <div class="stat-trend">Active research projects</div>
          </div>

          <!-- Active Tasks Card -->
          <div class="stat-card stat-tasks">
            <div class="stat-icon">✓</div>
            <div class="stat-content">
              <div class="stat-value">${this.stats.activeTasks}</div>
              <div class="stat-label">Active Tasks</div>
            </div>
            <div class="stat-trend">In progress or pending</div>
          </div>

          <!-- MENA Phases Card -->
          <div class="stat-card stat-mena">
            <div class="stat-icon">🌍</div>
            <div class="stat-content">
              <div class="stat-value">${this.stats.menaPhasesCount}</div>
              <div class="stat-label">MENA Phases</div>
            </div>
            <div class="stat-trend">Middle East & North Africa research</div>
          </div>

          <!-- Cached Items Card -->
          <div class="stat-card stat-cache">
            <div class="stat-icon">💾</div>
            <div class="stat-content">
              <div class="stat-value">${this.stats.recentCacheItems}</div>
              <div class="stat-label">Cached Items</div>
            </div>
            <div class="stat-trend">Offline data ready</div>
          </div>
        </div>

        <!-- Navigation Shortcuts -->
        <div class="dashboard-navigation">
          <h2>Quick Navigation</h2>
          <div class="nav-shortcuts-grid">
            <a href="#projects" class="nav-shortcut nav-projects">
              <span class="nav-icon">📊</span>
              <span class="nav-label">Projects</span>
              <span class="nav-desc">Manage research projects</span>
            </a>
            <a href="#tasks" class="nav-shortcut nav-tasks">
              <span class="nav-icon">✓</span>
              <span class="nav-label">Tasks</span>
              <span class="nav-desc">Track work items</span>
            </a>
            <a href="#analysis" class="nav-shortcut nav-analysis">
              <span class="nav-icon">📈</span>
              <span class="nav-label">Analysis</span>
              <span class="nav-desc">View data insights</span>
            </a>
            <a href="#settings" class="nav-shortcut nav-settings">
              <span class="nav-icon">⚙️</span>
              <span class="nav-label">Settings</span>
              <span class="nav-desc">Configure app</span>
            </a>
            <a href="#sync" class="nav-shortcut nav-sync">
              <span class="nav-icon">🔄</span>
              <span class="nav-label">Sync</span>
              <span class="nav-desc">Sync data offline</span>
            </a>
            <a href="#help" class="nav-shortcut nav-help">
              <span class="nav-icon">❓</span>
              <span class="nav-label">Help</span>
              <span class="nav-desc">Get support</span>
            </a>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="dashboard-actions">
          <h2>Quick Actions</h2>
          <div class="actions-container">
            <button class="action-btn action-new-project" data-action="new-project">
              <span class="action-icon">➕</span> New Project
            </button>
            <button class="action-btn action-new-task" data-action="new-task">
              <span class="action-icon">➕</span> New Task
            </button>
            <button class="action-btn action-refresh" data-action="refresh-data">
              <span class="action-icon">🔄</span> Refresh Data
            </button>
            <button class="action-btn action-export" data-action="export-data">
              <span class="action-icon">📥</span> Export Data
            </button>
          </div>
        </div>

        <!-- Last Updated -->
        <div class="dashboard-footer">
          <p class="last-updated">Last updated: <span id="last-update">${new Date().toLocaleTimeString()}</span></p>
          <p class="storage-status">Database Status: <span id="db-status" class="status-ready">Ready</span></p>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners to dashboard elements
   */
  attachEventListeners() {
    if (!this.containerElement) return;

    // Action buttons
    const actionButtons = this.containerElement.querySelectorAll('[data-action]');
    actionButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleActionClick(e, btn.dataset.action));
    });

    // Navigation shortcuts
    const navShortcuts = this.containerElement.querySelectorAll('.nav-shortcut');
    navShortcuts.forEach(shortcut => {
      shortcut.addEventListener('click', (e) => {
        // Allow natural navigation
        console.log('[Dashboard] Navigation:', shortcut.href);
      });
    });
  }

  /**
   * Handle action button clicks
   */
  handleActionClick(event, action) {
    console.log('[Dashboard] Action clicked:', action);
    event.preventDefault();

    switch (action) {
      case 'new-project':
        this.emitEvent('dashboard:new-project');
        break;
      case 'new-task':
        this.emitEvent('dashboard:new-task');
        break;
      case 'refresh-data':
        this.refreshData();
        break;
      case 'export-data':
        this.emitEvent('dashboard:export-data');
        break;
      default:
        console.warn('[Dashboard] Unknown action:', action);
    }
  }

  /**
   * Refresh dashboard data
   */
  async refreshData() {
    console.log('[Dashboard] Refreshing dashboard data');
    await this.loadStats();
    // Update stat values in UI
    if (this.containerElement) {
      const statCards = this.containerElement.querySelectorAll('.stat-value');
      const values = [
        this.stats.totalResources,
        this.stats.totalProjects,
        this.stats.activeTasks,
        this.stats.menaPhasesCount,
        this.stats.recentCacheItems
      ];

      statCards.forEach((card, index) => {
        if (values[index] !== undefined) {
          card.textContent = values[index];
        }
      });

      // Update last updated time
      const lastUpdate = this.containerElement.querySelector('#last-update');
      if (lastUpdate) {
        lastUpdate.textContent = new Date().toLocaleTimeString();
      }
    }
    this.emitEvent('dashboard:data-refreshed');
  }

  /**
   * Emit custom events for other modules to listen to
   */
  emitEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, {
      detail: {
        module: 'dashboard',
        timestamp: Date.now(),
        ...detail
      }
    });
    window.dispatchEvent(event);
    console.log('[Dashboard] Event emitted:', eventName);
  }

  /**
   * Destroy the dashboard (cleanup)
   */
  destroy() {
    if (this.containerElement) {
      this.containerElement.innerHTML = '';
    }
    this.initialized = false;
    console.log('[Dashboard] Dashboard destroyed');
  }
}

// Export for use in other modules/scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DashboardModule;
}
