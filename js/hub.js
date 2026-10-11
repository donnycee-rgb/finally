// Star Map hub for return visits: one labelled star per section.
import { esc, envelopeHTML } from './art.js';
import { kittyStarPoints, KITTY_VIEW, KITTY_FACE, KITTY_BOW } from './kitty.js';

// Positions (% of the map) — a loose, hand-placed constellation
const POS = [
  [18, 37], [72, 45], [28, 53], [76, 61], [20, 69], [70, 77], [28, 85],
];
const ENV_POS = [80, 94];

export function mount(ctx) {
  const { inner, content, reduced } = ctx;
  const C = content.hub;
  const gsap = window.gsap;

  // Kitty, drawn in stars, watching over the map
  const kpts = kittyStarPoints(46);
  const nFace = 46;
  const kstars = kpts.map((p, i) => {
    const cls = p.big ? 'ks big' : i >= nFace ? 'ks ks-bow' : 'ks';
    const r = p.big ? 0.2 : 0.09 + ((i * 37) % 10) / 180;
    return `<circle class="${cls}" cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${r.toFixed(3)}"/>`;
  }).join('');

  inner.innerHTML = `
    <div class="hub-map">
      <svg class="hub-kitty" viewBox="${KITTY_VIEW}" aria-hidden="true" focusable="false">
        <path class="kl" d="${KITTY_FACE}"/><path class="kl kl-bow" d="${KITTY_BOW}"/>${kstars}</svg>
      <svg class="hub-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <polyline points="${POS.map((p) => p.join(',')).join(' ')}"/>
      </svg>
      <nav class="hub-stars" aria-label="${esc(content.a11y.starMap)}"></nav>
    </div>
    <div class="hub-foot">
      <button type="button" class="link-btn hub-restart">${esc(C.restart)}</button>
    </div>
  `;

  const nav = inner.querySelector('.hub-stars');
  C.sections.forEach((s, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `hub-star ${POS[i][0] > 50 ? 'label-left' : ''}`;
    b.style.left = `${POS[i][0]}%`;
    b.style.top = `${POS[i][1]}%`;
    b.innerHTML = `<span class="hub-dot" aria-hidden="true"></span><span class="hub-label">${esc(s.label)}</span>`;
    b.addEventListener('click', () => ctx.go(s.scene, { fromHub: true }));
    nav.appendChild(b);
  });

  const env = document.createElement('button');
  env.type = 'button';
  env.className = 'hub-env label-left';
  env.style.left = `${ENV_POS[0]}%`;
  env.style.top = `${ENV_POS[1]}%`;
  env.innerHTML = `${envelopeHTML()}<span class="hub-label">${esc(content.ui.openWhen)}</span>`;
  env.addEventListener('click', () => ctx.openWhen.open());
  nav.appendChild(env);

  inner.querySelector('.hub-restart').addEventListener('click', () => ctx.go('opening', { fromHub: false }));

  const ks = inner.querySelectorAll('.hub-kitty .ks');
  let twinkle = null;
  if (!reduced) {
    // stars light up one after another, tracing her outline, then twinkle
    gsap.fromTo(ks, { opacity: 0, scale: 0, transformOrigin: '50% 50%' },
      { opacity: 1, scale: 1, duration: 0.5, stagger: 0.035, delay: 0.8, ease: 'power2.out' });
    inner.querySelectorAll('.hub-kitty .kl').forEach((l) => {
      const len = l.getTotalLength();
      gsap.fromTo(l, { strokeDasharray: len, strokeDashoffset: len },
        { strokeDashoffset: 0, duration: 2.6, delay: 0.9, ease: 'sine.inOut' });
    });
    twinkle = gsap.to(ks, {
      opacity: () => 0.35 + Math.random() * 0.4,
      duration: () => 1.2 + Math.random() * 1.6,
      repeat: -1, yoyo: true, ease: 'sine.inOut',
      stagger: { each: 0.05, from: 'random' },
      delay: 0.8 + ks.length * 0.035 + 0.6,
    });
  }

  if (!reduced) {
    const line = inner.querySelector('.hub-lines polyline');
    gsap.fromTo(line, { opacity: 0 }, { opacity: 1, duration: 2, delay: 0.6 });
    gsap.fromTo(nav.children, { opacity: 0 },
      { opacity: 1, duration: 0.9, stagger: 0.12, delay: 0.3, ease: 'power2.out', clearProps: 'opacity' });
  }

  return () => { if (twinkle) twinkle.kill(); };
}
