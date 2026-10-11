// The flower: un peu, beaucoup… rigged so the last petal is "à la folie".
import { drawOn, esc } from './art.js';

const CX = 150;
const CY = 140;

export function mount(ctx) {
  const { inner, content, reduced } = ctx;
  const C = content.flower;
  const gsap = window.gsap;
  const N = C.petals;

  // Slightly imperfect petals for a hand-drawn feel (deterministic)
  const jitter = [0, 3, -2, 4, -3, 2, -4, 1, -1];
  let petals = '';
  for (let i = 0; i < N; i++) {
    const j = jitter[i % jitter.length];
    const tip = 40 + j;
    const w = 21 + (j % 3);
    const rot = (360 / N) * i;
    petals += `
      <g class="petal" data-i="${i}">
        <g transform="rotate(${rot} ${CX} ${CY})">
          <path class="petal-fill" d="M${CX} ${CY - 16} C${CX - w} ${CY - 40}, ${CX - w + 2} ${tip + 14}, ${CX} ${tip} C${CX + w - 1} ${tip + 12}, ${CX + w} ${CY - 42}, ${CX} ${CY - 16} Z"/>
          <path class="w1 petal-vein" d="M${CX} ${CY - 22} C${CX - 2} ${CY - 50}, ${CX + 1} ${tip + 30}, ${CX} ${tip + 14}"/>
        </g>
      </g>`;
  }

  inner.classList.add('center');
  inner.innerHTML = `
    <h2 class="scene-title fr">${esc(C.title)}</h2>
    <div class="flower">
      <svg class="flower-art sketch" viewBox="0 0 300 380" aria-hidden="true" focusable="false">
        <path class="w2 stem" d="M150 160 C146 210, 156 260, 150 372"/>
        <path class="w1 stem" d="M151 268 C170 246, 196 242, 210 250 C196 266, 172 270, 151 268 Z"/>
        <path class="w1 stem" d="M149 300 C132 284, 112 282, 100 290 C112 302, 134 304, 149 300 Z"/>
        ${petals}
        <circle class="w2 flower-centre" cx="${CX}" cy="${CY}" r="18"/>
        <path class="w1 flower-dots" d="M143 135 l1 1 M152 131 l1 1 M157 140 l1 1 M146 146 l1 1 M151 141 l1 1"/>
      </svg>
      <div class="petal-hits"></div>
    </div>
    <p class="flower-caption" aria-live="polite">&nbsp;</p>
    <p class="flower-after" hidden>${esc(C.after)}</p>
  `;

  const svg = inner.querySelector('.flower-art');
  const hits = inner.querySelector('.petal-hits');
  const caption = inner.querySelector('.flower-caption');
  const after = inner.querySelector('.flower-after');
  const cont = ctx.continueButton();
  let fallen = 0;

  drawOn(svg, { duration: 1.6, stagger: 0.06, delay: 0.3, reduced });

  for (let i = 0; i < N; i++) {
    const a = ((360 / N) * i * Math.PI) / 180;
    const r = 66;
    const x = CX + r * Math.sin(a);
    const y = CY - r * Math.cos(a);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'petal-hit';
    b.style.left = `${(x / 300) * 100}%`;
    b.style.top = `${(y / 380) * 100}%`;
    b.setAttribute('aria-label', `${content.a11y.petal} ${i + 1}`);
    hits.appendChild(b);
    b.addEventListener('click', () => pluck(i, b));
  }

  function pluck(i, btn) {
    btn.remove();
    const g = svg.querySelector(`.petal[data-i="${i}"]`);
    const a = ((360 / N) * i * Math.PI) / 180;
    if (reduced) {
      gsap.to(g, { opacity: 0, duration: 0.6 });
    } else {
      const side = Math.sin(a) >= 0 ? 1 : -1;
      gsap.set(g, { transformOrigin: '50% 50%' });
      gsap.to(g, {
        keyframes: [
          { x: side * 18, y: 40, rotation: side * 40, duration: 0.7, ease: 'sine.out' },
          { x: side * -14, y: 150, rotation: side * 120, duration: 0.9, ease: 'sine.inOut' },
          { x: side * 26, y: 270, rotation: side * 200, opacity: 0, duration: 1.0, ease: 'sine.in' },
        ],
      });
    }

    fallen++;
    const phrase = C.cycle[(fallen - 1) % C.cycle.length];
    gsap.to(caption, {
      opacity: 0, duration: 0.18,
      onComplete: () => {
        caption.textContent = phrase;
        gsap.to(caption, { opacity: 1, duration: 0.35 });
      },
    });

    if (fallen === N) finish();
  }

  function finish() {
    const tl = gsap.timeline({ delay: 0.7 });
    tl.add(() => caption.classList.add('final'))
      .to(caption, { scale: reduced ? 1 : 1.18, duration: 1.0, ease: 'power2.out' })
      .add(() => {
        after.hidden = false;
        gsap.fromTo(after, { opacity: 0 }, { opacity: 1, duration: 1.0 });
      }, '+=0.4')
      .add(() => cont.show(), '+=1.1');
  }
}
