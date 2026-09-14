document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-enter");

  // Web Audio Synth for subtle tactile UI clicks
  let audioCtx = null;
  let soundEnabled = localStorage.getItem("cc-sound") === "true";

  const updateSoundButtons = () => {
    document.querySelectorAll(".sound-toggle").forEach(btn => {
      btn.innerHTML = soundEnabled ? "🔊" : "🔇";
      btn.title = soundEnabled ? "Mute audio effects" : "Enable tactile sound effects";
    });
  };
  updateSoundButtons();

  const playTone = (freq = 440, type = "sine", duration = 0.04) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  };

  document.querySelectorAll(".sound-toggle").forEach(btn => btn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem("cc-sound", soundEnabled ? "true" : "false");
    updateSoundButtons();
    if (soundEnabled) playTone(580, "triangle", 0.08);
    showToast(soundEnabled ? "Tactile Audio: Enabled" : "Tactile Audio: Muted");
  }));

  // Play click on buttons and interactive chips
  document.addEventListener("click", e => {
    if (e.target.closest("button, .btn, .card-link, .filter-btn, .term-tab, .sim-query-chip, .cli-chip")) {
      playTone(620, "sine", 0.03);
    }
  });

  // Theme management
  const applyTheme = theme => {
    document.documentElement.setAttribute("data-theme", theme);
    document.querySelectorAll(".theme-toggle").forEach(btn => {
      const icon = btn.querySelector(".ti"), label = btn.querySelector(".tl");
      if (icon) icon.textContent = theme === "dark" ? "☀" : "◐";
      if (label) label.textContent = theme === "dark" ? "LIGHT" : "DARK";
    });
  };
  applyTheme(localStorage.getItem("cc-theme") || "dark");
  document.querySelectorAll(".theme-toggle").forEach(btn => btn.addEventListener("click", () => {
    const next = (document.documentElement.getAttribute("data-theme") || "dark") === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("cc-theme", next);
    playTone(next === "dark" ? 400 : 700, "triangle", 0.05);
  }));

  // Live IST Clock & Telemetry Status
  const updateStatusClock = () => {
    const clockEl = document.querySelector(".live-ist-clock");
    if (clockEl) {
      try {
        const timeStr = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          hour12: true
        }).format(new Date());
        clockEl.textContent = `BANGALORE ${timeStr} IST`;
      } catch (e) {}
    }
  };
  updateStatusClock();
  setInterval(updateStatusClock, 1000);

  // Dynamic Typewriter Roles
  const typewriterEl = document.querySelector(".typewriter-role");
  if (typewriterEl) {
    const roles = [
      "AI/ML Systems Engineer",
      "Production RAG Specialist",
      "LoRA & PEFT Adapter Builder",
      "Async FastAPI & CUDA Microservices",
      "Computer Vision & Edge Inference"
    ];
    let roleIdx = 0, charIdx = 0, isDeleting = false;
    const typeSpeed = 80, eraseSpeed = 40, holdTime = 1800;

    const typeLoop = () => {
      const currentRole = roles[roleIdx];
      if (isDeleting) {
        typewriterEl.textContent = currentRole.substring(0, charIdx--);
        if (charIdx < 0) {
          isDeleting = false;
          roleIdx = (roleIdx + 1) % roles.length;
          setTimeout(typeLoop, 350);
          return;
        }
        setTimeout(typeLoop, eraseSpeed);
      } else {
        typewriterEl.textContent = currentRole.substring(0, ++charIdx);
        if (charIdx >= currentRole.length) {
          isDeleting = true;
          setTimeout(typeLoop, holdTime);
          return;
        }
        setTimeout(typeLoop, typeSpeed);
      }
    };
    typeLoop();
  }

  // Mobile navigation
  const toggle = document.querySelector(".nav-toggle"), nav = document.querySelector(".nav-links");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("mobile-open");
      Object.assign(nav.style, open ? {
        display: "flex", position: "absolute", top: "58px", left: "0", right: "0",
        flexDirection: "column", background: "var(--bg)", padding: "18px 24px",
        borderBottom: "2px solid var(--line)", gap: "8px", zIndex: "99",
        boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
      } : { display: "" });
    });
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      nav.classList.remove("mobile-open");
      nav.style.display = "";
    }));
  }

  // Toast notification helper
  window.showToast = (msg, duration = 2800) => {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = "toast-msg";
    toast.innerHTML = `<span style="color:var(--accent);font-weight:900;">›</span> <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "all 0.25s ease";
      setTimeout(() => toast.remove(), 250);
    }, duration);
  };

  // Copy to clipboard helper
  document.querySelectorAll(".copy-btn, .contact-card").forEach(el => {
    el.addEventListener("click", e => {
      const copyVal = el.dataset.copy || (el.querySelector(".val") ? el.querySelector(".val").textContent.trim() : "");
      if (copyVal && !el.getAttribute("href")?.startsWith("mailto:") && !el.getAttribute("href")?.startsWith("tel:")) {
        navigator.clipboard.writeText(copyVal).then(() => {
          showToast(`Copied "${copyVal}" to clipboard!`);
          playTone(800, "triangle", 0.06);
        }).catch(() => {});
      }
    });
  });

  // Terminal Multi-Tab Switcher
  const termTabs = document.querySelectorAll(".term-tab");
  const termPanels = document.querySelectorAll(".terminal-panel");
  termTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      termTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const targetId = tab.dataset.tab;
      termPanels.forEach(p => {
        p.classList.toggle("active", p.id === targetId);
      });
      playTone(550, "sine", 0.03);
    });
  });

  // Terminal Tab 1: Live Diagnostic Console
  const output = document.getElementById("console-output");
  if (output) {
    const logs = [
      ["200 OK", "ok", "POST /v1/risk/query → 38ms  [Milvus hybrid search, top_k=12]"],
      ["INFO", "info", "LoRA adapter [llama-3.1-8b-multilingual] loaded → VRAM: 6.2 GB"],
      ["EVAL", "ok", "RAGAS faithfulness: 0.94 | context_recall: 0.91 | relevancy: 0.89"],
      ["TRACE", "info", "Langfuse trace #9081 recorded — latency p95: 112ms"],
      ["GUARD", "warn", "hallucination_check PASSED — 0 policy violations detected"],
      ["200 OK", "ok", "GET /v1/compliance/report → 89ms  [BM25 rerank applied]"],
      ["INFO", "info", "Docker container [risk-minor-api:v2.1] — uptime: 99.7%"]
    ];
    let logIdx = 0;
    const addLog = (customLvl, customCls, customMsg) => {
      const lvl = customLvl || logs[logIdx % logs.length][0];
      const cls = customCls || logs[logIdx % logs.length][1];
      const msg = customMsg || logs[logIdx % logs.length][2];
      if (!customMsg) logIdx++;
      const row = document.createElement("div");
      row.className = `tline ${cls}`;
      row.innerHTML = `<span style="min-width:58px;font-weight:bold">[${lvl}]</span><span>${msg}</span>`;
      output.appendChild(row);
      while (output.children.length > 5) output.removeChild(output.firstChild);
    };
    addLog();
    setInterval(addLog, 2200);

    // Run Code Simulation button in terminal
    const runSimBtn = document.getElementById("run-code-sim");
    if (runSimBtn) {
      runSimBtn.addEventListener("click", () => {
        runSimBtn.textContent = "EXECUTING...";
        runSimBtn.style.opacity = "0.7";
        addLog("EXEC", "info", "Starting execution of execute_risk_query('RBI Capital Risk')...");
        setTimeout(() => {
          addLog("RETRIEVE", "ok", "Milvus dense (dim=1536) + BM25 reciprocal rank fusion complete [12 chunks]");
          playTone(600, "sine", 0.04);
        }, 350);
        setTimeout(() => {
          addLog("INFER", "info", "LoRA Llama 3.1 8B generation complete (412 tokens generated @ 78 tok/s)");
          playTone(720, "sine", 0.04);
        }, 700);
        setTimeout(() => {
          addLog("200 OK", "ok", "RAGAS verified: Faithfulness 0.94 | Hallucination: 0.00 | Total: 38ms");
          runSimBtn.textContent = "▶ RUN QUERY";
          runSimBtn.style.opacity = "1";
          playTone(880, "triangle", 0.08);
          showToast("Simulation complete: 38ms response verified");
        }, 1100);
      });
    }
  }

  // Terminal Tab 2: Interactive CLI
  const cliInput = document.getElementById("cli-term-input");
  const cliLogs = document.getElementById("cli-term-logs");
  if (cliInput && cliLogs) {
    const handleCommand = cmdText => {
      const cmd = cmdText.trim().toLowerCase();
      if (!cmd) return;

      const userRow = document.createElement("div");
      userRow.className = "cli-out-row";
      userRow.innerHTML = `<span style="color:var(--accent);font-weight:bold;">chetan@sys:~$</span> ${cmdText}`;
      cliLogs.appendChild(userRow);

      let response = "";
      if (cmd === "help") {
        response = `Available commands:
  • skills    - Categorized engineering stack
  • projects  - Highlighted AI systems & repos
  • eval      - Run simulated RAGAS faithfulness eval
  • bio       - Quick engineering profile summary
  • contact   - Direct email, phone, and links
  • clear     - Clear terminal screen`;
      } else if (cmd === "skills") {
        response = `[AI/ML]: RAG, Milvus, BM25, LoRA Fine-Tuning, Llama 3.1, RAGAS, Langfuse
[FRAMEWORKS]: FastAPI, PyTorch, TensorFlow, OpenCV, LangChain, Docker
[CORE CS]: Async Microservices, System Design, 200+ LeetCode Solved`;
      } else if (cmd === "projects") {
        response = `1. Risk Minor: Multi-agent regulatory risk platform (Milvus + LoRA Llama 3.1)
2. AstraRoute: Climate-resilient detour routing (OSRM + Scrapling + Leaflet)
3. AI Blur Detector: OpenCV Laplacian + SQLite quality evaluation API
4. Airbus FCOM RAG: Ultra-high precision manual QA engine`;
      } else if (cmd === "eval") {
        response = `[RAGAS EVAL HARNESS]:
  • Faithfulness: 0.94 (Target: >0.85)  [PASSED]
  • Answer Relevancy: 0.91              [PASSED]
  • Context Recall: 0.89                [PASSED]
  • Hallucination Risk: 0.00            [PASSED]`;
      } else if (cmd === "bio") {
        response = `Chetan Chhetri — AI/ML Engineer specializing in production LLMs, multilingual LoRA fine-tuning, automated RAGAS eval harnesses, and sub-second async FastAPI microservices. B.Tech CSE (AI/ML) @ SIT MAKAUT (2028).`;
      } else if (cmd === "contact") {
        response = `Email: chhetrichetan45@gmail.com | Phone: +91 81676 80360
GitHub: github.com/Chetanchhetri | LinkedIn: in/chetanchhetri`;
      } else if (cmd === "clear") {
        cliLogs.innerHTML = "";
        cliInput.value = "";
        return;
      } else {
        response = `bash: command not found: ${cmdText}. Type 'help' for available commands.`;
      }

      const resRow = document.createElement("div");
      resRow.className = "cli-out-row";
      resRow.style.color = "var(--ink-soft)";
      resRow.textContent = response;
      cliLogs.appendChild(resRow);
      cliLogs.scrollTop = cliLogs.scrollHeight;
      cliInput.value = "";
      playTone(480, "sine", 0.03);
    };

    cliInput.addEventListener("keydown", e => {
      if (e.key === "Enter") handleCommand(cliInput.value);
    });

    document.querySelectorAll(".cli-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const cmd = chip.dataset.cmd || chip.textContent.trim();
        handleCommand(cmd);
      });
    });
  }

  // Terminal Tab 3: Telemetry Live Gauge Tick
  const telBars = document.querySelectorAll(".tel-bar");
  if (telBars.length) {
    setInterval(() => {
      const vramVal = document.getElementById("tel-vram-val");
      const tokVal = document.getElementById("tel-tok-val");
      const latVal = document.getElementById("tel-lat-val");
      if (vramVal) {
        const vram = (6.0 + Math.random() * 0.4).toFixed(1);
        vramVal.textContent = `${vram} / 8.0 GB`;
      }
      if (tokVal) {
        const tok = Math.floor(75 + Math.random() * 12);
        tokVal.textContent = `${tok} tok/s`;
      }
      if (latVal) {
        const lat = Math.floor(34 + Math.random() * 8);
        latVal.textContent = `${lat}ms`;
      }
    }, 2400);
  }

  // Interactive RAG Pipeline Simulator on Homepage
  const runRagSimBtn = document.getElementById("run-rag-sim");
  const ragInput = document.getElementById("rag-sim-query");
  if (runRagSimBtn && ragInput) {
    const stages = [
      document.getElementById("stage-1"),
      document.getElementById("stage-2"),
      document.getElementById("stage-3"),
      document.getElementById("stage-4")
    ];
    const outBox = document.getElementById("rag-sim-output-text");

    const executeSim = () => {
      const query = ragInput.value.trim() || "Regulatory Compliance Check: Capital Adequacy Ratio";
      runRagSimBtn.textContent = "PROCESSING...";
      runRagSimBtn.style.opacity = "0.7";
      stages.forEach(s => { if (s) { s.classList.remove("active", "completed"); } });

      // Stage 1: Tokenization
      if (stages[0]) stages[0].classList.add("active");
      if (outBox) outBox.textContent = `[STAGE 1] Tokenizing query: "${query}" → 24 input tokens generated with domain embeddings...`;
      playTone(450, "sine", 0.04);

      setTimeout(() => {
        if (stages[0]) { stages[0].classList.remove("active"); stages[0].classList.add("completed"); }
        if (stages[1]) stages[1].classList.add("active");
        if (outBox) outBox.textContent = `[STAGE 2] Running Milvus Dense Search (1536-dim) + BM25 sparse keyword ranking... 12 relevant policy chunks retrieved (RRF Score: 0.892).`;
        playTone(550, "sine", 0.04);
      }, 600);

      setTimeout(() => {
        if (stages[1]) { stages[1].classList.remove("active"); stages[1].classList.add("completed"); }
        if (stages[2]) stages[2].classList.add("active");
        if (outBox) outBox.textContent = `[STAGE 3] Prompt injected into LoRA-fine-tuned Llama 3.1 8B context window. Generating compliant structured inference...`;
        playTone(680, "sine", 0.04);
      }, 1200);

      setTimeout(() => {
        if (stages[2]) { stages[2].classList.remove("active"); stages[2].classList.add("completed"); }
        if (stages[3]) stages[3].classList.add("active");
        if (outBox) outBox.textContent = `[STAGE 4] RAGAS verification complete: Faithfulness: 0.94 | Hallucination Check: 0 violations detected | Citation grounded against RBI Master Circular §4.2.`;
        playTone(850, "triangle", 0.08);
      }, 1800);

      setTimeout(() => {
        if (stages[3]) stages[3].classList.add("completed");
        runRagSimBtn.textContent = "EXECUTE PIPELINE ⚡";
        runRagSimBtn.style.opacity = "1";
        showToast("RAG Pipeline Executed: 38ms | Faithfulness: 0.94");
      }, 2300);
    };

    runRagSimBtn.addEventListener("click", executeSim);

    document.querySelectorAll(".sim-query-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        document.querySelectorAll(".sim-query-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        ragInput.value = chip.dataset.query || chip.textContent.trim();
        executeSim();
      });
    });
  }

  // Project Search & Filter
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projCards = document.querySelectorAll(".proj-grid .card");
  const projSearchInput = document.querySelector(".proj-search-input");
  let currentCategory = "all";
  let searchQuery = "";

  const applyProjectFilter = () => {
    let visibleCount = 0;
    projCards.forEach((card, index) => {
      const matchesCat = currentCategory === "all" || card.dataset.category === currentCategory;
      const cardText = card.textContent.toLowerCase();
      const matchesSearch = !searchQuery || cardText.includes(searchQuery);
      const isVisible = matchesCat && matchesSearch;

      card.style.display = isVisible ? "" : "none";
      if (isVisible) {
        visibleCount++;
        card.animate([
          { opacity: 0.2, transform: "translateY(10px)" },
          { opacity: 1, transform: "translateY(0)" }
        ], { duration: 280, delay: Math.min(index * 20, 200), easing: "cubic-bezier(.2,.8,.2,1)" });
      }
    });

    const countHeader = document.querySelector(".proj-count-label");
    if (countHeader) {
      countHeader.textContent = `SHOWING ${visibleCount} / ${projCards.length} SYSTEMS`;
    }
  };

  filterBtns.forEach(btn => btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.filter || "all";
    applyProjectFilter();
  }));

  if (projSearchInput) {
    projSearchInput.addEventListener("input", e => {
      searchQuery = e.target.value.trim().toLowerCase();
      applyProjectFilter();
    });
  }

  // Architecture Drawers toggle inside Project Cards
  document.querySelectorAll(".toggle-arch-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".card");
      const drawer = card ? card.querySelector(".arch-drawer") : null;
      if (drawer) {
        const isOpen = drawer.classList.toggle("open");
        btn.textContent = isOpen ? "Hide Architecture ▲" : "Inspect Architecture ▼";
        playTone(isOpen ? 650 : 500, "sine", 0.03);
      }
    });
  });

  // Interactive IDE Contact Form on contact.html
  const runSendBtn = document.getElementById("ide-run-send");
  if (runSendBtn) {
    runSendBtn.addEventListener("click", () => {
      const sender = (document.getElementById("ide-sender")?.value || "").trim();
      const role = (document.getElementById("ide-role")?.value || "").trim();
      const body = (document.getElementById("ide-body")?.value || "").trim();

      if (!sender || !body) {
        showToast("Please fill in your sender email and message!");
        playTone(300, "sawtooth", 0.08);
        return;
      }

      runSendBtn.textContent = "DISPATCHING SMTP...";
      runSendBtn.style.opacity = "0.7";
      playTone(600, "sine", 0.05);

      setTimeout(() => {
        runSendBtn.textContent = "RUN send() [Ctrl+Enter]";
        runSendBtn.style.opacity = "1";
        const mailtoUrl = `mailto:chhetrichetan45@gmail.com?subject=${encodeURIComponent(role || "Opportunity for Chetan Chhetri")}&body=${encodeURIComponent(`Sender: ${sender}\nRole: ${role}\n\n${body}`)}`;
        window.location.href = mailtoUrl;
        showToast("Opening email client... Ready to receive opportunities!");
        playTone(880, "triangle", 0.1);
      }, 700);
    });
  }

  // Global Command Palette (Ctrl+K / ⌘K)
  const cmdBackdrop = document.querySelector(".cmd-palette-backdrop");
  const cmdSearchInput = document.querySelector(".cmd-search-input");
  const cmdResults = document.querySelector(".cmd-results");

  const openCmdPalette = () => {
    if (!cmdBackdrop) return;
    cmdBackdrop.classList.add("open");
    if (cmdSearchInput) {
      cmdSearchInput.value = "";
      cmdSearchInput.focus();
      filterCmdItems("");
    }
    playTone(600, "sine", 0.04);
  };

  const closeCmdPalette = () => {
    if (!cmdBackdrop) return;
    cmdBackdrop.classList.remove("open");
  };

  document.querySelectorAll(".nav-cmd-btn").forEach(btn => btn.addEventListener("click", openCmdPalette));
  if (cmdBackdrop) {
    cmdBackdrop.addEventListener("click", e => {
      if (e.target === cmdBackdrop) closeCmdPalette();
    });
  }

  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (cmdBackdrop && cmdBackdrop.classList.contains("open")) {
        closeCmdPalette();
      } else {
        openCmdPalette();
      }
    } else if (e.key === "Escape" && cmdBackdrop && cmdBackdrop.classList.contains("open")) {
      closeCmdPalette();
    }
  });

  const filterCmdItems = q => {
    if (!cmdResults) return;
    const items = cmdResults.querySelectorAll(".cmd-item");
    const query = q.toLowerCase().trim();
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = !query || text.includes(query) ? "flex" : "none";
    });
  };

  if (cmdSearchInput) {
    cmdSearchInput.addEventListener("input", e => filterCmdItems(e.target.value));
  }

  if (cmdResults) {
    cmdResults.addEventListener("click", e => {
      const item = e.target.closest(".cmd-item");
      if (!item) return;
      const action = item.dataset.action;
      const href = item.dataset.href;

      if (action === "theme") {
        const next = (document.documentElement.getAttribute("data-theme") || "dark") === "dark" ? "light" : "dark";
        applyTheme(next);
        localStorage.setItem("cc-theme", next);
        showToast(`Theme switched to ${next.toUpperCase()}`);
      } else if (action === "copy-email") {
        navigator.clipboard.writeText("chhetrichetan45@gmail.com");
        showToast("Email copied: chhetrichetan45@gmail.com");
      } else if (action === "audio") {
        soundEnabled = !soundEnabled;
        localStorage.setItem("cc-sound", soundEnabled ? "true" : "false");
        updateSoundButtons();
        showToast(soundEnabled ? "Audio Effects: Enabled" : "Audio Effects: Muted");
      } else if (href) {
        window.location.href = href;
      }
      closeCmdPalette();
    });
  }

  // Back to top button
  const backToTopBtn = document.querySelector(".back-to-top");
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      backToTopBtn.classList.toggle("visible", window.scrollY > 350);
    });
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      playTone(700, "sine", 0.04);
    });
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll(".card,.tl-item,.skill-panel,.metric,.contact-card,.edu-row,.cta-banner,.stats-row");
  revealEls.forEach(el => el.classList.add("reveal"));
  const observer = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("is-visible"); observer.unobserve(e.target); }
  }), { threshold: 0.06 });
  revealEls.forEach(el => observer.observe(el));

  // 3D tilt
  if (window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".card,.terminal-card,.skill-panel,.metric,.stat,.contact-card").forEach(card => {
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        const rx = ((y - r.height / 2) / r.height) * -4, ry = ((x - r.width / 2) / r.width) * 4;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translate(-2px,-2px)`;
      });
      card.addEventListener("mouseleave", () => card.style.transform = "");
    });
  }

  // Cursor glow
  if (window.matchMedia("(pointer:fine)").matches) {
    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);
    window.addEventListener("pointermove", e => {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
    });
  }

  // Neural 3D canvas
  initNeuralScene();
});

function initNeuralScene() {
  const canvas = document.getElementById("neural-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0, h = 0, mouse = { x: 0, y: 0, px: 0, py: 0, active: false };
  let shockwaves = [];
  let nodes = [];

  const techLabels = ["Llama 3.1", "Milvus", "CUDA", "FastAPI", "LoRA", "Docker", "PyTorch", "RAGAS", "Qdrant", "FAISS", "Langfuse", "PEFT", "BM25"];

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    w = r.width;
    h = r.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(30, Math.min(50, Math.floor(w / 22)));
    nodes = Array.from({ length: count }, (_, i) => {
      const isNamed = i < techLabels.length;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random(),
        vx: (Math.random() - 0.5) * (isNamed ? 0.18 : 0.3),
        vy: (Math.random() - 0.5) * (isNamed ? 0.18 : 0.3),
        phase: Math.random() * Math.PI * 2,
        size: isNamed ? 3.5 : 1.2 + Math.random() * 2,
        label: isNamed ? techLabels[i] : null,
        pulseSpeed: 0.0015 + Math.random() * 0.002
      };
    });
  };

  resize();
  window.addEventListener("resize", resize);

  window.addEventListener("pointermove", e => {
    const r = canvas.getBoundingClientRect();
    mouse.px = e.clientX - r.left;
    mouse.py = e.clientY - r.top;
    mouse.x = (mouse.px / w) - 0.5;
    mouse.y = (mouse.py / h) - 0.5;
    mouse.active = mouse.px >= -50 && mouse.px <= w + 50 && mouse.py >= -50 && mouse.py <= h + 50;
  });

  // Click shockwave
  window.addEventListener("click", e => {
    const r = canvas.getBoundingClientRect();
    const cx = e.clientX - r.left;
    const cy = e.clientY - r.top;
    if (cx >= 0 && cx <= w && cy >= 0 && cy <= h) {
      shockwaves.push({ x: cx, y: cy, radius: 0, maxRadius: 180, alpha: 0.8 });
    }
  });

  const accent = () => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#35f27a";
  const cyan = () => getComputedStyle(document.documentElement).getPropertyValue("--cyan").trim() || "#22d3ee";
  const lineSoft = () => getComputedStyle(document.documentElement).getPropertyValue("--line-soft").trim() || "#2e4461";

  function frame(t) {
    ctx.clearRect(0, 0, w, h);

    // Update shockwaves
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.radius += 4.5;
      sw.alpha *= 0.94;
      if (sw.radius > sw.maxRadius || sw.alpha < 0.02) {
        shockwaves.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = cyan();
      ctx.globalAlpha = sw.alpha;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Node physics
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20 || n.x > w + 20) n.vx *= -1;
      if (n.y < -20 || n.y > h + 20) n.vy *= -1;
    });

    const ox = mouse.x * 24, oy = mouse.y * 18;

    // Node-to-node connections
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, dist = Math.hypot(dx, dy);
        if (dist < 135) {
          const alpha = (1 - dist / 135) * 0.28;
          ctx.strokeStyle = (a.label || b.label) ? cyan() : accent();
          ctx.globalAlpha = alpha;
          ctx.lineWidth = a.label && b.label ? 1.2 : 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x + ox, a.y + oy);
          ctx.lineTo(b.x + ox, b.y + oy);
          ctx.stroke();
        }
      }

      // Mouse interactive connection
      if (mouse.active) {
        const mdx = (a.x + ox) - mouse.px;
        const mdy = (a.y + oy) - mouse.py;
        const mdist = Math.hypot(mdx, mdy);
        if (mdist < 140) {
          const mAlpha = (1 - mdist / 140) * 0.45;
          ctx.strokeStyle = accent();
          ctx.globalAlpha = mAlpha;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x + ox, a.y + oy);
          ctx.lineTo(mouse.px, mouse.py);
          ctx.stroke();
        }
      }
    }

    // Draw nodes & labels
    nodes.forEach((n, i) => {
      const pulse = 1 + Math.sin(t * n.pulseSpeed + n.phase) * 0.35;
      const nx = n.x + ox, ny = n.y + oy;

      if (n.label) {
        // Named primary AI node
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = cyan();
        ctx.beginPath();
        ctx.arc(nx, ny, n.size * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Outer glow ring
        ctx.strokeStyle = accent();
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.4 * pulse;
        ctx.beginPath();
        ctx.arc(nx, ny, (n.size + 4) * pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Node badge text
        ctx.font = "9px 'IBM Plex Mono', monospace";
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#f0f6fc";
        ctx.globalAlpha = 0.85;
        ctx.fillText(n.label, nx + 7, ny + 3);
      } else {
        // Background mesh node
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = i % 3 === 0 ? cyan() : accent();
        ctx.beginPath();
        ctx.arc(nx, ny, n.size * pulse, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.globalAlpha = 1;
    if (!reduce) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
