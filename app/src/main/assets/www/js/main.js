/* main.js : arranque, escalado del canvas y bucle principal */
(function () {
  'use strict';
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = DP.CFG.W, H = DP.CFG.H;
  let k = 1;

  function resize() {
    const vw = window.innerWidth, vh = window.innerHeight;
    let cw = vw, ch = vw * H / W;
    if (ch > vh) { ch = vh; cw = vh * W / H; }
    canvas.style.width = Math.floor(cw) + 'px';
    canvas.style.height = Math.floor(ch) + 'px';
    const cap = DP.Touch && DP.Touch.enabled ? 2 : 2.5;   // en celulares: menos píxeles = más fluido
    k = Math.max(1, Math.min(cap, cw * (window.devicePixelRatio || 1) / W));
    canvas.width = Math.round(W * k);
    canvas.height = Math.round(H * k);
  }
  DP.Touch.detect();
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 200));
  resize();

  function toLogical(ev) {
    const r = canvas.getBoundingClientRect();
    return { x: (ev.clientX - r.left) / r.width * W, y: (ev.clientY - r.top) / r.height * H };
  }

  const G = DP.Game;
  G.newGame(2);
  G.state = 'menu';
  G.bindInput(canvas, toLogical);

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    try {
      G.update(dt);
      ctx.setTransform(k, 0, 0, k, 0, 0);
      G.draw(ctx);
      DP.UI.draw(ctx);
    } catch (e) {
      console.error(e);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
