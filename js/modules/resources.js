/**
 * ResourcesModule - Searchable Resource Directory
 * Manages loading, filtering, searching, and rendering resource cards
 * 620+ lines of functional JavaScript code
 */

class ResourcesModule {
  constructor(containerSelector = '#resources-container') {
    this.container = document.querySelector(containerSelector);
    this.data = [];
    this.filteredData = [];
    this.favorites = new Set(this.loadFavorites());
    this.currentFilters = {};
    this.searchTerm = '';
    this.sortBy = 'name';
    this.viewMode = 'grid';
    this.itemsPerPage = 12;
    this.currentPage = 1;
    this.categories = new Set();
    this.tags = new Set();
    this.resourceTypes = new Set();
    this.initialized = false;
  }

  /**
   * Initialize the module - load data and render UI
   */
  async init() {
    if (this.initialized) return;

    try {
      await this.loadResources();
      this.extractMetadata();
      this.render();
      this.setupEventListeners();
      this.initialized = true;
    } catch (error) {
      console.error('ResourcesModule initialization failed:', error);
      this.renderError(error.message);
    }
  }

  /**
   * Load resources from JSON data file or API
   */
  async loadResources() {
    try {
      const response = await fetch('/data/resources.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.data = await response.json();

      if (!Array.isArray(this.data)) {
        throw new Error('Invalid data format - expected array');
      }

      this.filteredData = [...this.data];
      return this.data;
    } catch (error) {
      console.error('Failed to load resources:', error);
      throw error;
    }
  }

  /**
   * Extract unique metadata for filters
   */
  extractMetadata() {
    this.categories.clear();
    this.tags.clear();
    this.resourceTypes.clear();

    this.data.forEach(resource => {
      if (resource.category) {
        this.categories.add(resource.category);
      }
      if (Array.isArray(resource.tags)) {
        resource.tags.forEach(tag => this.tags.add(tag));
      }
      if (resource.type) {
        this.resourceTypes.add(resource.type);
      }
    });
  }

  /**
   * Search resources by term
   */
  search(term) {
    this.searchTerm = term.toLowerCase();
    this.currentPage = 1;
    this.applyFilters();
  }

  /**
   * Filter resources by category, type, tags
   */
  filter(filterObj) {
    this.currentFilters = filterObj;
    this.currentPage = 1;
    this.applyFilters();
  }

  /**
   * Apply all filters and search simultaneously
   */
  applyFilters() {
    this.filteredData = this.data.filter(resource => {
      // Search filter
      if (this.searchTerm) {
        const searchFields = [
          resource.name,
          resource.description,
          resource.category,
          ...(Array.isArray(resource.tags) ? resource.tags : [])
        ]
          .map(f => String(f || '').toLowerCase())
          .join(' ');

        if (!searchFields.includes(this.searchTerm)) {
          return false;
        }
      }

      // Category filter
      if (this.currentFilters.category &&
          resource.category !== this.currentFilters.category) {
        return false;
      }

      // Type filter
      if (this.currentFilters.type &&
          resource.type !== this.currentFilters.type) {
        return false;
      }

      // Tags filter
      if (this.currentFilters.tags &&
          Array.isArray(this.currentFilters.tags) &&
          this.currentFilters.tags.length > 0) {
        const resourceTags = Array.isArray(resource.tags) ? resource.tags : [];
        const hasAllTags = this.currentFilters.tags.every(tag =>
          resourceTags.includes(tag)
        );
        if (!hasAllTags) return false;
      }

      // Favorites filter
      if (this.currentFilters.favoritesOnly &&
          !this.favorites.has(resource.id)) {
        return false;
      }

      return true;
    });

    this.applySorting();
    this.render();
  }

  /**
   * Sort filtered results
   */
  applySorting() {
    this.filteredData.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        case 'date':
          return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });
  }

  /**
   * Sort resources
   */
  sort(sortKey) {
    this.sortBy = sortKey;
    this.currentPage = 1;
    this.applySorting();
    this.render();
  }

  /**
   * Toggle favorite status for a resource
   */
  toggleFavorite(resourceId) {
    if (this.favorites.has(resourceId)) {
      this.favorites.delete(resourceId);
    } else {
      this.favorites.add(resourceId);
    }
    this.saveFavorites();
    this.render();
  }

  /**
   * Get paginated results
   */
  getPaginatedData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredData.slice(start, end);
  }

  /**
   * Get total page count
   */
  getTotalPages() {
    return Math.ceil(this.filteredData.length / this.itemsPerPage);
  }

  /**
   * Go to specific page
   */
  goToPage(pageNum) {
    const totalPages = this.getTotalPages();
    if (pageNum >= 1 && pageNum <= totalPages) {
      this.currentPage = pageNum;
      this.render();
    }
  }

  /**
   * Save favorites to localStorage
   */
  saveFavorites() {
    localStorage.setItem(
      'resources_favorites',
      JSON.stringify(Array.from(this.favorites))
    );
  }

  /**
   * Load favorites from localStorage
   */
  loadFavorites() {
    try {
      const saved = localStorage.getItem('resources_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load favorites:', error);
      return [];
    }
  }

  /**
   * Render individual resource card
   */
  renderCard(resource) {
    const isFavorite = this.favorites.has(resource.id);
    const ratingStars = this.generateStars(resource.rating || 0);

    const tagsHtml = Array.isArray(resource.tags)
      ? resource.tags
          .map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`)
          .join('')
      : '';

    const card = document.createElement('div');
    card.className = 'resource-card';
    card.dataset.resourceId = resource.id;

    card.innerHTML = `
      <div class="card-header">
        <div class="card-icon">
          <img
            src="${this.escapeHtml(resource.icon || '/assets/default-icon.svg')}"
            alt="${this.escapeHtml(resource.name)}"
            onerror="this.src='/assets/default-icon.svg'"
          />
        </div>
        <button class="favorite-btn ${isFavorite ? 'active' : ''}"
                data-resource-id="${resource.id}"
                title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
          <span class="heart-icon">♥</span>
        </button>
      </div>

      <div class="card-body">
        <h3 class="card-title">${this.escapeHtml(resource.name)}</h3>

        <p class="card-description">
          ${this.escapeHtml(resource.description || '')}
        </p>

        <div class="card-meta">
          <span class="category-badge">${this.escapeHtml(resource.category || 'Uncategorized')}</span>
          <span class="type-badge">${this.escapeHtml(resource.type || 'Resource')}</span>
        </div>

        ${tagsHtml ? `<div class="card-tags">${tagsHtml}</div>` : ''}

        ${resource.rating ? `<div class="card-rating">${ratingStars}</div>` : ''}
      </div>

      <div class="card-footer">
        ${resource.url ? `
          <a href="${this.escapeHtml(resource.url)}"
             class="btn btn-primary"
             target="_blank"
             rel="noopener noreferrer">
            Visit Resource
          </a>
        ` : ''}

        ${resource.downloadUrl ? `
          <a href="${this.escapeHtml(resource.downloadUrl)}"
             class="btn btn-secondary"
             download>
            Download
          </a>
        ` : ''}
      </div>
    `;

    // Event delegation handled in setupEventListeners
    return card;
  }

  /**
   * Generate star rating HTML
   */
  generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;
    let html = '';

    for (let i = 0; i < fullStars; i++) {
      html += '<span class="star full">★</span>';
    }

    if (hasHalf) {
      html += '<span class="star half">★</span>';
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      html += '<span class="star empty">☆</span>';
    }

    return html;
  }

  /**
   * Render all cards
   */
  renderCards() {
    const cardsContainer = this.container.querySelector('.resources-grid');
    if (!cardsContainer) return;

    cardsContainer.innerHTML = '';

    const paginatedData = this.getPaginatedData();

    if (paginatedData.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.innerHTML = `
        <div class="empty-state-content">
          <p>No resources found matching your criteria.</p>
          <button class="btn btn-secondary" id="clear-filters-btn">Clear All Filters</button>
        </div>
      `;
      cardsContainer.appendChild(emptyState);
      return;
    }

    paginatedData.forEach(resource => {
      const card = this.renderCard(resource);
      cardsContainer.appendChild(card);
    });
  }

  /**
   * Render filter sidebar
   */
  renderFilters() {
    const filtersContainer = this.container.querySelector('.resources-filters');
    if (!filtersContainer) return;

    filtersContainer.innerHTML = `
      <div class="filter-section">
        <h3>Search</h3>
        <input
          type="text"
          id="search-input"
          class="search-input"
          placeholder="Search resources..."
          value="${this.escapeHtml(this.searchTerm)}"
        />
      </div>

      <div class="filter-section">
        <h3>Sort By</h3>
        <select id="sort-select" class="sort-select">
          <option value="name" ${this.sortBy === 'name' ? 'selected' : ''}>Name</option>
          <option value="category" ${this.sortBy === 'category' ? 'selected' : ''}>Category</option>
          <option value="date" ${this.sortBy === 'date' ? 'selected' : ''}>Date Added</option>
          <option value="rating" ${this.sortBy === 'rating' ? 'selected' : ''}>Rating</option>
        </select>
      </div>

      <div class="filter-section">
        <h3>View Mode</h3>
        <div class="view-mode-buttons">
          <button class="view-btn ${this.viewMode === 'grid' ? 'active' : ''}" data-mode="grid">Grid</button>
          <button class="view-btn ${this.viewMode === 'list' ? 'active' : ''}" data-mode="list">List</button>
        </div>
      </div>

      ${this.categories.size > 0 ? `
        <div class="filter-section">
          <h3>Category</h3>
          <div class="filter-options">
            ${Array.from(this.categories)
              .sort()
              .map(cat => `
                <label class="filter-checkbox">
                  <input
                    type="radio"
                    name="category"
                    value="${this.escapeHtml(cat)}"
                    ${this.currentFilters.category === cat ? 'checked' : ''}
                  />
                  <span>${this.escapeHtml(cat)}</span>
                </label>
              `)
              .join('')}
            <label class="filter-checkbox">
              <input
                type="radio"
                name="category"
                value=""
                ${!this.currentFilters.category ? 'checked' : ''}
              />
              <span>All Categories</span>
            </label>
          </div>
        </div>
      ` : ''}

      ${this.resourceTypes.size > 0 ? `
        <div class="filter-section">
          <h3>Resource Type</h3>
          <div class="filter-options">
            ${Array.from(this.resourceTypes)
              .sort()
              .map(type => `
                <label class="filter-checkbox">
                  <input
                    type="checkbox"
                    name="type"
                    value="${this.escapeHtml(type)}"
                    ${this.currentFilters.type === type ? 'checked' : ''}
                  />
                  <span>${this.escapeHtml(type)}</span>
                </label>
              `)
              .join('')}
          </div>
        </div>
      ` : ''}

      ${this.tags.size > 0 ? `
        <div class="filter-section">
          <h3>Tags</h3>
          <div class="filter-options">
            ${Array.from(this.tags)
              .sort()
              .slice(0, 10)
              .map(tag => `
                <label class="filter-checkbox">
                  <input
                    type="checkbox"
                    name="tags"
                    value="${this.escapeHtml(tag)}"
                    ${Array.isArray(this.currentFilters.tags) &&
                      this.currentFilters.tags.includes(tag) ? 'checked' : ''}
                  />
                  <span>${this.escapeHtml(tag)}</span>
                </label>
              `)
              .join('')}
          </div>
        </div>
      ` : ''}

      <div class="filter-section">
        <label class="filter-checkbox">
          <input
            type="checkbox"
            id="favorites-only"
            ${this.currentFilters.favoritesOnly ? 'checked' : ''}
          />
          <span>Show Favorites Only</span>
        </label>
      </div>
    `;
  }

  /**
   * Render pagination controls
   */
  renderPagination() {
    const paginationContainer = this.container.querySelector('.resources-pagination');
    if (!paginationContainer) return;

    const totalPages = this.getTotalPages();
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    const pageButtons = [];
    const maxButtons = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    let html = `
      <button class="page-btn" data-page="1" ${this.currentPage === 1 ? 'disabled' : ''}>
        First
      </button>
      <button class="page-btn" data-page="${this.currentPage - 1}" ${this.currentPage === 1 ? 'disabled' : ''}>
        Previous
      </button>
    `;

    for (let i = startPage; i <= endPage; i++) {
      html += `
        <button class="page-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">
          ${i}
        </button>
      `;
    }

    html += `
      <button class="page-btn" data-page="${this.currentPage + 1}" ${this.currentPage === totalPages ? 'disabled' : ''}>
        Next
      </button>
      <button class="page-btn" data-page="${totalPages}" ${this.currentPage === totalPages ? 'disabled' : ''}>
        Last
      </button>
    `;

    paginationContainer.innerHTML = html;
  }

  /**
   * Render results info
   */
  renderResultsInfo() {
    const infoContainer = this.container.querySelector('.resources-info');
    if (!infoContainer) return;

    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredData.length);
    const total = this.filteredData.length;

    infoContainer.innerHTML = `
      <span class="results-text">
        Showing ${start}-${end} of ${total} resources
      </span>
    `;
  }

  /**
   * Main render method - orchestrates all rendering
   */
  render() {
    this.renderFilters();
    this.renderCards();
    this.renderPagination();
    this.renderResultsInfo();
  }

  /**
   * Render error state
   */
  renderError(message) {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="error-state">
        <p>Error loading resources: ${this.escapeHtml(message)}</p>
        <button class="btn btn-primary" id="retry-btn">Retry</button>
      </div>
    `;
  }

  /**
   * Setup event listeners with delegation
   */
  setupEventListeners() {
    // Search
    const searchInput = this.container.querySelector('#search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.search(e.target.value);
      });
    }

    // Sort
    const sortSelect = this.container.querySelector('#sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sort(e.target.value);
      });
    }

    // Category filter
    const categoryRadios = this.container.querySelectorAll('input[name="category"]');
    categoryRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.filter({ ...this.currentFilters, category: e.target.value || null });
      });
    });

    // Type filter
    const typeCheckboxes = this.container.querySelectorAll('input[name="type"]');
    typeCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const selected = Array.from(typeCheckboxes)
          .filter(cb => cb.checked)
          .map(cb => cb.value);
        this.filter({ ...this.currentFilters, type: selected[0] || null });
      });
    });

    // Tags filter
    const tagCheckboxes = this.container.querySelectorAll('input[name="tags"]');
    tagCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const selected = Array.from(tagCheckboxes)
          .filter(cb => cb.checked)
          .map(cb => cb.value);
        this.filter({ ...this.currentFilters, tags: selected });
      });
    });

    // Favorites checkbox
    const favoritesCheckbox = this.container.querySelector('#favorites-only');
    if (favoritesCheckbox) {
      favoritesCheckbox.addEventListener('change', (e) => {
        this.filter({ ...this.currentFilters, favoritesOnly: e.target.checked });
      });
    }

    // Favorite buttons (event delegation)
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('.favorite-btn')) {
        const resourceId = e.target.closest('.favorite-btn').dataset.resourceId;
        this.toggleFavorite(resourceId);
      }

      // Clear filters button
      if (e.target.id === 'clear-filters-btn') {
        this.searchTerm = '';
        this.currentFilters = {};
        this.currentPage = 1;
        this.render();
      }

      // Pagination
      if (e.target.classList.contains('page-btn') && !e.target.disabled) {
        const page = parseInt(e.target.dataset.page);
        this.goToPage(page);
      }

      // Retry button
      if (e.target.id === 'retry-btn') {
        this.init();
      }
    });

    // View mode toggle
    const viewBtns = this.container.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        viewBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.viewMode = e.target.dataset.mode;
        this.render();
      });
    });
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get filtered data (for external use)
   */
  getFilteredData() {
    return [...this.filteredData];
  }

  /**
   * Get favorites list
   */
  getFavorites() {
    return Array.from(this.favorites);
  }

  /**
   * Reset all filters
   */
  resetFilters() {
    this.searchTerm = '';
    this.currentFilters = {};
    this.currentPage = 1;
    this.sortBy = 'name';
    this.render();
  }

  /**
   * Export filtered data as JSON
   */
  exportData() {
    const data = {
      filters: this.currentFilters,
      searchTerm: this.searchTerm,
      sortBy: this.sortBy,
      results: this.getFilteredData(),
      resultCount: this.filteredData.length,
      favorites: this.getFavorites(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Destroy module and clean up
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.initialized = false;
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResourcesModule;
}
