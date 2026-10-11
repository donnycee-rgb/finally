// "Open when…" letters: a corner envelope and a drawer that stays forever.
import { bowSVG, envelopeHTML, openEnvelope, showModal, esc, reducedMotion } from './art.js';

export function initOpenWhen(root, CONTENT, state, save) {
  const gsap = window.gsap;
  const L = CONTENT.openWhen;

  root.innerHTML = `
    <button type="button" class="ow-fab" hidden>
      <span class="ow-fab-env" aria-hidden="true"><span class="ow-fab-flap"></span>${bowSVG('ow-fab-bow')}</span>
      <span class="ow-fab-label">${esc(CONTENT.ui.openWhen)}</span>
    </button>
    <div class="ow-drawer" hidden>
      <button type="button" class="ow-backdrop" aria-label="${esc(CONTENT.a11y.close)}"></button>
      <div class="ow-panel" role="dialog" aria-modal="true" aria-label="${esc(CONTENT.ui.openWhen)}" tabindex="-1">
        <span class="ow-handle" aria-hidden="true"></span>
        <button type="button" class="modal-x ow-x" aria-label="${esc(CONTENT.a11y.close)}">×</button>
        <p class="ow-title">${esc(CONTENT.ui.openWhen)}</p>
        <div class="ow-grid"></div>
      </div>
    </div>
  `;

  const fab = root.querySelector('.ow-fab');
  const drawer = root.querySelector('.ow-drawer');
  const panel = root.querySelector('.ow-panel');
  const backdrop = root.querySelector('.ow-backdrop');
  const grid = root.querySelector('.ow-grid');
  let isOpen = false;
  let available = false;
  let hubMode = false;

  function render() {
    grid.innerHTML = '';
    L.forEach((item, i) => {
      const id = `ow${i + 1}`;
      const wasOpened = state.openedLetters.includes(id);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `ow-item${wasOpened ? ' opened' : ''}`;
      b.innerHTML = `
        ${envelopeHTML()}
        <span class="ow-label">${esc(item.label)}</span>
        <span class="ow-opened">${wasOpened ? esc(CONTENT.ui.opened) : ''}</span>`;
      if (wasOpened) b.querySelector('.env').classList.add('is-open', 'stay-open');
      grid.appendChild(b);
      b.addEventListener('click', () => openLetter(i, id, b));
    });
  }

  let busy = false;
  function openLetter(i, id, b) {
    if (busy) return;
    const env = b.querySelector('.env');
    const reveal = () => {
      busy = false;
      showModal({
        className: 'note-modal',
        closeLabel: CONTENT.a11y.close,
        html: `<p class="note-label">${esc(L[i].label)}</p><p class="note-text">${esc(L[i].note)}</p>`,
      });
    };
    if (!state.openedLetters.includes(id)) {
      busy = true;
      state.openedLetters.push(id);
      save();
      b.classList.add('opened');
      b.querySelector('.ow-opened').textContent = CONTENT.ui.opened;
      openEnvelope(env, reducedMotion()).add(() => env.classList.add('stay-open')).add(reveal, '+=0.1');
    } else {
      reveal();
    }
  }

  function openDrawer() {
    if (isOpen) return;
    isOpen = true;
    render();
    drawer.hidden = false;
    const reduced = reducedMotion();
    gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    gsap.fromTo(panel, { yPercent: reduced ? 0 : 100, opacity: reduced ? 0 : 1 },
      { yPercent: 0, opacity: 1, duration: reduced ? 0.4 : 0.7, ease: 'power2.out' });
    setTimeout(() => { try { panel.focus({ preventScroll: true }); } catch (e) {} }, 50);
    document.addEventListener('keydown', onKey);
  }

  function closeDrawer() {
    if (!isOpen || document.querySelector('.note-modal')) return;
    isOpen = false;
    document.removeEventListener('keydown', onKey);
    const reduced = reducedMotion();
    gsap.to(backdrop, { opacity: 0, duration: 0.4 });
    gsap.to(panel, {
      yPercent: reduced ? 0 : 100, opacity: reduced ? 0 : 1, duration: 0.5, ease: 'power2.in',
      onComplete: () => { drawer.hidden = true; try { fab.focus({ preventScroll: true }); } catch (e) {} },
    });
  }

  function onKey(e) { if (e.key === 'Escape') closeDrawer(); }

  fab.addEventListener('click', openDrawer);
  backdrop.addEventListener('click', closeDrawer);
  root.querySelector('.ow-x').addEventListener('click', closeDrawer);

  function syncFab() {
    fab.hidden = !available || hubMode;
  }

  return {
    show(pulse) {
      available = true;
      syncFab();
      if (pulse && !fab.hidden) {
        gsap.fromTo(fab, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' });
        fab.classList.add('pulse');
      }
    },
    setHubMode(on) {
      hubMode = on;
      syncFab();
    },
    open: openDrawer,
  };
}
