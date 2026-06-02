/**
 * SupportModule - Comprehensive support system with FAQ, contact form, and ticket management
 * Provides user support functionality for the CGRA PWA
 */

class SupportModule {
  constructor() {
    this.faqs = this.initializeFAQs();
    this.contactForm = null;
    this.supportContainer = null;
    this.ticketSystem = new TicketSystem();
    this.searchIndex = this.buildSearchIndex();
    this.isInitialized = false;
  }

  /**
   * Initialize all 25+ FAQ pairs with comprehensive coverage
   */
  initializeFAQs() {
    return [
      {
        id: 'faq-001',
        category: 'Getting Started',
        question: 'How do I create my first project in CGRA?',
        answer: 'To create your first project, click the "New Project" button on the dashboard. Enter a project name, select a template if desired, and click "Create". Your project will be initialized with default settings and ready for customization.',
        keywords: ['project', 'create', 'new', 'start'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-002',
        category: 'Getting Started',
        question: 'What are the system requirements for CGRA?',
        answer: 'CGRA is a Progressive Web App (PWA) that works on any modern browser including Chrome 90+, Firefox 88+, Safari 14+, and Edge 90+. You need at least 2GB RAM and a stable internet connection for optimal performance.',
        keywords: ['requirements', 'system', 'browser', 'compatibility'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-003',
        category: 'Getting Started',
        question: 'Can I use CGRA offline?',
        answer: 'Yes! CGRA is a Progressive Web App with offline support. Once loaded, you can work offline and your changes will sync automatically when you reconnect to the internet. Install CGRA to your home screen for offline access.',
        keywords: ['offline', 'sync', 'connection', 'internet'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-004',
        category: 'Getting Started',
        question: 'How do I install CGRA as an app?',
        answer: 'To install CGRA: (1) Open CGRA in your browser. (2) Click the install icon in the address bar (or menu). (3) Click "Install" in the popup. CGRA will now appear on your home screen or app drawer for quick access.',
        keywords: ['install', 'app', 'home screen', 'shortcut'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-005',
        category: 'Account & Security',
        question: 'How do I reset my password?',
        answer: 'Click "Forgot Password" on the login screen. Enter your email address and we\'ll send you a password reset link. Check your email inbox and click the link to create a new password. This link expires in 24 hours for security.',
        keywords: ['password', 'reset', 'forgot', 'security'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-006',
        category: 'Account & Security',
        question: 'Is my data encrypted?',
        answer: 'Yes, all your data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. We use industry-standard security protocols and regular security audits to protect your information.',
        keywords: ['encryption', 'security', 'data', 'protection'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-007',
        category: 'Account & Security',
        question: 'Can I enable two-factor authentication?',
        answer: 'Yes! Go to Account Settings > Security > Two-Factor Authentication. You can choose between SMS, authenticator apps (Google Authenticator, Authy), or hardware security keys. We recommend using authenticator apps for better security.',
        keywords: ['2fa', 'two-factor', 'authentication', 'security'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-008',
        category: 'Account & Security',
        question: 'How do I delete my account?',
        answer: 'Go to Account Settings > Account Management > Delete Account. Enter your password for confirmation. Your account and associated data will be permanently deleted within 30 days. This action cannot be undone.',
        keywords: ['delete', 'account', 'remove', 'permanent'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-009',
        category: 'Projects & Collaboration',
        question: 'How do I share my project with team members?',
        answer: 'Open your project and click "Share". Enter team members\' email addresses and select their permission level (Viewer, Editor, Admin). They\'ll receive an email invitation and can start collaborating immediately once they accept.',
        keywords: ['share', 'collaboration', 'team', 'invite'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-010',
        category: 'Projects & Collaboration',
        question: 'What are the different permission levels?',
        answer: 'CGRA has three permission levels: Viewer (read-only access), Editor (can modify content and assets), and Admin (full control including sharing and deletion). Project owners are always admins.',
        keywords: ['permissions', 'roles', 'access', 'levels'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-011',
        category: 'Projects & Collaboration',
        question: 'Can I work on a project simultaneously with team members?',
        answer: 'Yes! CGRA supports real-time collaboration. Multiple team members can work on the same project simultaneously. You\'ll see live cursors, instant updates, and a collaboration log of all changes made.',
        keywords: ['realtime', 'collaboration', 'simultaneous', 'live'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-012',
        category: 'Projects & Collaboration',
        question: 'How do I revert to a previous version of my project?',
        answer: 'Click "History" in your project menu to view all saved versions. Select any version and click "Restore". The project will revert to that state. Previous versions are kept for 90 days (extended with premium).',
        keywords: ['version', 'history', 'restore', 'undo'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-013',
        category: 'Features & Tools',
        question: 'What file formats can I import into CGRA?',
        answer: 'CGRA supports importing: images (JPG, PNG, GIF, SVG, WebP), videos (MP4, WebM, MOV), audio (MP3, WAV, OGG), documents (PDF, DOCX), and code files (JS, CSS, HTML, JSON, XML).',
        keywords: ['import', 'format', 'file', 'support'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-014',
        category: 'Features & Tools',
        question: 'Can I export my project?',
        answer: 'Yes! Click "Export" in the project menu. Choose your format: ZIP (all files), PDF (for documents), HTML (web-ready), or individual asset exports. Export size depends on content.',
        keywords: ['export', 'download', 'format', 'save'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-015',
        category: 'Features & Tools',
        question: 'What AI features does CGRA include?',
        answer: 'CGRA integrates AI for: content suggestions, automated tagging, image enhancement, code analysis, and smart search. AI features require opt-in and are available on paid plans. Your data is never used for model training.',
        keywords: ['ai', 'artificial intelligence', 'automation', 'features'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-016',
        category: 'Features & Tools',
        question: 'How do I use the search functionality?',
        answer: 'Use the search bar at the top of CGRA to find projects, files, or content. Press "/" for keyboard access. Search supports full-text search, filters by type/date, and saved search queries for frequently used filters.',
        keywords: ['search', 'find', 'query', 'filter'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-017',
        category: 'Performance & Troubleshooting',
        question: 'Why is CGRA running slow?',
        answer: 'Check: (1) Internet speed, (2) Browser cache (clear if needed), (3) Open tabs/applications, (4) Project size. For large projects (1GB+), consider splitting into multiple smaller projects for better performance.',
        keywords: ['slow', 'performance', 'speed', 'lag'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-018',
        category: 'Performance & Troubleshooting',
        question: 'What should I do if CGRA crashes or freezes?',
        answer: 'First, refresh your browser (F5 or Cmd+R). If it persists: (1) Clear browser cache, (2) Try a different browser, (3) Check our status page for outages, (4) Contact support with your browser console log.',
        keywords: ['crash', 'freeze', 'error', 'bug'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-019',
        category: 'Performance & Troubleshooting',
        question: 'Why aren\'t my changes saving?',
        answer: 'Check your internet connection first. CGRA auto-saves every 30 seconds. If still not saving: (1) Refresh the page, (2) Check if you have Editor permissions, (3) Try a different browser, (4) Check available storage space.',
        keywords: ['save', 'sync', 'changes', 'data loss'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-020',
        category: 'Billing & Plans',
        question: 'What\'s included in the free plan?',
        answer: 'Free plan includes: up to 3 active projects, 10GB storage, basic features, community support, and offline access. Premium features like AI assistance, advanced collaboration, and unlimited projects require a paid subscription.',
        keywords: ['free', 'plan', 'pricing', 'features'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-021',
        category: 'Billing & Plans',
        question: 'How do I upgrade to a paid plan?',
        answer: 'Go to Settings > Billing > Plans. Select your desired plan and click "Upgrade". Choose annual billing for 20% savings. You can cancel anytime with no penalties. Unused time will be credited.',
        keywords: ['upgrade', 'premium', 'paid', 'subscription'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-022',
        category: 'Billing & Plans',
        question: 'Can I cancel my subscription anytime?',
        answer: 'Yes! You can cancel anytime from Settings > Billing > Subscriptions. Click "Cancel Subscription". You\'ll retain access until the billing period ends. No early termination fees.',
        keywords: ['cancel', 'subscription', 'billing', 'refund'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-023',
        category: 'API & Integration',
        question: 'Does CGRA have an API?',
        answer: 'Yes! CGRA provides a REST API for developers. Visit developer.cgra.app for documentation. API access requires authentication via API keys (available on paid plans). Rate limits apply based on your plan tier.',
        keywords: ['api', 'developer', 'integration', 'rest'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-024',
        category: 'API & Integration',
        question: 'Can I integrate CGRA with other tools?',
        answer: 'CGRA integrates with: Slack, Discord, GitHub, Google Drive, Dropbox, and Zapier. Go to Settings > Integrations to authorize and configure integrations. Custom integrations are available via our API.',
        keywords: ['integration', 'slack', 'github', 'api'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-025',
        category: 'Getting Help',
        question: 'How do I contact support?',
        answer: 'You can reach support via: (1) In-app chat (click help icon), (2) Email: support@cgra.app, (3) Phone: +1-800-CGRA-001 (paid plans), (4) Community forum at community.cgra.app. Average response time is 2-4 hours.',
        keywords: ['support', 'contact', 'help', 'email'],
        helpful: 0,
        views: 0
      },
      {
        id: 'faq-026',
        category: 'Getting Help',
        question: 'Is there a knowledge base or documentation?',
        answer: 'Yes! Visit docs.cgra.app for comprehensive documentation, video tutorials, and guides. Topics include getting started, advanced features, API documentation, and troubleshooting. Content is regularly updated.',
        keywords: ['documentation', 'docs', 'guide', 'tutorial'],
        helpful: 0,
        views: 0
      }
    ];
  }

  /**
   * Build search index for fast FAQ lookup
   */
  buildSearchIndex() {
    const index = {};
    this.faqs.forEach(faq => {
      faq.keywords.forEach(keyword => {
        if (!index[keyword]) {
          index[keyword] = [];
        }
        index[keyword].push(faq.id);
      });
    });
    return index;
  }

  /**
   * Initialize support UI
   */
  init() {
    if (this.isInitialized) return;

    this.createSupportContainer();
    this.renderFAQSection();
    this.renderContactForm();
    this.attachEventListeners();
    this.isInitialized = true;
  }

  /**
   * Create main support container
   */
  createSupportContainer() {
    this.supportContainer = document.createElement('div');
    this.supportContainer.id = 'support-module';
    this.supportContainer.className = 'support-container';

    const headerHTML = `
      <div class="support-header">
        <h1>Support & Help Center</h1>
        <p>Find answers quickly or contact our team</p>
      </div>
    `;

    this.supportContainer.innerHTML = headerHTML;

    const mainContent = document.createElement('div');
    mainContent.className = 'support-content';
    mainContent.id = 'support-content';

    this.supportContainer.appendChild(mainContent);

    const targetElement = document.getElementById('app') || document.body;
    targetElement.appendChild(this.supportContainer);
  }

  /**
   * Render FAQ section with search and filtering
   */
  renderFAQSection() {
    const contentArea = document.getElementById('support-content');

    const faqSection = document.createElement('div');
    faqSection.className = 'faq-section';

    const searchHTML = `
      <div class="faq-search-bar">
        <input
          type="text"
          id="faq-search"
          class="faq-search-input"
          placeholder="Search FAQs..."
          aria-label="Search frequently asked questions"
        >
        <span class="search-icon">🔍</span>
      </div>

      <div class="faq-categories">
        <button class="category-btn active" data-category="all">All</button>
        <button class="category-btn" data-category="Getting Started">Getting Started</button>
        <button class="category-btn" data-category="Account & Security">Security</button>
        <button class="category-btn" data-category="Projects & Collaboration">Collaboration</button>
        <button class="category-btn" data-category="Features & Tools">Features</button>
        <button class="category-btn" data-category="Performance & Troubleshooting">Troubleshooting</button>
        <button class="category-btn" data-category="Billing & Plans">Billing</button>
        <button class="category-btn" data-category="API & Integration">API</button>
        <button class="category-btn" data-category="Getting Help">Help</button>
      </div>

      <div class="faq-list" id="faq-list"></div>
    `;

    faqSection.innerHTML = searchHTML;
    contentArea.appendChild(faqSection);

    this.renderFAQItems();
  }

  /**
   * Render individual FAQ items
   */
  renderFAQItems() {
    const faqList = document.getElementById('faq-list');
    faqList.innerHTML = '';

    this.faqs.forEach(faq => {
      const faqItem = document.createElement('div');
      faqItem.className = 'faq-item';
      faqItem.dataset.category = faq.category;
      faqItem.dataset.id = faq.id;

      faqItem.innerHTML = `
        <div class="faq-question" role="button" tabindex="0" aria-expanded="false">
          <h3>${this.escapeHtml(faq.question)}</h3>
          <span class="faq-toggle">+</span>
        </div>
        <div class="faq-answer" style="display: none;">
          <p>${this.escapeHtml(faq.answer)}</p>
          <div class="faq-actions">
            <button class="helpful-btn" data-helpful="yes">👍 Helpful (${faq.helpful})</button>
            <button class="helpful-btn" data-helpful="no">👎 Not Helpful</button>
          </div>
        </div>
      `;

      faqList.appendChild(faqItem);
    });
  }

  /**
   * Render contact form
   */
  renderContactForm() {
    const contentArea = document.getElementById('support-content');

    const formSection = document.createElement('div');
    formSection.className = 'contact-form-section';

    const formHTML = `
      <div class="contact-form-container">
        <h2>Can't find what you're looking for?</h2>
        <p>Get in touch with our support team</p>

        <form id="support-contact-form" class="support-form">
          <div class="form-group">
            <label for="contact-name">Name</label>
            <input
              type="text"
              id="contact-name"
              name="name"
              required
              aria-label="Your name"
            >
          </div>

          <div class="form-group">
            <label for="contact-email">Email</label>
            <input
              type="email"
              id="contact-email"
              name="email"
              required
              aria-label="Your email address"
            >
          </div>

          <div class="form-group">
            <label for="contact-subject">Subject</label>
            <select id="contact-subject" name="subject" required>
              <option value="">Select a category...</option>
              <option value="bug">Report a Bug</option>
              <option value="feature">Feature Request</option>
              <option value="billing">Billing Question</option>
              <option value="technical">Technical Support</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label for="contact-message">Message</label>
            <textarea
              id="contact-message"
              name="message"
              rows="5"
              required
              placeholder="Describe your issue or question..."
              aria-label="Your message"
            ></textarea>
          </div>

          <div class="form-group checkbox">
            <input
              type="checkbox"
              id="contact-subscribe"
              name="subscribe"
            >
            <label for="contact-subscribe">Subscribe to support updates</label>
          </div>

          <button type="submit" class="submit-btn">Send Message</button>
        </form>

        <div id="form-status" class="form-status" style="display: none;"></div>
      </div>
    `;

    formSection.innerHTML = formHTML;
    contentArea.appendChild(formSection);

    this.contactForm = document.getElementById('support-contact-form');
  }

  /**
   * Attach event listeners to interactive elements
   */
  attachEventListeners() {
    // FAQ search
    const searchInput = document.getElementById('faq-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.filterFAQs(e.target.value));
    }

    // Category filters
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.filterByCategory(e.target.dataset.category, categoryBtns));
    });

    // FAQ item toggles
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
      question.addEventListener('click', (e) => this.toggleFAQItem(e.currentTarget));
      question.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleFAQItem(e.currentTarget);
        }
      });
    });

    // Helpful buttons
    const helpfulBtns = document.querySelectorAll('.helpful-btn');
    helpfulBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleHelpfulClick(e));
    });

    // Contact form submission
    if (this.contactForm) {
      this.contactForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }
  }

  /**
   * Filter FAQs by search query
   */
  filterFAQs(query) {
    const faqItems = document.querySelectorAll('.faq-item');
    const searchTerm = query.toLowerCase();

    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question h3').textContent.toLowerCase();
      const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();

      const matches = question.includes(searchTerm) || answer.includes(searchTerm);
      item.style.display = matches ? 'block' : 'none';
    });
  }

  /**
   * Filter FAQs by category
   */
  filterByCategory(category, buttons) {
    buttons.forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      if (category === 'all') {
        item.style.display = 'block';
      } else {
        item.style.display = item.dataset.category === category ? 'block' : 'none';
      }
    });
  }

  /**
   * Toggle FAQ item open/close
   */
  toggleFAQItem(questionElement) {
    const answerElement = questionElement.nextElementSibling;
    const isOpen = answerElement.style.display !== 'none';

    // Close other open FAQs (optional: accordion behavior)
    const allAnswers = document.querySelectorAll('.faq-answer');
    allAnswers.forEach(answer => answer.style.display = 'none');
    const allQuestions = document.querySelectorAll('.faq-question');
    allQuestions.forEach(q => {
      q.setAttribute('aria-expanded', 'false');
      q.querySelector('.faq-toggle').textContent = '+';
    });

    // Open current FAQ
    answerElement.style.display = 'block';
    questionElement.setAttribute('aria-expanded', 'true');
    questionElement.querySelector('.faq-toggle').textContent = '−';
  }

  /**
   * Handle helpful vote
   */
  handleHelpfulClick(e) {
    const isHelpful = e.currentTarget.dataset.helpful === 'yes';
    const faqItem = e.currentTarget.closest('.faq-item');
    const faqId = faqItem.dataset.id;

    const faq = this.faqs.find(f => f.id === faqId);
    if (faq) {
      if (isHelpful) {
        faq.helpful++;
      }
      faq.views++;
    }

    e.currentTarget.disabled = true;
    e.currentTarget.style.opacity = '0.6';

    this.trackAnalytics('faq_helpful', {
      faq_id: faqId,
      helpful: isHelpful
    });
  }

  /**
   * Handle contact form submission
   */
  handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this.contactForm);
    const ticket = this.ticketSystem.createTicket({
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
      subscribe: formData.get('subscribe') === 'on'
    });

    const statusDiv = document.getElementById('form-status');
    statusDiv.className = 'form-status success';
    statusDiv.textContent = `Thank you! Your ticket #${ticket.id} has been created. We'll respond within 24 hours.`;
    statusDiv.style.display = 'block';

    this.contactForm.reset();

    this.trackAnalytics('support_ticket_created', {
      ticket_id: ticket.id,
      subject: formData.get('subject')
    });
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
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
   * Track analytics events
   */
  trackAnalytics(event, data) {
    if (window.gtag) {
      window.gtag('event', event, data);
    }
    console.log('[Analytics]', event, data);
  }

  /**
   * Get FAQ by ID
   */
  getFAQById(id) {
    return this.faqs.find(faq => faq.id === id);
  }

  /**
   * Search FAQs by keyword
   */
  searchFAQs(keyword) {
    const lowercaseKeyword = keyword.toLowerCase();
    return this.faqs.filter(faq =>
      faq.question.toLowerCase().includes(lowercaseKeyword) ||
      faq.answer.toLowerCase().includes(lowercaseKeyword) ||
      faq.keywords.some(k => k.includes(lowercaseKeyword))
    );
  }

  /**
   * Get FAQs by category
   */
  getFAQsByCategory(category) {
    return this.faqs.filter(faq => faq.category === category);
  }

  /**
   * Get most helpful FAQs
   */
  getMostHelpfulFAQs(limit = 5) {
    return [...this.faqs]
      .sort((a, b) => (b.helpful / (b.views || 1)) - (a.helpful / (a.views || 1)))
      .slice(0, limit);
  }

  /**
   * Destroy support module
   */
  destroy() {
    if (this.supportContainer) {
      this.supportContainer.remove();
    }
    this.isInitialized = false;
  }
}

/**
 * TicketSystem - Manages support tickets
 */
class TicketSystem {
  constructor() {
    this.tickets = [];
    this.ticketCounter = 1000;
  }

  /**
   * Create a new support ticket
   */
  createTicket(data) {
    const ticket = {
      id: this.generateTicketId(),
      ...data,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      responses: []
    };

    this.tickets.push(ticket);
    return ticket;
  }

  /**
   * Generate unique ticket ID
   */
  generateTicketId() {
    return `TKT-${++this.ticketCounter}`;
  }

  /**
   * Get ticket by ID
   */
  getTicket(id) {
    return this.tickets.find(t => t.id === id);
  }

  /**
   * Update ticket status
   */
  updateTicketStatus(id, status) {
    const ticket = this.getTicket(id);
    if (ticket) {
      ticket.status = status;
      ticket.updatedAt = new Date();
    }
    return ticket;
  }

  /**
   * Add response to ticket
   */
  addResponse(ticketId, response) {
    const ticket = this.getTicket(ticketId);
    if (ticket) {
      ticket.responses.push({
        id: `RES-${Date.now()}`,
        message: response,
        timestamp: new Date()
      });
    }
    return ticket;
  }

  /**
   * Get all open tickets
   */
  getOpenTickets() {
    return this.tickets.filter(t => t.status === 'open');
  }

  /**
   * Close ticket
   */
  closeTicket(id) {
    return this.updateTicketStatus(id, 'closed');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SupportModule, TicketSystem };
}

// Export for module systems
if (typeof window !== 'undefined') {
  window.SupportModule = SupportModule;
  window.TicketSystem = TicketSystem;
}
