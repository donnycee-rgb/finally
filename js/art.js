// Shared original artwork: the red ribbon bow, wax seals, hand-drawn sketches.

export const reducedMotion = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Simple original ribbon bow. viewBox 0 0 64 44.
export function bowSVG(cls = 'bow') {
  return `
<svg class="${cls}" viewBox="0 0 64 44" aria-hidden="true" focusable="false">
  <path d="M30 23 L21 41 L26.5 38.5 L29 43 L33 24 Z" fill="var(--bow-red)" stroke="#a01f33" stroke-width="1" stroke-linejoin="round"/>
  <path d="M34 23 L43 41 L37.5 38.5 L35 43 L31 24 Z" fill="var(--bow-red)" stroke="#a01f33" stroke-width="1" stroke-linejoin="round"/>
  <path d="M32 21 C25 8 6 2 5 14 C4.5 25 20 28 32 21 Z" fill="var(--bow-red)" stroke="#a01f33" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M32 21 C39 8 58 2 59 14 C59.5 25 44 28 32 21 Z" fill="var(--bow-red)" stroke="#a01f33" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M28 18 C21 12 13 10 11 14" fill="none" stroke="#ff8a9a" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>
  <path d="M36 18 C43 12 51 10 53 14" fill="none" stroke="#ff8a9a" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>
  <rect x="27" y="15" width="10" height="12" rx="4" fill="#c92a40" stroke="#a01f33" stroke-width="1"/>
  <path d="M29.5 18 Q32 17 34.5 18" fill="none" stroke="#ff9aa8" stroke-width="1" stroke-linecap="round" opacity=".8"/>
</svg>`;
}

export const BOW_FAVICON =
  'data:image/svg+xml,' +
  encodeURIComponent(bowSVG().replace(/var\(--bow-red\)/g, '#e2384d'));

// Wax seal made of two halves that can crack apart.
export function sealHTML() {
  const half = (side) => `
  <span class="seal-half seal-${side}">
    <svg viewBox="0 0 60 60" aria-hidden="true" focusable="false">
      <path d="M30 3 C38 2 45 6 50 11 C56 16 58 23 57 30 C58 38 54 45 49 50 C43 56 37 58 30 57 C22 58 15 54 10 49 C4 43 2 37 3 30 C2 22 6 15 11 10 C16 5 23 2 30 3 Z" fill="var(--bow-red)"/>
      <circle cx="30" cy="30" r="21" fill="none" stroke="#a01f33" stroke-width="1.5" opacity=".7"/>
      <g transform="translate(14 19) scale(.5)">${bowInner()}</g>
    </svg>
  </span>`;
  return `<span class="seal" aria-hidden="true">${half('l')}${half('r')}</span>`;
}

// Bow drawn in pale relief for the seal centre.
function bowInner() {
  return `
  <path d="M30 23 L21 41 L26.5 38.5 L29 43 L33 24 Z" fill="#ff8a9a"/>
  <path d="M34 23 L43 41 L37.5 38.5 L35 43 L31 24 Z" fill="#ff8a9a"/>
  <path d="M32 21 C25 8 6 2 5 14 C4.5 25 20 28 32 21 Z" fill="#ff9fad"/>
  <path d="M32 21 C39 8 58 2 59 14 C59.5 25 44 28 32 21 Z" fill="#ff9fad"/>
  <rect x="27" y="15" width="10" height="12" rx="4" fill="#ffb3bf"/>`;
}

// Crack a seal: halves split and fall away.
export function crackSeal(sealEl, reduced = reducedMotion()) {
  const gsap = window.gsap;
  if (!sealEl) return;
  const l = sealEl.querySelector('.seal-l');
  const r = sealEl.querySelector('.seal-r');
  if (reduced) {
    gsap.to(sealEl, { opacity: 0, duration: 0.3 });
    return;
  }
  gsap.to(l, { x: -10, y: 26, rotation: -28, opacity: 0, duration: 0.7, ease: 'power2.in' });
  gsap.to(r, { x: 10, y: 30, rotation: 24, opacity: 0, duration: 0.7, ease: 'power2.in', delay: 0.04 });
}

// Hand-drawn line sketches. viewBox 0 0 200 150. White ink, round caps.
const SKETCHES = {
  bench: `
    <path class="w2" d="M28 104 C70 103 130 105 174 103"/>
    <path class="w1" d="M30 110 C72 109 128 111 172 110"/>
    <path class="w2" d="M40 110 L37 136 M162 110 L165 136"/>
    <path class="w1" d="M34 70 C75 69 125 71 168 69 M33 82 C76 81 126 83 169 81"/>
    <path class="w2" d="M44 70 L42 104 M158 69 L160 103"/>
    <circle class="w2" cx="82" cy="42" r="10"/>
    <path class="w2" d="M80 53 C76 66 74 82 78 101 M78 66 C88 72 94 74 100 72"/>
    <path class="w1" d="M76 100 C86 102 94 104 98 120 M98 120 L94 134"/>
    <circle class="w2" cx="118" cy="45" r="9.5"/>
    <path class="w1" d="M109 41 C110 30 126 30 127 42 C129 50 128 58 125 62"/>
    <path class="w2" d="M119 55 C124 68 124 84 120 101 M121 68 C112 72 106 74 100 72"/>
    <path class="w1" d="M120 100 C112 103 106 106 104 120 M104 120 L108 134"/>
    <path class="w1 pinkline" d="M100 22 C96 15 88 18 92 24 L100 31 L108 24 C112 18 104 15 100 22 Z"/>`,
  footprints: `
    ${foot(40, 118, -18, false)}${foot(66, 102, -14, true)}
    ${foot(84, 88, -22, false)}${foot(112, 76, -12, true)}
    ${foot(126, 58, -26, false)}${foot(154, 48, -16, true)}
    <path class="w1 faint" d="M20 132 C70 110 120 80 186 34"/>`,
  cookie: `
    <path class="w2" d="M44 62 C44 46 156 46 156 62 C156 72 44 72 44 62 Z"/>
    <path class="w1" d="M44 62 L44 72 C46 84 154 84 156 72 L156 62"/>
    <path class="w2 pinkline" d="M46 78 C60 86 76 82 90 86 C106 90 122 84 138 86 C146 87 152 84 154 80"/>
    <path class="w1" d="M46 84 C48 92 152 92 154 84"/>
    <path class="w2" d="M44 88 L44 96 C46 110 154 110 156 96 L156 88"/>
    <path class="w1" d="M52 58 C70 54 92 53 112 54"/>
    <path class="w1" d="M168 104 l3 2 M176 96 l2 3 M34 104 l-3 2"/>`,
  card: `
    <path class="w2" d="M56 36 L104 28 L104 126 L56 132 Z"/>
    <path class="w2" d="M104 28 L150 40 L148 132 L104 126"/>
    <path class="w1" d="M58 40 L100 33"/>
    <path class="w2 pinkline" d="M126 76 C120 64 106 68 112 80 L126 96 L140 80 C146 68 132 64 126 76 Z"/>
    <path class="w1" d="M116 108 C122 106 128 107 136 105"/>
    <path class="w1" d="M160 40 l6 -6 M164 54 l8 -1 M44 52 l-7 -4"/>`,
  star: `
    <path class="w2 sk-star" d="M100 22 L111 58 L148 60 L118 82 L129 118 L100 96 L71 118 L82 82 L52 60 L89 58 Z"/>
    <path class="w1 sk-rays" d="M100 6 L100 14 M162 70 L172 70 M28 70 L38 70 M100 128 L100 140 M146 28 l6 -6 M54 28 l-6 -6"/>`,
  envelope: `
    <path class="w2" d="M46 52 L154 50 L156 120 L44 122 Z"/>
    <path class="w2" d="M46 53 L100 92 L155 51"/>
    <path class="w1" d="M45 121 L88 84 M156 119 L112 84"/>
    <g class="sk-bow">
      <path class="w1 redline" d="M100 90 C92 78 78 78 80 88 C82 96 94 94 100 90 Z"/>
      <path class="w1 redline" d="M100 90 C108 78 122 78 120 88 C118 96 106 94 100 90 Z"/>
      <path class="w1 redline" d="M98 92 L92 106 M102 92 L108 106"/>
    </g>`,
};

function foot(x, y, rot, right) {
  const s = right ? -1 : 1;
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s} 1)">
    <path class="w2" d="M0 0 C-5 -4 -5 -14 0 -16 C5 -17 7 -9 5 -2 C4 2 2 3 0 0 Z"/>
    <circle class="w1" cx="-3" cy="-20" r="1.4"/><circle class="w1" cx="0" cy="-21.5" r="1.4"/><circle class="w1" cx="3.4" cy="-20.5" r="1.3"/>
  </g>`;
}

export function sketchSVG(name) {
  return `<svg class="sketch sketch-${name}" viewBox="0 0 200 150" aria-hidden="true" focusable="false">${SKETCHES[name] || ''}</svg>`;
}

// Animate every stroke in an SVG drawing itself. Returns a gsap timeline.
export function drawOn(svg, { duration = 1.8, stagger = 0.12, delay = 0, reduced = reducedMotion() } = {}) {
  const gsap = window.gsap;
  const els = svg.querySelectorAll('path, circle, ellipse, line, polyline, rect');
  const tl = gsap.timeline({ delay });
  if (reduced) {
    tl.fromTo(svg, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    return tl;
  }
  els.forEach((el) => {
    let len = 0;
    try { len = el.getTotalLength(); } catch (e) { len = 0; }
    if (!len) return;
    el.style.strokeDasharray = `${len} ${len}`;
    el.style.strokeDashoffset = len;
  });
  tl.to(els, {
    strokeDashoffset: 0,
    duration,
    ease: 'sine.inOut',
    // keep total drawing time similar however many strokes a sketch has
    stagger: { each: Math.min(stagger, 1.1 / Math.max(1, els.length)) },
  });
  return tl;
}

// Simple heart outline path (viewBox 0 0 100 90)
export const HEART_PATH =
  'M50 84 C30 70 6 54 6 30 C6 15 17 6 29 6 C39 6 46 12 50 20 C54 12 61 6 71 6 C83 6 94 15 94 30 C94 54 70 70 50 84 Z';

export function heartSVG(cls = 'heart-ico') {
  return `<svg class="${cls}" viewBox="0 0 100 90" aria-hidden="true" focusable="false"><path d="${HEART_PATH}"/></svg>`;
}

// Escape text for innerHTML
export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Render the subscript "L_t" in prose as L with subscript t (text stays verbatim in content.js)
export function prose(s) {
  return esc(s).replace(/L_t/g, 'L<sub>t</sub>');
}

// Build a "continue →"-style button that starts hidden.
export function makeButton(label, cls = 'btn btn-continue') {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = cls;
  b.textContent = label;
  return b;
}

export function reveal(el, { y = 12, duration = 0.8, delay = 0 } = {}) {
  const gsap = window.gsap;
  el.hidden = false;
  return gsap.fromTo(el, { opacity: 0, y: reducedMotion() ? 0 : y }, { opacity: 1, y: 0, duration, delay, ease: 'power2.out' });
}

// A sealed envelope (CSS-built) with the red bow wax seal.
export function envelopeHTML(extra = '') {
  return `<span class="env" aria-hidden="true">
    <span class="env-back"></span>
    <span class="env-paper"></span>
    <span class="env-front"></span>
    <span class="env-flap"></span>
    ${sealHTML()}
    ${extra}
  </span>`;
}

// Open an envelope element: crack seal, lift flap.
export function openEnvelope(envEl, reduced = reducedMotion()) {
  const gsap = window.gsap;
  crackSeal(envEl.querySelector('.seal'), reduced);
  const flap = envEl.querySelector('.env-flap');
  if (reduced) {
    envEl.classList.add('is-open');
    return gsap.timeline().to({}, { duration: 0.3 });
  }
  const tl = gsap.timeline();
  tl.to(flap, { rotationX: 180, duration: 0.7, ease: 'power2.inOut', delay: 0.25 })
    .add(() => envEl.classList.add('is-open'));
  return tl;
}

// Modal card. Tapping outside (or Escape) closes it.
export function showModal({ html, className = '', closeLabel = 'close', onClose, from = null }) {
  const gsap = window.gsap;
  const reduced = reducedMotion();
  const prevFocus = document.activeElement;
  const wrap = document.createElement('div');
  wrap.className = `modal ${className}`;
  wrap.innerHTML = `
    <button type="button" class="modal-backdrop" aria-label="${esc(closeLabel)}"></button>
    <div class="modal-card" role="dialog" aria-modal="true" tabindex="-1">
      <button type="button" class="modal-x" aria-label="${esc(closeLabel)}">×</button>
      ${html}
    </div>`;
  document.body.appendChild(wrap);
  const card = wrap.querySelector('.modal-card');
  const backdrop = wrap.querySelector('.modal-backdrop');

  gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.4 });
  gsap.fromTo(card, { opacity: 0, y: reduced ? 0 : 60, scale: reduced ? 1 : 0.96 },
    { opacity: 1, y: 0, scale: 1, duration: reduced ? 0.4 : 0.7, ease: 'power2.out' });
  setTimeout(() => { try { card.focus({ preventScroll: true }); } catch (e) {} }, 50);

  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    document.removeEventListener('keydown', onKey);
    gsap.to(card, { opacity: 0, y: reduced ? 0 : 30, duration: 0.35, ease: 'power2.in' });
    gsap.to(backdrop, {
      opacity: 0, duration: 0.4,
      onComplete: () => {
        wrap.remove();
        try { prevFocus && prevFocus.focus({ preventScroll: true }); } catch (e) {}
        onClose && onClose();
      },
    });
  }
  function onKey(e) { if (e.key === 'Escape') close(); }
  document.addEventListener('keydown', onKey);
  backdrop.addEventListener('click', close);
  wrap.querySelector('.modal-x').addEventListener('click', close);
  return { el: wrap, card, close };
}
