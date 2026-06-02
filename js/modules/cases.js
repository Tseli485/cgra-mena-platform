/**
 * Cases Module - Comprehensive case management system
 * Supports 3 view modes (by type, age, domain), case details, bookmarks, search, checklists
 * 700+ lines of production-ready JavaScript
 */

class CasesModule {
  constructor(containerSelector = '#cases-container') {
    this.container = document.querySelector(containerSelector);
    this.currentViewMode = 'type'; // 'type', 'age', 'domain'
    this.selectedCaseId = null;
    this.searchQuery = '';
    this.bookmarkedCases = new Set(this.loadBookmarks());
    this.caseChecklists = this.loadChecklists();

    // Enhanced filtering properties
    this.filterByType = new Set();
    this.filterByAge = new Set();
    this.filterByDomain = new Set();
    this.sortBy = 'case_id'; // 'case_id', 'complexity', 'age'
    this.filterPreferences = this.loadFilterPreferences();

    // Case type and domain definitions
    this.caseTypes = [
      'Product Liability', 'Probate', 'Criminal Defense', 'Contract Dispute',
      'Employment', 'Environmental', 'Insurance', 'Premises Liability',
      'Intellectual Property', 'Personal Injury', 'Commercial Litigation', 'Medical Malpractice'
    ];

    this.ageGroups = [
      { label: '0-3 Months', min: 0, max: 3 },
      { label: '4-6 Months', min: 4, max: 6 },
      { label: '7-12 Months', min: 7, max: 12 },
      { label: '12+ Months', min: 13, max: 999 }
    ];

    this.domains = [
      'Manufacturing', 'Estates & Trusts', 'Criminal Law', 'Healthcare',
      'Employment Law', 'Environmental Law', 'Insurance Law', 'Hospitality',
      'Technology', 'Government', 'Construction'
    ];

    this.init();
  }

  /**
   * Embedded realistic fictional case data - 12 diverse cases
   */
  getCases() {
    return [
      {
        id: 'CASE-2024-001',
        title: 'Smith v. Atlantic Manufacturing',
        type: 'Product Liability',
        age: 14,
        domain: 'Manufacturing',
        plaintiffName: 'Maria Smith',
        defendantName: 'Atlantic Manufacturing Corp',
        status: 'In Discovery',
        priority: 'High',
        summary: 'Defective machinery caused workplace injury. Plaintiff alleges design flaw.',
        dateOpened: '2024-04-15',
        dateNextHearing: '2026-07-20',
        claimAmount: 2500000,
        assignedAttorney: 'James Robertson',
        description: 'Plaintiff sustained serious injuries from a hydraulic press that allegedly had a faulty pressure release valve. The device was manufactured in 2019 and has documentation of similar failures in three other incidents.',
        documents: 15,
        witnesses: 8,
        evidence: ['Engineering reports', 'Medical records', 'Maintenance logs'],
        checklist: [
          { task: 'Obtain maintenance records from facility', completed: true },
          { task: 'Depose defendant engineers', completed: false },
          { task: 'Arrange expert inspection', completed: true },
          { task: 'Review safety compliance documentation', completed: false }
        ]
      },
      {
        id: 'CASE-2024-002',
        title: 'Johnson Estates Trust Dispute',
        type: 'Probate',
        age: 8,
        domain: 'Estates & Trusts',
        plaintiffName: 'Robert Johnson (Estate)',
        defendantName: 'Patricia Johnson & Others',
        status: 'Mediation',
        priority: 'Medium',
        summary: 'Contested will involving multiple beneficiaries and alleged undue influence.',
        dateOpened: '2024-10-22',
        dateNextHearing: '2026-06-15',
        claimAmount: 1800000,
        assignedAttorney: 'Sarah Mitchell',
        description: 'The deceased\'s second marriage and subsequent will changes created significant family conflict. The original beneficiary (adult child from first marriage) contests the validity claiming undue influence by the surviving spouse.',
        documents: 42,
        witnesses: 12,
        evidence: ['Original will', 'Handwritten notes', 'Medical evaluations', 'Banking records'],
        checklist: [
          { task: 'Obtain medical evaluation of testamentary capacity', completed: true },
          { task: 'Interview witnesses from will signing', completed: true },
          { task: 'Analyze financial benefit patterns', completed: false },
          { task: 'Prepare mediation briefs', completed: true }
        ]
      },
      {
        id: 'CASE-2024-003',
        title: 'State v. Marcus Thompson',
        type: 'Criminal Defense',
        age: 3,
        domain: 'Criminal Law',
        plaintiffName: 'State of California',
        defendantName: 'Marcus Thompson',
        status: 'Trial Preparation',
        priority: 'Critical',
        summary: 'Felony theft charges. Defense claims mistaken identity and lack of physical evidence.',
        dateOpened: '2025-03-10',
        dateNextHearing: '2026-07-08',
        claimAmount: 0,
        assignedAttorney: 'David Chen',
        description: 'Client charged with jewelry store robbery. Prosecution relies heavily on surveillance footage and witness identification. Defense team has identified alibi witnesses and challenges reliability of video evidence due to quality and angle issues.',
        documents: 28,
        witnesses: 15,
        evidence: ['Surveillance footage', 'DNA evidence (negative)', 'Witness statements', 'Cell phone records'],
        checklist: [
          { task: 'File motion for independent video enhancement', completed: false },
          { task: 'Verify alibi witnesses availability', completed: true },
          { task: 'Obtain expert testimony on identification procedures', completed: false },
          { task: 'Challenge chain of custody procedures', completed: true },
          { task: 'Prepare cross-examination outline', completed: false }
        ]
      },
      {
        id: 'CASE-2024-004',
        title: 'Chen Medical Services v. Regional Hospital Network',
        type: 'Contract Dispute',
        age: 11,
        domain: 'Healthcare',
        plaintiffName: 'Chen Medical Services Inc',
        defendantName: 'Regional Hospital Network',
        status: 'Negotiation',
        priority: 'High',
        summary: 'Breach of service agreement regarding staffing and payment terms.',
        dateOpened: '2024-07-05',
        dateNextHearing: '2026-08-12',
        claimAmount: 875000,
        assignedAttorney: 'Lisa Patterson',
        description: 'Chen Medical provided temporary physician staffing services under a three-year contract. Defendant claims failure to meet quality standards; plaintiff alleges non-payment and unilateral contract modifications.',
        documents: 67,
        witnesses: 5,
        evidence: ['Contract documents', 'Email correspondence', 'Performance evaluations', 'Payment records'],
        checklist: [
          { task: 'Analyze performance metrics data', completed: true },
          { task: 'Obtain expert opinion on healthcare staffing standards', completed: false },
          { task: 'Review contract amendment history', completed: true },
          { task: 'Calculate damages and lost revenue', completed: true }
        ]
      },
      {
        id: 'CASE-2024-005',
        title: 'Williams v. Digital Solutions LLC',
        type: 'Employment',
        age: 6,
        domain: 'Employment Law',
        plaintiffName: 'Patricia Williams',
        defendantName: 'Digital Solutions LLC',
        status: 'Discovery',
        priority: 'Medium',
        summary: 'Wrongful termination and age discrimination claim by former VP of Sales.',
        dateOpened: '2024-12-01',
        dateNextHearing: '2026-06-28',
        claimAmount: 650000,
        assignedAttorney: 'Thomas Hughes',
        description: 'Plaintiff, 58, was terminated after 12 years. Company claims performance issues; plaintiff alleges age discrimination and retaliation for raising compliance concerns. Company hired younger replacement at lower salary.',
        documents: 34,
        witnesses: 7,
        evidence: ['Performance reviews', 'Email records', 'Personnel files', 'Demographic data'],
        checklist: [
          { task: 'Obtain employment records for comparators', completed: true },
          { task: 'Analyze compensation history', completed: false },
          { task: 'Interview former colleagues', completed: true },
          { task: 'Examine EEOC complaint procedures', completed: true }
        ]
      },
      {
        id: 'CASE-2024-006',
        title: 'Environmental Protection v. Riverside Industrial',
        type: 'Environmental',
        age: 2,
        domain: 'Environmental Law',
        plaintiffName: 'State Environmental Protection Agency',
        defendantName: 'Riverside Industrial Corp',
        status: 'Injunction Hearing',
        priority: 'Critical',
        summary: 'Alleged groundwater contamination from industrial facility. Emergency injunction filed.',
        dateOpened: '2025-04-20',
        dateNextHearing: '2026-06-10',
        claimAmount: 5200000,
        assignedAttorney: 'Michael Green',
        description: 'Testing revealed PFOA and other hazardous substances in groundwater exceeding EPA standards. Facility sits above aquifer serving 15,000 residents. EPA seeks immediate contamination controls and remediation funding.',
        documents: 89,
        witnesses: 11,
        evidence: ['Soil/water samples', 'Historical operations records', 'Environmental impact studies', 'Testing documentation'],
        checklist: [
          { task: 'Arrange independent water quality testing', completed: true },
          { task: 'Prepare remediation cost estimates', completed: false },
          { task: 'File motion for preliminary injunction', completed: true },
          { task: 'Coordinate with public health officials', completed: true }
        ]
      },
      {
        id: 'CASE-2024-007',
        title: 'Patel Family v. Sterling Insurance',
        type: 'Insurance',
        age: 4,
        domain: 'Insurance Law',
        plaintiffName: 'Rajesh & Anjali Patel',
        defendantName: 'Sterling Insurance Group',
        status: 'Arbitration',
        priority: 'Medium',
        summary: 'Homeowners dispute claim denial for water damage covered under policy.',
        dateOpened: '2025-02-14',
        dateNextHearing: '2026-07-05',
        claimAmount: 425000,
        assignedAttorney: 'Jennifer Brooks',
        description: 'Burst pipe caused $425K in water damage. Insurer denied claim claiming "maintenance failure" exclusion. Plaintiffs argue the pipe failure was sudden and accidental, covered under homeowners policy.',
        documents: 18,
        witnesses: 4,
        evidence: ['Insurance policy', 'Adjuster report', 'Plumber inspection', 'Repair estimates'],
        checklist: [
          { task: 'Obtain independent plumbing expert evaluation', completed: true },
          { task: 'Review policy language interpretation precedents', completed: true },
          { task: 'Prepare arbitration memorandum', completed: false },
          { task: 'Gather repair documentation and receipts', completed: true }
        ]
      },
      {
        id: 'CASE-2024-008',
        title: 'Lopez v. Crescent City Hotels Inc',
        type: 'Premises Liability',
        age: 9,
        domain: 'Hospitality',
        plaintiffName: 'Elena Lopez',
        defendantName: 'Crescent City Hotels Inc',
        status: 'Settlement Negotiations',
        priority: 'Medium',
        summary: 'Slip and fall incident in hotel lobby. Allegation of inadequate cleaning/warning.',
        dateOpened: '2024-09-12',
        dateNextHearing: '2026-06-22',
        claimAmount: 325000,
        assignedAttorney: 'Robert Martinez',
        description: 'Plaintiff slipped on wet marble floor during rainstorm. Hotel claims no visible hazard; plaintiff argues inadequate warning signage and improper maintenance. Medical records show permanent mobility impairment.',
        documents: 22,
        witnesses: 6,
        evidence: ['Incident photos', 'Security footage', 'Maintenance logs', 'Medical records'],
        checklist: [
          { task: 'Obtain hotel maintenance procedures review', completed: true },
          { task: 'Interview hotel staff who witnessed incident', completed: false },
          { task: 'Calculate medical expense damages', completed: true },
          { task: 'Analyze similar prior incidents', completed: true }
        ]
      },
      {
        id: 'CASE-2024-009',
        title: 'In Re: Morrison Technology Patent Infringement',
        type: 'Intellectual Property',
        age: 7,
        domain: 'Technology',
        plaintiffName: 'Morrison Technology Corp',
        defendantName: 'Nexus Innovations Ltd',
        status: 'Expert Discovery',
        priority: 'High',
        summary: 'Patent infringement claim for data compression algorithm.',
        dateOpened: '2024-11-03',
        dateNextHearing: '2026-07-15',
        claimAmount: 3400000,
        assignedAttorney: 'William Foster',
        description: 'Morrison holds patent for proprietary data compression technology. Nexus released competing product with allegedly identical compression methodology. Morrison seeks damages and injunctive relief to prevent product sales.',
        documents: 56,
        witnesses: 9,
        evidence: ['Patent documents', 'Product source code', 'Technical specifications', 'Sales data'],
        checklist: [
          { task: 'Retain technical expert witness', completed: true },
          { task: 'Conduct comparative analysis of algorithms', completed: false },
          { task: 'Obtain competitor market analysis', completed: true },
          { task: 'Prepare claim construction briefs', completed: false }
        ]
      },
      {
        id: 'CASE-2024-010',
        title: 'Rodriguez v. State Department of Transportation',
        type: 'Personal Injury',
        age: 5,
        domain: 'Government',
        plaintiffName: 'Francisco Rodriguez',
        defendantName: 'State Department of Transportation',
        status: 'Government Negotiation',
        priority: 'High',
        summary: 'Motor vehicle accident caused by defective road infrastructure.',
        dateOpened: '2025-01-18',
        dateNextHearing: '2026-06-30',
        claimAmount: 1250000,
        assignedAttorney: 'Amanda Richardson',
        description: 'Plaintiff\'s vehicle struck pothole causing loss of control and crash. Investigation reveals inadequate road maintenance and delayed repairs despite multiple complaints. State claims immunity; plaintiff argues negligent maintenance.',
        documents: 41,
        witnesses: 8,
        evidence: ['Road maintenance records', 'Accident reconstruction', 'Medical records', 'Prior complaint documentation'],
        checklist: [
          { task: 'Obtain DOT maintenance records', completed: true },
          { task: 'Hire accident reconstruction expert', completed: true },
          { task: 'Review governmental immunity exceptions', completed: false },
          { task: 'Calculate lifetime medical care costs', completed: true }
        ]
      },
      {
        id: 'CASE-2024-011',
        title: 'Metropolitan Bank v. Cascade Construction',
        type: 'Commercial Litigation',
        age: 1,
        domain: 'Construction',
        plaintiffName: 'Metropolitan Bank',
        defendantName: 'Cascade Construction Corp',
        status: 'Initial Complaint',
        priority: 'High',
        summary: 'Breach of construction loan agreement and failure to complete building project.',
        dateOpened: '2025-05-27',
        dateNextHearing: '2026-07-22',
        claimAmount: 4100000,
        assignedAttorney: 'Christopher Adams',
        description: 'Bank financed $4.1M commercial construction project. Contractor abandoned work 60% complete, citing financial difficulties. Bank now seeks recovery from contractor and performance bond holders. Project completion costs escalating.',
        documents: 73,
        witnesses: 10,
        evidence: ['Loan agreement', 'Construction contracts', 'Performance bond', 'Progress reports'],
        checklist: [
          { task: 'Verify performance bond claim procedures', completed: false },
          { task: 'Obtain completion cost estimates', completed: true },
          { task: 'Review contractor financial records', completed: false },
          { task: 'Analyze contract material breach language', completed: true }
        ]
      },
      {
        id: 'CASE-2024-012',
        title: 'Harper Family v. Westside Medical Center',
        type: 'Medical Malpractice',
        age: 10,
        domain: 'Healthcare',
        plaintiffName: 'David & Susan Harper',
        defendantName: 'Westside Medical Center',
        status: 'Expert Review Phase',
        priority: 'Critical',
        summary: 'Surgical error during routine procedure resulted in permanent disability.',
        dateOpened: '2024-08-19',
        dateNextHearing: '2026-07-10',
        claimAmount: 7500000,
        assignedAttorney: 'Victoria Sterling',
        description: 'Patient underwent elective surgery; surgeon damaged adjacent nerve due to inadequate visualization. Patient now has permanent motor and sensory impairment. Medical expert review supports deviation from standard of care.',
        documents: 94,
        witnesses: 7,
        evidence: ['Medical records', 'Surgical notes', 'Pathology reports', 'Expert testimony'],
        checklist: [
          { task: 'Obtain medical expert affidavit', completed: true },
          { task: 'Analyze surgical technique alternatives', completed: false },
          { task: 'Calculate future care costs', completed: true },
          { task: 'Prepare damages presentation', completed: false }
        ]
      }
    ];
  }

  /**
   * Initialize the module and render interface
   */
  init() {
    this.render();
    this.attachEventListeners();
  }

  /**
   * Main render function with options support
   */
  render(targetId = null, options = {}) {
    // If targetId provided, use that instead
    if (targetId) {
      this.container = document.querySelector(targetId);
    }

    if (!this.container) {
      console.error('Cases container not found');
      return;
    }

    // Apply rendering options
    const renderOptions = {
      showFilters: options.showFilters !== false,
      showSearch: options.showSearch !== false,
      showBookmarks: options.showBookmarks !== false,
      enablePrint: options.enablePrint !== false,
      enableExport: options.enableExport !== false,
      ...options
    };

    this.container.innerHTML = this.buildHTML();
    this.populateCases();
    this.attachEventListeners();

    return renderOptions;
  }

  /**
   * Build main HTML structure with comprehensive filtering
   */
  buildHTML() {
    return `
      <div class="cases-module">
        <div class="cases-header">
          <h2>Case Management System</h2>
          <div class="cases-search-section">
            <input type="text" id="cases-search" class="cases-search" placeholder="Full-text search: narratives, problems, solutions, lessons...">
            <div class="search-info">
              <span id="results-counter" class="results-counter">All cases</span>
            </div>
          </div>
        </div>

        <div class="cases-filters-panel">
          <div class="filters-header">
            <h3>Filters</h3>
            <button id="clear-filters-btn" class="clear-filters-btn">Clear All</button>
          </div>

          <div class="filter-section">
            <label class="filter-label">Case Type</label>
            <select id="type-filter" class="type-filter-select">
              <option value="">All Types</option>
              ${this.caseTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
            </select>
          </div>

          <div class="filter-section">
            <label class="filter-label">Age Group</label>
            <div class="age-filter-buttons">
              ${this.ageGroups.map(group => `
                <button class="age-filter-btn" data-age-group="${group.label}" title="${group.label}">
                  ${group.label}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="filter-section">
            <label class="filter-label">Domain</label>
            <div class="domain-filter-checkboxes">
              ${this.getDomains().map(domain => `
                <label class="domain-checkbox-label">
                  <input type="checkbox" class="domain-filter-checkbox" value="${domain}">
                  <span>${domain}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <div class="filter-section">
            <label class="filter-label">Sort By</label>
            <select id="sort-filter" class="sort-filter-select">
              <option value="case_id">Case ID</option>
              <option value="complexity">Complexity (Claim Amount)</option>
              <option value="age">Age</option>
            </select>
          </div>
        </div>

        <div class="cases-content">
          <div class="cases-list-panel">
            <div id="cases-list" class="cases-list"></div>
          </div>
          <div class="cases-detail-panel">
            <div id="cases-detail" class="cases-detail">
              <div class="detail-placeholder">Select a case to view details</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get unique domains from case data
   */
  getDomains() {
    const cases = this.getCases();
    const uniqueDomains = [...new Set(cases.map(c => c.domain))];
    return uniqueDomains.sort();
  }

  /**
   * Populate cases list based on current filters
   */
  populateCases() {
    const casesList = document.getElementById('cases-list');
    const cases = this.filterCases();

    // Update results counter
    const resultsCounter = document.getElementById('results-counter');
    if (resultsCounter) {
      resultsCounter.textContent = `${cases.length} case${cases.length !== 1 ? 's' : ''} found`;
    }

    casesList.innerHTML = '';

    if (cases.length === 0) {
      casesList.innerHTML = '<div class="no-results">No cases match your filters</div>';
      return;
    }

    // Display cases as list (not grouped when filtering)
    cases.forEach(caseData => {
      const caseCard = this.createCaseCard(caseData);
      casesList.appendChild(caseCard);
    });
  }

  /**
   * Filter cases based on search query and active filters
   */
  filterCases() {
    let cases = this.getCases();

    // Full-text search across narratives, problems, solutions, lessons
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      cases = cases.filter(c => {
        const searchableText = [
          c.title, c.plaintiffName, c.defendantName, c.id,
          c.summary, c.description, c.type, c.domain
        ].join(' ').toLowerCase();
        return searchableText.includes(query);
      });
    }

    // Filter by type
    if (this.filterByType.size > 0) {
      cases = cases.filter(c => this.filterByType.has(c.type));
    }

    // Filter by age group
    if (this.filterByAge.size > 0) {
      cases = cases.filter(c => {
        for (let ageGroup of this.filterByAge) {
          const groupDef = this.ageGroups.find(ag => ag.label === ageGroup);
          if (groupDef && c.age >= groupDef.min && c.age <= groupDef.max) {
            return true;
          }
        }
        return false;
      });
    }

    // Filter by domain
    if (this.filterByDomain.size > 0) {
      cases = cases.filter(c => this.filterByDomain.has(c.domain));
    }

    // Apply sorting
    cases = this.sortCases(cases);

    return cases;
  }

  /**
   * Sort cases based on current sort preference
   */
  sortCases(cases) {
    const sorted = [...cases];

    if (this.sortBy === 'complexity') {
      sorted.sort((a, b) => b.claimAmount - a.claimAmount);
    } else if (this.sortBy === 'age') {
      sorted.sort((a, b) => a.age - b.age);
    } else {
      // Default: sort by case_id
      sorted.sort((a, b) => a.id.localeCompare(b.id));
    }

    return sorted;
  }

  /**
   * Perform advanced full-text search
   */
  search(query) {
    this.searchQuery = query;
    this.populateCases();
    return this.filterCases();
  }

  /**
   * Filter cases by vulnerability type
   */
  filterByTypeMethod(type) {
    if (this.filterByType.has(type)) {
      this.filterByType.delete(type);
    } else {
      this.filterByType.add(type);
    }
    this.populateCases();
  }

  /**
   * Filter cases by age group
   */
  filterByAgeMethod(ageGroup) {
    if (this.filterByAge.has(ageGroup)) {
      this.filterByAge.delete(ageGroup);
    } else {
      this.filterByAge.add(ageGroup);
    }
    this.populateCases();
  }

  /**
   * Filter cases by problem domain
   */
  filterByDomainMethod(domain) {
    if (this.filterByDomain.has(domain)) {
      this.filterByDomain.delete(domain);
    } else {
      this.filterByDomain.add(domain);
    }
    this.populateCases();
  }

  /**
   * Clear all filters
   */
  clearAllFilters() {
    this.filterByType.clear();
    this.filterByAge.clear();
    this.filterByDomain.clear();
    this.searchQuery = '';
    this.sortBy = 'case_id';
    this.updateFilterUI();
    this.populateCases();
  }

  /**
   * Update filter UI to reflect current state
   */
  updateFilterUI() {
    // Reset type filter
    const typeFilter = document.getElementById('type-filter');
    if (typeFilter) {
      typeFilter.value = '';
    }

    // Reset age buttons
    document.querySelectorAll('.age-filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Reset domain checkboxes
    document.querySelectorAll('.domain-filter-checkbox').forEach(cb => {
      cb.checked = false;
    });

    // Reset sort filter
    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) {
      sortFilter.value = 'case_id';
    }

    // Reset search
    const searchInput = document.getElementById('cases-search');
    if (searchInput) {
      searchInput.value = '';
    }
  }

  /**
   * Group cases by current view mode
   */
  groupCases(cases) {
    const grouped = {};

    cases.forEach(caseData => {
      let groupKey;

      if (this.currentViewMode === 'type') {
        groupKey = caseData.type;
      } else if (this.currentViewMode === 'age') {
        if (caseData.age <= 3) groupKey = '0-3 Months';
        else if (caseData.age <= 6) groupKey = '4-6 Months';
        else if (caseData.age <= 12) groupKey = '7-12 Months';
        else groupKey = '12+ Months';
      } else if (this.currentViewMode === 'domain') {
        groupKey = caseData.domain;
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(caseData);
    });

    return grouped;
  }

  /**
   * Create individual case card element with enhanced details
   */
  createCaseCard(caseData) {
    const card = document.createElement('div');
    card.className = `case-card ${this.selectedCaseId === caseData.id ? 'active' : ''}`;
    card.dataset.caseId = caseData.id;

    const priorityClass = `priority-${caseData.priority.toLowerCase()}`;
    const statusClass = `status-${caseData.status.replace(/\s+/g, '-').toLowerCase()}`;
    const isBookmarked = this.bookmarkedCases.has(caseData.id);

    // Determine complexity level based on claim amount
    const complexity = caseData.claimAmount > 5000000 ? 'High' :
                     caseData.claimAmount > 2000000 ? 'Medium' : 'Low';

    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">
          <h4>${this.escapeHtml(caseData.title)}</h4>
          <span class="case-id">${caseData.id}</span>
        </div>
        <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" data-case-id="${caseData.id}" title="Bookmark">
          <span class="bookmark-icon">${isBookmarked ? '★' : '☆'}</span>
        </button>
      </div>

      <div class="card-meta">
        <span class="priority ${priorityClass}">${caseData.priority}</span>
        <span class="status ${statusClass}">${caseData.status}</span>
        <span class="type-badge">${caseData.type}</span>
        <span class="age-badge">${caseData.age} months</span>
      </div>

      <div class="card-domain-info">
        <span class="domain-label">Domain:</span>
        <span class="domain-value">${caseData.domain}</span>
        <span class="complexity-label">Complexity:</span>
        <span class="complexity-value ${complexity.toLowerCase()}">${complexity}</span>
      </div>

      <div class="card-parties">
        <div class="party">
          <span class="label">Plaintiff:</span>
          <span class="value">${this.escapeHtml(caseData.plaintiffName)}</span>
        </div>
        <div class="party">
          <span class="label">Defendant:</span>
          <span class="value">${this.escapeHtml(caseData.defendantName)}</span>
        </div>
      </div>

      <div class="card-summary">
        ${this.escapeHtml(caseData.summary)}
      </div>

      <div class="card-footer">
        <span class="claim-amount">$${this.formatNumber(caseData.claimAmount)}</span>
        <span class="attorney">${this.escapeHtml(caseData.assignedAttorney)}</span>
        <span class="resources-link">
          <a href="#" class="view-resources" data-case-id="${caseData.id}">Resources ↗</a>
        </span>
      </div>
    `;

    card.addEventListener('click', () => this.selectCase(caseData.id));

    return card;
  }

  /**
   * Select and display case details
   */
  selectCase(caseId) {
    this.selectedCaseId = caseId;
    const caseData = this.getCases().find(c => c.id === caseId);

    if (!caseData) return;

    // Update active card
    document.querySelectorAll('.case-card').forEach(card => {
      card.classList.remove('active');
    });
    document.querySelector(`[data-case-id="${caseId}"]`)?.classList.add('active');

    // Display detail panel
    this.displayCaseDetail(caseData);
  }

  /**
   * Display detailed case information with export/print options
   */
  displayCaseDetail(caseData) {
    const detailPanel = document.getElementById('cases-detail');
    const checklist = this.caseChecklists[caseData.id] || caseData.checklist;
    const isBookmarked = this.bookmarkedCases.has(caseData.id);

    const detailHTML = `
      <div class="detail-header">
        <div class="detail-title">
          <h3>${this.escapeHtml(caseData.title)}</h3>
          <span class="case-id">${caseData.id}</span>
        </div>
        <div class="detail-actions">
          <button class="detail-bookmark ${isBookmarked ? 'bookmarked' : ''}" data-case-id="${caseData.id}">
            ${isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
          </button>
          <button class="detail-print-btn" data-case-id="${caseData.id}" title="Print case view">🖨 Print</button>
          <button class="detail-export-btn" data-case-id="${caseData.id}" title="Export as text">📄 Export</button>
        </div>
      </div>

      <div class="detail-tabs">
        <button class="tab-btn active" data-tab="overview">Overview</button>
        <button class="tab-btn" data-tab="details">Details</button>
        <button class="tab-btn" data-tab="documents">Documents</button>
        <button class="tab-btn" data-tab="checklist">Checklist</button>
        <button class="tab-btn" data-tab="resources">Resources</button>
      </div>

      <div class="detail-content">
        <div class="tab-content active" data-tab="overview">
          ${this.buildOverviewTab(caseData)}
        </div>

        <div class="tab-content" data-tab="details">
          ${this.buildDetailsTab(caseData)}
        </div>

        <div class="tab-content" data-tab="documents">
          ${this.buildDocumentsTab(caseData)}
        </div>

        <div class="tab-content" data-tab="checklist">
          ${this.buildChecklistTab(caseData)}
        </div>

        <div class="tab-content" data-tab="resources">
          ${this.buildResourcesTab(caseData)}
        </div>
      </div>
    `;

    detailPanel.innerHTML = detailHTML;

    // Attach event listeners for detail panel
    this.attachDetailEventListeners(caseData.id);
  }

  /**
   * Build overview tab content
   */
  buildOverviewTab(caseData) {
    const priorityClass = `priority-${caseData.priority.toLowerCase()}`;
    const statusClass = `status-${caseData.status.replace(/\s+/g, '-').toLowerCase()}`;

    return `
      <div class="overview-section">
        <div class="info-grid">
          <div class="info-item">
            <label>Type</label>
            <span>${caseData.type}</span>
          </div>
          <div class="info-item">
            <label>Domain</label>
            <span>${caseData.domain}</span>
          </div>
          <div class="info-item">
            <label>Status</label>
            <span class="status ${statusClass}">${caseData.status}</span>
          </div>
          <div class="info-item">
            <label>Priority</label>
            <span class="priority ${priorityClass}">${caseData.priority}</span>
          </div>
          <div class="info-item">
            <label>Assigned Attorney</label>
            <span>${this.escapeHtml(caseData.assignedAttorney)}</span>
          </div>
          <div class="info-item">
            <label>Claim Amount</label>
            <span class="amount">$${this.formatNumber(caseData.claimAmount)}</span>
          </div>
        </div>

        <div class="summary-section">
          <h4>Summary</h4>
          <p>${this.escapeHtml(caseData.summary)}</p>
        </div>

        <div class="description-section">
          <h4>Description</h4>
          <p>${this.escapeHtml(caseData.description)}</p>
        </div>
      </div>
    `;
  }

  /**
   * Build details tab content
   */
  buildDetailsTab(caseData) {
    return `
      <div class="details-section">
        <div class="detail-subsection">
          <h4>Parties</h4>
          <div class="parties-list">
            <div class="party-item">
              <span class="label">Plaintiff:</span>
              <span class="value">${this.escapeHtml(caseData.plaintiffName)}</span>
            </div>
            <div class="party-item">
              <span class="label">Defendant:</span>
              <span class="value">${this.escapeHtml(caseData.defendantName)}</span>
            </div>
          </div>
        </div>

        <div class="detail-subsection">
          <h4>Important Dates</h4>
          <div class="dates-list">
            <div class="date-item">
              <span class="label">Case Opened:</span>
              <span class="value">${this.formatDate(caseData.dateOpened)}</span>
            </div>
            <div class="date-item">
              <span class="label">Next Hearing:</span>
              <span class="value">${this.formatDate(caseData.dateNextHearing)}</span>
            </div>
          </div>
        </div>

        <div class="detail-subsection">
          <h4>Evidence & Witnesses</h4>
          <div class="evidence-list">
            <div class="evidence-item">
              <span class="label">Documents:</span>
              <span class="value badge">${caseData.documents}</span>
            </div>
            <div class="evidence-item">
              <span class="label">Witnesses:</span>
              <span class="value badge">${caseData.witnesses}</span>
            </div>
            <div class="evidence-types">
              <h5>Key Evidence:</h5>
              <ul>
                ${caseData.evidence.map(e => `<li>${this.escapeHtml(e)}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Build documents tab content
   */
  buildDocumentsTab(caseData) {
    return `
      <div class="documents-section">
        <div class="doc-summary">
          <p>Total Documents: <strong>${caseData.documents}</strong></p>
        </div>
        <div class="doc-categories">
          <div class="doc-category">
            <h5>Core Documents</h5>
            <ul>
              <li>Case Initiation</li>
              <li>Pleadings &amp; Motions</li>
              <li>Discovery Requests</li>
            </ul>
          </div>
          <div class="doc-category">
            <h5>Supporting Evidence</h5>
            <ul>
              <li>Medical/Expert Reports</li>
              <li>Depositions</li>
              <li>Correspondence</li>
            </ul>
          </div>
          <div class="doc-category">
            <h5>Administrative</h5>
            <ul>
              <li>Billing Records</li>
              <li>Status Updates</li>
              <li>Calendar Entries</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Build checklist tab content
   */
  buildChecklistTab(caseData) {
    const checklist = this.caseChecklists[caseData.id] || caseData.checklist;

    return `
      <div class="checklist-section">
        <div class="checklist-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${this.getChecklistProgress(checklist)}%"></div>
          </div>
          <span class="progress-text">${this.getChecklistCompletedCount(checklist)}/${checklist.length} tasks completed</span>
        </div>

        <ul class="checklist-items">
          ${checklist.map((item, idx) => `
            <li class="checklist-item ${item.completed ? 'completed' : ''}">
              <input type="checkbox" class="checklist-checkbox" data-case-id="${caseData.id}" data-index="${idx}" ${item.completed ? 'checked' : ''}>
              <span class="checklist-text">${this.escapeHtml(item.task)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Build resources tab content
   */
  buildResourcesTab(caseData) {
    const relatedCases = this.findRelatedCases(caseData.id);

    return `
      <div class="resources-section">
        <div class="resources-subsection">
          <h4>Related Cases</h4>
          ${relatedCases.length > 0 ? `
            <ul class="related-cases-list">
              ${relatedCases.map(c => `
                <li>
                  <a href="#" class="related-case-link" data-case-id="${c.id}">
                    ${this.escapeHtml(c.title)} <span class="case-id">${c.id}</span>
                  </a>
                  <span class="related-type">${c.type}</span>
                </li>
              `).join('')}
            </ul>
          ` : '<p>No related cases found</p>'}
        </div>

        <div class="resources-subsection">
          <h4>External Resources</h4>
          <ul class="external-resources-list">
            <li><a href="#" target="_blank">Legal Research Database</a></li>
            <li><a href="#" target="_blank">Case Law Archive</a></li>
            <li><a href="#" target="_blank">Expert Witness Directory</a></li>
            <li><a href="#" target="_blank">Court Rules & Procedures</a></li>
          </ul>
        </div>

        <div class="resources-subsection">
          <h4>Case References</h4>
          <ul class="case-references-list">
            <li>Type: <strong>${caseData.type}</strong></li>
            <li>Domain: <strong>${caseData.domain}</strong></li>
            <li>Priority: <strong>${caseData.priority}</strong></li>
            <li>Status: <strong>${caseData.status}</strong></li>
          </ul>
        </div>
      </div>
    `;
  }

  /**
   * Find related cases by type or domain
   */
  findRelatedCases(caseId, limit = 5) {
    const caseData = this.getCases().find(c => c.id === caseId);
    if (!caseData) return [];

    const related = this.getCases().filter(c =>
      c.id !== caseId && (c.type === caseData.type || c.domain === caseData.domain)
    );

    return related.slice(0, limit);
  }

  /**
   * Export case as text
   */
  exportCaseAsText(caseId) {
    const caseData = this.getCases().find(c => c.id === caseId);
    if (!caseData) return;

    const text = `
CASE EXPORT
===========

ID: ${caseData.id}
Title: ${caseData.title}
Type: ${caseData.type}
Domain: ${caseData.domain}

PARTIES
-------
Plaintiff: ${caseData.plaintiffName}
Defendant: ${caseData.defendantName}

STATUS & PRIORITY
-----------------
Status: ${caseData.status}
Priority: ${caseData.priority}
Claim Amount: $${this.formatNumber(caseData.claimAmount)}

CASE INFORMATION
----------------
Assigned Attorney: ${caseData.assignedAttorney}
Case Opened: ${this.formatDate(caseData.dateOpened)}
Next Hearing: ${this.formatDate(caseData.dateNextHearing)}

SUMMARY
-------
${caseData.summary}

DESCRIPTION
-----------
${caseData.description}

EVIDENCE & WITNESSES
--------------------
Documents: ${caseData.documents}
Witnesses: ${caseData.witnesses}

Key Evidence:
${caseData.evidence.map(e => `- ${e}`).join('\n')}

Exported: ${new Date().toLocaleString()}
    `;

    const blob = new Blob([text.trim()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${caseId}-export.txt`;
    link.click();
  }

  /**
   * Print case view
   */
  printCase(caseId) {
    const caseData = this.getCases().find(c => c.id === caseId);
    if (!caseData) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>${caseData.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            h2 { color: #666; margin-top: 20px; }
            .meta { color: #666; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .label { font-weight: bold; }
            ul { margin-left: 20px; }
          </style>
        </head>
        <body>
          <h1>${this.escapeHtml(caseData.title)}</h1>
          <div class="meta">
            <p><span class="label">Case ID:</span> ${caseData.id}</p>
            <p><span class="label">Type:</span> ${caseData.type}</p>
            <p><span class="label">Domain:</span> ${caseData.domain}</p>
          </div>

          <div class="section">
            <h2>Parties</h2>
            <p><span class="label">Plaintiff:</span> ${this.escapeHtml(caseData.plaintiffName)}</p>
            <p><span class="label">Defendant:</span> ${this.escapeHtml(caseData.defendantName)}</p>
          </div>

          <div class="section">
            <h2>Summary</h2>
            <p>${this.escapeHtml(caseData.summary)}</p>
          </div>

          <div class="section">
            <h2>Description</h2>
            <p>${this.escapeHtml(caseData.description)}</p>
          </div>

          <div class="section">
            <h2>Evidence</h2>
            <ul>
              ${caseData.evidence.map(e => `<li>${this.escapeHtml(e)}</li>`).join('')}
            </ul>
          </div>

          <p style="margin-top: 40px; color: #999; font-size: 12px;">
            Printed: ${new Date().toLocaleString()}
          </p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  /**
   * Attach event listeners for detail panel interactions
   */
  attachDetailEventListeners(caseId) {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
      });
    });

    // Bookmark button in detail
    document.querySelectorAll('.detail-bookmark').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleBookmark(caseId, btn);
      });
    });

    // Print button
    document.querySelectorAll('.detail-print-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.target.dataset.caseId;
        this.printCase(id);
      });
    });

    // Export button
    document.querySelectorAll('.detail-export-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.target.dataset.caseId;
        this.exportCaseAsText(id);
      });
    });

    // Related case links
    document.querySelectorAll('.related-case-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const id = e.target.closest('.related-case-link').dataset.caseId;
        this.selectCase(id);
      });
    });

    // Checklist interactions
    document.querySelectorAll('.checklist-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        this.updateChecklistItem(caseId, parseInt(e.target.dataset.index), e.target.checked);
      });
    });
  }

  /**
   * Attach main event listeners for filters and interactions
   */
  attachEventListeners() {
    // Search functionality with debouncing
    const searchInput = document.getElementById('cases-search');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.searchQuery = e.target.value;
          this.populateCases();
        }, 300);
      });
    }

    // Type filter dropdown
    const typeFilter = document.getElementById('type-filter');
    if (typeFilter) {
      typeFilter.addEventListener('change', (e) => {
        if (e.target.value) {
          this.filterByTypeMethod(e.target.value);
        }
      });
    }

    // Age filter buttons
    document.querySelectorAll('.age-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const ageGroup = e.target.dataset.ageGroup;
        e.target.classList.toggle('active');
        this.filterByAgeMethod(ageGroup);
        this.saveFilterPreferences();
      });
    });

    // Domain filter checkboxes
    document.querySelectorAll('.domain-filter-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const domain = e.target.value;
        this.filterByDomainMethod(domain);
        this.saveFilterPreferences();
      });
    });

    // Sort filter
    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) {
      sortFilter.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.populateCases();
        this.saveFilterPreferences();
      });
    }

    // Clear filters button
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        this.clearAllFilters();
      });
    }

    // Bookmark buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('.bookmark-btn')) {
        const btn = e.target.closest('.bookmark-btn');
        const caseId = btn.dataset.caseId;
        this.toggleBookmark(caseId, btn);
      }
    });
  }

  /**
   * Toggle case bookmark status
   */
  toggleBookmark(caseId, btn) {
    if (this.bookmarkedCases.has(caseId)) {
      this.bookmarkedCases.delete(caseId);
    } else {
      this.bookmarkedCases.add(caseId);
    }

    this.saveBookmarks();

    if (btn.classList.contains('bookmark-btn')) {
      btn.classList.toggle('bookmarked');
    } else if (btn.classList.contains('detail-bookmark')) {
      btn.classList.toggle('bookmarked');
      btn.textContent = this.bookmarkedCases.has(caseId) ? '★ Bookmarked' : '☆ Bookmark';
    }
  }

  /**
   * Update checklist item completion status
   */
  updateChecklistItem(caseId, index, completed) {
    if (!this.caseChecklists[caseId]) {
      this.caseChecklists[caseId] = JSON.parse(JSON.stringify(this.getCases().find(c => c.id === caseId).checklist));
    }

    this.caseChecklists[caseId][index].completed = completed;
    this.saveChecklists();

    // Refresh the checklist display
    const caseData = this.getCases().find(c => c.id === caseId);
    const checklistSection = document.querySelector('.checklist-section');
    if (checklistSection) {
      checklistSection.innerHTML = this.buildChecklistTab(caseData).replace(/<div class="checklist-section">|<\/div>$/g, '');
      this.attachDetailEventListeners(caseId);
    }
  }

  /**
   * Get checklist progress percentage
   */
  getChecklistProgress(checklist) {
    if (!checklist || checklist.length === 0) return 0;
    const completed = checklist.filter(item => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  }

  /**
   * Get completed checklist count
   */
  getChecklistCompletedCount(checklist) {
    return checklist.filter(item => item.completed).length;
  }

  /**
   * Format currency values
   */
  formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
  }

  /**
   * Format dates
   */
  formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00Z');
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Load bookmarks from localStorage
   */
  loadBookmarks() {
    const stored = localStorage.getItem('cases-bookmarks');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Save bookmarks to localStorage
   */
  saveBookmarks() {
    localStorage.setItem('cases-bookmarks', JSON.stringify(Array.from(this.bookmarkedCases)));
  }

  /**
   * Load checklists from localStorage
   */
  loadChecklists() {
    const stored = localStorage.getItem('cases-checklists');
    return stored ? JSON.parse(stored) : {};
  }

  /**
   * Save checklists to localStorage
   */
  saveChecklists() {
    localStorage.setItem('cases-checklists', JSON.stringify(this.caseChecklists));
  }

  /**
   * Load filter preferences from localStorage
   */
  loadFilterPreferences() {
    const stored = localStorage.getItem('cases-filter-preferences');
    if (stored) {
      const prefs = JSON.parse(stored);
      this.filterByType = new Set(prefs.filterByType || []);
      this.filterByAge = new Set(prefs.filterByAge || []);
      this.filterByDomain = new Set(prefs.filterByDomain || []);
      this.sortBy = prefs.sortBy || 'case_id';
    }
    return {};
  }

  /**
   * Save filter preferences to localStorage
   */
  saveFilterPreferences() {
    const prefs = {
      filterByType: Array.from(this.filterByType),
      filterByAge: Array.from(this.filterByAge),
      filterByDomain: Array.from(this.filterByDomain),
      sortBy: this.sortBy
    };
    localStorage.setItem('cases-filter-preferences', JSON.stringify(prefs));
  }

  /**
   * Export case data
   */
  exportCaseData(caseId) {
    const caseData = this.getCases().find(c => c.id === caseId);
    if (caseData) {
      const dataStr = JSON.stringify(caseData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${caseId}-export.json`;
      link.click();
    }
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const cases = this.getCases();
    return {
      totalCases: cases.length,
      byType: this.countBy(cases, 'type'),
      byStatus: this.countBy(cases, 'status'),
      byPriority: this.countBy(cases, 'priority'),
      totalClaimAmount: cases.reduce((sum, c) => sum + c.claimAmount, 0),
      bookmarkedCount: this.bookmarkedCases.size
    };
  }

  /**
   * Helper to count items by property
   */
  countBy(array, property) {
    return array.reduce((acc, item) => {
      const key = item[property];
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }
}

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CasesModule;
}
