/* Innova Bot — Browser Test Runner — Phase 4 Testing */

class TestRunner {
  constructor() {
    this.currentTest = null;
    this.results = [];
    this.isRunning = false;
    this.containerEl = document.getElementById('testRunner') || this.createTestPanel();

    this.init();
  }

  createTestPanel() {
    const panel = document.createElement('div');
    panel.id = 'testRunner';
    panel.className = 'card card--test-runner';
    panel.innerHTML = `
      <h2>🧪 Test Runner</h2>
      <div class="test-controls">
        <button id="runAllTests" class="btn btn-primary">Run All Tests</button>
        <button id="stopTests" class="btn btn-danger" disabled>Stop</button>
        <select id="testFilter" class="test-filter">
          <option value="">All Tests</option>
          <option value="bigmom">BigMom Orchestration</option>
          <option value="javis">Javis GSD</option>
          <option value="hermes">Hermes Bridge</option>
          <option value="discord">Discord Gateway</option>
          <option value="ollama">Ollama Integration</option>
        </select>
      </div>
      <div class="test-progress" id="testProgress"></div>
      <div class="test-results" id="testResults"></div>
    `;
    document.querySelector('.layout-col--center')?.appendChild(panel) ||
      document.body.appendChild(panel);
    return panel;
  }

  init() {
    console.log('🧪 Initializing Test Runner...');

    const runBtn = document.getElementById('runAllTests');
    const stopBtn = document.getElementById('stopTests');
    const filter = document.getElementById('testFilter');

    if (runBtn) runBtn.addEventListener('click', () => this.runTests());
    if (stopBtn) stopBtn.addEventListener('click', () => this.stopTests());
    if (filter) filter.addEventListener('change', () => this.renderResults());
  }

  async runTests(filter = '') {
    if (this.isRunning) return;

    this.isRunning = true;
    this.results = [];

    const runBtn = document.getElementById('runAllTests');
    const stopBtn = document.getElementById('stopTests');

    if (runBtn) runBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;

    console.log('🚀 Starting test suite...');

    const testCategories = [
      { name: 'BigMom Orchestration', id: 'bigmom', endpoint: '/api/test/bigmom' },
      { name: 'Javis GSD Workflow', id: 'javis', endpoint: '/api/test/javis' },
      { name: 'Hermes Bridge', id: 'hermes', endpoint: '/api/test/hermes' },
      { name: 'Discord Gateway', id: 'discord', endpoint: '/api/test/discord' },
      { name: 'Ollama Integration', id: 'ollama', endpoint: '/api/test/ollama' },
      { name: 'Thai Language', id: 'thai', endpoint: '/api/test/thai' },
      { name: 'Sub-Agent Team', id: 'subagents', endpoint: '/api/test/subagents' }
    ];

    const selectedFilter = document.getElementById('testFilter')?.value || '';
    const testsToRun = selectedFilter
      ? testCategories.filter(t => t.id === selectedFilter)
      : testCategories;

    for (const test of testsToRun) {
      if (!this.isRunning) break;

      await this.runTestCategory(test);
    }

    this.isRunning = false;

    if (runBtn) runBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;

    console.log('✅ Test suite completed');
    this.renderSummary();
  }

  async runTestCategory(test) {
    console.log(`⏳ Running ${test.name}...`);

    this.updateProgress(`Running: ${test.name}`);

    try {
      const response = await fetch(test.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeout: 30000 })
      });

      if (response.ok) {
        const data = await response.json();

        this.results.push({
          name: test.name,
          id: test.id,
          status: data.status || 'passed',
          passed: data.passed || 0,
          failed: data.failed || 0,
          skipped: data.skipped || 0,
          duration: data.duration || 0,
          tests: data.tests || [],
          error: null
        });

        console.log(`✅ ${test.name}: ${data.passed} passed, ${data.failed} failed`);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ ${test.name} failed:`, error);

      this.results.push({
        name: test.name,
        id: test.id,
        status: 'error',
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: 0,
        tests: [],
        error: error.message
      });
    }

    this.renderResults();
  }

  updateProgress(message) {
    const progressEl = document.getElementById('testProgress');
    if (progressEl) {
      progressEl.innerHTML = `<div class="progress-message">${message}</div>`;
    }
  }

  renderResults() {
    const resultsEl = document.getElementById('testResults');
    if (!resultsEl) return;

    const filter = document.getElementById('testFilter')?.value || '';
    const filtered = filter
      ? this.results.filter(r => r.id === filter)
      : this.results;

    const html = filtered.map(result => this.renderTestResult(result)).join('');

    resultsEl.innerHTML = html || '<p class="no-results">No results yet</p>';
  }

  renderTestResult(result) {
    const statusClass = result.status === 'error' ? 'error' : result.failed === 0 ? 'passed' : 'failed';
    const totalTests = result.passed + result.failed + result.skipped;

    return `
      <div class="test-result test-result--${statusClass}">
        <div class="test-result__header">
          <h3>${result.name}</h3>
          <span class="badge badge--${statusClass}">${result.status}</span>
        </div>

        <div class="test-result__stats">
          <div class="stat-item passed">
            <span class="icon">✓</span>
            <span class="label">Passed:</span>
            <span class="value">${result.passed}</span>
          </div>
          <div class="stat-item failed">
            <span class="icon">✗</span>
            <span class="label">Failed:</span>
            <span class="value">${result.failed}</span>
          </div>
          <div class="stat-item skipped">
            <span class="icon">⊘</span>
            <span class="label">Skipped:</span>
            <span class="value">${result.skipped}</span>
          </div>
          <div class="stat-item duration">
            <span class="icon">⏱</span>
            <span class="label">Duration:</span>
            <span class="value">${result.duration}ms</span>
          </div>
        </div>

        ${result.error ? `
          <div class="test-result__error">
            <strong>Error:</strong>
            <pre>${result.error}</pre>
          </div>
        ` : ''}

        ${result.tests.length > 0 ? `
          <details class="test-result__details">
            <summary>Individual Tests (${result.tests.length})</summary>
            <div class="test-list">
              ${result.tests.map(t => `
                <div class="test-item test-item--${t.status}">
                  <span class="test-icon">${t.status === 'passed' ? '✓' : '✗'}</span>
                  <span class="test-name">${t.name}</span>
                  <span class="test-duration">${t.duration}ms</span>
                </div>
              `).join('')}
            </div>
          </details>
        ` : ''}
      </div>
    `;
  }

  renderSummary() {
    const total = this.results.reduce((sum, r) => sum + r.passed + r.failed, 0);
    const passed = this.results.reduce((sum, r) => sum + r.passed, 0);
    const failed = this.results.reduce((sum, r) => sum + r.failed, 0);
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    const summaryEl = document.createElement('div');
    summaryEl.className = 'test-summary';
    summaryEl.innerHTML = `
      <h3>📊 Test Summary</h3>
      <div class="summary-stats">
        <div class="stat passed">Total Passed: <strong>${passed}</strong></div>
        <div class="stat failed">Total Failed: <strong>${failed}</strong></div>
        <div class="stat rate">Pass Rate: <strong>${passRate}%</strong></div>
      </div>
    `;

    const resultsEl = document.getElementById('testResults');
    if (resultsEl) {
      resultsEl.insertAdjacentElement('beforebegin', summaryEl);
    }
  }

  stopTests() {
    this.isRunning = false;
    const stopBtn = document.getElementById('stopTests');
    if (stopBtn) stopBtn.disabled = true;
    console.log('🛑 Test suite stopped');
  }
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  if (!window.testRunner) {
    window.testRunner = new TestRunner();
    console.log('✅ TestRunner initialized');
  }
});
