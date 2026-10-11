// The letter: envelope floats down, seal cracks, paper unfolds, words write themselves.
import { envelopeHTML, crackSeal, esc } from './art.js';

export function mount(ctx) {
  const { inner, root, content, reduced } = ctx;
  const C = content.letter;
  const gsap = window.gsap;

  inner.classList.add('center', 'letter-inner');
  inner.innerHTML = `
    <div class="letter-dim" aria-hidden="true"></div>
    <div class="letter-stage">
      <button type="button" class="letter-env" aria-label="${esc(content.ui.tapToOpen)}">
        ${envelopeHTML()}
      </button>
      <p class="letter-tap" aria-hidden="true">${esc(content.ui.tapToOpen)}</p>
      <div class="paper" hidden>
        <span class="fold fold-top" aria-hidden="true"></span>
        <span class="fold fold-mid" aria-hidden="true"></span>
        <span class="fold fold-bot" aria-hidden="true"></span>
        <div class="paper-scroll">
          <div class="paper-text">
            ${C.paragraphs.map((p) => `<p class="lp">${esc(p)}</p>`).join('')}
            <p class="lp signature">${esc(C.signature)}<span class="smudge" aria-hidden="true"></span></p>
          </div>
        </div>
        <button type="button" class="skip-btn" hidden>${esc(content.ui.skip)}</button>
      </div>
    </div>
  `;

  const dim = inner.querySelector('.letter-dim');
  const envBtn = inner.querySelector('.letter-env');
  const env = envBtn.querySelector('.env');
  const tap = inner.querySelector('.letter-tap');
  const paper = inner.querySelector('.paper');
  const scroller = inner.querySelector('.paper-scroll');
  const text = inner.querySelector('.paper-text');
  const skipBtn = inner.querySelector('.skip-btn');
  const smudge = inner.querySelector('.smudge');
  const cont = ctx.continueButton();
  let writeTl = null;
  let done = false;

  // 1–2. Dim, envelope floats down with a gentle sway, "tap to open"
  gsap.set(tap, { opacity: 0 });
  const intro = gsap.timeline({ delay: 0.3 });
  intro.to(dim, { opacity: 1, duration: 1.2, ease: 'sine.inOut' }, 0);
  if (reduced) {
    intro.fromTo(envBtn, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0.2);
  } else {
    intro.fromTo(envBtn,
      { y: () => -(window.innerHeight * 0.75), opacity: 0 },
      { y: 0, opacity: 1, duration: 3.2, ease: 'power2.out' }, 0.2);
    intro.fromTo(envBtn, { rotation: -9 },
      { keyframes: { rotation: [-9, 7, -5, 3, -1, 0], easeEach: 'sine.inOut' }, duration: 3.4, ease: 'none' }, 0.2);
  }
  intro.to(tap, { opacity: 1, duration: 0.8 }, '-=0.3');

  envBtn.addEventListener('click', openLetter, { once: true });

  function openLetter() {
    envBtn.disabled = true;
    envBtn.setAttribute('aria-hidden', 'true');
    intro.progress(1);
    const flap = env.querySelector('.env-flap');
    const slip = env.querySelector('.env-paper');
    const tl = gsap.timeline();
    tl.to(tap, { opacity: 0, duration: 0.3 }, 0)
      .add(() => crackSeal(env.querySelector('.seal'), reduced), 0);
    if (reduced) {
      tl.to(envBtn, { opacity: 0, duration: 0.5 }, 0.4);
    } else {
      // 3. Flap lifts (3D), paper slides up out of the envelope
      tl.to(flap, { rotationX: 180, duration: 0.8, ease: 'power2.inOut' }, 0.35)
        .add(() => env.classList.add('is-open'), 0.75)
        .to(slip, { yPercent: -62, duration: 0.9, ease: 'power2.out' }, 1.05)
        // 4. Envelope fades away
        .to(envBtn, { opacity: 0, y: 30, duration: 0.6, ease: 'power2.in' }, 2.0);
    }
    tl.add(unfold);
  }

  function unfold() {
    envBtn.hidden = true;
    paper.hidden = false;
    const top = paper.querySelector('.fold-top');
    const bot = paper.querySelector('.fold-bot');
    const tl = gsap.timeline({ onComplete: write });
    if (reduced) {
      gsap.set([top, bot], { rotationX: 0 });
      tl.fromTo(paper, { opacity: 0 }, { opacity: 1, duration: 0.6 });
    } else {
      gsap.set(top, { rotationX: -178 });
      gsap.set(bot, { rotationX: 178 });
      tl.fromTo(paper, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
        .to(top, { rotationX: 0, duration: 1.0, ease: 'power2.inOut' })
        .to(bot, { rotationX: 0, duration: 1.0, ease: 'power2.inOut' }, '-=0.35');
    }
    tl.add(() => paper.classList.add('unfolded'));
  }

  // 5. Split paragraphs into visual lines and reveal each with a moving "pen" mask
  async function write() {
    try { await document.fonts.ready; } catch (e) {}
    if (done) return;
    const paras = Array.from(text.querySelectorAll('.lp'));
    const lineGroups = [];
    paras.forEach((p) => {
      const smudgeEl = p.querySelector('.smudge');
      const words = p.firstChild.textContent.split(' ');
      p.innerHTML = words.map((w) => `<span class="w">${esc(w)}</span>`).join(' ');
      const spans = Array.from(p.querySelectorAll('.w'));
      const rows = [];
      let lastTop = null;
      spans.forEach((s) => {
        const t = s.offsetTop;
        if (lastTop === null || Math.abs(t - lastTop) > 4) {
          rows.push([]);
          lastTop = t;
        }
        rows[rows.length - 1].push(s.textContent);
      });
      p.innerHTML = rows.map((r) => `<span class="wl">${esc(r.join(' '))}</span>`).join(' ');
      if (smudgeEl) p.appendChild(smudgeEl);
      lineGroups.push(Array.from(p.querySelectorAll('.wl')));
    });
    text.classList.add('writing');
    skipBtn.hidden = false;
    gsap.fromTo(skipBtn, { opacity: 0 }, { opacity: 1, duration: 0.6 });

    writeTl = gsap.timeline({ onComplete: finish });
    lineGroups.forEach((lines, pi) => {
      lines.forEach((line) => {
        writeTl.add(() => follow(line));
        if (reduced) {
          writeTl.to(line, { opacity: 1, duration: 0.7, ease: 'sine.inOut' });
        } else {
          writeTl.fromTo(line,
            { clipPath: 'inset(-20% 100% -20% 0%)', opacity: 1 },
            { clipPath: 'inset(-20% -2% -20% 0%)', duration: 1.2, ease: 'sine.inOut' });
        }
      });
      if (pi < lineGroups.length - 1) writeTl.to({}, { duration: 0.5 });
    });
  }

  // 6. Auto-follow the writing inside the paper
  function follow(line) {
    const bottom = line.offsetTop + line.offsetHeight + 24;
    const view = scroller.scrollTop + scroller.clientHeight;
    if (bottom > view) {
      gsap.to(scroller, { scrollTop: bottom - scroller.clientHeight + scroller.clientHeight * 0.25, duration: 0.9, ease: 'sine.inOut' });
    }
  }

  // 7–8. Ink smudge, then continue
  function finish() {
    if (done) return;
    done = true;
    skipBtn.hidden = true;
    text.querySelectorAll('.wl').forEach((l) => { l.style.clipPath = 'none'; l.style.opacity = 1; });
    gsap.to(smudge, { opacity: 1, duration: 1.4, ease: 'sine.inOut' });
    gsap.delayedCall(1.2, () => {
      // let lines re-flow naturally if the screen rotates later
      text.classList.add('written');
      cont.show();
    });
  }

  skipBtn.addEventListener('click', () => {
    if (writeTl) writeTl.kill();
    finish();
  });

  return () => {
    intro.kill();
    if (writeTl) writeTl.kill();
    root.classList.remove('dimmed');
  };
}
