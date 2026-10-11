// Floating audio pill. Never autoplays. Hidden entirely if the song is missing.

const SRC = 'assets/audio/song.mp3';

export function initAudio(CONTENT) {
  const pill = document.getElementById('audio-pill');
  const audio = document.getElementById('song');
  const label = pill.querySelector('.audio-label');
  pill.hidden = true;

  const setLabel = () => {
    const playing = !audio.paused;
    label.textContent = playing ? CONTENT.ui.pause : CONTENT.ui.play;
    pill.classList.toggle('playing', playing);
    pill.setAttribute('aria-pressed', playing ? 'true' : 'false');
  };

  const hide = () => {
    try { audio.pause(); } catch (e) {}
    pill.hidden = true;
  };

  const enable = () => {
    audio.src = SRC;
    setLabel();
    pill.hidden = false;
  };

  audio.addEventListener('error', hide);
  audio.addEventListener('play', setLabel);
  audio.addEventListener('pause', setLabel);

  pill.addEventListener('click', () => {
    if (audio.paused) {
      const p = audio.play();
      if (p && p.catch) p.catch(hide);
    } else {
      audio.pause();
    }
  });

  fetch(SRC, { method: 'HEAD', cache: 'no-store' })
    .then((r) => {
      const type = r.headers.get('content-type') || '';
      // Some hosts serve index.html for missing files; only accept audio.
      if (r.ok && (type === '' || type.includes('audio') || type.includes('mpeg') || type.includes('octet-stream'))) enable();
    })
    .catch(() => {});
}
