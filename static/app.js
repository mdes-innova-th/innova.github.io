(() => {
  const $ = (id) => document.getElementById(id);

  function emitBridge(eventName, detail = {}) {
    try {
      window.dispatchEvent(new CustomEvent(eventName, { detail }));
    } catch { }
  }

  const statusEl = $("status");
  const avatarStrip = $("avatarStrip");
  const endpointEl = $("endpoint");
  const connLog = $("connLog");
  const rawEl = $("raw");
  const newBadge = $("newBadge");

  const themeToggle = $("themeToggle");
  const langToggle = $("langToggle");
  const notifyBtn = $("notifyBtn");
  const muteBtn = $("muteBtn");

  const connectBtn = $("connectBtn");
  const disconnectBtn = $("disconnectBtn");
  const refreshToolsBtn = $("refreshToolsBtn");
  const clearConnBtn = $("clearConnBtn");
  const clearRawBtn = $("clearRawBtn");
  const refreshRuntimeBtn = $("refreshRuntimeBtn");
  const runMaintenanceBtn = $("runMaintenanceBtn");
  const runtimeDiag = $("runtimeDiag");
  const aiDiag = $("aiDiag");

  const sendBtn = $("sendBtn");
  const clearChatBtn = $("clearChatBtn");
  const chatEl = $("chat");
  const chatInput = $("chatInput");
  const chatToolbar = $("chatToolbar");
  const chatStatus = $("chatStatus");

  const toolSelect = $("toolSelect");
  const toolArgs = $("toolArgs");
  const callToolBtn = $("callToolBtn");
  const toolOut = $("toolOut");
  const prettyBtn = $("prettyBtn");

  const activityEl = $("activity");
  const activityRefreshBtn = $("activityRefreshBtn");
  const activityFilter = $("activityFilter");
  const projectFilter = $("projectFilter");
  const activityLimit = $("activityLimit");
  const activitySearch = $("activitySearch");
  const activitySort = $("activitySort");
  const activitySummary = $("activitySummary");
  const clearActivityBtn = $("clearActivityBtn");
  const lineThread = $("lineThread");
  const lineProjectFilter = $("lineProjectFilter");
  const lineRoleSelect = $("lineRoleSelect");
  const lineCommandInput = $("lineCommandInput");
  const lineSendBtn = $("lineSendBtn");
  const lineCommandClearBtn = $("lineCommandClearBtn");
  const lineJumpActivityBtn = $("lineJumpActivityBtn");
  const lineOpenGuiBtn = $("lineOpenGuiBtn");
  const lineCopyTuiBtn = $("lineCopyTuiBtn");
  const lineClearBtn = $("lineClearBtn");
  const focusProjectSelect = $("focusProjectSelect");
  const focusRoleSelect = $("focusRoleSelect");
  const focusApplyBtn = $("focusApplyBtn");
  const autoDevToggleBtn = $("autoDevToggleBtn");
  const brainModeSelect = $("brainModeSelect");
  const brainApplyBtn = $("brainApplyBtn");
  const opsProcessRefreshBtn = $("opsProcessRefreshBtn");
  const opsProcessLog = $("opsProcessLog");

  const rawModeSelect = $("rawModeSelect");
  const rawSourceFilter = $("rawSourceFilter");
  const rawFilterInput = $("rawFilterInput");
  const rawPauseBtn = $("rawPauseBtn");

  const kpiProjects = $("kpiProjects");
  const kpiTeams = $("kpiTeams");
  const kpiAgents = $("kpiAgents");
  const kpiAlerts = $("kpiAlerts");

  const viewOverviewBtn = $("viewOverviewBtn");
  const viewProjectBtn = $("viewProjectBtn");
  const overviewPanel = $("overviewPanel");
  const projectPanel = $("projectPanel");
  const projectSelect = $("projectSelect");
  const projectScoreList = $("projectScoreList");
  const teamScoreList = $("teamScoreList");
  const agentScoreList = $("agentScoreList");
  const projectSummary = $("projectSummary");
  const projectTeamList = $("projectTeamList");
  const projectAgentList = $("projectAgentList");
  const projectProgressSummary = $("projectProgressSummary");
  const projectProgressList = $("projectProgressList");
  const projectProgressClearBtn = $("projectProgressClearBtn");
  const knowledgeOpenOpsBtn = $("knowledgeOpenOpsBtn");
  const knowledgeOpenMemoryBtn = $("knowledgeOpenMemoryBtn");
  const knowledgeRunSearchBtn = $("knowledgeRunSearchBtn");

  const hitlRefreshBtn = $("hitlRefreshBtn");
  const hitlScope = $("hitlScope");
  const hitlStats = $("hitlStats");
  const hitlCopyStatus = $("hitlCopyStatus");
  const hitlList = $("hitlList");

  // Phase 24 Security Center
  const viewAuditBtn = $("viewAuditBtn");
  const viewPoliciesBtn = $("viewPoliciesBtn");
  const auditPanel = $("auditPanel");
  const policiesPanel = $("policiesPanel");
  const auditOut = $("auditOut");
  const policiesOut = $("policiesOut");
  const clearAuditBtn = $("clearAuditBtn");
  const fetchPoliciesBtn = $("fetchPoliciesBtn");
  const auditConnStatus = $("auditConnStatus");
  let auditWs = null;
  let auditRetryCount = 0;
  let auditRetryTimer = null;

  let es = null;
  let rpcEndpoint = null;
  let nextId = 1;
  const pending = new Map();
  const activity = [];
  let activityCap = 300;
  const serverActivityKeys = new Set();
  let activityFilterValue = "all";
  let projectFilterValue = "all";
  let activitySearchValue = "";
  let activitySortValue = "latest";
  let lineChatProjectValue = "all";
  let autoDevEnabled = localStorage.getItem("innovaAutoDev") === "1";
  let selectedProject = "";
  let unseenCount = 0;
  let notificationEnabled = false;
  let soundMuted = true;
  let currentLang = localStorage.getItem("innovaLang") || "en";
  let alertCount = 0;
  let hitlTimer = null;
  let aiStatusTimer = null;
  let _cittaThrottleTimer = null;
  let _cittaPending = null;
  let aiSuggestedCommands = [];
  let aiFixByKey = {};
  let aiFixFeedbackByKey = {};
  let aiFixRunOutputByKey = {};
  let aiFixRunFullOutputByKey = {};
  let aiFixRunExpandedByKey = {};
  let aiLastStatus = null;
  let aiLastCheckedAt = "-";
  let insightSeedRows = [];
  let insightSeedLoadedAt = 0;
  let rawMode = "raw";
  let rawSource = "all";
  let rawFilter = "";
  let rawPaused = false;
  const projectProgressByKey = new Map();
  let projectProgressSeeded = false;
  const hitlExpanded = new Set();
  const hitlItemsById = new Map();
  let hitlCopyStatusTimer = null;
  let ecsAppliedTam = "Constructive/Curiosity";

  const connLines = [];
  const rawLines = [];
  const connCap = 250;
  const rawCap = 500;

  const i18n = {
    en: {
      appTitle: "🚀 Innova Bot — Realtime Control Center",
      connectionTitle: "🔌 Connection",
      sseUrl: "SSE URL",
      connectBtn: "Connect",
      disconnectBtn: "Disconnect",
      alertsBtn: "Enable Alerts",
      alertsOn: "Alerts ON",
      muteBtn: "Mute Sound",
      unmuteBtn: "Unmute Sound",
      refreshToolsBtn: "Refresh Tools",
      clearConnBtn: "Clear Connection Log",
      runtimeBtn: "Runtime Details",
      cleanupBtn: "Run Cleanup",
      chatTitle: "💬 Chat (ask_local_ai)",
      chatMessage: "Message",
      sendBtn: "Send",
      clearBtn: "Clear",
      chatHint: "If ask_local_ai isn’t configured, you’ll see an error response.",
      toolRunnerTitle: "🛠️ Tool Runner",
      toolLabel: "Tool",
      toolArgs: "Arguments (JSON)",
      callToolBtn: "Call Tool",
      prettyJsonBtn: "Pretty JSON",
      activityTitle: "📡 Activity & Tool Calls",
      activityHint: "Combined activity from all MCP clients (GUI, VS Code Copilot, and other projects).",
      insightsTitle: "📊 Dashboard Insights",
      kpiProjects: "Projects",
      kpiTeams: "Teams",
      kpiAgents: "AI Agents",
      kpiAlerts: "Alerts",
      overviewBtn: "Overview",
      projectDetailBtn: "Project Detail",
      hitlTitle: "✅ Pending Approvals (HITL)",
      rawTitle: "🧾 Server Stream (raw JSON)",
      noNotificationApi: "No Notification API",
      darkTheme: "Dark theme",
      lightTheme: "Light theme"
    },
    th: {
      appTitle: "🚀 Innova Bot — ศูนย์ควบคุมแบบเรียลไทม์",
      connectionTitle: "🔌 การเชื่อมต่อ",
      sseUrl: "SSE URL",
      connectBtn: "เชื่อมต่อ",
      disconnectBtn: "ตัดการเชื่อมต่อ",
      alertsBtn: "เปิดการแจ้งเตือน",
      alertsOn: "แจ้งเตือน: เปิด",
      muteBtn: "ปิดเสียง",
      unmuteBtn: "เปิดเสียง",
      refreshToolsBtn: "รีเฟรชเครื่องมือ",
      clearConnBtn: "ล้างล็อกการเชื่อมต่อ",
      runtimeBtn: "รายละเอียด Runtime",
      cleanupBtn: "รันการล้างข้อมูล",
      chatTitle: "💬 แชต (ask_local_ai)",
      chatMessage: "ข้อความ",
      sendBtn: "ส่ง",
      clearBtn: "ล้าง",
      chatHint: "ถ้า ask_local_ai ยังไม่ถูกตั้งค่า ระบบจะแสดงข้อความผิดพลาด",
      toolRunnerTitle: "🛠️ ตัวเรียกใช้เครื่องมือ",
      toolLabel: "เครื่องมือ",
      toolArgs: "อาร์กิวเมนต์ (JSON)",
      callToolBtn: "เรียกเครื่องมือ",
      prettyJsonBtn: "จัดรูปแบบ JSON",
      activityTitle: "📡 กิจกรรมและการเรียกเครื่องมือ",
      activityHint: "รวม activity จาก MCP client ทุกตัว (GUI, VS Code Copilot และโปรเจกต์อื่น)",
      insightsTitle: "📊 ภาพรวมแดชบอร์ด",
      kpiProjects: "โปรเจกต์",
      kpiTeams: "ทีม",
      kpiAgents: "AI Agents",
      kpiAlerts: "แจ้งเตือน",
      overviewBtn: "ภาพรวม",
      projectDetailBtn: "รายละเอียดโปรเจกต์",
      hitlTitle: "✅ คิวอนุมัติ (HITL)",
      rawTitle: "🧾 สตรีมจากเซิร์ฟเวอร์ (raw JSON)",
      noNotificationApi: "เบราว์เซอร์ไม่รองรับ Notification API",
      darkTheme: "ธีมมืด",
      lightTheme: "ธีมสว่าง"
    }
  };

  function tr(key) {
    return i18n[currentLang]?.[key] || i18n.en[key] || key;
  }

  function applyLanguage(lang) {
    currentLang = lang === "th" ? "th" : "en";
    localStorage.setItem("innovaLang", currentLang);

    if (langToggle) {
      langToggle.textContent = currentLang === "en" ? "TH" : "EN";
      langToggle.title = currentLang === "en" ? "Switch to Thai" : "สลับเป็นภาษาอังกฤษ";
    }

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key) el.textContent = tr(key);
    });

    if (notifyBtn) notifyBtn.textContent = notificationEnabled ? tr("alertsOn") : tr("alertsBtn");
    if (muteBtn) muteBtn.textContent = soundMuted ? tr("unmuteBtn") : tr("muteBtn");

    const isLight = document.body.classList.contains("theme-light");
    if (themeToggle) themeToggle.textContent = isLight ? tr("darkTheme") : tr("lightTheme");
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function hashHue(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) hash = (hash << 5) - hash + text.charCodeAt(i);
    return Math.abs(hash) % 360;
  }

  function colorFromEntity(text) {
    const hue = hashHue(text || "entity");
    return `hsl(${hue} 85% 62%)`;
  }

  function classifyLine(line) {
    const txt = line || "";
    const u = txt.toUpperCase();
    if (u.includes("ERROR") || u.includes("FAIL")) return "line--error";
    if (u.includes("WARN")) return "line--warn";
    if (u.includes("OK") || u.includes("CONNECTED")) return "line--ok";
    if (u.includes("TOOL") || u.includes("ASK_LOCAL_AI")) return "line--entity";
    return "";
  }

  function highlightTokens(text) {
    let out = text
      .replace(/(CPU|RAM|duration_ms|duration|status|project|client|actor|role|session|request_id)=/gi, `<span class="hl-key">$1</span>=`)
      .replace(/\b(\d+ms|\d+\.\d+%|\d+%)\b/g, `<span class="hl-value">$1</span>`);
    return out;
  }

  function renderLines(target, lines) {
    const shouldStick = target.scrollHeight - (target.scrollTop + target.clientHeight) <= 28;
    target.innerHTML = lines
      .map((line) => {
        const cls = classifyLine(line);
        const html = highlightTokens(line)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/&lt;span class=\"/g, '<span class="')
          .replace(/&lt;\/span&gt;/g, "</span>")
          .replace(/\"&gt;/g, '">');
        return `<span class="line ${cls}">${html}</span>`;
      })
      .join("");
    if (shouldStick || target.scrollTop <= 1) {
      try {
        target.scrollTo({ top: target.scrollHeight, behavior: "smooth" });
      } catch {
        target.scrollTop = target.scrollHeight;
      }
    }
  }

  function appendCapped(lines, cap, value) {
    lines.push(value);
    if (lines.length > cap) lines.splice(0, lines.length - cap);
  }

  function logConn(line) {
    appendCapped(connLines, connCap, line);
    renderLines(connLog, connLines);
  }

  function logRaw(line) {
    if (rawPaused) return;
    appendCapped(rawLines, rawCap, line);
    renderRawStream();
    emitBridge("innova:raw", { line });
  }

  function classifyRawSource(line) {
    const txt = String(line || "");
    const upper = txt.toUpperCase();
    if (upper.includes("ERROR") || upper.includes("FAIL")) return "error";
    if (txt.startsWith("SSE:")) return "sse";
    if (txt.startsWith("=>")) return "rpc-out";
    if (txt.startsWith("<=")) return "rpc-in";
    return "other";
  }

  function formatRawLine(line) {
    const text = String(line || "");
    if (rawMode === "raw") return text;

    const payload = text.startsWith("SSE:")
      ? text.slice(4).trim()
      : (text.startsWith("=>") || text.startsWith("<="))
        ? text.slice(2).trim()
        : text;

    const parsed = parseMaybeJson(payload);
    if (!parsed) {
      if (rawMode === "chat") return text;
      if (rawMode === "compact") return text.replace(/\s+/g, " ").trim();
      return text;
    }
    if (rawMode === "chat") {
      const role = String(parsed.role || parsed.actor_type || parsed.type || "chat");
      const content = String(parsed.content || parsed.message || parsed.line || "").trim();
      return content ? `${role}: ${content}` : JSON.stringify(parsed);
    }
    if (rawMode === "pretty") return JSON.stringify(parsed, null, 2);
    return JSON.stringify(parsed);
  }

  function isChatOnlyLine(line) {
    const txt = String(line || "");
    const low = txt.toLowerCase();
    if (low.includes("tool_call") || low.includes("tool_result")) return false;
    if (low.includes('"kind":"chat"') || low.includes('"kind": "chat"')) return true;
    if (low.includes('"role":"user"') || low.includes('"role": "user"')) return true;
    if (low.includes('"role":"ai"') || low.includes('"role": "ai"')) return true;
    if (low.includes('"role":"assistant"') || low.includes('"role": "assistant"')) return true;
    if (low.includes("ask_local_ai") && (low.includes("phase=request") || low.includes("phase=response"))) return true;
    return false;
  }

  function renderRawStream() {
    if (!rawEl) return;
    const needle = rawFilter.trim().toLowerCase();
    const filtered = rawLines
      .filter((line) => {
        if (rawMode === "chat" && !isChatOnlyLine(line)) return false;
        if (rawSource !== "all" && classifyRawSource(line) !== rawSource) return false;
        if (!needle) return true;
        return String(line).toLowerCase().includes(needle);
      })
      .map((line) => formatRawLine(line));

    renderLines(rawEl, filtered);
  }

  async function syncChatOnlyRawFromServer() {
    try {
      const resp = await fetch("/api/logs?mode=chat_only&limit=200", { method: "GET" });
      if (!resp.ok) return;
      const data = await resp.json().catch(() => ({}));
      const items = Array.isArray(data?.items) ? data.items : [];
      const lines = items
        .map((item) => {
          const role = String(item?.role || item?.actor_type || "chat");
          const actor = String(item?.actor || "").trim();
          const content = String(item?.content || "").trim();
          const speaker = actor ? `${role}/${actor}` : role;
          return content ? `${speaker}: ${content}` : "";
        })
        .filter(Boolean);
      if (!lines.length) return;
      rawLines.length = 0;
      for (const line of lines.slice(-rawCap)) rawLines.push(line);
      renderRawStream();
    } catch { }
  }

  function setStatus(text, kind) {
    statusEl.textContent = text;
    statusEl.style.color = kind === "good" ? "var(--good)" : kind === "bad" ? "var(--bad)" : "var(--muted)";
    markAvatarActive("bigboss");
    emitBridge("innova:status", { status: text, kind: kind || "neutral" });
  }

  function markAvatarActive(name) {
    if (!avatarStrip) return;
    const target = String(name || "").trim().toLowerCase();
    const pills = avatarStrip.querySelectorAll(".avatar-pill");
    pills.forEach((el) => el.classList.remove("avatar-pill--active"));
    const selected = avatarStrip.querySelector(`.avatar-pill[data-avatar="${target}"]`);
    if (selected) selected.classList.add("avatar-pill--active");
  }

  function inferAvatarFromActivity(entry) {
    const role = String(entry?.role || "").toLowerCase();
    const actor = String(entry?.actor || "").toLowerCase();
    const detail = `${role} ${actor} ${String(entry?.title || "").toLowerCase()} ${String(entry?.detail || "").toLowerCase()}`;
    if (detail.includes("quality") || detail.includes("qe") || detail.includes("gravity")) return "qe";
    if (detail.includes("dev") || detail.includes("cross") || detail.includes("คร๊อส")) return "dev";
    if (detail.includes("sa") || detail.includes("analyst") || detail.includes("วิทย์")) return "sa";
    return "bigboss";
  }

  function updateNewBadge() {
    if (!newBadge) return;
    newBadge.textContent = `${unseenCount} new`;
    if (unseenCount > 0) newBadge.classList.add("pulse");
    else newBadge.classList.remove("pulse");
    if (kpiAlerts) kpiAlerts.textContent = String(alertCount);
  }

  function notifyNewEvent(title, body) {
    if (!notificationEnabled) return;
    if (Notification.permission !== "granted") return;
    try {
      new Notification(title, { body, silent: soundMuted });
    } catch { }
  }

  function beep() {
    if (soundMuted) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.value = 0.02;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, 120);
    } catch { }
  }

  function humanizeAILog(rawEvent) {
    const src = typeof rawEvent === "string"
      ? { message: rawEvent }
      : (rawEvent && typeof rawEvent === "object" ? rawEvent : { message: String(rawEvent || "") });

    const topic = String(src.topic || src.type || src.label || src.kind || "").toLowerCase();
    const title = String(src.title || src.task || "");
    const detail = String(src.detail || src.message || src.status || "");
    const tool = String(src.tool || "").toLowerCase();
    const text = `${topic} ${title} ${detail} ${tool}`.toLowerCase();

    if (text.includes("file_write") || text.includes("workspace_write") || text.includes("apply_patch")) return "🤖 AI is updating workspace files...";
    if (text.includes("tool_call") || text.includes("tools/call") || tool) return "🛠️ AI is running a tool...";
    if (text.includes("progress") || text.includes("running") || text.includes("queued")) return "⏳ AI task is in progress...";
    if (text.includes("error") || text.includes("failed") || text.includes("exception")) return "⚠️ AI hit an issue and is retrying...";
    if (text.includes("connect") || text.includes("sse") || text.includes("websocket")) return "🔌 AI control stream is syncing...";
    if (text.includes("chat") || text.includes("reply") || text.includes("ask_local_ai")) return "💬 AI is responding in chat...";
    return "📡 AI event received";
  }

  function appendMsg(role, text) {
    const row = document.createElement("div");
    row.className = `msg ${role}`;

    const bubble = document.createElement("div");
    bubble.className = "msg__bubble";

    const meta = document.createElement("div");
    meta.className = "msg__meta";

    const who = document.createElement("span");
    who.className = "msg__who";
    who.textContent = role === "bot" ? "AI" : "You";

    const ts = document.createElement("span");
    ts.className = "msg__time";
    ts.textContent = new Date().toLocaleTimeString();

    meta.appendChild(who);
    meta.appendChild(ts);

    const body = document.createElement("div");
    body.className = "msg__text";

    if (role === "bot") {
      const tam = String(ecsAppliedTam || "Constructive/Curiosity");
      const compact = tam.toLowerCase().includes("empath") ? "Empathetic" : tam;
      body.textContent = `${humanizeAILog({ kind: "chat", detail: text })} ${text} [ECS: ${compact}]`;
    } else {
      body.textContent = text;
    }

    bubble.appendChild(meta);
    bubble.appendChild(body);
    row.appendChild(bubble);
    chatEl.appendChild(row);
    try {
      chatEl.scrollTo({ top: chatEl.scrollHeight, behavior: "smooth" });
    } catch {
      chatEl.scrollTop = chatEl.scrollHeight;
    }
  }

  function lineAvatarLabel(entry) {
    const actor = String(entry?.actor || "").trim();
    const role = String(entry?.role || "").trim();
    const client = String(entry?.client || "").trim();
    const source = actor || role || client || "AI";
    const compact = source.replace(/[^A-Za-z0-9]/g, "");
    return (compact.slice(0, 2) || "AI").toUpperCase();
  }

  function lineSpeakerName(entry) {
    return String(entry?.actor || entry?.role || entry?.client || "AI Agent");
  }

  function isLineConversationEvent(entry) {
    const kind = String(entry?.kind || "").toLowerCase();
    const label = String(entry?.label || "").toLowerCase();
    if (kind === "user" || kind === "bot") return true;
    if (label === "process" || label === "chat" || label === "reply" || label === "mcp") return true;
    return false;
  }

  function deriveLineTimelineRows() {
    const rows = [];
    for (const ev of activity) {
      if (!isLineConversationEvent(ev)) continue;
      const project = String(ev.project || "unknown-project");
      if (lineChatProjectValue !== "all" && project !== lineChatProjectValue) continue;
      const text = String(ev.detail || ev.title || "").trim();
      if (!text) continue;
      rows.push({
        side: String(ev.kind || "").toLowerCase() === "bot" ? "bot" : "user",
        project,
        timestamp: String(ev.timestamp || ""),
        name: lineSpeakerName(ev),
        avatar: lineAvatarLabel(ev),
        color: colorFromEntity(lineSpeakerName(ev)),
        text,
        ecs: String(ecsAppliedTam || "Constructive/Curiosity"),
      });
    }
    return rows.slice(-80);
  }

  function renderLineTimeline() {
    if (!lineThread) return;
    const rows = deriveLineTimelineRows();
    const nearBottom = lineThread.scrollHeight - (lineThread.scrollTop + lineThread.clientHeight) <= 42;

    if (!rows.length) {
      lineThread.innerHTML = '<div class="line-thread__empty">ยังไม่มีบทสนทนา AI ที่ตรงกับตัวกรอง โปรดลองกด Connect และเลือกโปรเจกต์ innomcp</div>';
      return;
    }

    lineThread.innerHTML = rows.map((row) => {
      const mine = row.side === "user";
      const cls = mine ? "line-msg line-msg--mine" : "line-msg";
      const ecsBadge = row.side === "bot"
        ? `<span class="line-msg__ecs">[ECS: ${escapeHtml(String(row.ecs || "Constructive/Curiosity").toLowerCase().includes("empath") ? "Empathetic" : row.ecs)}]</span>`
        : "";
      const bubble = `
        <div class="line-msg__bubble">
          <div class="line-msg__meta">
            <span class="line-msg__name">${escapeHtml(row.name)}</span>
            <span class="line-msg__time">${escapeHtml(row.timestamp || "-")}</span>
            <span class="line-msg__project">${escapeHtml(row.project)}</span>
            ${ecsBadge}
          </div>
          <p class="line-msg__text">${escapeHtml(row.text)}</p>
        </div>
      `;
      const avatar = `<div class="line-msg__avatar" style="background:${escapeHtml(row.color)}">${escapeHtml(row.avatar)}</div>`;
      return mine ? `<div class="${cls}">${bubble}${avatar}</div>` : `<div class="${cls}">${avatar}${bubble}</div>`;
    }).join("");

    if (nearBottom) {
      try {
        lineThread.scrollTo({ top: lineThread.scrollHeight, behavior: "smooth" });
      } catch {
        lineThread.scrollTop = lineThread.scrollHeight;
      }
    }
  }

  function scoreColor(score) {
    if (score >= 80) return "#34d399";
    if (score >= 60) return "#fbbf24";
    return "#f87171";
  }

  function makeScore(total, errors, lastAtMs) {
    const safeTotal = Math.max(1, total);
    const errorRate = errors / safeTotal;
    const staleMin = lastAtMs ? (Date.now() - lastAtMs) / 60000 : 999;
    let score = 100 - errorRate * 70;
    if (staleMin > 10) score -= Math.min(30, (staleMin - 10) * 1.5);
    if (total > 20) score += 5;
    return Math.round(clamp(score, 0, 100));
  }

  function toTsMs(timestamp) {
    if (!timestamp) return 0;
    const d = new Date(timestamp.replace(" ", "T"));
    if (Number.isNaN(d.getTime())) return 0;
    return d.getTime();
  }

  function collectInsights() {
    const projects = new Map();
    const teams = new Map();
    const agents = new Map();

    const ensureNode = (map, key) => {
      if (!map.has(key)) {
        map.set(key, { key, total: 0, errors: 0, ok: 0, lastAt: 0 });
      }
      return map.get(key);
    };

    for (const ev of activity) {
      const isTrack = ev.kind === "tool_call" || ev.kind === "tool_result" || ev.kind === "error";
      if (!isTrack) continue;

      const p = ev.project || "unknown-project";
      const t = ev.client || "unknown-team";
      const a = ev.actor || ev.role || ev.session || "unknown-ai";
      const at = ev.timeMs || 0;

      const pNode = ensureNode(projects, p);
      const tNode = ensureNode(teams, `${p}::${t}`);
      const aNode = ensureNode(agents, `${p}::${t}::${a}`);

      for (const node of [pNode, tNode, aNode]) {
        node.total += 1;
        node.lastAt = Math.max(node.lastAt, at);
      }

      const isError = ev.kind === "error" || ev.status === "error";
      if (isError) {
        pNode.errors += 1;
        tNode.errors += 1;
        aNode.errors += 1;
      } else if (ev.kind === "tool_result" && ev.status === "ok") {
        pNode.ok += 1;
        tNode.ok += 1;
        aNode.ok += 1;
      }
    }

    const toArray = (map, split = false) => {
      const out = [];
      for (const value of map.values()) {
        const score = makeScore(value.total, value.errors, value.lastAt);
        if (!split) {
          out.push({ ...value, score });
          continue;
        }
        const parts = value.key.split("::");
        out.push({ ...value, score, project: parts[0], team: parts[1], agent: parts[2] });
      }
      return out.sort((a, b) => b.score - a.score || b.total - a.total);
    };

    return {
      projects: toArray(projects),
      teams: toArray(teams, true),
      agents: toArray(agents, true),
    };
  }

  function renderScoreList(target, rows, kind) {
    if (!target) return;
    target.innerHTML = "";
    const limited = rows.slice(0, 24);
    if (!limited.length) {
      const empty = document.createElement("div");
      empty.className = "score-empty";
      empty.textContent = "No data yet";
      target.appendChild(empty);
      return;
    }
    for (const row of limited) {
      const item = document.createElement("div");
      item.className = "score-item";
      item.style.setProperty("--score-color", scoreColor(row.score));

      const top = document.createElement("div");
      top.className = "score-top";
      const name = document.createElement("div");
      name.className = "score-name";
      if (kind === "project") name.textContent = row.key;
      if (kind === "team") name.textContent = `${row.team || "unknown-team"} @ ${row.project || "unknown-project"}`;
      if (kind === "agent") name.textContent = `${row.agent || "unknown-ai"} @ ${row.team || "unknown-team"}`;

      const value = document.createElement("div");
      value.className = "score-value";
      value.textContent = `${row.score}`;

      top.appendChild(name);
      top.appendChild(value);

      const sub = document.createElement("div");
      sub.className = "score-sub";
      sub.textContent = `total ${row.total} | ok ${row.ok} | error ${row.errors}`;

      item.appendChild(top);
      item.appendChild(sub);
      target.appendChild(item);
    }
  }

  function refreshProjectSelectors(projects) {
    const names = ["all", ...projects.map((p) => p.key)];

    const rebuild = (sel, placeholder) => {
      if (!sel) return;
      const current = sel.value;
      sel.innerHTML = "";
      if (placeholder) {
        const op0 = document.createElement("option");
        op0.value = "";
        op0.textContent = placeholder;
        sel.appendChild(op0);
      }
      for (const n of names) {
        if (n === "all" && placeholder) continue;
        const op = document.createElement("option");
        op.value = n;
        op.textContent = n === "all" ? "All Projects" : n;
        sel.appendChild(op);
      }
      if ([...sel.options].some((o) => o.value === current)) sel.value = current;
      else if (!placeholder) sel.value = "all";
    };

    rebuild(projectFilter, null);
    rebuild(projectSelect, "Select project");
    rebuild(lineProjectFilter, null);
    rebuild(focusProjectSelect, null);
  }

  function renderProjectDetail(insights) {
    if (!projectSummary || !projectTeamList || !projectAgentList) return;
    if (!selectedProject) {
      projectSummary.textContent = "เลือก project เพื่อดูรายละเอียด team และ AI";
      projectTeamList.innerHTML = "";
      projectAgentList.innerHTML = "";
      return;
    }

    const p = insights.projects.find((x) => x.key === selectedProject);
    if (!p) {
      projectSummary.textContent = `ไม่พบข้อมูล project: ${selectedProject}`;
      projectTeamList.innerHTML = "";
      projectAgentList.innerHTML = "";
      return;
    }

    projectSummary.innerHTML = `
      <div><strong>${selectedProject}</strong> • score <strong style="color:${scoreColor(p.score)}">${p.score}</strong></div>
      <div class="small">total ${p.total} | ok ${p.ok} | error ${p.errors}</div>
    `;

    const teams = insights.teams.filter((x) => x.project === selectedProject);
    const agents = insights.agents.filter((x) => x.project === selectedProject);
    renderScoreList(projectTeamList, teams, "team");
    renderScoreList(projectAgentList, agents, "agent");
  }

  function parseProjectProgressProject(rawProject, text) {
    if (rawProject && rawProject !== "-") return String(rawProject);
    const src = String(text || "");
    const m = src.match(/project\s*[:=]\s*([a-zA-Z0-9_.-]+)/i);
    return m ? m[1] : "workspace";
  }

  function recordProjectProgress(entry) {
    const task = String(entry?.task || entry?.title || "Background Task").trim() || "Background Task";
    const status = String(entry?.status || "running").trim() || "running";
    const message = String(entry?.message || entry?.detail || "").trim();
    const role = String(entry?.role || entry?.actor || "-");
    const project = parseProjectProgressProject(entry?.project, `${task} ${message}`);
    const ts = Date.now();
    const key = `${project}::${task}`;

    projectProgressByKey.set(key, {
      key,
      project,
      task,
      status,
      message,
      role,
      updatedAt: ts,
    });
    projectProgressSeeded = false;
    renderProjectProgress();
  }

  function seedProjectProgressFallback() {
    if (projectProgressByKey.size > 0 || projectProgressSeeded) return;
    projectProgressSeeded = true;
    const now = Date.now();
    const sample = [
      { project: "innova-bot-template", task: "UI layout verification", status: "running", role: "SA", message: "checking menu/panel overflow and interaction", updatedAt: now - 90 * 1000 },
      { project: "innova-bot-template", task: "Security Center health", status: "ready", role: "Dev", message: "audit stream lazy-init standby", updatedAt: now - 65 * 1000 },
      { project: "workspace", task: "Progress pipeline", status: "ready", role: "QE", message: "waiting for TASK_PROGRESS events", updatedAt: now - 40 * 1000 },
    ];
    sample.forEach((row) => {
      const key = `${row.project}::${row.task}`;
      projectProgressByKey.set(key, { key, ...row });
    });
  }

  function renderProjectProgress() {
    if (!projectProgressSummary || !projectProgressList) return;
    if (!projectProgressByKey.size) {
      seedProjectProgressFallback();
    }
    const rows = Array.from(projectProgressByKey.values()).sort((a, b) => b.updatedAt - a.updatedAt);
    if (!rows.length) {
      projectProgressSummary.textContent = "waiting for progress events...";
      projectProgressList.innerHTML = '<div class="progress-empty">No progress signals yet</div>';
      return;
    }

    const projectCounts = new Map();
    for (const row of rows) {
      projectCounts.set(row.project, (projectCounts.get(row.project) || 0) + 1);
    }
    const projectText = Array.from(projectCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => `${name}:${count}`)
      .join(" | ");
    projectProgressSummary.textContent = `tracked tasks ${rows.length} | projects ${projectCounts.size} | ${projectText}`;

    projectProgressList.innerHTML = rows
      .slice(0, 60)
      .map((row) => {
        const t = new Date(row.updatedAt).toLocaleTimeString();
        const badge = String(row.status || "running").toLowerCase().replace(/[^a-z0-9_-]/g, "-");
        return `
          <div class="progress-item">
            <div class="progress-item__top">
              <span class="progress-project">${escapeHtml(row.project)}</span>
              <span class="progress-status progress-status--${escapeHtml(badge)}">${escapeHtml(row.status)}</span>
            </div>
            <div class="progress-task">${escapeHtml(row.task)}</div>
            <div class="progress-meta">role ${escapeHtml(row.role || "-")} | ${escapeHtml(t)}</div>
            ${row.message ? `<div class="progress-message">${escapeHtml(row.message)}</div>` : ""}
          </div>
        `;
      })
      .join("");
  }

  function captureProgressFromActivity(entry) {
    if (!entry) return;
    const label = String(entry.label || "").toLowerCase();
    const title = String(entry.title || "");
    const detail = String(entry.detail || "");
    const bag = `${title} ${detail}`.toLowerCase();
    const looksProgress =
      label === "progress" ||
      /task_progress|project progress|\bprogress\b|\bdone\b|\bcompleted\b|\brunning\b|in_progress/.test(bag);
    if (!looksProgress) return;

    let parsed = null;
    const jsonStart = detail.indexOf("{");
    if (jsonStart >= 0) {
      try {
        parsed = JSON.parse(detail.slice(jsonStart));
      } catch {
        parsed = null;
      }
    }

    recordProjectProgress({
      project: parsed?.project || entry.project,
      task: parsed?.task_ref || parsed?.task || title,
      status: parsed?.status || entry.status || "running",
      message: parsed?.message || detail,
      role: parsed?.role || entry.role || entry.actor,
    });
  }

  function renderInsights() {
    let insights = collectInsights();
    const noLocalInsights = !insights.projects.length && !insights.teams.length && !insights.agents.length;

    if (noLocalInsights && Array.isArray(insightSeedRows) && insightSeedRows.length) {
      const projectMap = new Map();
      const teamMap = new Map();
      const agentMap = new Map();

      const ensureNode = (map, key) => {
        if (!map.has(key)) {
          map.set(key, { key, total: 0, errors: 0, ok: 0, lastAt: 0 });
        }
        return map.get(key);
      };

      for (const row of insightSeedRows) {
        const project = String(row?.project || "unknown-project");
        const source = String(row?.source_role || "system");
        const target = String(row?.target_role || "unknown-role");
        const topic = String(row?.topic || "event").toLowerCase();
        const lastAt = toTsMs(row?.published_at || "");
        const isError = topic.includes("fail") || topic.includes("error") || topic.includes("reject") || topic.includes("expired");

        const pNode = ensureNode(projectMap, project);
        const srcTeam = ensureNode(teamMap, `${project}::${source}`);
        const dstTeam = ensureNode(teamMap, `${project}::${target}`);
        const srcAgent = ensureNode(agentMap, `${project}::${source}::${source}`);
        const dstAgent = ensureNode(agentMap, `${project}::${target}::${target}`);

        for (const node of [pNode, srcTeam, dstTeam, srcAgent, dstAgent]) {
          node.total += 1;
          node.lastAt = Math.max(node.lastAt, lastAt);
          if (isError) node.errors += 1;
          else node.ok += 1;
        }
      }

      const toArray = (map, split = false) => {
        const out = [];
        for (const value of map.values()) {
          const score = makeScore(value.total, value.errors, value.lastAt);
          if (!split) {
            out.push({ ...value, score });
            continue;
          }
          const parts = value.key.split("::");
          out.push({ ...value, score, project: parts[0], team: parts[1], agent: parts[2] });
        }
        return out.sort((a, b) => b.score - a.score || b.total - a.total);
      };

      insights = {
        projects: toArray(projectMap),
        teams: toArray(teamMap, true),
        agents: toArray(agentMap, true),
      };
    }

    refreshProjectSelectors(insights.projects);

    if (kpiProjects) kpiProjects.textContent = String(insights.projects.length);
    if (kpiTeams) kpiTeams.textContent = String(insights.teams.length);
    if (kpiAgents) kpiAgents.textContent = String(insights.agents.length);

    renderScoreList(projectScoreList, insights.projects, "project");
    renderScoreList(teamScoreList, insights.teams, "team");
    renderScoreList(agentScoreList, insights.agents, "agent");
    renderProjectDetail(insights);

    if (projectSummary && !selectedProject && !insights.projects.length) {
      const ageSec = insightSeedLoadedAt ? Math.max(0, Math.round((Date.now() - insightSeedLoadedAt) / 1000)) : 0;
      projectSummary.textContent = ageSec
        ? `ยังไม่มี tool activity โดยตรง (fallback จาก network ล่าสุด ${ageSec}s)`
        : "ยังไม่มีข้อมูล activity/network";
    }
  }

  async function refreshInsightSeed() {
    try {
      const resp = await fetch("/api/network/recent?limit=500", { method: "GET" });
      if (!resp.ok) return;
      const data = await resp.json().catch(() => ({}));
      const items = Array.isArray(data?.items) ? data.items : [];
      insightSeedRows = items;
      insightSeedLoadedAt = Date.now();
      renderInsights();
    } catch { }
  }

  function renderActivity() {
    if (!activityEl) return;
    activityEl.innerHTML = "";

    const visible = [];
    for (const ev of activity) {
      const kind = ev.kind || "system";
      const f = activityFilterValue;
      const isToolKind = kind === "tool" || kind === "tool_call" || kind === "tool_result";
      if (f !== "all") {
        if (f === "tool" && !isToolKind) continue;
        if (f !== "tool" && kind !== f) continue;
      }
      if (projectFilterValue !== "all") {
        if ((ev.project || "unknown-project") !== projectFilterValue) continue;
      }

      if (activitySearchValue) {
        const hay = [
          ev.title,
          ev.detail,
          ev.project,
          ev.client,
          ev.actor,
          ev.role,
          ev.request_id,
          ev.status,
        ].join(" ").toLowerCase();
        if (!hay.includes(activitySearchValue)) continue;
      }

      visible.push(ev);
    }

    if (activitySortValue === "latest") {
      visible.sort((a, b) => (b.timeMs || 0) - (a.timeMs || 0));
    } else if (activitySortValue === "oldest") {
      visible.sort((a, b) => (a.timeMs || 0) - (b.timeMs || 0));
    } else {
      visible.sort((a, b) => {
        const ae = (a.kind === "error" || a.status === "error") ? 1 : 0;
        const be = (b.kind === "error" || b.status === "error") ? 1 : 0;
        if (ae !== be) return be - ae;
        return (b.timeMs || 0) - (a.timeMs || 0);
      });
    }

    const toolCount = visible.filter((ev) => ["tool", "tool_call", "tool_result"].includes(String(ev.kind || ""))).length;
    const errCount = visible.filter((ev) => ev.kind === "error" || ev.status === "error").length;
    if (activitySummary) activitySummary.textContent = `events: ${visible.length} • errors: ${errCount} • tools: ${toolCount}`;

    if (!visible.length) {
      activityEl.innerHTML = '<div class="activity-empty">No activity matches current filters.</div>';
      renderLineTimeline();
      renderInsights();
      return;
    }

    for (const ev of visible) {
      const eventKind = ev.kind || "system";

      const item = document.createElement("div");
      item.className = "activity-item";
      if (Date.now() - (ev.createdAt || 0) < 4000) item.classList.add("activity-item--new");

      const meta = document.createElement("div");
      meta.className = "activity-item__meta";

      const tsEl = document.createElement("div");
      tsEl.className = "small mono";
      tsEl.textContent = ev.timestamp;

      const pill = document.createElement("div");
      const pillKind = eventKind;
      let pillClass = "pill--system";
      if (pillKind === "user") pillClass = "pill--user";
      else if (pillKind === "bot") pillClass = "pill--bot";
      else if (pillKind === "tool" || pillKind === "tool_call" || pillKind === "tool_result") pillClass = "pill--tool";
      else if (pillKind === "error") pillClass = "pill--error";
      pill.className = `pill ${pillClass}`;
      pill.textContent = (ev.label || pillKind).toUpperCase();

      const entityName = ev.actor || ev.client || ev.role || ev.session;
      const entityPill = document.createElement("div");
      entityPill.className = "pill pill--entity";
      entityPill.style.setProperty("--entity-color", colorFromEntity(entityName || "system"));
      entityPill.textContent = (entityName || "system").slice(0, 24);

      meta.appendChild(tsEl);
      meta.appendChild(pill);
      meta.appendChild(entityPill);

      const title = document.createElement("div");
      title.className = "activity-item__title";
      title.textContent = ev.title || ev.humanMessage || "";

      const detail = document.createElement("div");
      detail.className = "activity-item__detail";
      if (ev.detail) detail.textContent = ev.detail;
      else if (ev.humanMessage) detail.textContent = ev.humanMessage;

      item.appendChild(meta);
      item.appendChild(title);
      if (ev.detail || ev.humanMessage) item.appendChild(detail);

      const tags = document.createElement("div");
      tags.className = "meta-tags";
      const pushTag = (text, cls = "") => {
        if (!text) return;
        const tag = document.createElement("span");
        tag.className = `meta-tag ${cls}`.trim();
        tag.textContent = text;
        tags.appendChild(tag);
      };

      pushTag(ev.project || "unknown-project");
      pushTag(ev.client || "unknown-team");
      if (ev.status) pushTag(`status=${ev.status}`, ev.status === "ok" ? "status-ok" : ev.status === "error" ? "status-error" : "");
      if (ev.duration_ms) pushTag(`${ev.duration_ms}ms`);
      if (ev.request_id) pushTag(`id=${ev.request_id}`);
      item.appendChild(tags);

      activityEl.appendChild(item);
    }

    try {
      activityEl.scrollTo({ top: activityEl.scrollHeight, behavior: "smooth" });
    } catch {
      activityEl.scrollTop = activityEl.scrollHeight;
    }
    renderLineTimeline();
    renderInsights();
  }

  let activityRenderQueued = false;
  function scheduleActivityRender() {
    if (activityRenderQueued) return;
    activityRenderQueued = true;
    const flush = () => {
      activityRenderQueued = false;
      renderActivity();
    };
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(flush);
    } else {
      setTimeout(flush, 16);
    }
  }

  function pushActivity(entry, source = "local") {
    const now = new Date();
    const ts = now.toISOString().split("T")[1].replace("Z", "").slice(0, 8);
    const full = {
      timestamp: ts,
      createdAt: Date.now(),
      timeMs: Date.now(),
      source,
      ...entry,
    };
    full.humanMessage = humanizeAILog(full);
    activity.push(full);
    if (activity.length > activityCap) activity.splice(0, activity.length - activityCap);

    const isAlertType = full.kind === "error" || full.status === "error";
    if (isAlertType) alertCount += 1;

    markAvatarActive(inferAvatarFromActivity(full));

    if (source === "server" && document.hidden) {
      unseenCount += 1;
      updateNewBadge();
      notifyNewEvent(full.title || "New log activity", (full.detail || full.humanMessage || "").slice(0, 140));
      beep();
    }

    emitBridge("innova:activity", {
      kind: full.kind || "system",
      title: full.title || "",
      source: full.source || source,
      status: full.status || "",
    });

    captureProgressFromActivity(full);

    renderOpsProcessPanel();
    scheduleActivityRender();
  }

  function resolveEndpoint(sseUrl, endpointData) {
    const data = (endpointData || "").trim();
    if (!data) return null;
    if (data.startsWith("http://") || data.startsWith("https://")) return data;

    // If server returns relative path, resolve against SSE origin.
    const u = new URL(sseUrl, window.location.href);
    return new URL(data, u.origin).toString();
  }

  function parseMaybeJson(text) {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function hitlBaseUrl() {
    return window.location.origin;
  }

  function shortOutput(text, maxLen = 240) {
    const normalized = String(text || "").replace(/\s+/g, " ").trim();
    if (!normalized) return "";
    if (normalized.length <= maxLen) return normalized;
    return `${normalized.slice(0, maxLen)}…`;
  }

  function setHitlCopyMessage(message, isError = false) {
    if (!hitlCopyStatus) return;
    if (hitlCopyStatusTimer) {
      clearTimeout(hitlCopyStatusTimer);
      hitlCopyStatusTimer = null;
    }
    hitlCopyStatus.textContent = message || "";
    hitlCopyStatus.classList.remove("status-ok", "status-error");
    if (message) hitlCopyStatus.classList.add(isError ? "status-error" : "status-ok");
    if (message) {
      hitlCopyStatusTimer = setTimeout(() => {
        hitlCopyStatus.textContent = "";
        hitlCopyStatus.classList.remove("status-ok", "status-error");
      }, 2400);
    }
  }

  async function copyTextToClipboard(text) {
    const value = String(text || "");
    if (!value.trim()) throw new Error("empty text");

    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        return;
      } catch { }
    }

    const ta = document.createElement("textarea");
    ta.value = value;
    ta.setAttribute("readonly", "readonly");
    ta.style.position = "fixed";
    ta.style.left = "-10000px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      const ok = document.execCommand("copy");
      if (!ok) throw new Error("copy command failed");
    } finally {
      document.body.removeChild(ta);
    }
  }

  function renderHitl(items, stats) {
    if (!hitlList || !hitlStats) return;

    hitlItemsById.clear();
    for (const item of items || []) {
      const approvalId = String(item?.id || "").trim();
      if (approvalId) hitlItemsById.set(approvalId, item);
    }

    const summary = stats || {};
    hitlStats.textContent = `queue: pending=${summary.pending || 0} approved=${summary.approved || 0} rejected=${summary.rejected || 0} expired=${summary.expired || 0}`;

    if (!Array.isArray(items) || items.length === 0) {
      hitlList.innerHTML = '<div class="hitl-empty">No approvals found.</div>';
      return;
    }

    hitlList.innerHTML = items
      .map((item) => {
        const approvalIdRaw = String(item.id || "-");
        const approvalId = escapeHtml(item.id || "-");
        const status = escapeHtml(item.status || "unknown");
        const cmd = escapeHtml([item.cmd || "", ...(Array.isArray(item.args) ? item.args : [])].join(" ").trim());
        const reason = escapeHtml(item.reason || "-");
        const created = escapeHtml(item.created_at || "-");
        const expires = escapeHtml(item.expires_at || "-");
        const execution = item.execution && typeof item.execution === "object" ? item.execution : null;
        const executionStdoutRaw = execution ? String(execution.stdout || "") : "";
        const executionStderrRaw = execution ? String(execution.stderr || execution.error || "") : "";
        const executionStatus = execution ? (execution.ok ? "ok" : "failed") : "not-run";
        const executionExit = execution && execution.exit_code != null ? String(execution.exit_code) : "-";
        const stdoutShort = execution ? shortOutput(executionStdoutRaw) : "";
        const stderrShort = execution ? shortOutput(executionStderrRaw) : "";
        const hasExecutionOutput = Boolean(executionStdoutRaw.trim() || executionStderrRaw.trim());
        const isExpanded = hasExecutionOutput && hitlExpanded.has(approvalIdRaw);
        const canResolve = String(item.status || "").toLowerCase() === "pending";

        return `
          <div class="hitl-item" data-approval-id="${approvalId}">
            <div class="hitl-item__head">
              <div class="hitl-item__cmd">${cmd || "(empty command)"}</div>
              <span class="hitl-status status-${status}">${status}</span>
            </div>
            <div class="hitl-item__meta">id=${approvalId}</div>
            <div class="hitl-item__meta">reason: ${reason}</div>
            <div class="hitl-item__meta">created: ${created} • expires: ${expires}</div>
            <div class="hitl-item__meta">execution: ${escapeHtml(executionStatus)} • exit=${escapeHtml(executionExit)}</div>
            ${stdoutShort ? `<div class="hitl-item__io"><span class="hitl-item__io-label">stdout</span>: ${escapeHtml(stdoutShort)}</div>` : ""}
            ${stderrShort ? `<div class="hitl-item__io"><span class="hitl-item__io-label">stderr</span>: ${escapeHtml(stderrShort)}</div>` : ""}
            <div class="hitl-actions">
              <button class="secondary hitl-approve" ${canResolve ? "" : "disabled"}>Approve</button>
              <button class="secondary hitl-approve-exec" ${canResolve ? "" : "disabled"}>Execute after Approve</button>
              <button class="secondary hitl-reject" ${canResolve ? "" : "disabled"}>Reject</button>
              ${executionStdoutRaw.trim() ? `<button class="secondary hitl-copy-stdout">Copy stdout</button>` : ""}
              ${executionStderrRaw.trim() ? `<button class="secondary hitl-copy-stderr">Copy stderr</button>` : ""}
              ${execution ? `<button class="secondary hitl-copy-json">Copy execution JSON</button>` : ""}
              ${hasExecutionOutput ? `<button class="secondary hitl-expand">${isExpanded ? "Collapse output" : "Expand output"}</button>` : ""}
            </div>
            ${hasExecutionOutput ? `
              <div class="hitl-output-full ${isExpanded ? "show" : ""}">
                ${executionStdoutRaw.trim() ? `<div class="hitl-item__io"><span class="hitl-item__io-label">stdout(full)</span>: ${escapeHtml(executionStdoutRaw)}</div>` : ""}
                ${executionStderrRaw.trim() ? `<div class="hitl-item__io"><span class="hitl-item__io-label">stderr(full)</span>: ${escapeHtml(executionStderrRaw)}</div>` : ""}
              </div>
            ` : ""}
          </div>
        `;
      })
      .join("");
  }

  async function fetchHitlQueue() {
    if (!hitlList) return;
    const showAll = (hitlScope?.value || "pending") === "all";
    const url = `${hitlBaseUrl()}/api/hitl/pending${showAll ? "?all=true" : ""}`;
    try {
      const resp = await fetch(url, { method: "GET" });
      const data = await resp.json();
      if (!resp.ok || !data?.ok) {
        throw new Error(data?.error || `HTTP ${resp.status}`);
      }
      renderHitl(data.items || [], data.stats || {});
    } catch (e) {
      hitlList.innerHTML = `<div class="hitl-empty">Failed to load queue: ${escapeHtml(String(e?.message ?? e))}</div>`;
    }
  }

  async function resolveHitl(approvalId, action, executeAfterApprove = false) {
    const url = `${hitlBaseUrl()}/api/hitl/${encodeURIComponent(approvalId)}/resolve`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, resolver: "gui", execute_after_approve: executeAfterApprove }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || !data?.ok) {
      throw new Error(data?.error || `HTTP ${resp.status}`);
    }
    return data;
  }

  function normalizeSingleResult(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) return value;
    if (value?.result && typeof value.result === "object") return value.result;
    if (value?.structuredContent && typeof value.structuredContent === "object") return value.structuredContent;
    return null;
  }

  function aiDiagClass(route) {
    const txt = String(route || "").toLowerCase();
    if (txt.includes("degraded") || txt.includes("unconfigured")) return "ai-diag--bad";
    if (txt.includes("stub") || txt.includes("custom")) return "ai-diag--warn";
    if (txt.includes("remote") || txt.includes("ask-url") || txt.includes("ollama")) return "ai-diag--good";
    return "ai-diag--warn";
  }

  function buildAiFixMap(status) {
    const fixes = {};
    const remote = status?.remote || {};
    const askUrl = status?.ask_url || {};
    const route = String(status?.selected_route || "").toLowerCase();
    const model = String(status?.ollama_model || "").trim();
    const commands = Array.isArray(status?.commands) ? status.commands : [];
    const serverFixes = (status && typeof status.fix_actions === "object") ? status.fix_actions : {};

    if (remote.configured && !remote.reachable && remote.url) {
      fixes.remote = {
        label: String(serverFixes.remote?.label || "Quick Fix"),
        cmd: String(serverFixes.remote?.command_preview || `powershell -NoProfile -Command "Invoke-WebRequest -UseBasicParsing '${String(remote.url).replace(/'/g, "''")}' -TimeoutSec 8"`),
        runnable: Boolean(serverFixes.remote?.runnable ?? true),
      };
    }

    if (askUrl.configured && !askUrl.reachable && askUrl.url) {
      fixes.ask_url = {
        label: String(serverFixes.ask_url?.label || "Quick Fix"),
        cmd: String(serverFixes.ask_url?.command_preview || `powershell -NoProfile -Command "Invoke-WebRequest -UseBasicParsing '${String(askUrl.url).replace(/'/g, "''")}' -TimeoutSec 8"`),
        runnable: Boolean(serverFixes.ask_url?.runnable ?? true),
      };
    }

    if (!remote.reachable && !askUrl.reachable && (route.includes("ollama") || commands.some((c) => String(c?.kind || "").includes("ollama")))) {
      fixes.cmd = {
        label: String(serverFixes.cmd?.label || "Check Ollama"),
        cmd: String(serverFixes.cmd?.command_preview || 'powershell -NoProfile -Command "Invoke-RestMethod http://localhost:11434/api/tags -TimeoutSec 8"'),
        runnable: Boolean(serverFixes.cmd?.runnable ?? true),
      };
    }

    if (!model) {
      fixes.model = {
        label: "Set Model",
        cmd: 'setx OLLAMA_MODEL "llama3.2"',
        runnable: false,
      };
    }

    fixes.restart = {
      label: String(serverFixes.restart?.label || "Restart SSE"),
      cmd: String(serverFixes.restart?.command_preview || "cmd /c .\\start_sse.cmd"),
      runnable: false,
    };

    return fixes;
  }

  function aiCheckStateLabel(state) {
    if (state === "pass") return "PASS";
    if (state === "fail") return "FAIL";
    if (state === "warn") return "WARN";
    return "OFF";
  }

  function deriveAiChecks(status) {
    const remote = status?.remote || {};
    const askUrl = status?.ask_url || {};
    const cmd = Array.isArray(status?.commands) && status.commands.length ? String(status.commands[0]?.kind || "-") : "-";
    return [
      {
        key: "remote",
        name: "Remote",
        state: remote.configured ? (remote.reachable ? "pass" : "fail") : "off",
        detail: remote.configured ? String(remote.url || "-") : "not configured",
      },
      {
        key: "ask_url",
        name: "ASK_LOCAL_AI_URL",
        state: askUrl.configured ? (askUrl.reachable ? "pass" : "fail") : "off",
        detail: askUrl.configured ? String(askUrl.url || "-") : "not configured",
      },
      {
        key: "cmd",
        name: "CLI Adapter",
        state: cmd === "-" ? "off" : (cmd === "stub" ? "warn" : "pass"),
        detail: cmd === "-" ? "not configured" : cmd,
      },
    ];
  }

  function aiFeedbackLabel(status) {
    if (status === "rechecking") return "Re-checking…";
    if (status === "improved") return "Improved after re-check";
    if (status === "still-fail") return "Still failing after re-check";
    if (status === "error") return "Re-check failed";
    return "";
  }

  function shortFixOutput(value, maxLen = 180) {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    if (!text) return "";
    return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
  }

  const sparklineHistory = {
    wit: [2, 3, 5, 7, 8, 7, 6, 5, 4],
    cross: [1, 2, 4, 5, 8, 9, 9, 7, 4],
    gravy: [0, 1, 2, 5, 6, 8, 8, 5, 3],
    jit: [0, 1, 2, 5, 9, 9, 9, 8, 7, 4, 2, 1]
  };
  const sparkChars = [" ", " ", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

  function getSparklineString(arr) {
    return arr.map(val => {
      const idx = Math.min(sparkChars.length - 1, Math.max(0, Math.floor(val)));
      return sparkChars[idx];
    }).join("");
  }

  function updateSparklines(status) {
    const runningAgents = (status?.agents || []).filter(a => a.status === "running").map(a => a.name);
    const keys = ["wit", "cross", "gravy", "jit"];
    keys.forEach(key => {
      const hist = sparklineHistory[key] || [];
      const lastVal = hist[hist.length - 1] || 4;
      let change = (Math.random() - 0.5) * 2;
      if (key === "wit" && runningAgents.includes("sa")) change += 0.5;
      if (key === "cross" && runningAgents.includes("dev")) change += 0.5;
      if (key === "gravy" && runningAgents.includes("qe")) change += 0.5;
      if (key === "jit" && runningAgents.includes("jit")) change += 0.5;
      let nextVal = Math.min(8, Math.max(0, lastVal + change));
      hist.push(nextVal);
      if (hist.length > 15) hist.shift();
      sparklineHistory[key] = hist;
      const el = $(`${key}SkillSpark`) || (key === "jit" ? $("jitSystemSpark") : null);
      if (el) {
        el.textContent = getSparklineString(hist);
      }
    });
  }

  function renderAgentsRoster(agents) {
    const tbody = $("agentsRosterBody");
    if (!tbody) return;
    if (!agents || !Array.isArray(agents)) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--muted)">No agents active</td></tr>`;
      return;
    }
    tbody.innerHTML = agents.map(agent => {
      const statusClass = agent.status === "running" ? "status-ok" : "status-muted";
      const formatTokens = (agent.tokens || 0).toLocaleString();
      const cost = ((agent.tokens || 0) * 0.000002).toFixed(4);
      const badge = String(agent.status || "idle").toLowerCase();
      return `
        <tr>
          <td style="padding: 6px; font-weight:bold; color:var(--text);">${escapeHtml(agent.name)}</td>
          <td style="padding: 6px; color:var(--text-sec); font-size:11px;">${escapeHtml(agent.role)}</td>
          <td style="padding: 6px; color:var(--text-sec); font-family:monospace; font-size:10px;">${escapeHtml(agent.model)}</td>
          <td style="padding: 6px;">
            <span class="progress-status progress-status--${badge}" style="font-size:10px; padding:2px 6px;">${escapeHtml(agent.status)}</span>
          </td>
          <td style="padding: 6px; text-align:right; font-family:monospace; font-size:11px; color:var(--accent);">
            ${formatTokens} <span style="color:var(--text-sec); font-size:10px;">($${cost})</span>
          </td>
        </tr>
      `;
    }).join("");

    const matrix = $("agentsTaskMatrix");
    if (matrix) {
      const runningAgents = agents.filter(a => a.status === "running" || (a.task && a.task.trim() !== ""));
      if (runningAgents.length === 0) {
        matrix.innerHTML = `<div style="text-align:center;color:var(--muted);padding:8px 0;">No active tasks running in swarm.</div>`;
      } else {
        matrix.innerHTML = runningAgents.map(a => {
          const pct = a.progress || 0;
          return `
            <div style="margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px;">
              <div style="display:flex; justify-content:space-between; margin-bottom: 3px;">
                <span style="font-weight:bold; color:var(--accent);">[${escapeHtml(a.name.toUpperCase())}] ${escapeHtml(a.phase || "active")}</span>
                <span>${pct}%</span>
              </div>
              <div style="color:var(--text-sec); margin-bottom: 4px;">${escapeHtml(a.task || "Busy with routine task")}</div>
              <div style="width:100%; height:4px; background:rgba(255,255,255,0.1); border-radius:2px; overflow:hidden;">
                <div style="width:${pct}%; height:100%; background:var(--accent); transition: width 0.3s ease;"></div>
              </div>
            </div>
          `;
        }).join("");
      }
    }
  }

  function renderProjectsDev(projects) {
    const grid = $("projectsDevGrid");
    if (!grid) return;
    if (!projects || !Array.isArray(projects)) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; color:var(--muted); padding:12px;">No local projects detected.</div>`;
      return;
    }
    grid.innerHTML = projects.map(p => {
      return `
        <div class="project-dev-card">
          <div class="project-dev-card__name">📁 ${escapeHtml(p.name)}</div>
          <div class="project-dev-card__path" title="${escapeHtml(p.path)}">${escapeHtml(p.path)}</div>
          <div class="project-dev-card__progress">
            <div class="project-dev-card__progress-bar">
              <div class="project-dev-card__progress-fill" style="width: ${p.completion}%"></div>
            </div>
            <span>${p.completion}%</span>
          </div>
        </div>
      `;
    }).join("");
  }

  function runOutToggleLabel(key) {
    return aiFixRunExpandedByKey[key] ? "Hide Output" : "View Full Output";
  }

  function renderAiStatus(status) {
    if (!aiDiag || !status || typeof status !== "object") return;
    aiLastStatus = status;
    const route = String(status.selected_route || "unknown");
    const reason = String(status.selected_reason || "-");
    const remote = status.remote || {};
    const askUrl = status.ask_url || {};
    const model = String(status.ollama_model || "-");
    aiFixByKey = buildAiFixMap(status);
    const checks = deriveAiChecks(status);
    const control = (status && typeof status.control_surface === "object") ? status.control_surface : {};
    const queueDepth = Number(control.queue_depth || 0);
    const activeTask = control.active_task && typeof control.active_task === "object" ? control.active_task : null;
    const lastResponse = String(control.last_response || "").trim();
    const compactUi = window.matchMedia("(max-width: 960px)").matches || document.body.classList.contains("ribbon-compact");
    const lastResponsePreview = lastResponse.length > (compactUi ? 90 : 220)
      ? `${lastResponse.slice(0, compactUi ? 90 : 220)}…`
      : lastResponse;
    aiLastCheckedAt = new Date().toLocaleTimeString();
    aiSuggestedCommands = [String(aiFixByKey.restart?.cmd || "")].filter(Boolean);
    const hint = route.includes("degraded") || route.includes("unconfigured")
      ? "AI backend degraded. Use Quick Fix only on failed rows."
      : (route.includes("stub") ? "Running on stub fallback. Switch to Ollama/remote for real model output." : "AI backend looks healthy.");

    aiDiag.classList.remove("ai-diag--good", "ai-diag--warn", "ai-diag--bad");
    aiDiag.classList.add(aiDiagClass(route));
    aiDiag.innerHTML = `
      <div><strong>AI route:</strong> ${escapeHtml(route)} • model ${escapeHtml(model)}</div>
      <div><strong>Reason:</strong> ${escapeHtml(reason)}</div>
      <div><strong>Queue:</strong> ${escapeHtml(String(queueDepth))}${activeTask?.task_id ? ` • active ${escapeHtml(String(activeTask.task_id))}` : ""}</div>
      <div><strong>Last response:</strong> ${escapeHtml(lastResponsePreview || "-")}</div>
      <div><strong>Last check:</strong> ${escapeHtml(aiLastCheckedAt)}</div>
      <div class="ai-checks">${checks.map((row) => {
      const fix = row.state === "fail" ? aiFixByKey[row.key] : null;
      return `
        <div class="ai-check ai-check--${escapeHtml(row.state)}">
          <span class="ai-check__name">${escapeHtml(row.name)}</span>
          <span class="ai-check__pill ai-check__pill--${escapeHtml(row.state)}">${aiCheckStateLabel(row.state)}</span>
          <span class="ai-check__detail">${escapeHtml(row.detail)}</span>
          ${aiFeedbackLabel(aiFixFeedbackByKey[row.key]) ? `<span class="ai-check__feedback ai-check__feedback--${escapeHtml(String(aiFixFeedbackByKey[row.key] || ""))}">${escapeHtml(aiFeedbackLabel(aiFixFeedbackByKey[row.key]))}</span>` : ""}
          ${aiFixRunOutputByKey[row.key] ? `<span class="ai-check__runout ${aiFixRunExpandedByKey[row.key] ? "ai-check__runout--expanded" : ""}">${escapeHtml(String(aiFixRunExpandedByKey[row.key] ? (aiFixRunFullOutputByKey[row.key] || aiFixRunOutputByKey[row.key]) : aiFixRunOutputByKey[row.key]))}</span>` : ""}
          ${aiFixRunFullOutputByKey[row.key] && aiFixRunFullOutputByKey[row.key] !== aiFixRunOutputByKey[row.key] ? `<button class="secondary ai-check-toggleout" data-ai-toggleoutkey="${escapeHtml(row.key)}">${runOutToggleLabel(row.key)}</button>` : ""}
          ${fix ? `<div class="ai-check__actions"><button class="secondary ai-check-fix" data-ai-fixkey="${escapeHtml(row.key)}">${escapeHtml(fix.label || "Quick Fix")}</button>${fix.runnable ? `<button class="secondary ai-check-run" data-ai-runfixkey="${escapeHtml(row.key)}">Run Fix</button>` : ""}</div>` : ""}
        </div>
      `;
    }).join("")}</div>
      <div class="ai-diag__hint">${escapeHtml(hint)} • Hotkeys: Alt+R retry, Alt+P probe, Alt+D diagnostics</div>
      <div class="ai-diag__actions">
        <button class="secondary ai-diag-run" data-ai-action="retry-last">Retry Last</button>
        <button class="secondary ai-diag-run" data-ai-action="switch-provider">Switch Provider</button>
        <button class="secondary ai-diag-run" data-ai-action="open-diagnostics">Open Diagnostics</button>
        <button class="secondary ai-diag-run" data-ai-action="force-probe">Force Probe</button>
        <button class="secondary ai-diag-copy" data-ai-copy="0">Copy Restart Command</button>
      </div>
    `;

    if (status.agents) {
      renderAgentsRoster(status.agents);
      updateSparklines(status);
    }
    if (status.projects) {
      renderProjectsDev(status.projects);
    }
  }

  async function refreshAiStatus() {
    if (!aiDiag) return;
    try {
      const resp = await fetch("/api/ai/status", { method: "GET" });
      const data = await resp.json();
      if (!resp.ok || !data?.ok) throw new Error(data?.error || `HTTP ${resp.status}`);
      renderAiStatus(data);
      return data;
    } catch (e) {
      aiDiag.classList.remove("ai-diag--good", "ai-diag--warn");
      aiDiag.classList.add("ai-diag--bad");
      aiDiag.textContent = `AI route check failed: ${String(e?.message ?? e)}`;
      throw e;
    }
  }

  async function refreshRuntimeDiagnostics() {
    if (!rpcEndpoint || !runtimeDiag) return;
    try {
      const value = await rpc("tools/call", {
        name: "get_runtime_diagnostics",
        arguments: {},
      });
      const diag = normalizeSingleResult(value);
      if (!diag) return;

      const hist = diag.history || {};
      const canary = diag.transport_canary || {};
      const canaryStatus = String(canary.status || "unknown").toUpperCase();
      const canaryScore = Number(canary.score || 0);
      runtimeDiag.innerHTML = `
        <div><strong>Log:</strong> ${diag.log_exists ? "ready" : "missing"} • ${(Number(diag.log_size_bytes || 0) / (1024 * 1024)).toFixed(2)} MB</div>
        <div><strong>History DB:</strong> ${hist.db_exists ? "ready" : "missing"} • events ${hist.events_total || 0} • sessions ${hist.sessions_total || 0}</div>
        <div><strong>Retention:</strong> log ${diag.log_retention_days}d / ${diag.log_max_mb}MB • history ${diag.history_retention_days}d / ${diag.history_max_rows} rows</div>
        <div><strong>Transport Canary:</strong> ${canaryStatus} • score ${canaryScore}/100</div>
      `;
    } catch (e) {
      runtimeDiag.textContent = `runtime diagnostics failed: ${String(e?.message ?? e)}`;
    }
  }

  async function runMaintenanceNow() {
    if (!rpcEndpoint) return;
    try {
      const value = await rpc("tools/call", {
        name: "run_maintenance_now",
        arguments: {},
      });
      const result = normalizeSingleResult(value) || value;
      logConn(`maintenance: ${JSON.stringify(result)}`);
      await refreshRuntimeDiagnostics();
      pushActivity({ kind: "system", label: "maintenance", title: "Maintenance completed", detail: JSON.stringify(result).slice(0, 260) });
    } catch (e) {
      logConn(`maintenance failed: ${String(e?.message ?? e)}`);
      pushActivity({ kind: "error", label: "maintenance", title: "Maintenance failed", detail: String(e?.message ?? e) });
    }
  }

  function onRpcMessage(obj) {
    if (!obj || typeof obj !== "object") return;
    if (obj.id == null) return;
    const h = pending.get(obj.id);
    if (!h) return;
    pending.delete(obj.id);
    if (obj.error) h.reject(obj.error);
    else h.resolve(obj.result);
  }

  async function rpc(method, params) {
    if (!rpcEndpoint) throw new Error("RPC endpoint not ready. Connect first.");
    const id = nextId++;

    const req = { jsonrpc: "2.0", id, method, params: params ?? {} };
    logRaw(`=> ${JSON.stringify(req)}`);

    const responder = typeof window.__INNOVA_RPC_RESPONDER === "function" ? window.__INNOVA_RPC_RESPONDER : null;
    if (responder) {
      const mocked = await responder(req);
      const envelope = { jsonrpc: "2.0", id, result: mocked };
      logRaw(`<= ${JSON.stringify(envelope)}`);
      return mocked;
    }

    const waitForSse = new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`timeout waiting for response id=${id}`));
      }, 30000);
      pending.set(id, {
        resolve: (v) => {
          clearTimeout(t);
          resolve(v);
        },
        reject: (e) => {
          clearTimeout(t);
          reject(e);
        },
      });
    });

    // Many MCP-over-SSE servers ack POST quickly and deliver responses on SSE.
    // If response is returned directly, use it.
    const resp = await fetch(rpcEndpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(req),
    });

    const text = await resp.text();
    const direct = parseMaybeJson(text);
    if (direct && typeof direct === "object" && direct.id === id) {
      logRaw(`<= ${JSON.stringify(direct)}`);
      pending.delete(id);
      if (direct.error) throw direct.error;
      return direct.result;
    }

    if (text && text.trim()) logRaw(`<= (non-json) ${text.trim()}`);
    return await waitForSse;
  }

  async function notify(method, params) {
    if (!rpcEndpoint) throw new Error("RPC endpoint not ready. Connect first.");
    const req = { jsonrpc: "2.0", method, params: params ?? {} };
    logRaw(`=> ${JSON.stringify(req)}`);
    const responder = typeof window.__INNOVA_RPC_RESPONDER === "function" ? window.__INNOVA_RPC_RESPONDER : null;
    if (responder) {
      await responder(req);
      return;
    }
    const resp = await fetch(rpcEndpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(req),
    });
    const text = await resp.text();
    if (text && text.trim()) logRaw(`<= (notify) ${text.trim()}`);
  }

  if (typeof window !== "undefined") {
    window.__INNOVA_TEST_HOOKS = {
      forceConnected(endpoint = "/mock-rpc") {
        rpcEndpoint = endpoint;
        endpointEl.textContent = `POST endpoint: ${endpoint}`;
        setStatus("connected", "good");
        connectBtn.disabled = true;
        disconnectBtn.disabled = false;
        refreshToolsBtn.disabled = false;
        if (refreshRuntimeBtn) refreshRuntimeBtn.disabled = false;
        if (runMaintenanceBtn) runMaintenanceBtn.disabled = false;
        if (activityRefreshBtn) activityRefreshBtn.disabled = false;
        sendBtn.disabled = false;
      },
      setRpcResponder(responder) {
        window.__INNOVA_RPC_RESPONDER = typeof responder === "function" ? responder : null;
      },
      injectRawLine(line) {
        logRaw(String(line ?? ""));
      },
      injectActivity(entry = {}) {
        pushActivity({
          kind: String(entry.kind || "system"),
          label: String(entry.label || "mock"),
          title: String(entry.title || "Mock Event"),
          detail: String(entry.detail || ""),
          actor: String(entry.actor || "test-agent"),
          role: String(entry.role || "Dev"),
          project: String(entry.project || "workspace"),
          client: String(entry.client || "gui-e2e"),
        }, "server");
      },
    };
  }

  async function initializeAndLoadTools() {
    await rpc("initialize", {
      protocolVersion: "2024-11-05",
      clientInfo: { name: "innova-bot-gui", version: "0.1" },
      capabilities: {},
    });

    // Required by many MCP servers before further requests.
    await notify("notifications/initialized", {});

    const tools = await rpc("tools/list", {});
    const list = tools?.tools ?? tools;

    toolSelect.innerHTML = "";
    const names = [];
    if (Array.isArray(list)) {
      for (const t of list) {
        const name = t?.name;
        if (!name) continue;
        names.push(name);
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        toolSelect.appendChild(opt);
      }
    }

    emitBridge("innova:tools", { names: names.slice() });

    toolSelect.disabled = names.length === 0;
    callToolBtn.disabled = names.length === 0;
    refreshToolsBtn.disabled = false;
    if (refreshRuntimeBtn) refreshRuntimeBtn.disabled = false;
    if (runMaintenanceBtn) runMaintenanceBtn.disabled = false;
    sendBtn.disabled = false;

    logConn(`Loaded tools: ${names.join(", ")}`);
    pushActivity({
      kind: "system",
      label: "tools",
      title: "Tools loaded",
      detail: names.join(", "),
    });

    refreshRuntimeDiagnostics().catch((e) => logConn(`runtime diagnostics failed: ${String(e?.message ?? e)}`));
    refreshAiStatus().catch((e) => logConn(`ai status refresh failed: ${String(e?.message ?? e)}`));
  }

  function connect() {
    const sseUrlInput = $("sseUrl").value.trim() || "/sse";
    const sseUrl = new URL(sseUrlInput, window.location.href).toString();

    disconnect();

    setStatus("connecting", "");
    logConn(`Connecting SSE: ${sseUrl}`);
    pushActivity({ kind: "system", label: "connect", title: "Connecting to SSE", detail: sseUrl });

    es = new EventSource(sseUrl);

    if (hitlTimer) {
      clearInterval(hitlTimer);
      hitlTimer = null;
    }

    const endpointTimeout = setTimeout(() => {
      if (!rpcEndpoint) {
        setStatus("no endpoint", "bad");
        logConn("Did not receive endpoint event. Check server /sse.");
      }
    }, 5000);

    es.addEventListener("open", () => {
      setStatus("connected", "good");
      connectBtn.disabled = true;
      disconnectBtn.disabled = false;
      if (activityRefreshBtn) activityRefreshBtn.disabled = false;
      fetchHitlQueue().catch(() => { });
      hitlTimer = setInterval(() => {
        fetchHitlQueue().catch(() => { });
      }, 5000);
      refreshAiStatus().catch(() => { });
      refreshInsightSeed().catch(() => { });
      if (aiStatusTimer) clearInterval(aiStatusTimer);
      aiStatusTimer = setInterval(() => {
        refreshAiStatus().catch(() => { });
      }, 12000);
    });

    es.addEventListener("error", () => {
      setStatus("error", "bad");
      logConn("SSE error");
      pushActivity({ kind: "error", label: "sse", title: "SSE error" });
    });

    es.addEventListener("endpoint", (ev) => {
      rpcEndpoint = resolveEndpoint(sseUrl, ev.data);
      endpointEl.textContent = rpcEndpoint ? `POST endpoint: ${rpcEndpoint}` : "endpoint: (invalid)";
      logConn(`endpoint: ${ev.data}`);
      emitBridge("innova:endpoint", { endpoint: rpcEndpoint || "-" });
      clearTimeout(endpointTimeout);

      initializeAndLoadTools().catch((e) => {
        setStatus("init failed", "bad");
        logConn(`initialize/tools/list failed: ${String(e?.message ?? e)}`);
      });
    });

    // Throttle citta_state_update bridge emissions to max 1 per 500ms to avoid
    // flooding React at micro-thought 1s intervals.
    function _emitCittaThrottled(obj) {
      _cittaPending = obj;
      if (_cittaThrottleTimer === null) {
        _cittaThrottleTimer = setTimeout(() => {
          if (_cittaPending) emitBridge("innova:citta", _cittaPending);
          _cittaPending = null;
          _cittaThrottleTimer = null;
        }, 500);
      }
    }

    // Single SSE message handler — addEventListener("message") covers both named and
    // unnamed events; es.onmessage would fire for the same unnamed events causing
    // double-processing.
    es.addEventListener("message", (ev) => {
      if (!ev?.data) return;
      logRaw(`SSE: ${ev.data}`);
      const obj = parseMaybeJson(ev.data);
      onRpcMessage(obj);

      if (obj && obj.type === "citta_state_update") {
        const trace = obj.Cognitive_Trace_Log && typeof obj.Cognitive_Trace_Log === "object" ? obj.Cognitive_Trace_Log : obj;
        if (trace && trace.Applied_TAM) {
          ecsAppliedTam = String(trace.Applied_TAM);
        }
        _emitCittaThrottled(obj);
      }
    });
  }

  function disconnect() {
    if (es) {
      try { es.close(); } catch { }
    }
    es = null;
    if (_cittaThrottleTimer !== null) {
      clearTimeout(_cittaThrottleTimer);
      _cittaThrottleTimer = null;
      _cittaPending = null;
    }
    rpcEndpoint = null;
    pending.clear();
    if (hitlTimer) {
      clearInterval(hitlTimer);
      hitlTimer = null;
    }
    if (aiStatusTimer) {
      clearInterval(aiStatusTimer);
      aiStatusTimer = null;
    }
    connectBtn.disabled = false;
    disconnectBtn.disabled = true;
    refreshToolsBtn.disabled = true;
    if (refreshRuntimeBtn) refreshRuntimeBtn.disabled = true;
    if (runMaintenanceBtn) runMaintenanceBtn.disabled = true;
    sendBtn.disabled = true;
    toolSelect.disabled = true;
    callToolBtn.disabled = true;
    if (activityRefreshBtn) activityRefreshBtn.disabled = true;
    endpointEl.textContent = "";
    if (runtimeDiag) runtimeDiag.textContent = "runtime diagnostics: -";
    if (aiDiag) {
      aiDiag.classList.remove("ai-diag--good", "ai-diag--warn", "ai-diag--bad");
      aiDiag.textContent = "AI route: -";
    }
    emitBridge("innova:tools", { names: [] });
    setStatus("disconnected", "");
    pushActivity({ kind: "system", label: "disconnect", title: "Disconnected" });
  }

  async function sendChat() {
    const text = (chatInput.value || "").trim();
    if (!text) return;

    appendMsg("user", text);
    pushActivity({ kind: "user", label: "chat", title: "User message", detail: text });
    chatInput.value = "";

    if (chatStatus) {
      chatStatus.textContent = "Thinking…";
      chatStatus.classList.add("is-busy");
    }
    sendBtn.disabled = true;

    try {
      const res = await rpc("tools/call", {
        name: "ask_local_ai",
        arguments: { prompt: text },
      });
      const out = typeof res === "string" ? res : JSON.stringify(res, null, 2);
      appendMsg("bot", out);
      pushActivity({ kind: "bot", label: "reply", title: "ask_local_ai reply", detail: out.slice(0, 200) });
      if (chatStatus) {
        chatStatus.textContent = "Ready";
        chatStatus.classList.remove("is-busy");
      }
    } catch (e) {
      appendMsg("bot", `ERROR: ${JSON.stringify(e)}`);
      pushActivity({ kind: "error", label: "chat", title: "ask_local_ai error", detail: String(e?.message ?? e) });
      if (chatStatus) {
        chatStatus.textContent = "Error";
        chatStatus.classList.remove("is-busy");
      }
    } finally {
      sendBtn.disabled = !rpcEndpoint;
    }
  }

  function updateAutoDevButton() {
    if (!autoDevToggleBtn) return;
    autoDevToggleBtn.textContent = `Auto Dev: ${autoDevEnabled ? "ON" : "OFF"}`;
    autoDevToggleBtn.classList.toggle("is-active", autoDevEnabled);
  }

  function renderOpsProcessPanel() {
    if (!opsProcessLog) return;
    const pendingCount = pending.size;
    const recent = activity.slice(-5).map((ev) => `${ev.timestamp || "--:--:--"} ${String(ev.kind || "system").toUpperCase()} ${ev.title || "-"}`);
    const wsState = auditWs ? ["CONNECTING", "OPEN", "CLOSING", "CLOSED"][auditWs.readyState] || "UNKNOWN" : "N/A";
    const lines = [
      `endpoint=${rpcEndpoint || "(not connected)"}`,
      `pending_rpc=${pendingCount}`,
      `activity_total=${activity.length}`,
      `raw_lines=${rawLines.length}`,
      `audit_ws=${wsState}`,
      `auto_dev=${autoDevEnabled ? "on" : "off"}`,
      `brain_mode=${ecsAppliedTam}`,
      `last_ai_check=${aiLastCheckedAt || "-"}`,
      "--- recent activity ---",
      ...(recent.length ? recent : ["(no recent events)"]),
    ];
    opsProcessLog.textContent = lines.join("\n");
  }

  async function publishAutonomyEvent(topic, payload) {
    if (!rpcEndpoint) return false;
    try {
      await rpc("tools/call", {
        name: "mcp_innovabot_publish_event",
        arguments: {
          topic,
          target_role: payload?.target_role || "ALL",
          payload,
          meta: { project: payload?.project || "workspace" },
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async function sendLineTeamCommand() {
    const text = String(lineCommandInput?.value || "").trim();
    if (!text) return;
    const selectedProject = String(lineProjectFilter?.value || focusProjectSelect?.value || "all");
    const selectedRole = String(lineRoleSelect?.value || "ALL");
    const prompt = `[TEAM-COMMAND]\nproject=${selectedProject}\ntarget_role=${selectedRole}\ncommand=${text}\nตอบกลับสั้น กระชับ พร้อม action ที่ลงมือได้ทันที`;

    pushActivity({ kind: "user", label: "line", title: `Team command → ${selectedRole}`, detail: text, project: selectedProject });

    if (!rpcEndpoint) {
      pushActivity({ kind: "error", label: "line", title: "Team command failed", detail: "Not connected to SSE/RPC endpoint." });
      return;
    }

    lineSendBtn && (lineSendBtn.disabled = true);
    try {
      const res = await rpc("tools/call", { name: "ask_local_ai", arguments: { prompt } });
      const out = typeof res === "string" ? res : JSON.stringify(res, null, 2);
      pushActivity({ kind: "bot", label: "line", title: `Team reply (${selectedRole})`, detail: out.slice(0, 400), project: selectedProject });
      await publishAutonomyEvent("TEAM_COMMAND_DISPATCHED", {
        project: selectedProject,
        target_role: selectedRole,
        command: text,
      });
    } catch (e) {
      pushActivity({ kind: "error", label: "line", title: "Team command error", detail: String(e?.message || e), project: selectedProject });
    } finally {
      lineSendBtn && (lineSendBtn.disabled = false);
      renderOpsProcessPanel();
    }
  }

  async function callTool() {
    const name = toolSelect.value;
    if (!name) return;

    let args = {};
    const raw = (toolArgs.value || "").trim();
    if (raw) {
      try {
        args = JSON.parse(raw);
      } catch (e) {
        toolOut.textContent = `Invalid JSON args: ${String(e?.message ?? e)}`;
        return;
      }
    }

    toolOut.textContent = "Calling…";
    pushActivity({ kind: "tool", label: "call", title: `Call tool: ${name}`, detail: JSON.stringify(args) });
    try {
      const res = await rpc("tools/call", { name, arguments: args });
      toolOut.textContent = JSON.stringify(res, null, 2);
      pushActivity({
        kind: "tool_result",
        label: "result",
        title: `Tool result: ${name}`,
        detail: JSON.stringify(res).slice(0, 200),
      });
    } catch (e) {
      toolOut.textContent = `ERROR: ${JSON.stringify(e)}`;
      pushActivity({ kind: "error", label: "tool", title: `Tool error: ${name}`, detail: String(e?.message ?? e) });
    }
  }

  function normalizeToolCallResult(value) {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.result)) return value.result;
    if (Array.isArray(value?.structuredContent?.result)) return value.structuredContent.result;
    if (Array.isArray(value?.content)) return value.content;
    return [];
  }

  function injectActivity(ev) {
    if (!ev || typeof ev !== "object") return;
    const key = `${ev.timestamp || ""}|${ev.kind || ""}|${ev.tool || ""}|${ev.status || ""}|${ev.raw || ""}`;
    if (serverActivityKeys.has(key)) return;
    serverActivityKeys.add(key);

    const metaPieces = [];
    if (ev.client && ev.client !== "-") metaPieces.push(ev.client);
    if (ev.project && ev.project !== "-") metaPieces.push(ev.project);
    if (ev.branch && ev.branch !== "-") metaPieces.push(ev.branch);
    if (ev.actor && ev.actor !== "-") metaPieces.push(`actor=${ev.actor}`);
    if (ev.role && ev.role !== "-") metaPieces.push(`role=${ev.role}`);
    const metaLabel = metaPieces.join(" / ");

    if (ev.kind === "agent_process") {
      const reqId = ev.request_id && ev.request_id !== "-" ? `#${ev.request_id}` : "";
      if (ev.phase === "request") {
        const title = ["ask_local_ai request", reqId, metaLabel].filter(Boolean).join(" · ");
        pushActivity({
          timestamp: ev.timestamp,
          timeMs: toTsMs(ev.timestamp),
          kind: "user",
          label: "process",
          title,
          project: ev.project,
          client: ev.client,
          actor: ev.actor,
          role: ev.role,
          session: ev.session,
          detail: ev.prompt || ev.raw,
        }, "server");
        return;
      }
      if (ev.phase === "response") {
        const title = ["ask_local_ai response", reqId, metaLabel].filter(Boolean).join(" · ");
        pushActivity({
          timestamp: ev.timestamp,
          timeMs: toTsMs(ev.timestamp),
          kind: "bot",
          label: "process",
          title,
          project: ev.project,
          client: ev.client,
          actor: ev.actor,
          role: ev.role,
          session: ev.session,
          detail: ev.response || ev.raw,
        }, "server");
        return;
      }
    }

    if (ev.tool === "ask_local_ai" && ev.kind === "tool_call") {
      const detail = typeof ev.prompt === "string" && ev.prompt.trim() ? ev.prompt : ev.raw;
      const titleBase = metaLabel ? `ask_local_ai (${metaLabel})` : "ask_local_ai (external client)";
      pushActivity({
        timestamp: ev.timestamp,
        timeMs: toTsMs(ev.timestamp),
        kind: "user",
        label: "mcp",
        title: titleBase,
        project: ev.project,
        client: ev.client,
        actor: ev.actor,
        role: ev.role,
        session: ev.session,
        detail,
      }, "server");
      return;
    }

    const kind = ev.kind || "tool";
    const label = kind === "tool_call" ? "tool" : kind === "tool_result" ? "result" : kind;
    const titleParts = [];
    if (ev.tool) titleParts.push(ev.tool);
    if (ev.request_id) titleParts.push(`id=${ev.request_id}`);
    if (ev.status) titleParts.push(`status=${ev.status}`);
    if (ev.duration_ms) titleParts.push(`duration=${ev.duration_ms}ms`);
    if (metaLabel) titleParts.push(metaLabel);
    const title = titleParts.join(" · ") || ev.raw || "tool event";
    pushActivity({
      timestamp: ev.timestamp,
      timeMs: toTsMs(ev.timestamp),
      kind,
      label,
      project: ev.project,
      client: ev.client,
      actor: ev.actor,
      role: ev.role,
      session: ev.session,
      request_id: ev.request_id,
      duration_ms: ev.duration_ms,
      status: ev.status,
      title,
      detail: ev.raw,
    }, "server");
  }

  async function syncActivityFromServer() {
    try {
      const events = await rpc("tools/call", {
        name: "list_recent_tool_activity",
        arguments: { limit: 100 },
      });
      const rows = normalizeToolCallResult(events);
      if (!Array.isArray(rows)) return;

      for (const ev of rows) {
        injectActivity(ev);
      }
    } catch (e) {
      logConn(`activity sync failed: ${String(e?.message ?? e)}`);
      pushActivity({ kind: "error", label: "activity", title: "Activity sync failed", detail: String(e?.message ?? e) });
    }
  }

  function applyTheme(theme) {
    if (theme === "light") {
      document.body.classList.add("theme-light");
      if (themeToggle) themeToggle.textContent = tr("darkTheme");
    } else {
      document.body.classList.remove("theme-light");
      if (themeToggle) themeToggle.textContent = tr("lightTheme");
    }
  }

  function switchToOverview() {
    overviewPanel?.classList.remove("hidden");
    projectPanel?.classList.add("hidden");
    viewOverviewBtn?.classList.remove("secondary");
    viewProjectBtn?.classList.add("secondary");
  }

  function switchToProject() {
    overviewPanel?.classList.add("hidden");
    projectPanel?.classList.remove("hidden");
    viewOverviewBtn?.classList.add("secondary");
    viewProjectBtn?.classList.remove("secondary");
    renderInsights();
  }

  connectBtn.addEventListener("click", connect);
  disconnectBtn.addEventListener("click", disconnect);

  refreshToolsBtn.addEventListener("click", () => {
    if (!rpcEndpoint) return;
    initializeAndLoadTools().catch((e) => logConn(`refresh failed: ${String(e?.message ?? e)}`));
  });

  sendBtn.addEventListener("click", sendChat);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) sendChat();
  });

  clearChatBtn.addEventListener("click", () => {
    chatEl.textContent = "";
    if (chatStatus) {
      chatStatus.textContent = "Ready";
      chatStatus.classList.remove("is-busy");
    }
  });

  chatToolbar?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const template = target.dataset.chatTemplate;
    if (!template) return;
    chatInput.value = template;
    chatInput.focus();
  });

  callToolBtn.addEventListener("click", callTool);

  prettyBtn.addEventListener("click", () => {
    const raw = (toolArgs.value || "").trim();
    if (!raw) return;
    try {
      toolArgs.value = JSON.stringify(JSON.parse(raw), null, 2);
    } catch { }
  });

  if (activityRefreshBtn) {
    activityRefreshBtn.addEventListener("click", () => {
      if (!rpcEndpoint) return;
      syncActivityFromServer().catch((e) => logConn(`activity refresh error: ${String(e?.message ?? e)}`));
    });

    activityFilter?.addEventListener("change", () => {
      activityFilterValue = activityFilter.value || "all";
      renderActivity();
    });

    activitySearch?.addEventListener("input", () => {
      activitySearchValue = (activitySearch.value || "").trim().toLowerCase();
      renderActivity();
    });

    activitySort?.addEventListener("change", () => {
      activitySortValue = activitySort.value || "latest";
      renderActivity();
    });

    projectFilter?.addEventListener("change", () => {
      projectFilterValue = projectFilter.value || "all";
      renderActivity();
    });

    lineProjectFilter?.addEventListener("change", () => {
      lineChatProjectValue = lineProjectFilter.value || "all";
      renderLineTimeline();
    });

    lineClearBtn?.addEventListener("click", () => {
      activity.length = 0;
      renderActivity();
      updateNewBadge();
      renderOpsProcessPanel();
    });

    lineSendBtn?.addEventListener("click", sendLineTeamCommand);

    lineCommandInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        sendLineTeamCommand();
      }
    });

    lineCommandClearBtn?.addEventListener("click", () => {
      if (lineCommandInput) lineCommandInput.value = "";
    });

    focusApplyBtn?.addEventListener("click", async () => {
      const project = String(focusProjectSelect?.value || "all");
      const role = String(focusRoleSelect?.value || "ALL");
      lineChatProjectValue = project;
      if (lineProjectFilter) lineProjectFilter.value = project;
      if (projectFilter) projectFilter.value = project;
      projectFilterValue = project;
      renderLineTimeline();
      renderActivity();
      pushActivity({ kind: "system", label: "focus", title: `Focus applied (${project} / ${role})`, detail: "AI team focus updated" });
      await publishAutonomyEvent("AI_FOCUS_UPDATED", { project, target_role: role });
    });

    autoDevToggleBtn?.addEventListener("click", async () => {
      autoDevEnabled = !autoDevEnabled;
      localStorage.setItem("innovaAutoDev", autoDevEnabled ? "1" : "0");
      updateAutoDevButton();
      pushActivity({ kind: "system", label: "ops", title: `Auto Dev ${autoDevEnabled ? "enabled" : "disabled"}` });
      await publishAutonomyEvent("AUTO_DEV_TOGGLED", { enabled: autoDevEnabled, project: String(focusProjectSelect?.value || "all") });
      renderOpsProcessPanel();
    });

    brainApplyBtn?.addEventListener("click", async () => {
      ecsAppliedTam = String(brainModeSelect?.value || "Constructive/Curiosity");
      pushActivity({ kind: "system", label: "ops", title: `Brain mode set: ${ecsAppliedTam}` });
      await publishAutonomyEvent("BRAIN_MODE_UPDATED", { mode: ecsAppliedTam, project: String(focusProjectSelect?.value || "all") });
      renderLineTimeline();
      renderOpsProcessPanel();
    });

    opsProcessRefreshBtn?.addEventListener("click", renderOpsProcessPanel);

    lineJumpActivityBtn?.addEventListener("click", () => {
      const nav = document.querySelector('.nav-link[data-center-view="activity"]');
      if (nav instanceof HTMLElement) nav.click();
    });

    lineOpenGuiBtn?.addEventListener("click", () => {
      window.open("/gui", "_blank", "noopener,noreferrer");
    });

    lineCopyTuiBtn?.addEventListener("click", async () => {
      const cmd = "cmd /c monitor.cmd :tui";
      try {
        await copyTextToClipboard(cmd);
        pushActivity({ kind: "system", label: "bridge", title: "Copied terminal shortcut", detail: cmd });
      } catch (e) {
        pushActivity({ kind: "error", label: "bridge", title: "Copy terminal shortcut failed", detail: String(e?.message ?? e) });
      }
    });

    activityLimit?.addEventListener("change", () => {
      activityCap = clamp(Number(activityLimit.value) || 300, 100, 1200);
      if (activity.length > activityCap) activity.splice(0, activity.length - activityCap);
      renderActivity();
    });

    clearActivityBtn?.addEventListener("click", () => {
      activity.length = 0;
      alertCount = 0;
      renderActivity();
      updateNewBadge();
      renderOpsProcessPanel();
    });

    projectProgressClearBtn?.addEventListener("click", () => {
      projectProgressByKey.clear();
      renderProjectProgress();
    });

    clearConnBtn?.addEventListener("click", () => {
      connLines.length = 0;
      renderLines(connLog, connLines);
    });

    clearRawBtn?.addEventListener("click", () => {
      rawLines.length = 0;
      renderRawStream();
    });

    rawModeSelect?.addEventListener("change", () => {
      rawMode = rawModeSelect.value || "raw";
      renderRawStream();
      if (rawMode === "chat") {
        syncChatOnlyRawFromServer().catch(() => { });
      }
    });

    rawSourceFilter?.addEventListener("change", () => {
      rawSource = rawSourceFilter.value || "all";
      renderRawStream();
    });

    rawFilterInput?.addEventListener("input", () => {
      rawFilter = rawFilterInput.value || "";
      renderRawStream();
    });

    rawPauseBtn?.addEventListener("click", () => {
      rawPaused = !rawPaused;
      rawPauseBtn.textContent = rawPaused ? "Resume" : "Pause";
    });

    refreshRuntimeBtn?.addEventListener("click", () => {
      refreshRuntimeDiagnostics().catch((e) => logConn(`runtime refresh failed: ${String(e?.message ?? e)}`));
    });

    runMaintenanceBtn?.addEventListener("click", () => {
      runMaintenanceNow().catch((e) => logConn(`maintenance failed: ${String(e?.message ?? e)}`));
    });

    viewOverviewBtn?.addEventListener("click", switchToOverview);
    viewProjectBtn?.addEventListener("click", switchToProject);

    projectSelect?.addEventListener("change", () => {
      selectedProject = projectSelect.value || "";
      if (selectedProject) switchToProject();
      renderInsights();
    });

    notifyBtn?.addEventListener("click", async () => {
      if (!("Notification" in window)) {
        notifyBtn.textContent = tr("noNotificationApi");
        return;
      }
      if (Notification.permission === "granted") {
        notificationEnabled = !notificationEnabled;
      } else {
        const perm = await Notification.requestPermission();
        notificationEnabled = perm === "granted";
      }
      notifyBtn.textContent = notificationEnabled ? tr("alertsOn") : tr("alertsBtn");
    });

    muteBtn?.addEventListener("click", () => {
      soundMuted = !soundMuted;
      muteBtn.textContent = soundMuted ? tr("unmuteBtn") : tr("muteBtn");
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        unseenCount = 0;
        updateNewBadge();
      }
    });

    if (themeToggle) {
      let theme = localStorage.getItem("innovaTheme") || "dark";
      applyTheme(theme);
      themeToggle.addEventListener("click", () => {
        theme = theme === "dark" ? "light" : "dark";
        localStorage.setItem("innovaTheme", theme);
        applyTheme(theme);
      });
    }

    langToggle?.addEventListener("click", () => {
      const nextLang = currentLang === "en" ? "th" : "en";
      applyLanguage(nextLang);
    });
  }

  applyLanguage(currentLang);
  renderRawStream();
  renderLineTimeline();
  refreshInsightSeed().catch(() => { });
  setInterval(() => {
    refreshInsightSeed().catch(() => { });
  }, 15000);

  aiDiag?.addEventListener("click", async (ev) => {
    const target = ev.target;
    if (!(target instanceof HTMLElement)) return;

    const toggleKey = String(target.dataset.aiToggleoutkey || "");
    if (target.classList.contains("ai-check-toggleout") && toggleKey) {
      aiFixRunExpandedByKey[toggleKey] = !aiFixRunExpandedByKey[toggleKey];
      if (aiLastStatus) renderAiStatus(aiLastStatus);
      return;
    }

    const runFixKey = String(target.dataset.aiRunfixkey || "");
    if (target.classList.contains("ai-check-run") && runFixKey) {
      const fix = aiFixByKey[runFixKey];
      const command = String(fix?.cmd || "").trim();
      if (!command) return;
      if (!Boolean(fix?.runnable)) {
        aiFixFeedbackByKey[runFixKey] = "error";
        aiFixRunOutputByKey[runFixKey] = "error: action is not runnable by server policy";
        aiFixRunFullOutputByKey[runFixKey] = "error: action is not runnable by server policy";
        if (aiLastStatus) renderAiStatus(aiLastStatus);
        logConn(`ai quick-fix run blocked by policy (${runFixKey})`);
        return;
      }

      const original = target.textContent || "Run Fix";
      target.textContent = "Running…";

      for (const key of Object.keys(aiFixRunExpandedByKey)) {
        aiFixRunExpandedByKey[key] = false;
      }

      aiFixFeedbackByKey[runFixKey] = "rechecking";
      aiFixRunOutputByKey[runFixKey] = "";
      aiFixRunFullOutputByKey[runFixKey] = "";
      aiFixRunExpandedByKey[runFixKey] = false;
      if (aiLastStatus) renderAiStatus(aiLastStatus);
      try {
        const resp = await fetch("/api/ai/fix/run", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ key: runFixKey }),
        });
        const runResult = await resp.json().catch(() => ({}));
        if (!resp.ok || !runResult?.ok) {
          throw new Error(runResult?.error || `HTTP ${resp.status}`);
        }

        const runObj = normalizeSingleResult(runResult) || runResult || {};
        const rawOut = String(runObj.stdout || runObj.output || runObj.result || "").trim();
        const rawErr = String(runObj.stderr || runObj.error || "").trim();
        const full = rawErr ? `stderr: ${rawErr}` : (rawOut ? `stdout: ${rawOut}` : "executed");
        aiFixRunFullOutputByKey[runFixKey] = full;
        aiFixRunOutputByKey[runFixKey] = shortFixOutput(full, 180);

        const latest = await refreshAiStatus();
        const latestChecks = deriveAiChecks(latest || {});
        const latestRow = latestChecks.find((row) => row.key === runFixKey);
        aiFixFeedbackByKey[runFixKey] = latestRow?.state === "pass" ? "improved" : "still-fail";
        if (aiLastStatus) renderAiStatus(aiLastStatus);
        logConn(`ai quick-fix ran (${runFixKey})`);
      } catch (e) {
        aiFixFeedbackByKey[runFixKey] = "error";
        const fullError = `error: ${String(e?.message ?? e)}`;
        aiFixRunFullOutputByKey[runFixKey] = fullError;
        aiFixRunOutputByKey[runFixKey] = shortFixOutput(fullError, 180);
        if (aiLastStatus) renderAiStatus(aiLastStatus);
        logConn(`ai quick-fix run failed: ${String(e?.message ?? e)}`);
      } finally {
        target.textContent = original;
      }
      return;
    }

    const fixKey = String(target.dataset.aiFixkey || "");
    if (target.classList.contains("ai-check-fix") && fixKey) {
      const fix = aiFixByKey[fixKey];
      const command = String(fix?.cmd || "").trim();
      if (!command) return;
      try {
        await copyTextToClipboard(command);
        logConn(`ai quick-fix copied (${fixKey}): ${command}`);
        pushActivity({ kind: "system", label: "ai-fix", title: `AI quick-fix copied (${fixKey})`, detail: command });
        target.textContent = "Copied";

        aiFixFeedbackByKey[fixKey] = "rechecking";
        if (aiLastStatus) renderAiStatus(aiLastStatus);

        await new Promise((resolve) => setTimeout(resolve, 900));
        const latest = await refreshAiStatus();
        const latestChecks = deriveAiChecks(latest || {});
        const latestRow = latestChecks.find((row) => row.key === fixKey);
        aiFixFeedbackByKey[fixKey] = latestRow?.state === "pass" ? "improved" : "still-fail";
        if (aiLastStatus) renderAiStatus(aiLastStatus);
      } catch (e) {
        logConn(`ai quick-fix copy failed: ${String(e?.message ?? e)}`);
        aiFixFeedbackByKey[fixKey] = "error";
        if (aiLastStatus) renderAiStatus(aiLastStatus);
      }
      return;
    }

    async function executeAiQuickAction(actionName, buttonEl) {
      const aiAction = String(actionName || "");
      if (!(aiAction === "retry-last" || aiAction === "switch-provider" || aiAction === "open-diagnostics" || aiAction === "force-probe")) {
        return;
      }
      const targetButton = buttonEl instanceof HTMLElement ? buttonEl : null;
      const original = targetButton?.textContent || "Quick Action";
      if (targetButton) targetButton.textContent = "Checking…";
      try {
        const payload = { key: aiAction.replace(/-/g, "_") };
        if (aiAction === "switch-provider") {
          const route = String(aiLastStatus?.selected_route || "");
          payload.provider = route.startsWith("remote") ? "ollama_local" : "ollama_remote";
        }
        const resp = await fetch("/api/ai/quick-action", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await resp.json().catch(() => ({}));
        if (!resp.ok || !result?.ok) {
          throw new Error(result?.error || `HTTP ${resp.status}`);
        }
        if (aiAction === "open-diagnostics") {
          if (typeof window.__innovaNavigateToView === "function") {
            window.__innovaNavigateToView("monitoring", { controlView: "ops" });
          }
        }
        await refreshAiStatus();
        logConn(`ai quick action ${payload.key}: completed`);
        pushActivity({ kind: "system", label: "ai-quick-action", title: `AI quick action ${payload.key} completed`, detail: JSON.stringify(result) });
        if (targetButton) targetButton.textContent = "OK";
      } catch (e) {
        logConn(`ai quick action failed: ${String(e?.message ?? e)}`);
        pushActivity({ kind: "error", label: "ai-quick-action", title: "AI quick action failed", detail: String(e?.message ?? e) });
        if (targetButton) targetButton.textContent = "Failed";
      }
      if (targetButton) {
        setTimeout(() => {
          targetButton.textContent = original;
        }, 900);
      }
    }

    const aiAction = String(target.dataset.aiAction || "");
    if (aiAction === "retry-last" || aiAction === "switch-provider" || aiAction === "open-diagnostics" || aiAction === "force-probe") {
      await executeAiQuickAction(aiAction, target);
      return;
    }

    if (!target.classList.contains("ai-diag-copy")) return;

    const idx = Number(target.dataset.aiCopy || "-1");
    if (!Number.isFinite(idx) || idx < 0 || idx >= aiSuggestedCommands.length) return;

    const command = aiSuggestedCommands[idx];
    try {
      await copyTextToClipboard(command);
      logConn(`ai hint copied: ${command}`);
      pushActivity({ kind: "system", label: "ai-hint", title: "AI fix command copied", detail: command });
      target.textContent = "Copied";
      setTimeout(() => {
        refreshAiStatus().catch(() => { });
      }, 600);
    } catch (e) {
      logConn(`ai hint copy failed: ${String(e?.message ?? e)}`);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!(event.altKey && !event.ctrlKey && !event.metaKey)) return;
    const key = String(event.key || "").toLowerCase();
    if (key === "r") {
      event.preventDefault();
      aiDiag && aiDiag.querySelector('[data-ai-action="retry-last"]')?.click();
      return;
    }
    if (key === "p") {
      event.preventDefault();
      aiDiag && aiDiag.querySelector('[data-ai-action="force-probe"]')?.click();
      return;
    }
    if (key === "d") {
      event.preventDefault();
      aiDiag && aiDiag.querySelector('[data-ai-action="open-diagnostics"]')?.click();
    }
  });

  setTimeout(() => {
    if (!es) connect();
  }, 250);

  hitlRefreshBtn?.addEventListener("click", () => {
    fetchHitlQueue().catch(() => { });
  });

  hitlScope?.addEventListener("change", () => {
    fetchHitlQueue().catch(() => { });
  });

  hitlList?.addEventListener("click", async (ev) => {
    const target = ev.target;
    if (!(target instanceof HTMLElement)) return;
    const expand = target.classList.contains("hitl-expand");
    const approve = target.classList.contains("hitl-approve");
    const approveExec = target.classList.contains("hitl-approve-exec");
    const reject = target.classList.contains("hitl-reject");
    const copyStdout = target.classList.contains("hitl-copy-stdout");
    const copyStderr = target.classList.contains("hitl-copy-stderr");
    const copyJson = target.classList.contains("hitl-copy-json");
    if (!expand && !approve && !approveExec && !reject && !copyStdout && !copyStderr && !copyJson) return;

    const item = target.closest(".hitl-item");
    const approvalId = item?.getAttribute("data-approval-id") || "";
    if (!approvalId) return;

    if (copyStdout || copyStderr || copyJson) {
      const approval = hitlItemsById.get(approvalId);
      const execution = approval && typeof approval.execution === "object" ? approval.execution : null;
      try {
        if (!execution) throw new Error("execution not found");
        if (copyStdout) {
          await copyTextToClipboard(String(execution.stdout || ""));
          setHitlCopyMessage(`copied stdout (${approvalId})`);
        } else if (copyStderr) {
          await copyTextToClipboard(String(execution.stderr || execution.error || ""));
          setHitlCopyMessage(`copied stderr (${approvalId})`);
        } else {
          await copyTextToClipboard(JSON.stringify(execution, null, 2));
          setHitlCopyMessage(`copied execution json (${approvalId})`);
        }
      } catch (e) {
        setHitlCopyMessage(`copy failed: ${String(e?.message ?? e)}`, true);
      }
      return;
    }

    if (expand) {
      if (hitlExpanded.has(approvalId)) hitlExpanded.delete(approvalId);
      else hitlExpanded.add(approvalId);
      fetchHitlQueue().catch(() => { });
      return;
    }

    const action = (approve || approveExec) ? "approve" : "reject";
    const executeAfterApprove = approveExec;
    target.setAttribute("disabled", "disabled");
    try {
      await resolveHitl(approvalId, action, executeAfterApprove);
      const detail = executeAfterApprove ? `approval=${approvalId} execute_after_approve=true` : `approval=${approvalId}`;
      pushActivity({ kind: "system", label: "hitl", title: `HITL ${action}`, detail });
    } catch (e) {
      pushActivity({ kind: "error", label: "hitl", title: `HITL ${action} failed`, detail: String(e?.message ?? e) });
    } finally {
      fetchHitlQueue().catch(() => { });
    }
  });

  fetchHitlQueue().catch(() => { });

  switchToOverview();
  updateNewBadge();
  updateAutoDevButton();
  renderOpsProcessPanel();
  renderProjectProgress();

  // ── Phase 2026: Dual Sidebar + Categorized Center UX ──────────────────────
  (() => {
    const leftToggle = $("leftSidebarToggle");
    const rightToggle = $("rightSidebarToggle");
    const centerCol = document.querySelector(".layout-col--center");
    const navLinks = Array.from(document.querySelectorAll(".nav-link[data-center-view]"));
    const navGroupToggles = Array.from(document.querySelectorAll(".nav-group__toggle[data-nav-toggle]"));
    const breadcrumbPath = $("workspaceBreadcrumbPath");
    const ribbonToggleBtn = $("ribbonToggleBtn");
    const centerCards = Array.from(document.querySelectorAll("[data-center-card]"));
    const centerGroupTabs = document.createElement("div");
    centerGroupTabs.id = "centerGroupTabs";
    centerGroupTabs.className = "center-group-tabs";
    centerGroupTabs.setAttribute("role", "tablist");
    centerGroupTabs.setAttribute("aria-label", "Center workspace tabs");
    if (centerCol && !centerCol.querySelector("#centerGroupTabs")) {
      centerCol.prepend(centerGroupTabs);
    }
    const controlTabs = Array.from(document.querySelectorAll(".control-tab[data-control-view]"));
    const controlJumps = Array.from(document.querySelectorAll(".control-jump[data-control-view]"));
    const controlCards = Array.from(document.querySelectorAll("[data-control-card]"));
    const opsJumps = Array.from(document.querySelectorAll(".ops-jump[data-ops-target]"));
    const backdrop = document.getElementById("sidebarBackdrop");
    const controlHintBox = $("controlHintBox");
    const submitBtn = $("controlSubmitBtn");
    const cancelBtn = $("controlCancelBtn");
    const logBtn = $("controlLogBtn");
    const toolCallBtn = $("callToolBtn");
    const toolArgsEl = $("toolArgs");
    const chatInputEl = $("chatInput");
    const connectBtn = $("connectBtn");
    const disconnectBtn = $("disconnectBtn");
    const memorySearchBtn = $("memorySearchBtn");
    const workflowLoadBtn = $("workflowLoadBtn");
    const hitlRefreshBtn = $("hitlRefreshBtn");
    const memoryQuery = $("memoryQuery");
    const starMapFrame = $("starMapFrame");
    const mcpManagerFrame = $("mcpManagerFrame");
    const starMapFrameLoading = $("starMapFrameLoading");
    const knowledgeFrameLoading = $("knowledgeFrameLoading");

    const mqMobile = window.matchMedia("(max-width: 960px)");
    const centerViewKey = "innovaCenterView";
    const starMapViewKey = "innovaStarMapView";
    const controlViewKey = "innovaControlView";
    const opsActiveCardKey = "innovaOpsActiveCard";
    const navGroupStateKey = "innovaNavGroupState";
    const leftCollapsedKey = "innovaLeftCollapsed";
    const rightCollapsedKey = "innovaRightCollapsed";
    const leftPinnedKey = "innovaLeftPinned";
    const rightPinnedKey = "innovaRightPinned";
    const ribbonCompactKey = "innovaRibbonCompact";

    const controlHints = {
      connection: "Connection mode: ตั้งค่า endpoint และการแจ้งเตือนก่อนเริ่มใช้งาน",
      tools: "Tools mode: เลือก tool + args แล้วกด Submit เพื่อเรียกทันที",
      ops: "Ops mode: ใช้ Memory / Workflow / HITL เพื่อควบคุมงานขั้นสูง",
    };

    const centerControlMap = {
      live: "tools",
      chat: "tools",
      devide: "tools",
      stream: "tools",
      monitoring: "connection",
      telemetry: "connection",
      activity: "ops",
      network: "ops",
      "project-progress": "ops",
      starmap: "ops",
      knowledge: "ops",
      insights: "ops",
      agents: "ops",
    };

    const centerGroupMap = {
      live: "cockpit",
      chat: "cockpit",
      devide: "cockpit",
      stream: "vitals",
      monitoring: "vitals",
      telemetry: "vitals",
      agents: "swarm",
      activity: "swarm",
      network: "swarm",
      "project-progress": "swarm",
      starmap: "starmap-suite",
      knowledge: "starmap-suite",
      insights: "starmap-suite",
    };

    const centerViewLabels = {
      live: "Live Workspace",
      chat: "Chat",
      devide: "Dev IDE",
      stream: "Raw Stream",
      monitoring: "Dashboard",
      agents: "AI Swarm & Tokens",
      activity: "Activity",
      telemetry: "Telemetry",
      network: "Agent Network",
      "project-progress": "Project Progress",
      starmap: "StarMap Suite",
      knowledge: "MCP Knowledge",
      insights: "Insights",
    };

    const starMapLabels = {
      starmap: "Agent Map",
      knowledge: "Knowledge Universe",
      mcp: "MCP Manager",
      references: "Reference Repos",
    };

    const groupLabels = {
      cockpit: "Cockpit & Operations",
      vitals: "System Vitals",
      swarm: "AI Swarm Control",
      "starmap-suite": "StarMap & Knowledge",
    };

    function collectGroupEntries(group) {
      const seen = new Set();
      const entries = [];
      navLinks.forEach((el) => {
        const parentGroup = el.closest(".nav-group")?.getAttribute("data-nav-group");
        if (parentGroup !== group) return;
        const centerView = el.dataset.centerView || "live";
        const starMapView = el.dataset.starmapView || "";
        const key = `${centerView}:${starMapView}`;
        if (seen.has(key)) return;
        seen.add(key);
        entries.push({
          key,
          centerView,
          starMapView,
          label: (el.textContent || centerView).trim(),
        });
      });
      return entries;
    }

    function renderCenterGroupTabs(view, starMapView) {
      if (!centerCol || !centerGroupTabs) return;
      const group = centerGroupMap[view] || "general";
      const entries = collectGroupEntries(group);
      if (!entries.length || entries.length === 1) {
        centerGroupTabs.hidden = true;
        centerGroupTabs.innerHTML = "";
        return;
      }

      centerGroupTabs.hidden = false;
      centerGroupTabs.dataset.group = group;
      centerGroupTabs.innerHTML = entries.map((entry) => {
        const matchStarMap = entry.centerView === "starmap"
          ? ((entry.starMapView || "starmap") === (starMapView || "starmap"))
          : true;
        const isActive = entry.centerView === view && matchStarMap;
        const dataStarMapView = entry.starMapView ? ` data-starmap-view="${entry.starMapView}"` : "";
        return `<button class="center-group-tab${isActive ? " is-active" : ""}" type="button" role="tab" aria-selected="${isActive ? "true" : "false"}" data-center-view="${entry.centerView}"${dataStarMapView}>${entry.label}</button>`;
      }).join("");
    }

    function setFrameLoading(kind, loading) {
      const target = kind === "knowledge" ? knowledgeFrameLoading : starMapFrameLoading;
      if (!(target instanceof HTMLElement)) return;
      target.classList.toggle("is-visible", Boolean(loading));
    }

    const boilerplateMenus = [
      { view: "live", title: "Live Workspace", kpiA: "3 lanes", kpiB: "ready", kpiC: "drag-drop" },
      { view: "chat", title: "Chat Timeline", kpiA: "humanized", kpiB: "auto-scroll", kpiC: "timestamps" },
      { view: "devide", title: "Dev IDE", kpiA: "3-pane", kpiB: "live terminal", kpiC: "dummy files" },
      { view: "stream", title: "Raw Stream", kpiA: "json lines", kpiB: "high volume", kpiC: "inspect" },
      { view: "monitoring", title: "Dashboard", kpiA: "cpu+ram", kpiB: "eps", kpiC: "mind state" },
      { view: "activity", title: "Activity Console", kpiA: "kind tags", kpiB: "event feed", kpiC: "copy-ready" },
      { view: "telemetry", title: "Telemetry", kpiA: "polling", kpiB: "sparkline", kpiC: "last update" },
      { view: "network", title: "Agent Network", kpiA: "9 nodes", kpiB: "edge status", kpiC: "route map" },
      { view: "project-progress", title: "Project Progress", kpiA: "todo sync", kpiB: "phase", kpiC: "eta mock" },
    ];

    function traceUI(scope, message, kind = "update") {
      const styles = {
        mount: "color:#22c55e;font-weight:700",
        update: "color:#38bdf8;font-weight:700",
        warn: "color:#f59e0b;font-weight:700",
      };
      try {
        console.log(`%c[UI:${scope}] ${message}`, styles[kind] || styles.update);
      } catch {
        // no-op
      }
    }

    function ensureMenuBoilerplates() {
      boilerplateMenus.forEach((menu) => {
        const targets = centerCards.filter((card) => card.getAttribute("data-center-card") === menu.view);
        targets.forEach((card) => {
          if (card.querySelector(".menu-boilerplate")) return;
          const box = document.createElement("div");
          box.className = "menu-boilerplate";
          box.innerHTML = `
            <div class="menu-boilerplate__title">${menu.title} Boilerplate</div>
            <div class="menu-boilerplate__grid">
              <span>${menu.kpiA}</span>
              <span>${menu.kpiB}</span>
              <span>${menu.kpiC}</span>
            </div>
          `;
          card.appendChild(box);
        });
      });
      traceUI("Boilerplate", "menu boilerplates synced (debug mode)", "mount");
    }

    function updateStarMapFrame(starMapView) {
      if (!starMapFrame) return;
      const target = ["starmap", "knowledge", "mcp", "references"].includes(starMapView)
        ? starMapView
        : "starmap";
      const nextSrc = `static/starmap/index.html?view=${encodeURIComponent(target)}`;
      if (starMapFrame.getAttribute("src") !== nextSrc) {
        setFrameLoading("starmap", true);
        starMapFrame.setAttribute("src", nextSrc);
      }
      localStorage.setItem(starMapViewKey, target);
    }

    function writeAccordionState(openGroup) {
      const nextState = {};
      navGroupToggles.forEach((toggle) => {
        const key = toggle.dataset.navToggle;
        if (!key) return;
        nextState[key] = key === openGroup;
      });
      writeNavGroupState(nextState);
    }

    function setAccordionGroup(openGroup, persist = true) {
      if (!openGroup) return;
      navGroupToggles.forEach((toggle) => {
        const group = toggle.dataset.navToggle;
        if (!group) return;
        applyNavGroupState(group, group === openGroup);
      });
      if (persist) writeAccordionState(openGroup);
    }

    function updateBreadcrumb(view, starMapView) {
      if (!breadcrumbPath) return;
      const group = centerGroupMap[view] || "general";
      const groupLabel = groupLabels[group] || "General";
      if (view === "starmap") {
        const sub = starMapLabels[starMapView] || starMapLabels.starmap;
        breadcrumbPath.textContent = `${groupLabel} / ${sub}`;
        return;
      }
      const centerLabel = centerViewLabels[view] || "Live Workspace";
      breadcrumbPath.textContent = `${groupLabel} / ${centerLabel}`;
    }

    function applyRibbonCompact(compact, persist = true) {
      const isCompact = compact !== false;
      document.body.classList.toggle("ribbon-compact", isCompact);
      if (ribbonToggleBtn) {
        ribbonToggleBtn.textContent = isCompact ? "Expand Ribbon" : "Compact Ribbon";
        ribbonToggleBtn.setAttribute("aria-pressed", isCompact ? "true" : "false");
        ribbonToggleBtn.title = isCompact ? "Expand top ribbon" : "Compact top ribbon";
      }
      if (persist) localStorage.setItem(ribbonCompactKey, isCompact ? "1" : "0");
    }

    function applyCenterView(view, opts = {}) {
      const { starMapView = null, autoControl = false, sourceGroup = null } = opts;
      const selected = view || "live";
      localStorage.setItem(centerViewKey, selected);
      if (centerCol) centerCol.setAttribute("data-center-mode", selected);
      document.body.dataset.centerView = selected;
      traceUI("CenterView", `switch -> ${selected}`, "update");

      const resolvedStarMapView = selected === "starmap"
        ? (starMapView || localStorage.getItem(starMapViewKey) || "starmap")
        : (localStorage.getItem(starMapViewKey) || "starmap");

      if (selected === "starmap") {
        updateStarMapFrame(resolvedStarMapView);
      }
      if (selected === "knowledge" && mcpManagerFrame && mcpManagerFrame.dataset.loaded !== "1") {
        setFrameLoading("knowledge", true);
      }

      if (autoControl) {
        const targetControl = centerControlMap[selected] || "connection";
        applyControlView(targetControl);
      }

      navLinks.forEach((el) => {
        const isStarMapSub = selected === "starmap" && el.dataset.centerView === "starmap";
        const isMatchingSubView = isStarMapSub
          && (el.dataset.starmapView || "starmap") === (localStorage.getItem(starMapViewKey) || "starmap");
        const isActive = isMatchingSubView || (!isStarMapSub && el.dataset.centerView === selected);
        el.classList.toggle("is-active", isActive);
      });

      centerCards.forEach((card) => {
        const cardView = card.getAttribute("data-center-card");
        card.classList.toggle("is-visible", cardView === selected);
      });

      updateBreadcrumb(selected, resolvedStarMapView);
      renderCenterGroupTabs(selected, resolvedStarMapView);
      setAccordionGroup(sourceGroup || centerGroupMap[selected] || "general");

      const shouldCollapseRight = ["starmap", "knowledge", "insights", "network", "monitoring", "telemetry"].includes(selected);
      if (shouldCollapseRight) autoCollapse("right");
      else autoExpand("right");
    }

    function readNavGroupState() {
      try {
        const parsed = JSON.parse(localStorage.getItem(navGroupStateKey) || "{}");
        return parsed && typeof parsed === "object" ? parsed : {};
      } catch {
        return {};
      }
    }

    function writeNavGroupState(nextState) {
      localStorage.setItem(navGroupStateKey, JSON.stringify(nextState));
    }

    function applyNavGroupState(group, expanded) {
      const wrapper = document.querySelector(`.nav-group[data-nav-group="${group}"]`);
      const toggle = document.querySelector(`.nav-group__toggle[data-nav-toggle="${group}"]`);
      if (!(wrapper instanceof HTMLElement) || !(toggle instanceof HTMLElement)) return;
      wrapper.classList.toggle("is-collapsed", !expanded);
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    }

    const allowedOpsCards = new Set(["panelMemory", "panelWorkflow", "panelHitl", "panelOpsFocus"]);
    let activeOpsCard = (() => {
      const raw = localStorage.getItem(opsActiveCardKey) || "panelMemory";
      return allowedOpsCards.has(raw) ? raw : "panelMemory";
    })();

    function setActiveOpsCard(cardId, persist = true) {
      activeOpsCard = allowedOpsCards.has(cardId) ? cardId : "panelMemory";
      document.body.dataset.opsCard = activeOpsCard;
      if (persist) localStorage.setItem(opsActiveCardKey, activeOpsCard);
      opsJumps.forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.opsTarget === activeOpsCard);
      });
    }

    function applyControlCards(selected) {
      controlCards.forEach((card) => {
        const group = card.getAttribute("data-control-card");
        if (group !== selected) {
          card.classList.remove("is-visible");
          return;
        }
        if (selected === "ops") {
          card.classList.toggle("is-visible", card.id === activeOpsCard);
          return;
        }
        card.classList.add("is-visible");
      });
    }

    function applyControlView(view) {
      const selected = view || "connection";
      localStorage.setItem(controlViewKey, selected);
      document.body.dataset.controlView = selected;
      document.body.classList.toggle("control-mode-ops", selected === "ops");
      traceUI("ControlView", `switch -> ${selected}`, selected === "ops" ? "warn" : "update");

      controlTabs.forEach((el) => {
        el.classList.toggle("is-active", el.dataset.controlView === selected);
      });

      controlJumps.forEach((el) => {
        el.classList.toggle("is-active", el.dataset.controlView === selected);
      });

      applyControlCards(selected);

      if (controlHintBox) controlHintBox.textContent = controlHints[selected] || "พร้อมใช้งาน";

      if (submitBtn) {
        submitBtn.textContent = selected === "connection"
          ? "Connect / Refresh"
          : selected === "tools"
            ? "Run Tool"
            : "Refresh Ops";
      }

      if (cancelBtn) {
        cancelBtn.textContent = selected === "tools" ? "Clear Tool Draft" : "Clear Draft";
      }

      if (logBtn) {
        logBtn.textContent = selected === "ops" ? "Open Activity" : "Open Stream";
      }
    }

    function applySidebarButtons() {
      const leftClosed = document.body.classList.contains("left-collapsed");
      const rightClosed = document.body.classList.contains("right-collapsed");
      const leftOpenMobile = document.body.classList.contains("left-open");
      const rightOpenMobile = document.body.classList.contains("right-open");

      if (backdrop) {
        const isOpen = mqMobile.matches && (leftOpenMobile || rightOpenMobile);
        backdrop.hidden = !isOpen;
      }

      if (leftToggle) {
        const leftIcon = leftToggle.querySelector(".edge-tab__icon");
        const leftLabel = leftToggle.querySelector(".edge-tab__label");
        const leftText = mqMobile.matches ? (leftOpenMobile ? "Close" : "Menu") : (leftClosed ? "Menu" : "Hide");
        if (leftIcon) leftIcon.textContent = leftClosed ? "☰" : "◀";
        if (leftLabel) leftLabel.textContent = leftText;
        leftToggle.title = localStorage.getItem(leftPinnedKey) === "1" ? "Menu pinned" : "Menu auto";
      }
      if (rightToggle) {
        const rightIcon = rightToggle.querySelector(".edge-tab__icon");
        const rightLabel = rightToggle.querySelector(".edge-tab__label");
        const rightText = mqMobile.matches ? (rightOpenMobile ? "Close" : "Panel") : (rightClosed ? "Panel" : "Hide");
        if (rightIcon) rightIcon.textContent = rightClosed ? "⚙" : "▶";
        if (rightLabel) rightLabel.textContent = rightText;
        rightToggle.title = localStorage.getItem(rightPinnedKey) === "1" ? "Panel pinned" : "Panel auto";
      }
    }

    function isDesktop() {
      return !mqMobile.matches;
    }

    function isPinned(side) {
      return localStorage.getItem(side === "left" ? leftPinnedKey : rightPinnedKey) === "1";
    }

    function setPinned(side, value) {
      localStorage.setItem(side === "left" ? leftPinnedKey : rightPinnedKey, value ? "1" : "0");
    }

    function setCollapsed(side, collapsed, persist = true) {
      const cls = side === "left" ? "left-collapsed" : "right-collapsed";
      const key = side === "left" ? leftCollapsedKey : rightCollapsedKey;
      document.body.classList.toggle(cls, collapsed);
      document.body.dataset[side === "left" ? "leftState" : "rightState"] = collapsed ? "collapsed" : "expanded";
      if (persist) localStorage.setItem(key, collapsed ? "1" : "0");
    }

    function autoExpand(side) {
      if (!isDesktop()) return;
      setCollapsed(side, false, false);
      applySidebarButtons();
    }

    function autoCollapse(side) {
      if (!isDesktop() || isPinned(side)) return;
      setCollapsed(side, true, false);
      applySidebarButtons();
    }

    function applyDesktopSidebarState() {
      if (mqMobile.matches) return;
      const leftCollapsed = localStorage.getItem(leftCollapsedKey) === "1" && !isPinned("left");
      const rightCollapsed = localStorage.getItem(rightCollapsedKey) === "1" && !isPinned("right");
      setCollapsed("left", leftCollapsed, false);
      setCollapsed("right", rightCollapsed, false);
      document.body.classList.remove("left-open", "right-open");
      applySidebarButtons();
    }

    if (localStorage.getItem("innovaMenuBoilerplates") === "1") {
      ensureMenuBoilerplates();
    }

    navGroupToggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const group = toggle.dataset.navToggle;
        if (!group) return;
        setAccordionGroup(group);
      });
    });

    navLinks.forEach((el) => {
      el.addEventListener("click", () => {
        const centerView = el.dataset.centerView;
        const starMapView = el.dataset.starmapView || null;
        const parentGroup = el.closest(".nav-group")?.getAttribute("data-nav-group") || null;
        applyCenterView(centerView, { starMapView, autoControl: true, sourceGroup: parentGroup });
        autoExpand("left");
        const wantsRightPanel = ["live", "chat", "devide", "stream", "activity", "agents"].includes(centerView || "");
        if (window.innerWidth < 1680) {
          if (wantsRightPanel) autoExpand("right");
          else autoCollapse("right");
        }
      });
    });

    centerGroupTabs.addEventListener("click", (ev) => {
      const target = ev.target.closest(".center-group-tab[data-center-view]");
      if (!(target instanceof HTMLElement)) return;
      const centerView = target.dataset.centerView || "live";
      const starMapView = target.dataset.starmapView || null;
      applyCenterView(centerView, {
        starMapView,
        autoControl: true,
        sourceGroup: centerGroupMap[centerView] || null,
      });
    });

    controlTabs.forEach((el) => {
      el.addEventListener("click", () => {
        applyControlView(el.dataset.controlView);
        autoExpand("right");
      });
    });

    controlJumps.forEach((el) => {
      el.addEventListener("click", () => {
        const target = el.dataset.controlView;
        applyControlView(target);
        autoExpand("right");
      });
    });

    opsJumps.forEach((el) => {
      el.addEventListener("click", () => {
        const targetId = el.dataset.opsTarget;
        if (!targetId) return;
        setActiveOpsCard(targetId);
        applyControlView("ops");
        autoExpand("right");
        const target = $(targetId);
        if (!target) return;
        try {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch {
          target.scrollIntoView();
        }
      });
    });

    leftToggle?.addEventListener("click", () => {
      if (mqMobile.matches) {
        const next = !document.body.classList.contains("left-open");
        document.body.classList.toggle("left-open", next);
        if (next) document.body.classList.remove("right-open");
      } else {
        const next = !document.body.classList.contains("left-collapsed");
        setCollapsed("left", next);
        setPinned("left", !next);
      }
      applySidebarButtons();
    });

    rightToggle?.addEventListener("click", () => {
      if (mqMobile.matches) {
        const next = !document.body.classList.contains("right-open");
        document.body.classList.toggle("right-open", next);
        if (next) document.body.classList.remove("left-open");
      } else {
        const next = !document.body.classList.contains("right-collapsed");
        setCollapsed("right", next);
        setPinned("right", !next);
      }
      applySidebarButtons();
    });

    ribbonToggleBtn?.addEventListener("click", () => {
      const isCompact = document.body.classList.contains("ribbon-compact");
      applyRibbonCompact(!isCompact);
    });

    starMapFrame?.addEventListener("load", () => {
      starMapFrame.dataset.loaded = "1";
      setFrameLoading("starmap", false);
    });
    mcpManagerFrame?.addEventListener("load", () => {
      mcpManagerFrame.dataset.loaded = "1";
      setFrameLoading("knowledge", false);
    });

    submitBtn?.addEventListener("click", () => {
      autoExpand("right");
      const activeControl = localStorage.getItem(controlViewKey) || "connection";

      if (activeControl === "connection") {
        if (connectBtn && !connectBtn.disabled) {
          connectBtn.click();
          if (controlHintBox) controlHintBox.textContent = "Connection mode: เริ่มเชื่อมต่อแล้ว";
        } else if (disconnectBtn && !disconnectBtn.disabled) {
          disconnectBtn.click();
          if (controlHintBox) controlHintBox.textContent = "Connection mode: ตัดการเชื่อมต่อแล้ว";
        } else if (controlHintBox) {
          controlHintBox.textContent = "Connection mode: ระบบกำลังเชื่อมต่ออยู่";
        }
        return;
      }

      if (activeControl === "tools") {
        if (toolCallBtn && !toolCallBtn.disabled) {
          toolCallBtn.click();
          if (controlHintBox) controlHintBox.textContent = "Tools mode: เรียก tool แล้ว ดูผลลัพธ์ด้านล่าง";
        } else if (controlHintBox) {
          controlHintBox.textContent = "Tools mode: ยังเรียกไม่ได้ โปรดเชื่อมต่อเซิร์ฟเวอร์ก่อน";
        }
        return;
      }

      if (workflowLoadBtn && !workflowLoadBtn.disabled) workflowLoadBtn.click();
      if (hitlRefreshBtn && !hitlRefreshBtn.disabled) hitlRefreshBtn.click();
      if (memorySearchBtn && !memorySearchBtn.disabled) memorySearchBtn.click();
      if (controlHintBox) {
        controlHintBox.textContent = "Ops mode: รีเฟรช Memory / Workflow / HITL แล้ว";
      }
    });

    cancelBtn?.addEventListener("click", () => {
      autoExpand("right");
      const activeControl = localStorage.getItem(controlViewKey) || "connection";
      if (toolArgsEl) toolArgsEl.value = "{}";
      if (chatInputEl) chatInputEl.value = "";
      if (controlHintBox) {
        controlHintBox.textContent = activeControl === "tools"
          ? "Tools mode: ล้าง args/draft เรียบร้อย"
          : "ล้าง draft input เรียบร้อย";
      }
    });

    logBtn?.addEventListener("click", () => {
      const activeControl = localStorage.getItem(controlViewKey) || "connection";
      applyCenterView(activeControl === "ops" ? "activity" : "stream");
      autoExpand("right");
      if (controlHintBox) {
        controlHintBox.textContent = activeControl === "ops"
          ? "เปิด Activity Console แล้ว"
          : "เปิด Raw Stream Debug แล้ว";
      }
    });

    knowledgeOpenOpsBtn?.addEventListener("click", () => {
      applyControlView("ops");
      autoExpand("right");
      if (controlHintBox) controlHintBox.textContent = "Ops mode: opened from MCP Knowledge";
    });

    knowledgeOpenMemoryBtn?.addEventListener("click", () => {
      setActiveOpsCard("panelMemory");
      applyControlView("ops");
      autoExpand("right");
      const target = $("panelMemory");
      if (target) {
        try {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch {
          target.scrollIntoView();
        }
      }
      if (memoryQuery) memoryQuery.focus();
    });

    knowledgeRunSearchBtn?.addEventListener("click", () => {
      setActiveOpsCard("panelMemory");
      applyControlView("ops");
      autoExpand("right");
      if (memoryQuery) memoryQuery.value = "project progress";
      if (memorySearchBtn && !memorySearchBtn.disabled) memorySearchBtn.click();
    });

    centerCol?.addEventListener("click", () => {
      if (!isDesktop()) return;
      if (window.innerWidth < 1500) {
        autoCollapse("right");
      }
    });

    const dragItems = Array.from(document.querySelectorAll(".drag-item"));
    const dragLanes = Array.from(document.querySelectorAll(".drag-lane"));
    let dragging = null;

    dragItems.forEach((item) => {
      item.addEventListener("dragstart", () => {
        dragging = item;
        item.classList.add("is-dragging");
      });
      item.addEventListener("dragend", () => {
        item.classList.remove("is-dragging");
        dragging = null;
      });
    });

    dragLanes.forEach((lane) => {
      lane.addEventListener("dragover", (ev) => {
        ev.preventDefault();
      });
      lane.addEventListener("dragenter", () => lane.classList.add("is-over"));
      lane.addEventListener("dragleave", () => lane.classList.remove("is-over"));
      lane.addEventListener("drop", (ev) => {
        ev.preventDefault();
        lane.classList.remove("is-over");
        if (!dragging) return;
        lane.appendChild(dragging);
      });
    });

    // Backdrop tap → close whichever mobile sidebar is open
    if (backdrop) {
      backdrop.addEventListener("click", () => {
        document.body.classList.remove("left-open", "right-open");
        applySidebarButtons();
      });
    }

    window.addEventListener("resize", () => {
      if (!mqMobile.matches) {
        document.body.classList.remove("left-open", "right-open");
      }
      applyDesktopSidebarState();
      applySidebarButtons();
    });

    const initialCenter = localStorage.getItem(centerViewKey) || "live";
    const initialControl = localStorage.getItem(controlViewKey) || "connection";
    const initialStarMapView = localStorage.getItem(starMapViewKey) || "starmap";
    const initialRibbonCompact = localStorage.getItem(ribbonCompactKey) !== "0";
    setActiveOpsCard(localStorage.getItem(opsActiveCardKey) || "panelMemory", false);
    const initialGroupState = readNavGroupState();
    const initialGroup = Object.keys(initialGroupState).find((group) => initialGroupState[group] === true)
      || centerGroupMap[initialCenter]
      || "general";
    setAccordionGroup(initialGroup, false);
    applyRibbonCompact(initialRibbonCompact, false);
    setFrameLoading("starmap", true);
    setFrameLoading("knowledge", true);

    window.__innovaNavigateToView = (view, options = {}) => {
      const nextView = typeof view === "string" ? view : "activity";
      const nextStarMapView = typeof options.starMapView === "string" ? options.starMapView : null;
      const nextControlView = typeof options.controlView === "string" ? options.controlView : null;
      applyCenterView(nextView, { starMapView: nextStarMapView, autoControl: true });
      if (nextControlView) applyControlView(nextControlView);
      autoExpand("left");
      autoExpand("right");
    };

    applyCenterView(initialCenter, { starMapView: initialStarMapView });
    applyControlView(initialControl);
    applyDesktopSidebarState();
    applySidebarButtons();

    const skeleton = document.getElementById("appSkeleton");
    window.requestAnimationFrame(() => {
      document.body.classList.remove("ui-loading");
      if (skeleton) skeleton.setAttribute("aria-hidden", "true");
    });
  })();

  // ── Phase 8: Solution Memory Search ────────────────────────────────────────
  (() => {
    const queryEl = $("memoryQuery");
    const searchBtn = $("memorySearchBtn");
    const resultsEl = $("memoryResults");
    const projectEl = $("memoryProject");

    if (!searchBtn || !resultsEl) return;

    function escHtml(s) {
      return String(s || "")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function renderResults(items) {
      if (!items || !items.length) {
        resultsEl.innerHTML = '<div class="memory-empty">ไม่พบความจำที่ตรงกับคำค้นหา</div>';
        return;
      }
      if (items[0] && (items[0].error || items[0].message)) {
        resultsEl.innerHTML = `<div class="memory-empty">${escHtml(items[0].error || items[0].message)}</div>`;
        return;
      }
      resultsEl.innerHTML = items.map(r => `
        <div class="memory-item">
          <div class="memory-item__sig">${escHtml(r.error_signature)}</div>
          <div class="memory-item__sol">${escHtml(r.solution_desc)}</div>
          ${r.context ? `<div class="memory-item__meta">context: ${escHtml(r.context)}</div>` : ""}
          <div class="memory-item__meta">project: ${escHtml(r.project || "—")} &nbsp;|&nbsp; ${escHtml(r.timestamp || "")}</div>
        </div>
      `).join("");
    }

    async function doSearch() {
      const q = (queryEl ? queryEl.value : "").trim();
      if (!q) { resultsEl.innerHTML = '<div class="memory-empty">กรุณาใส่คำค้นหา</div>'; return; }
      const project = projectEl ? projectEl.value : "";
      resultsEl.innerHTML = '<div class="memory-empty">กำลังค้นหา…</div>';
      try {
        const url = `/api/memory/search?query=${encodeURIComponent(q)}` +
          (project ? `&project=${encodeURIComponent(project)}` : "");
        const resp = await fetch(url);
        const data = await resp.json();
        renderResults(Array.isArray(data) ? data : [data]);
      } catch (err) {
        resultsEl.innerHTML = `<div class="memory-empty">Error: ${escHtml(String(err))}</div>`;
      }
    }

    searchBtn.addEventListener("click", doSearch);
    if (queryEl) queryEl.addEventListener("keydown", (e) => { if (e.key === "Enter") doSearch(); });
  })();

  // ── Phase 8: Workflow Viewer ────────────────────────────────────────────────
  (() => {
    const loadBtn = $("workflowLoadBtn");
    const rulesEl = $("workflowRules");
    if (!loadBtn || !rulesEl) return;

    function escHtml(s) {
      return String(s || "")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function renderRules(rules) {
      if (!rules || !rules.length) {
        rulesEl.innerHTML = "<div>ไม่พบ rule</div>"; return;
      }
      if (rules[0] && rules[0].error) {
        rulesEl.innerHTML = `<div class="memory-empty">Error: ${escHtml(rules[0].error)}</div>`; return;
      }
      const rows = rules.map(r => `
        <tr>
          <td><span class="wf-trigger">${escHtml(r.trigger)}</span></td>
          <td><span class="wf-arrow">→</span></td>
          <td><span class="wf-role">${escHtml(r.next_role)}</span></td>
          <td><span class="wf-action">${escHtml(r.action)}</span></td>
          <td>${escHtml(r.description || "")}</td>
        </tr>
      `).join("");
      rulesEl.innerHTML = `
        <table class="workflow-table">
          <thead><tr>
            <th>Trigger</th><th></th><th>Next Role</th><th>Action</th><th>Description</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
    }

    async function loadRules() {
      rulesEl.innerHTML = "<div>กำลังโหลด…</div>";
      try {
        const resp = await fetch("/api/workflow/rules");
        const data = await resp.json();
        renderRules(Array.isArray(data) ? data : [data]);
      } catch (err) {
        rulesEl.innerHTML = `<div class="memory-empty">Error: ${String(err)}</div>`;
      }
    }

    loadBtn.addEventListener("click", loadRules);
    loadRules(); // auto-load on page open
  })();

  // ── Phase 11: AI Network Visualization (Force-Graph, hardened UX) ──────────
  window.processNetworkEvent = null;
  (() => {
    const container = $("networkGraph");
    const hintEl = $("networkHint");
    const feedEl = $("networkFeed");
    const fitBtn = $("networkFitBtn");
    const pauseBtn = $("networkPauseBtn");
    const clearBtn = $("networkClearBtn");

    const eventKeys = new Set();
    const recentEvents = [];
    let paused = false;
    let Graph = null;
    let fallbackMode = false;

    const roleGroup = (role) => {
      const txt = String(role || "").toLowerCase();
      if (txt.includes("sa")) return 1;
      if (txt.includes("dev")) return 2;
      if (txt.includes("qe") || txt.includes("quality")) return 3;
      if (txt.includes("wit")) return 4;
      if (txt.includes("gravity")) return 5;
      if (txt.includes("system")) return 0;
      return 6;
    };

    const graphState = {
      nodes: new Map(),
      links: new Map(),
    };

    function renderFeed() {
      if (!feedEl) return;
      if (!recentEvents.length) {
        feedEl.innerHTML = '<div class="small" style="color: var(--muted)">No events yet</div>';
        return;
      }
      feedEl.innerHTML = recentEvents
        .slice(-20)
        .reverse()
        .map((ev) => {
          const ts = String(ev.published_at || ev.timestamp || "").replace("T", " ").slice(11, 19) || "--:--:--";
          return `<div class="network-feed__item"><div class="network-feed__time">${ts}</div><div class="network-feed__text">${ev.source_role} → ${ev.target_role} · ${ev.topic}</div></div>`;
        })
        .join("");
    }

    function toGraphData() {
      return {
        nodes: [...graphState.nodes.values()],
        links: [...graphState.links.values()],
      };
    }

    function fallbackColor(group) {
      const g = Number(group || 0);
      const hue = (g * 53 + 180) % 360;
      return `hsl(${hue} 85% 62%)`;
    }

    function renderFallbackGraph() {
      if (!container) return;
      const width = Math.max(320, container.clientWidth || 320);
      const height = Math.max(220, container.clientHeight || 220);
      const data = toGraphData();
      const nodes = data.nodes;
      const links = data.links;

      if (!nodes.length) {
        container.innerHTML = '<div class="small" style="padding:14px;color:var(--muted)">Network graph is waiting for events…</div>';
        return;
      }

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.max(70, Math.min(width, height) * 0.34);
      const nodePos = new Map();

      nodes.forEach((n, idx) => {
        const angle = (Math.PI * 2 * idx) / Math.max(nodes.length, 1) - Math.PI / 2;
        nodePos.set(n.id, {
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
          color: fallbackColor(n.group),
        });
      });

      const esc = (v) => String(v || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;");

      const linkSvg = links.map((l, idx) => {
        const s = nodePos.get(l.source);
        const t = nodePos.get(l.target);
        if (!s || !t) return "";
        const mx = (s.x + t.x) / 2;
        const my = (s.y + t.y) / 2 - 26;
        const pulse = !paused && l._pulse && l._pulse > Date.now() ? " network-link--pulse" : "";
        const w = Math.max(1.2, Number(l.width || 1));
        return `<path class="network-link${pulse}" d="M ${s.x.toFixed(1)} ${s.y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${t.x.toFixed(1)} ${t.y.toFixed(1)}" stroke="${s.color}" stroke-width="${w.toFixed(2)}" fill="none" marker-end="url(#networkArrow)" opacity="0.9"><title>${esc(l.topic || l.label || "event")} (${Number(l.count || 1)})</title></path>`;
      }).join("");

      const nodeSvg = nodes.map((n) => {
        const p = nodePos.get(n.id);
        if (!p) return "";
        return `<g class="network-node"><circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="18" fill="${p.color}" fill-opacity="0.18" stroke="${p.color}" stroke-width="2"></circle><text x="${p.x.toFixed(1)}" y="${(p.y + 4).toFixed(1)}" text-anchor="middle" class="network-node__label">${esc(n.name || n.id)}</text></g>`;
      }).join("");

      container.innerHTML = `
        <svg class="network-fallback-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" aria-label="AI network graph">
          <defs>
            <marker id="networkArrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="currentColor"></path>
            </marker>
          </defs>
          <rect x="0" y="0" width="${width}" height="${height}" class="network-fallback-bg"></rect>
          ${linkSvg}
          ${nodeSvg}
        </svg>`;
    }

    function repaintGraph() {
      if (fallbackMode) {
        renderFallbackGraph();
        return;
      }
      if (!Graph) return;
      Graph.graphData(toGraphData());
    }

    function normalizeNetworkEvent(raw) {
      if (!raw || typeof raw !== "object") return null;
      const source_role = String(raw.source_role || raw.source || "system").trim() || "system";
      const target_role = String(raw.target_role || raw.target || "").trim();
      if (!target_role) return null;
      const topic = String(raw.topic || raw.label || "event").trim() || "event";
      const published_at = String(raw.published_at || raw.timestamp || "").trim();
      return {
        event_id: raw.event_id || null,
        source_role,
        target_role,
        topic,
        published_at,
      };
    }

    function ingestNetworkEvent(raw, options = {}) {
      const ev = normalizeNetworkEvent(raw);
      if (!ev) return;

      const dedupeKey = ev.event_id || `${ev.published_at}|${ev.source_role}|${ev.target_role}|${ev.topic}`;
      if (eventKeys.has(dedupeKey)) return;
      eventKeys.add(dedupeKey);

      if (!graphState.nodes.has(ev.source_role)) {
        graphState.nodes.set(ev.source_role, {
          id: ev.source_role,
          name: ev.source_role,
          group: roleGroup(ev.source_role),
        });
      }
      if (!graphState.nodes.has(ev.target_role)) {
        graphState.nodes.set(ev.target_role, {
          id: ev.target_role,
          name: ev.target_role,
          group: roleGroup(ev.target_role),
        });
      }

      const linkKey = `${ev.source_role}|${ev.target_role}|${ev.topic}`;
      const link = graphState.links.get(linkKey) || {
        source: ev.source_role,
        target: ev.target_role,
        label: ev.topic,
        topic: ev.topic,
        count: 0,
        width: 1,
        _pulse: 0,
      };

      link.count += 1;
      link.width = Math.min(6, 1 + Math.log2(link.count + 1));
      link.lastAt = ev.published_at || new Date().toISOString();
      if (!paused && options.animate !== false) link._pulse = Date.now() + 1400;
      graphState.links.set(linkKey, link);

      recentEvents.push(ev);
      if (recentEvents.length > 200) recentEvents.splice(0, recentEvents.length - 200);
      renderFeed();

      if (hintEl) hintEl.textContent = `Network status: ${graphState.nodes.size} nodes, ${graphState.links.size} links, ${recentEvents.length} events`;
      repaintGraph();
    }

    function seedDemoTopology() {
      if (graphState.nodes.size || graphState.links.size) return;
      const demo = [
        { source_role: "System", target_role: "SA", topic: "PLAN_READY" },
        { source_role: "SA", target_role: "Dev", topic: "HANDOFF" },
        { source_role: "Dev", target_role: "QE", topic: "TEST_REQUEST" },
        { source_role: "QE", target_role: "SA", topic: "REPORT" },
      ];
      for (const item of demo) ingestNetworkEvent(item, { animate: false });
      if (hintEl) hintEl.textContent = "Network status: demo topology loaded (waiting for live events)";
    }

    async function hydrateFromApi() {
      try {
        const resp = await fetch("/api/network/recent?limit=500");
        if (!resp.ok) return;
        const data = await resp.json();
        const items = Array.isArray(data?.items) ? data.items : [];
        for (const item of items) ingestNetworkEvent(item, { animate: false });
      } catch { }
    }

    function startFallbackPoll() {
      hydrateFromApi().catch(() => { });
      setInterval(() => {
        hydrateFromApi().catch(() => { });
      }, 7000);
    }

    if (!container || typeof ForceGraph !== "function") {
      fallbackMode = true;
      if (hintEl) hintEl.textContent = "Network status: fallback SVG graph mode";
      window.processNetworkEvent = (ev) => ingestNetworkEvent(ev, { animate: false });
      seedDemoTopology();
      renderFallbackGraph();
      window.addEventListener("resize", renderFallbackGraph);
      startFallbackPoll();
      return;
    }
    try {
      Graph = ForceGraph()(container)
        .graphData({ nodes: [], links: [] })
        .nodeId("id")
        .nodeLabel((n) => `${n.name || n.id}`)
        .nodeAutoColorBy("group")
        .linkDirectionalArrowLength(4)
        .linkDirectionalArrowRelPos(1)
        .linkCurvature(0.18)
        .linkLabel((l) => `${l.topic || l.label || "event"} (${l.count || 1})`)
        .linkWidth((l) => l.width || 1)
        .linkDirectionalParticles((l) => (!paused && l._pulse && l._pulse > Date.now() ? 3 : 0))
        .linkDirectionalParticleSpeed(0.01)
        .d3Force("charge").strength(-290);

      Graph.d3Force("link").distance(120);

      if (typeof ResizeObserver === "function") {
        const resizeObserver = new ResizeObserver(() => {
          Graph.width(container.clientWidth);
          Graph.height(container.clientHeight);
        });
        resizeObserver.observe(container);
      } else {
        window.addEventListener("resize", () => {
          try {
            Graph.width(container.clientWidth);
            Graph.height(container.clientHeight);
          } catch { }
        });
      }
    } catch {
      fallbackMode = true;
      if (hintEl) hintEl.textContent = "Network status: ForceGraph init failed, switched to fallback SVG graph";
      seedDemoTopology();
      renderFallbackGraph();
      window.addEventListener("resize", renderFallbackGraph);
      window.processNetworkEvent = (ev) => ingestNetworkEvent(ev, { animate: false });
      startFallbackPoll();
      return;
    }

    fitBtn?.addEventListener("click", () => {
      try { Graph.zoomToFit(600, 40); } catch { }
    });

    pauseBtn?.addEventListener("click", () => {
      paused = !paused;
      pauseBtn.textContent = paused ? "Resume" : "Pause";
      if (hintEl && paused) hintEl.textContent = "Network status: paused";
      else if (hintEl) hintEl.textContent = `Network status: ${graphState.nodes.size} nodes, ${graphState.links.size} links, ${recentEvents.length} events`;
      repaintGraph();
    });

    clearBtn?.addEventListener("click", () => {
      graphState.nodes.clear();
      graphState.links.clear();
      recentEvents.length = 0;
      eventKeys.clear();
      renderFeed();
      if (hintEl) hintEl.textContent = "Network status: cleared";
      repaintGraph();
    });

    window.processNetworkEvent = (ev) => ingestNetworkEvent(ev, { animate: true });
    startFallbackPoll();
  })();

  // ── Phase 24: Security Center WebSocket & API ─────────────────────────────
  (() => {
    if (viewAuditBtn && viewPoliciesBtn) {
      viewAuditBtn.addEventListener("click", () => {
        auditPanel.classList.remove("hidden");
        policiesPanel.classList.add("hidden");
        viewAuditBtn.classList.remove("secondary");
        viewPoliciesBtn.classList.add("secondary");
      });
      viewPoliciesBtn.addEventListener("click", () => {
        policiesPanel.classList.remove("hidden");
        auditPanel.classList.add("hidden");
        viewPoliciesBtn.classList.remove("secondary");
        viewAuditBtn.classList.add("secondary");
        fetchPolicies();
      });
      clearAuditBtn.addEventListener("click", () => {
        if (auditOut) auditOut.innerHTML = "";
      });
      fetchPoliciesBtn.addEventListener("click", fetchPolicies);
    }

    async function fetchPolicies() {
      if (!policiesOut) return;
      policiesOut.textContent = "Loading Matrix...";
      try {
        const res = await fetch("/api/policies");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        policiesOut.textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        const fallback = {
          ok: false,
          source: "fallback",
          reason: String(err?.message || err),
          matrix: [
            { tool: "workspace_write", risk: "medium", mode: "approval" },
            { tool: "run_command_shell", risk: "high", mode: "approval" },
            { tool: "ask_local_ai", risk: "low", mode: "allow" },
          ],
        };
        policiesOut.textContent = JSON.stringify(fallback, null, 2);
      }
    }

    function seedAuditFallback(reason) {
      if (!auditOut) return;
      if (auditOut.childNodes.length > 0) return;
      const line = document.createElement("div");
      line.className = "line--entity";
      const now = new Date().toLocaleTimeString();
      line.textContent = `[${now}] audit fallback: ${reason}`;
      auditOut.prepend(line);
    }

    function initAuditWs() {
      if (!auditOut || !auditConnStatus) return;
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/audit`;

      auditConnStatus.textContent = "Connecting to Audit Stream...";
      auditConnStatus.style.color = "var(--text-sec)";

      auditWs = new WebSocket(wsUrl);

      auditWs.onopen = () => {
        auditRetryCount = 0;
        auditConnStatus.textContent = "Connected (Realtime)";
        auditConnStatus.style.color = "var(--ok)";
      };

      auditWs.onerror = () => {
        auditConnStatus.textContent = "Audit stream unavailable";
        auditConnStatus.style.color = "var(--warn)";
        seedAuditFallback("/ws/audit unavailable, showing local diagnostics only");
      };

      auditWs.onmessage = (evt) => {
        try {
          const payload = JSON.parse(evt.data);
          const line = document.createElement("div");
          line.className = "line--entity";
          const d = new Date(payload.ts * 1000 || Date.now());
          line.textContent = `[${d.toLocaleTimeString()}] ` + JSON.stringify(payload);
          auditOut.prepend(line);

          while (auditOut.childNodes.length > 50) {
            auditOut.removeChild(auditOut.lastChild);
          }
        } catch {
          // ignore non-json
        }
      };

      auditWs.onclose = () => {
        auditRetryCount += 1;
        if (auditRetryCount > 5) {
          auditConnStatus.textContent = "Audit stream offline (manual retry)";
          auditConnStatus.style.color = "var(--warn)";
          seedAuditFallback("retry exhausted");
          return;
        }
        auditConnStatus.textContent = `Disconnected (Retry ${auditRetryCount}/5)...`;
        auditConnStatus.style.color = "var(--warn)";
        if (auditRetryTimer) clearTimeout(auditRetryTimer);
        auditRetryTimer = setTimeout(initAuditWs, 3000 * auditRetryCount);
      };
    }

    // Lazy-init: only open the WebSocket when the Security Center panel
    // becomes visible for the first time.  Avoids failed-connection noise
    // on every page load when the user never opens this panel.
    const securityPanelEl = document.getElementById("panelSecurityCenter");
    if (securityPanelEl) {
      const auditObs = new MutationObserver(() => {
        if (securityPanelEl.classList.contains("is-visible") && !auditWs) {
          initAuditWs();
        }
      });
      auditObs.observe(securityPanelEl, { attributes: true, attributeFilter: ["class"] });
    }
  })();

  // ── Phase 7: Auto-Pilot Toast Notification System ─────────────────────────
  (() => {
    const container = $("toastContainer");
    if (!container) return;

    function resolveToastTarget(payload, text) {
      const body = String(text || "").toLowerCase();
      const obj = payload && typeof payload === "object" ? payload : {};
      if (typeof obj.view === "string") {
        return {
          view: obj.view,
          starMapView: typeof obj.starMapView === "string" ? obj.starMapView : null,
          controlView: typeof obj.controlView === "string" ? obj.controlView : null,
        };
      }
      if (/starmap|agent map|knowledge universe/.test(body)) {
        return { view: "starmap", starMapView: /knowledge/.test(body) ? "knowledge" : "starmap", controlView: "ops" };
      }
      if (/memory|workflow|approval|hitl|policy|cooldown/.test(body)) {
        return { view: "activity", controlView: "ops" };
      }
      if (/network|telemetry|dashboard|monitoring/.test(body)) {
        return { view: "monitoring", controlView: "connection" };
      }
      if (/error|warning|failed|exception/.test(body)) {
        return { view: "activity", controlView: "ops" };
      }
      return { view: "activity", controlView: "tools" };
    }

    /** Classify a message string → CSS modifier */
    function _toastClass(msg) {
      if (/✅|สำเร็จ|completed|COMPLETED/i.test(msg)) return "toast--success";
      if (/❌|error|ERROR|ข้อผิดพลาด/i.test(msg)) return "toast--error";
      if (/⚠️|warning|WARNING/i.test(msg)) return "toast--warning";
      return "";  // default blue
    }

    /** Show a toast that auto-dismisses after `ms` milliseconds. */
    function showToast(message, ms = 3000) {
      const text = humanizeAILog(message);
      const cls = _toastClass(text);
      const target = resolveToastTarget(message, text);
      const toast = document.createElement("div");
      toast.className = "toast" + (cls ? " " + cls : "");
      toast.setAttribute("role", "button");
      toast.setAttribute("tabindex", "0");
      toast.innerHTML =
        `<span class="toast__icon">🤖</span>` +
        `<span class="toast__text">${escHtml(text)}</span>` +
        `<span class="toast__open">Open</span>` +
        `<button class="toast__close" title="Dismiss">✕</button>`;

      // Dismiss on close-button click
      toast.querySelector(".toast__close").addEventListener("click", (e) => {
        e.stopPropagation();
        _dismissToast(toast);
      });
      const openTarget = () => {
        if (typeof window.__innovaNavigateToView === "function") {
          window.__innovaNavigateToView(target.view, {
            starMapView: target.starMapView,
            controlView: target.controlView,
          });
        }
        if (typeof pushActivity === "function") {
          pushActivity({
            kind: "system",
            label: "toast",
            title: "Toast opened detail panel",
            detail: text,
          }, "server");
        }
        _dismissToast(toast);
      };

      // Click/keyboard to open full panel context
      toast.addEventListener("click", openTarget);
      toast.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openTarget();
        }
      });

      container.prepend(toast);
      while (container.children.length > 5) {
        container.lastElementChild?.remove();
      }

      // Auto-dismiss
      const timer = setTimeout(() => _dismissToast(toast), ms);
      toast._dismissTimer = timer;
    }

    function _dismissToast(toast) {
      clearTimeout(toast._dismissTimer);
      toast.classList.add("toast--fading");
      toast.addEventListener("animationend", () => toast.remove(), { once: true });
    }

    function escHtml(s) {
      return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    /** Connect to the Dashboard WebSocket for toasts and real-time events.
     *  Retries up to MAX_RETRIES times with back-off then shows a reconnect button. */
    const _WS_MAX_RETRIES = 20;
    const _toastSuppressionMap = new Map();

    function shouldSuppressToast(payload) {
      const obj = payload && typeof payload === "object" ? payload : {};
      const type = String(obj.type || "").toLowerCase();
      if (type === "swarm_status" || type === "heartbeat") {
        return true;
      }
      const message = String(obj.message || "");
      if (!message) return false;
      const now = Date.now();
      const key = `${type}|${message}`;
      const ttlMs = 7000;
      const lastSeen = _toastSuppressionMap.get(key) || 0;
      if (now - lastSeen < ttlMs) {
        return true;
      }
      _toastSuppressionMap.set(key, now);
      if (_toastSuppressionMap.size > 120) {
        const expiry = now - ttlMs;
        for (const [k, ts] of _toastSuppressionMap.entries()) {
          if (ts < expiry) {
            _toastSuppressionMap.delete(k);
          }
        }
      }
      return false;
    }

    function connectDashboardWebSocket(retryCount) {
      const retry = typeof retryCount === "number" ? retryCount : 0;
      if (retry > _WS_MAX_RETRIES) {
        console.warn("[innova-bot] /ws/activity unreachable after " + _WS_MAX_RETRIES + " retries — showing reconnect UI");
        const existingBanner = document.getElementById("ws-reconnect-banner");
        if (!existingBanner) {
          const banner = document.createElement("div");
          banner.id = "ws-reconnect-banner";
          banner.setAttribute("role", "alert");
          banner.style.cssText = "position:fixed;bottom:12px;left:50%;transform:translateX(-50%);" +
            "background:#b45309;color:#fff;padding:8px 16px;border-radius:6px;" +
            "font-size:13px;z-index:9999;display:flex;align-items:center;gap:10px;";
          banner.innerHTML = '<span>⚠️ Live feed disconnected.</span>' +
            '<button id="ws-reconnect-btn" style="background:#fff;color:#b45309;border:none;' +
            'border-radius:4px;padding:3px 10px;cursor:pointer;font-size:12px;">Reconnect</button>';
          document.body.appendChild(banner);
          document.getElementById("ws-reconnect-btn").addEventListener("click", () => {
            banner.remove();
            connectDashboardWebSocket(0);
          });
        }
        return;
      }
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/activity`;
      const ws = new WebSocket(wsUrl);

      ws.onmessage = (evt) => {
        try {
          const payload = JSON.parse(evt.data);
          if (payload.type === "toast") {
            const msg = payload.message || evt.data;
            if (msg.includes("Notification stream connected")) return;
            if (shouldSuppressToast(payload)) return;
            showToast(payload);
          } else if (payload.type === "warning") {
            const msg = payload.message || evt.data;
            if (shouldSuppressToast({ type: "warning", message: msg })) return;
            showToast({ type: "warning", message: msg.startsWith("⚠️") ? msg : `⚠️ ${msg}` });
          } else if (payload.type === "progress") {
            const task = payload.task || "Background Task";
            const status = payload.status || payload.message || "running";
            if (shouldSuppressToast({ type: "progress", message: `${task}|${status}` })) return;
            showToast({ type: "progress", task, status, message: payload.message || status });
            pushActivity({
              kind: "system",
              label: "progress",
              title: task,
              status,
              detail: payload.message || status,
              project: payload.project || payload.workspace || "workspace",
              role: payload.role || payload.target_role || "-",
            }, "server");
          } else if (payload.type === "activity") {
            const ev = typeof payload.data === "string" ? JSON.parse(payload.data) : payload.data;
            if (typeof injectActivity === "function") injectActivity(ev);
          } else if (payload.type === "network_event") {
            const ev = typeof payload.data === "string" ? JSON.parse(payload.data) : payload.data;
            if (typeof processNetworkEvent === "function") processNetworkEvent(ev);
          } else if (payload.type === "swarm_status" || payload.type === "heartbeat") {
            // Keep high-frequency status events out of toast channel.
            if (typeof injectActivity === "function") injectActivity(payload);
          } else {
            const msg = payload.message || evt.data;
            if (shouldSuppressToast({ type: payload.type || "raw", message: msg })) return;
            showToast(payload.message ? payload : msg);
          }
        } catch (_) {
          showToast(evt.data);
        }
      };

      ws.onclose = () => {
        const delay = Math.min(3000 * (retry + 1), 15000);
        console.debug(`[innova-bot] /ws/activity closed, retry ${retry + 1}/${_WS_MAX_RETRIES} in ${delay}ms`);
        setTimeout(() => connectDashboardWebSocket(retry + 1), delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connectDashboardWebSocket(0);
  })();
})();
