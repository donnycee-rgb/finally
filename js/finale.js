// The finale: Oui / Non (Non runs away).
import { bowSVG, heartSVG, esc } from './art.js';

export function mount(ctx) {
  const { inner, content, reduced, state } = ctx;
  const C = content.finale;
  const gsap = window.gsap;

  inner.classList.add('center');
  inner.innerHTML = `
    <h2 class="finale-lines">${C.lines.map((l) => `<span class="fl">${esc(l)}</span>`).join(' ')}</h2>
    <p class="finale-q">${esc(C.question)}</p>
    <div class="yn">
      <button type="button" class="btn btn-primary yn-yes">${esc(C.yes)}</button>
      <span class="yn-slot"><button type="button" class="btn btn-ghost yn-no">${esc(C.no)}</button></span>
    </div>
    <p class="finale-after" hidden>${esc(C.after)}</p>
  `;

  const lines = inner.querySelectorAll('.fl');
  const q = inner.querySelector('.finale-q');
  const yn = inner.querySelector('.yn');
  const yes = inner.querySelector('.yn-yes');
  const no = inner.querySelector('.yn-no');
  const slot = inner.querySelector('.yn-slot');
  const after = inner.querySelector('.finale-after');
  const cont = ctx.fromHub ? ctx.continueButton() : null;

  gsap.set([...lines, q, yn], { opacity: 0 });
  const intro = gsap.timeline({ delay: 0.5 });
  lines.forEach((l, i) => {
    intro.to(l, { opacity: 1, y: 0, duration: 1.4, ease: 'sine.inOut' }, i * 1.3);
  });
  intro.to(q, { opacity: 1, duration: 1.2, ease: 'sine.inOut' }, '+=1.2')
    .to(yn, { opacity: 1, duration: 0.8 }, '+=0.3');

  // ---------- the runaway "Non" ----------
  let escapes = 0;
  let lastJump = 0;
  let floating = false;
  let answered = false;
  let pointer = { x: -999, y: -999 };

  function viewport() {
    const vv = window.visualViewport;
    return vv ? { w: vv.width, h: vv.height } : { w: window.innerWidth, h: window.innerHeight };
  }

  function overlaps(a, b, pad = 0) {
    return !(a.right + pad < b.left || a.left - pad > b.right || a.bottom + pad < b.top || a.top - pad > b.bottom);
  }

  function jump() {
    if (answered) return;
    const now = performance.now();
    if (now - lastJump < 180) return;
    lastJump = now;

    const r0 = no.getBoundingClientRect();
    if (!floating) {
      // Keep Oui where it is: leave a same-size placeholder behind
      slot.style.width = `${r0.width}px`;
      slot.style.height = `${r0.height}px`;
      no.classList.add('runaway');
      no.style.left = `${r0.left}px`;
      no.style.top = `${r0.top}px`;
      document.body.appendChild(no);
      floating = true;
    }

    escapes++;
    if (escapes === 5) no.textContent = C.noTired;

    const { w: vw, h: vh } = viewport();
    const bw = no.offsetWidth;
    const bh = no.offsetHeight;
    const m = 20;
    const minX = m;
    const maxX = Math.max(minX, vw - bw - m);
    const minY = m + 56; // clear of the audio pill
    const maxY = Math.max(minY, vh - bh - m - 72); // clear of the open-when corner
    const yesR = yes.getBoundingClientRect();
    const cur = no.getBoundingClientRect();

    let pick = null;
    for (let i = 0; i < 60; i++) {
      const x = minX + Math.random() * (maxX - minX);
      const y = minY + Math.random() * (maxY - minY);
      const r = { left: x, top: y, right: x + bw, bottom: y + bh };
      const cx = x + bw / 2;
      const cy = y + bh / 2;
      const farFromPointer = Math.hypot(cx - pointer.x, cy - pointer.y) > 110;
      const moved = Math.hypot(x - cur.left, y - cur.top) > 80;
      if (!overlaps(r, yesR, 24) && farFromPointer && moved) { pick = { x, y }; break; }
    }
    if (!pick) {
      // fall back to the corner furthest from Oui
      const left = yesR.left + yesR.width / 2 > vw / 2;
      const top = yesR.top + yesR.height / 2 > vh / 2;
      pick = { x: left ? minX : maxX, y: top ? minY : maxY };
    }
    if (reduced) gsap.set(no, { left: pick.x, top: pick.y });
    else gsap.to(no, { left: pick.x, top: pick.y, duration: 0.35, ease: 'power2.out' });
  }

  const onEnter = (e) => { if (e.pointerType === 'mouse') jump(); };
  const onDown = (e) => { e.preventDefault(); pointer = { x: e.clientX, y: e.clientY }; jump(); };
  const onClick = (e) => { e.preventDefault(); e.stopPropagation(); jump(); };
  const onMove = (e) => {
    pointer = { x: e.clientX, y: e.clientY };
    if (e.pointerType !== 'mouse' || answered) return;
    const r = no.getBoundingClientRect();
    const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
    const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
    if (Math.hypot(dx, dy) < 36) jump();
  };
  const onResize = () => {
    if (!floating || answered) return;
    const { w: vw, h: vh } = viewport();
    const r = no.getBoundingClientRect();
    if (r.right > vw - 8 || r.bottom > vh - 8 || r.left < 0 || r.top < 0) {
      lastJump = 0;
      jump();
    }
  };

  no.addEventListener('pointerenter', onEnter);
  no.addEventListener('pointerdown', onDown);
  no.addEventListener('click', onClick, true);
  document.addEventListener('pointermove', onMove);
  window.addEventListener('resize', onResize);

  // ---------- Oui ----------
  yes.addEventListener('click', () => {
    if (answered) return;
    answered = true;
    yes.disabled = true;
    yes.classList.add('chosen');
    gsap.to(no, { opacity: 0, duration: 0.5, onComplete: () => (no.style.visibility = 'hidden') });
    // let Oui settle back to the centre
    if (!floating) gsap.set(slot, { width: slot.offsetWidth });
    gsap.to(slot, { width: 0, duration: 0.8, ease: 'power2.inOut', delay: 0.3 });
    gsap.to(yn, { columnGap: 0, duration: 0.8, ease: 'power2.inOut', delay: 0.3 });
    burst();
    after.hidden = false;
    gsap.fromTo(after, { opacity: 0, y: reduced ? 0 : 10 }, { opacity: 1, y: 0, duration: 1.4, delay: 0.6, ease: 'sine.inOut' });

    state.completed = true;
    ctx.save();
    gsap.delayedCall(2.4, () => {
      ctx.openWhen.show(true);
      if (cont) cont.show();
    });
  });

  function burst() {
    const layer = document.createElement('div');
    layer.className = 'burst';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    const { w: vw, h: vh } = viewport();
    const count = reduced ? 14 : 40;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      const isBow = i % 3 === 0;
      p.className = `particle ${isBow ? 'p-bow' : 'p-heart'}${!isBow && i % 2 ? ' white' : ''}`;
      p.innerHTML = isBow ? bowSVG() : heartSVG();
      const size = isBow ? 22 + Math.random() * 12 : 10 + Math.random() * 12;
      p.style.width = `${size}px`;
      layer.appendChild(p);
      const x = Math.random() * vw;
      if (reduced) {
        gsap.set(p, { x, y: Math.random() * vh * 0.8 + vh * 0.1, opacity: 0 });
        gsap.to(p, { opacity: 0.9, duration: 1.2, delay: Math.random() * 0.8, yoyo: true, repeat: 1, repeatDelay: 1.2 });
        continue;
      }
      const dur = 4 + Math.random() * 3;
      gsap.set(p, { x, y: vh + 30, opacity: 0, rotation: (Math.random() - 0.5) * 30 });
      gsap.to(p, { y: -60 - Math.random() * 80, duration: dur, delay: Math.random() * 1.4, ease: 'sine.out' });
      gsap.to(p, { opacity: 0.95, duration: 0.8, delay: Math.random() * 0.6 });
      gsap.to(p, { opacity: 0, duration: 1.2, delay: dur - 0.6 });
      gsap.to(p, { x: x + (Math.random() - 0.5) * 80, duration: dur / 3, repeat: 3, yoyo: true, ease: 'sine.inOut' });
    }
    gsap.delayedCall(9.5, () => layer.remove());
  }

  return () => {
    document.removeEventListener('pointermove', onMove);
    window.removeEventListener('resize', onResize);
    if (floating) no.remove();
    intro.kill();
  };
}
