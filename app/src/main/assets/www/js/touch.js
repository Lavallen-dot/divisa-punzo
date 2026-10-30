/* touch.js : controles táctiles en pantalla (multitáctil)
   Izquierda  -> joystick flotante (dedo gordo izquierdo)
   Derecha    -> botón ARROJAR (puntería asistida, mantené apretado para repetir)
                 y botón GALOPE (se prende / se apaga)
   Tocar el escenario (lado derecho) arroja la divisa justo hacia ese punto.
   Arriba a la derecha: pausa y sonido. */
(function () {
  'use strict';
  const G = DP.Game, CFG = DP.CFG, U = DP.U;
  const W = CFG.W, H = CFG.H;
  const T = DP.Touch = {};
  const FONT = '"Trebuchet MS", Verdana, sans-serif';

  const stick = { id: null, cx: 135, cy: 405, x: 0, y: 0 };
  const R = 64;                                       // radio del joystick
  const btn = {
    throw:  { x: 838, y: 400, r: 62, id: null },
    gallop: { x: 722, y: 468, r: 40, id: null },
    pause:  { x: W - 32, y: 112, r: 19, id: null },
    mute:   { x: W - 32, y: 156, r: 19, id: null }
  };
  let aimId = null;

  T.enabled = false;
  G.stick = { x: 0, y: 0 };

  T.detect = function () {
    try {
      if (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) ||
          (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)) T.enabled = true;
    } catch (e) { /* */ }
    G.touchMode = T.enabled;
  };

  const inside = (b, p, k) => Math.hypot(p.x - b.x, p.y - b.y) <= b.r * (k || 1);

  function release(id) {
    if (id === stick.id) { stick.id = null; stick.x = stick.y = 0; G.stick.x = G.stick.y = 0; }
    if (id === btn.throw.id) { btn.throw.id = null; G.keys.fire = false; }
    if (id === btn.gallop.id) btn.gallop.id = null;
    if (id === btn.pause.id) btn.pause.id = null;
    if (id === btn.mute.id) btn.mute.id = null;
    if (id === aimId) { aimId = null; G.mouse.down = false; }
  }

  T.bind = function (canvas, toLogical) {
    canvas.addEventListener('touchstart', (ev) => {
      ev.preventDefault();
      DP.Audio.resume();
      T.enabled = true; G.touchMode = true; G.useMouse = false;
      for (const ct of ev.changedTouches) {
        const p = toLogical(ct), id = ct.identifier;
        G.mouse.x = p.x; G.mouse.y = p.y;
        if (DP.UI.onClick(p.x, p.y)) continue;           // botones de menú / pausa / fin
        if (G.state !== 'play') continue;
        if (inside(btn.pause, p, 1.3)) { btn.pause.id = id; G.state = 'pause'; continue; }
        if (inside(btn.mute, p, 1.3)) { btn.mute.id = id; DP.Audio.toggle(); continue; }
        if (inside(btn.throw, p, 1.15)) { btn.throw.id = id; G.keys.fire = true; continue; }
        if (inside(btn.gallop, p, 1.2)) { btn.gallop.id = id; G.keys.shift = !G.keys.shift; continue; }
        if (p.x < W * 0.42 && p.y > 120 && stick.id === null) {
          stick.id = id; stick.cx = p.x; stick.cy = p.y; stick.x = stick.y = 0;
          continue;
        }
        if (aimId === null && p.y > 100) { aimId = id; G.mouse.down = true; }   // tocar el escenario = arrojar ahí
      }
    }, { passive: false });

    canvas.addEventListener('touchmove', (ev) => {
      ev.preventDefault();
      for (const ct of ev.changedTouches) {
        const p = toLogical(ct), id = ct.identifier;
        if (id === stick.id) {
          let dx = p.x - stick.cx, dy = p.y - stick.cy;
          const d = Math.hypot(dx, dy);
          if (d > R) {                                     // el joystick "sigue" al dedo
            stick.cx += dx / d * (d - R); stick.cy += dy / d * (d - R);
            dx = p.x - stick.cx; dy = p.y - stick.cy;
          }
          const m = Math.min(1, Math.hypot(dx, dy) / R);
          const a = Math.atan2(dy, dx);
          stick.x = Math.cos(a) * m; stick.y = Math.sin(a) * m;
          const dead = m < 0.14;
          G.stick.x = dead ? 0 : stick.x; G.stick.y = dead ? 0 : stick.y;
        } else if (id === aimId) { G.mouse.x = p.x; G.mouse.y = p.y; }
      }
    }, { passive: false });

    const end = (ev) => { ev.preventDefault(); for (const ct of ev.changedTouches) release(ct.identifier); };
    canvas.addEventListener('touchend', end, { passive: false });
    canvas.addEventListener('touchcancel', end, { passive: false });
    window.addEventListener('blur', () => { stick.id = null; G.stick.x = G.stick.y = 0; btn.throw.id = null; aimId = null; });
  };

  T.reset = function () {
    stick.id = null; stick.x = stick.y = 0; G.stick.x = G.stick.y = 0;
    stick.cx = 135; stick.cy = 405;
    btn.throw.id = null; aimId = null; G.keys.shift = false; G.keys.fire = false;
  };

  /* ---------------------------------------------------------------- dibujo */
  function circle(ctx, x, y, r, fill, stroke, lw) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.lineWidth = lw || 3; ctx.strokeStyle = stroke; ctx.stroke(); }
  }

  T.draw = function (ctx) {
    if (!T.enabled || G.state !== 'play') return;
    ctx.save();
    const active = stick.id !== null;
    const bx = active ? stick.cx : 135, by = active ? stick.cy : 405;
    ctx.globalAlpha = active ? 0.55 : 0.32;
    circle(ctx, bx, by, R, 'rgba(255,255,255,.14)', '#fff', 3);
    circle(ctx, bx, by, R * 0.45, null, 'rgba(255,255,255,.4)', 2);
    // flechitas
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach((d) => {
      const x = bx + d[0] * (R - 15), y = by + d[1] * (R - 15);
      ctx.beginPath();
      ctx.moveTo(x + d[0] * 6, y + d[1] * 6);
      ctx.lineTo(x - d[1] * 6 - d[0] * 3, y + d[0] * 6 - d[1] * 3);
      ctx.lineTo(x + d[1] * 6 - d[0] * 3, y - d[0] * 6 - d[1] * 3);
      ctx.closePath(); ctx.fill();
    });
    circle(ctx, bx + stick.x * R * 0.7, by + stick.y * R * 0.7, 28, 'rgba(255,255,255,.45)', '#fff', 3);

    // botón ARROJAR
    const t = btn.throw, tp = t.id !== null;
    ctx.globalAlpha = tp ? 0.8 : 0.5;
    circle(ctx, t.x, t.y, t.r * (tp ? 0.94 : 1), tp ? '#e0121a' : 'rgba(190,20,28,.78)', '#ffd9d9', 4);
    // divisa dibujada
    ctx.save(); ctx.translate(t.x, t.y - 6); ctx.rotate(-0.5);
    DP.Art.ribbon(ctx, 0, 0, 44, 15, 0, DP.Game.t);
    ctx.restore();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px ' + FONT; ctx.textAlign = 'center';
    ctx.fillText('ARROJAR', t.x, t.y + 38);

    // botón GALOPE (se prende / apaga)
    const g = btn.gallop, on = !!G.keys.shift;
    ctx.globalAlpha = on ? 0.85 : 0.45;
    circle(ctx, g.x, g.y, g.r, on ? '#ffb81c' : 'rgba(255,255,255,.16)', on ? '#fff' : '#fff', 3);
    ctx.fillStyle = on ? '#3a1d17' : '#fff'; ctx.font = 'bold 12px ' + FONT;
    ctx.fillText('GALOPE', g.x, g.y + 4);
    ctx.font = 'bold 18px ' + FONT; ctx.fillText('»', g.x, g.y - 10);

    // pausa y sonido
    ctx.globalAlpha = 0.55;
    const p = btn.pause, m = btn.mute;
    circle(ctx, p.x, p.y, p.r, 'rgba(30,12,8,.8)', '#d9b36a', 2);
    ctx.fillStyle = '#fff6dc'; ctx.fillRect(p.x - 6, p.y - 7, 4.5, 14); ctx.fillRect(p.x + 1.5, p.y - 7, 4.5, 14);
    circle(ctx, m.x, m.y, m.r, 'rgba(30,12,8,.8)', '#d9b36a', 2);
    ctx.fillStyle = '#fff6dc';
    ctx.beginPath(); ctx.moveTo(m.x - 8, m.y - 3); ctx.lineTo(m.x - 3, m.y - 3); ctx.lineTo(m.x + 2, m.y - 8); ctx.lineTo(m.x + 2, m.y + 8); ctx.lineTo(m.x - 3, m.y + 3); ctx.lineTo(m.x - 8, m.y + 3); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff6dc'; ctx.lineWidth = 2;
    if (DP.Audio.isMuted()) { ctx.beginPath(); ctx.moveTo(m.x + 5, m.y - 5); ctx.lineTo(m.x + 11, m.y + 5); ctx.moveTo(m.x + 11, m.y - 5); ctx.lineTo(m.x + 5, m.y + 5); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(m.x + 3, m.y, 6, -0.9, 0.9); ctx.stroke(); }
    ctx.restore();
  };
})();
