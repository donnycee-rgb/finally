// Starfield canvas with slow twinkling. Pauses when the tab is hidden.
import { reducedMotion } from './art.js';

export function startSky(canvas) {
  const ctx = canvas.getContext('2d');
  let stars = [];
  let w = 0;
  let h = 0;
  let dpr = 1;
  let raf = 0;
  let running = false;
  const still = reducedMotion();

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const mobile = w < 700;
    const count = mobile ? 120 : Math.min(220, Math.round((w * h) / 6000));
    stars = [];
    for (let i = 0; i < count; i++) {
      const warm = Math.random() < 0.18;
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.1 + 0.25,
        base: Math.random() * 0.55 + 0.25,
        amp: Math.random() * 0.35 + 0.1,
        speed: Math.random() * 0.0009 + 0.0003,
        phase: Math.random() * Math.PI * 2,
        color: warm ? '255, 214, 226' : '238, 241, 255',
      });
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      const a = still ? s.base : s.base + Math.sin(t * s.speed + s.phase) * s.amp;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.color}, ${Math.max(0.05, Math.min(1, a))})`;
      ctx.fill();
    }
  }

  function loop(t) {
    draw(t);
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (running || still) return;
    running = true;
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      build();
      draw(performance.now());
    }, 150);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  build();
  draw(0);
  start();
}
