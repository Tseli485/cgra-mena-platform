/**
 * Discovery Module
 * Browse cases by type, age, domain; find related cases; suggest training sequences
 */

export class DiscoveryModule {
  constructor(lifecycleData = [], casesData = []) {
    this.lifecycleData = lifecycleData;
    this.casesData = casesData;

    // Cache computed browse data
    this.browseByTypeCache = null;
    this.browseByAgeCache = null;
    this.browseByDomainCache = null;
    this.trainingPathsCache = null;
  }

  /**
   * Get all case types with counts
   * @returns {Array} Type cards: [{ type, count, description, cases }, ...]
   */
  getBrowseByType() {
    if (this.browseByTypeCache) {
      return this.browseByTypeCache;
    }

    const typeMap = new Map();

    // Aggregate cases by type
    this.casesData.forEach((caseItem, idx) => {
      const type = caseItem.type || 'Unspecified';
      if (!typeMap.has(type)) {
        typeMap.set(type, {
          type,
          count: 0,
          description: this._getTypeDescription(type),
          cases: []
        });
      }
      const typeGroup = typeMap.get(type);
      typeGroup.count++;
      typeGroup.cases.push({ id: `cases_${idx}`, title: caseItem.title, age: caseItem.age });
    });

    // Convert to array and sort by count (descending)
    this.browseByTypeCache = Array.from(typeMap.values())
      .sort((a, b) => b.count - a.count);

    return this.browseByTypeCache;
  }

  /**
   * Get cases grouped by age
   * @returns {Array} Age group cards: [{ group, label, min, max, count, cases }, ...]
   */
  getBrowseByAge() {
    if (this.browseByAgeCache) {
      return this.browseByAgeCache;
    }

    const ageGroups = [
      { group: '0-5', label: '0-5 years old', min: 0, max: 5 },
      { group: '5-10', label: '5-10 years old', min: 5, max: 10 },
      { group: '10-20', label: '10-20 years old', min: 10, max: 20 },
      { group: '20+', label: '20+ years old', min: 20, max: Infinity }
    ];

    const result = ageGroups.map(group => {
      const cases = this.casesData
        .map((c, idx) => ({ ...c, id: `cases_${idx}` }))
        .filter(c => {
          const age = c.age || 0;
          return age >= group.min && age < group.max;
        });

      return {
        group: group.group,
        label: group.label,
        min: group.min,
        max: group.max,
        count: cases.length,
        cases: cases.map(c => ({ id: c.id, title: c.title, age: c.age }))
      };
    });

    this.browseByAgeCache = result;
    return result;
  }

  /**
   * Get cases grouped by problem domain
   * @returns {Array} Domain entries: [{ domain, count, description, cases }, ...]
   */
  getBrowseByDomain() {
    if (this.browseByDomainCache) {
      return this.browseByDomainCache;
    }

    const domainMap = new Map();

    // Aggregate cases by domain
    this.casesData.forEach((caseItem, idx) => {
      const domain = caseItem.domain || 'General';
      if (!domainMap.has(domain)) {
        domainMap.set(domain, {
          domain,
          count: 0,
          description: this._getDomainDescription(domain),
          cases: []
        });
      }
      const domainGroup = domainMap.get(domain);
      domainGroup.count++;
      domainGroup.cases.push({
        id: `cases_${idx}`,
        title: caseItem.title,
        type: caseItem.type,
        age: caseItem.age
      });
    });

    // Convert to array and sort by count (descending)
    this.browseByDomainCache = Array.from(domainMap.values())
      .sort((a, b) => b.count - a.count);

    return this.browseByDomainCache;
  }

  /**
   * Find related cases: cases with similar type, domain, or age
   * @param {string} caseId - Case ID (cases_N)
   * @returns {Array} Related cases: [{ id, title, reason, similarity }, ...]
   */
  getRelatedCases(caseId) {
    const idx = parseInt(caseId.split('_')[1]);
    const sourceCase = this.casesData[idx];

    if (!sourceCase) {
      return [];
    }

    const related = [];
    const scores = new Map();

    // Score all other cases
    this.casesData.forEach((caseItem, caseIdx) => {
      if (caseIdx === idx) return; // Skip self

      const caseItemId = `cases_${caseIdx}`;
      let score = 0;
      const reasons = [];

      // Same type (high weight)
      if (caseItem.type === sourceCase.type) {
        score += 3;
        reasons.push('similar case type');
      }

      // Same domain (high weight)
      if (caseItem.domain === sourceCase.domain) {
        score += 3;
        reasons.push('same problem domain');
      }

      // Similar age (medium weight)
      const sourceAge = sourceCase.age || 0;
      const itemAge = caseItem.age || 0;
      const ageDiff = Math.abs(sourceAge - itemAge);
      if (ageDiff <= 5) {
        score += 2;
        reasons.push('similar age group');
      }

      if (score > 0) {
        scores.set(caseItemId, { score, reasons });
      }
    });

    // Build result array
    scores.forEach((value, caseItemId) => {
      const caseIdx = parseInt(caseItemId.split('_')[1]);
      const caseItem = this.casesData[caseIdx];
      related.push({
        id: caseItemId,
        title: caseItem.title,
        reason: value.reasons.join(', '),
        similarity: value.score,
        type: caseItem.type,
        domain: caseItem.domain
      });
    });

    // Sort by similarity score and return top 5
    return related
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }

  /**
   * Get training paths for different roles
   * Suggests sequences of cases for learning
   * @returns {Array} Training paths with roles and case sequences
   */
  getTrainingPaths() {
    if (this.trainingPathsCache) {
      return this.trainingPathsCache;
    }

    const paths = [
      {
        id: 'new-tutor',
        name: 'New Tutor',
        description: 'Foundation cases for learning tutoring basics',
        icon: 'book',
        caseSequence: this._selectTrainingCases(3, ['foundational', 'basic'], null)
      },
      {
        id: 'experienced-tutor',
        name: 'Experienced Tutor',
        description: 'Advanced cases for deepening expertise',
        icon: 'star',
        caseSequence: this._selectTrainingCases(4, ['complex', 'advanced'], null)
      },
      {
        id: 'supervisor',
        name: 'Supervisor Path',
        description: 'Cases covering supervision scenarios',
        icon: 'users',
        caseSequence: this._selectTrainingCases(4, null, 'supervision')
      },
      {
        id: 'specialized-domains',
        name: 'Specialized Domains',
        description: 'Deep dive into specific problem areas',
        icon: 'target',
        caseSequence: this._selectTrainingCases(3, null, null)
      }
    ];

    this.trainingPathsCache = paths;
    return paths;
  }

  /**
   * Select cases for training paths
   * @private
   */
  _selectTrainingCases(count, levels, domain) {
    let candidates = this.casesData.map((c, idx) => ({ ...c, id: `cases_${idx}` }));

    // Filter by level if specified
    if (levels && levels.length > 0) {
      candidates = candidates.filter(c => {
        const caseLevel = c.level || 'basic';
        return levels.includes(caseLevel);
      });
    }

    // Filter by domain if specified
    if (domain) {
      candidates = candidates.filter(c => c.domain === domain);
    }

    // Take top N by relevance (age < 5 years preferred)
    return candidates
      .sort((a, b) => {
        const ageA = a.age || 0;
        const ageB = b.age || 0;
        return ageA - ageB; // Prefer recent cases
      })
      .slice(0, count)
      .map(c => ({
        id: c.id,
        title: c.title,
        domain: c.domain,
        type: c.type,
        age: c.age
      }));
  }

  /**
   * Get "Learn More" recommendations for a specific item
   * Returns related content across lifecycle and cases
   * @param {string} itemId - Item ID
   * @param {string} itemType - 'lifecycle' or 'cases'
   * @returns {Array} Recommendations
   */
  getRecommendations(itemId, itemType) {
    const recommendations = [];

    if (itemType === 'lifecycle') {
      const idx = parseInt(itemId.split('_')[1]);
      const phaseData = this.lifecycleData[idx];

      if (!phaseData) return [];

      // Extract keywords and find related cases
      const keywords = (phaseData.title || '').split(' ').filter(w => w.length > 3);
      const relatedCases = this.casesData
        .map((c, cidx) => ({
          ...c,
          id: `cases_${cidx}`,
          matchScore: this._scoreMatch(c, keywords)
        }))
        .filter(c => c.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 4);

      recommendations.push({
        type: 'cases',
        title: 'Related Case Studies',
        items: relatedCases.map(c => ({
          id: c.id,
          title: c.title,
          reason: 'Demonstrates this lifecycle phase'
        }))
      });
    } else if (itemType === 'cases') {
      const idx = parseInt(itemId.split('_')[1]);
      const caseData = this.casesData[idx];

      if (!caseData) return [];

      // Get related cases
      const related = this.getRelatedCases(itemId);
      if (related.length > 0) {
        recommendations.push({
          type: 'cases',
          title: 'Similar Cases',
          items: related
        });
      }

      // Get training path recommendations
      const relevantPaths = this.getTrainingPaths().filter(path =>
        path.caseSequence.some(c => c.id === itemId)
      );
      if (relevantPaths.length > 0) {
        recommendations.push({
          type: 'training',
          title: 'Recommended Training Paths',
          items: relevantPaths.map(p => ({
            id: p.id,
            title: p.name,
            reason: p.description
          }))
        });
      }
    }

    return recommendations;
  }

  /**
   * Score match between case and keywords
   * @private
   */
  _scoreMatch(caseItem, keywords) {
    let score = 0;
    const caseText = [
      caseItem.title || '',
      caseItem.type || '',
      caseItem.domain || ''
    ].join(' ').toLowerCase();

    keywords.forEach(keyword => {
      if (caseText.includes(keyword.toLowerCase())) {
        score++;
      }
    });

    return score;
  }

  /**
   * Get type description
   * @private
   */
  _getTypeDescription(type) {
    const descriptions = {
      'behavioral': 'Cases involving behavioral or developmental challenges',
      'academic': 'Cases focused on learning and academic performance',
      'family': 'Cases related to family dynamics and relationships',
      'social': 'Cases involving social or peer relationships',
      'emotional': 'Cases addressing emotional or mental health issues',
      'trauma': 'Cases involving trauma or crisis situations'
    };
    return descriptions[type] || `${type} case studies`;
  }

  /**
   * Get domain description
   * @private
   */
  _getDomainDescription(domain) {
    const descriptions = {
      'learning_disabilities': 'Learning disabilities and academic support',
      'behavioral_disorders': 'Behavioral and conduct disorders',
      'emotional_health': 'Emotional health and mental well-being',
      'social_development': 'Social development and relationships',
      'family_dynamics': 'Family dynamics and home environment'
    };
    return descriptions[domain] || domain;
  }

  /**
   * Clear caches when data is updated
   */
  clearCache() {
    this.browseByTypeCache = null;
    this.browseByAgeCache = null;
    this.browseByDomainCache = null;
    this.trainingPathsCache = null;
  }

  /**
   * Get discovery statistics
   */
  getStats() {
    const types = this.getBrowseByType();
    const domains = this.getBrowseByDomain();
    const ages = this.getBrowseByAge();

    return {
      totalCases: this.casesData.length,
      totalTypes: types.length,
      totalDomains: domains.length,
      ageGroups: ages,
      trainingPaths: this.getTrainingPaths().length
    };
  }
}

export default DiscoveryModule;
