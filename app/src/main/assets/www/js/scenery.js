/* scenery.js : el Buenos Aires de 1854 (casas bajas, Cabildo, Pirámide, puerto, ombúes...) */
(function () {
  const U = DP.U, CFG = DP.CFG;
  const S = DP.Scenery = {};
  const OUT = '#2a1a14';
  const TAU = Math.PI * 2;

  S.row2 = [];
  S.ships = [];

  /* ------------------------------------------------------------------
     GENERACIÓN: casas, puertas, segunda fila del fondo y barcos
     ------------------------------------------------------------------ */
  S.generate = function () {
    const WW = CFG.WORLD_W;
    const houses = [], doors = [];
    const plazaC = WW / 2, P0 = plazaC - 320, P1 = plazaC + 300;
    const walls = ['#efe6cf', '#e5cc8e', '#a9c7d8', '#b8d4b2', '#dcc0a0', '#ebdcb8', '#c9d7e2', '#f2eadb'];
    const trims = ['#fffaf0', '#f4ead2', '#fbf6e8'];
    const shutters = ['#2f5a3e', '#6b4a2b', '#2d4a6e', '#3d6a4a'];
    let x = -60, cab = false;

    while (x < WW + 60) {
      if (!cab && x >= P0) {
        cab = true;
        x = P1;
        const h = { type: 'cabildo', x, w: 440, h: 152, doors: [] };
        [154, 266].forEach((cx) => {
          const d = { kind: 'door', x: x + cx, y: CFG.SIDEWALK_Y, cap: 99, count: 0, open: 0, house: h };
          h.doors.push(d); doors.push(d);
        });
        houses.push(h);
        x += 440;
        continue;
      }
      let w = U.randi(150, 230);
      if (!cab && x < P0 && x + w > P0) {
        w = P0 - x;
        if (w < 110) { x = P0; continue; }
      }
      const tall = Math.random() < 0.35;
      const hh = tall ? U.randi(138, 160) : U.randi(104, 128);
      const h = {
        type: 'house', x, w, h: hh,
        wall: U.pick(walls), trim: U.pick(trims), shutter: U.pick(shutters),
        roof: Math.random() < 0.62 ? 'azotea' : 'teja',
        doorX: U.randi(26, Math.max(30, w - 64)),
        wins: [], balcony: tall && Math.random() < 0.7
      };
      for (let px = 6; px + 46 <= w - 4; px += 56) {
        if (px + 46 < h.doorX - 8 || px > h.doorX + 38) h.wins.push(px + 9);
      }
      h.wins = h.wins.slice(0, 3);
      const d = { kind: 'door', x: x + h.doorX + 15, y: CFG.SIDEWALK_Y, cap: 99, count: 0, open: 0, house: h };
      h.door = d; doors.push(d);
      houses.push(h);
      x += w + (Math.random() < 0.25 ? U.randi(36, 70) : 0);
    }

    // segunda fila de edificios del fondo (más apagados, con torres de iglesia)
    S.row2 = [];
    let rx = -120;
    while (rx < WW * 0.7 + 1300) {
      const w = U.randi(90, 150);
      if (Math.random() < 0.28) { rx += w + U.randi(60, 130); continue; }
      S.row2.push({
        x: rx, w, h: U.randi(84, 156),
        c: U.pick(['#b9c3cc', '#c4bfb0', '#b5c4bd', '#c9c0b8', '#bcc6d0']),
        tower: Math.random() < 0.09
      });
      rx += w + U.randi(0, 6);
    }
    S.ships = [];
    for (let i = 0; i < 9; i++) S.ships.push({ x: 80 + i * 560 + U.randi(-120, 120), type: i % 3, y: 232 + U.randi(0, 46) });
    S.plazaX = plazaC;
    return { houses, doors, plazaX: plazaC };
  };

  /* ------------------------------------------------------------------
     FONDO: cielo, sol, nubes, río con barcos, segunda fila de edificios
     ------------------------------------------------------------------ */
  S.background = function (ctx, camX, t) {
    const W = CFG.W;
    const g = ctx.createLinearGradient(0, 0, 0, 250);
    g.addColorStop(0, '#78b4e2'); g.addColorStop(1, '#f7ebcf');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 310);

    ctx.fillStyle = 'rgba(255,246,205,.5)';
    ctx.beginPath(); ctx.arc(790, 92, 62, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff7d6';
    ctx.beginPath(); ctx.arc(790, 92, 29, 0, TAU); ctx.fill();

    // nubes
    ctx.fillStyle = 'rgba(255,255,255,.88)';
    for (let i = 0; i < 8; i++) {
      const cx = (((i * 331 + t * 5 - camX * 0.08) % 1600) + 1600) % 1600 - 300;
      const cy = 36 + ((i * 53) % 96);
      ctx.beginPath();
      ctx.ellipse(cx, cy, 46, 13, 0, 0, TAU);
      ctx.ellipse(cx + 26, cy - 9, 30, 12, 0, 0, TAU);
      ctx.ellipse(cx - 26, cy - 5, 28, 11, 0, 0, TAU);
      ctx.fill();
    }

    // río
    const rg = ctx.createLinearGradient(0, 206, 0, 306);
    rg.addColorStop(0, '#8dbcd3'); rg.addColorStop(1, '#4d82a6');
    ctx.fillStyle = rg; ctx.fillRect(0, 206, W, 100);
    ctx.fillStyle = '#93ab8a'; ctx.fillRect(0, 202, W, 6);
    ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 1.3;
    for (let i = 0; i < 26; i++) {
      const wx = (((i * 61 + t * 12 - camX * 0.3) % (W + 80)) + (W + 80)) % (W + 80) - 40;
      const wy = 214 + ((i * 29) % 84);
      ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + 14, wy); ctx.stroke();
    }
    // barcos
    for (const sh of S.ships) {
      const sx = sh.x - camX * 0.24;
      if (sx < -120 || sx > W + 120) continue;
      shipDraw(ctx, sx, sh.y + Math.sin(t * 1.4 + sh.x) * 1.4, sh.type, t);
    }

    // segunda fila
    for (const b of S.row2) {
      const sx = b.x - camX * 0.7;
      if (sx > W + 20 || sx + b.w < -20) continue;
      const base = CFG.HOUSE_BASE, top = base - b.h;
      ctx.fillStyle = b.c; ctx.fillRect(sx, top, b.w, b.h);
      ctx.fillStyle = 'rgba(0,0,0,.10)'; ctx.fillRect(sx + b.w - 8, top, 8, b.h);
      ctx.fillStyle = U.shade(b.c, 0.25); ctx.fillRect(sx - 2, top - 4, b.w + 4, 5);
      ctx.fillStyle = 'rgba(60,70,90,.55)';
      for (let wy = top + 14; wy < top + b.h - 40; wy += 26)
        for (let wx = sx + 10; wx < sx + b.w - 14; wx += 24) ctx.fillRect(wx, wy, 9, 14);
      if (b.tower) {
        const tx = sx + b.w / 2 - 14;
        ctx.fillStyle = b.c; ctx.fillRect(tx, top - 60, 28, 62);
        ctx.fillStyle = '#6f7d8c';
        ctx.beginPath(); ctx.arc(tx + 14, top - 60, 14, Math.PI, 0); ctx.fill();
        ctx.fillRect(tx + 13, top - 82, 2, 10);
        ctx.fillStyle = 'rgba(40,50,70,.6)'; ctx.fillRect(tx + 9, top - 48, 10, 16);
      }
    }
  };

  function shipDraw(ctx, x, y, type, t) {
    ctx.fillStyle = '#3a2a22';
    ctx.beginPath(); ctx.moveTo(x - 42, y); ctx.lineTo(x + 46, y); ctx.lineTo(x + 34, y + 11); ctx.lineTo(x - 30, y + 11); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d7c07c'; ctx.fillRect(x - 40, y + 1, 84, 2.2);
    ctx.strokeStyle = '#3a2a22'; ctx.lineWidth = 2;
    if (type === 2) { // vapor con chimenea
      ctx.fillStyle = '#2b2b30'; ctx.fillRect(x - 8, y - 26, 12, 26);
      ctx.fillStyle = '#c8141c'; ctx.fillRect(x - 8, y - 18, 12, 4);
      ctx.fillStyle = 'rgba(90,90,100,.5)';
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(x - 2 + i * 9 + Math.sin(t + i) * 2, y - 32 - i * 8, 6 + i * 2, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#e9e4d6'; ctx.fillRect(x - 28, y - 9, 22, 9);
      return;
    }
    const masts = type === 0 ? [-18, 16] : [0];
    for (const mx of masts) {
      ctx.beginPath(); ctx.moveTo(x + mx, y); ctx.lineTo(x + mx, y - 62); ctx.stroke();
      ctx.fillStyle = 'rgba(250,247,238,.95)';
      if (type === 0) {
        ctx.beginPath(); ctx.moveTo(x + mx - 14, y - 56); ctx.lineTo(x + mx + 14, y - 56); ctx.lineTo(x + mx + 12, y - 30); ctx.lineTo(x + mx - 12, y - 30); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x + mx - 16, y - 28); ctx.lineTo(x + mx + 16, y - 28); ctx.lineTo(x + mx + 14, y - 6); ctx.lineTo(x + mx - 14, y - 6); ctx.closePath(); ctx.fill();
      } else {
        ctx.beginPath(); ctx.moveTo(x + 2, y - 60); ctx.lineTo(x + 36, y - 6); ctx.lineTo(x + 2, y - 6); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x - 2, y - 52); ctx.lineTo(x - 30, y - 6); ctx.lineTo(x - 2, y - 6); ctx.closePath(); ctx.fill();
      }
    }
  }

  /* ------------------------------------------------------------------
     SUELO: vereda, cordón y calle empedrada
     ------------------------------------------------------------------ */
  let cobble = null;
  function getCobble() {
    if (cobble) return cobble;
    const c = U.makeCanvas(160, 220), g = c.getContext('2d');
    g.fillStyle = '#b79d71'; g.fillRect(0, 0, 160, 220);
    const cols = ['#a78d62', '#c3aa7e', '#9c8359', '#cdb689', '#b39968'];
    for (let i = 0; i < 260; i++) {
      const x = Math.random() * 160, y = Math.random() * 220, rx = 5 + Math.random() * 6, ry = 3.5 + Math.random() * 3;
      g.fillStyle = cols[i % cols.length];
      [-160, 0, 160].forEach((o) => {
        g.beginPath(); g.ellipse(x + o, y, rx, ry, 0, 0, TAU); g.fill();
      });
      g.strokeStyle = 'rgba(70,50,30,.35)'; g.lineWidth = 1;
      g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.stroke();
    }
    cobble = c;
    return c;
  }

  S.ground = function (ctx, camX) {
    const W = CFG.W, H = CFG.H, base = CFG.HOUSE_BASE;
    // vereda
    ctx.fillStyle = '#d3c5a4'; ctx.fillRect(0, base, W, 28);
    ctx.strokeStyle = 'rgba(90,70,40,.30)'; ctx.lineWidth = 1;
    const off = -(camX % 46);
    for (let x = off; x < W + 46; x += 46) { ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x - 6, base + 28); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(0, base + 14); ctx.lineTo(W, base + 14); ctx.stroke();
    // cordón
    ctx.fillStyle = '#8c8068'; ctx.fillRect(0, base + 28, W, 7);
    ctx.fillStyle = '#b9ad92'; ctx.fillRect(0, base + 28, W, 2);
    // calle
    const patt = ctx.createPattern(getCobble(), 'repeat');
    ctx.save();
    ctx.translate(-(camX % 160), 0);
    ctx.fillStyle = patt;
    ctx.fillRect(0, base + 35, W + 160, H - base - 35);
    ctx.restore();
    // huellas de carreta y sombreado de perspectiva
    ctx.fillStyle = 'rgba(70,50,25,.14)';
    ctx.fillRect(0, 392, W, 5); ctx.fillRect(0, 452, W, 6);
    const sg = ctx.createLinearGradient(0, base + 35, 0, H);
    sg.addColorStop(0, 'rgba(255,240,200,.18)'); sg.addColorStop(1, 'rgba(40,25,10,.20)');
    ctx.fillStyle = sg; ctx.fillRect(0, base + 35, W, H - base - 35);
  };

  /* ------------------------------------------------------------------
     CASAS
     ------------------------------------------------------------------ */
  function doorPath(ctx, x, w, hgt, base) {
    ctx.beginPath();
    ctx.moveTo(x, base);
    ctx.lineTo(x, base - hgt + w / 2);
    ctx.arc(x + w / 2, base - hgt + w / 2, w / 2, Math.PI, 0);
    ctx.lineTo(x + w, base);
    ctx.closePath();
  }

  S.house = function (ctx, h, sx, t) {
    const base = CFG.HOUSE_BASE, top = base - h.h, w = h.w;
    ctx.fillStyle = h.wall; ctx.fillRect(sx, top, w, h.h);
    const gr = ctx.createLinearGradient(sx, 0, sx + w, 0);
    gr.addColorStop(0, 'rgba(255,255,255,.12)'); gr.addColorStop(1, 'rgba(0,0,0,.12)');
    ctx.fillStyle = gr; ctx.fillRect(sx, top, w, h.h);
    ctx.fillStyle = U.shade(h.wall, -0.2); ctx.fillRect(sx, base - 14, w, 14);
    ctx.fillStyle = h.trim; ctx.fillRect(sx - 4, top - 7, w + 8, 7);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(sx - 4, top - 1, w + 8, 1.6);

    if (h.roof === 'azotea') {
      ctx.fillStyle = h.trim;
      ctx.fillRect(sx - 3, top - 20, w + 6, 3);
      for (let i = 4; i < w - 4; i += 11) ctx.fillRect(sx + i, top - 17, 4, 10);
      ctx.fillRect(sx - 3, top - 26, 7, 20); ctx.fillRect(sx + w - 4, top - 26, 7, 20);
    } else {
      ctx.beginPath();
      ctx.moveTo(sx - 8, top - 7); ctx.lineTo(sx + 16, top - 38); ctx.lineTo(sx + w - 16, top - 38); ctx.lineTo(sx + w + 8, top - 7);
      ctx.closePath();
      ctx.fillStyle = '#8a5a3a'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) { const yy = top - 7 - i * 7.5; ctx.beginPath(); ctx.moveTo(sx - 8 + i * 8, yy); ctx.lineTo(sx + w + 8 - i * 8, yy); ctx.stroke(); }
    }

    // ventanas con rejas y postigos
    for (const wx of h.wins) {
      const x0 = sx + wx, y0 = base - 14 - 8 - 54;
      ctx.fillStyle = h.trim; ctx.fillRect(x0 - 3, y0 - 4, 34, 62);
      ctx.fillStyle = '#272a35'; ctx.fillRect(x0, y0, 28, 54);
      ctx.fillStyle = h.shutter; ctx.fillRect(x0 - 9, y0, 9, 54); ctx.fillRect(x0 + 28, y0, 9, 54);
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let k = 4; k < 54; k += 5) { ctx.moveTo(x0 - 9, y0 + k); ctx.lineTo(x0, y0 + k); ctx.moveTo(x0 + 28, y0 + k); ctx.lineTo(x0 + 37, y0 + k); }
      ctx.stroke();
      ctx.strokeStyle = '#101218'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let k = 5; k < 28; k += 6) { ctx.moveTo(x0 + k, y0); ctx.lineTo(x0 + k, y0 + 54); }
      ctx.moveTo(x0, y0 + 27); ctx.lineTo(x0 + 28, y0 + 27);
      ctx.stroke();
      ctx.fillStyle = h.trim; ctx.fillRect(x0 - 5, y0 + 54, 38, 4);
      if (h.h >= 135) { // ventana alta
        ctx.fillStyle = h.trim; ctx.fillRect(x0 + 4, top + 14, 22, 30);
        ctx.fillStyle = '#272a35'; ctx.fillRect(x0 + 6, top + 16, 18, 26);
        ctx.fillStyle = h.shutter; ctx.fillRect(x0 - 2, top + 16, 7, 26); ctx.fillRect(x0 + 25, top + 16, 7, 26);
      }
    }

    // puerta
    const d = h.door;
    if (d) {
      const dx = sx + h.doorX, dh = 62;
      doorPath(ctx, dx - 4, 38, dh + 4, base); ctx.fillStyle = h.trim; ctx.fill();
      ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.stroke();
      const open = d.open > 0 ? Math.min(1, d.open * 2.2) : 0;
      doorPath(ctx, dx, 30, dh, base);
      ctx.fillStyle = open > 0 ? '#150f0d' : '#5a3a22'; ctx.fill();
      if (open > 0) {
        const lw = Math.max(5, 30 * (1 - 0.85 * open));
        doorPath(ctx, dx, lw, dh, base); ctx.fillStyle = '#6b4528'; ctx.fill();
      } else {
        ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(dx + 15, base - dh + 14); ctx.lineTo(dx + 15, base);
        ctx.moveTo(dx + 3, base - 40); ctx.lineTo(dx + 27, base - 40);
        ctx.stroke();
        ctx.fillStyle = '#e8c246'; ctx.beginPath(); ctx.arc(dx + 24, base - 28, 1.8, 0, TAU); ctx.fill();
      }
      if (h.balcony) {
        const by = base - dh - 34;
        ctx.fillStyle = '#1d1d22';
        ctx.fillRect(dx - 12, by, 54, 3);
        for (let k = 0; k < 54; k += 6) ctx.fillRect(dx - 12 + k, by - 12, 1.6, 12);
        ctx.fillRect(dx - 12, by - 12, 54, 2);
        ctx.fillStyle = h.trim; ctx.fillRect(dx - 14, by + 3, 58, 4);
      }
    }
  };

  /* El Cabildo (recova de arcos y torre con reloj) */
  S.cabildo = function (ctx, h, sx, t) {
    const base = CFG.HOUSE_BASE, top = base - h.h, w = h.w;
    ctx.fillStyle = '#f2ede0'; ctx.fillRect(sx, top, w, h.h);
    const gr = ctx.createLinearGradient(sx, 0, sx + w, 0);
    gr.addColorStop(0, 'rgba(255,255,255,.12)'); gr.addColorStop(1, 'rgba(0,0,0,.10)');
    ctx.fillStyle = gr; ctx.fillRect(sx, top, w, h.h);
    // cornisa + balaustrada
    ctx.fillStyle = '#fffaf0'; ctx.fillRect(sx - 4, top - 8, w + 8, 8);
    for (let i = 4; i < w; i += 12) ctx.fillRect(sx + i, top - 20, 4, 12);
    ctx.fillRect(sx - 4, top - 22, w + 8, 3);
    // ventanas del piso alto
    for (let i = 0; i < 7; i++) {
      const x0 = sx + 24 + i * 56;
      ctx.fillStyle = '#272a35'; ctx.fillRect(x0, top + 22, 24, 38);
      ctx.fillStyle = '#2f5a3e'; ctx.fillRect(x0 - 6, top + 22, 6, 38); ctx.fillRect(x0 + 24, top + 22, 6, 38);
      ctx.fillStyle = '#fffaf0'; ctx.fillRect(x0 - 2, top + 18, 28, 4);
    }
    // balcón corrido
    ctx.fillStyle = '#1d1d22'; ctx.fillRect(sx, top + 70, w, 3);
    for (let k = 0; k < w; k += 7) ctx.fillRect(sx + k, top + 58, 1.6, 12);
    ctx.fillRect(sx, top + 58, w, 2);
    // recova
    ctx.fillStyle = '#e6dfcb'; ctx.fillRect(sx, top + 76, w, h.h - 76);
    for (let i = 0; i < 7; i++) {
      const ax = sx + 20 + i * 56;
      ctx.beginPath();
      ctx.moveTo(ax, base); ctx.lineTo(ax, base - 50); ctx.arc(ax + 22, base - 50, 22, Math.PI, 0); ctx.lineTo(ax + 44, base); ctx.closePath();
      ctx.fillStyle = '#2a2420'; ctx.fill();
      ctx.fillStyle = 'rgba(255,230,160,.10)'; ctx.fillRect(ax + 6, base - 40, 10, 40);
    }
    ctx.fillStyle = '#fffaf0';
    for (let i = 0; i <= 7; i++) ctx.fillRect(sx + 8 + i * 56, top + 80, 10, h.h - 80);
    // torre con reloj
    const cx = sx + w / 2;
    ctx.fillStyle = '#f7f2e4'; ctx.fillRect(cx - 34, top - 96, 68, 96);
    ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(cx + 18, top - 96, 16, 96);
    ctx.fillStyle = '#fffaf0'; ctx.fillRect(cx - 38, top - 100, 76, 7);
    ctx.fillStyle = '#6a7684';
    ctx.beginPath(); ctx.moveTo(cx - 36, top - 100); ctx.quadraticCurveTo(cx, top - 150, cx + 36, top - 100); ctx.closePath(); ctx.fill();
    ctx.lineWidth = 1.4; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.fillStyle = '#4a4a50'; ctx.fillRect(cx - 1, top - 164, 2, 22);
    ctx.fillStyle = '#74acdf'; ctx.fillRect(cx + 1, top - 164, 14, 4);
    ctx.fillStyle = '#fff'; ctx.fillRect(cx + 1, top - 160, 14, 4);
    ctx.fillStyle = '#74acdf'; ctx.fillRect(cx + 1, top - 156, 14, 3);
    ctx.fillStyle = '#fffdf2'; ctx.beginPath(); ctx.arc(cx, top - 66, 14, 0, TAU); ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(cx, top - 66); ctx.lineTo(cx, top - 76); ctx.moveTo(cx, top - 66); ctx.lineTo(cx + 7, top - 62); ctx.stroke();
    ctx.fillStyle = '#272a35'; ctx.fillRect(cx - 7, top - 40, 14, 22);
    ctx.fillStyle = '#2f5a3e'; ctx.fillRect(cx - 12, top - 40, 5, 22); ctx.fillRect(cx + 7, top - 40, 5, 22);
  };

  /* ------------------------------------------------------------------
     OBJETOS que se ordenan por profundidad con los personajes
     ------------------------------------------------------------------ */
  S.bush = function (ctx, x, y, size, shake, variant) {
    ctx.save();
    ctx.translate(x + Math.sin(shake * 55) * Math.min(1, shake) * 3, y);
    ctx.scale(size, size);
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(0, 0, 40, 7, 0, 0, TAU); ctx.fill();
    const blobs = [[-26, -13, 14], [-10, -24, 17], [10, -23, 17], [27, -12, 14], [0, -12, 19], [-16, -8, 12], [16, -8, 12]];
    const pal = variant ? ['#33662f', '#487f3d', '#6aa857'] : ['#2e5f2f', '#3f7d3a', '#62a050'];
    for (const b of blobs) { ctx.fillStyle = pal[0]; ctx.beginPath(); ctx.arc(b[0], b[1] + 2, b[2] + 1.5, 0, TAU); ctx.fill(); }
    for (const b of blobs) { ctx.fillStyle = pal[1]; ctx.beginPath(); ctx.arc(b[0], b[1], b[2], 0, TAU); ctx.fill(); }
    for (const b of blobs) { ctx.fillStyle = pal[2]; ctx.beginPath(); ctx.arc(b[0] - 4, b[1] - 5, b[2] * 0.45, 0, TAU); ctx.fill(); }
    if (variant) {
      ctx.fillStyle = '#f2d34a';
      [[-18, -20], [6, -30], [20, -16], [-4, -12]].forEach((p) => { ctx.beginPath(); ctx.arc(p[0], p[1], 2, 0, TAU); ctx.fill(); });
    }
    ctx.restore();
  };

  S.barrel = function (ctx, x, y, size, shake) {
    ctx.save();
    ctx.translate(x + Math.sin(shake * 55) * Math.min(1, shake) * 2, y);
    ctx.scale(size, size);
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(0, 0, 17, 5, 0, 0, TAU); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-12, -2); ctx.quadraticCurveTo(-17, -16, -12, -32); ctx.lineTo(12, -32); ctx.quadraticCurveTo(17, -16, 12, -2); ctx.closePath();
    ctx.fillStyle = '#8a5a2b'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1;
    ctx.beginPath(); for (let i = -8; i <= 8; i += 4) { ctx.moveTo(i, -31); ctx.lineTo(i * 1.15, -3); } ctx.stroke();
    ctx.fillStyle = '#3a3836';
    ctx.fillRect(-15, -26, 30, 3); ctx.fillRect(-15, -9, 30, 3);
    ctx.beginPath(); ctx.ellipse(0, -32, 12, 3.6, 0, 0, TAU); ctx.fillStyle = '#a8743a'; ctx.fill(); ctx.stroke();
    ctx.restore();
  };

  S.cart = function (ctx, x, y, size, shake) {
    ctx.save();
    ctx.translate(x + Math.sin(shake * 55) * Math.min(1, shake) * 2, y);
    ctx.scale(size, size);
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(0, 0, 54, 7, 0, 0, TAU); ctx.fill();
    // pértigo
    ctx.strokeStyle = '#5a3d22'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(30, -36); ctx.lineTo(62, -10); ctx.stroke();
    // caja
    ctx.fillStyle = '#9a6b3a'; ctx.fillRect(-40, -52, 76, 16);
    ctx.lineWidth = 1.5; ctx.strokeStyle = OUT; ctx.strokeRect(-40, -52, 76, 16);
    ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1;
    ctx.beginPath(); for (let i = -32; i < 36; i += 9) { ctx.moveTo(i, -52); ctx.lineTo(i, -36); } ctx.stroke();
    // paja
    ctx.fillStyle = '#e0c15a';
    ctx.beginPath(); ctx.moveTo(-38, -52); ctx.quadraticCurveTo(-22, -78, 0, -70); ctx.quadraticCurveTo(22, -78, 34, -52); ctx.closePath(); ctx.fill();
    ctx.lineWidth = 1.2; ctx.strokeStyle = OUT; ctx.stroke();
    // rueda grande
    ctx.beginPath(); ctx.arc(-4, -24, 24, 0, TAU); ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = '#5a3d22'; ctx.stroke();
    ctx.lineWidth = 1.6; ctx.strokeStyle = '#7a5530';
    ctx.beginPath();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.moveTo(-4, -24); ctx.lineTo(-4 + Math.cos(a) * 22, -24 + Math.sin(a) * 22); }
    ctx.stroke();
    ctx.beginPath(); ctx.arc(-4, -24, 4, 0, TAU); ctx.fillStyle = '#3a2a1c'; ctx.fill();
    ctx.restore();
  };

  S.ombu = function (ctx, x, y, size, shake) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size, size);
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(0, 0, 70, 10, 0, 0, TAU); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-38, 0); ctx.quadraticCurveTo(-18, -8, -16, -34); ctx.lineTo(-12, -78);
    ctx.lineTo(14, -78); ctx.lineTo(18, -34); ctx.quadraticCurveTo(22, -8, 42, 0); ctx.closePath();
    ctx.fillStyle = '#7a6040'; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(-6, -4); ctx.quadraticCurveTo(-8, -40, -4, -74); ctx.moveTo(8, -4); ctx.quadraticCurveTo(10, -40, 6, -74); ctx.stroke();
    const sway = Math.sin(shake * 55) * Math.min(1, shake) * 2;
    const cs = [[-62, -96, 40], [-26, -122, 46], [22, -126, 46], [62, -98, 40], [0, -100, 52], [-40, -80, 30], [42, -80, 30]];
    ctx.fillStyle = '#2f5a2b';
    for (const c of cs) { ctx.beginPath(); ctx.arc(c[0] + sway, c[1] + 4, c[2], 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#44803a';
    for (const c of cs) { ctx.beginPath(); ctx.arc(c[0] + sway, c[1], c[2] - 2, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#62a050';
    for (const c of cs) { ctx.beginPath(); ctx.arc(c[0] - 8 + sway, c[1] - 12, c[2] * 0.4, 0, TAU); ctx.fill(); }
    ctx.restore();
  };

  S.pyramid = function (ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size, size);
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(0, 0, 54, 9, 0, 0, TAU); ctx.fill();
    // reja
    ctx.strokeStyle = '#26262c'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.ellipse(0, -2, 48, 8, 0, 0, TAU); ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < 24; i++) { const a = i * TAU / 24; ctx.moveTo(Math.cos(a) * 48, -2 + Math.sin(a) * 8); ctx.lineTo(Math.cos(a) * 48, -14 + Math.sin(a) * 8); }
    ctx.stroke();
    // zócalo + obelisco
    ctx.fillStyle = '#ece6d4'; ctx.fillRect(-26, -22, 52, 22);
    ctx.lineWidth = 1.5; ctx.strokeStyle = OUT; ctx.strokeRect(-26, -22, 52, 22);
    ctx.fillRect(-20, -34, 40, 12); ctx.strokeRect(-20, -34, 40, 12);
    ctx.beginPath(); ctx.moveTo(-13, -34); ctx.lineTo(-5, -108); ctx.lineTo(5, -108); ctx.lineTo(13, -34); ctx.closePath();
    ctx.fillStyle = '#f7f2e4'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,.10)'; ctx.beginPath(); ctx.moveTo(2, -34); ctx.lineTo(5, -108); ctx.lineTo(13, -34); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e8c246'; ctx.beginPath(); ctx.arc(0, -112, 5, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.restore();
  };

  S.lamp = function (ctx, x, y, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 3, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#26262c'; ctx.fillRect(-2, -78, 4, 78); ctx.fillRect(-5, -6, 10, 6);
    ctx.fillRect(-9, -84, 18, 4);
    ctx.fillStyle = '#e8d78a'; ctx.fillRect(-7, -104, 14, 20);
    ctx.fillStyle = '#26262c'; ctx.fillRect(-9, -108, 18, 4); ctx.fillRect(-9, -85, 18, 2);
    ctx.fillStyle = 'rgba(255,240,170,.2)'; ctx.beginPath(); ctx.arc(0, -94, 14, 0, TAU); ctx.fill();
    ctx.restore();
  };
})();
