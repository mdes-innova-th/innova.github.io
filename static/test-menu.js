/* Innova Bot — Interactive Test Menu — Phase 4 Testing */

class TestMenu {
  constructor() {
    this.currentSelection = 0;
    this.maxOptions = 9;
    this.containerEl = document.getElementById('testMenu') || this.createMenuPanel();
    this.isRunning = false;

    this.menuItems = [
      { id: 1, label: '🤖 BigMom Orchestration', test: 'bigmom' },
      { id: 2, label: '🗣️ Javis Thai Chat', test: 'javis-thai' },
      { id: 3, label: '📋 GSD Workflow', test: 'gsd-workflow' },
      { id: 4, label: '🌉 Hermes Bridge', test: 'hermes-bridge' },
      { id: 5, label: '💬 Discord Integration', test: 'discord' },
      { id: 6, label: '🧠 Model Routing', test: 'model-routing' },
      { id: 7, label: '👥 Sub-Agent Team', test: 'subagents' },
      { id: 8, label: '🎯 Full System Test', test: 'full-system' },
      { id: 9, label: '📊 View Results', action: 'view-results' },
      { id: 0, label: '❌ Exit', action: 'exit' }
    ];

    this.init();
  }

  createMenuPanel() {
    const panel = document.createElement('div');
    panel.id = 'testMenu';
    panel.className = 'card card--test-menu';
    panel.innerHTML = `
      <h1 style="text-align: center; font-size: 24px; margin: 20px 0;">
        🤖 INNOVA-BOT TEST SUITE
      </h1>
      <div class="menu-container" id="menuContainer"></div>
      <div class="menu-status" id="menuStatus"></div>
      <div class="menu-input">
        <input type="number" id="menuInput" min="0" max="9" placeholder="Select (0-9)" style="width: 100%; padding: 10px; margin-top: 20px;">
      </div>
    `;
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.appendChild(panel);
    }
    return panel;
  }

  init() {
    console.log('📋 Initializing Test Menu...');

    this.render();

    // Keyboard support
    document.addEventListener('keypress', (e) => {
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 0 && num <= 9) {
        this.selectOption(num);
      }
    });

    // Input field support
    const input = document.getElementById('menuInput');
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const num = parseInt(input.value);
          if (!isNaN(num)) {
            this.selectOption(num);
            input.value = '';
          }
        }
      });
    }
  }

  render() {
    const menuEl = document.getElementById('menuContainer');
    if (!menuEl) return;

    const menuHtml = this.menuItems.map((item, idx) => `
      <div class="menu-item" data-option="${item.id}">
        <span class="menu-option">${item.id}</span>
        <span class="menu-label">${item.label}</span>
      </div>
    `).join('');

    menuEl.innerHTML = `
      <div style="border: 2px solid #00d9ff; padding: 20px; border-radius: 8px;">
        ${menuHtml}
      </div>
    `;

    this.updateStatus('Ready. Select an option (0-9)');
  }

  selectOption(num) {
    if (this.isRunning) {
      this.updateStatus('⏳ Test already running. Please wait...');
      return;
    }

    const item = this.menuItems.find(m => m.id === num);
    if (!item) {
      this.updateStatus('❌ Invalid selection');
      return;
    }

    if (item.action === 'exit') {
      this.updateStatus('👋 Exiting...');
      setTimeout(() => window.location.href = '/', 2000);
      return;
    }

    if (item.action === 'view-results') {
      this.showResults();
      return;
    }

    if (item.test) {
      this.runTest(item.test, item.label);
    }
  }

  async runTest(testId, label) {
    this.isRunning = true;
    this.updateStatus(`⏳ Running: ${label}...`);

    try {
      const endpoints = {
        'bigmom': '/api/test/bigmom',
        'javis-thai': '/api/test/javis-thai',
        'gsd-workflow': '/api/test/gsd',
        'hermes-bridge': '/api/test/hermes',
        'discord': '/api/test/discord',
        'model-routing': '/api/test/model-routing',
        'subagents': '/api/test/subagents',
        'full-system': '/api/test/full-system'
      };

      const endpoint = endpoints[testId];
      if (!endpoint) {
        throw new Error(`Unknown test: ${testId}`);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      this.displayTestResult(label, result);
      this.updateStatus(`✅ ${label} completed`);

      // Store result for viewing later
      if (!window.testResults) window.testResults = [];
      window.testResults.push({ label, result, timestamp: Date.now() });

    } catch (error) {
      console.error(`❌ Test failed: ${testId}`, error);
      this.updateStatus(`❌ Error: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }

  displayTestResult(label, result) {
    const resultEl = document.createElement('div');
    resultEl.className = 'test-menu-result';
    resultEl.innerHTML = `
      <h3>${label}</h3>
      <div class="result-details">
        <p><strong>Status:</strong> ${result.status || 'completed'}</p>
        <p><strong>Passed:</strong> <span style="color: #00ff41;">${result.passed || 0}</span></p>
        <p><strong>Failed:</strong> <span style="color: #ff006e;">${result.failed || 0}</span></p>
        <p><strong>Duration:</strong> ${result.duration || 0}ms</p>
        ${result.message ? `<p><strong>Message:</strong> ${result.message}</p>` : ''}
      </div>
      ${result.tests ? `
        <details>
          <summary>Details (${result.tests.length} tests)</summary>
          <div class="result-tests">
            ${result.tests.map(t => `
              <div class="result-test result-test--${t.status}">
                ${t.status === 'passed' ? '✓' : '✗'} ${t.name}
              </div>
            `).join('')}
          </div>
        </details>
      ` : ''}
    `;

    const containerEl = document.getElementById('menuContainer');
    if (containerEl) {
      containerEl.appendChild(resultEl);
    }
  }

  showResults() {
    if (!window.testResults || window.testResults.length === 0) {
      this.updateStatus('No test results yet. Run a test first.');
      return;
    }

    const containerEl = document.getElementById('menuContainer');
    if (!containerEl) return;

    const resultsHtml = window.testResults.map((item, idx) => `
      <div class="test-menu-result">
        <h3>${idx + 1}. ${item.label}</h3>
        <small>${new Date(item.timestamp).toLocaleTimeString()}</small>
        <div class="result-summary">
          <p>Status: ${item.result.status}</p>
          <p>Passed: <span style="color: #00ff41;">${item.result.passed || 0}</span></p>
          <p>Failed: <span style="color: #ff006e;">${item.result.failed || 0}</span></p>
        </div>
      </div>
    `).join('');

    containerEl.innerHTML = `
      <h2>📊 Test Results</h2>
      <div class="results-list">
        ${resultsHtml}
      </div>
      <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px;">↻ Back to Menu</button>
    `;

    this.updateStatus('View Results');
  }

  updateStatus(message) {
    const statusEl = document.getElementById('menuStatus');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.style.cssText = `
        padding: 10px;
        margin-top: 10px;
        background: rgba(0, 217, 255, 0.1);
        border: 1px solid #00d9ff;
        border-radius: 4px;
        text-align: center;
        font-weight: bold;
      `;
    }
  }
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  if (!window.testMenu) {
    window.testMenu = new TestMenu();
    console.log('✅ TestMenu initialized');
  }
});
