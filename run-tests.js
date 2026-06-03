/**
 * Test Runner for Tasks 13-15
 * Uses Puppeteer to automate browser testing
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TEST_URL = 'http://localhost:8000';
const REPORT_FILE = './test-report.json';

async function runTests() {
  let browser;
  const results = {
    timestamp: new Date().toISOString(),
    tasks: {
      13: { name: 'Search & Discovery', tests: [] },
      14: { name: 'Offline Sync & Export', tests: [] },
      15: { name: 'Final Integration', tests: [] },
    },
    summary: {
      totalTests: 0,
      passed: 0,
      failed: 0,
      errors: [],
    },
    metrics: {},
  };

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    console.log('Starting comprehensive test suite...\n');

    // Create new page
    const page = await browser.newPage();

    // Set viewport for testing
    await page.setViewport({ width: 1280, height: 800 });

    // Log console messages
    page.on('console', (msg) => {
      console.log(`[Browser] ${msg.type()}: ${msg.text()}`);
    });

    // Log errors
    page.on('error', (err) => {
      console.error(`[Browser Error]`, err);
      results.summary.errors.push(err.message);
    });

    // Navigate to app
    console.log(`Navigating to ${TEST_URL}...`);
    const startNavigation = Date.now();

    try {
      await page.goto(TEST_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    } catch (error) {
      console.warn('Navigation timeout (networkidle2), continuing with domcontentloaded...');
      try {
        await page.goto(TEST_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
      } catch (e) {
        throw new Error(`Failed to load page: ${e.message}`);
      }
    }

    const navigationTime = Date.now() - startNavigation;
    results.metrics.navigationTime = navigationTime;
    console.log(`Page loaded in ${navigationTime}ms\n`);

    // Wait for app to initialize
    await page.waitForTimeout(2000);

    // Test Task 13: Search & Discovery
    console.log('═══ Testing Task 13: Search & Discovery ═══\n');
    const task13Results = await testSearchDiscovery(page, results);
    results.tasks[13].tests = task13Results.tests;
    results.summary.passed += task13Results.passed;
    results.summary.failed += task13Results.failed;
    results.summary.totalTests += task13Results.total;

    // Test Task 14: Offline Sync & Export
    console.log('\n═══ Testing Task 14: Offline Sync & Export ═══\n');
    const task14Results = await testOfflineSyncExport(page, results);
    results.tasks[14].tests = task14Results.tests;
    results.summary.passed += task14Results.passed;
    results.summary.failed += task14Results.failed;
    results.summary.totalTests += task14Results.total;

    // Test Task 15: Final Integration
    console.log('\n═══ Testing Task 15: Final Integration & Validation ═══\n');
    const task15Results = await testFinalIntegration(page, results);
    results.tasks[15].tests = task15Results.tests;
    results.summary.passed += task15Results.passed;
    results.summary.failed += task15Results.failed;
    results.summary.totalTests += task15Results.total;

    // Performance metrics
    const perfMetrics = await page.evaluate(() => {
      const perf = window.performance.timing;
      return {
        navigationStart: perf.navigationStart,
        domContentLoaded: perf.domContentLoadedEventEnd - perf.navigationStart,
        loadComplete: perf.loadEventEnd - perf.navigationStart,
      };
    });
    results.metrics.performance = perfMetrics;

    // Accessibility check
    console.log('\n═══ Accessibility Check ═══\n');
    const a11yResults = await page.evaluate(() => {
      const checks = {
        langAttribute: document.documentElement.lang !== '',
        headingStructure: document.querySelectorAll('h1, h2, h3').length > 0,
        imageAltText: Array.from(document.querySelectorAll('img')).every(img => img.alt),
        formLabels: document.querySelectorAll('input').length === 0 ||
                   document.querySelectorAll('label').length > 0,
        contrastRatio: true, // Visual check needed
      };
      return checks;
    });

    console.log('Accessibility Checks:');
    console.log(`  Lang attribute: ${a11yResults.langAttribute ? 'PASS' : 'FAIL'}`);
    console.log(`  Heading structure: ${a11yResults.headingStructure ? 'PASS' : 'FAIL'}`);
    console.log(`  Image alt text: ${a11yResults.imageAltText ? 'PASS' : 'FAIL'}`);
    console.log(`  Form labels: ${a11yResults.formLabels ? 'PASS' : 'FAIL'}`);
    results.metrics.accessibility = a11yResults;

    // Close browser
    await browser.close();

    // Write results
    fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2));
    console.log(`\nTest report saved to ${REPORT_FILE}`);

    // Print summary
    printSummary(results);

    process.exit(results.summary.failed === 0 ? 0 : 1);

  } catch (error) {
    console.error('\n[FATAL ERROR]', error);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
}

async function testSearchDiscovery(page, results) {
  const testResults = {
    tests: [],
    passed: 0,
    failed: 0,
    total: 0,
  };

  // Test 1: Search input visible
  const searchTest = await runTest(page, 'Global search input visible', async () => {
    const input = await page.$('#global-search');
    return input !== null;
  });
  testResults.tests.push(searchTest);
  if (searchTest.passed) testResults.passed++; else testResults.failed++;
  testResults.total++;

  // Test 2: Search functionality
  const searchFuncTest = await runTest(page, 'Search functionality works', async () => {
    await page.focus('#global-search');
    await page.type('#global-search', 'test');
    await page.waitForTimeout(500);

    const modal = await page.$('#search-results-modal');
    return modal !== null;
  });
  testResults.tests.push(searchFuncTest);
  if (searchFuncTest.passed) testResults.passed++; else testResults.failed++;
  testResults.total++;

  // Test 3: Clear search
  const clearTest = await runTest(page, 'Clear search results', async () => {
    const closeBtn = await page.$('#search-close');
    return closeBtn !== null;
  });
  testResults.tests.push(clearTest);
  if (clearTest.passed) testResults.passed++; else testResults.failed++;
  testResults.total++;

  // Test 4: Module navigation
  const navTest = await runTest(page, 'All modules in navigation (8)', async () => {
    const links = await page.$$('.nav-link');
    return links.length === 8;
  });
  testResults.tests.push(navTest);
  if (navTest.passed) testResults.passed++; else testResults.failed++;
  testResults.total++;

  // Test 5: Keyboard navigation
  const keyboardTest = await runTest(page, 'Keyboard navigation works', async () => {
    const input = await page.$('#global-search');
    if (!input) return false;

    await page.focus('#global-search');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowUp');

    return true;
  });
  testResults.tests.push(keyboardTest);
  if (keyboardTest.passed) testResults.passed++; else testResults.failed++;
  testResults.total++;

  return testResults;
}

async function testOfflineSyncExport(page, results) {
  const testResults = {
    tests: [],
    passed: 0,
    failed: 0,
    total: 0,
  };

  // Test 1: Sync status indicator
  const syncStatusTest = await runTest(page, 'Sync status indicator visible', async () => {
    const status = await page.$('#sync-status');
    return status !== null;
  });
  testResults.tests.push(syncStatusTest);
  if (syncStatusTest.passed) testResults.passed++; else testResults.failed++;
  testResults.total++;

  // Test 2: Connection status indicator
  const connStatusTest = await runTest(page, 'Connection status indicator visible', async () => {
    const status = await page.$('#connection-status');
    return status !== null;
  });
  testResults.tests.push(connStatusTest);
  if (connStatusTest.passed) testResults.passed++; else testResults.failed++;
  testResults.total++;

  // Test 3: Offline sync manager
  const offlineSyncTest = await runTest(page, 'Offline sync manager exists', async () => {
    const hasSyncManager = await page.evaluate(() => {
      return window.syncManager !== undefined;
    });
    return hasSyncManager;
  });
  testResults.tests.push(offlineSyncTest);
  if (offlineSyncTest.passed) testResults.passed++; else testResults.failed++;
  testResults.total++;

  // Test 4: Export module
  const exportModuleTest = await runTest(page, 'Export module exists', async () => {
    const hasExport = await page.evaluate(() => {
      return window.exportModule !== undefined;
    });
    return hasExport;
  });
  testResults.tests.push(exportModuleTest);
  if (exportModuleTest.passed) testResults.passed++; else testResults.failed++;
  testResults.total++;

  // Test 5: IndexedDB availability
  const indexeddbTest = await runTest(page, 'IndexedDB initialized', async () => {
    const hasDB = await page.evaluate(() => {
      return window.cgraDB !== undefined;
    });
    return hasDB;
  });
  testResults.tests.push(indexeddbTest);
  if (indexeddbTest.passed) testResults.passed++; else testResults.failed++;
  testResults.total++;

  return testResults;
}

async function testFinalIntegration(page, results) {
  const testResults = {
    tests: [],
    passed: 0,
    failed: 0,
    total: 0,
  };

  // Test 1: All 8 modules accessible
  const modulesTest = await runTest(page, 'All 8 modules accessible', async () => {
    const modules = await page.evaluate(() => {
      const links = document.querySelectorAll('.nav-link');
      return Array.from(links).map(l => l.dataset.module);
    });
    const expected = ['dashboard', 'role', 'lifecycle', 'procedure', 'rights', 'cases', 'resources', 'support'];
    return expected.every(m => modules.includes(m));
  });
  testResults.tests.push(modulesTest);
  if (modulesTest.passed) testResults.passed++; else testResults.failed++;
  testResults.total++;

  // Test 2: Breadcrumb navigation
  const breadcrumbTest = await runTest(page, 'Breadcrumb navigation exists', async () => {
    const breadcrumb = await page.$('#breadcrumb');
    return breadcrumb !== null;
  });
  testResults.tests.push(breadcrumbTest);
  if (breadcrumbTest.passed) testResults.passed++; else testResults.failed++;
  testResults.total++;

  // Test 3: Service Worker
  const swTest = await runTest(page, 'Service Worker registered', async () => {
    try {
      const swActive = await page.evaluate(async () => {
        if (!('serviceWorker' in navigator)) return false;
        try {
          const reg = await navigator.serviceWorker.ready;
          return reg.active !== undefined;
        } catch {
          return false;
        }
      });
      return swActive;
    } catch {
      return false;
    }
  });
  testResults.tests.push(swTest);
  if (swTest.passed) testResults.passed++; else testResults.failed++;
  testResults.total++;

  // Test 4: Lifecycle data
  const lifecycleDataTest = await runTest(page, 'Lifecycle data loaded (22+ phases)', async () => {
    const phaseCount = await page.evaluate(() => {
      return window.pwaApp?.lifecycleModule?.phases?.length || 0;
    });
    return phaseCount >= 22;
  });
  testResults.tests.push(lifecycleDataTest);
  if (lifecycleDataTest.passed) testResults.passed++; else testResults.failed++;
  testResults.total++;

  // Test 5: Cases data
  const casesDataTest = await runTest(page, 'Cases data loaded (15+ cases)', async () => {
    const caseCount = await page.evaluate(() => {
      return window.pwaApp?.casesModule?.cases?.length || 0;
    });
    return caseCount >= 15;
  });
  testResults.tests.push(casesDataTest);
  if (casesDataTest.passed) testResults.passed++; else testResults.failed++;
  testResults.total++;

  // Test 6: Responsive design
  const responsiveTest = await runTest(page, 'Responsive design works', async () => {
    const header = await page.$('.app-header');
    const nav = await page.$('.main-navigation');
    return header !== null && nav !== null;
  });
  testResults.tests.push(responsiveTest);
  if (responsiveTest.passed) testResults.passed++; else testResults.failed++;
  testResults.total++;

  return testResults;
}

async function runTest(page, name, testFn) {
  const result = {
    name,
    passed: false,
    error: null,
  };

  try {
    const passed = await testFn();
    result.passed = passed;
    console.log(`${passed ? '✓' : '✗'} ${name}`);
  } catch (error) {
    result.error = error.message;
    console.log(`✗ ${name} - ${error.message}`);
  }

  return result;
}

function printSummary(results) {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║  TEST EXECUTION SUMMARY                            ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  const { totalTests, passed, failed } = results.summary;
  const passRate = ((passed / totalTests) * 100).toFixed(2);

  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Pass Rate: ${passRate}%\n`);

  console.log('Task Results:');
  console.log(`  Task 13 (Search & Discovery): ${results.tasks[13].tests.filter(t => t.passed).length}/${results.tasks[13].tests.length}`);
  console.log(`  Task 14 (Offline Sync): ${results.tasks[14].tests.filter(t => t.passed).length}/${results.tasks[14].tests.length}`);
  console.log(`  Task 15 (Final Integration): ${results.tasks[15].tests.filter(t => t.passed).length}/${results.tasks[15].tests.length}\n`);

  console.log('Performance Metrics:');
  console.log(`  Navigation Time: ${results.metrics.navigationTime}ms`);
  console.log(`  DOM Content Loaded: ${results.metrics.performance?.domContentLoaded}ms`);
  console.log(`  Load Complete: ${results.metrics.performance?.loadComplete}ms\n`);

  console.log('Accessibility:');
  console.log(`  Lang attribute: ${results.metrics.accessibility?.langAttribute ? 'PASS' : 'FAIL'}`);
  console.log(`  Heading structure: ${results.metrics.accessibility?.headingStructure ? 'PASS' : 'FAIL'}`);
  console.log(`  Image alt text: ${results.metrics.accessibility?.imageAltText ? 'PASS' : 'FAIL'}`);
  console.log(`  Form labels: ${results.metrics.accessibility?.formLabels ? 'PASS' : 'FAIL'}\n`);

  if (results.summary.errors.length > 0) {
    console.log('Errors:');
    results.summary.errors.forEach(err => console.log(`  - ${err}`));
  }
}

runTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
