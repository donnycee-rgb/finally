// The quiz: how well do you know us? Always 100%.
import { esc, makeButton, reveal } from './art.js';
import { kittySVG, winkLoop } from './kitty.js';

export function mount(ctx) {
  const { inner, content, reduced } = ctx;
  const C = content.quiz;
  const gsap = window.gsap;

  inner.classList.add('center');
  inner.innerHTML = `
    <h2 class="scene-title">${esc(C.title)}</h2>
    <div class="quiz-dots" aria-hidden="true">${C.questions.map(() => '<span class="dot"></span>').join('')}</div>
    <div class="quiz-stage"></div>
  `;
  const stage = inner.querySelector('.quiz-stage');
  const dots = inner.querySelectorAll('.dot');

  function showQuestion(qi) {
    const Q = C.questions[qi];
    dots.forEach((d, i) => {
      d.classList.toggle('done', i < qi);
      d.classList.toggle('now', i === qi);
    });
    stage.innerHTML = `
      <div class="quiz-card">
        <p class="quiz-q">${esc(Q.q)}</p>
        <div class="quiz-options"></div>
        <p class="quiz-reply" aria-live="polite"></p>
        <div class="continue-wrap"></div>
      </div>`;
    const card = stage.querySelector('.quiz-card');
    const opts = stage.querySelector('.quiz-options');
    const reply = stage.querySelector('.quiz-reply');
    const nextWrap = stage.querySelector('.continue-wrap');
    let solved = false;

    Q.options.forEach((label, oi) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'quiz-opt';
      b.textContent = label;
      opts.appendChild(b);
      b.addEventListener('click', () => {
        if (solved) return;
        if (Q.correct.includes(oi)) {
          solved = true;
          b.classList.add('right');
          opts.querySelectorAll('.quiz-opt').forEach((o) => {
            o.disabled = o !== b;
            if (o !== b) o.classList.add('muted');
          });
          b.setAttribute('aria-pressed', 'true');
          reply.textContent = Q.right;
          reply.classList.remove('wrong');
          reply.classList.add('right');
          gsap.fromTo(reply, { opacity: 0, y: reduced ? 0 : 6 }, { opacity: 1, y: 0, duration: 0.6 });
          const next = makeButton(content.ui.next);
          next.hidden = true;
          nextWrap.appendChild(next);
          reveal(next, { delay: 0.5 });
          next.addEventListener('click', () => {
            if (qi + 1 < C.questions.length) transition(() => showQuestion(qi + 1));
            else transition(showScore);
          }, { once: true });
        } else {
          b.classList.add('tried');
          reply.textContent = Q.wrong;
          reply.classList.add('wrong');
          gsap.fromTo(reply, { opacity: 0 }, { opacity: 1, duration: 0.4 });
          if (!reduced) {
            gsap.fromTo(b, { x: 0 }, { keyframes: { x: [-7, 6, -4, 3, 0] }, duration: 0.42, ease: 'sine.inOut' });
          }
        }
      });
    });

    gsap.fromTo(card.children, { opacity: 0, y: reduced ? 0 : 10 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' });
  }

  function transition(fn) {
    gsap.to(stage, {
      opacity: 0, duration: 0.3,
      onComplete: () => {
        fn();
        gsap.to(stage, { opacity: 1, duration: 0.3 });
      },
    });
  }

  function showScore() {
    dots.forEach((d) => { d.classList.add('done'); d.classList.remove('now'); });
    stage.innerHTML = `
      <div class="quiz-score">
        <div class="score-badge">${kittySVG({ wink: true })}</div>
        <p class="score-big">${esc(C.score.big)}</p>
        <p class="score-small">${esc(C.score.small)}</p>
      </div>`;
    const sc = stage.querySelector('.quiz-score');
    const cont = ctx.continueButton(sc);
    gsap.timeline()
      .fromTo(sc.querySelector('.score-badge'), { opacity: 0, scale: reduced ? 1 : 0.5, rotation: reduced ? 0 : -12 }, { opacity: 1, scale: 1, rotation: 0, duration: 1.0, ease: reduced ? 'none' : 'back.out(1.7)' })
      .fromTo(sc.querySelector('.score-big'), { opacity: 0 }, { opacity: 1, duration: 0.8 }, '-=0.3')
      .fromTo(sc.querySelector('.score-small'), { opacity: 0 }, { opacity: 1, duration: 0.8 })
      .add(() => cont.show())
      .add(() => { wink = winkLoop(sc.querySelector('.kitty'), { delay: 0.3, every: 3.2 }); });
  }

  let wink = null;
  showQuestion(0);
  return () => { if (wink) wink.kill(); };
}
