// Scene manager, state, heart-draw transitions.
import { CONTENT } from './content.js';
import { reducedMotion, makeButton, reveal } from './art.js';
import { startSky } from './sky.js';
import { initAudio } from './audio.js';
import { initOpenWhen } from './openwhen.js';
import * as opening from './opening.js';
import * as lock from './lock.js';
import * as vault from './vault.js';
import * as flower from './flower.js';
import * as constellation from './constellation.js';
import * as derivation from './derivation.js';
import * as quiz from './quiz.js';
import * as letter from './letter.js';
import * as finale from './finale.js';
import * as hub from './hub.js';

const STORAGE_KEY = 'cira_for_jackie_v1';
const ORDER = ['opening', 'lock', 'vault', 'flower', 'constellation', 'derivation', 'quiz', 'letter', 'finale'];
const SCENES = { opening, lock, vault, flower, constellation, derivation, quiz, letter, finale, hub };

// ---------- state ----------
function loadState() {
  const fallback = { completed: false, openedLetters: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const s = JSON.parse(raw);
    return {
      completed: !!s.completed,
      openedLetters: Array.isArray(s.openedLetters) ? s.openedLetters.filter((x) => typeof x === 'string') : [],
    };
  } catch (e) {
    return fallback;
  }
}

const state = loadState();

function saveState() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    /* storage unavailable: the site still works for this visit */
  }
}

// ---------- scene manager ----------
const stage = document.getElementById('stage');
const overlay = document.getElementById('transition');
const heartPath = document.getElementById('transition-heart');

let current = null; // { name, el, cleanup }
let busy = false;
let pending = null;
let fromHub = false;

function setIdle() {
  busy = false;
  if (pending) {
    const [n, o] = pending;
    pending = null;
    go(n, o);
  }
}

function mount(name) {
  const el = document.createElement('section');
  el.className = `scene scene-${name}`;
  el.setAttribute('tabindex', '-1');
  const inner = document.createElement('div');
  inner.className = 'scene-inner';
  el.appendChild(inner);
  stage.appendChild(el);

  const ctx = {
    name,
    root: el,
    inner,
    content: CONTENT,
    state,
    save: saveState,
    reduced: reducedMotion(),
    fromHub,
    next: () => advance(name),
    go,
    openWhen,
    // Append a "continue →" button (hidden until show() is called)
    continueButton(parent = inner, label = CONTENT.ui.continue) {
      const wrap = document.createElement('div');
      wrap.className = 'continue-wrap';
      const b = makeButton(label);
      b.hidden = true;
      b.addEventListener('click', () => ctx.next());
      wrap.appendChild(b);
      parent.appendChild(wrap);
      return {
        el: b,
        show() {
          if (!b.hidden) return;
          reveal(b, { delay: 0.1 });
          // bring into view if the scene scrolls
          setTimeout(() => {
            try { b.scrollIntoView({ behavior: ctx.reduced ? 'auto' : 'smooth', block: 'nearest' }); } catch (e) {}
          }, 150);
        },
      };
    },
  };

  const cleanup = SCENES[name].mount(ctx) || null;
  return { name, el, cleanup };
}

function unmount(scene) {
  if (!scene) return;
  try { scene.cleanup && scene.cleanup(); } catch (e) { /* ignore */ }
  window.gsap.killTweensOf(scene.el.querySelectorAll('*'));
  scene.el.remove();
}

function advance(name) {
  if (fromHub && name !== 'opening' && name !== 'lock') {
    go('hub');
    return;
  }
  const i = ORDER.indexOf(name);
  if (i >= 0 && i < ORDER.length - 1) go(ORDER[i + 1]);
  else go('hub');
}

function go(name, opts = {}) {
  if (busy) {
    // never drop a tap: run it once the current transition ends
    pending = [name, opts];
    return;
  }
  if (current && current.name === name && !opts.force) return;
  busy = true;
  if (name === 'hub') fromHub = true;
  if (name === 'opening') fromHub = false;
  if (opts.fromHub !== undefined) fromHub = opts.fromHub;

  const gsap = window.gsap;
  const prev = current;
  openWhen.setHubMode(name === 'hub');

  const swap = () => {
    unmount(prev);
    current = mount(name);
    current.el.scrollTop = 0;
    try { current.el.focus({ preventScroll: true }); } catch (e) {}
    return current.el;
  };

  if (!prev) {
    const el = swap();
    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.out', onComplete: setIdle });
    return;
  }

  if (reducedMotion()) {
    gsap.to(prev.el, {
      opacity: 0,
      duration: 0.35,
      onComplete: () => {
        const el = swap();
        gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.45, onComplete: setIdle });
      },
    });
    return;
  }

  // Heart-draw transition (~1.4s)
  const len = heartPath.getTotalLength();
  gsap.set(heartPath, { strokeDasharray: len, strokeDashoffset: len });
  gsap.set(overlay, { opacity: 1, visibility: 'visible' });
  const tl = gsap.timeline({
    onComplete: () => {
      gsap.set(overlay, { visibility: 'hidden' });
      setIdle();
    },
  });
  tl.to(heartPath, { strokeDashoffset: 0, duration: 0.65, ease: 'power2.inOut' }, 0)
    .to(prev.el, { opacity: 0, duration: 0.45, ease: 'power2.out' }, 0.1)
    .add(() => {
      const el = swap();
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.55, ease: 'power2.out' });
    }, 0.6)
    .to(overlay, { opacity: 0, duration: 0.6, ease: 'sine.inOut' }, 0.85);
}

// ---------- boot ----------
startSky(document.getElementById('sky'));
initAudio(CONTENT);
const openWhen = initOpenWhen(document.getElementById('openwhen-root'), CONTENT, state, saveState);
if (state.completed) openWhen.show(false);

go(state.completed ? 'hub' : 'opening');
