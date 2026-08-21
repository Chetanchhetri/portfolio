document.addEventListener('DOMContentLoaded', () => {

  /* ---------- THEME TOGGLE ---------- */
  const savedTheme = localStorage.getItem('cc-theme') || 'dark';
  applyTheme(savedTheme);

  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('cc-theme', next);
    });
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      const icon = btn.querySelector('.ti');
      const label = btn.querySelector('.tl');
      if (icon) icon.textContent = theme === 'dark' ? '☀' : '◐';
      if (label) label.textContent = theme === 'dark' ? 'LIGHT' : 'DARK';
    });
  }

  /* ---------- MOBILE NAV ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const open = navLinks.classList.contains('mobile-open');
      if (open) {
        navLinks.classList.remove('mobile-open');
        navLinks.style = '';
      } else {
        navLinks.classList.add('mobile-open');
        Object.assign(navLinks.style, {
          display: 'flex',
          position: 'absolute',
          top: '56px',
          left: '0',
          right: '0',
          flexDirection: 'column',
          background: 'var(--bg)',
          padding: '16px',
          borderBottom: '2px solid var(--line)',
          gap: '6px',
          zIndex: '99'
        });
      }
    });
  }

  /* ---------- LIVE TERMINAL CONSOLE ---------- */
  const consoleOutput = document.getElementById('console-output');
  if (consoleOutput) {
    const logPool = [
      { lvl: '200 OK', cls: 'ok',   msg: 'POST /v1/risk/query → 38ms  [Milvus hybrid search, top_k=12]' },
      { lvl: 'INFO',   cls: 'info', msg: 'LoRA adapter [llama-3.1-8b-multilingual] loaded → VRAM: 6.2 GB' },
      { lvl: 'EVAL',   cls: 'ok',   msg: 'RAGAS  faithfulness: 0.94 | context_recall: 0.91 | relevancy: 0.89' },
      { lvl: 'TRACE',  cls: 'info', msg: 'Langfuse trace #9081 recorded — latency p95: 112ms' },
      { lvl: 'GUARD',  cls: 'warn', msg: 'hallucination_check PASSED — 0 policy violations detected' },
      { lvl: '200 OK', cls: 'ok',   msg: 'GET  /v1/compliance/report → 89ms  [BM25 rerank applied]' },
      { lvl: 'INFO',   cls: 'info', msg: 'Docker container [risk-minor-api:v2.1] — uptime: 99.7%' },
    ];
    let idx = 0;
    function appendLog() {
      const item = logPool[idx % logPool.length];
      const row = document.createElement('div');
      row.className = `tline ${item.cls}`;
      row.innerHTML = `<span style="min-width:72px;flex-shrink:0;font-weight:bold;">[${item.lvl}]</span><span>${item.msg}</span>`;
      consoleOutput.appendChild(row);
      while (consoleOutput.children.length > 5) consoleOutput.removeChild(consoleOutput.firstChild);
      idx++;
    }
    appendLog();
    setInterval(appendLog, 2000);
  }

  /* ---------- PROJECT FILTERS ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.proj-grid .card');
  if (filterBtns.length && cards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        cards.forEach(card => {
          card.style.display = (filter === 'all' || card.dataset.category === filter) ? 'flex' : 'none';
        });
      });
    });
  }

  /* ---------- 3D TILT ON CARDS ---------- */
  if (window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.card, .terminal-card, .skill-panel, .stat').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        const rx = ((y - r.height / 2) / r.height) * -4;
        const ry = ((x - r.width  / 2) / r.width)  *  4;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translate(-2px,-2px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- SCROLL REVEAL ---------- */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.card, .tl-item, .skill-panel, .metric, .contact-card, .edu-row').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    observer.observe(el);
  });

});
