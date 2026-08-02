document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile nav toggle ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.style.display === 'flex';
      links.style.display = open ? 'none' : 'flex';
      links.style.cssText += open ? '' : 'position:absolute;top:64px;left:0;right:0;flex-direction:column;background:#fff;padding:16px 32px;border-bottom:1px solid var(--line);align-items:flex-start;gap:4px;';
    });
  }

  /* ---------- Scroll progress bar ---------- */
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.prepend(bar);
  let ticking = false;
  function updateProgress() {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? scrolled / max : 0;
    bar.style.transform = `scaleX(${pct})`;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateProgress); ticking = true; }
  }, { passive: true });
  updateProgress();

  /* ---------- Scroll reveal (with cascading stagger per group) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const groups = new Map();
  revealEls.forEach(el => {
    const parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });
  groups.forEach(group => {
    group.forEach((el, i) => { el.style.transitionDelay = Math.min(i * 70, 280) + 'ms'; });
  });
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- Animated counters (stats / metrics) ---------- */
  const counterEls = document.querySelectorAll('.stat .num, .metric .num');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  counterEls.forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const raw = el.textContent.trim();
    const match = raw.match(/^(\d+)/);
    if (!match) return;
    if (reduceMotion) return;
    const target = parseInt(match[1], 10);
    const suffix = raw.slice(match[0].length);
    const duration = 1100;
    const start = performance.now();
    el.textContent = '0' + suffix;
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = raw;
        el.classList.add('num-pop');
        el.addEventListener('animationend', () => el.classList.remove('num-pop'), { once: true });
      }
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Pipeline diagram sequential highlight (home page) ---------- */
  const nodes = document.querySelectorAll('.node-row .node');
  if (nodes.length) {
    let idx = 0;
    setInterval(() => {
      nodes.forEach(n => n.classList.remove('active'));
      nodes[idx].classList.add('active');
      idx = (idx + 1) % nodes.length;
    }, 1400);
  }

  /* ---------- Project filters (projects page), with fade transition ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.proj-grid .card');
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.filter;
        cards.forEach(card => {
          const match = cat === 'all' || card.dataset.category === cat;
          if (reduceMotion) {
            card.classList.toggle('hidden', !match);
            return;
          }
          if (match) {
            card.classList.remove('hidden');
            requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove('fade-out')));
          } else {
            card.classList.add('fade-out');
            setTimeout(() => { if (card.classList.contains('fade-out')) card.classList.add('hidden'); }, 280);
          }
        });
      });
    });
  }

  /* ---------- Motion-only enhancements (skipped for reduced-motion users) ---------- */
  if (!reduceMotion) {
    initAmbientGlow('.hero, .cta-banner, .diagram-card');
    initTilt('.feature-grid .card, .proj-grid .card, .contact-card, .skill-panel');
    initMagnetic('.btn, .nav-cta');
  }

  function initAmbientGlow(selector) {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%';
        const y = ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%';
        el.style.setProperty('--mx', x);
        el.style.setProperty('--my', y);
      });
    });
  }

  function initTilt(selector) {
    const max = 6;
    document.querySelectorAll(selector).forEach(card => {
      card.style.transformStyle = 'preserve-3d';
      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform .15s ease-out';
      });
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (py - 0.5) * -max;
        const ry = (px - 0.5) * max;
        card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)';
        card.style.transform = '';
      });
    });
  }

  function initMagnetic(selector) {
    const strength = 12;
    document.querySelectorAll(selector).forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        const y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        btn.style.transform = `translate(${(x * strength).toFixed(1)}px, ${(y * strength * 0.6).toFixed(1)}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }
});
