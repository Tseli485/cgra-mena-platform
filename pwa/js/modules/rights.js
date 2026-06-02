/**
 * RightsObligationsModule
 * Manages MENA rights and tuteur obligations across 4 age phases
 * Includes tabbed interface, expandable sections, comparison tables, checklists
 */

class RightsObligationsModule {
  constructor(containerId = 'rights-container') {
    this.containerId = containerId;
    this.db = null;
    this.currentPhase = 'phase-0-2';
    this.expandedSections = new Set();
    this.initializeDB();
    this.render();
  }

  /**
   * Initialize IndexedDB for persistence
   */
  async initializeDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CGRADatabase', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;

        if (!this.db.objectStoreNames.contains('rights')) {
          const tx = this.db.transaction(['rights'], 'readwrite');
          const store = tx.objectStore('rights');
          store.put({ id: 'expanded-sections', data: [] });
        }

        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('rights')) {
          db.createObjectStore('rights');
        }
      };
    });
  }

  /**
   * Save expanded sections to IndexedDB
   */
  async saveExpandedSections() {
    if (!this.db) return;
    const tx = this.db.transaction(['rights'], 'readwrite');
    const store = tx.objectStore('rights');
    store.put({ id: 'expanded-sections', data: Array.from(this.expandedSections) });
  }

  /**
   * Load expanded sections from IndexedDB
   */
  async loadExpandedSections() {
    if (!this.db) return;
    return new Promise((resolve) => {
      const tx = this.db.transaction(['rights'], 'readonly');
      const store = tx.objectStore('rights');
      const request = store.get('expanded-sections');

      request.onsuccess = () => {
        if (request.result && request.result.data) {
          this.expandedSections = new Set(request.result.data);
        }
        resolve();
      };
    });
  }

  /**
   * Age phases configuration
   */
  getPhases() {
    return {
      'phase-0-2': {
        label: '0-2 Years',
        title: 'Early Childhood',
        description: 'Foundation phase: basic rights, essential tuteur duties'
      },
      'phase-2-6': {
        label: '2-6 Years',
        title: 'Kindergarten',
        description: 'Early education: expanded rights, family contact, socialization'
      },
      'phase-6-12': {
        label: '6-12 Years',
        title: 'Elementary School',
        description: 'Middle childhood: decision participation, financial management'
      },
      'phase-12-18': {
        label: '12-18 Years',
        title: 'Adolescence',
        description: 'Preparation: education choices, work permits, emancipation'
      }
    };
  }

  /**
   * Rights and obligations data structure
   */
  getPhasesData() {
    return {
      'phase-0-2': {
        label: '0-2 Years',
        title: 'Early Childhood',
        sections: {
          'mena-rights': {
            title: 'MENA Legal Rights',
            icon: '⚖️',
            items: [
              { title: 'Birth Certificate & Documentation', details: 'Right to identity documentation, civil registration, nationality establishment' },
              { title: 'Healthcare Access', details: 'Preventive care, vaccinations, medical treatment, health monitoring' },
              { title: 'Shelter & Safe Environment', details: 'Safe housing, protection from harm, hygiene standards' },
              { title: 'Early Care & Education', details: 'Access to childcare facilities, early childhood development programs' },
              { title: 'Food & Nutrition', details: 'Adequate nutrition, breast-feeding support, food security' }
            ]
          },
          'tuteur-obligations': {
            title: 'Tuteur Legal Obligations',
            icon: '📋',
            items: [
              { title: 'Reporting & Registration', details: 'Register with authorities, maintain documentation, report changes in status' },
              { title: 'Health Decision-Making', details: 'Authorize medical treatment, maintain health records, ensure vaccinations' },
              { title: 'Duty of Care', details: 'Provide safe housing, clothing, food, supervision, protection from abuse' },
              { title: 'Daily Advocacy', details: 'Represent interests with institutions, maintain family contact' },
              { title: 'Documentation Management', details: 'Keep birth certificate, health records, legal documents organized' }
            ]
          },
          'mena-financial': {
            title: 'MENA Financial Rights',
            icon: '💰',
            items: [
              { title: 'Early Childhood Education Allocation', details: 'School budget for nursery/pre-K programs, developmental materials' },
              { title: 'Healthcare Funding', details: 'Preventive care coverage, vaccination programs, medical treatment allowance' },
              { title: 'Housing & Living Expenses', details: 'Shelter costs, utilities, maintenance of safe environment' },
              { title: 'Integration & Transition Fund', details: 'Support for entry into kindergarten, social adaptation programs' }
            ]
          },
          'tuteur-financial': {
            title: 'Tuteur Financial Obligations',
            icon: '💳',
            items: [
              { title: 'Account Management', details: 'Open and manage child\'s account, document all transactions' },
              { title: 'Expense Documentation', details: 'Keep receipts for all expenses, maintain detailed budget records' },
              { title: 'Health Cost Coverage', details: 'Pay medical bills, medicines, healthcare services from allocated funds' },
              { title: 'Regular Reporting', details: 'Monthly/quarterly financial statements, account reconciliation' }
            ]
          }
        }
      },
      'phase-2-6': {
        label: '2-6 Years',
        title: 'Kindergarten',
        sections: {
          'mena-rights': {
            title: 'MENA Legal Rights',
            icon: '⚖️',
            items: [
              { title: 'Education Access', details: 'Right to kindergarten/pre-primary education, quality instruction' },
              { title: 'School Attendance', details: 'Regular attendance, safe school environment, qualified teachers' },
              { title: 'Family Contact & Visits', details: 'Regular contact with family members, supervised visits as appropriate' },
              { title: 'Healthcare & Nutrition', details: 'School meals, health screenings, access to healthcare services' },
              { title: 'Play & Recreation', details: 'Right to play, leisure, cultural activities, social development' },
              { title: 'Protection from Abuse', details: 'Safe environment, protection from violence, bullying prevention' }
            ]
          },
          'tuteur-obligations': {
            title: 'Tuteur Legal Obligations',
            icon: '📋',
            items: [
              { title: 'School Enrollment', details: 'Register child in appropriate school, maintain enrollment status' },
              { title: 'Attendance Monitoring', details: 'Ensure regular attendance, communicate with school, address absences' },
              { title: 'Educational Support', details: 'Support learning at home, communicate with teachers, attend parent meetings' },
              { title: 'Family Contact Coordination', details: 'Facilitate appropriate family visits, maintain communication records' },
              { title: 'Health & Nutrition Management', details: 'Monitor nutrition, ensure health screenings, manage medications' },
              { title: 'Safety Advocacy', details: 'Address safety concerns, report abuse, advocate for protective measures' }
            ]
          },
          'mena-financial': {
            title: 'MENA Financial Rights',
            icon: '💰',
            items: [
              { title: 'Education Allocation', details: 'School fees, materials, uniforms, supplies, transportation budget' },
              { title: 'School Meals & Nutrition', details: 'Food costs, school meal programs, dietary support' },
              { title: 'Healthcare Coverage', details: 'School health services, preventive care, medical treatment allocation' },
              { title: 'Activity & Recreation Fund', details: 'School activities, cultural programs, extracurricular participation' },
              { title: 'Transportation Allowance', details: 'School commute costs, safe transportation arrangements' }
            ]
          },
          'tuteur-financial': {
            title: 'Tuteur Financial Obligations',
            icon: '💳',
            items: [
              { title: 'Education Expense Management', details: 'Pay school fees, purchase materials, maintain expense documentation' },
              { title: 'Budget Planning', details: 'Create quarterly education budget, track spending vs allocation' },
              { title: 'Meal & Nutrition Costs', details: 'Cover school meals, supplementary food, nutritional needs' },
              { title: 'Healthcare Payments', details: 'Pay for medical services, vaccinations, health screenings' },
              { title: 'Activity Costs', details: 'Fund school activities, cultural programs, recreational expenses' },
              { title: 'Financial Documentation', details: 'Keep school receipts, medical invoices, activity cost records' }
            ]
          }
        }
      },
      'phase-6-12': {
        label: '6-12 Years',
        title: 'Elementary School',
        sections: {
          'mena-rights': {
            title: 'MENA Legal Rights',
            icon: '⚖️',
            items: [
              { title: 'Primary Education', details: 'Right to quality primary education, qualified teachers, adequate resources' },
              { title: 'Decision Participation', details: 'Age-appropriate input on decisions affecting child, voice in planning' },
              { title: 'School Leadership Representation', details: 'Participation in school councils, student representative opportunities' },
              { title: 'Extracurricular Activities', details: 'Access to sports, arts, clubs, enrichment programs' },
              { title: 'Healthcare Services', details: 'School health programs, dental care, mental health support' },
              { title: 'Family Contact Rights', details: 'Regular family visits, communication, relationship maintenance' },
              { title: 'Protection from Discrimination', details: 'Equal treatment regardless of origin, family status, background' }
            ]
          },
          'tuteur-obligations': {
            title: 'Tuteur Legal Obligations',
            icon: '📋',
            items: [
              { title: 'Education Management', details: 'Ensure enrollment, attendance, academic progress monitoring' },
              { title: 'Decision-Making Partnership', details: 'Consult child on decisions, explain choices, respect preferences' },
              { title: 'School Communication', details: 'Regular teacher meetings, progress discussions, problem-solving collaboration' },
              { title: 'Activity Coordination', details: 'Support extracurricular participation, organize transportation, manage schedule' },
              { title: 'Healthcare Oversight', details: 'Coordinate health services, manage chronic conditions, consent procedures' },
              { title: 'Family Relationship Maintenance', details: 'Facilitate visits, communication, relationship building with family' },
              { title: 'Advocacy Against Discrimination', details: 'Address discrimination, ensure equal treatment, report violations' }
            ]
          },
          'mena-financial': {
            title: 'MENA Financial Rights',
            icon: '💰',
            items: [
              { title: 'Primary Education Allocation', details: 'School fees, textbooks, supplies, uniforms, educational materials' },
              { title: 'School Meals Budget', details: 'Daily meals, nutritious food, special dietary needs support' },
              { title: 'Healthcare & Wellness Fund', details: 'School health services, dental care, mental health support' },
              { title: 'Extracurricular Activity Fund', details: 'Sports, arts, clubs, enrichment programs, activity costs' },
              { title: 'Educational Resources', details: 'Computers, internet access, learning materials, technology' },
              { title: 'Transportation & Equipment', details: 'School commute, sports equipment, activity gear' }
            ]
          },
          'tuteur-financial': {
            title: 'Tuteur Financial Obligations',
            icon: '💳',
            items: [
              { title: 'Education Budget Management', details: 'Plan annual education budget, track school expenses, cost projections' },
              { title: 'School Fee Payment', details: 'Pay tuition, materials, supplies on schedule, maintain payment records' },
              { title: 'Meal & Nutrition Coverage', details: 'Fund school meals, supplementary food, special dietary costs' },
              { title: 'Activity Expense Management', details: 'Pay for sports, arts, clubs, maintain activity participation records' },
              { title: 'Healthcare Cost Coverage', details: 'Fund medical services, dental care, mental health appointments' },
              { title: 'Equipment & Resources', details: 'Purchase necessary educational equipment, technology, supplies' },
              { title: 'Detailed Record Keeping', details: 'Maintain all receipts, invoices, payment records, expense analysis' }
            ]
          }
        }
      },
      'phase-12-18': {
        label: '12-18 Years',
        title: 'Adolescence',
        sections: {
          'mena-rights': {
            title: 'MENA Legal Rights',
            icon: '⚖️',
            items: [
              { title: 'Secondary Education Access', details: 'Quality secondary school, diverse subject options, specialized programs' },
              { title: 'Educational Choices', details: 'Input on school selection, academic track, vocational pathways' },
              { title: 'Work & Vocational Training', details: 'Age-appropriate work opportunities, vocational education, apprenticeships' },
              { title: 'Legal Work Permits', details: 'Right to work with proper permits, youth labor protections' },
              { title: 'Decision-Making Authority', details: 'Increasing autonomy in decisions, consent for medical procedures, planning' },
              { title: 'Financial Education', details: 'Learn money management, banking, financial responsibility' },
              { title: 'Emancipation Preparation', details: 'Transition planning, independence skills, self-sufficiency training' },
              { title: 'Privacy Rights', details: 'Increasing privacy, confidentiality in medical/educational matters' }
            ]
          },
          'tuteur-obligations': {
            title: 'Tuteur Legal Obligations',
            icon: '📋',
            items: [
              { title: 'Secondary Education Support', details: 'Support school selection, ensure enrollment, monitor academic progress' },
              { title: 'Educational Guidance', details: 'Discuss career options, support educational planning, provide guidance' },
              { title: 'Work Authorization', details: 'Assist with work permits, review employment contracts, protect labor rights' },
              { title: 'Transition Planning', details: 'Plan for independence, develop life skills, prepare for adulthood' },
              { title: 'Financial Literacy Teaching', details: 'Teach money management, budgeting, financial decision-making' },
              { title: 'Medical Consent Support', details: 'Support autonomous decisions, provide guidance, respect privacy' },
              { title: 'Emancipation Support', details: 'Prepare legal documents, plan transition to independence, ongoing support' },
              { title: 'Career Mentoring', details: 'Guide career exploration, connect with mentors, develop professional skills' }
            ]
          },
          'mena-financial': {
            title: 'MENA Financial Rights',
            icon: '💰',
            items: [
              { title: 'Secondary Education Allocation', details: 'Higher tuition, advanced materials, technology, exam preparation' },
              { title: 'Vocational Training Fund', details: 'Apprenticeships, technical courses, skills development programs' },
              { title: 'Work-Related Expenses', details: 'Work uniforms, transportation, necessary equipment for employment' },
              { title: 'Financial Independence Fund', details: 'Personal account management, allowance, financial autonomy support' },
              { title: 'Post-Secondary Preparation', details: 'University/college prep, exam fees, application costs, scholarships' },
              { title: 'Healthcare & Wellness', details: 'Adolescent health services, mental health support, wellness programs' },
              { title: 'Emancipation Support Fund', details: 'Housing deposit, startup costs, independence preparation fund' }
            ]
          },
          'tuteur-financial': {
            title: 'Tuteur Financial Obligations',
            icon: '💳',
            items: [
              { title: 'Advanced Education Budget', details: 'Plan for higher tuition, exam fees, advanced materials, technology' },
              { title: 'Vocational Training Investment', details: 'Fund apprenticeships, technical training, skills development' },
              { title: 'Employment Support', details: 'Fund work-related expenses, uniforms, tools, transportation' },
              { title: 'Financial Account Management', details: 'Establish accounts, manage allowances, teach account oversight' },
              { title: 'Post-Secondary Planning Budget', details: 'Save for university, plan exam costs, scholarship application support' },
              { title: 'Healthcare Coverage', details: 'Fund comprehensive health services, mental health, preventive care' },
              { title: 'Independence Preparation Fund', details: 'Set aside emancipation costs, emergency fund, transition support' },
              { title: 'Comprehensive Record Documentation', details: 'Maintain detailed financial records, prepare for independence, audit trail' }
            ]
          }
        }
      }
    };
  }

  /**
   * Generate comparison table
   */
  getComparisonTable() {
    return `
      <div class="rights-comparison-table">
        <h3>Quick Reference: Rights vs Obligations</h3>
        <table>
          <thead>
            <tr>
              <th>Age Phase</th>
              <th>Key MENA Rights</th>
              <th>Key Tuteur Obligations</th>
              <th>Financial Focus</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>0-2 Years</strong></td>
              <td>Documentation, Healthcare, Shelter, Care</td>
              <td>Registration, Care, Health Decisions, Documentation</td>
              <td>Healthcare, Housing, Basic Needs</td>
            </tr>
            <tr>
              <td><strong>2-6 Years</strong></td>
              <td>Education, Family Contact, Play, Nutrition</td>
              <td>Enrollment, Attendance, Family Facilitation, Safety</td>
              <td>School Fees, Meals, Health, Activities</td>
            </tr>
            <tr>
              <td><strong>6-12 Years</strong></td>
              <td>Primary Education, Participation, Activities, Healthcare</td>
              <td>Education Mgmt, Decision Partnership, Family Maintenance, Advocacy</td>
              <td>Education, Extracurriculars, Health, Resources</td>
            </tr>
            <tr>
              <td><strong>12-18 Years</strong></td>
              <td>Secondary Ed, Work Permits, Autonomy, Emancipation Prep</td>
              <td>Education Support, Career Guidance, Work Authorization, Independence Prep</td>
              <td>Advanced Education, Vocational Training, Financial Independence</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Generate checklist for current phase
   */
  getPhaseChecklist() {
    const checklists = {
      'phase-0-2': [
        'Birth certificate obtained and registered',
        'Healthcare: vaccinations up to date',
        'Safe housing established',
        'Health insurance/documentation in place',
        'Regular health check-ups scheduled',
        'Childcare arrangements documented',
        'Tuteur officially registered as guardian',
        'Emergency contacts documented',
        'Basic supplies (formula, clothing, bedding) acquired',
        'Health records organized'
      ],
      'phase-2-6': [
        'Kindergarten enrollment completed',
        'School schedule and attendance monitored',
        'Teacher communication established',
        'School meals verified (nutrition quality)',
        'Health screenings scheduled and completed',
        'Family visit schedule established',
        'School materials and supplies provided',
        'Emergency procedures reviewed with school',
        'Activity participation options reviewed',
        'Regular health check-ups maintained'
      ],
      'phase-6-12': [
        'Primary school enrollment confirmed',
        'Academic progress monitored each term',
        'Teacher conferences scheduled regularly',
        'School supplies and materials funded',
        'Extracurricular activities identified and enrolled',
        'Healthcare services accessed and coordinated',
        'Family relationships maintained with regular contact',
        'School transportation arranged',
        'Participation in school decision-making',
        'Financial records for all school expenses'
      ],
      'phase-12-18': [
        'Secondary school placement confirmed',
        'Academic track/pathway chosen with input',
        'Work permits explored (if applicable)',
        'Vocational training options reviewed',
        'Career mentoring or guidance arranged',
        'Financial education/money management taught',
        'Healthcare including mental health addressed',
        'Transition plan to independence started',
        'Higher education planning initiated',
        'Emancipation timeline discussed and documented'
      ]
    };

    const currentChecklist = checklists[this.currentPhase] || [];
    return `
      <div class="phase-checklist">
        <h4>Checklist for This Phase</h4>
        <ul>
          ${currentChecklist.map(item => `
            <li>
              <input type="checkbox" id="check-${item.replace(/\s+/g, '-')}">
              <label for="check-${item.replace(/\s+/g, '-')}">${item}</label>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Generate resources section
   */
  getResourcesSection() {
    return `
      <div class="resources-section">
        <h3>Resources & Links</h3>
        <div class="resource-grid">
          <div class="resource-card">
            <h4>MENA Education Services</h4>
            <ul>
              <li><a href="#" target="_blank">Education Rights Portal</a></li>
              <li><a href="#" target="_blank">School Enrollment Guide</a></li>
              <li><a href="#" target="_blank">Vocational Training Directory</a></li>
            </ul>
          </div>
          <div class="resource-card">
            <h4>Healthcare & Wellness</h4>
            <ul>
              <li><a href="#" target="_blank">Pediatric Health Services</a></li>
              <li><a href="#" target="_blank">Mental Health Resources</a></li>
              <li><a href="#" target="_blank">Vaccination Schedule</a></li>
            </ul>
          </div>
          <div class="resource-card">
            <h4>Legal & Guardianship</h4>
            <ul>
              <li><a href="#" target="_blank">Guardian Rights & Duties</a></li>
              <li><a href="#" target="_blank">Documentation Requirements</a></li>
              <li><a href="#" target="_blank">Emancipation Process</a></li>
            </ul>
          </div>
          <div class="resource-card">
            <h4>Financial Management</h4>
            <ul>
              <li><a href="#" target="_blank">Budget Templates</a></li>
              <li><a href="#" target="_blank">Financial Literacy for Youth</a></li>
              <li><a href="#" target="_blank">Account Management Guide</a></li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Toggle section expansion
   */
  toggleSection(sectionId) {
    if (this.expandedSections.has(sectionId)) {
      this.expandedSections.delete(sectionId);
    } else {
      this.expandedSections.add(sectionId);
    }
    this.saveExpandedSections();
    this.updateSectionVisibility();
  }

  /**
   * Update section visibility
   */
  updateSectionVisibility() {
    document.querySelectorAll('.rights-section-content').forEach(el => {
      const sectionId = el.id;
      if (this.expandedSections.has(sectionId)) {
        el.style.display = 'block';
        el.classList.add('expanded');
      } else {
        el.style.display = 'none';
        el.classList.remove('expanded');
      }
    });
  }

  /**
   * Switch to phase
   */
  switchPhase(phaseId) {
    this.currentPhase = phaseId;
    this.render();
  }

  /**
   * Print current phase
   */
  printPhase() {
    window.print();
  }

  /**
   * Render the entire module
   */
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const phases = this.getPhases();
    const phasesData = this.getPhasesData();
    const currentPhaseData = phasesData[this.currentPhase];

    let html = `
      <div class="rights-obligations-module">
        <header class="rights-header">
          <h2>MENA Rights & Tuteur Obligations Guide</h2>
          <p>Age-Specific Rights, Obligations, and Financial Management</p>
          <button class="print-btn" onclick="rightsModule.printPhase()">Print Phase</button>
        </header>

        <div class="phase-tabs">
          <div class="tab-buttons">
    `;

    // Tab buttons
    Object.entries(phases).forEach(([phaseId, phase]) => {
      const activeClass = this.currentPhase === phaseId ? 'active' : '';
      html += `
        <button class="tab-btn ${activeClass}" onclick="rightsModule.switchPhase('${phaseId}')">
          ${phase.label}
        </button>
      `;
    });

    html += `
          </div>

          <div class="phase-content">
            <div class="phase-header">
              <h3>${currentPhaseData.title}</h3>
              <p>${phases[this.currentPhase].description}</p>
            </div>
    `;

    // Expandable sections
    Object.entries(currentPhaseData.sections).forEach(([sectionKey, section]) => {
      const sectionId = `${this.currentPhase}-${sectionKey}`;
      const isExpanded = this.expandedSections.has(sectionId);
      const displayStyle = isExpanded ? 'block' : 'none';

      html += `
        <div class="rights-section">
          <div class="section-header" onclick="rightsModule.toggleSection('${sectionId}')">
            <span class="section-icon">${section.icon}</span>
            <h4>${section.title}</h4>
            <span class="toggle-icon">${isExpanded ? '▼' : '▶'}</span>
          </div>
          <div class="rights-section-content" id="${sectionId}" style="display: ${displayStyle}">
            <ul class="items-list">
      `;

      section.items.forEach(item => {
        html += `
          <li class="item">
            <strong>${item.title}</strong>
            <p>${item.details}</p>
          </li>
        `;
      });

      html += `
            </ul>
          </div>
        </div>
      `;
    });

    // Comparison table
    html += this.getComparisonTable();

    // Phase checklist
    html += this.getPhaseChecklist();

    // Resources
    html += this.getResourcesSection();

    html += `
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.updateSectionVisibility();
  }

  /**
   * Export phase data as JSON
   */
  exportPhaseData() {
    const phasesData = this.getPhasesData();
    const data = {
      exportDate: new Date().toISOString(),
      currentPhase: this.currentPhase,
      expandedSections: Array.from(this.expandedSections),
      data: phasesData[this.currentPhase]
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rights-obligations-${this.currentPhase}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Generate summary for current phase
   */
  getSummary() {
    const phasesData = this.getPhasesData();
    const phase = phasesData[this.currentPhase];

    let summary = `Phase: ${phase.title}\n\n`;

    Object.entries(phase.sections).forEach(([key, section]) => {
      summary += `${section.title}:\n`;
      section.items.forEach(item => {
        summary += `  - ${item.title}: ${item.details}\n`;
      });
      summary += '\n';
    });

    return summary;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RightsObligationsModule;
}
