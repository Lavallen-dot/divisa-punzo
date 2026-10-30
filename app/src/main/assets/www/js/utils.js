/* utils.js : funciones de ayuda */
(function () {
  const U = DP.U = {};

  U.rand = (a, b) => a + Math.random() * (b - a);
  U.randi = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
  U.sign = (v) => (v < 0 ? -1 : 1);
  U.shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  };

  /* colores: mezcla de dos "#rrggbb" */
  const cache = {};
  function parse(hex) {
    if (cache[hex]) return cache[hex];
    const h = hex.replace('#', '');
    const v = h.length === 3
      ? [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]
      : [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    cache[hex] = v;
    return v;
  }
  U.mix = (a, b, t) => {
    if (t <= 0) return a;
    if (t >= 1) return b;
    const A = parse(a), B = parse(b);
    return 'rgb(' + Math.round(A[0] + (B[0] - A[0]) * t) + ',' +
      Math.round(A[1] + (B[1] - A[1]) * t) + ',' +
      Math.round(A[2] + (B[2] - A[2]) * t) + ')';
  };
  U.shade = (hex, k) => { // k<0 oscurece, k>0 aclara
    const A = parse(hex);
    const f = (c) => Math.max(0, Math.min(255, Math.round(k >= 0 ? c + (255 - c) * k : c * (1 + k))));
    return 'rgb(' + f(A[0]) + ',' + f(A[1]) + ',' + f(A[2]) + ')';
  };

  /* perspectiva: más abajo en pantalla = más grande */
  U.scaleAt = (y) => 0.8 + (y - 318) / (506 - 318) * 0.4;

  /* rectángulo redondeado (sin depender de ctx.roundRect) */
  U.rr = (ctx, x, y, w, h, r) => {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  /* corta un texto en líneas que entren en maxW px */
  U.wrap = (ctx, text, maxW) => {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = w;
      } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  };

  U.fmtTime = (s) => {
    s = Math.max(0, Math.ceil(s));
    const m = Math.floor(s / 60), r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  };

  U.makeCanvas = (w, h) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  };
})();
