// Our walk: stars along a winding path with footprints; finishes as a heart.
import { sketchSVG, drawOn, showModal, esc } from './art.js';

const W = 360;
const H = 560;
const WALK = 'M40 512 C120 492, 54 418, 150 392 S300 344, 254 272 S64 214, 116 142 S286 104, 322 44';
const STAR_U = [0.02, 0.2, 0.4, 0.6, 0.8, 0.98];
const SAMPLES = 180;

function heartPoint(t) {
  const s = 9.6;
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return { x: W / 2 + x * s, y: 236 - y * s };
}

export function mount(ctx) {
  const { inner, content, reduced } = ctx;
  const C = content.constellation;
  const gsap = window.gsap;
  const NS = 'http://www.w3.org/2000/svg';

  inner.innerHTML = `
    <h2 class="scene-title">${esc(C.title)}</h2>
    <p class="scene-sub">${esc(C.subtitle)}</p>
    <div class="walk">
      <svg class="walk-art" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="starGlow">
            <stop offset="0" stop-color="#fff" stop-opacity="1"/>
            <stop offset=".35" stop-color="#ffe9c9" stop-opacity=".55"/>
            <stop offset="1" stop-color="#ffe9c9" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <path class="walk-path" d="${WALK}"/>
        <g class="footprints"></g>
        <path class="walk-morph" d=""/>
        <polyline class="walk-lines" points=""/>
        <path class="walk-close" d=""/>
        <g class="walk-stars"></g>
      </svg>
      <div class="walk-hits"></div>
    </div>
  `;

  const svg = inner.querySelector('.walk-art');
  const path = svg.querySelector('.walk-path');
  const morph = svg.querySelector('.walk-morph');
  const lines = svg.querySelector('.walk-lines');
  const closeArc = svg.querySelector('.walk-close');
  const feet = svg.querySelector('.footprints');
  const starsG = svg.querySelector('.walk-stars');
  const hits = inner.querySelector('.walk-hits');
  const cont = ctx.continueButton();

  const total = path.getTotalLength();
  const at = (u) => {
    const p = path.getPointAtLength(u * total);
    return { x: p.x, y: p.y };
  };

  // Star positions on the walk and on the heart
  const t0 = 0.0001;
  const tStep = (2 * Math.PI) / 6;
  const starWalk = STAR_U.map(at);
  const starHeart = STAR_U.map((_, k) => heartPoint(t0 + tStep * k));

  // Sample both curves with matching parameters (piecewise between stars)
  function uToT(u) {
    if (u <= STAR_U[0]) return t0;
    for (let k = 0; k < STAR_U.length - 1; k++) {
      if (u <= STAR_U[k + 1]) {
        const f = (u - STAR_U[k]) / (STAR_U[k + 1] - STAR_U[k]);
        return t0 + tStep * (k + f);
      }
    }
    return t0 + tStep * 5;
  }
  const walkPts = [];
  const heartPts = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const u = STAR_U[0] + ((STAR_U[5] - STAR_U[0]) * i) / SAMPLES;
    walkPts.push(at(u));
    heartPts.push(heartPoint(uToT(u)));
  }
  // Closing arc of the heart (star 6 back to star 1)
  let closeD = '';
  for (let i = 0; i <= 40; i++) {
    const p = heartPoint(t0 + tStep * 5 + (tStep * i) / 40);
    closeD += `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
  }
  closeArc.setAttribute('d', closeD);

  // Footprints between stars
  const step = 21;
  let n = 0;
  for (let l = 14; l < total - 10; l += step, n++) {
    const u = l / total;
    if (STAR_U.some((s) => Math.abs(s - u) * total < 20)) continue;
    const p = path.getPointAtLength(l);
    const q = path.getPointAtLength(Math.min(total, l + 1));
    const ang = Math.atan2(q.y - p.y, q.x - p.x);
    const side = n % 2 ? 1 : -1;
    const ox = -Math.sin(ang) * 4.5 * side;
    const oy = Math.cos(ang) * 4.5 * side;
    const e = document.createElementNS(NS, 'ellipse');
    e.setAttribute('cx', (p.x + ox).toFixed(1));
    e.setAttribute('cy', (p.y + oy).toFixed(1));
    e.setAttribute('rx', '3.6');
    e.setAttribute('ry', '2.1');
    e.setAttribute('transform', `rotate(${((ang * 180) / Math.PI).toFixed(1)} ${(p.x + ox).toFixed(1)} ${(p.y + oy).toFixed(1)})`);
    feet.appendChild(e);
  }

  // Stars + hit buttons
  const stars = C.stars.map((s, k) => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', `walk-star${s.dim ? ' dim' : ''}`);
    g.innerHTML = `
      <circle class="glow" r="18" fill="url(#starGlow)"/>
      <path class="spark" d="M0 -9 L1.6 -1.6 L9 0 L1.6 1.6 L0 9 L-1.6 1.6 L-9 0 L-1.6 -1.6 Z"/>
      <circle class="seen-ring" r="13"/>`;
    starsG.appendChild(g);

    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'walk-hit';
    b.setAttribute('aria-label', `${content.a11y.star} ${k + 1}${s.date ? ': ' + s.date : ''}`);
    hits.appendChild(b);
    b.addEventListener('click', () => openStar(k));
    return { g, b, data: s };
  });

  function place(points) {
    points.forEach((p, k) => {
      stars[k].g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
      stars[k].b.style.left = `${(p.x / W) * 100}%`;
      stars[k].b.style.top = `${(p.y / H) * 100}%`;
    });
    lines.setAttribute('points', points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
  }
  place(starWalk);

  // Intro: draw the path and fade stars in
  if (!reduced) {
    gsap.set(path, { strokeDasharray: total, strokeDashoffset: total });
    gsap.to(path, { strokeDashoffset: 0, duration: 2.4, ease: 'sine.inOut', delay: 0.3 });
    gsap.from(feet.children, { opacity: 0, duration: 0.4, stagger: 0.03, delay: 0.6 });
    gsap.from(stars.map((s) => s.g), { opacity: 0, scale: 0.4, transformOrigin: '50% 50%', duration: 0.8, stagger: 0.25, delay: 0.5, ease: 'power2.out' });
  }

  const seen = new Set();
  let finished = false;

  function openStar(k) {
    const s = C.stars[k];
    const first = !seen.has(k);
    seen.add(k);
    stars[k].g.classList.add('seen');

    const m = showModal({
      className: 'memory-modal',
      closeLabel: content.a11y.close,
      html: `
        <div class="memory-sketch">${sketchSVG(s.sketch)}</div>
        ${s.date ? `<p class="memory-date">${esc(s.date)}</p>` : ''}
        <p class="memory-text">${esc(s.text)}</p>`,
      onClose: maybeFinish,
    });
    const sk = m.card.querySelector('.sketch');
    const date = m.card.querySelector('.memory-date');
    const text = m.card.querySelector('.memory-text');
    gsap.set([date, text].filter(Boolean), { opacity: 0 });
    const tl = drawOn(sk, { duration: 1.4, stagger: 0.1, delay: 0.35, reduced });

    if (s.dim) {
      // Sketched star starts dim and slowly brightens (~3s) while the text fades in
      gsap.set(sk, { opacity: 0.22, filter: 'drop-shadow(0 0 0px rgba(255,236,200,0))' });
      gsap.to(sk, { opacity: 1, filter: 'drop-shadow(0 0 14px rgba(255,236,200,.9))', duration: 3, ease: 'sine.inOut', delay: 0.4 });
      gsap.to([date, text].filter(Boolean), { opacity: 1, duration: 2.4, stagger: 0.5, delay: 0.9, ease: 'sine.inOut' });
      if (first) {
        // Its star on the map brightens to match the others
        stars[k].g.classList.add('brightening');
        gsap.to(stars[k].g, { opacity: 1, duration: 3, ease: 'sine.inOut', delay: 0.4 });
      }
    } else {
      tl.to([date, text].filter(Boolean), { opacity: 1, duration: 0.8, stagger: 0.25, ease: 'power2.out' }, '-=0.5');
    }
  }

  function maybeFinish() {
    if (finished || seen.size < C.stars.length) return;
    finished = true;
    hits.querySelectorAll('button').forEach((b) => (b.tabIndex = -1));
    const tl = gsap.timeline({ delay: 0.4, onComplete: () => cont.show() });
    const lineLen = 2000;
    gsap.set(lines, { strokeDasharray: lineLen, strokeDashoffset: lineLen, opacity: 1 });
    morph.setAttribute('d', pathFrom(walkPts));

    if (reduced) {
      tl.to([path, feet, lines], { opacity: 0, duration: 0.5 })
        .add(() => {
          morph.setAttribute('d', pathFrom(heartPts));
          place(starHeart);
          gsap.set(lines, { strokeDashoffset: 0 });
          closeArc.style.strokeDasharray = 'none';
        })
        .to([morph, lines, closeArc], { opacity: 1, duration: 0.8 });
      return;
    }

    const prog = { p: 0 };
    const closeLen = closeArc.getTotalLength();
    gsap.set(closeArc, { strokeDasharray: closeLen, strokeDashoffset: closeLen, opacity: 1 });
    tl.to(lines, { strokeDashoffset: 0, duration: 1.8, ease: 'sine.inOut' })
      .set(morph, { opacity: 1 })
      .to(path, { opacity: 0, duration: 0.4 }, '<')
      .to(feet, { opacity: 0, duration: 1.2 }, '<')
      .to(prog, {
        p: 1,
        duration: 2.6,
        ease: 'sine.inOut',
        onUpdate: () => {
          const p = prog.p;
          const mix = (a, b) => a.map((q, i) => ({ x: q.x + (b[i].x - q.x) * p, y: q.y + (b[i].y - q.y) * p }));
          morph.setAttribute('d', pathFrom(mix(walkPts, heartPts)));
          place(mix(starWalk, starHeart));
        },
      }, '+=0.2')
      .add(() => gsap.set(lines, { strokeDasharray: 'none' }))
      .to(closeArc, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.out' })
      .to(svg, { filter: 'drop-shadow(0 0 10px rgba(255,233,201,.45))', duration: 1.2 }, '<');
  }

  function pathFrom(pts) {
    return pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  }
}
