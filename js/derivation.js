// The derivation: lecture notes, KaTeX, and fig. 1.
import { esc, prose, makeButton, reveal } from './art.js';

const DAY = 86400000;
const START = Date.UTC(2026, 0, 10);
const DIP = Date.UTC(2026, 8, 23);

// Deterministic PRNG + normal sampler
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildSeries(endMs) {
  const mu = 0.9;
  const sigma = 0.35;
  const L0 = 1;
  const rand = mulberry32(100126);
  const gauss = () => {
    let u = 0;
    let v = 0;
    while (u === 0) u = rand();
    while (v === 0) v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const days = Math.max(1, Math.round((endMs - START) / DAY));
  const dipDay = Math.round((DIP - START) / DAY);
  const dt = 1 / 365;
  const path = [];
  const drift = [];
  let lnL = Math.log(L0);
  let dipLevel = null;
  for (let d = 0; d <= days; d++) {
    const t = d * dt;
    drift.push(L0 * Math.exp((mu - 0.5 * sigma * sigma) * t));
    if (d > 0) {
      lnL += (mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * gauss();
      // The forced dip after 23 Sep, then the recovery
      const k = d - dipDay;
      if (k > 0 && k <= 12) lnL -= 0.016;
      if (k > 12 && k <= 30) lnL += 0.011;
    }
    if (d === dipDay) dipLevel = lnL;
    path.push(lnL);
  }
  // Guarantee it ends above its 23 Sep level
  if (dipLevel !== null && days > dipDay) {
    const endGap = path[days] - dipLevel;
    const want = 0.06;
    if (endGap < want) {
      const lift = want - endGap;
      for (let d = dipDay + 13; d <= days; d++) {
        const f = Math.min(1, (d - dipDay - 12) / Math.max(1, days - dipDay - 12));
        path[d] += lift * f;
      }
    }
  }
  return { days, dipDay, sample: path.map(Math.exp), drift };
}

function fmtDate(ms, months) {
  const d = new Date(ms);
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function chartSVG(C) {
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  // If viewed before the dip has had time to recover, still show a sensible window
  const end = Math.max(today, DIP + 40 * DAY);
  const { days, dipDay, sample, drift } = buildSeries(end);

  const VW = 560;
  const VH = 300;
  const pad = { l: 44, r: 50, t: 22, b: 40 };
  const all = sample.concat(drift);
  const yMin = Math.min(...all) * 0.92;
  const yMax = Math.max(...all) * 1.06;
  const x = (d) => pad.l + (d / days) * (VW - pad.l - pad.r);
  const y = (v) => VH - pad.b - ((v - yMin) / (yMax - yMin)) * (VH - pad.t - pad.b);
  const line = (arr) => arr.map((v, d) => `${d ? 'L' : 'M'}${x(d).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');

  const dx = x(dipDay);
  const endLabel = fmtDate(today, C.months);
  const lastY = y(drift[days]);
  return `
  <svg class="chart" viewBox="0 0 ${VW} ${VH}" role="img" aria-label="${esc(C.caption)}">
    <line class="axis" x1="${pad.l}" y1="${VH - pad.b}" x2="${VW - pad.r + 8}" y2="${VH - pad.b}"/>
    <line class="axis" x1="${pad.l}" y1="${VH - pad.b}" x2="${pad.l}" y2="${pad.t - 6}"/>
    <text class="axis-label" x="${pad.l - 10}" y="${pad.t + 4}" text-anchor="end">L<tspan dy="4" font-size="10">t</tspan></text>
    <text class="tick-label" x="${pad.l}" y="${VH - pad.b + 22}" text-anchor="start">${esc(fmtDate(START, C.months))}</text>
    <text class="tick-label" x="${x(days)}" y="${VH - pad.b + 22}" text-anchor="end">${esc(endLabel)}</text>
    <line class="dip-line" x1="${dx}" y1="${pad.t}" x2="${dx}" y2="${VH - pad.b}"/>
    <text class="dip-label" x="${dx}" y="${pad.t - 6}" text-anchor="middle">${esc(C.dipLabel)}</text>
    <path class="curve-drift" d="${line(drift)}"/>
    <path class="curve-sample" d="${line(sample)}"/>
    <text class="drift-label" x="${x(days) + 6}" y="${lastY + 4}">${esc(C.driftLabel)}</text>
  </svg>`;
}

function renderMath(el, tex) {
  try {
    window.katex.render(tex, el, { displayMode: true, throwOnError: false, strict: 'ignore' });
  } catch (e) {
    el.textContent = '';
  }
}

export function mount(ctx) {
  const { inner, content, reduced } = ctx;
  const C = content.derivation;
  const gsap = window.gsap;

  inner.innerHTML = `
    <article class="notes">
      <header class="notes-head">
        <h2 class="notes-title">${esc(C.header)}</h2>
        <p class="notes-label">${esc(C.label)}</p>
      </header>
      <div class="notes-body"></div>
    </article>
  `;
  const body = inner.querySelector('.notes-body');
  const blocks = C.blocks.map((b) => {
    const sec = document.createElement('section');
    sec.className = 'notes-block';
    sec.hidden = true;
    if (b.title) {
      const h = document.createElement('h3');
      h.className = 'notes-block-title';
      h.innerHTML = prose(b.title);
      sec.appendChild(h);
    }
    b.items.forEach((it) => {
      let el;
      if (it.t === 'text') {
        el = document.createElement('p');
        el.className = 'notes-text';
        el.innerHTML = prose(it.v);
      } else if (it.t === 'math') {
        el = document.createElement('div');
        el.className = 'notes-math';
        renderMath(el, it.v);
      } else if (it.t === 'chart') {
        el = document.createElement('figure');
        el.className = 'notes-chart';
        el.innerHTML = `<div class="chart-scroll">${chartSVG(C.chart)}</div><figcaption>${esc(C.chart.caption)}</figcaption>`;
      }
      el.classList.add('line');
      sec.appendChild(el);
    });
    body.appendChild(sec);
    return sec;
  });

  const nextWrap = document.createElement('div');
  nextWrap.className = 'continue-wrap';
  const nextBtn = makeButton(content.ui.nextStep, 'btn btn-ghost');
  nextWrap.appendChild(nextBtn);
  inner.appendChild(nextWrap);
  const cont = ctx.continueButton();

  let shown = 0;
  function showBlock(i) {
    const sec = blocks[i];
    sec.hidden = false;
    const lines = sec.querySelectorAll('.line, .notes-block-title');
    const tl = gsap.timeline();
    tl.fromTo(lines, { opacity: 0, y: reduced ? 0 : 8 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.55, ease: 'power2.out' });
    const chart = sec.querySelector('.chart');
    if (chart) {
      // On narrow screens, show the recent part (23 Sep dip and recovery)
      const sc = sec.querySelector('.chart-scroll');
      const toEnd = () => gsap.to(sc, { scrollLeft: sc.scrollWidth - sc.clientWidth, duration: reduced ? 0 : 1.6, ease: 'sine.inOut' });
      const curves = chart.querySelectorAll('.curve-drift, .curve-sample');
      const labels = chart.querySelectorAll('.drift-label, .dip-line, .dip-label');
      if (!reduced) {
        curves.forEach((c) => {
          const len = c.getTotalLength();
          gsap.set(c, { strokeDasharray: len, strokeDashoffset: len });
        });
        gsap.set(labels, { opacity: 0 });
        tl.to(curves, { strokeDashoffset: 0, duration: 2.6, ease: 'sine.inOut', stagger: 0.5 }, 0.3)
          .add(toEnd, 1.4)
          .to(labels, { opacity: 1, duration: 0.8 }, '-=0.6');
      } else {
        tl.add(toEnd);
      }
    }
    setTimeout(() => {
      try { sec.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); } catch (e) {}
    }, 60);
    shown = i + 1;
    if (shown >= blocks.length) {
      nextWrap.remove();
      tl.add(() => cont.show(), '+=0.3');
    } else {
      nextBtn.hidden = true;
      tl.add(() => reveal(nextBtn, { y: 0, duration: 0.5 }), '+=0.1');
    }
  }

  nextBtn.addEventListener('click', () => {
    if (shown < blocks.length) showBlock(shown);
  });

  // First block appears on arrival
  nextBtn.hidden = true;
  setTimeout(() => showBlock(0), 500);
}
