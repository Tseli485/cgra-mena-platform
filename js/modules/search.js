/**
 * GlobalSearch Module
 * Full-text search across lifecycle phases and case studies
 * with inverted indexing, relevance ranking, and result caching
 */

export class GlobalSearch {
  constructor(lifecycleData = [], casesData = []) {
    this.lifecycleData = lifecycleData;
    this.casesData = casesData;

    // Inverted index: term -> [{ type, id, field, score }]
    this.index = new Map();

    // Cached results: queryHash -> results
    this.cache = new Map();

    // Build index on construction
    this.buildIndex(lifecycleData, casesData);
  }

  /**
   * Build full-text inverted index from lifecycle and cases data
   * Tokenizes and normalizes all searchable fields
   */
  buildIndex(lifecycleData, casesData) {
    this.index.clear();
    this.cache.clear();

    // Index lifecycle phases
    lifecycleData.forEach((phase, idx) => {
      const phaseId = `lifecycle_${idx}`;

      // Index title (highest weight)
      if (phase.title) {
        this._indexField(phaseId, 'lifecycle', phase.title, 3.0, 'title');
      }

      // Index description
      if (phase.description) {
        this._indexField(phaseId, 'lifecycle', phase.description, 2.0, 'description');
      }

      // Index obligations
      if (phase.obligations && Array.isArray(phase.obligations)) {
        phase.obligations.forEach(obligation => {
          if (typeof obligation === 'string') {
            this._indexField(phaseId, 'lifecycle', obligation, 1.5, 'obligations');
          }
        });
      }
    });

    // Index cases
    casesData.forEach((caseItem, idx) => {
      const caseId = `cases_${idx}`;

      // Index title (highest weight)
      if (caseItem.title) {
        this._indexField(caseId, 'cases', caseItem.title, 3.0, 'title');
      }

      // Index narrative
      if (caseItem.narrative) {
        this._indexField(caseId, 'cases', caseItem.narrative, 2.0, 'narrative');
      }

      // Index lessons learned
      if (caseItem.lessonsLearned && Array.isArray(caseItem.lessonsLearned)) {
        caseItem.lessonsLearned.forEach(lesson => {
          if (typeof lesson === 'string') {
            this._indexField(caseId, 'cases', lesson, 1.5, 'lessonsLearned');
          }
        });
      }

      // Index case type
      if (caseItem.type) {
        this._indexField(caseId, 'cases', caseItem.type, 2.0, 'type');
      }

      // Index domain
      if (caseItem.domain) {
        this._indexField(caseId, 'cases', caseItem.domain, 1.5, 'domain');
      }
    });
  }

  /**
   * Index a text field: tokenize, normalize, add to inverted index
   * @private
   */
  _indexField(id, type, text, weight, field) {
    const tokens = this._tokenize(text);
    tokens.forEach(token => {
      if (!this.index.has(token)) {
        this.index.set(token, []);
      }
      this.index.get(token).push({ type, id, field, weight });
    });
  }

  /**
   * Tokenize text: lowercase, split, remove stop words, deduplicate
   * @private
   */
  _tokenize(text) {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
      'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'can', 'as', 'if', 'this', 'that', 'which',
      'who', 'what', 'when', 'where', 'why', 'how'
    ]);

    return Array.from(new Set(
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(token => token.length > 2 && !stopWords.has(token))
    ));
  }

  /**
   * Search across indexed content
   * @param {string} query - Search query
   * @param {Object} filters - Optional filters: { type, age, domain, module }
   * @returns {Array} Ranked results with scores and snippets
   */
  search(query, filters = {}) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    // Check cache
    const cacheKey = this._getCacheKey(query, filters);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const queryTokens = this._tokenize(query);
    if (queryTokens.length === 0) {
      return [];
    }

    // Collect all matching documents with scores
    const documents = new Map();

    queryTokens.forEach((token) => {
      const matches = this.index.get(token) || [];
      matches.forEach(({ type, id, field, weight }) => {
        // Apply module filter
        if (filters.module && !id.startsWith(filters.module)) {
          return;
        }

        // Apply type filter
        if (filters.type && type === 'cases') {
          const caseData = this.casesData[parseInt(id.split('_')[1])];
          if (caseData && caseData.type !== filters.type) {
            return;
          }
        }

        // Apply domain filter
        if (filters.domain && type === 'cases') {
          const caseData = this.casesData[parseInt(id.split('_')[1])];
          if (caseData && caseData.domain !== filters.domain) {
            return;
          }
        }

        // Accumulate score
        if (!documents.has(id)) {
          documents.set(id, {
            type,
            id,
            score: 0,
            fields: new Map()
          });
        }

        const doc = documents.get(id);
        doc.score += weight;
        if (!doc.fields.has(field)) {
          doc.fields.set(field, []);
        }
        doc.fields.get(field).push(token);
      });
    });

    // Sort by relevance score
    const results = Array.from(documents.values())
      .sort((a, b) => b.score - a.score)
      .map(doc => this._buildResult(doc));

    // Apply age filter if present
    if (filters.age) {
      return this._filterByAge(results, filters.age);
    }

    // Cache and return
    this.cache.set(cacheKey, results);
    return results;
  }

  /**
   * Build result object with snippet extraction
   * @private
   */
  _buildResult(doc) {
    let sourceData;
    let snippet = '';

    if (doc.type === 'lifecycle') {
      const idx = parseInt(doc.id.split('_')[1]);
      sourceData = this.lifecycleData[idx];
      snippet = sourceData.description?.substring(0, 120) || '';
    } else {
      const idx = parseInt(doc.id.split('_')[1]);
      sourceData = this.casesData[idx];
      snippet = sourceData.narrative?.substring(0, 120) || '';
    }

    return {
      type: doc.type,
      id: doc.id,
      title: sourceData.title || '',
      snippet: snippet + (snippet.length > 120 ? '...' : ''),
      score: doc.score,
      rawData: sourceData
    };
  }

  /**
   * Filter results by age group
   * @private
   */
  _filterByAge(results, ageGroup) {
    const ageRanges = {
      '0-5': { min: 0, max: 5 },
      '5-10': { min: 5, max: 10 },
      '10-20': { min: 10, max: 20 },
      '20+': { min: 20, max: Infinity }
    };

    const range = ageRanges[ageGroup];
    if (!range) return results;

    return results.filter(result => {
      if (result.type !== 'cases') return true;
      const caseData = result.rawData;
      const caseAge = caseData.age || 0;
      return caseAge >= range.min && caseAge < range.max;
    });
  }

  /**
   * Get cache key from query and filters
   * @private
   */
  _getCacheKey(query, filters) {
    return JSON.stringify({ query: query.toLowerCase(), filters });
  }

  /**
   * Get related results for a specific item
   * Finds lifecycle phases or cases with similar themes/domains
   * @param {string} id - Item ID (lifecycle_N or cases_N)
   * @param {string} type - Item type ('lifecycle' or 'cases')
   * @returns {Array} Related items
   */
  getRelatedResults(id, type) {
    let sourceData;
    const searchTerms = [];

    if (type === 'lifecycle') {
      const idx = parseInt(id.split('_')[1]);
      sourceData = this.lifecycleData[idx];
      if (sourceData) {
        // Extract key terms from title and description
        searchTerms.push(...this._tokenize(sourceData.title || ''));
        searchTerms.push(...this._tokenize(sourceData.description || ''));
      }
    } else {
      const idx = parseInt(id.split('_')[1]);
      sourceData = this.casesData[idx];
      if (sourceData) {
        // Extract key terms from case
        searchTerms.push(...this._tokenize(sourceData.title || ''));
        searchTerms.push(...this._tokenize(sourceData.domain || ''));
        searchTerms.push(...this._tokenize(sourceData.type || ''));
      }
    }

    // Search with extracted terms
    const query = searchTerms.slice(0, 3).join(' ');
    const results = this.search(query);

    // Filter out the source item and return top 5
    return results
      .filter(r => r.id !== id)
      .slice(0, 5);
  }

  /**
   * Get search statistics (for debugging/analytics)
   */
  getStats() {
    return {
      indexSize: this.index.size,
      cacheSize: this.cache.size,
      lifecycleCount: this.lifecycleData.length,
      casesCount: this.casesData.length,
      totalIndexedTerms: this.index.size
    };
  }

  /**
   * Clear search cache
   */
  clearCache() {
    this.cache.clear();
  }
}

export default GlobalSearch;
