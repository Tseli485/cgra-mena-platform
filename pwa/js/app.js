// PWA App Initialization and Management
class PWAApp {
  constructor() {
    this.swRegistration = null;
    this.deferredPrompt = null;
    this.isOnline = navigator.onLine;
    this.init();
  }

  async init() {
    console.log('[App] Initializing PWA');

    // Register Service Worker
    await this.registerServiceWorker();

    // Setup UI
    this.setupUI();

    // Setup event listeners
    this.setupEventListeners();

    // Check connection status
    this.updateConnectionStatus();

    // Update app status
    this.updateAppStatus();
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
