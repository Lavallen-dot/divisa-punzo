/* art.js : todo el dibujo de personajes, banderas, divisas y globos de texto.
   Los personajes se dibujan por código (no hay imágenes), así que el juego
   funciona abriendo index.html directamente, sin servidor ni instalar nada. */
(function () {
  const U = DP.U, RED = DP.RED, RED_DARK = DP.RED_DARK;
  const A = DP.Art = {};
  const OUT = '#2a1a14';
  const TAU = Math.PI * 2;

  /* ------------------------------------------------------------------
     BANDERAS (de otros países, nada de rojo en la ropa de la gente)
     ------------------------------------------------------------------ */
  const FW = 36, FH = 24;
  const flagCache = {};
  A.FLAG_IDS = ['br', 'py', 'es', 'uy', 'gb', 'fr', 'cl', 'pt', 'us'];

  function flagCanvas(id) {
    if (flagCache[id]) return flagCache[id];
    const c = U.makeCanvas(FW, FH), g = c.getContext('2d');
    const stripes = (cols, vertical) => {
      const n = cols.length;
      for (let i = 0; i < n; i++) {
        g.fillStyle = cols[i];
        if (vertical) g.fillRect(i * FW / n, 0, FW / n + 0.6, FH);
        else g.fillRect(0, i * FH / n, FW, FH / n + 0.6);
      }
    };
    switch (id) {
      case 'br':
        g.fillStyle = '#1b9b3b'; g.fillRect(0, 0, FW, FH);
        g.fillStyle = '#ffd91e';
        g.beginPath(); g.moveTo(FW / 2, 2); g.lineTo(FW - 3, FH / 2); g.lineTo(FW / 2, FH - 2); g.lineTo(3, FH / 2); g.closePath(); g.fill();
        g.fillStyle = '#0b4f9c'; g.beginPath(); g.arc(FW / 2, FH / 2, 6.3, 0, TAU); g.fill();
        g.strokeStyle = '#fff'; g.lineWidth = 1.3; g.beginPath(); g.arc(FW / 2, FH / 2 + 8, 9, Math.PI * 1.22, Math.PI * 1.78); g.stroke();
        break;
      case 'py':
        stripes(['#d52b1e', '#ffffff', '#0038a8']);
        g.fillStyle = '#8a8a8a'; g.beginPath(); g.arc(FW / 2, FH / 2, 3, 0, TAU); g.fill();
        g.fillStyle = '#e6c84a'; g.beginPath(); g.arc(FW / 2, FH / 2, 1.4, 0, TAU); g.fill();
        break;
      case 'es':
        stripes(['#aa151b', '#aa151b', '#f1bf00', '#f1bf00', '#f1bf00', '#f1bf00', '#aa151b', '#aa151b']);
        g.fillStyle = '#9a6a2a'; g.fillRect(8, 8, 6, 8);
        g.fillStyle = '#c9a23a'; g.fillRect(9, 9, 4, 3);
        break;
      case 'uy':
        for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? '#2a5db0' : '#ffffff'; g.fillRect(0, i * FH / 9, FW, FH / 9 + 0.6); }
        g.fillStyle = '#ffffff'; g.fillRect(0, 0, 15, 13);
        g.fillStyle = '#f2c230'; g.beginPath(); g.arc(7.5, 6.5, 4, 0, TAU); g.fill();
        break;
      case 'gb':
        g.fillStyle = '#1b2f7a'; g.fillRect(0, 0, FW, FH);
        g.strokeStyle = '#fff'; g.lineWidth = 5;
        g.beginPath(); g.moveTo(0, 0); g.lineTo(FW, FH); g.moveTo(FW, 0); g.lineTo(0, FH); g.stroke();
        g.strokeStyle = '#c8102e'; g.lineWidth = 2;
        g.beginPath(); g.moveTo(0, 0); g.lineTo(FW, FH); g.moveTo(FW, 0); g.lineTo(0, FH); g.stroke();
        g.fillStyle = '#fff'; g.fillRect(FW / 2 - 4.5, 0, 9, FH); g.fillRect(0, FH / 2 - 4.5, FW, 9);
        g.fillStyle = '#c8102e'; g.fillRect(FW / 2 - 2.4, 0, 4.8, FH); g.fillRect(0, FH / 2 - 2.4, FW, 4.8);
        break;
      case 'fr':
        stripes(['#1d4fa3', '#ffffff', '#e23b2f'], true);
        break;
      case 'cl':
        g.fillStyle = '#ffffff'; g.fillRect(0, 0, FW, FH / 2);
        g.fillStyle = '#d52b1e'; g.fillRect(0, FH / 2, FW, FH / 2);
        g.fillStyle = '#1b3fa0'; g.fillRect(0, 0, FW / 3, FH / 2);
        g.fillStyle = '#fff'; g.beginPath(); g.arc(6, 6, 2.4, 0, TAU); g.fill();
        break;
      case 'pt':
        g.fillStyle = '#ffffff'; g.fillRect(0, 0, FW / 2, FH);
        g.fillStyle = '#1b3f9a'; g.fillRect(FW / 2, 0, FW / 2, FH);
        g.fillStyle = '#b32a2a'; g.beginPath(); g.arc(FW / 2, FH / 2, 5, 0, TAU); g.fill();
        g.fillStyle = '#e6c84a'; g.beginPath(); g.arc(FW / 2, FH / 2, 2.2, 0, TAU); g.fill();
        break;
      case 'us':
        for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#ffffff' : '#c8283a'; g.fillRect(0, i * FH / 13, FW, FH / 13 + 0.5); }
        g.fillStyle = '#1b2f6e'; g.fillRect(0, 0, 16, 13);
        g.fillStyle = '#fff';
        for (let r = 0; r < 3; r++) for (let q = 0; q < 4; q++) g.fillRect(2 + q * 3.6, 2 + r * 3.4, 1.4, 1.4);
        break;
      case 'ar':
        stripes(['#74acdf', '#ffffff', '#74acdf']);
        g.fillStyle = '#f6b40e'; g.beginPath(); g.arc(FW / 2, FH / 2, 3, 0, TAU); g.fill();
        break;
      case 'red':
        g.fillStyle = RED; g.fillRect(0, 0, FW, FH);
        g.fillStyle = RED_DARK; g.fillRect(0, FH - 4, FW, 4);
        g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(6, 8, 24, 2); g.fillRect(9, 12, 18, 2);
        break;
      default:
        g.fillStyle = '#888'; g.fillRect(0, 0, FW, FH);
    }
    flagCache[id] = c;
    return c;
  }

  /* bandera flameando: el borde izquierdo está en (x,y) */
  A.flag = function (ctx, id, x, y, w, h, t, redAmt) {
    redAmt = redAmt || 0;
    const draw = (cv, alpha) => {
      if (alpha <= 0.02) return;
      ctx.globalAlpha = alpha;
      const slices = 8, sw = cv.width / slices, dw = w / slices;
      for (let i = 0; i < slices; i++) {
        const off = Math.sin(t * 7 + i * 0.9) * 1.4 * (i / slices + 0.15);
        ctx.drawImage(cv, i * sw, 0, sw, cv.height, x + i * dw, y + off, dw + 0.7, h);
      }
      ctx.globalAlpha = 1;
    };
    draw(flagCanvas(id), 1 - redAmt);
    draw(flagCanvas('red'), redAmt);
  };

  /* ------------------------------------------------------------------
     DIVISA PUNZÓ (la cinta roja). rot: ángulo; el largo va sobre +x
     ------------------------------------------------------------------ */
  A.ribbon = function (ctx, x, y, len, wid, rot, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    const fl = Math.sin(t * 22) * wid * 0.35;
    ctx.beginPath();
    ctx.moveTo(len / 2, -wid / 2);
    ctx.lineTo(-len / 2, -wid / 2 + fl * 0.6);
    ctx.lineTo(-len / 2 + wid * 0.9, fl * 0.3);
    ctx.lineTo(-len / 2, wid / 2 + fl);
    ctx.lineTo(len / 2, wid / 2);
    ctx.closePath();
    ctx.fillStyle = '#e0121a';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = RED_DARK;
    ctx.stroke();
    // estampado negro (retrato + leyenda)
    ctx.fillStyle = '#16100e';
    ctx.beginPath(); ctx.ellipse(len * 0.28, 0, wid * 0.32, wid * 0.32, 0, 0, TAU); ctx.fill();
    ctx.fillRect(-len * 0.28, -wid * 0.25, len * 0.34, wid * 0.14);
    ctx.fillRect(-len * 0.28, wid * 0.08, len * 0.26, wid * 0.14);
    ctx.restore();
  };

  /* ------------------------------------------------------------------
     helpers de dibujo
     ------------------------------------------------------------------ */
  function limb(ctx, x1, y1, x2, y2, w, color) {
    ctx.lineCap = 'round';
    ctx.strokeStyle = OUT; ctx.lineWidth = w + 2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.strokeStyle = color; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  function blob(ctx, x, y, rx, ry, fill, rot) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, TAU);
    ctx.fillStyle = fill; ctx.fill();
    ctx.lineWidth = 1.4; ctx.strokeStyle = OUT; ctx.stroke();
  }
  function star(ctx, x, y, r, rot, fill) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = rot + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
  }
  A.star = star;

  /* ------------------------------------------------------------------
     PERSONAS (ciudadanos, soldados, escolta y constituyentes)
     e: x,y,s,dir,phase,moving,redAmt,kind,look,col,mood,hop,lean,
        flagId,cheer,working,workT,throwT,block,stun,alarm
     ------------------------------------------------------------------ */
  A.person = function (ctx, e, t) {
    const s = e.s, d = e.dir, red = e.redAmt || 0;
    const col = e.col, look = e.look || {};
    const kind = e.kind;                       // civil | soldier | escort | const
    const C = (c) => U.mix(c, RED, red);
    const mv = e.moving || 0;
    const ph = e.phase || 0;
    const sw = Math.sin(ph) * 7 * mv;
    const bob = Math.abs(Math.sin(ph)) * 1.5 * mv + (e.hop || 0);
    const isConst = kind === 'const';
    const isSoldier = kind === 'soldier';
    const isEscort = kind === 'escort';

    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.scale(s, s);

    // sombra
    ctx.fillStyle = 'rgba(0,0,0,.22)';
    ctx.beginPath(); ctx.ellipse(0, 0, isConst ? 13 : 11, 3.6, 0, 0, TAU); ctx.fill();

    ctx.save();
    ctx.scale(d, 1);

    /* ---- piernas ---- */
    const pantsCol = isEscort ? C('#a31018') : isSoldier ? '#ebe8dc' : isConst ? '#26262c' : col.pants;
    const hipY = -16 - bob;
    const lift1 = Math.max(0, -Math.cos(ph)) * 3 * mv;
    const lift2 = Math.max(0, Math.cos(ph)) * 3 * mv;
    if (!look.skirt) {
      limb(ctx, -3, hipY, -3 - sw, -1.5 - lift1, 5, pantsCol);
      limb(ctx, 3, hipY, 3 + sw, -1.5 - lift2, 5, pantsCol);
    } else {
      limb(ctx, -2.5, hipY, -2.5 - sw * 0.6, -1.5, 4, '#8a6a52');
      limb(ctx, 2.5, hipY, 2.5 + sw * 0.6, -1.5, 4, '#8a6a52');
    }
    // zapatos
    const shoe = (isEscort || isSoldier || isConst) ? '#14100e' : (col.shoe || '#3a2a20');
    ctx.fillStyle = shoe;
    ctx.beginPath(); ctx.ellipse(-3 - sw + 1.5, -1.2 - lift1, 3.6, 2, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(3 + sw + 1.5, -1.2 - lift2, 3.6, 2, 0, 0, TAU); ctx.fill();

    /* ---- cuerpo superior (gira desde la cadera si se inclina) ---- */
    ctx.save();
    ctx.translate(0, -16 - bob);
    ctx.rotate(e.lean || 0);
    ctx.translate(0, 16);

    // accesorios que van detrás del cuerpo
    if (look.acc === 'barrel') {
      ctx.save(); ctx.translate(-10, -29); ctx.rotate(-0.25);
      ctx.fillStyle = '#8a5a2b'; ctx.fillRect(-6, -9, 12, 18);
      ctx.strokeStyle = OUT; ctx.lineWidth = 1.2; ctx.strokeRect(-6, -9, 12, 18);
      ctx.fillStyle = '#3d3a38'; ctx.fillRect(-6, -5, 12, 2); ctx.fillRect(-6, 3, 12, 2);
      ctx.fillStyle = '#6fa8d8'; // gotas
      const dp = (t * 3 + (e.phase || 0)) % 1;
      ctx.beginPath(); ctx.arc(-5, 10 + dp * 6, 1.3, 0, TAU); ctx.fill();
      ctx.restore();
    } else if (look.acc === 'sack') {
      ctx.save(); ctx.translate(-9, -40); ctx.rotate(0.35);
      blob(ctx, 0, 0, 8, 6, '#cdb98a', 0.3);
      ctx.restore();
    }

    // falda / ropa larga
    if (look.skirt) {
      const sway = Math.sin(ph) * 2 * mv;
      ctx.beginPath();
      ctx.moveTo(-6.5, -26); ctx.lineTo(6.5, -26);
      ctx.lineTo(11 + sway, -5); ctx.quadraticCurveTo(0 + sway, -2, -11 + sway, -5);
      ctx.closePath();
      ctx.fillStyle = C(col.skirt); ctx.fill();
      ctx.lineWidth = 1.4; ctx.strokeStyle = OUT; ctx.stroke();
      if (look.apron) { ctx.fillStyle = '#f4f0e4'; ctx.fillRect(-4 + sway * 0.3, -22, 8, 14); }
    }

    // torso
    let torsoCol;
    if (isEscort) torsoCol = C('#bd141b');
    else if (isSoldier) torsoCol = C('#2b3f73');
    else if (isConst) torsoCol = C('#1d1d22');
    else torsoCol = C(look.skirt ? col.shirt : col.shirt);
    const tw = isConst ? 16 : 14;
    U.rr(ctx, -tw / 2, -35, tw, 20, 4);
    ctx.fillStyle = torsoCol; ctx.fill();
    ctx.lineWidth = 1.4; ctx.strokeStyle = OUT; ctx.stroke();

    if (look.stripes) {
      ctx.fillStyle = C(col.shirt2);
      for (let i = 0; i < 4; i++) ctx.fillRect(-6.5, -33 + i * 5, 13, 2);
    }
    if (look.poncho) {
      ctx.beginPath();
      ctx.moveTo(-5, -36); ctx.lineTo(5, -36); ctx.lineTo(10, -17); ctx.lineTo(-10, -17);
      ctx.closePath();
      ctx.fillStyle = C(col.poncho); ctx.fill();
      ctx.lineWidth = 1.4; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(-9, -20, 18, 2);
    }
    if (isSoldier || isEscort) {
      // correas cruzadas + botones
      ctx.strokeStyle = '#f4f1e6'; ctx.lineWidth = 2.2; ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.moveTo(-6, -34); ctx.lineTo(6, -17); ctx.moveTo(6, -34); ctx.lineTo(-6, -17); ctx.stroke();
      ctx.fillStyle = '#e8c246';
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, -31 + i * 5.5, 1, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#e8c246'; ctx.fillRect(4, -36, 4, 2.4); ctx.fillRect(-8, -36, 4, 2.4);
    }
    if (isConst) {
      // camisa blanca + moño
      ctx.beginPath(); ctx.moveTo(-3.2, -35); ctx.lineTo(3.2, -35); ctx.lineTo(0, -22); ctx.closePath();
      ctx.fillStyle = '#f2efe6'; ctx.fill();
      ctx.fillStyle = '#111'; ctx.fillRect(-3, -35.5, 6, 2.6);
    }
    // la divisa prendida al pecho cuando ya es punzó
    if (red > 0.5) {
      ctx.save(); ctx.globalAlpha = Math.min(1, (red - 0.5) * 2);
      ctx.translate(3.5, -28); ctx.rotate(0.15);
      ctx.fillStyle = '#ff2a2f'; ctx.fillRect(-2, -5, 4, 11);
      ctx.fillStyle = '#16100e'; ctx.fillRect(-1, -2, 2, 2.6);
      ctx.restore();
    }

    /* ---- brazos ---- */
    const sleeve = isEscort ? C('#bd141b') : isSoldier ? C('#2b3f73') : isConst ? C('#1d1d22') : C(col.shirt);
    const hasFlag = !!e.flagId;
    const flagHandY = e.cheer ? -45 : -26;
    // brazo trasero
    let bx = -4 + sw * 0.35, by = -23;
    if (look.acc === 'broom') {
      const swp = e.working ? Math.sin((e.workT || 0) * 6) * 5 : 0;
      bx = 6 + swp * 0.4; by = -24;
      limb(ctx, -4, -32, bx, by, 4, sleeve);
      limb(ctx, bx, by, 14 + swp, -2, 2.4, '#7a5a30');
      ctx.beginPath(); ctx.moveTo(11 + swp, -5); ctx.lineTo(19 + swp, -5); ctx.lineTo(18 + swp, 0); ctx.lineTo(12 + swp, 0); ctx.closePath();
      ctx.fillStyle = '#d9c070'; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = OUT; ctx.stroke();
    } else if (isConst) {
      // sostiene el libro con las dos manos
      const up = e.block ? 1 : 0;
      limb(ctx, -5, -32, 5 + up * 2, -26 - up * 12, 4, sleeve);
    } else if ((isEscort || (e.throwT || 0) > 0) && !hasFlag && (e.throwT || 0) > 0) {
      const a = -1.1 + (1 - e.throwT) * 1.7;
      limb(ctx, -4, -32, -4 + Math.cos(a) * 13, -32 + Math.sin(a) * 13, 4, sleeve);
    } else {
      limb(ctx, -5, -32, bx, by, 4, sleeve);
      ctx.fillStyle = col.skin; ctx.beginPath(); ctx.arc(bx, by, 2.2, 0, TAU); ctx.fill();
    }

    /* ---- cabeza ---- */
    const hy = -42;
    // pelo de atrás
    if (!isConst && col.hair) {
      ctx.fillStyle = col.hair;
      ctx.beginPath(); ctx.arc(-1.4, hy - 0.4, 7, 0, TAU); ctx.fill();
      if (look.skirt) { ctx.beginPath(); ctx.ellipse(-4.5, hy + 7, 3.6, 8, 0.15, 0, TAU); ctx.fill(); }
    }
    ctx.beginPath(); ctx.arc(0, hy, 6.6, 0, TAU);
    ctx.fillStyle = col.skin; ctx.fill();
    ctx.lineWidth = 1.4; ctx.strokeStyle = OUT; ctx.stroke();
    // nariz
    ctx.fillStyle = col.skin;
    ctx.beginPath(); ctx.arc(6.5, hy + 1.2, 1.6, 0, TAU); ctx.fill();
    ctx.lineWidth = 1; ctx.stroke();
    // patillas / calva del constituyente
    if (isConst) {
      ctx.fillStyle = '#d9d6cf';
      ctx.beginPath(); ctx.arc(-4.5, hy + 1.5, 2.6, 0, TAU); ctx.fill();
      ctx.fillRect(-1, hy + 3, 6, 2.4); // bigote
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      ctx.beginPath(); ctx.ellipse(-1, hy - 4.5, 3, 1.4, 0, 0, TAU); ctx.fill();
    } else if (col.hair) {
      ctx.fillStyle = col.hair;
      ctx.beginPath(); ctx.arc(-0.5, hy - 0.8, 6.9, Math.PI * 1.02, Math.PI * 1.85); ctx.fill();
    }
    // cara
    const mood = e.mood || 'calm';
    if (mood === 'alarm') {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(1.7, hy - 0.6, 2, 0, TAU); ctx.arc(4.9, hy - 0.6, 2, 0, TAU); ctx.fill();
      ctx.fillStyle = '#1a1210';
      ctx.beginPath(); ctx.arc(2.2, hy - 0.6, 0.9, 0, TAU); ctx.arc(5.4, hy - 0.6, 0.9, 0, TAU); ctx.fill();
      ctx.fillStyle = '#5a1515'; ctx.beginPath(); ctx.ellipse(3.6, hy + 3.6, 1.3, 1.8, 0, 0, TAU); ctx.fill();
    } else {
      ctx.fillStyle = '#1a1210';
      ctx.beginPath(); ctx.arc(1.8, hy - 0.5, 0.95, 0, TAU); ctx.arc(5, hy - 0.5, 0.95, 0, TAU); ctx.fill();
      if (mood === 'shout') {
        ctx.fillStyle = '#5a1515'; ctx.beginPath(); ctx.ellipse(3.6, hy + 3.4, 1.9, 2.2, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = OUT; ctx.lineWidth = 0.8; ctx.stroke();
      } else if (mood === 'grim') {
        ctx.strokeStyle = '#1a1210'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(1.4, hy - 2.6); ctx.lineTo(3.4, hy - 1.8); ctx.moveTo(4.4, hy - 1.8); ctx.lineTo(6.4, hy - 2.6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(2, hy + 3.6); ctx.lineTo(5.2, hy + 3.6); ctx.stroke();
      } else {
        ctx.strokeStyle = '#7a3a2a'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(2.4, hy + 3.4); ctx.lineTo(5, hy + 3.4); ctx.stroke();
      }
    }

    /* ---- sombrero ---- */
    const hat = isEscort ? 'redcap' : isSoldier ? 'shako' : isConst ? null : look.hat;
    if (hat === 'straw') {
      blob(ctx, 0, hy - 5, 11, 2.8, '#dcc27a');
      ctx.beginPath(); ctx.ellipse(0, hy - 8, 6, 4.2, 0, Math.PI, 0); ctx.fillStyle = '#dcc27a'; ctx.fill(); ctx.stroke();
      ctx.fillStyle = C('#5a4630'); ctx.fillRect(-6, hy - 7, 12, 1.8);
    } else if (hat === 'sombrero') {
      blob(ctx, 0, hy - 5, 12, 3, C(col.hat));
      ctx.beginPath(); ctx.ellipse(0, hy - 8.5, 5.6, 4.6, 0, Math.PI, 0); ctx.fillStyle = C(col.hat); ctx.fill(); ctx.stroke();
    } else if (hat === 'kerchief') {
      ctx.beginPath(); ctx.arc(-0.3, hy - 1, 7, Math.PI * 0.98, Math.PI * 1.98);
      ctx.lineTo(-7, hy + 0.5); ctx.closePath();
      ctx.fillStyle = C(col.hat); ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.beginPath(); ctx.arc(-7.5, hy - 1, 2.4, 0, TAU); ctx.fillStyle = C(col.hat); ctx.fill(); ctx.stroke();
    } else if (hat === 'cap') {
      ctx.beginPath(); ctx.ellipse(0, hy - 5, 7, 4, 0, Math.PI, 0); ctx.fillStyle = C(col.hat); ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.fillStyle = C(col.hat); ctx.fillRect(1, hy - 5.6, 9, 2.4); ctx.strokeRect(1, hy - 5.6, 9, 2.4);
    } else if (hat === 'tophat') {
      blob(ctx, 0, hy - 5.5, 9, 2.2, C(col.hat));
      ctx.fillStyle = C(col.hat); ctx.fillRect(-5.5, hy - 17, 11, 12);
      ctx.lineWidth = 1.2; ctx.strokeStyle = OUT; ctx.strokeRect(-5.5, hy - 17, 11, 12);
      ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(-5.5, hy - 8, 11, 2);
    } else if (hat === 'knit') {
      ctx.beginPath(); ctx.ellipse(0, hy - 4.5, 7, 5, 0, Math.PI, 0); ctx.fillStyle = C(col.hat); ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.fillStyle = '#f2f2f2'; ctx.fillRect(-7, hy - 5.4, 14, 2.2);
    } else if (hat === 'mantilla') {
      ctx.fillStyle = C(col.hat);
      ctx.beginPath(); ctx.arc(-0.3, hy - 1, 7.2, Math.PI * 0.98, Math.PI * 1.98); ctx.lineTo(-8, hy + 14); ctx.lineTo(-4, hy + 14); ctx.lineTo(-5, hy); ctx.closePath(); ctx.fill();
      ctx.lineWidth = 1.2; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.fillStyle = '#d9c070'; ctx.fillRect(-3, hy - 12, 6, 6); ctx.strokeRect(-3, hy - 12, 6, 6);
    } else if (hat === 'shako') {
      ctx.fillStyle = '#1b1b1f'; ctx.fillRect(-5.5, hy - 17, 11, 12);
      ctx.lineWidth = 1.2; ctx.strokeStyle = OUT; ctx.strokeRect(-5.5, hy - 17, 11, 12);
      ctx.fillStyle = '#1b1b1f'; ctx.fillRect(0, hy - 6.4, 9, 2.2);
      ctx.fillStyle = '#e8c246'; ctx.beginPath(); ctx.arc(0.5, hy - 11, 2.2, 0, TAU); ctx.fill();
      ctx.fillStyle = C('#f4f1e6'); ctx.beginPath(); ctx.ellipse(0, hy - 19, 2.6, 4, 0, 0, TAU); ctx.fill(); ctx.stroke();
    } else if (hat === 'redcap') {
      ctx.beginPath();
      ctx.moveTo(-6.4, hy - 4.5); ctx.lineTo(-4.4, hy - 16); ctx.lineTo(5.4, hy - 16); ctx.lineTo(7, hy - 4.5); ctx.closePath();
      ctx.fillStyle = '#d4141c'; ctx.fill(); ctx.lineWidth = 1.3; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.fillStyle = '#16100e'; ctx.fillRect(-6.6, hy - 6.8, 13.8, 2.6);
      ctx.fillStyle = '#16100e'; ctx.fillRect(2, hy - 5, 8, 1.8);
    }

    /* ---- accesorios delante del cuerpo ---- */
    if (look.acc === 'basket') {
      blob(ctx, 0, hy - 8, 9, 3.2, '#b88a44');
      ctx.beginPath(); ctx.ellipse(0, hy - 10.5, 7, 4.4, 0, Math.PI, 0); ctx.fillStyle = '#f2efe4'; ctx.fill(); ctx.stroke();
    } else if (look.acc === 'tray') {
      ctx.strokeStyle = '#5a3d22'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(-3, -35); ctx.lineTo(8, -24); ctx.stroke();
      ctx.fillStyle = '#9a6b3a'; ctx.fillRect(3, -24, 16, 3.4);
      ctx.strokeStyle = OUT; ctx.strokeRect(3, -24, 16, 3.4);
      ctx.fillStyle = '#e8c35a';
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(7 + i * 4.6, -26.6, 2.1, 1.9, 0, 0, TAU); ctx.fill(); }
    } else if (look.acc === 'lantern') {
      ctx.fillStyle = '#2a2a2a'; ctx.fillRect(9, -23, 7, 9);
      ctx.fillStyle = '#ffd96a'; ctx.fillRect(10, -22, 5, 6);
      ctx.fillStyle = 'rgba(255,230,140,.25)'; ctx.beginPath(); ctx.arc(12.5, -19, 8, 0, TAU); ctx.fill();
      limb(ctx, 5, -30, 12.5, -24, 3.6, sleeve);
    } else if (look.acc === 'rope') {
      ctx.strokeStyle = '#cdb77e'; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.ellipse(-6, -21, 4.5, 3.4, 0.3, 0, TAU); ctx.stroke();
    } else if (look.acc === 'fan') {
      ctx.fillStyle = '#e9d58a';
      ctx.beginPath(); ctx.moveTo(10, -26); ctx.arc(10, -26, 8, -1.4, -0.2); ctx.closePath(); ctx.fill();
      ctx.lineWidth = 1; ctx.strokeStyle = OUT; ctx.stroke();
    }
    if (isSoldier) {
      // fusil al hombro
      ctx.strokeStyle = OUT; ctx.lineWidth = 4.2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-8, -20); ctx.lineTo(10, -56); ctx.stroke();
      ctx.strokeStyle = '#7a5530'; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(-8, -20); ctx.lineTo(0, -36); ctx.stroke();
      ctx.strokeStyle = '#9aa0a6'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, -36); ctx.lineTo(10, -56); ctx.stroke();
    }
    if (isConst) {
      // el libro de la Constitución
      const up = e.block ? 1 : 0;
      ctx.save();
      ctx.translate(11, -27 - up * 14);
      ctx.rotate(-0.08 - up * 0.1);
      ctx.fillStyle = '#efe6c8'; ctx.fillRect(-9, -8, 18, 16);
      ctx.lineWidth = 1.4; ctx.strokeStyle = OUT; ctx.strokeRect(-9, -8, 18, 16);
      ctx.fillStyle = C('#d8cda8'); ctx.fillRect(-9, -8, 2.6, 16);
      // escudo
      ctx.beginPath(); ctx.arc(1, -2.5, 3.8, 0, Math.PI); ctx.lineTo(-2.8, -2.5); ctx.closePath();
      ctx.fillStyle = '#74acdf'; ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillRect(-2.8, -3.2, 7.6, 1.8);
      ctx.fillStyle = '#e8b830'; ctx.beginPath(); ctx.arc(1, -6, 1.2, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(40,30,20,.55)'; ctx.fillRect(-4, 3.2, 11, 1.1); ctx.fillRect(-4, 5.4, 8, 1.1);
      ctx.restore();
      // manos
      ctx.fillStyle = col.skin; ctx.beginPath(); ctx.arc(5 + up * 2, -26 - up * 12, 2.2, 0, TAU); ctx.fill();
    }

    // brazo delantero (el de la bandera)
    if (hasFlag) {
      limb(ctx, 5, -32, 9, flagHandY, 4, sleeve);
      ctx.fillStyle = col.skin; ctx.beginPath(); ctx.arc(9, flagHandY, 2.3, 0, TAU); ctx.fill();
    } else if (!isConst && !look.acc) {
      limb(ctx, 5, -32, 5 - sw * 0.35, -23, 4, sleeve);
    }
    ctx.restore(); // fin cuerpo superior
    ctx.restore(); // fin flip

    /* ---- asta y bandera (fuera del flip, siempre flamea hacia la derecha) ---- */
    if (hasFlag) {
      const sx = d * 9, sy = flagHandY - bob;
      ctx.strokeStyle = '#5a3d22'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(sx, sy + 8); ctx.lineTo(sx, sy - 46); ctx.stroke();
      ctx.fillStyle = '#e8c246'; ctx.beginPath(); ctx.arc(sx, sy - 47, 1.8, 0, TAU); ctx.fill();
      A.flag(ctx, e.flagId, sx + 1, sy - 45, 22, 14.5, t + (e.phase || 0), red);
    }

    /* ---- marcas de estado ---- */
    if ((e.alarm || 0) > 0 && !isConst) {
      ctx.fillStyle = '#ffd23a';
      ctx.beginPath(); ctx.arc(-d * 12, -58, 5, 0, TAU); ctx.fill();
      ctx.lineWidth = 1.2; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.fillStyle = '#7a1010'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('!', -d * 12, -55.2);
    }
    if ((e.stun || 0) > 0) {
      for (let i = 0; i < 3; i++) {
        const a = t * 6 + i * TAU / 3;
        star(ctx, Math.cos(a) * 9, -57 + Math.sin(a) * 3, 3.2, a, '#ffd23a');
      }
    }
    ctx.restore();
  };

  /* ------------------------------------------------------------------
     EL JINETE (personaje principal) a caballo
     e: x,y,s,dir,phase,moving(0..1),throwT,aim,hatT,slow
     ------------------------------------------------------------------ */
  A.rider = function (ctx, e, t) {
    const amp = 0.2 + 0.8 * Math.min(1, e.moving || 0);
    const ph = e.phase || 0;
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.scale(e.s, e.s);

    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.beginPath(); ctx.ellipse(0, 0, 38, 6.5, 0, 0, TAU); ctx.fill();

    ctx.scale(e.dir, 1);
    const coat = '#a9592b', coatDark = '#7f3f1d';
    const hipY = -27;

    function horseLeg(hx, phase, far, sock) {
      const a = Math.sin(phase) * 0.75 * amp;
      const fold = Math.max(0, Math.cos(phase)) * amp;
      const kx = hx + Math.sin(a) * 13, ky = hipY + Math.cos(a) * 13;
      const b = a - 0.9 * fold;
      const fx = kx + Math.sin(b) * 13;
      const fy = Math.min(-1, ky + Math.cos(b) * 13 - fold * 7);
      const c = far ? coatDark : coat;
      ctx.lineCap = 'round';
      ctx.strokeStyle = OUT; ctx.lineWidth = 7.2;
      ctx.beginPath(); ctx.moveTo(hx, hipY); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
      ctx.strokeStyle = c; ctx.lineWidth = 5.2;
      ctx.beginPath(); ctx.moveTo(hx, hipY); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
      if (sock) {
        const sx = fx - (fx - kx) * 0.38, sy = fy - (fy - ky) * 0.38;
        ctx.strokeStyle = '#f4f1ea'; ctx.lineWidth = 5.2;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(fx, fy); ctx.stroke();
      }
      ctx.fillStyle = '#1b1411'; ctx.beginPath(); ctx.ellipse(fx + 1, fy + 0.5, 3.4, 2, 0, 0, TAU); ctx.fill();
    }
    // patas del otro lado (más oscuras)
    horseLeg(-17, ph + Math.PI + 0.5, true, false);
    horseLeg(19, ph + 0.5, true, true);

    // cola
    const tw = Math.sin(t * 7 + ph) * 4 * (0.4 + amp);
    ctx.beginPath();
    ctx.moveTo(-26, -42);
    ctx.bezierCurveTo(-40, -44 + tw, -44, -30 + tw, -38 + tw * 0.5, -14);
    ctx.bezierCurveTo(-34, -26, -33, -36, -25, -36);
    ctx.closePath();
    ctx.fillStyle = '#2b1a12'; ctx.fill(); ctx.lineWidth = 1.4; ctx.strokeStyle = OUT; ctx.stroke();

    // cuerpo
    blob(ctx, 0, -35, 30, 13.5, coat);
    ctx.fillStyle = 'rgba(255,200,140,.18)';
    ctx.beginPath(); ctx.ellipse(2, -42, 22, 5, 0, 0, TAU); ctx.fill();
    blob(ctx, -21, -36, 11, 13, coat);
    blob(ctx, 21, -37, 10, 13, coat);

    // cuello + cabeza
    ctx.beginPath();
    ctx.moveTo(16, -46); ctx.lineTo(29, -68); ctx.lineTo(41, -62); ctx.lineTo(29, -30); ctx.closePath();
    ctx.fillStyle = coat; ctx.fill(); ctx.lineWidth = 1.4; ctx.strokeStyle = OUT; ctx.stroke();
    // crin
    ctx.strokeStyle = '#2b1a12'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(28, -69); ctx.quadraticCurveTo(22, -62, 16, -47); ctx.stroke();
    ctx.save(); ctx.translate(43, -58); ctx.rotate(0.62);
    blob(ctx, 0, 0, 12, 5.8, coat);
    ctx.strokeStyle = '#f4f1ea'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, -2); ctx.lineTo(8, 0.5); ctx.stroke();
    ctx.fillStyle = '#1a1210'; ctx.beginPath(); ctx.arc(-3, -1.8, 1.2, 0, TAU); ctx.fill();
    ctx.fillStyle = '#3a2418'; ctx.beginPath(); ctx.arc(10, 1.2, 1.3, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.fillStyle = coatDark;
    ctx.beginPath(); ctx.moveTo(33, -66); ctx.lineTo(35, -75); ctx.lineTo(39, -66); ctx.closePath(); ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = OUT; ctx.stroke();
    // plata del apero: cabezada y pechera
    ctx.strokeStyle = '#e6e9ee'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(37, -63); ctx.lineTo(47, -52); ctx.stroke();
    ctx.beginPath(); ctx.arc(48.5, -51, 2.2, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(34, -63, 1.8, 0, TAU); ctx.fillStyle = '#e6e9ee'; ctx.fill();
    ctx.strokeStyle = '#d6dae0'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(18, -50); ctx.quadraticCurveTo(30, -42, 28, -30); ctx.stroke();
    ctx.fillStyle = '#e6e9ee';
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(21 + i * 2.4, -45 + i * 4.5, 1.6, 0, TAU); ctx.fill(); }

    // patas del lado cercano
    horseLeg(-22, ph, false, false);
    horseLeg(15, ph + Math.PI + 0.5, false, true);

    // matras y silla
    ctx.fillStyle = '#2b3a58'; ctx.fillRect(-10, -50, 22, 10);
    ctx.strokeStyle = '#e9edf2'; ctx.lineWidth = 1.2; ctx.strokeRect(-10, -50, 22, 10);
    ctx.fillStyle = '#e9edf2';
    for (let i = 0; i < 6; i++) ctx.fillRect(-9 + i * 3.7, -40, 1.6, 3);
    // riendas
    ctx.strokeStyle = '#2a1a14'; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(47, -52); ctx.quadraticCurveTo(30, -48, 12, -60); ctx.stroke();

    /* ---- capa punzó flameando ---- */
    const w1 = Math.sin(t * 8 + ph) * 3 * (0.4 + amp), w2 = Math.sin(t * 8 + ph + 1.3) * 4 * (0.4 + amp), w3 = Math.sin(t * 8 + ph + 2.4) * 3 * (0.4 + amp);
    ctx.beginPath();
    ctx.moveTo(-1, -74);
    ctx.quadraticCurveTo(-20 + w1, -78, -38 + w1, -62 + w2);
    ctx.quadraticCurveTo(-46 + w2, -52, -40 + w3, -44 + w2);
    ctx.quadraticCurveTo(-30 + w3, -38, -22 + w1, -42 + w3);
    ctx.quadraticCurveTo(-12, -46, -4, -50);
    ctx.closePath();
    ctx.fillStyle = '#d4141c'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.strokeStyle = RED_DARK; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(-8, -68); ctx.quadraticCurveTo(-24 + w1, -64, -36 + w2, -52); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-6, -58); ctx.quadraticCurveTo(-18 + w2, -52, -28 + w3, -44); ctx.stroke();

    /* ---- sable ---- */
    ctx.strokeStyle = OUT; ctx.lineWidth = 3.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-3, -52); ctx.lineTo(-17, -27); ctx.stroke();
    ctx.strokeStyle = '#d6dbe0'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(-3, -52); ctx.lineTo(-17, -27); ctx.stroke();
    ctx.fillStyle = '#e8c246'; ctx.fillRect(-5, -56, 5, 5);

    /* ---- pierna y bota ---- */
    limb(ctx, 0, -52, 8, -42, 7, '#f4f1ea');
    limb(ctx, 8, -42, 6, -27, 6, '#17110f');
    ctx.fillStyle = '#17110f'; ctx.beginPath(); ctx.ellipse(9, -24.5, 5.2, 2.4, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#e6e9ee'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(6, -30); ctx.lineTo(6, -24); ctx.stroke();

    /* ---- torso ---- */
    U.rr(ctx, -6.5, -74, 14, 23, 4);
    ctx.fillStyle = '#1f2f55'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.fillStyle = '#d4141c'; ctx.fillRect(1.2, -73, 3, 21);
    ctx.fillStyle = '#e8c246';
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-1.4, -70 + i * 5, 0.95, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#e8c246'; ctx.fillRect(2, -76, 7, 3.6); ctx.fillRect(-9, -76, 5, 3.4);
    ctx.fillStyle = '#17110f'; ctx.fillRect(-6.5, -54, 14, 3);
    ctx.fillStyle = '#e8c246'; ctx.fillRect(-1, -54.2, 3, 3.4);

    /* ---- cabeza ---- */
    const hx = 1.5, hy = -83;
    ctx.fillStyle = '#f0c9a0';
    ctx.beginPath(); ctx.arc(hx, hy, 6.9, 0, TAU); ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.beginPath(); ctx.arc(hx + 6.8, hy + 1.2, 1.7, 0, TAU); ctx.fill(); ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#dcb872';        // pelo rubio + patillas
    ctx.beginPath(); ctx.arc(hx - 0.8, hy - 0.8, 7.2, Math.PI * 0.95, Math.PI * 1.9); ctx.fill();
    ctx.fillRect(hx - 6, hy - 1, 3.6, 8);
    ctx.fillRect(hx + 1.5, hy + 4.2, 5, 1.8);
    ctx.fillStyle = '#1a1210';
    ctx.beginPath(); ctx.arc(hx + 2.2, hy - 0.8, 1, 0, TAU); ctx.arc(hx + 5.3, hy - 0.8, 1, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#7a3a2a'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(hx + 2.8, hy + 3.2); ctx.lineTo(hx + 5.2, hy + 3.2); ctx.stroke();

    /* ---- brazo del sombrero: levantado y saludando (como en la imagen) ---- */
    const wave = Math.sin((e.hatT || 0) * 5) * 4;
    const hhx = -11 + wave * 0.5, hhy = -100 + Math.abs(wave) * 0.4;
    limb(ctx, -3, -71, hhx, hhy, 4.4, '#1f2f55');
    ctx.fillStyle = '#f0c9a0'; ctx.beginPath(); ctx.arc(hhx, hhy, 2.5, 0, TAU); ctx.fill();
    ctx.save(); ctx.translate(hhx - 1, hhy - 4); ctx.rotate(-0.35 + wave * 0.03);
    ctx.beginPath(); ctx.ellipse(0, 0, 13, 4.6, 0, 0, TAU);
    ctx.fillStyle = '#15110f'; ctx.fill(); ctx.lineWidth = 1.3; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-11, 0); ctx.quadraticCurveTo(0, -11, 11, 0); ctx.fillStyle = '#1d1815'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#d4141c'; ctx.beginPath(); ctx.arc(1, -4, 2.2, 0, TAU); ctx.fill();
    ctx.fillStyle = '#e8c246'; ctx.fillRect(-11, -1.2, 22, 1.4);
    ctx.restore();

    /* ---- brazo que arroja la divisa ---- */
    const tT = e.throwT || 0;
    let ax, ay;
    if (tT > 0) {
      const k = tT > 0.5 ? 1 : tT * 2;
      const a = e.aim || 0;
      ax = 4 + Math.cos(a) * 17 * k + (1 - k) * -4;
      ay = -70 + Math.sin(a) * 17 * k + (1 - k) * -8;
    } else {
      ax = 13; ay = -58 + Math.sin(t * 3) * 0.8;
    }
    limb(ctx, 4, -70, ax, ay, 4.4, '#1f2f55');
    ctx.fillStyle = '#f0c9a0'; ctx.beginPath(); ctx.arc(ax, ay, 2.5, 0, TAU); ctx.fill();
    if (tT <= 0.55) A.ribbon(ctx, ax + 3, ay + 6, 13, 4.6, Math.PI / 2 - 0.3 + Math.sin(t * 6) * 0.15, t);

    ctx.restore();
  };

  /* ------------------------------------------------------------------
     GLOBO DE TEXTO (viñeta de historieta)
     ------------------------------------------------------------------ */
  A.bubble = function (ctx, x, y, text, kind, alpha) {
    const maxW = kind === 'big' ? 150 : 128;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 12px "Trebuchet MS", Verdana, sans-serif';
    const lines = U.wrap(ctx, text, maxW);
    let w = 0;
    for (const l of lines) w = Math.max(w, ctx.measureText(l).width);
    const pw = w + 16, ph = lines.length * 14 + 10;
    let bx = x - pw / 2;
    bx = U.clamp(bx, 4, DP.CFG.W - pw - 4);
    const by = y - ph - 10;
    const border = kind === 'blue' ? '#1f4f9a' : '#2a1a14';
    const txt = kind === 'blue' ? '#16408a' : '#b00d14';
    // cola
    ctx.beginPath();
    const tx = U.clamp(x, bx + 12, bx + pw - 12);
    ctx.moveTo(tx - 6, by + ph - 1); ctx.lineTo(x, y); ctx.lineTo(tx + 6, by + ph - 1);
    ctx.closePath();
    ctx.fillStyle = '#fffdf4'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = border; ctx.stroke();
    U.rr(ctx, bx, by, pw, ph, 9);
    ctx.fillStyle = '#fffdf4'; ctx.fill(); ctx.stroke();
    // tapa la unión de la cola
    ctx.fillStyle = '#fffdf4'; ctx.fillRect(tx - 5, by + ph - 3, 10, 4);
    ctx.fillStyle = txt; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], bx + pw / 2, by + 15 + i * 14);
    ctx.restore();
  };
})();
