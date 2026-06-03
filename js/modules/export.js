/**
 * Data Export Module
 * Handles exporting lifecycle checklists, cases, bookmarks, and user data
 * Supports PDF, JSON, and text formats for GDPR compliance
 */

class ExportModule {
  constructor() {
    this.db = null;
    this.app = null;
  }

  /**
   * Initialize export module with database and app references
   */
  init(db, app) {
    this.db = db;
    this.app = app;
  }

  /**
   * Export a specific lifecycle phase checklist to PDF
   */
  async exportLifecycleChecklist(phaseId) {
    try {
      if (!this.app?.lifecycleModule) {
        console.error('[Export] Lifecycle module not available');
        return false;
      }

      const phase = this.app.lifecycleModule.getPhaseById(phaseId);
      if (!phase) {
        console.error('[Export] Phase not found:', phaseId);
        return false;
      }

      const progress = await this.app.lifecycleModule.loadChecklistProgress(phaseId);
      const pdf = this.generatePDF();

      // Add title and phase info
      pdf.text(`${phase.title}`, 40, 40, { fontSize: 24, fontStyle: 'bold' });
      pdf.text(`Age Group: ${phase.age_group_label || 'N/A'}`, 40, 70, { fontSize: 12 });
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 40, 85, { fontSize: 10 });

      // Add checklist items
      let y = 110;
      if (phase.checklist_items && Array.isArray(phase.checklist_items)) {
        pdf.text('Checklist Items:', 40, y, { fontSize: 14, fontStyle: 'bold' });
        y += 15;

        phase.checklist_items.forEach((item, index) => {
          const isChecked = progress.items && progress.items[index];
          const marker = isChecked ? '[X]' : '[ ]';
          const text = `${marker} ${item}`;

          // Simple text wrapping
          const wrappedText = this.wrapText(text, 100);
          wrappedText.forEach(line => {
            if (y > 750) {
              pdf.addPage();
              y = 40;
            }
            pdf.text(line, 40, y, { fontSize: 11 });
            y += 12;
          });
        });
      }

      // Add footer
      this.addPDFFooter(pdf, `Phase: ${phase.phase_id}`);

      // Generate filename and download
      const filename = `${this.sanitizeFilename(phase.title)}_${this.getDateString()}.pdf`;
      pdf.save(filename);

      console.log('[Export] Lifecycle checklist exported:', filename);
      return true;
    } catch (error) {
      console.error('[Export] Error exporting lifecycle checklist:', error);
      return false;
    }
  }

  /**
   * Export a case as plain text
   */
  async exportCaseAsText(caseId) {
    try {
      const caseData = await this.db.getCase(caseId);
      if (!caseData) {
        console.error('[Export] Case not found:', caseId);
        return false;
      }

      let text = `CASE: ${caseData.title || caseData.case_id}\n`;
      text += `Generated: ${new Date().toLocaleString()}\n`;
      text += '='.repeat(60) + '\n\n';

      // Add case details
      if (caseData.summary) {
        text += `SUMMARY:\n${caseData.summary}\n\n`;
      }

      if (caseData.background) {
        text += `BACKGROUND:\n${caseData.background}\n\n`;
      }

      if (caseData.key_issues) {
        text += `KEY ISSUES:\n`;
        if (Array.isArray(caseData.key_issues)) {
          caseData.key_issues.forEach(issue => {
            text += `- ${issue}\n`;
          });
        } else {
          text += `${caseData.key_issues}\n`;
        }
        text += '\n';
      }

      if (caseData.legal_principles) {
        text += `LEGAL PRINCIPLES:\n`;
        if (Array.isArray(caseData.legal_principles)) {
          caseData.legal_principles.forEach(principle => {
            text += `- ${principle}\n`;
          });
        } else {
          text += `${caseData.legal_principles}\n`;
        }
        text += '\n';
      }

      if (caseData.outcome) {
        text += `OUTCOME:\n${caseData.outcome}\n\n`;
      }

      if (caseData.implications) {
        text += `IMPLICATIONS:\n${caseData.implications}\n\n`;
      }

      if (caseData.case_type) {
        text += `Case Type: ${caseData.case_type}\n`;
      }
      if (caseData.age_group) {
        text += `Age Group: ${caseData.age_group}\n`;
      }
      if (caseData.country) {
        text += `Jurisdiction: ${caseData.country}\n`;
      }

      text += '\n' + '='.repeat(60) + '\n';
      text += `Case ID: ${caseData.case_id}\n`;
      text += `Exported: ${new Date().toISOString()}\n`;

      // Generate filename and download
      const filename = `${this.sanitizeFilename(caseData.title || caseData.case_id)}_${this.getDateString()}.txt`;
      this.downloadFile(text, filename, 'text/plain');

      console.log('[Export] Case exported as text:', filename);
      return true;
    } catch (error) {
      console.error('[Export] Error exporting case as text:', error);
      return false;
    }
  }

  /**
   * Export a case as formatted PDF
   */
  async exportCaseAsPDF(caseId) {
    try {
      const caseData = await this.db.getCase(caseId);
      if (!caseData) {
        console.error('[Export] Case not found:', caseId);
        return false;
      }

      const pdf = this.generatePDF();

      // Title
      pdf.text(`${caseData.title || 'Case ' + caseId}`, 40, 40, {
        fontSize: 18,
        fontStyle: 'bold'
      });

      let y = 65;

      // Summary
      if (caseData.summary) {
        pdf.text('Summary:', 40, y, { fontSize: 12, fontStyle: 'bold' });
        y += 10;
        const summaryLines = this.wrapText(caseData.summary, 130);
        summaryLines.forEach(line => {
          if (y > 750) {
            pdf.addPage();
            y = 40;
          }
          pdf.text(line, 40, y, { fontSize: 10 });
          y += 8;
        });
        y += 5;
      }

      // Background
      if (caseData.background) {
        if (y > 700) {
          pdf.addPage();
          y = 40;
        }
        pdf.text('Background:', 40, y, { fontSize: 12, fontStyle: 'bold' });
        y += 10;
        const bgLines = this.wrapText(caseData.background, 130);
        bgLines.forEach(line => {
          if (y > 750) {
            pdf.addPage();
            y = 40;
          }
          pdf.text(line, 40, y, { fontSize: 10 });
          y += 8;
        });
        y += 5;
      }

      // Key Issues
      if (caseData.key_issues && Array.isArray(caseData.key_issues)) {
        if (y > 700) {
          pdf.addPage();
          y = 40;
        }
        pdf.text('Key Issues:', 40, y, { fontSize: 12, fontStyle: 'bold' });
        y += 10;
        caseData.key_issues.forEach(issue => {
          if (y > 750) {
            pdf.addPage();
            y = 40;
          }
          const issueLines = this.wrapText(`- ${issue}`, 125);
          issueLines.forEach(line => {
            pdf.text(line, 40, y, { fontSize: 10 });
            y += 8;
          });
        });
        y += 5;
      }

      // Outcome
      if (caseData.outcome) {
        if (y > 700) {
          pdf.addPage();
          y = 40;
        }
        pdf.text('Outcome:', 40, y, { fontSize: 12, fontStyle: 'bold' });
        y += 10;
        const outcomeLines = this.wrapText(caseData.outcome, 130);
        outcomeLines.forEach(line => {
          if (y > 750) {
            pdf.addPage();
            y = 40;
          }
          pdf.text(line, 40, y, { fontSize: 10 });
          y += 8;
        });
      }

      // Metadata
      if (y > 720) {
        pdf.addPage();
        y = 40;
      }
      pdf.text('Case Information:', 40, y, { fontSize: 12, fontStyle: 'bold' });
      y += 12;
      if (caseData.case_type) pdf.text(`Type: ${caseData.case_type}`, 40, y += 8, { fontSize: 10 });
      if (caseData.age_group) pdf.text(`Age Group: ${caseData.age_group}`, 40, y += 8, { fontSize: 10 });
      if (caseData.country) pdf.text(`Jurisdiction: ${caseData.country}`, 40, y += 8, { fontSize: 10 });

      // Footer
      this.addPDFFooter(pdf, `Case ID: ${caseData.case_id}`);

      const filename = `${this.sanitizeFilename(caseData.title || caseData.case_id)}_${this.getDateString()}.pdf`;
      pdf.save(filename);

      console.log('[Export] Case exported as PDF:', filename);
      return true;
    } catch (error) {
      console.error('[Export] Error exporting case as PDF:', error);
      return false;
    }
  }

  /**
   * Export all bookmarked cases as JSON
   */
  async exportBookmarks() {
    try {
      const bookmarks = await this.db.getAll('case_bookmarks');
      const userId = localStorage.getItem('cgra_user_id');

      const userBookmarks = bookmarks.filter(b => b.userId === userId);
      const exportData = {
        exportDate: new Date().toISOString(),
        userId: userId,
        bookmarkCount: userBookmarks.length,
        bookmarks: []
      };

      for (const bookmark of userBookmarks) {
        const caseData = await this.db.getCase(bookmark.caseId);
        if (caseData) {
          exportData.bookmarks.push({
            caseId: caseData.case_id,
            title: caseData.title,
            summary: caseData.summary,
            bookmarkedAt: bookmark.timestamp
          });
        }
      }

      const json = JSON.stringify(exportData, null, 2);
      const filename = `bookmarks_${this.getDateString()}.json`;
      this.downloadFile(json, filename, 'application/json');

      console.log('[Export] Bookmarks exported:', filename);
      return true;
    } catch (error) {
      console.error('[Export] Error exporting bookmarks:', error);
      return false;
    }
  }

  /**
   * Export checklist progress across all phases as JSON
   */
  async exportProgress() {
    try {
      const progressData = await this.db.getAll('lifecycle_progress');
      const userId = localStorage.getItem('cgra_user_id');

      const userProgress = progressData.filter(p => p.userId === userId);
      const exportData = {
        exportDate: new Date().toISOString(),
        userId: userId,
        phaseCount: userProgress.length,
        phases: []
      };

      if (this.app?.lifecycleModule) {
        for (const progress of userProgress) {
          const phase = this.app.lifecycleModule.getPhaseById(progress.phaseId);
          if (phase) {
            const checkedCount = Object.values(progress.items).filter(v => v).length;
            const totalCount = phase.checklist_items ? phase.checklist_items.length : 0;

            exportData.phases.push({
              phaseId: progress.phaseId,
              phaseTitle: phase.title,
              ageGroup: phase.age_group_label,
              completionPercentage: totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0,
              checkedItems: checkedCount,
              totalItems: totalCount,
              lastUpdated: progress.timestamp
            });
          }
        }
      }

      const json = JSON.stringify(exportData, null, 2);
      const filename = `progress_${this.getDateString()}.json`;
      this.downloadFile(json, filename, 'application/json');

      console.log('[Export] Progress exported:', filename);
      return true;
    } catch (error) {
      console.error('[Export] Error exporting progress:', error);
      return false;
    }
  }

  /**
   * Export all user data (GDPR compliance)
   */
  async exportAllData() {
    try {
      const userId = localStorage.getItem('cgra_user_id');
      const exportData = {
        exportDate: new Date().toISOString(),
        userId: userId,
        dataExport: true,
        sections: {}
      };

      // Export lifecycle progress
      const progress = await this.db.getAll('lifecycle_progress');
      exportData.sections.lifecycleProgress = progress.filter(p => p.userId === userId);

      // Export bookmarks
      const bookmarks = await this.db.getAll('case_bookmarks');
      exportData.sections.bookmarks = bookmarks.filter(b => b.userId === userId);

      // Export filter preferences
      const preferences = await this.db.getAll('filter_preferences');
      exportData.sections.filterPreferences = preferences.filter(p => p.userId === userId);

      // Export user settings from localStorage
      exportData.sections.settings = {
        userId: userId,
        preferences: {
          theme: localStorage.getItem('theme'),
          language: localStorage.getItem('language')
        }
      };

      const json = JSON.stringify(exportData, null, 2);
      const filename = `cgra_data_export_${this.getDateString()}.json`;
      this.downloadFile(json, filename, 'application/json');

      console.log('[Export] Complete data export:', filename);
      return true;
    } catch (error) {
      console.error('[Export] Error exporting all data:', error);
      return false;
    }
  }

  /**
   * Helper: Generate a new PDF document
   * Note: Requires a PDF library like jsPDF to be loaded
   */
  generatePDF() {
    if (typeof jsPDF === 'undefined') {
      console.warn('[Export] jsPDF library not available, falling back to text export');
      return null;
    }
    return new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
  }

  /**
   * Helper: Add footer to PDF page
   */
  addPDFFooter(pdf, text) {
    if (!pdf) return;

    const pageSize = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const footerY = pageSize - 10;

    pdf.setFontSize(9);
    pdf.text(text, 40, footerY, { fontSize: 9, color: '#999999' });
    pdf.text(`Exported: ${new Date().toLocaleDateString()}`, pageWidth - 40, footerY, {
      fontSize: 9,
      color: '#999999',
      align: 'right'
    });
  }

  /**
   * Helper: Wrap text to fit within specified width
   */
  wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine.length > 0 ? ' ' : '') + word;
      // Rough estimate: ~2 chars per mm at font size 11
      if (testLine.length > maxWidth / 5) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
  }

  /**
   * Helper: Download file to user's device
   */
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Helper: Sanitize filename
   */
  sanitizeFilename(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 50);
  }

  /**
   * Helper: Get date string for filenames (YYYY-MM-DD)
   */
  getDateString() {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }
}

// Global export module instance
let exportModule = null;

// Initialize export module when app is ready
window.addEventListener('DOMContentLoaded', () => {
  exportModule = new ExportModule();
});
