/**
 * ProcedureModule - Asylum procedure simulator with 18-phase timeline
 * Tracks asylum seekers through entire procedure with offline persistence
 * Uses IndexedDB for persistent storage across sessions
 */

class ProcedureModule {
  constructor() {
    this.dbName = 'CGRADatabase';
    this.storeName = 'procedures';
    this.db = null;
    this.initialized = false;

    // Define all 18 asylum procedure phases
    this.phases = [
      {
        id: 1,
        title: 'Registration',
        description: 'Initial registration with immigration authorities. Biometric data collection, basic information recording.',
        expectedDuration: '48 hours',
        order: 1,
        category: 'intake'
      },
      {
        id: 2,
        title: 'Age Determination Scheduled',
        description: 'Appointment scheduled for age determination if applicant appears to be minor.',
        expectedDuration: '1-2 weeks',
        order: 2,
        category: 'assessment'
      },
      {
        id: 3,
        title: 'Medical Evaluation',
        description: 'Comprehensive medical examination including health screening and documentation.',
        expectedDuration: '2-4 weeks',
        order: 3,
        category: 'assessment'
      },
      {
        id: 4,
        title: 'Psychological Evaluation',
        description: 'Psychological assessment to evaluate trauma, mental health, and vulnerability factors.',
        expectedDuration: '3-6 weeks',
        order: 4,
        category: 'assessment'
      },
      {
        id: 5,
        title: 'Social Evaluation',
        description: 'Assessment of social circumstances, family situation, and support networks.',
        expectedDuration: '2-4 weeks',
        order: 5,
        category: 'assessment'
      },
      {
        id: 6,
        title: 'Age Determination Completed',
        description: 'Age determination process concluded. Results documented in case file.',
        expectedDuration: 'Variable',
        order: 6,
        category: 'assessment'
      },
      {
        id: 7,
        title: 'Vulnerability Assessment',
        description: 'Comprehensive assessment of vulnerabilities including victimization, disabilities, and special needs.',
        expectedDuration: '2-3 weeks',
        order: 7,
        category: 'assessment'
      },
      {
        id: 8,
        title: 'Interview Scheduled',
        description: 'Official notification and scheduling of asylum interview with decision maker.',
        expectedDuration: '1 week',
        order: 8,
        category: 'interview'
      },
      {
        id: 9,
        title: 'Pre-Interview Preparation',
        description: 'Preparation period to gather documents, rehearse responses, consult with legal representative.',
        expectedDuration: '2-4 weeks',
        order: 9,
        category: 'interview'
      },
      {
        id: 10,
        title: 'Personal Interview',
        description: 'Formal asylum interview with immigration officer. Applicant presents persecution claims.',
        expectedDuration: '2-4 hours',
        order: 10,
        category: 'interview'
      },
      {
        id: 11,
        title: 'Audio Recording Available',
        description: 'Audio recording of interview transcribed and made available for review.',
        expectedDuration: '1-2 weeks',
        order: 11,
        category: 'review'
      },
      {
        id: 12,
        title: 'Initial Decision',
        description: 'First instance decision issued by immigration authority on asylum claim.',
        expectedDuration: '4-12 weeks',
        order: 12,
        category: 'decision'
      },
      {
        id: 13,
        title: 'Appeal Deadline',
        description: 'Deadline to file appeal against initial decision notification date.',
        expectedDuration: '2-4 weeks from decision',
        order: 13,
        category: 'appeal'
      },
      {
        id: 14,
        title: 'Appeal Filed',
        description: 'Appeal against initial decision formally submitted to appellate authority.',
        expectedDuration: '1 week',
        order: 14,
        category: 'appeal'
      },
      {
        id: 15,
        title: 'Appeal Hearing',
        description: 'Hearing before appeal board to review decision. Applicant can present additional evidence.',
        expectedDuration: '1-2 hours',
        order: 15,
        category: 'appeal'
      },
      {
        id: 16,
        title: 'Final Decision',
        description: 'Final appellate decision issued. Case concluded at administrative level.',
        expectedDuration: '2-8 weeks',
        order: 16,
        category: 'outcome'
      },
      {
        id: 17,
        title: 'Integration Support',
        description: 'Support services for successful integration including language courses, job placement.',
        expectedDuration: '6-12 months',
        order: 17,
        category: 'integration'
      },
      {
        id: 18,
        title: 'Post-Decision Support',
        description: 'Ongoing support and monitoring post-decision including reintegration or repatriation assistance.',
        expectedDuration: 'Variable',
        order: 18,
        category: 'integration'
      }
    ];

    this.procedures = [];
  }

  /**
   * Initialize IndexedDB connection
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.initialized = true;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
          store.createIndex('caseNumber', 'caseNumber', { unique: true });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  /**
   * Create new procedure case
   */
  createProcedure(caseData) {
    const procedure = {
      id: Date.now(),
      caseNumber: caseData.caseNumber || `CASE-${Date.now()}`,
      applicantName: caseData.applicantName || '',
      applicantDOB: caseData.applicantDOB || '',
      applicationDate: caseData.applicationDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      currentPhase: 1,
      phases: this.phases.map(phase => ({
        ...phase,
        completed: false,
        completedAt: null,
        notes: ''
      })),
      documents: [],
      interviews: [],
      decisions: []
    };

    this.procedures.push(procedure);
    return procedure;
  }

  /**
   * Save procedure to IndexedDB
   */
  async saveProcedure(procedure) {
    if (!this.initialized) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(procedure);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(procedure);
    });
  }

  /**
   * Load procedure from IndexedDB
   */
  async loadProcedure(procedureId) {
    if (!this.initialized) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(procedureId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Load all procedures from IndexedDB
   */
  async loadAllProcedures() {
    if (!this.initialized) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.procedures = request.result;
        resolve(request.result);
      };
    });
  }

  /**
   * Mark phase as completed
   */
  async completePhase(procedureId, phaseId, notes = '') {
    const procedure = await this.loadProcedure(procedureId);
    if (!procedure) throw new Error('Procedure not found');

    const phase = procedure.phases.find(p => p.id === phaseId);
    if (!phase) throw new Error('Phase not found');

    phase.completed = true;
    phase.completedAt = new Date().toISOString();
    phase.notes = notes;
    procedure.updatedAt = new Date().toISOString();

    // Update current phase to next incomplete phase
    const nextIncomplete = procedure.phases.find(p => !p.completed);
    if (nextIncomplete) {
      procedure.currentPhase = nextIncomplete.id;
    } else {
      procedure.currentPhase = 18;
      procedure.status = 'completed';
    }

    await this.saveProcedure(procedure);
    return procedure;
  }

  /**
   * Get phase progress percentage
   */
  getProgress(procedure) {
    if (!procedure || !procedure.phases) return 0;
    const completed = procedure.phases.filter(p => p.completed).length;
    return Math.round((completed / procedure.phases.length) * 100);
  }

  /**
   * Get timeline data for visualization
   */
  getTimeline(procedure) {
    if (!procedure) return [];

    return procedure.phases.map(phase => ({
      id: phase.id,
      title: phase.title,
      description: phase.description,
      order: phase.order,
      completed: phase.completed,
      completedAt: phase.completedAt,
      expectedDuration: phase.expectedDuration,
      category: phase.category,
      notes: phase.notes
    }));
  }

  /**
   * Add document to procedure
   */
  async addDocument(procedureId, document) {
    const procedure = await this.loadProcedure(procedureId);
    if (!procedure) throw new Error('Procedure not found');

    const doc = {
      id: Date.now(),
      name: document.name,
      type: document.type,
      relatedPhases: document.relatedPhases || [],
      uploadedAt: new Date().toISOString(),
      content: document.content || null
    };

    procedure.documents.push(doc);
    procedure.updatedAt = new Date().toISOString();

    await this.saveProcedure(procedure);
    return doc;
  }

  /**
   * Add interview record
   */
  async addInterview(procedureId, interview) {
    const procedure = await this.loadProcedure(procedureId);
    if (!procedure) throw new Error('Procedure not found');

    const record = {
      id: Date.now(),
      type: interview.type,
      date: interview.date,
      interviewer: interview.interviewer || '',
      notes: interview.notes || '',
      recordingAvailable: interview.recordingAvailable || false,
      transcriptionAvailable: interview.transcriptionAvailable || false,
      createdAt: new Date().toISOString()
    };

    procedure.interviews.push(record);
    procedure.updatedAt = new Date().toISOString();

    await this.saveProcedure(procedure);
    return record;
  }

  /**
   * Add decision record
   */
  async addDecision(procedureId, decision) {
    const procedure = await this.loadProcedure(procedureId);
    if (!procedure) throw new Error('Procedure not found');

    const record = {
      id: Date.now(),
      type: decision.type, // 'initial' or 'appeal'
      outcome: decision.outcome, // 'approved', 'rejected', 'deferred'
      date: decision.date,
      reasonCode: decision.reasonCode || '',
      details: decision.details || '',
      appealDeadline: decision.appealDeadline || null,
      createdAt: new Date().toISOString()
    };

    procedure.decisions.push(record);
    procedure.updatedAt = new Date().toISOString();

    // Update status based on decision
    if (decision.type === 'appeal' || procedure.currentPhase === 16) {
      procedure.status = decision.outcome === 'approved' ? 'approved' : 'rejected';
    }

    await this.saveProcedure(procedure);
    return record;
  }

  /**
   * Get procedure summary
   */
  async getSummary(procedureId) {
    const procedure = await this.loadProcedure(procedureId);
    if (!procedure) throw new Error('Procedure not found');

    const progress = this.getProgress(procedure);
    const completedPhases = procedure.phases.filter(p => p.completed).length;
    const currentPhaseObj = procedure.phases.find(p => p.id === procedure.currentPhase);

    return {
      caseNumber: procedure.caseNumber,
      applicantName: procedure.applicantName,
      status: procedure.status,
      currentPhase: currentPhaseObj,
      progress: progress,
      completedPhases: completedPhases,
      totalPhases: procedure.phases.length,
      applicationDate: procedure.applicationDate,
      createdAt: procedure.createdAt,
      updatedAt: procedure.updatedAt,
      documentCount: procedure.documents.length,
      interviewCount: procedure.interviews.length,
      decisionCount: procedure.decisions.length
    };
  }

  /**
   * Delete procedure from IndexedDB
   */
  async deleteProcedure(procedureId) {
    if (!this.initialized) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(procedureId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.procedures = this.procedures.filter(p => p.id !== procedureId);
        resolve();
      };
    });
  }

  /**
   * Export procedure as JSON
   */
  exportProcedure(procedure) {
    return JSON.stringify(procedure, null, 2);
  }

  /**
   * Import procedure from JSON
   */
  async importProcedure(jsonData) {
    const procedure = JSON.parse(jsonData);
    procedure.id = Date.now(); // Generate new ID
    procedure.createdAt = new Date().toISOString();
    await this.saveProcedure(procedure);
    return procedure;
  }

  /**
   * Get statistics for all procedures
   */
  getStatistics() {
    const stats = {
      totalProcedures: this.procedures.length,
      activeProcedures: this.procedures.filter(p => p.status === 'active').length,
      approvedProcedures: this.procedures.filter(p => p.status === 'approved').length,
      rejectedProcedures: this.procedures.filter(p => p.status === 'rejected').length,
      completedProcedures: this.procedures.filter(p => p.status === 'completed').length,
      averageProgress: this.procedures.length > 0
        ? Math.round(this.procedures.reduce((sum, p) => sum + this.getProgress(p), 0) / this.procedures.length)
        : 0,
      totalDocuments: this.procedures.reduce((sum, p) => sum + p.documents.length, 0),
      totalInterviews: this.procedures.reduce((sum, p) => sum + p.interviews.length, 0)
    };
    return stats;
  }

  /**
   * Search procedures by case number or applicant name
   */
  searchProcedures(query) {
    const lowerQuery = query.toLowerCase();
    return this.procedures.filter(p =>
      p.caseNumber.toLowerCase().includes(lowerQuery) ||
      p.applicantName.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Filter procedures by status
   */
  filterByStatus(status) {
    return this.procedures.filter(p => p.status === status);
  }

  /**
   * Get phase by ID
   */
  getPhase(phaseId) {
    return this.phases.find(p => p.id === phaseId);
  }

  /**
   * Get all phases grouped by category
   */
  getPhasesByCategory() {
    const grouped = {};
    this.phases.forEach(phase => {
      if (!grouped[phase.category]) {
        grouped[phase.category] = [];
      }
      grouped[phase.category].push(phase);
    });
    return grouped;
  }

  /**
   * Calculate estimated completion date
   */
  estimateCompletionDate(procedure) {
    // Simple estimation: add expected durations (rough conversion to days)
    const durationMap = {
      '48 hours': 2,
      '1-2 weeks': 10,
      '2-4 weeks': 21,
      '3-6 weeks': 30,
      '1 week': 7,
      '2-3 weeks': 17,
      '4-12 weeks': 56,
      '1-2 hours': 0.5,
      '6-12 months': 270,
      'Variable': 30
    };

    let totalDays = 0;
    procedure.phases.forEach(phase => {
      if (!phase.completed) {
        const duration = this.phases.find(p => p.id === phase.id).expectedDuration;
        totalDays += durationMap[duration] || 30;
      }
    });

    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + totalDays);
    return estimatedDate;
  }
}

// Export for use in browser environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProcedureModule;
}
