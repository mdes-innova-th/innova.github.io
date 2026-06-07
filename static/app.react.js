(() => {
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const Redux = window.Redux;
  const ReactRedux = window.ReactRedux;
  if (!React || !ReactDOM || !Redux || !ReactRedux) return;

  const { createStore, combineReducers } = Redux;
  const { Provider, useDispatch, useSelector } = ReactRedux;

  const initialUi = {
    device: "notebook",
    width: window.innerWidth,
    height: window.innerHeight,
    status: "disconnected",
    statusKind: "neutral",
    theme: document.body.classList.contains("theme-light") ? "light" : "dark",
    density: localStorage.getItem("innovaDensity") || "comfortable",
    focus: localStorage.getItem("innovaFocus") || "all",
    workbenchMode: false,
  };

  const initialRealtime = {
    eps: 0,
    peakEps: 0,
    totalRaw: 0,
    totalActivity: 0,
    totalErrors: 0,
    totalTools: 0,
    recentKinds: [],
    series: [],
  };

  const initialConn = {
    endpoint: "-",
    lastEventAt: null,
    requiredTools: ["workspace_write", "run_command_shell", "job_start", "ask_local_ai"],
    availableTools: [],
  };

  const initialCitta = {
    emotionState: "AWAKENED",
    errorCount: 0,
    microThought: "Waiting for pulse...",
    macroThought: "Waiting for pulse...",
    appliedTam: "Constructive/Curiosity",
    safetyOverride: false,
    blockedInput: "",
  };

  function detectDevice(width) {
    if (width < 640) return "phone";
    if (width < 1024) return "tablet";
    if (width < 1920) return "notebook";
    return "tv";
  }

  function uiReducer(state = initialUi, action) {
    switch (action.type) {
      case "ui/viewport": {
        const width = Number(action.payload?.width || 0);
        const height = Number(action.payload?.height || 0);
        return {
          ...state,
          width,
          height,
          device: detectDevice(width),
        };
      }
      case "ui/status":
        return {
          ...state,
          status: String(action.payload?.status || state.status),
          statusKind: String(action.payload?.kind || "neutral"),
        };
      case "ui/theme":
        return { ...state, theme: action.payload === "light" ? "light" : "dark" };
      case "ui/density":
        return { ...state, density: action.payload === "compact" ? "compact" : action.payload === "spacious" ? "spacious" : "comfortable" };
      case "ui/focus": {
        const focus = String(action.payload || "all");
        if (!["all", "left", "center", "right"].includes(focus)) return state;
        return { ...state, focus };
      }
      case "ui/workbench-mode":
        return { ...state, workbenchMode: !state.workbenchMode };
      default:
        return state;
    }
  }

  function realtimeReducer(state = initialRealtime, action) {
    switch (action.type) {
      case "rt/raw":
        return { ...state, totalRaw: state.totalRaw + 1 };
      case "rt/raw-batch": {
        const count = Math.max(0, Number(action.payload?.count || 0));
        if (!count) return state;
        return { ...state, totalRaw: state.totalRaw + count };
      }
      case "rt/activity": {
        const kind = String(action.payload?.kind || "system");
        const nextKinds = [kind, ...state.recentKinds].slice(0, 8);
        return {
          ...state,
          totalActivity: state.totalActivity + 1,
          totalErrors: state.totalErrors + (kind === "error" ? 1 : 0),
          totalTools: state.totalTools + (kind === "tool" ? 1 : 0),
          recentKinds: nextKinds,
        };
      }
      case "rt/activity-batch": {
        const count = Math.max(0, Number(action.payload?.count || 0));
        const kinds = Array.isArray(action.payload?.kinds) ? action.payload.kinds : [];
        if (!count) return state;

        let totalErrors = state.totalErrors;
        let totalTools = state.totalTools;
        const nextKinds = [...state.recentKinds];
        for (const kindRaw of kinds) {
          const kind = String(kindRaw || "system");
          if (kind === "error") totalErrors += 1;
          if (kind === "tool") totalTools += 1;
          nextKinds.unshift(kind);
        }

        return {
          ...state,
          totalActivity: state.totalActivity + count,
          totalErrors,
          totalTools,
          recentKinds: nextKinds.slice(0, 8),
        };
      }
      case "rt/tick": {
        const eps = Number(action.payload?.eps || 0);
        const point = { t: Date.now(), v: eps };
        const series = [...state.series, point].slice(-40);
        return {
          ...state,
          eps,
          peakEps: Math.max(state.peakEps, eps),
          series,
        };
      }
      default:
        return state;
    }
  }

  function connReducer(state = initialConn, action) {
    switch (action.type) {
      case "conn/endpoint":
        return {
          ...state,
          endpoint: String(action.payload || "-"),
          lastEventAt: Date.now(),
        };
      case "conn/ping":
        return { ...state, lastEventAt: Date.now() };
      case "conn/tools":
        return {
          ...state,
          availableTools: Array.isArray(action.payload) ? action.payload : [],
          lastEventAt: Date.now(),
        };
      default:
        return state;
    }
  }

  function cittaReducer(state = initialCitta, action) {
    if (action.type === "citta/update") {
      const p = action.payload || {};
      const trace = (p.Cognitive_Trace_Log && typeof p.Cognitive_Trace_Log === "object") ? p.Cognitive_Trace_Log : p;
      const next = { ...state };
      if (p.emotion_state) next.emotionState = p.emotion_state;
      if (p.cognitive_load && typeof p.cognitive_load.error_count === 'number') next.errorCount = p.cognitive_load.error_count;
      if (p.update_type === "micro_thought") next.microThought = p.message || "";
      if (p.update_type === "macro_thought") next.macroThought = p.message || "";
      if (trace && trace.Applied_TAM) next.appliedTam = String(trace.Applied_TAM);
      if (trace && Object.prototype.hasOwnProperty.call(trace, "Safety_Override_Triggered")) {
        next.safetyOverride = Boolean(trace.Safety_Override_Triggered);
      }
      if (trace && (trace.blocked_input || trace.blocked_prompt || trace.blocked)) {
        next.blockedInput = String(trace.blocked_input || trace.blocked_prompt || trace.blocked || "");
      }
      return next;
    }
    return state;
  }

  const rootReducer = combineReducers({
    ui: uiReducer,
    realtime: realtimeReducer,
    connection: connReducer,
    citta: cittaReducer,
  });

  const store = createStore(rootReducer);

  const DEV_TRACE_STYLES = {
    mount: "color:#22c55e;font-weight:700",
    update: "color:#38bdf8;font-weight:700",
    warn: "color:#f59e0b;font-weight:700",
  };

  function devTrace(stage, detail, kind = "update") {
    try {
      const style = DEV_TRACE_STYLES[kind] || DEV_TRACE_STYLES.update;
      console.log(`%c[InnovaUI:${stage}] ${detail}`, style);
    } catch {
      // no-op: tracing must never affect runtime flow
    }
  }

  function useApplyDensityClass() {
    const density = useSelector((s) => s.ui.density);
    React.useEffect(() => {
      document.body.classList.remove("density-compact", "density-spacious");
      if (density === "compact") document.body.classList.add("density-compact");
      if (density === "spacious") document.body.classList.add("density-spacious");
      localStorage.setItem("innovaDensity", density);
    }, [density]);
  }

  function Sparkline({ series }) {
    if (!series.length) return React.createElement("div", { className: "react-chip" }, "No traffic yet");
    const values = series.map((p) => p.v);
    const max = Math.max(1, ...values);
    const points = values
      .map((value, idx) => {
        const x = (idx / Math.max(1, values.length - 1)) * 120;
        const y = 24 - (value / max) * 20;
        return `${x},${y}`;
      })
      .join(" ");
    return React.createElement(
      "svg",
      { className: "react-spark", viewBox: "0 0 120 24", preserveAspectRatio: "none", "aria-label": "Realtime EPS" },
      React.createElement("polyline", { points, fill: "none", stroke: "currentColor", strokeWidth: "2" })
    );
  }

  function MindStateIndicator({ citta }) {
    let colorClass = "react-pill--good";
    let icon = "🟢";
    if (citta.emotionState === "CONTEMPLATING") {
      colorClass = "react-pill--warn";
      icon = "🟡";
    } else if (citta.emotionState === "CATATONIC") {
      colorClass = "react-pill--bad pulse";
      icon = "🔴";
    }

    const tam = String(citta.appliedTam || "Constructive/Curiosity");
    const tamLabel = tam.toLowerCase().includes("empath") ? "Empathetic" : tam;

    return React.createElement("div", { className: "citta-indicator", style: { display: "flex", gap: "8px", alignItems: "center", marginLeft: "12px", background: "var(--bg-card)", padding: "2px 8px", borderRadius: "8px", border: "1px solid var(--border)", flexWrap: "wrap" } },
      React.createElement("span", { className: `react-pill ${colorClass}`, title: `Error Count: ${citta.errorCount}` }, `${icon} ${citta.emotionState}`),
      React.createElement("span", { className: "react-chip react-chip--ecs", title: `Applied TAM: ${tam}` }, `[ECS: ${tamLabel}]`),
      React.createElement("span", { className: "small", style: { maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", opacity: 0.8 }, title: citta.microThought }, citta.microThought)
    );
  }

  function SafetyOverrideBanner({ citta }) {
    if (!citta.safetyOverride) return null;
    return React.createElement(
      "div",
      { className: "react-safety-banner pulse", role: "alert" },
      React.createElement("strong", null, "🚨 CRITICAL ALERT"),
      React.createElement("span", null, "Safety Override Triggered"),
      citta.blockedInput ? React.createElement("code", null, citta.blockedInput) : null
    );
  }

  function SocraticModal({ citta }) {
    if (citta.emotionState !== "CATATONIC") return null;

    return React.createElement("div", { className: "socratic-modal-overlay", style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" } },
      React.createElement("div", { className: "socratic-modal", style: { backgroundColor: "var(--bg-card)", padding: "32px", borderRadius: "12px", border: "1px solid var(--bad)", maxWidth: "600px", width: "100%", position: "relative", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" } },
        React.createElement("h2", { style: { color: "var(--bad)", marginTop: 0, display: "flex", alignItems: "center", gap: "10px" } },
          React.createElement("span", { className: "pulse" }, "🔴"), "CATATONIC SHOCK DIVERGENCE"
        ),
        React.createElement("p", { style: { color: "var(--text-sec)", lineHeight: 1.5 } }, "The CittaEngine has detected an unsolvable loop or critical anomaly and invoked the SocraticHealer. " + "Please review the AI's internal diagnostic thoughts below."),
        React.createElement("div", { style: { backgroundColor: "var(--bg-body)", padding: "16px", borderRadius: "8px", borderLeft: "4px solid var(--magenta)", margin: "20px 0" } },
          React.createElement("div", { style: { marginBottom: "8px" } }, React.createElement("strong", { style: { color: "var(--magenta)" } }, "Micro Thought: "), citta.microThought),
          React.createElement("div", null, React.createElement("strong", { style: { color: "var(--magenta)" } }, "Macro Evaluation (Diagnosis): "), citta.macroThought)
        ),
        React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" } },
          React.createElement("button", { onClick: () => { const btn = document.querySelector('[data-control-view=\"ops\"]'); if (btn) btn.click(); }, className: "primary" }, "Go to HITL Approvals"),
          React.createElement("button", { onClick: () => { window.dispatchEvent(new CustomEvent('innova:citta', { detail: { emotion_state: 'CONTEMPLATING', update_type: 'macro_thought', message: 'Manual override: user dismissed modal.' } })); }, className: "secondary" }, "Acknowledge (Dismiss)")
        )
      )
    );
  }

  function ControlRibbon() {
    const dispatch = useDispatch();
    const ui = useSelector((s) => s.ui);
    const rt = useSelector((s) => s.realtime);
    const conn = useSelector((s) => s.connection);
    const citta = useSelector((s) => s.citta);
    const traceRef = React.useRef({ status: null, emotion: null, focus: null });
    useApplyDensityClass();

    React.useEffect(() => {
      devTrace("ControlRibbon", "mounted", "mount");
    }, []);

    React.useEffect(() => {
      const left = document.getElementById("leftSidebar");
      const right = document.getElementById("rightSidebar");
      [left, right].forEach((el) => {
        if (!(el instanceof HTMLElement)) return;
        el.style.overflowY = "auto";
        el.style.overflowX = "hidden";
        el.style.minHeight = "0";
      });
    }, [ui.width, ui.height]);

    React.useEffect(() => {
      document.body.classList.toggle("safety-override", Boolean(citta.safetyOverride));
      if (citta.safetyOverride) {
        document.body.classList.remove("left-open", "right-open");
        if (ui.focus !== "all") {
          dispatch({ type: "ui/focus", payload: "all" });
        }
      }
    }, [citta.safetyOverride, ui.focus, dispatch]);

    React.useEffect(() => {
      const onResize = () => dispatch({ type: "ui/viewport", payload: { width: window.innerWidth, height: window.innerHeight } });
      onResize();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }, [dispatch]);

    React.useEffect(() => {
      if (ui.width > 960 && ui.focus !== "all") {
        dispatch({ type: "ui/focus", payload: "all" });
      }
    }, [dispatch, ui.width, ui.focus]);

    React.useEffect(() => {
      if (ui.width <= 960 && ui.focus !== "all") {
        dispatch({ type: "ui/focus", payload: "all" });
      }
    }, [dispatch, ui.width, ui.focus]);

    React.useEffect(() => {
      localStorage.setItem("innovaFocus", ui.focus);
    }, [ui.focus]);

    React.useEffect(() => {
      const prev = traceRef.current;
      if (prev.status !== ui.status) {
        devTrace("Status", `${String(prev.status || "-")} -> ${ui.status}`, ui.statusKind === "error" ? "warn" : "update");
      }
      if (prev.emotion !== citta.emotionState) {
        devTrace("Citta", `${String(prev.emotion || "-")} -> ${citta.emotionState}`, citta.safetyOverride ? "warn" : "update");
      }
      if (prev.focus !== ui.focus) {
        devTrace("Focus", `${String(prev.focus || "-")} -> ${ui.focus}`, "update");
      }
      traceRef.current = { status: ui.status, emotion: citta.emotionState, focus: ui.focus };
    }, [ui.status, ui.statusKind, ui.focus, citta.emotionState, citta.safetyOverride]);

    React.useEffect(() => {
      const observer = new MutationObserver(() => {
        dispatch({ type: "ui/theme", payload: document.body.classList.contains("theme-light") ? "light" : "dark" });
      });
      observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
      return () => observer.disconnect();
    }, [dispatch]);

    React.useEffect(() => {
      let rawCounter = 0;
      let bufferedRaw = 0;
      const bufferedKinds = [];

      const flushBuffered = () => {
        if (bufferedRaw > 0) {
          dispatch({ type: "rt/raw-batch", payload: { count: bufferedRaw } });
          bufferedRaw = 0;
        }
        if (bufferedKinds.length > 0) {
          dispatch({ type: "rt/activity-batch", payload: { count: bufferedKinds.length, kinds: bufferedKinds.slice() } });
          bufferedKinds.length = 0;
        }
      };

      const onStatus = (event) => {
        dispatch({ type: "ui/status", payload: event.detail || {} });
      };
      const onRaw = () => {
        rawCounter += 1;
        bufferedRaw += 1;
      };
      const onActivity = (event) => {
        const kind = String(event.detail?.kind || "system");
        bufferedKinds.push(kind);
        if (bufferedKinds.length > 24) {
          flushBuffered();
        }
      };
      const onEndpoint = (event) => {
        dispatch({ type: "conn/endpoint", payload: event.detail?.endpoint || "-" });
      };
      const onTools = (event) => {
        dispatch({ type: "conn/tools", payload: event.detail?.names || [] });
      };
      const onCitta = (event) => {
        dispatch({ type: "citta/update", payload: event.detail || {} });
      };

      window.addEventListener("innova:status", onStatus);
      window.addEventListener("innova:raw", onRaw);
      window.addEventListener("innova:activity", onActivity);
      window.addEventListener("innova:endpoint", onEndpoint);
      window.addEventListener("innova:tools", onTools);
      window.addEventListener("innova:citta", onCitta);

      const flushTimer = setInterval(() => {
        flushBuffered();
        dispatch({ type: "conn/ping" });
      }, 150);

      const timer = setInterval(() => {
        dispatch({ type: "rt/tick", payload: { eps: rawCounter } });
        rawCounter = 0;
      }, 1000);

      return () => {
        flushBuffered();
        clearInterval(flushTimer);
        clearInterval(timer);
        window.removeEventListener("innova:status", onStatus);
        window.removeEventListener("innova:raw", onRaw);
        window.removeEventListener("innova:activity", onActivity);
        window.removeEventListener("innova:endpoint", onEndpoint);
        window.removeEventListener("innova:tools", onTools);
        window.removeEventListener("innova:citta", onCitta);
      };
    }, [dispatch]);

    React.useEffect(() => {
      document.body.setAttribute("data-device", ui.device);
      document.body.setAttribute("data-focus", ui.focus);
    }, [ui.device, ui.focus]);

    const densityButtons = [
      { key: "compact", label: "Compact" },
      { key: "comfortable", label: "Comfort" },
      { key: "spacious", label: "Spacious" },
    ];

    const missingRequired = conn.requiredTools.filter((name) => !conn.availableTools.includes(name));
    const gatePass = missingRequired.length === 0;
    const compactViewport = ui.width <= 960;
    const focusButtons = [
      { key: "all", label: "All" },
      { key: "left", label: "Nav" },
      { key: "center", label: "Center" },
      { key: "right", label: "Control" },
    ];

    return React.createElement(
      React.Fragment, null,
      React.createElement(SafetyOverrideBanner, { citta }),
      React.createElement(
        "section",
        { className: "react-control" },
        React.createElement("div", { className: "react-control__left" },
          React.createElement("span", { className: `react-pill react-pill--${ui.statusKind || "neutral"}` }, `Status: ${ui.status}`),
          React.createElement("span", { className: "react-chip" }, `Theme: ${ui.theme}`),
          React.createElement(MindStateIndicator, { citta })
        ),
        React.createElement("div", { className: "react-control__center" },
          React.createElement("span", { className: "react-chip react-chip--strong" }, `EPS: ${rt.eps}`),
          React.createElement("span", { className: "react-chip" }, `Peak: ${rt.peakEps}`),
          React.createElement("span", { className: "react-chip" }, `Activity: ${rt.totalActivity}`),
          React.createElement("span", { className: "react-chip" }, `Errors: ${rt.totalErrors}`),
          React.createElement(Sparkline, { series: rt.series })
        ),
        React.createElement("div", { className: "react-control__right" },
          React.createElement("span", { className: "react-chip react-endpoint", title: conn.endpoint }, `RPC: ${conn.endpoint}`),
          React.createElement(
            "span",
            {
              className: `react-chip react-chip--gate ${gatePass ? "react-chip--gate-ok" : "react-chip--gate-bad"}`,
              title: gatePass ? "Required tools ready" : `Missing: ${missingRequired.join(", ")}`,
            },
            gatePass ? "Tool Gate: PASS" : `Tool Gate: MISSING ${missingRequired.length}`
          ),
          React.createElement("div", { className: "react-density" },
            densityButtons.map((btn) => React.createElement(
              "button",
              {
                key: btn.key,
                className: `secondary react-density__btn ${ui.density === btn.key ? "is-active" : ""}`,
                onClick: () => dispatch({ type: "ui/density", payload: btn.key }),
              },
              btn.label
            ))
          ),
          compactViewport ? React.createElement(
            "div",
            { className: "react-focus" },
            focusButtons.map((btn) => React.createElement(
              "button",
              {
                key: btn.key,
                className: `secondary react-focus__btn ${ui.focus === btn.key ? "is-active" : ""}`,
                onClick: () => dispatch({ type: "ui/focus", payload: btn.key }),
              },
              btn.label
            ))
          ) : null
        )
      ),
      React.createElement(SocraticModal, { citta })
    );
  }

  // ── TelemetryDashboard ────────────────────────────────────────────────────
  function TelemetryGauge({ label, value, max, unit, colorVar }) {
    const pct = Math.min(100, Math.round((value / (max || 100)) * 100));
    const color = pct > 85 ? "var(--bad)" : pct > 60 ? "var(--warn, #f5a623)" : "var(--good, #00f0ff)";
    return React.createElement("div", { className: "telemetry-stat" },
      React.createElement("div", { className: "telemetry-stat__label" }, label),
      React.createElement("div", { className: "telemetry-gauge", title: `${value}${unit} / ${max}${unit}` },
        React.createElement("div", {
          className: "telemetry-gauge__fill",
          style: { width: `${pct}%`, background: color, transition: "width 0.6s ease" },
        })
      ),
      React.createElement("div", { className: "telemetry-stat__value" }, `${value}${unit}`)
    );
  }

  function TelemetryMindState({ emotionState, microThought, ecsPhase }) {
    const colorMap = {
      AWAKENED: "var(--good, #00f0ff)",
      CONTEMPLATING: "var(--warn, #f5a623)",
      CATATONIC: "var(--bad)",
      RUNNING: "var(--accent, #a78bfa)",
      SCANNING: "var(--accent, #a78bfa)",
    };
    const color = colorMap[emotionState] || "var(--text-sec)";
    return React.createElement("div", { className: "telemetry-mind", style: { borderColor: color } },
      React.createElement("div", { className: "telemetry-mind__state", style: { color } }, emotionState || "—"),
      ecsPhase ? React.createElement("div", { className: "telemetry-mind__phase small" }, `ECS: ${ecsPhase}`) : null,
      microThought ? React.createElement("div", { className: "telemetry-mind__thought small", title: microThought }, microThought) : null
    );
  }

  function TelemetryDashboard() {
    const citta = useSelector((s) => s.citta);
    const rt = useSelector((s) => s.realtime);
    const [tele, setTele] = React.useState(null);
    const [err, setErr] = React.useState(null);
    const [lastUpdate, setLastUpdate] = React.useState(null);

    React.useEffect(() => {
      let cancelled = false;
      async function poll() {
        try {
          const res = await fetch("/api/telemetry");
          const data = await res.json();
          if (!cancelled && data.ok) {
            setTele(data);
            setLastUpdate(new Date().toLocaleTimeString());
            setErr(null);
          }
        } catch (e) {
          if (!cancelled) setErr("Server unreachable");
        }
      }
      poll();
      const id = setInterval(poll, 3000);
      return () => { cancelled = true; clearInterval(id); };
    }, []);

    return React.createElement("div", { className: "telemetry-grid" },
      // Mind State card (from both Redux citta + server poll)
      React.createElement("div", { className: "telemetry-card" },
        React.createElement("div", { className: "telemetry-card__title" }, "🧠 AI Mind State"),
        React.createElement(TelemetryMindState, {
          emotionState: citta.emotionState || (tele && tele.emotion_state) || "—",
          microThought: citta.microThought || (tele && tele.micro_thought) || "",
          ecsPhase: tele && tele.ecs_phase || "",
        }),
        React.createElement("div", { className: "telemetry-tam small", title: citta.appliedTam },
          `TAM: ${citta.appliedTam || "—"}`)
      ),
      // CPU + Memory from server
      tele ? React.createElement("div", { className: "telemetry-card" },
        React.createElement("div", { className: "telemetry-card__title" }, "⚙️ Server Resources"),
        React.createElement(TelemetryGauge, { label: "CPU", value: tele.cpu_percent, max: 100, unit: "%" }),
        React.createElement(TelemetryGauge, { label: "Memory", value: tele.mem_percent, max: 100, unit: "%" }),
        React.createElement("div", { className: "small", style: { opacity: 0.6, marginTop: "6px" } },
          `RAM: ${tele.mem_used_mb} / ${tele.mem_total_mb} MB`)
      ) : React.createElement("div", { className: "telemetry-card telemetry-card--loading" },
        err ? React.createElement("span", { style: { color: "var(--bad)" } }, `⚠ ${err}`) : "Loading…"
      ),
      // Event throughput from Redux realtime
      React.createElement("div", { className: "telemetry-card" },
        React.createElement("div", { className: "telemetry-card__title" }, "📡 Event Throughput"),
        React.createElement("div", { className: "telemetry-eps" }, `${rt.eps}`, React.createElement("span", { className: "small" }, " eps")),
        React.createElement("div", { className: "small", style: { opacity: 0.7 } }, `Peak: ${rt.peakEps} eps`),
        React.createElement("div", { className: "small", style: { opacity: 0.7 } }, `Total: ${rt.totalActivity} events`),
        React.createElement(Sparkline, { series: rt.series })
      ),
      lastUpdate ? React.createElement("div", { className: "telemetry-updated small", style: { gridColumn: "1 / -1", opacity: 0.5, textAlign: "right" } },
        `Last update: ${lastUpdate}`
      ) : null
    );
  }

  function MeshMonitor() {
    const [sessions, setSessions] = React.useState([]);
    const [events, setEvents] = React.useState([]);
    const [err, setErr] = React.useState(null);

    React.useEffect(() => {
      let cancelled = false;
      async function poll() {
        try {
          const res = await fetch("/api/maw/status");
          const data = await res.json();
          if (!cancelled && data.ok) {
            setSessions(Array.isArray(data) ? data : (data.sessions || []));
            setErr(null);
          } else if (!cancelled) {
            setErr(data.error || "Failed to fetch mesh status");
          }
        } catch (e) {
          if (!cancelled) setErr("Mesh server unreachable");
        }
      }
      poll();
      const id = setInterval(poll, 5000);

      const es = new EventSource("/api/maw/events");
      es.onmessage = (e) => {
        if (!cancelled) {
          setEvents((prev) => [e.data, ...prev].slice(0, 20));
        }
      };
      es.onerror = () => {
        if (!cancelled) console.error("Mesh event stream error");
      };

      return () => {
        cancelled = true;
        clearInterval(id);
        es.close();
      };
    }, []);

    return React.createElement("div", { className: "dash-card" },
      React.createElement("div", { className: "dash-card__title" }, "🌐 Mesh Monitor"),
      err ? React.createElement("div", { className: "dash-label", style: { color: "var(--bad)" } }, `⚠ ${err}`) :
      React.createElement(React.Fragment, null,
        sessions.length === 0 ? React.createElement("div", { className: "dash-label", style: { opacity: 0.5 } }, "No active sessions") :
        React.createElement("div", { className: "mesh-list", style: { display: "flex", flexDirection: "column", gap: "4px", marginBottom: "8px" } },
          sessions.slice(0, 5).map((s, i) => React.createElement("div", {
            key: i,
            className: "mesh-item",
            style: { fontSize: "11px", opacity: 0.9, display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "2px" }
          },
            React.createElement("span", null, s.name),
            React.createElement("span", { className: "small", style: { opacity: 0.6 } }, s.source || "local")
          ))
        ),
        React.createElement("div", { className: "dash-terminal", style: { fontSize: "10px", height: "100px", overflowY: "auto" } },
          events.map((ev, i) => React.createElement("div", { key: i, className: "dash-terminal__line small" }, ev))
        )
      )
    );
  }

  const PHASES_MAP = {
    THINK: { color: "cyan", label: "Think", tw: "text-cyan-400 border-cyan-400 bg-cyan-400/10" },
    ACT: { color: "emerald", label: "Act", tw: "text-emerald-400 border-emerald-400 bg-emerald-400/10" },
    OBSERVE: { color: "amber", label: "Observe", tw: "text-amber-400 border-amber-400 bg-amber-400/10" },
    REFLECT: { color: "purple", label: "Reflect", tw: "text-purple-400 border-purple-400 bg-purple-400/10" },
  };

  function VisualWorkbench() {
    const [visual, setVisual] = React.useState({ content: null, overlay: null });

    React.useEffect(() => {
      const ws = new WebSocket(`ws://${window.location.host}/ws/visual`);
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          setVisual(data);
        } catch (err) {
          console.error("Visual WS error:", err);
        }
      };
      return () => ws.close();
    }, []);

    if (!visual.content) return React.createElement("div", {
      className: "workbench-empty",
      style: { display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-sec)", opacity: 0.5, fontSize: "14px" }
    }, "No visual stream active");

    const isImage = visual.content.startsWith("data:image") || visual.content.match(/\\.(jpg|jpeg|png|gif|webp)$/i);

    return React.createElement("div", {
      className: "visual-workbench",
      style: { position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#000" }
    },
      isImage
        ? React.createElement("img", { src: visual.content, style: { width: "100%", height: "100%", objectFit: "contain" } })
        : React.createElement("iframe", { src: visual.content, style: { width: "100%", height: "100%", border: "none" } }),
      visual.overlay && React.createElement("svg", {
        className: "visual-overlay",
        style: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" },
        viewBox: "0 0 100 100",
        preserveAspectRatio: "none"
      }, visual.overlay)
    );
  }

  function ReasoningDeepDive({ text }) {
    return React.createElement("div", {
      className: "text-xs p-2 bg-black/20 rounded border-l-2 border-white/10 mt-1 whitespace-pre-wrap opacity-90 font-mono",
    }, text);
  }

  function PhaseAccordion({ phase, entries, isLatest }) {
    const [expanded, setExpanded] = React.useState(isLatest);
    const config = PHASES_MAP[phase] || { label: phase, tw: "text-gray-400 border-gray-400 bg-gray-400/10" };

    React.useEffect(() => {
      if (isLatest) setExpanded(true);
    }, [isLatest, entries.length]);

    return React.createElement("div", {
      className: `mb-2 overflow-hidden rounded-sm ${config.tw.split(' ').pop()}`,
      style: { borderLeft: `3px solid currentColor` }
    },
      React.createElement("div", {
        className: `cursor-pointer flex items-center gap-2 px-2 py-1 select-none font-semibold text-sm ${config.tw.split(' ')[0]}`,
        onClick: () => setExpanded(!expanded)
      },
        React.createElement("span", {
          className: "transition-transform duration-200",
          style: { transform: expanded ? "rotate(90deg)" : "rotate(0deg)", display: "inline-block" }
        }, "▶"),
        config.label
      ),
      expanded ? React.createElement("div", { className: "px-2 pb-2" },
        entries.map((entry, i) => React.createElement(ReasoningDeepDive, { key: i, text: entry }))
      ) : null
    );
  }

  function IterationBlock({ iteration, index, isLatest }) {
    return React.createElement("div", {
      className: `p-3 mb-4 border rounded-lg bg-card shadow-sm ${isLatest ? "ring-1 ring-white/20" : "border-white/5"}`,
    },
      React.createElement("div", {
        className: "flex justify-between mb-3 text-[10px] opacity-40 uppercase tracking-wider",
      },
        React.createElement("span", null, `Iteration #${index + 1}`),
        React.createElement("span", null, iteration.timestamp)
      ),
      iteration.phases.map((p, i) => React.createElement(PhaseAccordion, {
        key: i,
        phase: p.name,
        entries: p.entries,
        isLatest: isLatest && i === iteration.phases.length - 1
      }))
    );
  }

  function ThinkingReport({ iterations }) {
    return React.createElement("div", { className: "thinking-report flex flex-col gap-2" },
      iterations.length
        ? iterations.map((it, i) => React.createElement(IterationBlock, {
            key: i,
            iteration: it,
            index: i,
            isLatest: i === iterations.length - 1
          }))
        : React.createElement("div", { className: "text-center p-8 opacity-40 text-sm italic" }, "Waiting for cognitive stream…")
    );
  }

  function DashboardView() {
    const ui = useSelector((s) => s.ui);
    const citta = useSelector((s) => s.citta);
    const rt = useSelector((s) => s.realtime);
    const dispatch = useDispatch();
    const [tele, setTele] = React.useState(null);
    const [cogStream, setCogStream] = React.useState([]);
    const [reportData, setReportData] = React.useState([]);

    React.useEffect(() => {
      let cancelled = false;
      function poll() {
        fetch("/api/telemetry")
          .then((r) => r.json())
          .then((d) => { if (!cancelled && d.ok) setTele(d); })
          .catch(() => {});
      }
      poll();
      const id = setInterval(poll, 3000);
      return () => { cancelled = true; clearInterval(id); };
    }, []);

    React.useEffect(() => {
      async function pollReport() {
        try {
          const res = await fetch("/api/thinking_report");
          const data = await res.json();
          if (data.ok) setReportData(data.iterations || []);
        } catch (e) {}
      }
      pollReport();
      const id = setInterval(pollReport, 5000);
      return () => clearInterval(id);
    }, []);

    React.useEffect(() => {
      const onCitta = (e) => {
        const d = e.detail || {};
        if (d.update_type === "micro_thought" && d.message) {
          const ts = new Date().toLocaleTimeString();
          setCogStream((prev) => [{ ts, text: d.message }, ...prev].slice(0, 25));
        }
      };
      window.addEventListener("innova:citta", onCitta);
      return () => window.removeEventListener("innova:citta", onCitta);
    }, []);

    const stateColors = { AWAKENED: "#00f0ff", CONTEMPLATING: "#f5a623", CATATONIC: "#ff0055" };
    const sColor = stateColors[citta.emotionState] || "#a78bfa";
    const epsRatio = rt.peakEps > 0 ? Math.min(100, (rt.eps / rt.peakEps) * 100) : 0;

    const layoutClass = ui.workbenchMode ? "dashboard-root dashboard-root--workbench" : "dashboard-root";

    return React.createElement("div", { className: layoutClass },
      React.createElement("div", {
        className: ui.workbenchMode ? "dash-main-content" : "dash-content-full",
        style: ui.workbenchMode ? { display: "grid", gridTemplateColumns: "1fr", gap: "14px", width: "calc(100% - 400px)" } : {}
      },
        // System Vitals
        React.createElement("div", { className: "dash-card" },
          React.createElement("div", { className: "dash-card__title" }, "System Vitals"),
          tele
            ? React.createElement(React.Fragment, null,
                React.createElement("div", null,
                  React.createElement("div", { className: "dash-label" }, "CPU — ", tele.cpu_percent, "%"),
                  React.createElement("div", { className: "dash-bar-track" },
                    React.createElement("div", { className: "dash-bar-fill dash-bar-fill--cpu", style: { width: tele.cpu_percent + "%" } })
                  )
                ),
                React.createElement("div", { style: { marginTop: "8px" } },
                  React.createElement("div", { className: "dash-label" }, "RAM — ", tele.mem_percent, "%"),
                  React.createElement("div", { className: "dash-bar-track" },
                    React.createElement("div", { className: "dash-bar-fill dash-bar-fill--mem", style: { width: tele.mem_percent + "%" } })
                  )
                ),
                React.createElement("div", { className: "dash-label", style: { marginTop: "6px", opacity: 0.55 } },
                  tele.mem_used_mb, " / ", tele.mem_total_mb, " MB")
              )
            : React.createElement("div", { className: "dash-label", style: { opacity: 0.5 } }, "Connecting…")
        ),
        // Event Throughput
        React.createElement("div", { className: "dash-card" },
          React.createElement("div", { className: "dash-card__title" }, "Event Throughput"),
          React.createElement("div", { className: "dash-metric" },
            rt.eps,
            React.createElement("span", { className: "dash-metric__unit" }, " eps")
          ),
          React.createElement("div", { className: "dash-bar-track", style: { marginTop: "8px" } },
            React.createElement("div", { className: "dash-bar-fill dash-bar-fill--eps", style: { width: epsRatio + "%" } })
          ),
          React.createElement("div", { className: "dash-label", style: { marginTop: "6px" } },
            "Peak: ", rt.peakEps, " eps"),
          React.createElement("div", { className: "dash-label" },
            "Activity: ", rt.totalActivity, " · Errors: ", rt.totalErrors)
        ),
        // AI Mind State
        React.createElement("div", { className: "dash-card" },
          React.createElement("div", { className: "dash-card__title" }, "AI Mind State"),
          React.createElement("div", { className: "dash-metric", style: { fontSize: "clamp(16px,2.2vw,24px)", color: sColor } },
            citta.emotionState),
          React.createElement("div", { className: "dash-state-badge", style: { color: sColor, marginTop: "10px" } },
            React.createElement("span", { style: {
              display: "inline-block", width: "8px", height: "8px",
              borderRadius: "50%", background: sColor, boxShadow: "0 0 8px " + sColor,
            } }),
            " ", citta.appliedTam || "ECS Active"
          ),
          React.createElement("div", { className: "dash-label", style: { marginTop: "8px", opacity: 0.75 } },
            citta.microThought)
        ),
        // Mesh Monitor
        React.createElement(MeshMonitor),
        // Thinking Report (Full Width)
        React.createElement("div", { className: "dash-card dash-card--wide" },
          React.createElement("div", { className: "dash-card__title" }, "Thinking Report"),
          React.createElement(ThinkingReport, { iterations: reportData })
        ),
        // Cognitive Stream terminal (full-width)
        React.createElement("div", { className: "dash-card dash-card--wide" },
          React.createElement("div", { className: "dash-card__title" }, "Cognitive Stream"),
          React.createElement("div", { className: "dash-terminal" },
            cogStream.length
              ? cogStream.map((line, i) => React.createElement("div", {
                  key: i,
                  className: "dash-terminal__line" + (i === 0 ? " dash-terminal__line--new" : ""),
                }, "[", line.ts, "] ", line.text))
              : React.createElement("div", { className: "dash-terminal__line", style: { opacity: 0.4 } },
                  "Waiting for cognitive events…")
          )
        )
      ),
      ui.workbenchMode && React.createElement("div", {
        className: "dash-workbench-pane",
        style: { width: "400px", borderLeft: "1px solid var(--border)", padding: "14px", display: "flex", flexDirection: "column", gap: "14px", position: "relative" }
      },
        React.createElement("div", { className: "dash-card__title" }, "Visual Execution"),
        React.createElement("div", { style: { flex: 1, overflow: "hidden", borderRadius: "8px", border: "1px solid var(--border)" } },
          React.createElement(VisualWorkbench)
        ),
        React.createElement("button", {
          className: "secondary",
          onClick: () => dispatch({ type: "ui/workbench-mode" }),
          style: { marginTop: "auto" }
        }, "Exit Workbench Mode")
      ),
      !ui.workbenchMode && React.createElement("button", {
        className: "primary",
        onClick: () => dispatch({ type: "ui/workbench-mode" }),
        style: { position: "fixed", bottom: "20px", right: "20px", zIndex: 1000, borderRadius: "20px", padding: "8px 16px", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }
      }, "Enter Workbench Mode")
    );
  }

  // Mount DashboardView
  const dashboardRootEl = document.getElementById("dashboardReactRoot");
  if (dashboardRootEl) {
    devTrace("DashboardView", "mount start", "mount");
    ReactDOM.createRoot(dashboardRootEl).render(
      React.createElement(Provider, { store }, React.createElement(DashboardView))
    );
    devTrace("DashboardView", "mount complete", "mount");
  }

  // ── DevIdeView (Bolt.new-style 3-pane IDE) ───────────────────────────────────
  const DEV_FILE_TREE = [
    { name: "innova_bot/", icon: "📁", kind: "dir" },
    { name: "  main.py", icon: "🐍", key: "main.py" },
    { name: "  gui/", icon: "📁", kind: "dir" },
    { name: "    index.html", icon: "📄", key: "index.html" },
    { name: "    app.react.js", icon: "⚛", key: "app.react.js" },
    { name: "    style.css", icon: "🎨", key: "style.css" },
    { name: "  rpg_tui.py", icon: "🎮", key: "rpg_tui.py" },
    { name: "monitor.cmd", icon: "⚡", key: "monitor.cmd" },
  ];

  const SAMPLE_SNIPPETS = {
    "main.py": [
      { text: "# innova_bot · Starlette MCP server", cls: "tok-cmt" },
      { text: "from starlette.routing import Route", cls: "" },
      { text: "async def ", cls: "tok-kw", cont: [{ text: "_api_telemetry", cls: "tok-fn" }, { text: "(request):", cls: "" }] },
      { text: "    cpu = psutil.", cls: "", cont: [{ text: "cpu_percent", cls: "tok-fn" }, { text: "(interval=None)", cls: "" }] },
      { text: "    mem = psutil.", cls: "", cont: [{ text: "virtual_memory", cls: "tok-fn" }, { text: "()", cls: "" }] },
      { text: "    return ", cls: "tok-kw", cont: [{ text: "JSONResponse", cls: "tok-cls" }, { text: "({\"ok\": True})", cls: "" }] },
    ],
    "app.react.js": [
      { text: "// Redux store · innova-bot GUI", cls: "tok-cmt" },
      { text: "const store = createStore(rootReducer);", cls: "" },
      { text: "function ", cls: "tok-kw", cont: [{ text: "DashboardView", cls: "tok-fn" }, { text: "() {", cls: "" }] },
      { text: "  const citta = ", cls: "", cont: [{ text: "useSelector", cls: "tok-fn" }, { text: "((s) => s.citta);", cls: "" }] },
      { text: "  const rt = ", cls: "", cont: [{ text: "useSelector", cls: "tok-fn" }, { text: "((s) => s.realtime);", cls: "" }] },
      { text: "  return React.", cls: "", cont: [{ text: "createElement", cls: "tok-fn" }, { text: "(\"div\", ...)", cls: "" }] },
    ],
    "style.css": [
      { text: "/* 2026 Luxury Upgrade · glassmorphism */", cls: "tok-cmt" },
      { text: ".dashboard-root {", cls: "" },
      { text: "  display: ", cls: "tok-kw", cont: [{ text: "grid", cls: "tok-str" }, { text: ";", cls: "" }] },
      { text: "  grid-template-columns:", cls: "tok-kw", cont: [{ text: " repeat(auto-fit, minmax(160px, 1fr))", cls: "tok-str" }, { text: ";", cls: "" }] },
      { text: "  gap: ", cls: "tok-kw", cont: [{ text: "14px", cls: "tok-num" }, { text: ";", cls: "" }] },
      { text: "}", cls: "" },
    ],
    "rpg_tui.py": [
      { text: "# Textual TUI · RPG Monitor", cls: "tok-cmt" },
      { text: "class ", cls: "tok-kw", cont: [{ text: "InnovaMonitor", cls: "tok-cls" }, { text: "(App):", cls: "" }] },
      { text: "    BINDINGS = [", cls: "" },
      { text: "        Binding(\"m\", \"show_monitor\",", cls: "" },
      { text: "                priority=True),", cls: "tok-kw" },
      { text: "    ]", cls: "" },
    ],
  };

  function DevIdeSnippet({ fileKey }) {
    const lines = SAMPLE_SNIPPETS[fileKey] || SAMPLE_SNIPPETS["main.py"];
    return React.createElement("div", { className: "devide-editor" },
      lines.map((line, i) => {
        if (line.cont) {
          return React.createElement("div", { key: i },
            React.createElement("span", { className: line.cls }, line.text),
            line.cont.map((seg, j) => React.createElement("span", { key: j, className: seg.cls }, seg.text))
          );
        }
        return React.createElement("div", { key: i },
          React.createElement("span", { className: line.cls }, line.text)
        );
      })
    );
  }

  function DevIdeView() {
    const [activeFile, setActiveFile] = React.useState("main.py");
    const [termLines, setTermLines] = React.useState([
      { text: "innova_bot server ready", cls: "devide-terminal__line--info" },
      { text: "SSE stream live · awaiting events", cls: "" },
    ]);
    const termRef = React.useRef(null);

    React.useEffect(() => {
      const onActivity = (e) => {
        const kind = String(e.detail?.kind || "system");
        const ts = new Date().toLocaleTimeString();
        const cls = kind === "error" ? "devide-terminal__line--err"
          : kind === "tool" ? "devide-terminal__line--info"
          : "devide-terminal__line--new";
        setTermLines((prev) => [...prev, { text: "[" + ts + "] " + kind.toUpperCase(), cls }].slice(-60));
      };
      window.addEventListener("innova:activity", onActivity);
      return () => window.removeEventListener("innova:activity", onActivity);
    }, []);

    React.useEffect(() => {
      if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
    }, [termLines]);

    return React.createElement("div", { className: "devide-root" },
      // File Explorer pane
      React.createElement("div", { className: "devide-pane devide-pane--explorer" },
        React.createElement("div", { className: "devide-pane__header" }, "Explorer"),
        React.createElement("div", { className: "devide-tree" },
          DEV_FILE_TREE.map((f, i) => React.createElement("div", {
            key: i,
            className: "devide-tree-item"
              + (f.kind === "dir" ? " devide-tree-item--dir" : "")
              + (activeFile === f.key ? " is-active" : ""),
            onClick: f.key ? () => setActiveFile(f.key) : undefined,
          }, f.icon, " ", f.name.trim()))
        )
      ),
      // Code Editor pane
      React.createElement("div", { className: "devide-pane devide-pane--editor" },
        React.createElement("div", { className: "devide-pane__header" }, activeFile),
        React.createElement(DevIdeSnippet, { fileKey: activeFile })
      ),
      // Live Terminal pane
      React.createElement("div", { className: "devide-pane devide-pane--terminal" },
        React.createElement("div", { className: "devide-pane__header" }, "Terminal"),
        React.createElement("div", { className: "devide-terminal", ref: termRef },
          termLines.map((line, i) => React.createElement("div", {
            key: i,
            className: "devide-terminal__line " + line.cls,
          },
            React.createElement("span", { className: "devide-terminal__prompt" }, ">"),
            " ", line.text
          ))
        )
      )
    );
  }

  // Mount DevIdeView
  const devIdeRootEl = document.getElementById("devIdeReactRoot");
  if (devIdeRootEl) {
    devTrace("DevIdeView", "mount start", "mount");
    ReactDOM.createRoot(devIdeRootEl).render(
      React.createElement(Provider, { store }, React.createElement(DevIdeView))
    );
    devTrace("DevIdeView", "mount complete", "mount");
  }

  // Mount TelemetryDashboard to its dedicated root
  const telemetryRootEl = document.getElementById("telemetryReactRoot");
  if (telemetryRootEl) {
    devTrace("TelemetryDashboard", "mount start", "mount");
    const telemetryRoot = ReactDOM.createRoot(telemetryRootEl);
    telemetryRoot.render(
      React.createElement(Provider, { store }, React.createElement(TelemetryDashboard))
    );
    devTrace("TelemetryDashboard", "mount complete", "mount");
  }

  const rootEl = document.getElementById("reactControlRoot");
  if (!rootEl) return;

  const root = ReactDOM.createRoot(rootEl);
  devTrace("ControlRoot", "mount start", "mount");
  root.render(
    React.createElement(Provider, { store }, React.createElement(ControlRibbon))
  );
  devTrace("ControlRoot", "mount complete", "mount");
})();