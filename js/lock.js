// The lock: three date wheels, DD / MM / YYYY.
import { bowSVG, esc } from './art.js';

const pad = (n, len = 2) => String(n).padStart(len, '0');

export function mount(ctx) {
  const { inner, content, reduced } = ctx;
  const C = content.lock;
  const A = content.a11y;
  const gsap = window.gsap;

  const wheels = [
    { min: 1, max: 31, value: 1, len: 2 },
    { min: 1, max: 12, value: 1, len: 2 },
    { min: 2024, max: 2027, value: 2024, len: 4 },
  ];

  inner.classList.add('center');
  inner.innerHTML = `
    <div class="lock" role="group" aria-label="${esc(A.lock)}">
      <svg class="lock-art" viewBox="0 0 300 360" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="shackleGrad" x1="0" x2="1">
            <stop offset="0" stop-color="#cfd5f0"/>
            <stop offset=".5" stop-color="#ffffff"/>
            <stop offset="1" stop-color="#a9b4dc"/>
          </linearGradient>
          <radialGradient id="bodyGrad" cx=".5" cy=".35" r=".7">
            <stop offset="0" stop-color="#18204a"/>
            <stop offset="1" stop-color="#0b1029"/>
          </radialGradient>
        </defs>
        <g class="shackle">
          <path d="M92 140 V78 A58 58 0 0 1 208 78 V140" fill="none" stroke="url(#shackleGrad)" stroke-width="15" stroke-linecap="round"/>
        </g>
        <circle class="lock-glow" cx="150" cy="222" r="128" fill="none" stroke="var(--pink)" stroke-width="10" opacity="0"/>
        <circle cx="150" cy="222" r="128" fill="url(#bodyGrad)" stroke="var(--pink)" stroke-width="2"/>
        <circle cx="150" cy="222" r="116" fill="none" stroke="var(--line)" stroke-width=".8" stroke-dasharray="2 6" opacity=".55"/>
      </svg>
      <div class="lock-bow">${bowSVG()}</div>
      <div class="wheels"></div>
    </div>
    <p class="lock-hint">${esc(C.hint)}</p>
    <button type="button" class="btn btn-primary lock-open">${esc(C.button)}</button>
    <p class="lock-reply" aria-live="polite"></p>
    <button type="button" class="link-btn lock-escape" hidden>${esc(C.escape)}</button>
  `;

  const lockEl = inner.querySelector('.lock');
  const wheelsEl = inner.querySelector('.wheels');
  const hint = inner.querySelector('.lock-hint');
  const reply = inner.querySelector('.lock-reply');
  const openBtn = inner.querySelector('.lock-open');
  const escapeBtn = inner.querySelector('.lock-escape');

  const chevron = (dir) =>
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${dir === 'up' ? 'M6 15 L12 9 L18 15' : 'M6 9 L12 15 L18 9'}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  wheels.forEach((w, i) => {
    const col = document.createElement('div');
    col.className = `wheel wheel-${i}`;
    col.innerHTML = `
      <button type="button" class="wheel-arrow" aria-label="${esc(A.wheels[i])} ${esc(A.wheelUp)}">${chevron('up')}</button>
      <div class="wheel-window" role="spinbutton" tabindex="0" aria-label="${esc(A.wheels[i])}"
           aria-valuemin="${w.min}" aria-valuemax="${w.max}">
        <span class="wv prev"></span><span class="wv cur"></span><span class="wv next"></span>
      </div>
      <button type="button" class="wheel-arrow" aria-label="${esc(A.wheels[i])} ${esc(A.wheelDown)}">${chevron('down')}</button>
    `;
    wheelsEl.appendChild(col);
    w.el = col;
    w.win = col.querySelector('.wheel-window');
    const [up, down] = col.querySelectorAll('.wheel-arrow');
    up.addEventListener('click', () => step(w, 1));
    down.addEventListener('click', () => step(w, -1));
    render(w);

    // Swipe with pointer events
    let startY = 0;
    let acc = 0;
    let dragging = false;
    w.win.addEventListener('pointerdown', (e) => {
      dragging = true;
      startY = e.clientY;
      acc = 0;
      try { w.win.setPointerCapture(e.pointerId); } catch (err) {}
    });
    w.win.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dy = e.clientY - startY;
      startY = e.clientY;
      acc += dy;
      while (acc <= -26) { step(w, 1); acc += 26; }
      while (acc >= 26) { step(w, -1); acc -= 26; }
    });
    const end = () => { dragging = false; };
    w.win.addEventListener('pointerup', end);
    w.win.addEventListener('pointercancel', end);
    w.win.addEventListener('wheel', (e) => {
      e.preventDefault();
      step(w, e.deltaY > 0 ? 1 : -1);
    }, { passive: false });
    w.win.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') { e.preventDefault(); step(w, 1); }
      if (e.key === 'ArrowDown') { e.preventDefault(); step(w, -1); }
    });
  });

  function wrap(w, v) {
    const span = w.max - w.min + 1;
    return ((v - w.min) % span + span) % span + w.min;
  }

  function render(w) {
    const [p, c, n] = w.el.querySelectorAll('.wv');
    p.textContent = pad(wrap(w, w.value - 1), w.len);
    c.textContent = pad(w.value, w.len);
    n.textContent = pad(wrap(w, w.value + 1), w.len);
    w.win.setAttribute('aria-valuenow', w.value);
    w.win.setAttribute('aria-valuetext', pad(w.value, w.len));
  }

  function step(w, dir) {
    if (solved) return;
    w.value = wrap(w, w.value + dir);
    render(w);
    if (!reduced) {
      gsap.fromTo(w.el.querySelectorAll('.wv'), { y: dir > 0 ? 10 : -10 }, { y: 0, duration: 0.25, ease: 'power2.out' });
    }
  }

  let wrongCount = 0;
  let solved = false;

  function wrong() {
    const msg = C.wrong[wrongCount % C.wrong.length];
    wrongCount++;
    reply.textContent = msg;
    gsap.fromTo(reply, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    if (!reduced) {
      gsap.fromTo(lockEl, { x: 0 }, { keyframes: { x: [-9, 8, -6, 4, -2, 0] }, duration: 0.5, ease: 'sine.inOut' });
    }
    if (wrongCount >= 3) hint.classList.add('prominent');
    if (wrongCount >= 6 && escapeBtn.hidden) {
      escapeBtn.hidden = false;
      gsap.fromTo(escapeBtn, { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 0.3 });
    }
  }

  function open() {
    if (solved) return;
    solved = true;
    openBtn.disabled = true;
    escapeBtn.disabled = true;
    reply.textContent = '';
    const tl = gsap.timeline({ onComplete: () => ctx.next() });
    tl.to(inner.querySelector('.shackle'), { y: -30, duration: reduced ? 0.3 : 0.9, ease: 'power2.out' })
      .to(inner.querySelector('.lock-glow'), { opacity: 0.55, duration: 0.8, ease: 'sine.inOut' }, '<0.2')
      .to(lockEl, { filter: 'drop-shadow(0 0 28px rgba(246,182,200,.55))', duration: 0.8 }, '<')
      .to({}, { duration: 0.6 });
  }

  openBtn.addEventListener('click', () => {
    const [d, m, y] = wheels.map((w) => w.value);
    if (d === C.combo.dd && m === C.combo.mm && y === C.combo.yyyy) open();
    else wrong();
  });
  escapeBtn.addEventListener('click', open);

  return () => {};
}
