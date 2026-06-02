/**
 * RoleModule - Tuteur Role Management System
 * Manages tuteur obligations, financial responsibilities, and section-based accordion UI
 * Persists state to IndexedDB with dark mode support and custom events
 */

class RoleModule {
  constructor(containerId = 'role-module', dbName = 'RoleModuleDB') {
    this.containerId = containerId;
    this.dbName = dbName;
    this.storeName = 'roleState';
    this.db = null;
    this.sections = [];
    this.expandedSections = new Set();
    this.eventTarget = new EventTarget();

    this.initDB().then(() => this.init());
  }

  /**
   * Initialize IndexedDB for persistent state storage
   */
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Load persisted state from IndexedDB
   */
  async loadState() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const state = {};
        request.result.forEach(item => {
          state[item.id] = item.checked;
        });
        resolve(state);
      };
    });
  }

  /**
   * Save state to IndexedDB
   */
  async saveState(itemId, checked) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put({ id: itemId, checked });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.emit('stateChanged', { itemId, checked });
        resolve();
      };
    });
  }

  /**
   * Define all role sections with obligations
   */
  defineSections() {
    return [
      {
        id: 'legal-obligations',
        title: 'Legal & Regulatory Obligations',
        description: 'Core legal requirements and regulatory compliance',
        items: [
          { id: 'legal-1', label: 'Maintain guardianship documentation', description: 'Keep all legal guardianship papers current and accessible' },
          { id: 'legal-2', label: 'File annual court reports', description: 'Submit required reports to the court within deadlines' },
          { id: 'legal-3', label: 'Follow statutory procedures', description: 'Adhere to all state and local guardianship laws' },
          { id: 'legal-4', label: 'Report changes of circumstances', description: 'Notify court of material changes affecting guardianship' },
          { id: 'legal-5', label: 'Maintain confidentiality', description: 'Protect sensitive information about ward and family' }
        ]
      },
      {
        id: 'personal-care',
        title: 'Personal Care & Well-Being',
        description: 'Physical health, safety, and daily living needs',
        items: [
          { id: 'care-1', label: 'Ensure medical care', description: 'Arrange and monitor necessary healthcare and vaccinations' },
          { id: 'care-2', label: 'Maintain living standards', description: 'Provide safe, clean, and adequate housing' },
          { id: 'care-3', label: 'Arrange education/training', description: 'Support schooling, vocational training, or skill development' },
          { id: 'care-4', label: 'Promote social connections', description: 'Facilitate relationships with family and community' },
          { id: 'care-5', label: 'Monitor nutrition & health', description: 'Ensure proper diet, exercise, and health management' },
          { id: 'care-6', label: 'Manage medications', description: 'Oversee proper administration and monitoring of medications' }
        ]
      },
      {
        id: 'financial-management',
        title: 'Financial Responsibilities',
        description: 'Estate management, budgeting, and asset protection',
        items: [
          { id: 'fin-1', label: 'Maintain financial records', description: 'Keep detailed accounting of all income and expenses' },
          { id: 'fin-2', label: 'Manage ward assets prudently', description: 'Invest and preserve estate with care and responsibility' },
          { id: 'fin-3', label: 'File tax returns', description: 'Submit required federal, state, and local tax filings' },
          { id: 'fin-4', label: 'Pay bills and obligations', description: 'Ensure timely payment of debts and living expenses' },
          { id: 'fin-5', label: 'Obtain court approval for major transactions', description: 'Seek permission for significant asset sales or transfers' },
          { id: 'fin-6', label: 'Document all financial decisions', description: 'Maintain records justifying financial choices and transactions' },
          { id: 'fin-7', label: 'Prevent financial exploitation', description: 'Protect ward from fraud, scams, and predatory practices' }
        ]
      },
      {
        id: 'decision-making',
        title: 'Decision-Making Authority',
        description: 'Legal authority to make decisions on behalf of the ward',
        items: [
          { id: 'dec-1', label: 'Make healthcare decisions', description: 'Authorize medical treatment with ward\'s best interests in mind' },
          { id: 'dec-2', label: 'Educational decisions', description: 'Choose schools and educational programs for ward' },
          { id: 'dec-3', label: 'Employment choices', description: 'Support or direct vocational and employment decisions' },
          { id: 'dec-4', label: 'Living arrangements', description: 'Determine where and with whom ward resides' },
          { id: 'dec-5', label: 'Legal matters', description: 'Sign documents and make legal determinations for ward' }
        ]
      },
      {
        id: 'reporting-accountability',
        title: 'Reporting & Accountability',
        description: 'Transparency requirements and oversight compliance',
        items: [
          { id: 'rep-1', label: 'File annual accounting', description: 'Submit detailed financial reports to court annually' },
          { id: 'rep-2', label: 'Respond to court inquiries', description: 'Provide information and documentation as requested' },
          { id: 'rep-3', label: 'Cooperate with investigations', description: 'Participate in any court-ordered reviews or audits' },
          { id: 'rep-4', label: 'Notify court of violations', description: 'Report any concerns or breaches to appropriate authorities' },
          { id: 'rep-5', label: 'Maintain transparency', description: 'Openly communicate actions and decisions affecting ward' },
          { id: 'rep-6', label: 'Submit annual status report', description: 'Provide updates on ward\'s health, education, and welfare' }
        ]
      },
      {
        id: 'conflict-resolution',
        title: 'Conflict Resolution & Mediation',
        description: 'Managing disputes and family conflicts',
        items: [
          { id: 'conf-1', label: 'Mediate family disagreements', description: 'Facilitate communication and resolve family conflicts' },
          { id: 'conf-2', label: 'Address ward complaints', description: 'Listen to and investigate concerns raised by ward' },
          { id: 'conf-3', label: 'Work with co-guardians', description: 'Coordinate decisions and actions with other guardians' },
          { id: 'conf-4', label: 'Manage third-party concerns', description: 'Address questions and concerns from educators and providers' },
          { id: 'conf-5', label: 'Seek legal counsel when needed', description: 'Consult attorneys for guidance on complex issues' }
        ]
      },
      {
        id: 'emotional-support',
        title: 'Emotional Support & Advocacy',
        description: 'Emotional well-being and best interest advocacy',
        items: [
          { id: 'emot-1', label: 'Provide emotional support', description: 'Offer counseling, encouragement, and emotional care' },
          { id: 'emot-2', label: 'Advocate for ward\'s interests', description: 'Champion ward\'s needs and preferences in all matters' },
          { id: 'emot-3', label: 'Support personal relationships', description: 'Encourage connections with loved ones and mentors' },
          { id: 'emot-4', label: 'Respect ward autonomy', description: 'Honor ward\'s preferences and involve them in decisions' },
          { id: 'emot-5', label: 'Monitor emotional well-being', description: 'Assess mental health and arrange support as needed' },
          { id: 'emot-6', label: 'Celebrate achievements', description: 'Recognize and encourage ward\'s accomplishments and growth' }
        ]
      }
    ];
  }

  /**
   * Initialize the module
   */
  async init() {
    this.sections = this.defineSections();
    const state = await this.loadState();
    this.render(state);
    this.attachEventListeners();
    this.detectDarkMode();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => this.detectDarkMode());
  }

  /**
   * Detect and apply dark mode
   */
  detectDarkMode() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    container.classList.toggle('role-module-dark', isDarkMode);
  }

  /**
   * Render all sections
   */
  render(state = {}) {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container #${this.containerId} not found`);
      return;
    }

    container.innerHTML = '';
    container.className = 'role-module';

    const header = document.createElement('div');
    header.className = 'role-module-header';
    header.innerHTML = `
      <h1>Tuteur Role & Responsibilities</h1>
      <p>Track obligations and financial responsibilities across 7 key areas</p>
    `;
    container.appendChild(header);

    const accordion = document.createElement('div');
    accordion.className = 'role-accordion';

    this.sections.forEach((section) => {
      const sectionEl = this.renderSection(section, state);
      accordion.appendChild(sectionEl);
    });

    container.appendChild(accordion);

    const footer = document.createElement('div');
    footer.className = 'role-module-footer';
    footer.innerHTML = `
      <p class="completion-text">Track your progress and ensure all obligations are met</p>
      <div class="footer-stats">
        <span class="stat-badge">7 Sections</span>
        <span class="stat-badge" id="completed-badge">0 Complete</span>
      </div>
    `;
    container.appendChild(footer);

    this.updateCompletionStats(state);
  }

  /**
   * Render individual section
   */
  renderSection(section, state = {}) {
    const sectionEl = document.createElement('div');
    sectionEl.className = 'role-section';
    sectionEl.id = `section-${section.id}`;

    const header = document.createElement('button');
    header.className = 'role-section-header';
    header.setAttribute('aria-expanded', 'false');
    header.setAttribute('aria-controls', `content-${section.id}`);
    header.innerHTML = `
      <div class="section-title-block">
        <span class="section-icon">▶</span>
        <div class="section-meta">
          <h2 class="section-title">${section.title}</h2>
          <p class="section-description">${section.description}</p>
        </div>
      </div>
      <div class="section-progress">
        <span class="progress-count" data-section="${section.id}">0/${section.items.length}</span>
      </div>
    `;

    const content = document.createElement('div');
    content.id = `content-${section.id}`;
    content.className = 'role-section-content';
    content.setAttribute('role', 'region');
    content.setAttribute('aria-labelledby', `section-${section.id}`);

    const itemsList = document.createElement('div');
    itemsList.className = 'role-items-grid';

    section.items.forEach((item) => {
      const itemEl = this.renderItem(item, state);
      itemsList.appendChild(itemEl);
    });

    content.appendChild(itemsList);

    header.addEventListener('click', () => {
      const isExpanded = header.getAttribute('aria-expanded') === 'true';
      this.toggleSection(section.id, !isExpanded);
    });

    sectionEl.appendChild(header);
    sectionEl.appendChild(content);

    return sectionEl;
  }

  /**
   * Render checkbox item
   */
  renderItem(item, state = {}) {
    const isChecked = state[item.id] || false;

    const itemEl = document.createElement('div');
    itemEl.className = 'role-item';

    const checkboxWrapper = document.createElement('label');
    checkboxWrapper.className = 'role-checkbox-wrapper';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = item.id;
    checkbox.checked = isChecked;
    checkbox.className = 'role-checkbox';

    const checkmark = document.createElement('span');
    checkmark.className = 'role-checkmark';

    checkboxWrapper.appendChild(checkbox);
    checkboxWrapper.appendChild(checkmark);

    const labelDiv = document.createElement('div');
    labelDiv.className = 'role-label-block';

    const labelText = document.createElement('span');
    labelText.className = 'role-label-text';
    labelText.textContent = item.label;

    const description = document.createElement('span');
    description.className = 'role-item-description';
    description.textContent = item.description;

    labelDiv.appendChild(labelText);
    labelDiv.appendChild(description);

    checkboxWrapper.appendChild(labelDiv);
    itemEl.appendChild(checkboxWrapper);

    checkbox.addEventListener('change', (e) => {
      this.saveState(item.id, e.target.checked);
      this.updateSectionProgress(item.id);
    });

    return itemEl;
  }

  /**
   * Toggle section expanded/collapsed state
   */
  toggleSection(sectionId, isExpanded) {
    const section = document.getElementById(`section-${sectionId}`);
    const header = section.querySelector('.role-section-header');
    const content = section.querySelector('.role-section-content');

    if (isExpanded) {
      this.expandedSections.add(sectionId);
      header.setAttribute('aria-expanded', 'true');
      content.classList.add('expanded');
      header.querySelector('.section-icon').textContent = '▼';
    } else {
      this.expandedSections.delete(sectionId);
      header.setAttribute('aria-expanded', 'false');
      content.classList.remove('expanded');
      header.querySelector('.section-icon').textContent = '▶';
    }

    this.emit('sectionToggled', { sectionId, isExpanded });
  }

  /**
   * Update section progress count
   */
  updateSectionProgress(itemId) {
    const section = this.sections.find(s =>
      s.items.some(item => item.id === itemId)
    );

    if (!section) return;

    const checkbox = document.getElementById(itemId);
    const items = section.items;
    const checkedCount = items.filter(item => {
      const cb = document.getElementById(item.id);
      return cb && cb.checked;
    }).length;

    const progressSpan = document.querySelector(
      `.progress-count[data-section="${section.id}"]`
    );
    if (progressSpan) {
      progressSpan.textContent = `${checkedCount}/${items.length}`;
    }

    this.updateCompletionStats();
  }

  /**
   * Update overall completion statistics
   */
  updateCompletionStats(state = {}) {
    let totalChecked = 0;
    let totalItems = 0;

    this.sections.forEach(section => {
      section.items.forEach(item => {
        totalItems++;
        const checkbox = document.getElementById(item.id);
        if (checkbox && checkbox.checked) {
          totalChecked++;
        }
      });
    });

    const completedBadge = document.getElementById('completed-badge');
    if (completedBadge) {
      const percentage = totalItems > 0
        ? Math.round((totalChecked / totalItems) * 100)
        : 0;
      completedBadge.textContent = `${totalChecked}/${totalItems} (${percentage}%)`;
    }

    this.emit('completionUpdated', { totalChecked, totalItems });
  }

  /**
   * Attach event listeners to all interactive elements
   */
  attachEventListeners() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Keyboard navigation
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.classList.contains('role-section-header')) {
        e.preventDefault();
        e.target.click();
      }
    });

    // Spacebar on checkboxes
    container.addEventListener('keydown', (e) => {
      if (e.key === ' ' && e.target.classList.contains('role-checkbox')) {
        e.preventDefault();
        e.target.click();
      }
    });
  }

  /**
   * Emit custom event
   */
  emit(eventName, detail = {}) {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true
    });
    this.eventTarget.dispatchEvent(event);
  }

  /**
   * Listen to custom events
   */
  on(eventName, callback) {
    this.eventTarget.addEventListener(eventName, (e) => {
      callback(e.detail);
    });
  }

  /**
   * Get completion percentage
   */
  getCompletionPercentage() {
    let totalChecked = 0;
    let totalItems = 0;

    this.sections.forEach(section => {
      section.items.forEach(item => {
        totalItems++;
        const checkbox = document.getElementById(item.id);
        if (checkbox && checkbox.checked) {
          totalChecked++;
        }
      });
    });

    return totalItems > 0 ? (totalChecked / totalItems) * 100 : 0;
  }

  /**
   * Expand all sections
   */
  expandAll() {
    this.sections.forEach(section => {
      this.toggleSection(section.id, true);
    });
    this.emit('expandedAll', {});
  }

  /**
   * Collapse all sections
   */
  collapseAll() {
    this.sections.forEach(section => {
      this.toggleSection(section.id, false);
    });
    this.emit('collapsedAll', {});
  }

  /**
   * Reset all checkboxes
   */
  async reset() {
    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    await store.clear();

    const checkboxes = document.querySelectorAll('.role-checkbox');
    checkboxes.forEach(cb => {
      cb.checked = false;
    });

    this.updateCompletionStats();
    this.emit('reset', {});
  }

  /**
   * Export state to JSON
   */
  exportState() {
    const state = {};
    this.sections.forEach(section => {
      state[section.id] = {
        title: section.title,
        items: section.items.map(item => ({
          id: item.id,
          label: item.label,
          checked: document.getElementById(item.id)?.checked || false
        }))
      };
    });
    return state;
  }

  /**
   * Import state from JSON
   */
  async importState(importedState) {
    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    Object.keys(importedState).forEach(sectionId => {
      const section = importedState[sectionId];
      section.items.forEach(item => {
        if (item.checked) {
          store.put({ id: item.id, checked: true });
        }
      });
    });

    const state = await this.loadState();
    this.render(state);
    this.updateCompletionStats();
    this.emit('imported', { state });
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RoleModule;
}
