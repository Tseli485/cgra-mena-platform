// PWA App Initialization and Management with Module Integration
class PWAApp {
  constructor() {
    this.swRegistration = null;
    this.deferredPrompt = null;
    this.isOnline = navigator.onLine;
    this.currentModule = 'dashboard';
    this.modules = {};
    this.lifecycleModule = null;
    this.casesModule = null;
    this.dashboardModule = null;
    this.init();
  }

  async init() {
    console.log('[App] Initializing PWA');

    // Register Service Worker
    await this.registerServiceWorker();

    // Setup UI
    this.setupUI();

    // Initialize modules
    await this.initializeModules();

    // Setup navigation
    this.setupNavigation();

    // Setup search functionality
    this.setupGlobalSearch();

    // Setup event listeners
    this.setupEventListeners();

    // Check connection status
    this.updateConnectionStatus();

    // Update app status
    this.updateAppStatus();

    console.log('[App] PWA initialization complete');
  }

  async initializeModules() {
    console.log('[App] Initializing modules');

    try {
      // Initialize Dashboard Module
      this.dashboardModule = new DashboardModule();
      await this.dashboardModule.init();
      await this.dashboardModule.render('#dashboard-container');
      console.log('[App] Dashboard module initialized');

      // Initialize Lifecycle Module with mock data
      const lifecycleData = {
        phases: []
      };
      this.lifecycleModule = new LifecycleModule(null, lifecycleData);
      console.log('[App] Lifecycle module initialized');

      // Initialize Cases Module
      this.casesModule = new CasesModule('#cases-container');
      console.log('[App] Cases module initialized');

      // Store modules for easy access
      this.modules = {
        dashboard: this.dashboardModule,
        lifecycle: this.lifecycleModule,
        cases: this.casesModule
      };
    } catch (error) {
      console.error('[App] Error initializing modules:', error);
    }
  }

  setupNavigation() {
    console.log('[App] Setting up navigation');

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const moduleId = link.dataset.module;
        this.switchModule(moduleId);
      });
    });
  }

  switchModule(moduleId) {
    console.log('[App] Switching to module:', moduleId);

    // Hide all containers
    document.querySelectorAll('.module-container').forEach(container => {
      container.classList.remove('active');
    });

    // Show selected module
    const containerSelector = `#${moduleId}-container`;
    const container = document.querySelector(containerSelector);
    if (container) {
      container.classList.add('active');
    }

    // Update navigation active state
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.dataset.module === moduleId) {
        link.classList.add('active');
      }
    });

    // Update breadcrumb
    this.updateBreadcrumb(moduleId);

    // Load module content if needed
    this.loadModuleContent(moduleId);

    this.currentModule = moduleId;
  }

  updateBreadcrumb(moduleId) {
    const breadcrumb = document.getElementById('breadcrumb');
    const breadcrumbContent = document.getElementById('breadcrumb-content');

    const breadcrumbLabels = {
      dashboard: 'Dashboard',
      role: 'Mon Rôle',
      lifecycle: 'Cycle de Vie',
      procedure: 'Procédure',
      rights: 'Droits',
      cases: 'Cas Pratiques',
      resources: 'Ressources',
      support: 'Support'
    };

    if (moduleId !== 'dashboard') {
      breadcrumbContent.textContent = breadcrumbLabels[moduleId] || moduleId;
      breadcrumb.style.display = 'block';
    } else {
      breadcrumb.style.display = 'none';
    }
  }

  loadModuleContent(moduleId) {
    const container = document.querySelector(`#${moduleId}-container`);
    if (!container) return;

    // Skip if already loaded
    if (container.children.length > 0) return;

    console.log('[App] Loading content for module:', moduleId);

    switch (moduleId) {
      case 'lifecycle':
        if (this.lifecycleModule) {
          this.lifecycleModule.render(container.id);
        }
        break;
      case 'cases':
        if (this.casesModule) {
          this.casesModule.render(`#${moduleId}-container`);
        }
        break;
      // Other modules will be loaded similarly
    }
  }

  setupGlobalSearch() {
    console.log('[App] Setting up global search');

    const searchInput = document.getElementById('global-search');
    const searchModal = document.getElementById('search-results-modal');
    const searchClose = document.getElementById('search-close');

    searchInput?.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      if (query.length > 1) {
        this.performGlobalSearch(query);
      }
    });

    searchClose?.addEventListener('click', () => {
      searchModal.classList.remove('active');
    });

    searchModal?.addEventListener('click', (e) => {
      if (e.target === searchModal) {
        searchModal.classList.remove('active');
      }
    });
  }

  performGlobalSearch(query) {
    console.log('[App] Searching for:', query);

    const results = [];
    const lowerQuery = query.toLowerCase();

    // Search in Lifecycle Module
    if (this.lifecycleModule) {
      const lifecycleResults = this.lifecycleModule.searchPhases(query);
      lifecycleResults.forEach(result => {
        results.push({
          type: 'Lifecycle Phase',
          title: result.title,
          description: result.description,
          module: 'lifecycle',
          data: result
        });
      });
    }

    // Search in Cases Module
    if (this.casesModule) {
      const caseResults = this.casesModule.search(query);
      caseResults.forEach(result => {
        results.push({
          type: 'Case',
          title: result.title,
          description: result.summary,
          module: 'cases',
          data: result
        });
      });
    }

    // Display results
    this.displaySearchResults(results);
  }

  displaySearchResults(results) {
    const modal = document.getElementById('search-results-modal');
    const resultsList = document.getElementById('search-results-list');

    resultsList.innerHTML = '';

    if (results.length === 0) {
      resultsList.innerHTML = '<p style="text-align: center; color: #6b7280;">No results found</p>';
    } else {
      results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `
          <strong>${result.type}: ${result.title}</strong>
          <p>${result.description}</p>
          <small>Module: ${result.module}</small>
        `;
        resultItem.addEventListener('click', () => {
          this.switchModule(result.module);
          modal.classList.remove('active');
        });
        resultsList.appendChild(resultItem);
      });
    }

    modal.classList.add('active');
  }

  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.warn('[App] Service Workers are not supported');
      this.setSWStatus('Not supported');
      return;
    }

    try {
      console.log('[App] Registering Service Worker');
      this.swRegistration = await navigator.serviceWorker.register('sw.js', {
        scope: '/'
      });

      console.log('[App] Service Worker registered:', this.swRegistration);
      this.setSWStatus('Active');

      // Listen for updates
      this.swRegistration.addEventListener('updatefound', () => {
        const newWorker = this.swRegistration.installing;
        console.log('[App] Service Worker update found');

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            console.log('[App] Service Worker activated');
            this.notifyUpdate();
          }
        });
      });

      // Handle messages from Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('[App] Message from Service Worker:', event.data);
        if (event.data.type === 'SYNC_COMPLETE') {
          this.showNotification('Sync Complete', event.data.message);
        }
      });

    } catch (error) {
      console.error('[App] Service Worker registration failed:', error);
      this.setSWStatus('Failed');
    }
  }

  setupUI() {
    console.log('[App] Setting up UI');

    const installBtn = document.getElementById('install-btn');
    const shareBtn = document.getElementById('share-btn');

    if (installBtn) {
      installBtn.addEventListener('click', () => this.installApp());
    }

    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.shareApp());
    }

    // Check for install prompt
    window.addEventListener('beforeinstallprompt', (event) => {
      console.log('[App] beforeinstallprompt event fired');
      event.preventDefault();
      this.deferredPrompt = event;
      if (installBtn) {
        installBtn.style.display = 'block';
      }
    });

    // Track install
    window.addEventListener('appinstalled', () => {
      console.log('[App] PWA was installed');
      if (installBtn) {
        installBtn.style.display = 'none';
      }
      this.showNotification('App Installed', 'CGRA has been added to your home screen');
      this.deferredPrompt = null;
    });

    // Detect if running as standalone app
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[App] Running in standalone mode');
    }

    // Share API support
    if (navigator.share) {
      const shareBtn = document.getElementById('share-btn');
      if (shareBtn) {
        shareBtn.style.display = 'block';
      }
    }
  }

  setupEventListeners() {
    console.log('[App] Setting up event listeners');

    // Online/Offline events
    window.addEventListener('online', () => {
      console.log('[App] Back online');
      this.isOnline = true;
      this.updateConnectionStatus();
      this.hideOfflineNotice();
    });

    window.addEventListener('offline', () => {
      console.log('[App] Went offline');
      this.isOnline = false;
      this.updateConnectionStatus();
      this.showOfflineNotice();
    });

    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('[App] App hidden');
      } else {
        console.log('[App] App visible');
        this.updateConnectionStatus();
      }
    });

    // Periodic background sync (if supported)
    if ('periodicSync' in this.swRegistration) {
      this.setupBackgroundSync();
    }
  }

  async setupBackgroundSync() {
    try {
      console.log('[App] Setting up periodic background sync');
      await this.swRegistration.periodicSync.register('sync-data', {
        minInterval: 24 * 60 * 60 * 1000 // 24 hours
      });
      console.log('[App] Periodic sync registered');
    } catch (error) {
      console.warn('[App] Periodic sync not available:', error);
    }
  }

  async installApp() {
    if (!this.deferredPrompt) {
      console.warn('[App] Install prompt not available');
      return;
    }

    console.log('[App] Showing install prompt');
    this.deferredPrompt.prompt();
    const choice = await this.deferredPrompt.userChoice;
    console.log('[App] User choice:', choice.outcome);
    this.deferredPrompt = null;
  }

  async shareApp() {
    if (!navigator.share) {
      console.warn('[App] Web Share API not supported');
      return;
    }

    try {
      console.log('[App] Sharing app');
      await navigator.share({
        title: 'Competitive Gaming Research Assistant',
        text: 'Check out CGRA - a Progressive Web App for competitive gaming research and analysis',
        url: window.location.href
      });
      console.log('[App] App shared successfully');
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('[App] Share failed:', error);
      }
    }
  }

  updateConnectionStatus() {
    const status = document.getElementById('connection-status');
    if (status) {
      status.textContent = this.isOnline ? 'Online' : 'Offline';
      status.style.color = this.isOnline ? '#10b981' : '#ef4444';
    }
  }

  updateAppStatus() {
    const status = document.getElementById('app-status');
    if (status) {
      status.textContent = 'Ready';
      status.style.color = '#10b981';
    }
  }

  setSWStatus(statusText) {
    const status = document.getElementById('sw-status');
    if (status) {
      status.textContent = statusText;
      status.style.color = statusText === 'Active' ? '#10b981' : '#ef4444';
    }
  }

  showOfflineNotice() {
    const notice = document.getElementById('offline-notice');
    if (notice) {
      notice.style.display = 'block';
      console.log('[App] Offline notice displayed');
    }
  }

  hideOfflineNotice() {
    const notice = document.getElementById('offline-notice');
    if (notice) {
      notice.style.display = 'none';
      console.log('[App] Offline notice hidden');
    }
  }

  showNotification(title, message) {
    console.log('[App] Showing notification:', title, message);

    if (!('Notification' in window)) {
      console.warn('[App] Notifications not supported');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, { body: message });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, { body: message });
        }
      });
    }
  }

  notifyUpdate() {
    console.log('[App] Notifying of update');
    if (navigator.serviceWorker.controller) {
      const updateMessage = document.createElement('div');
      updateMessage.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #10b981; color: white; padding: 1rem; border-radius: 0.5rem; box-shadow: 0 10px 15px rgba(0,0,0,0.1); z-index: 9999;';
      updateMessage.innerHTML = `
        <p>New version available!</p>
        <button onclick="location.reload()" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: white; color: #10b981; border: none; border-radius: 0.25rem; cursor: pointer;">Reload</button>
      `;
      document.body.appendChild(updateMessage);
    }
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pwaApp = new PWAApp();
  });
} else {
  window.pwaApp = new PWAApp();
}
