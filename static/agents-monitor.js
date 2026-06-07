/* Innova Bot — Real-time Agent Status Monitor — Phase 4 Testing */

class AgentsMonitor {
  constructor() {
    this.agents = new Map();
    this.ws = null;
    this.containerEl = document.getElementById('agentsMonitor') || this.createMonitorPanel();
    this.updateInterval = 2000;
    this.isRunning = false;

    this.init();
  }

  createMonitorPanel() {
    const panel = document.createElement('div');
    panel.id = 'agentsMonitor';
    panel.className = 'card card--agents-monitor';
    panel.innerHTML = `
      <h2>🤖 Agent Status Monitor</h2>
      <div class="agents-grid" id="agentsGrid"></div>
      <div class="monitor-stats" id="monitorStats"></div>
    `;
    document.querySelector('.layout-col--center')?.appendChild(panel) ||
      document.body.appendChild(panel);
    return panel;
  }

  async init() {
    console.log('📡 Initializing Agents Monitor...');

    // Try WebSocket first
    this.connectWebSocket();

    // Fallback: periodic HTTP polling
    this.startPolling();

    this.isRunning = true;
  }

  connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${window.location.host}/ws/agents`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'agent_status') {
            this.updateAgents(data.agents || []);
          }
        } catch (e) {
          console.warn('WebSocket parse error:', e);
        }
      };

      this.ws.onerror = () => {
        console.warn('WebSocket connection failed, using HTTP polling');
        this.ws = null;
      };
    } catch (e) {
      console.warn('WebSocket not available:', e);
      this.ws = null;
    }
  }

  startPolling() {
    setInterval(async () => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        await this.fetchAgentStatus();
      }
    }, this.updateInterval);
  }

  async fetchAgentStatus() {
    try {
      const response = await fetch('/api/ai/status');
      if (response.ok) {
        const data = await response.json();
        this.updateAgents(data.agents || []);
      }
    } catch (error) {
      console.error('Failed to fetch agent status:', error);
    }
  }

  updateAgents(agentsData) {
    agentsData.forEach(agentData => {
      this.agents.set(agentData.name, {
        name: agentData.name,
        status: agentData.status || 'idle',
        phase: agentData.phase || '',
        progress: agentData.progress || 0,
        model: agentData.model || 'ollama.mdes',
        task: agentData.task || '',
        lastUpdate: Date.now(),
        iterations: agentData.iterations || 0,
        outcome: agentData.outcome || ''
      });
    });

    this.render();
  }

  render() {
    const grid = document.getElementById('agentsGrid');
    if (!grid) return;

    const agentsHtml = Array.from(this.agents.values())
      .map(agent => this.renderAgentCard(agent))
      .join('');

    grid.innerHTML = agentsHtml;

    // Update stats
    const stats = this.calculateStats();
    const statsEl = document.getElementById('monitorStats');
    if (statsEl) {
      statsEl.innerHTML = this.renderStats(stats);
    }
  }

  renderAgentCard(agent) {
    const statusClass = `status-${agent.status}`;
    const isActive = agent.status !== 'idle' && agent.status !== 'error';

    return `
      <div class="agent-card ${statusClass} ${isActive ? 'active' : ''}">
        <div class="agent-card__header">
          <div class="agent-card__name">${agent.name.toUpperCase()}</div>
          <div class="agent-card__status badge badge--${agent.status}">
            ${agent.status}
          </div>
        </div>

        <div class="agent-card__body">
          <div class="agent-card__field">
            <span class="label">Phase:</span>
            <span class="value">${agent.phase || '—'}</span>
          </div>

          <div class="agent-card__field">
            <span class="label">Progress:</span>
            <div class="progress-bar">
              <div class="progress-bar__fill" style="width: ${agent.progress}%"></div>
            </div>
            <span class="value">${agent.progress}%</span>
          </div>

          <div class="agent-card__field">
            <span class="label">Model:</span>
            <span class="value model-tag">${agent.model}</span>
          </div>

          <div class="agent-card__field">
            <span class="label">Task:</span>
            <span class="value task-text" title="${agent.task}">
              ${agent.task ? agent.task.substring(0, 40) + (agent.task.length > 40 ? '...' : '') : '—'}
            </span>
          </div>

          <div class="agent-card__field">
            <span class="label">Iterations:</span>
            <span class="value">${agent.iterations}</span>
          </div>

          <div class="agent-card__field">
            <span class="label">Last Update:</span>
            <span class="value time-ago" data-timestamp="${agent.lastUpdate}">
              ${this.formatTimeAgo(agent.lastUpdate)}
            </span>
          </div>
        </div>

        ${agent.outcome ? `
          <div class="agent-card__outcome">
            <strong>Outcome:</strong>
            <p>${agent.outcome.substring(0, 100)}${agent.outcome.length > 100 ? '...' : ''}</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  calculateStats() {
    const agents = Array.from(this.agents.values());
    const statuses = {};

    agents.forEach(agent => {
      statuses[agent.status] = (statuses[agent.status] || 0) + 1;
    });

    return {
      totalAgents: agents.length,
      statuses,
      avgProgress: agents.length > 0
        ? Math.round(agents.reduce((sum, a) => sum + a.progress, 0) / agents.length)
        : 0,
      activeAgents: agents.filter(a => a.status !== 'idle').length
    };
  }

  renderStats(stats) {
    const statusBadges = Object.entries(stats.statuses)
      .map(([status, count]) => `<span class="badge badge--${status}">${status}: ${count}</span>`)
      .join('');

    return `
      <div class="stats-row">
        <div class="stat">
          <span class="stat__label">Total Agents:</span>
          <span class="stat__value">${stats.totalAgents}</span>
        </div>
        <div class="stat">
          <span class="stat__label">Active:</span>
          <span class="stat__value">${stats.activeAgents}</span>
        </div>
        <div class="stat">
          <span class="stat__label">Avg Progress:</span>
          <span class="stat__value">${stats.avgProgress}%</span>
        </div>
      </div>
      <div class="status-badges">${statusBadges}</div>
    `;
  }

  formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

    return `${Math.floor(seconds / 86400)}d ago`;
  }

  getAgentStatus(name) {
    return this.agents.get(name);
  }

  getAllAgents() {
    return Array.from(this.agents.values());
  }

  stop() {
    this.isRunning = false;
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  if (!window.agentsMonitor) {
    window.agentsMonitor = new AgentsMonitor();
    console.log('✅ AgentsMonitor initialized');
  }
});
