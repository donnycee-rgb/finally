// Star Map hub for return visits: one labelled star per section.
import { esc, envelopeHTML } from './art.js';

// Positions (% of the map) — a loose, hand-placed constellation
const POS = [
  [18, 8], [72, 17], [30, 30], [78, 41], [20, 54], [70, 65], [28, 78],
];
const ENV_POS = [80, 93];

export function mount(ctx) {
  const { inner, content, reduced } = ctx;
  const C = content.hub;
  const gsap = window.gsap;

  inner.innerHTML = `
    <div class="hub-map">
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

  if (!reduced) {
    const line = inner.querySelector('.hub-lines polyline');
    gsap.fromTo(line, { opacity: 0 }, { opacity: 1, duration: 2, delay: 0.6 });
    gsap.fromTo(nav.children, { opacity: 0 },
      { opacity: 1, duration: 0.9, stagger: 0.12, delay: 0.3, ease: 'power2.out', clearProps: 'opacity' });
  }
}
