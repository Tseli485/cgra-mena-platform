/**
 * CYCLE-VIE Lifecycle Management Module
 * Manages interactive lifecycle phases, checklists, and user progress tracking
 * Supports comprehensive tracking across 0-18 year age groups with 22+ phases
 */

class LifecycleModule {
  constructor(db, data) {
    this.db = db;
    this.data = data;
    this.currentPhase = null;
    this.currentProgress = null;
    this.userId = this.getUserId();
  }

  /**
   * Get or create unique user ID
   */
  getUserId() {
    let userId = localStorage.getItem('cgra_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('cgra_user_id', userId);
    }
    return userId;
  }

  /**
   * Get phases for a specific age in months
   */
  getPhasesByAge(ageMonths) {
    if (!this.data || !this.data.phases) return [];
    return this.data.phases.filter(phase =>
      ageMonths >= phase.start_age_months && ageMonths < phase.end_age_months
    );
  }

  /**
   * Get all phases for an age group
   */
  getPhasesByAgeGroup(ageGroupId) {
    if (!this.data || !this.data.phases) return [];
    return this.data.phases.filter(phase => phase.age_group_id === ageGroupId);
  }

  /**
   * Get phase details by phase ID
   */
  getPhaseById(phaseId) {
    if (!this.data || !this.data.phases) return null;
    return this.data.phases.find(phase => phase.phase_id === phaseId);
  }

  /**
   * Load checklist progress from IndexedDB
   */
  async loadChecklistProgress(phaseId) {
    const progressKey = `${this.userId}_${phaseId}`;
    try {
      const progress = await this.db.get('lifecycle_progress', progressKey);
      return progress || { userId_phaseId: progressKey, phaseId, userId: this.userId, items: {} };
    } catch (error) {
      console.error('Error loading checklist progress:', error);
      return { userId_phaseId: progressKey, phaseId, userId: this.userId, items: {} };
    }
  }

  /**
   * Save checklist progress to IndexedDB
   */
  async saveChecklistProgress(phaseId, items) {
    const progressKey = `${this.userId}_${phaseId}`;
    const progress = {
      userId_phaseId: progressKey,
      phaseId,
      userId: this.userId,
      items,
      timestamp: Date.now()
    };

    try {
      await this.db.put('lifecycle_progress', progress);
      // Also save to localStorage for quick access
      localStorage.setItem(`lifecycle_progress_${phaseId}`, JSON.stringify(items));
      return true;
    } catch (error) {
      console.error('Error saving checklist progress:', error);
      return false;
    }
  }

  /**
   * Load local checkbox states from localStorage
   */
  loadLocalChecklistState(phaseId) {
    const saved = localStorage.getItem(`lifecycle_progress_${phaseId}`);
    return saved ? JSON.parse(saved) : {};
  }

  /**
   * Save local checkbox states to localStorage
   */
  saveLocalChecklistState(phaseId, items) {
    localStorage.setItem(`lifecycle_progress_${phaseId}`, JSON.stringify(items));
  }

  /**
   * Main render method - creates complete lifecycle UI
   */
  render(targetId) {
    const container = document.getElementById(targetId);
    if (!container) {
      console.error(`Target element with ID '${targetId}' not found`);
      return;
    }

    container.innerHTML = '';
    const lifecycleUI = document.createElement('div');
    lifecycleUI.className = 'lifecycle-container';

    // Add CSS styles
    this.injectStyles();

    // Create main sections
    lifecycleUI.appendChild(this.createHeaderSection());
    lifecycleUI.appendChild(this.createAgeSelector());
    lifecycleUI.appendChild(this.createTimelineSection());
    lifecycleUI.appendChild(this.createPhaseDetailsSection());
    lifecycleUI.appendChild(this.createPrintSection());

    container.appendChild(lifecycleUI);

    // Initialize event listeners
    this.initializeEventListeners();
  }

  /**
   * Inject responsive CSS styles
   */
  injectStyles() {
    if (document.getElementById('lifecycle-styles')) return;

    const style = document.createElement('style');
    style.id = 'lifecycle-styles';
    style.textContent = `
      .lifecycle-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        min-height: 100vh;
      }

      .lifecycle-header {
        background: white;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        margin-bottom: 30px;
        text-align: center;
      }

      .lifecycle-header h1 {
        color: #2c3e50;
        margin: 0 0 10px 0;
        font-size: 28px;
      }

      .lifecycle-header p {
        color: #7f8c8d;
        margin: 0;
        font-size: 14px;
      }

      .age-selector-section {
        background: white;
        padding: 25px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        margin-bottom: 30px;
      }

      .age-selector-section h2 {
        color: #2c3e50;
        margin: 0 0 20px 0;
        font-size: 18px;
      }

      .age-input-group {
        display: flex;
        gap: 20px;
        align-items: flex-end;
        flex-wrap: wrap;
      }

      .form-group {
        flex: 1;
        min-width: 200px;
      }

      .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #2c3e50;
        font-size: 14px;
      }

      .form-group input, .form-group select {
        width: 100%;
        padding: 10px 12px;
        border: 2px solid #ecf0f1;
        border-radius: 6px;
        font-size: 14px;
        transition: border-color 0.3s;
      }

      .form-group input:focus, .form-group select:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
      }

      .btn-group {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }

      .btn-primary {
        background: #3498db;
        color: white;
      }

      .btn-primary:hover {
        background: #2980b9;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
      }

      .btn-secondary {
        background: #ecf0f1;
        color: #2c3e50;
      }

      .btn-secondary:hover {
        background: #bdc3c7;
      }

      .timeline-section {
        background: white;
        padding: 25px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        margin-bottom: 30px;
      }

      .timeline-section h2 {
        color: #2c3e50;
        margin: 0 0 20px 0;
        font-size: 18px;
      }

      .timeline {
        display: flex;
        gap: 20px;
        overflow-x: auto;
        padding-bottom: 15px;
      }

      .timeline-item {
        flex-shrink: 0;
        min-width: 180px;
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid #bdc3c7;
        cursor: pointer;
        transition: all 0.3s;
      }

      .timeline-item:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }

      .timeline-item.active {
        background: #e3f2fd;
        border-left-color: #3498db;
      }

      .timeline-item-title {
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 5px;
        font-size: 14px;
      }

      .timeline-item-age {
        font-size: 12px;
        color: #7f8c8d;
      }

      .phase-details {
        background: white;
        padding: 25px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        margin-bottom: 30px;
      }

      .phase-header {
        border-bottom: 2px solid #ecf0f1;
        padding-bottom: 20px;
        margin-bottom: 20px;
      }

      .phase-header h2 {
        color: #2c3e50;
        margin: 0;
        font-size: 24px;
      }

      .phase-meta {
        display: flex;
        gap: 30px;
        margin-top: 15px;
        font-size: 14px;
        color: #7f8c8d;
        flex-wrap: wrap;
      }

      .phase-meta-item {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .phase-section {
        margin-bottom: 30px;
      }

      .phase-section h3 {
        color: #2c3e50;
        font-size: 16px;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .section-icon {
        display: inline-block;
        width: 24px;
        height: 24px;
        background: #3498db;
        color: white;
        border-radius: 50%;
        text-align: center;
        line-height: 24px;
        font-size: 12px;
        flex-shrink: 0;
      }

      .legal-obligations {
        background: #fef5e7;
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid #f39c12;
      }

      .obligation-item {
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 1px solid #fdebd0;
        font-size: 14px;
      }

      .obligation-item:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }

      .obligation-label {
        font-weight: 600;
        color: #d68910;
        margin-bottom: 3px;
      }

      .obligation-text {
        color: #7d6608;
        margin-bottom: 3px;
      }

      .financial-breakdown {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;
      }

      .financial-item {
        background: #e8f5e9;
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid #27ae60;
        font-size: 14px;
      }

      .financial-item-label {
        font-weight: 600;
        color: #155724;
        margin-bottom: 8px;
      }

      .financial-item-amount {
        color: #27ae60;
        font-size: 16px;
        font-weight: 700;
      }

      .checklist {
        background: #f0f4f8;
        padding: 15px;
        border-radius: 8px;
      }

      .checklist-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid #d1dce6;
      }

      .checklist-item:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }

      .checklist-item input[type="checkbox"] {
        margin-top: 4px;
        width: 18px;
        height: 18px;
        cursor: pointer;
        flex-shrink: 0;
      }

      .checklist-item label {
        flex: 1;
        cursor: pointer;
        font-size: 14px;
        color: #2c3e50;
      }

      .checklist-item input[type="checkbox"]:checked + label {
        color: #7f8c8d;
        text-decoration: line-through;
      }

      .resources {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;
      }

      .resource-item {
        background: #f0f8ff;
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid #3498db;
        font-size: 14px;
      }

      .resource-name {
        font-weight: 600;
        color: #1a5276;
        margin-bottom: 5px;
      }

      .resource-type {
        font-size: 12px;
        color: #5499c7;
        background: #e8f4f8;
        padding: 3px 8px;
        border-radius: 4px;
        display: inline-block;
      }

      .documents-needed {
        background: #f5e6e8;
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid #e74c3c;
      }

      .document-item {
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid #fadbd8;
        font-size: 14px;
        color: #641e16;
      }

      .document-item:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }

      .print-section {
        background: white;
        padding: 25px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        margin-bottom: 30px;
        text-align: center;
      }

      .print-section button {
        margin: 5px;
      }

      .progress-indicator {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        color: #7f8c8d;
        margin-top: 10px;
      }

      .progress-bar {
        flex: 1;
        height: 6px;
        background: #ecf0f1;
        border-radius: 3px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background: #27ae60;
        transition: width 0.3s;
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: #7f8c8d;
      }

      .empty-state p {
        margin: 10px 0;
        font-size: 14px;
      }

      @media (max-width: 768px) {
        .lifecycle-container {
          padding: 15px;
        }

        .lifecycle-header {
          padding: 20px;
        }

        .lifecycle-header h1 {
          font-size: 22px;
        }

        .phase-header h2 {
          font-size: 18px;
        }

        .age-input-group {
          flex-direction: column;
        }

        .form-group {
          min-width: 100%;
        }

        .timeline {
          gap: 10px;
        }

        .timeline-item {
          min-width: 140px;
          padding: 12px;
        }

        .phase-meta {
          gap: 15px;
        }

        .financial-breakdown, .resources {
          grid-template-columns: 1fr;
        }
      }

      @media print {
        .age-selector-section,
        .print-section,
        .btn-group {
          display: none;
        }

        .lifecycle-container {
          background: white;
          padding: 0;
        }

        .phase-details {
          box-shadow: none;
          page-break-inside: avoid;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Create header section
   */
  createHeaderSection() {
    const header = document.createElement('div');
    header.className = 'lifecycle-header';
    header.innerHTML = `
      <h1>CYCLE-VIE: Lifecycle Management System</h1>
      <p>Comprehensive lifecycle tracking from birth through adulthood (0-18 years)</p>
    `;
    return header;
  }

  /**
   * Create age selector section
   */
  createAgeSelector() {
    const section = document.createElement('div');
    section.className = 'age-selector-section';
    section.innerHTML = `
      <h2>Select Age & Age Group</h2>
      <div class="age-input-group">
        <div class="form-group">
          <label for="age-input">Child Age (months)</label>
          <input type="number" id="age-input" min="0" max="216" value="0" placeholder="Enter age in months">
        </div>
        <div class="form-group">
          <label for="age-group-select">Age Group</label>
          <select id="age-group-select">
            <option value="">Select Age Group...</option>
            <option value="1">Infancy (0-2 years)</option>
            <option value="2">Early Childhood (2-6 years)</option>
            <option value="3">Middle Childhood (6-12 years)</option>
            <option value="4">Adolescence (12-18 years)</option>
          </select>
        </div>
        <div class="btn-group">
          <button class="btn btn-primary" id="load-phase-btn">Load Phase</button>
          <button class="btn btn-secondary" id="view-all-btn">View All Phases</button>
        </div>
      </div>
    `;
    return section;
  }

  /**
   * Create timeline section
   */
  createTimelineSection() {
    const section = document.createElement('div');
    section.className = 'timeline-section';
    section.innerHTML = `
      <h2>Phase Timeline</h2>
      <div class="timeline" id="timeline-container">
        <!-- Timeline items will be populated here -->
      </div>
    `;
    return section;
  }

  /**
   * Create phase details section
   */
  createPhaseDetailsSection() {
    const section = document.createElement('div');
    section.className = 'phase-details';
    section.id = 'phase-details-container';
    section.innerHTML = `
      <div class="empty-state">
        <p>Select a phase from the timeline or use the age selector to view phase details</p>
      </div>
    `;
    return section;
  }

  /**
   * Create print section
   */
  createPrintSection() {
    const section = document.createElement('div');
    section.className = 'print-section';
    section.innerHTML = `
      <h3>Export Options</h3>
      <button class="btn btn-primary" id="print-btn">Print Phase Details</button>
      <button class="btn btn-primary" id="export-progress-btn">Export Progress</button>
      <button class="btn btn-secondary" id="clear-progress-btn">Clear Progress</button>
    `;
    return section;
  }

  /**
   * Initialize event listeners
   */
  initializeEventListeners() {
    const loadBtn = document.getElementById('load-phase-btn');
    const viewAllBtn = document.getElementById('view-all-btn');
    const printBtn = document.getElementById('print-btn');
    const exportProgressBtn = document.getElementById('export-progress-btn');
    const clearProgressBtn = document.getElementById('clear-progress-btn');
    const ageInput = document.getElementById('age-input');
    const ageGroupSelect = document.getElementById('age-group-select');

    loadBtn?.addEventListener('click', () => this.handleLoadPhase());
    viewAllBtn?.addEventListener('click', () => this.handleViewAllPhases());
    printBtn?.addEventListener('click', () => window.print());
    exportProgressBtn?.addEventListener('click', () => this.handleExportProgress());
    clearProgressBtn?.addEventListener('click', () => this.handleClearProgress());

    ageInput?.addEventListener('change', () => this.updateTimelineByAge());
    ageGroupSelect?.addEventListener('change', () => this.handleAgeGroupChange());
  }

  /**
   * Handle loading phase by age
   */
  async handleLoadPhase() {
    const ageInput = document.getElementById('age-input');
    const age = parseInt(ageInput.value) || 0;

    const phases = this.getPhasesByAge(age);
    if (phases.length > 0) {
      await this.displayPhase(phases[0].phase_id);
    } else {
      alert('No phase found for this age. Please enter an age between 0-216 months (0-18 years).');
    }
  }

  /**
   * Handle viewing all phases
   */
  handleViewAllPhases() {
    const ageGroupSelect = document.getElementById('age-group-select');
    const ageGroupId = parseInt(ageGroupSelect.value);

    if (!ageGroupId) {
      alert('Please select an age group first');
      return;
    }

    const phases = this.getPhasesByAgeGroup(ageGroupId);
    this.displayPhaseList(phases);
  }

  /**
   * Handle age group selection change
   */
  handleAgeGroupChange() {
    const ageGroupSelect = document.getElementById('age-group-select');
    const ageGroupId = parseInt(ageGroupSelect.value);

    if (!ageGroupId) return;

    const phases = this.getPhasesByAgeGroup(ageGroupId);
    this.updateTimeline(phases);
  }

  /**
   * Update timeline by age
   */
  updateTimelineByAge() {
    const ageInput = document.getElementById('age-input');
    const age = parseInt(ageInput.value) || 0;

    const phases = this.getPhasesByAge(age);
    if (phases.length > 0) {
      this.updateTimeline([phases[0]]);
    }
  }

  /**
   * Update timeline UI
   */
  updateTimeline(phases) {
    const timelineContainer = document.getElementById('timeline-container');
    if (!timelineContainer) return;

    timelineContainer.innerHTML = '';

    phases.forEach(phase => {
      const item = document.createElement('div');
      item.className = 'timeline-item';
      item.innerHTML = `
        <div class="timeline-item-title">${phase.title}</div>
        <div class="timeline-item-age">${phase.age_min}-${phase.age_max} years</div>
      `;
      item.addEventListener('click', () => this.displayPhase(phase.phase_id));
      timelineContainer.appendChild(item);
    });
  }

  /**
   * Display phase details
   */
  async displayPhase(phaseId) {
    const phase = this.getPhaseById(phaseId);
    if (!phase) return;

    this.currentPhase = phase;
    const progress = await this.loadChecklistProgress(phaseId);
    this.currentProgress = progress.items;

    const container = document.getElementById('phase-details-container');
    container.innerHTML = this.renderPhaseDetails(phase);

    // Restore checkbox states
    this.restoreChecklistState(phaseId);

    // Add event listeners for checkboxes
    const checkboxes = container.querySelectorAll('.checklist-item input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => this.handleChecklistChange(phaseId, e));
    });

    // Update timeline active state
    this.updateTimelineActiveState(phaseId);

    // Update progress indicators
    this.updateProgressIndicators(phaseId);
  }

  /**
   * Render phase details HTML
   */
  renderPhaseDetails(phase) {
    const ageGroupName = phase.age_group_name || '';
    const duration = phase.duration_months || 0;

    let html = `
      <div class="phase-header">
        <h2>${phase.title}</h2>
        <p>${phase.description}</p>
        <div class="phase-meta">
          <div class="phase-meta-item">
            <strong>Phase:</strong> ${phase.phase_id}
          </div>
          <div class="phase-meta-item">
            <strong>Age Group:</strong> ${ageGroupName}
          </div>
          <div class="phase-meta-item">
            <strong>Age Range:</strong> ${phase.age_min}-${phase.age_max} years
          </div>
          <div class="phase-meta-item">
            <strong>Duration:</strong> ${duration} months
          </div>
        </div>
      </div>
    `;

    // Legal Obligations Section
    if (phase.legal_obligations && phase.legal_obligations.length > 0) {
      html += `
        <div class="phase-section">
          <h3><span class="section-icon">⚖</span> Legal Obligations</h3>
          <div class="legal-obligations">
      `;
      phase.legal_obligations.forEach(obligation => {
        html += `
          <div class="obligation-item">
            <div class="obligation-label">${obligation.obligation}</div>
            <div class="obligation-text"><strong>Deadline:</strong> ${obligation.deadline}</div>
            <div class="obligation-text"><strong>Responsible Party:</strong> ${obligation.responsible_party}</div>
            <div class="obligation-text"><strong>Consequence:</strong> ${obligation.consequence}</div>
          </div>
        `;
      });
      html += `
          </div>
        </div>
      `;
    }

    // Financial Breakdown Section
    if (phase.financial_breakdown) {
      html += `
        <div class="phase-section">
          <h3><span class="section-icon">💰</span> Financial Breakdown (USD)</h3>
          <div class="financial-breakdown">
            <div class="financial-item">
              <div class="financial-item-label">Monthly Total</div>
              <div class="financial-item-amount">$${phase.financial_breakdown.total_monthly}</div>
            </div>
            <div class="financial-item">
              <div class="financial-item-label">Total Range</div>
              <div class="financial-item-amount">$${phase.financial_breakdown.total_min} - $${phase.financial_breakdown.total_max}</div>
            </div>
      `;

      if (phase.financial_breakdown.components) {
        phase.financial_breakdown.components.forEach(component => {
          html += `
            <div class="financial-item">
              <div class="financial-item-label">${component.item}</div>
              <div class="financial-item-amount">$${component.min} - $${component.max}</div>
              <div style="font-size: 12px; color: #555; margin-top: 4px;">${component.frequency}</div>
            </div>
          `;
        });
      }

      html += `
          </div>
        </div>
      `;
    }

    // Checklist Section
    if (phase.checklist && phase.checklist.length > 0) {
      html += `
        <div class="phase-section">
          <h3><span class="section-icon">✓</span> Checklist (${phase.checklist.length} items)</h3>
          <div class="checklist">
      `;
      phase.checklist.forEach((item, index) => {
        html += `
          <div class="checklist-item">
            <input type="checkbox" id="check-${index}" class="checklist-check" data-index="${index}">
            <label for="check-${index}">${item}</label>
          </div>
        `;
      });
      html += `
          </div>
          <div class="progress-indicator" id="progress-${phase.phase_id}">
            <span>Progress:</span>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 0%"></div>
            </div>
            <span id="progress-text-${phase.phase_id}">0%</span>
          </div>
        </div>
      `;
    }

    // Resources Section
    if (phase.resources && phase.resources.length > 0) {
      html += `
        <div class="phase-section">
          <h3><span class="section-icon">📚</span> Required Resources</h3>
          <div class="resources">
      `;
      phase.resources.forEach(resource => {
        html += `
          <div class="resource-item">
            <div class="resource-name">${resource.resource_name}</div>
            <div class="resource-type">${resource.type}</div>
            <div style="font-size: 12px; color: #5499c7; margin-top: 8px;">
              Provider: ${resource.responsible_provider}
            </div>
          </div>
        `;
      });
      html += `
          </div>
        </div>
      `;
    }

    // Documents Needed Section
    if (phase.documents_needed && phase.documents_needed.length > 0) {
      html += `
        <div class="phase-section">
          <h3><span class="section-icon">📄</span> Documents Needed</h3>
          <div class="documents-needed">
      `;
      phase.documents_needed.forEach(doc => {
        html += `<div class="document-item">• ${doc}</div>`;
      });
      html += `
          </div>
        </div>
      `;
    }

    return html;
  }

  /**
   * Display phase list
   */
  displayPhaseList(phases) {
    const container = document.getElementById('phase-details-container');
    const ageGroupName = phases[0]?.age_group_name || '';

    let html = `
      <div class="phase-header">
        <h2>${ageGroupName} Phases</h2>
        <p>${phases.length} phases in this age group</p>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
    `;

    phases.forEach(phase => {
      const progress = this.loadLocalChecklistState(phase.phase_id);
      const totalItems = phase.checklist?.length || 0;
      const completedItems = Object.values(progress).filter(v => v).length;
      const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      html += `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; cursor: pointer; transition: all 0.3s;" onclick="this.dispatchEvent(new CustomEvent('phase-select', {detail: {phaseId: '${phase.phase_id}'}}))">
          <h4 style="margin: 0 0 10px 0; color: #2c3e50;">${phase.title}</h4>
          <p style="margin: 0 0 10px 0; font-size: 12px; color: #7f8c8d;">
            <strong>Phase:</strong> ${phase.phase_id} | <strong>Age:</strong> ${phase.age_min}-${phase.age_max} years
          </p>
          <div style="margin-top: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
              <span>Progress:</span>
              <div style="flex: 1; height: 6px; background: #ecf0f1; border-radius: 3px; overflow: hidden;">
                <div style="height: 100%; background: #27ae60; width: ${progressPercent}%;"></div>
              </div>
              <span>${progressPercent}%</span>
            </div>
          </div>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;

    // Add event listeners for phase selection
    container.querySelectorAll('[onclick*="phase-select"]').forEach(el => {
      el.addEventListener('click', async (e) => {
        const phaseId = e.currentTarget.querySelector('h4').parentElement.textContent.match(/Phase: ([\d.]+)/)?.[1];
        if (phaseId) {
          await this.displayPhase(phaseId);
        }
      });
    });
  }

  /**
   * Handle checklist item change
   */
  async handleChecklistChange(phaseId, event) {
    const checkbox = event.target;
    const index = parseInt(checkbox.getAttribute('data-index'));

    if (!this.currentProgress) {
      this.currentProgress = {};
    }

    this.currentProgress[index] = checkbox.checked;
    await this.saveChecklistProgress(phaseId, this.currentProgress);
    this.saveLocalChecklistState(phaseId, this.currentProgress);

    // Update progress indicator
    this.updateProgressIndicators(phaseId);
  }

  /**
   * Restore checklist state from saved progress
   */
  restoreChecklistState(phaseId) {
    const savedState = this.loadLocalChecklistState(phaseId);

    Object.entries(savedState).forEach(([index, checked]) => {
      const checkbox = document.getElementById(`check-${index}`);
      if (checkbox) {
        checkbox.checked = checked;
      }
    });
  }

  /**
   * Update timeline active state
   */
  updateTimelineActiveState(phaseId) {
    document.querySelectorAll('.timeline-item').forEach(item => {
      item.classList.remove('active');
    });

    const phase = this.getPhaseById(phaseId);
    if (phase) {
      const phaseTitle = phase.title;
      document.querySelectorAll('.timeline-item').forEach(item => {
        if (item.querySelector('.timeline-item-title').textContent === phaseTitle) {
          item.classList.add('active');
        }
      });
    }
  }

  /**
   * Update progress indicators
   */
  updateProgressIndicators(phaseId) {
    const phase = this.currentPhase;
    if (!phase || !phase.checklist) return;

    const totalItems = phase.checklist.length;
    const completedItems = Object.values(this.currentProgress || {}).filter(v => v).length;
    const progressPercent = Math.round((completedItems / totalItems) * 100);

    const progressContainer = document.getElementById(`progress-${phaseId}`);
    if (progressContainer) {
      const progressFill = progressContainer.querySelector('.progress-fill');
      const progressText = document.getElementById(`progress-text-${phaseId}`);

      if (progressFill) progressFill.style.width = progressPercent + '%';
      if (progressText) progressText.textContent = progressPercent + '%';
    }
  }

  /**
   * Handle export progress
   */
  handleExportProgress() {
    const progressData = {
      userId: this.userId,
      exportDate: new Date().toISOString(),
      phases: {}
    };

    this.data.phases.forEach(phase => {
      const saved = this.loadLocalChecklistState(phase.phase_id);
      const totalItems = phase.checklist?.length || 0;
      const completedItems = Object.values(saved).filter(v => v).length;

      progressData.phases[phase.phase_id] = {
        title: phase.title,
        ageGroup: phase.age_group_name,
        progress: Math.round((completedItems / totalItems) * 100),
        completedItems,
        totalItems
      };
    });

    const json = JSON.stringify(progressData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifecycle-progress-${this.userId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Handle clear progress
   */
  handleClearProgress() {
    if (confirm('Are you sure you want to clear all progress? This cannot be undone.')) {
      this.data.phases.forEach(phase => {
        localStorage.removeItem(`lifecycle_progress_${phase.phase_id}`);
      });

      if (this.currentPhase) {
        this.displayPhase(this.currentPhase.phase_id);
      }

      alert('All progress has been cleared.');
    }
  }

  /**
   * Filter phases by search query
   */
  searchPhases(query) {
    if (!this.data || !this.data.phases) return [];

    const lowerQuery = query.toLowerCase();
    return this.data.phases.filter(phase =>
      phase.title.toLowerCase().includes(lowerQuery) ||
      phase.description.toLowerCase().includes(lowerQuery) ||
      phase.phase_id.includes(query)
    );
  }
}

// Export for use in browser environment
if (typeof window !== 'undefined') {
  window.LifecycleModule = LifecycleModule;
}
