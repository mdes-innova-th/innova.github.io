(function() {
  const isUAT = window.location.hostname.includes('github.io') || new URLSearchParams(window.location.search).get('mock') === 'true';
  if (!isUAT) return;

  console.log("UAT Mock Layer Active");

  let mockCpu = 25;
  let mockMem = 62;
  setInterval(() => {
    mockCpu = Math.max(10, Math.min(95, mockCpu + (Math.random() * 10 - 5)));
    mockMem = Math.max(50, Math.min(85, mockMem + (Math.random() * 4 - 2)));
  }, 2000);

  const originalFetch = window.fetch;
  window.fetch = async function(url, options) {
    const urlStr = typeof url === 'string' ? url : url.url;
    
    if (urlStr.includes('/api/ai/status')) {
      return new Response(JSON.stringify({
        ok: true,
        selected_route: "remote-http",
        selected_reason: "REMOTE_OLLAMA_BASE_URL reachable (UAT Mock)",
        ollama_model: "gemini-1.5-flash",
        remote: { configured: true, reachable: true, status: 200 },
        ask_url: { configured: false, reachable: false, status: 0 },
        probe_errors: { remote: "", ask_url: "" },
        fix_actions: {},
        route_diagnostics: { last_error_type: "", self_heal_path: "" },
        quick_actions: {},
        projects: [
          { name: "JIT", path: "C:/Users/USER-NT/Jit", completion: 88 },
          { name: "INNOVA-BOT", path: "C:/Users/USER-NT/DEV/innova-bot-template", completion: 74 },
          { name: "MAW-JS", path: "C:/Users/USER-NT/DEV/maw-js", completion: 60 },
          { name: "MULTIPLE-AGENT-WORKFLOW-KIT", path: "C:/Users/USER-NT/DEV/multi-agent-workflow-kit", completion: 95 }
        ],
        agents: [
          { name: "วิทย์", role: "SA", model: "gemini-1.5-flash", status: "idle", tokens: 50400, task: "", progress: 0, phase: "idle" },
          { name: "คร๊อส", role: "Dev", model: "qwen2.5-coder:7b", status: "idle", tokens: 89000, task: "", progress: 0, phase: "idle" },
          { name: "กราวี่", role: "QE", model: "gemma2:27b", status: "running", tokens: 42000, task: "Validating GUI layouts...", progress: 68, phase: "testing" },
          { name: "Codex", role: "Codex", model: "gemini-1.5-pro", status: "idle", tokens: 12000, task: "", progress: 0, phase: "idle" },
          { name: "Jit", role: "Core", model: "Google Gemini (antigravity)", status: "running", tokens: 154000, task: "Running auto-tests and UAT deploy...", progress: 95, phase: "active" }
        ],
        commands: []
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (urlStr.includes('/api/telemetry')) {
      return new Response(JSON.stringify({
        cpu_percent: Math.round(mockCpu),
        mem_percent: Math.round(mockMem),
        mem_used_mb: Math.round(mockMem * 163.84),
        mem_total_mb: 16384
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (urlStr.includes('/api/maw/status')) {
      return new Response(JSON.stringify({
        ok: true,
        sessions: [
          { name: "Jit Core Session", source: "local" },
          { name: "Innova Swarm Agent", source: "mdes-ollama" }
        ]
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (urlStr.includes('/api/logs') || urlStr.includes('/api/activity')) {
      return new Response(JSON.stringify({
        ok: true,
        items: []
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return originalFetch.apply(this, arguments);
  };

  const originalEventSource = window.EventSource;
  window.EventSource = function(url, options) {
    const es = {
      onmessage: null,
      onerror: null,
      onopen: null,
      close: function() { clearInterval(this.interval); }
    };
    
    es.interval = setInterval(() => {
      if (es.onmessage) {
        es.onmessage({
          data: JSON.stringify({
            topic: "AGENT_PHASE",
            published_at: new Date().toISOString(),
            payload: {
              session_id: "uat-session",
              iteration: 1,
              phase: "THINK",
              success: true,
              data: { message: "UAT simulated message log" }
            }
          })
        });
      }
    }, 4000);

    return es;
  };
})();
