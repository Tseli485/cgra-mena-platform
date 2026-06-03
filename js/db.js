/**
 * IndexedDB Persistence Layer for CGRA
 * Provides offline data storage and synchronization
 */

class CGRADatabase {
  constructor(dbName = 'CGRA_DB', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
    this.offlineQueue = [];
    this.lastSyncTime = null;
  }

  /**
   * Initialize the database connection and create object stores
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores for different data types
        const stores = ['projects', 'tasks', 'settings', 'cache'];
        stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('status', 'status', { unique: false });
          }
        });

        // Create lifecycle-specific object stores
        if (!db.objectStoreNames.contains('lifecycle_phases')) {
          const phasesStore = db.createObjectStore('lifecycle_phases', { keyPath: 'phase_id' });
          phasesStore.createIndex('age_group_id', 'age_group_id', { unique: false });
          phasesStore.createIndex('age_min', 'age_min', { unique: false });
          phasesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('lifecycle_progress')) {
          const progressStore = db.createObjectStore('lifecycle_progress', { keyPath: 'userId_phaseId' });
          progressStore.createIndex('userId', 'userId', { unique: false });
          progressStore.createIndex('phaseId', 'phaseId', { unique: false });
          progressStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create cases-related object stores
        if (!db.objectStoreNames.contains('cases')) {
          const casesStore = db.createObjectStore('cases', { keyPath: 'case_id' });
          casesStore.createIndex('case_type', 'case_type', { unique: false });
          casesStore.createIndex('age_group', 'age_group', { unique: false });
          casesStore.createIndex('country', 'country', { unique: false });
          casesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('case_indexes')) {
          const indexStore = db.createObjectStore('case_indexes', { keyPath: 'type' });
          indexStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create bookmarks store for user preferences
        if (!db.objectStoreNames.contains('case_bookmarks')) {
          const bookmarksStore = db.createObjectStore('case_bookmarks', { keyPath: 'userId_caseId' });
          bookmarksStore.createIndex('userId', 'userId', { unique: false });
          bookmarksStore.createIndex('caseId', 'caseId', { unique: false });
          bookmarksStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create filter preferences store
        if (!db.objectStoreNames.contains('filter_preferences')) {
          const filterStore = db.createObjectStore('filter_preferences', { keyPath: 'module' });
          filterStore.createIndex('userId', 'userId', { unique: false });
          filterStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        console.log('Object stores created including lifecycle, cases, and preferences stores');
      };
    });
  }

  /**
   * Get a single record by ID from specified store
   */
  async get(storeName, id) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Get all records from a specified store
   */
  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Add or update a record in the specified store
   */
  async put(storeName, data) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      // Add timestamp if not present
      if (!data.timestamp) {
        data.timestamp = Date.now();
      }

      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Query records by index with optional filtering
   */
  async query(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Clear all records from a specified store
   */
  async clear(storeName) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Delete a specific record by ID
   */
  async delete(storeName, id) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Load lifecycle data from JSON file into IndexedDB
   */
  async loadLifecycleData() {
    try {
      const response = await fetch('./data/lifecycle-data.json');
      if (!response.ok) {
        console.warn('Lifecycle data file not found, skipping initialization');
        return false;
      }

      const data = await response.json();

      // Check if data already loaded (via metadata)
      const existing = await this.getAll('lifecycle_phases');
      if (existing.length > 0) {
        console.log('Lifecycle data already loaded');
        return true;
      }

      // Store each phase in the database
      if (data.phases && Array.isArray(data.phases)) {
        for (const phase of data.phases) {
          const phaseData = {
            ...phase,
            timestamp: Date.now()
          };
          await this.put('lifecycle_phases', phaseData);
        }
        console.log(`Loaded ${data.phases.length} lifecycle phases into IndexedDB`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error loading lifecycle data:', error);
      return false;
    }
  }

  /**
   * Load cases data from JSON file into IndexedDB
   */
  async loadCasesData() {
    try {
      const response = await fetch('./data/cases-data.json');
      if (!response.ok) {
        console.warn('Cases data file not found, skipping initialization');
        return false;
      }

      const data = await response.json();

      // Check if data already loaded
      const existing = await this.getAll('cases');
      if (existing.length > 0) {
        console.log('Cases data already loaded');
        return true;
      }

      // Store cases in the database
      const casesArray = Array.isArray(data) ? data : (data.cases || []);
      if (casesArray.length > 0) {
        for (const caseData of casesArray) {
          const caseRecord = {
            ...caseData,
            timestamp: Date.now()
          };
          await this.put('cases', caseRecord);
        }
        console.log(`Loaded ${casesArray.length} cases into IndexedDB`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error loading cases data:', error);
      return false;
    }
  }

  /**
   * Load cases indexes from JSON file into IndexedDB
   */
  async loadCasesIndexes() {
    try {
      const response = await fetch('./data/cases-indexes.json');
      if (!response.ok) {
        console.warn('Cases indexes file not found, skipping initialization');
        return false;
      }

      const indexData = await response.json();

      // Check if indexes already loaded
      const existing = await this.getAll('case_indexes');
      if (existing.length > 0) {
        console.log('Cases indexes already loaded');
        return true;
      }

      // Store index data in the database
      for (const [indexType, indexContent] of Object.entries(indexData)) {
        const indexRecord = {
          type: indexType,
          data: indexContent,
          timestamp: Date.now()
        };
        await this.put('case_indexes', indexRecord);
      }
      console.log('Cases indexes loaded into IndexedDB');
      return true;
    } catch (error) {
      console.error('Error loading cases indexes:', error);
      return false;
    }
  }

  /**
   * Check for available updates from server
   */
  async checkForUpdates() {
    try {
      const response = await fetch('./data/manifest.json');
      if (!response.ok) {
        console.warn('Unable to fetch update manifest');
        return null;
      }

      const manifest = await response.json();
      const currentVersion = localStorage.getItem('dataVersion') || '0';

      if (manifest.version && manifest.version > currentVersion) {
        console.log(`New data version available: ${manifest.version}`);
        return manifest;
      }

      return null;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return null;
    }
  }

  /**
   * Sync online data when connectivity returns
   */
  async syncOnlineData() {
    try {
      if (!navigator.onLine) {
        console.log('Offline - queuing data for sync');
        return false;
      }

      console.log('Starting online data sync...');

      // Load fresh data from server
      await this.loadLifecycleData();
      await this.loadCasesData();
      await this.loadCasesIndexes();

      // Process any queued offline operations
      await this.handleOfflineQueue();

      this.lastSyncTime = Date.now();
      localStorage.setItem('lastSyncTime', this.lastSyncTime.toString());

      console.log('Data sync completed successfully');
      return true;
    } catch (error) {
      console.error('Error during online sync:', error);
      return false;
    }
  }

  /**
   * Handle queued offline operations when coming back online
   */
  async handleOfflineQueue() {
    try {
      if (this.offlineQueue.length === 0) {
        return;
      }

      console.log(`Processing ${this.offlineQueue.length} queued operations`);

      for (const operation of this.offlineQueue) {
        try {
          if (operation.type === 'put') {
            await this.put(operation.store, operation.data);
          } else if (operation.type === 'delete') {
            await this.delete(operation.store, operation.id);
          }
        } catch (error) {
          console.error('Error processing queued operation:', error);
        }
      }

      this.offlineQueue = [];
      console.log('Offline queue processed');
    } catch (error) {
      console.error('Error handling offline queue:', error);
    }
  }

  /**
   * Get a single lifecycle phase by phase_id
   */
  async getPhase(phase_id) {
    try {
      return await this.get('lifecycle_phases', phase_id);
    } catch (error) {
      console.error(`Error getting phase ${phase_id}:`, error);
      return null;
    }
  }

  /**
   * Get all lifecycle phases for a specific age group
   */
  async getAllPhases(age_group) {
    try {
      const allPhases = await this.getAll('lifecycle_phases');
      if (age_group) {
        return allPhases.filter(phase => phase.age_group_id === age_group);
      }
      return allPhases;
    } catch (error) {
      console.error('Error getting phases:', error);
      return [];
    }
  }

  /**
   * Get a single case by case_id
   */
  async getCase(case_id) {
    try {
      return await this.get('cases', case_id);
    } catch (error) {
      console.error(`Error getting case ${case_id}:`, error);
      return null;
    }
  }

  /**
   * Get all cases filtered by case type
   */
  async getCasesByType(type) {
    try {
      return await this.query('cases', 'case_type', type);
    } catch (error) {
      console.error(`Error getting cases by type ${type}:`, error);
      return [];
    }
  }

  /**
   * Get all cases filtered by age group
   */
  async getCasesByAge(ageGroup) {
    try {
      return await this.query('cases', 'age_group', ageGroup);
    } catch (error) {
      console.error(`Error getting cases by age ${ageGroup}:`, error);
      return [];
    }
  }

  /**
   * Get all cases filtered by domain/country
   */
  async getCasesByDomain(domain) {
    try {
      return await this.query('cases', 'country', domain);
    } catch (error) {
      console.error(`Error getting cases by domain ${domain}:`, error);
      return [];
    }
  }

  /**
   * Close the database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      console.log('Database connection closed');
    }
  }
}

// Global database instance initialization
let cgraDB = null;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    cgraDB = new CGRADatabase('CGRA_DB', 1);
    await cgraDB.init();
    console.log('CGRA Database ready for offline access');

    // Load all required data on first visit
    const lifecycleLoaded = await cgraDB.loadLifecycleData();
    const casesLoaded = await cgraDB.loadCasesData();
    const indexesLoaded = await cgraDB.loadCasesIndexes();

    if (lifecycleLoaded) {
      console.log('Lifecycle data initialized');
    }
    if (casesLoaded) {
      console.log('Cases data initialized');
    }
    if (indexesLoaded) {
      console.log('Cases indexes initialized');
    }

    // Set up online/offline event listeners for sync
    window.addEventListener('online', async () => {
      console.log('Connectivity restored, syncing data...');
      await cgraDB.syncOnlineData();
    });

    window.addEventListener('offline', () => {
      console.log('Offline mode detected, queuing operations');
    });

    // Emit custom event to notify application
    window.dispatchEvent(new CustomEvent('cgradb-ready', { detail: { db: cgraDB } }));
  } catch (error) {
    console.error('Failed to initialize CGRA Database:', error);
    // Emit error event for application handling
    window.dispatchEvent(new CustomEvent('cgradb-error', { detail: { error } }));
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (cgraDB) {
    cgraDB.close();
  }
});
