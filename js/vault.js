// The vault: seven sealed envelopes, seven reasons.
import { envelopeHTML, openEnvelope, showModal, esc } from './art.js';

export function mount(ctx) {
  const { inner, content, reduced } = ctx;
  const C = content.vault;
  const gsap = window.gsap;

  inner.innerHTML = `
    <h2 class="scene-title">${esc(C.title)}</h2>
    <div class="vault-grid"></div>
  `;
  const grid = inner.querySelector('.vault-grid');
  const cont = ctx.continueButton();
  const opened = new Set();
  let busy = false;

  C.reasons.forEach((reason, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'vault-env';
    b.setAttribute('aria-label', `${content.a11y.envelope} ${i + 1}`);
    b.innerHTML = `${envelopeHTML()}<span class="env-num" aria-hidden="true">${i + 1}</span>`;
    grid.appendChild(b);

    b.addEventListener('click', () => {
      if (busy) return;
      const first = !opened.has(i);
      const env = b.querySelector('.env');
      const show = () => {
        busy = false;
        showModal({
          className: 'reason-modal',
          closeLabel: content.a11y.close,
          html: `<span class="reason-num">${i + 1} / ${C.reasons.length}</span><p class="reason-text">${esc(reason)}</p>`,
          onClose: () => {
            if (opened.size === C.reasons.length) cont.show();
          },
        });
      };
      if (first) {
        busy = true;
        opened.add(i);
        b.classList.add('opened');
        const tl = openEnvelope(env, reduced);
        if (!reduced) {
          tl.fromTo(env.querySelector('.env-paper'), { y: 0 }, { y: -14, duration: 0.4, ease: 'power2.out' }, '-=0.1');
        }
        tl.add(show, '+=0.05');
      } else {
        show();
      }
    });
  });

  if (!reduced) {
    gsap.fromTo(grid.children, { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, ease: 'power2.out', delay: 0.4, clearProps: 'opacity,transform' });
  }
}
