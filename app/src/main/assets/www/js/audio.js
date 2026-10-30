/* audio.js : sonidos generados con WebAudio (no hay archivos de audio) */
(function () {
  let ctx = null, master = null, muted = false;

  function init() {
    if (ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.22;
      master.connect(ctx.destination);
    } catch (e) { ctx = null; }
  }

  function tone(freq, dur, type, vol, slideTo, delay) {
    if (!ctx || muted) return;
    try {
      const t0 = ctx.currentTime + (delay || 0);
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t0);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.3, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(master);
      o.start(t0); o.stop(t0 + dur + 0.05);
    } catch (e) { /* ignorar */ }
  }

  function noise(dur, vol, freq) {
    if (!ctx || muted) return;
    try {
      const n = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, n, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = freq || 1800;
      const g = ctx.createGain();
      g.gain.value = vol || 0.3;
      src.connect(f); f.connect(g); g.connect(master);
      src.start();
    } catch (e) { /* ignorar */ }
  }

  DP.Audio = {
    resume() {
      init();
      if (ctx && ctx.state === 'suspended') { try { ctx.resume(); } catch (e) { /* */ } }
    },
    toggle() { muted = !muted; return muted; },
    isMuted() { return muted; },
    throwSfx() { noise(0.16, 0.35, 2600); tone(520, 0.12, 'triangle', 0.08, 900); },
    hit() { tone(660, 0.1, 'square', 0.16, 990); tone(990, 0.18, 'square', 0.14, 1320, 0.07); },
    resist() { tone(180, 0.12, 'sawtooth', 0.16, 120); },
    revert() { tone(420, 0.28, 'sine', 0.22, 160); },
    splat() { noise(0.12, 0.25, 700); },
    ouch() { tone(240, 0.22, 'sawtooth', 0.18, 90); },
    door() { tone(150, 0.08, 'square', 0.1, 110); },
    win() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, 'triangle', 0.25, null, i * 0.14));
    },
    lose() {
      [392, 330, 262, 196].forEach((f, i) => tone(f, 0.34, 'sawtooth', 0.14, null, i * 0.18));
    },
    click() { tone(800, 0.05, 'square', 0.1); }
  };
})();
