/* ui.js : HUD, menú, pausa y pantalla final (todo dibujado en el canvas) */
(function () {
  'use strict';
  const U = DP.U, CFG = DP.CFG, G = DP.Game;
  const W = CFG.W, H = CFG.H;
  const UI = DP.UI = {};
  const FONT = '"Trebuchet MS", Verdana, sans-serif';
  const SERIF = 'Georgia, "Times New Roman", serif';

  function text(ctx, s, x, y, size, color, align, bold, font) {
    ctx.font = (bold === false ? '' : 'bold ') + size + 'px ' + (font || FONT);
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = color || '#fff';
    ctx.fillText(s, x, y);
  }
  function shadowText(ctx, s, x, y, size, color, align, font) {
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.font = 'bold ' + size + 'px ' + (font || FONT);
    ctx.textAlign = align || 'left';
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(30,10,5,.85)';
    ctx.strokeText(s, x, y);
    ctx.fillStyle = color || '#fff';
    ctx.fillText(s, x, y);
    ctx.restore();
  }
  function button(ctx, id, label, x, y, w, h, opts) {
    opts = opts || {};
    const hover = G.mouse.x >= x && G.mouse.x <= x + w && G.mouse.y >= y && G.mouse.y <= y + h;
    G.buttons.push({ id, x, y, w, h });
    U.rr(ctx, x, y, w, h, 10);
    ctx.fillStyle = opts.sel ? '#b3121a' : (hover ? '#5a2a20' : '#3a1d17');
    ctx.fill();
    ctx.lineWidth = opts.sel ? 3 : 2;
    ctx.strokeStyle = opts.sel ? '#ffd23a' : '#d9b36a';
    ctx.stroke();
    text(ctx, label, x + w / 2, y + h / 2 + (opts.sub ? -2 : 6), opts.size || 20, '#fff6dc', 'center');
    if (opts.sub) text(ctx, opts.sub, x + w / 2, y + h / 2 + 15, 12, '#f0d9a0', 'center', false);
  }

  /* ------------------------------------------------------------------ HUD */
  UI.hud = function (ctx) {
    const D = G.D, p = G.player;
    ctx.save();
    // panel superior
    ctx.fillStyle = 'rgba(30,12,8,.72)';
    U.rr(ctx, 8, 8, W - 16, 64, 10); ctx.fill();

    // barra de federalización
    const bx = 20, by = 22, bw = 330, bh = 20;
    ctx.fillStyle = '#1a0d0a'; U.rr(ctx, bx, by, bw, bh, 6); ctx.fill();
    const fw = bw * Math.min(1, G.ratio);
    if (fw > 1) { ctx.fillStyle = '#d4141c'; U.rr(ctx, bx, by, fw, bh, 6); ctx.fill(); }
    ctx.lineWidth = 2; ctx.strokeStyle = '#d9b36a'; U.rr(ctx, bx, by, bw, bh, 6); ctx.stroke();
    const mx = bx + bw * D.win;
    ctx.strokeStyle = '#ffd23a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(mx, by - 5); ctx.lineTo(mx, by + bh + 5); ctx.stroke();
    text(ctx, 'PUNZÓ ' + Math.round(G.ratio * 100) + '%', bx + 8, by + 15, 13, '#fff');
    text(ctx, 'meta ' + Math.round(D.win * 100) + '%', mx, by + bh + 17, 11, '#ffd23a', 'center');
    if (G.holdT > 0) {
      const k = Math.min(1, G.holdT / CFG.WIN_HOLD);
      ctx.fillStyle = '#ffd23a'; ctx.fillRect(bx, by + bh + 21, bw * k, 4);
    }

    // constituyentes caídos
    text(ctx, 'Constituyentes: ' + G.constFed + ' / ' + G.constTotal, 370, 36, 13, '#cfe0ff');
    text(ctx, 'Puntos: ' + G.score, 370, 56, 13, '#fff6dc');

    // divisas (munición)
    text(ctx, 'DIVISAS', 560, 36, 12, '#f0d9a0');
    const n = Math.floor(p.ammo);
    for (let i = 0; i < CFG.AMMO_MAX; i++) {
      const x = 560 + i * 8;
      ctx.fillStyle = i < n ? '#e0121a' : 'rgba(255,255,255,.14)';
      ctx.fillRect(x, 42, 5, 16);
      if (i < n) { ctx.fillStyle = '#16100e'; ctx.fillRect(x + 1, 47, 3, 3); }
    }

    // tiempo
    const low = G.time < 30;
    text(ctx, U.fmtTime(G.time), W - 22, 46, 30, low && Math.floor(G.t * 3) % 2 ? '#ff6a6a' : '#fff6dc', 'right', true, SERIF);
    text(ctx, G.D.name.toUpperCase(), W - 22, 24, 11, '#f0d9a0', 'right');

    // minimapa de la calle
    const mmx = 20, mmy = 80, mmw = W - 40, mmh = 8;
    ctx.fillStyle = 'rgba(30,12,8,.72)'; U.rr(ctx, mmx - 6, mmy - 5, mmw + 12, mmh + 10, 6); ctx.fill();
    ctx.fillStyle = '#6b5a3c'; ctx.fillRect(mmx, mmy, mmw, mmh);
    const mp = (x) => mmx + (x / CFG.WORLD_W) * mmw;
    for (const e of G.npcs) {
      if (e.hidden) continue;
      ctx.fillStyle = e.fed ? '#ff2a2f' : (e.kind === 'const' ? '#3a7bff' : '#efe7d0');
      const s = e.kind === 'const' ? 3 : 2;
      ctx.fillRect(mp(e.x) - s / 2, mmy + (e.kind === 'const' ? 1 : 3), s, e.kind === 'const' ? 6 : 3);
    }
    ctx.strokeStyle = '#ffd23a'; ctx.lineWidth = 1.5;
    ctx.strokeRect(mp(G.camX), mmy - 2, (W / CFG.WORLD_W) * mmw, mmh + 4);
    ctx.fillStyle = '#ffd23a';
    ctx.beginPath(); ctx.moveTo(mp(p.x), mmy - 4); ctx.lineTo(mp(p.x) - 4, mmy - 9); ctx.lineTo(mp(p.x) + 4, mmy - 9); ctx.closePath(); ctx.fill();

    // avisos
    G.toasts.forEach((t, i) => {
      ctx.globalAlpha = Math.min(1, t.t * 2);
      shadowText(ctx, t.text, W / 2, 124 + i * 24, 17, t.color, 'center');
    });
    ctx.globalAlpha = 1;
    if (G.holdT > 0) shadowText(ctx, '¡Sostené la calle punzó! ' + Math.max(0, CFG.WIN_HOLD - G.holdT).toFixed(1) + 's', W / 2, 108, 18, '#ffd23a', 'center');

    // ayuda inicial
    if (G.helpT > 0) {
      ctx.globalAlpha = Math.min(1, G.helpT / 2);
      ctx.fillStyle = 'rgba(30,12,8,.75)'; U.rr(ctx, W / 2 - 330, H - 52, 660, 38, 10); ctx.fill();
      text(ctx, G.touchMode ? 'Joystick izquierdo: mover · ARROJAR: puntería asistida · tocá el escenario para apuntar vos'
        : 'Mover: WASD / flechas · Galope: Shift · Arrojar: clic (apuntá con el mouse) o Espacio · Pausa: P', W / 2, H - 28, 13, '#fff6dc', 'center');
      ctx.globalAlpha = 1;
    }
    if (p.slow > 0) shadowText(ctx, '¡Te embarraron! Vas lento', W / 2, H - 70, 16, '#9fd0ff', 'center');

    // mira
    if (G.useMouse && G.state === 'play') {
      const m = G.mouse;
      ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(m.x, m.y, 10, 0, 6.3); ctx.moveTo(m.x - 15, m.y); ctx.lineTo(m.x - 5, m.y); ctx.moveTo(m.x + 5, m.y); ctx.lineTo(m.x + 15, m.y);
      ctx.moveTo(m.x, m.y - 15); ctx.lineTo(m.x, m.y - 5); ctx.moveTo(m.x, m.y + 5); ctx.lineTo(m.x, m.y + 15); ctx.stroke();
    }
    ctx.restore();
  };

  function panel(ctx, x, y, w, h) {
    ctx.fillStyle = 'rgba(20,8,5,.88)';
    U.rr(ctx, x, y, w, h, 16); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = '#d9b36a'; ctx.stroke();
    ctx.lineWidth = 1; ctx.strokeStyle = '#8f0c12';
    U.rr(ctx, x + 6, y + 6, w - 12, h - 12, 12); ctx.stroke();
  }

  /* ----------------------------------------------------------------- menú */
  UI.menu = function (ctx) {
    G.buttons = [];
    ctx.fillStyle = 'rgba(10,4,2,.55)'; ctx.fillRect(0, 0, W, H);
    panel(ctx, 110, 22, 740, 496);
    // cinta del título
    ctx.fillStyle = '#c8101a'; ctx.fillRect(110, 50, 740, 74);
    ctx.fillStyle = '#7d0a10'; ctx.fillRect(110, 50, 740, 5); ctx.fillRect(110, 119, 740, 5);
    shadowText(ctx, DP.TEXT.TITLE, W / 2, 100, 50, '#fff6dc', 'center', SERIF);
    text(ctx, DP.TEXT.SUB + ' · ¡Federación o muerte!', W / 2, 148, 17, '#f0d9a0', 'center', false, SERIF);

    text(ctx, 'Recorré la calle a caballo y arrojá divisas punzó: cada acierto convierte', W / 2, 184, 14, '#fff6dc', 'center', false);
    text(ctx, 'a un ciudadano o soldado. Pero los constituyentes del libro les devuelven bolas verdes y azules.', W / 2, 203, 14, '#fff6dc', 'center', false);

    text(ctx, 'DIFICULTAD (cantidad de constituyentes)', W / 2, 240, 13, '#d9b36a', 'center');
    [1, 2, 3].forEach((k, i) => {
      const D = DP.DIFF[k];
      button(ctx, 'diff' + k, D.name, 170 + i * 220, 252, 200, 56, { sel: G.diffKey === k, sub: D.constituents + ' constituyentes · meta ' + Math.round(D.win * 100) + '%', size: 20 });
    });

    button(ctx, 'play', '¡A LA CALLE!', W / 2 - 130, 326, 260, 54, { size: 24, sel: true });

    const L = G.touchMode ? [
      ['Joystick (izq.)', 'mover el caballo'], ['GALOPE', 'toque: prende / apaga'],
      ['ARROJAR', 'puntería asistida (mantené)'], ['Tocar escenario', 'arrojar hacia ese punto'],
      ['II (arriba der.)', 'pausa'], ['Bocina', 'sonido sí / no']
    ] : [
      ['WASD / flechas', 'mover el caballo'], ['Shift', 'galopar'],
      ['Clic izquierdo', 'arrojar divisa hacia el mouse'], ['Espacio', 'arrojar con puntería asistida'],
      ['P / Esc', 'pausa'], ['M', 'sonido sí / no']
    ];
    L.forEach((l, i) => {
      const cx = i % 2 ? W / 2 + 20 : 150, cy = 414 + Math.floor(i / 2) * 22;
      text(ctx, l[0], cx, cy, 13, '#ffd23a');
      text(ctx, l[1], cx + 110, cy, 13, '#fff6dc', 'left', false);
    });
    text(ctx, 'Los constituyentes aguantan varias divisas · tras un golpe levantan el libro y se protegen un instante',
      W / 2, 488, 12, '#cfe0ff', 'center', false);
    let best = 0;
    try { best = parseInt(localStorage.getItem('divisaPunzo_best_' + G.diffKey) || '0', 10); } catch (e) { /* */ }
    if (best) text(ctx, 'Récord (' + G.D.name + '): ' + best, W - 130, 148, 13, '#ffd23a', 'right');
  };

  UI.pause = function (ctx) {
    G.buttons = [];
    ctx.fillStyle = 'rgba(10,4,2,.6)'; ctx.fillRect(0, 0, W, H);
    panel(ctx, 300, 170, 360, 200);
    shadowText(ctx, 'PAUSA', W / 2, 225, 38, '#fff6dc', 'center', SERIF);
    button(ctx, 'resume', 'Seguir (P)', 360, 250, 240, 44, {});
    button(ctx, 'menu', 'Menú principal', 360, 306, 240, 44, {});
  };

  UI.end = function (ctx) {
    G.buttons = [];
    const r = G.result;
    ctx.fillStyle = 'rgba(10,4,2,.68)'; ctx.fillRect(0, 0, W, H);
    panel(ctx, 220, 80, 520, 380);
    if (r.win) {
      ctx.fillStyle = '#c8101a'; ctx.fillRect(220, 110, 520, 62);
      shadowText(ctx, '¡LA CALLE ES PUNZÓ!', W / 2, 154, 36, '#fff6dc', 'center', SERIF);
    } else {
      ctx.fillStyle = '#1f3f8a'; ctx.fillRect(220, 110, 520, 62);
      shadowText(ctx, 'SE ACABÓ EL TIEMPO', W / 2, 154, 34, '#fff6dc', 'center', SERIF);
      text(ctx, 'La Constitución resistió en las calles...', W / 2, 192, 14, '#cfe0ff', 'center', false);
    }
    const rows = [
      ['Federalizados', Math.round(G.ratio * 100) + '%  (meta ' + Math.round(G.D.win * 100) + '%)'],
      ['Constituyentes caídos', G.constFed + ' de ' + G.constTotal],
      ['Divisas arrojadas', String(G.stats.thrown)],
      ['Vueltos a la Constitución', String(G.stats.reverted)],
      ['Puntaje', String(r.score) + (r.record ? '  ¡NUEVO RÉCORD!' : '')]
    ];
    rows.forEach((row, i) => {
      text(ctx, row[0], 270, 232 + i * 30, 16, '#f0d9a0', 'left', false);
      text(ctx, row[1], 690, 232 + i * 30, 17, i === 4 ? '#ffd23a' : '#fff6dc', 'right');
    });
    button(ctx, 'again', 'Jugar de nuevo (Enter)', 260, 394, 220, 44, { sel: true, size: 17 });
    button(ctx, 'menu', 'Menú (M)', 500, 394, 200, 44, { size: 17 });
  };

  UI.draw = function (ctx) {
    if (G.state === 'menu') UI.menu(ctx);
    else {
      G.buttons = [];
      UI.hud(ctx);
      if (DP.Touch) DP.Touch.draw(ctx);
      if (G.state === 'pause') UI.pause(ctx);
      else if (G.state === 'end') UI.end(ctx);
    }
  };

  function act(id) {
    if (id === 'play') G.start(G.diffKey);
    else if (id.indexOf('diff') === 0) { G.newGame(parseInt(id.slice(4), 10)); G.state = 'menu'; DP.Audio.resume(); DP.Audio.click(); }
    else if (id === 'resume') G.state = 'play';
    else if (id === 'menu') { G.newGame(G.diffKey); G.state = 'menu'; }
    else if (id === 'again') G.start(G.diffKey);
  }

  UI.onClick = function (x, y) {
    for (const b of G.buttons) {
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) { act(b.id); return true; }
    }
    return false;
  };

  UI.onKey = function (ev) {
    const k = ev.key;
    DP.Audio.resume();
    if (k === 'm' || k === 'M') {
      if (G.state === 'end') { act('menu'); return; }
      DP.Audio.toggle();
      return;
    }
    if (G.state === 'menu') {
      if (k === 'Enter' || k === ' ') act('play');
      else if (k === '1' || k === '2' || k === '3') act('diff' + k);
    } else if (G.state === 'play') {
      if (k === 'p' || k === 'P' || k === 'Escape') G.state = 'pause';
    } else if (G.state === 'pause') {
      if (k === 'p' || k === 'P' || k === 'Escape' || k === 'Enter') G.state = 'play';
    } else if (G.state === 'end') {
      if (k === 'Enter' || k === 'r' || k === 'R') act('again');
    }
  };
})();
