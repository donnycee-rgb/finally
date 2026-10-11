// Opening: her names type out, one after another.
import { makeButton, reveal } from './art.js';

export function mount(ctx) {
  const { inner, content, reduced } = ctx;
  const C = content.opening;
  const gsap = window.gsap;

  inner.classList.add('center');
  inner.innerHTML = `
    <h1 class="typed-name" aria-live="off"><span class="typed-text"></span><span class="caret" aria-hidden="true"></span></h1>
    <div class="opening-lines"></div>
  `;
  const typed = inner.querySelector('.typed-text');
  const lines = inner.querySelector('.opening-lines');
  const h1 = inner.querySelector('.typed-name');
  h1.setAttribute('aria-label', C.names.join(' '));

  let timer = 0;
  let cancelled = false;
  const wait = (ms) => new Promise((res) => { timer = setTimeout(res, ms); });

  async function type(word) {
    const chars = Array.from(word);
    for (let i = 1; i <= chars.length; i++) {
      if (cancelled) return;
      typed.textContent = chars.slice(0, i).join('');
      await wait(reduced ? 45 : 95 + Math.random() * 50);
    }
  }

  async function erase() {
    const chars = Array.from(typed.textContent);
    for (let i = chars.length - 1; i >= 0; i--) {
      if (cancelled) return;
      typed.textContent = chars.slice(0, i).join('');
      await wait(reduced ? 25 : 45);
    }
  }

  async function run() {
    await wait(700);
    for (let i = 0; i < C.names.length; i++) {
      if (cancelled) return;
      await type(C.names[i]);
      await wait(900);
      if (i < C.names.length - 1) {
        await erase();
        await wait(300);
      }
    }
    if (cancelled) return;
    h1.classList.add('done');
    for (const text of C.finalLines) {
      const p = document.createElement('p');
      p.className = 'opening-line';
      p.textContent = text;
      lines.appendChild(p);
      reveal(p, { duration: 1.2 });
      await wait(1100);
      if (cancelled) return;
    }
    const wrap = document.createElement('div');
    wrap.className = 'continue-wrap';
    const btn = makeButton(C.button);
    btn.addEventListener('click', () => ctx.next());
    wrap.appendChild(btn);
    inner.appendChild(wrap);
    reveal(btn, { delay: 0.3 });
  }

  run();

  return () => {
    cancelled = true;
    clearTimeout(timer);
    gsap.killTweensOf(inner.querySelectorAll('*'));
  };
}
