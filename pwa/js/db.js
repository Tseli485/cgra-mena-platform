/**
 * IndexedDB Persistence Layer for CGRA
 * Provides offline data storage and synchronization
 */

class CGRADatabase {
  constructor(dbName = 'CGRA_DB', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
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

        console.log('Object stores created including lifecycle stores');
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

    // Load lifecycle data on first visit
    const lifecycleLoaded = await cgraDB.loadLifecycleData();
    if (lifecycleLoaded) {
      console.log('Lifecycle data initialized');
    }

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
