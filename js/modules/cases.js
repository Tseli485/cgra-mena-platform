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
   * Main render function
   */
  render() {
    if (!this.container) {
      console.error('Cases container not found');
      return;
    }

    this.container.innerHTML = this.buildHTML();
    this.populateCases();
  }

  /**
   * Build main HTML structure
   */
  buildHTML() {
    return `
      <div class="cases-module">
        <div class="cases-header">
          <h2>Case Management System</h2>
          <div class="cases-controls">
            <input type="text" id="cases-search" class="cases-search" placeholder="Search cases by title, plaintiff, defendant...">
            <div class="cases-view-modes">
              <button class="view-mode-btn active" data-mode="type">By Type</button>
              <button class="view-mode-btn" data-mode="age">By Age</button>
              <button class="view-mode-btn" data-mode="domain">By Domain</button>
            </div>
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
   * Populate cases list based on current view mode
   */
  populateCases() {
    const casesList = document.getElementById('cases-list');
    const cases = this.filterCases();
    const grouped = this.groupCases(cases);

    casesList.innerHTML = '';

    Object.entries(grouped).forEach(([groupName, groupCases]) => {
      const groupEl = document.createElement('div');
      groupEl.className = 'cases-group';

      const groupTitle = document.createElement('div');
      groupTitle.className = 'group-title';
      groupTitle.textContent = groupName;
      groupEl.appendChild(groupTitle);

      groupCases.forEach(caseData => {
        const caseCard = this.createCaseCard(caseData);
        groupEl.appendChild(caseCard);
      });

      casesList.appendChild(groupEl);
    });
  }

  /**
   * Filter cases based on search query
   */
  filterCases() {
    const cases = this.getCases();

    if (!this.searchQuery) {
      return cases;
    }

    const query = this.searchQuery.toLowerCase();
    return cases.filter(c =>
      c.title.toLowerCase().includes(query) ||
      c.plaintiffName.toLowerCase().includes(query) ||
      c.defendantName.toLowerCase().includes(query) ||
      c.id.toLowerCase().includes(query)
    );
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
   * Create individual case card element
   */
  createCaseCard(caseData) {
    const card = document.createElement('div');
    card.className = `case-card ${this.selectedCaseId === caseData.id ? 'active' : ''}`;
    card.dataset.caseId = caseData.id;

    const priorityClass = `priority-${caseData.priority.toLowerCase()}`;
    const statusClass = `status-${caseData.status.replace(/\s+/g, '-').toLowerCase()}`;
    const isBookmarked = this.bookmarkedCases.has(caseData.id);

    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">
          <h4>${this.escapeHtml(caseData.title)}</h4>
          <span class="case-id">${caseData.id}</span>
        </div>
        <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" data-case-id="${caseData.id}" title="Bookmark">
          <span class="bookmark-icon">★</span>
        </button>
      </div>

      <div class="card-meta">
        <span class="priority ${priorityClass}">${caseData.priority}</span>
        <span class="status ${statusClass}">${caseData.status}</span>
        <span class="type-badge">${caseData.type}</span>
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
   * Display detailed case information
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
          <button class="detail-bookmark ${isBookmarked ? 'bookmarked' : ''}" data-case-id="${caseData.id}">
            ${isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
          </button>
        </div>
      </div>

      <div class="detail-tabs">
        <button class="tab-btn active" data-tab="overview">Overview</button>
        <button class="tab-btn" data-tab="details">Details</button>
        <button class="tab-btn" data-tab="documents">Documents</button>
        <button class="tab-btn" data-tab="checklist">Checklist</button>
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

    // Checklist interactions
    document.querySelectorAll('.checklist-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        this.updateChecklistItem(caseId, parseInt(e.target.dataset.index), e.target.checked);
      });
    });
  }

  /**
   * Attach main event listeners
   */
  attachEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('cases-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.populateCases();
      });
    }

    // View mode switching
    document.querySelectorAll('.view-mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.view-mode-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentViewMode = e.target.dataset.mode;
        this.populateCases();
      });
    });

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
