/* game.js : lógica del juego (mundo, IA de ciudadanos, proyectiles, reglas) */
(function () {
  'use strict';
  const U = DP.U, CFG = DP.CFG, A = DP.Art, S = DP.Scenery, TXT = DP.TEXT;
  const W = CFG.W, H = CFG.H;
  const G = DP.Game = {};
  const AU = () => DP.Audio;

  const FED_SHORT = ['¡Viva Rosas!', '¡Viva la Santa Federación!', '¡Federación o muerte!', '¡Mueran los salvajes unitarios!'];

  /* paletas (ninguna roja: lo rojo es sólo para los convertidos) */
  const SKINS = ['#f0c9a0', '#e3b184', '#c98f62', '#a8714a', '#8a5a3a', '#f4d5b0'];
  const HAIR = ['#2a1a10', '#4a3020', '#6a4a2a', '#1a1a1a', '#8a6a3a', '#9a9a9a', '#3a2a20'];
  const SHIRTS = ['#e8dcc0', '#6e8fb0', '#3f6b4a', '#c9a24a', '#7b6a9a', '#8c7a5c', '#4a7a8c', '#a8794a', '#5b6c3a', '#d6c6a0', '#5a7a6a'];
  const PANTS = ['#4a3a2a', '#5a5a5a', '#3a3a44', '#6a5a3a', '#2f3a4a', '#7a6a50'];
  const SKIRTS = ['#4a6a8c', '#7a5a8a', '#3f7a6a', '#c8b070', '#6a7a4a', '#8a6a9a'];
  const PONCHOS = ['#3f6a8a', '#7a6a3a', '#3a3a3a', '#5a7a4a', '#6a4a7a'];
  const HATC = ['#5a4630', '#3a3a3a', '#7a6a3a', '#4a5a7a', '#6a4a3a'];

  const ARCH = [
    { look: { acc: 'barrel', hat: 'cap' }, task: true },
    { look: { skirt: true, acc: 'basket', apron: true }, task: true },
    { look: { acc: 'broom', hat: 'straw' }, task: true },
    { look: { acc: 'tray', hat: 'sombrero' }, task: true },
    { look: { acc: 'lantern', hat: 'tophat' }, task: true },
    { look: { poncho: true, hat: 'sombrero', acc: 'rope' }, task: true },
    { look: { skirt: true, acc: 'fan', hat: 'mantilla' }, task: false },
    { look: { acc: 'sack', hat: 'knit' }, task: true },
    { look: { hat: 'tophat' }, task: false },
    { look: { stripes: true, hat: 'knit' }, task: false }
  ];

  const FOREIGN_FLAGS = ['br', 'py', 'es', 'uy', 'gb', 'fr', 'cl', 'pt', 'us'];

  /* ---------------------------------------------------------------- estado */
  G.state = 'menu';
  G.t = 0;
  G.camX = 0;
  G.keys = {};
  G.mouse = { x: W / 2, y: H / 2, down: false };
  G.useMouse = false;
  G.buttons = [];
  G.diffKey = 2;

  /* ------------------------------------------------------------- creación */
  function baseEnt(kind, x, y) {
    return {
      kind, x, y, s: U.scaleAt(y), dir: Math.random() < 0.5 ? 1 : -1,
      phase: Math.random() * 6, moving: 0, vx: 0, vy: 0, redAmt: 0, fed: false,
      state: 'idle', wait: U.rand(0.2, 2.5), wx: x, wy: y, speed: U.rand(38, 58),
      hidden: false, spot: null, hideT: 0, runT: 0, runDir: 1,
      bubble: null, mood: 'calm', alarm: 0, stun: 0, hop: 0, lean: 0,
      cheer: false, cheerT: 0, working: false, workT: 0, throwT: 0, block: 0,
      splat: null, noHide: 0, react: 0, zone: x, flagId: null, look: {}, orig: null,
      col: {}, hp: 1, maxHp: 1, bcd: U.rand(1.5, 4), chatT: U.rand(5, 12), task: false, popT: 0
    };
  }

  function makeCivil(x, y) {
    const e = baseEnt('civil', x, y);
    let a;
    if (Math.random() < 0.38) {
      const fem = Math.random() < 0.3;
      a = { look: { hat: fem ? 'kerchief' : U.pick(['sombrero', 'straw', 'cap', 'tophat', 'knit']), skirt: fem }, task: false };
      e.flagId = U.pick(FOREIGN_FLAGS);
    } else a = U.pick(ARCH);
    e.look = Object.assign({}, a.look);
    e.task = a.task;
    e.col = {
      skin: U.pick(SKINS), hair: U.pick(HAIR), shirt: U.pick(SHIRTS), shirt2: '#2f4a7a',
      pants: U.pick(PANTS), shoe: '#3a2a20', skirt: U.pick(SKIRTS), poncho: U.pick(PONCHOS), hat: U.pick(HATC)
    };
    if (e.look.stripes) { e.col.shirt = '#f2efe6'; e.col.shirt2 = '#2f4a7a'; }
    return e;
  }

  function makeSoldier(x, y) {
    const e = baseEnt('soldier', x, y);
    e.col = { skin: U.pick(SKINS), hair: U.pick(HAIR) };
    e.speed = U.rand(30, 44);
    return e;
  }

  function makeConst(x, y, D) {
    const e = baseEnt('const', x, y);
    e.col = { skin: U.pick(SKINS.slice(0, 2).concat(['#f4d5b0'])), hair: null };
    e.hp = e.maxHp = D.hp;
    e.speed = U.rand(30, 40);
    e.bcd = U.rand(D.ballCd[0], D.ballCd[1]);
    e.mood = 'grim';
    return e;
  }

  function makeEscort(i) {
    const e = baseEnt('escort', 0, 0);
    e.col = { skin: U.pick(SKINS), hair: U.pick(HAIR) };
    e.redAmt = 0;
    e.speed = 230;
    e.bcd = U.rand(2, 5);
    e.flagId = i === 0 ? 'ar' : null;
    e.slot = i;
    return e;
  }

  /* ------------------------------------------------------------ nuevo juego */
  G.newGame = function (diffKey) {
    G.diffKey = diffKey;
    const D = G.D = DP.DIFF[diffKey];
    const WW = CFG.WORLD_W;
    const sc = S.generate();
    G.houses = sc.houses; G.doors = sc.doors; G.plazaX = sc.plazaX;

    /* escondites: puertas + matorrales + barriles + carretas + ombúes */
    G.spots = [];
    G.props = [];
    G.doors.forEach((d) => G.spots.push({ type: 'door', x: d.x, y: CFG.SIDEWALK_Y + 8, cap: 99, count: 0, shake: 0, door: d }));
    const placed = [{ x: sc.plazaX, y: 372 }];
    const free = (x, y, r) => placed.every((p) => Math.hypot(p.x - x, (p.y - y) * 1.9) > r);
    const wants = [['bush', 34, 3, 340, 500, 90], ['barrel', 16, 1, 345, 500, 70], ['cart', 8, 2, 372, 500, 130], ['ombu', 10, 4, 336, 400, 190]];
    wants.forEach((w) => {
      let n = 0, tries = 0;
      while (n < w[1] && tries++ < 900) {
        const x = U.rand(90, WW - 90), y = U.rand(w[3], w[4]);
        if (!free(x, y, w[5])) continue;
        placed.push({ x, y });
        const size = w[0] === 'bush' ? U.rand(0.9, 1.3) : w[0] === 'ombu' ? U.rand(0.8, 1.05) : U.rand(0.9, 1.1);
        const p = { type: w[0], x, y, size, cap: w[2], count: 0, shake: 0, variant: Math.random() < 0.3 };
        G.props.push(p); G.spots.push(p);
        n++;
      }
    });
    G.lamps = [];
    for (let x = 220; x < WW; x += 420) G.lamps.push({ x: x + U.rand(-40, 40), y: 346 });

    /* jugador y escolta */
    G.player = { x: 280, y: 430, s: 1, dir: 1, phase: 0, moving: 0, throwT: 0, aim: 0, hatT: 0, slow: 0, cd: 0, ammo: CFG.AMMO_MAX, regen: 0, flash: 0 };
    G.escort = [];
    for (let i = 0; i < CFG.N_ESCORT; i++) {
      const e = makeEscort(i);
      e.x = G.player.x - 60 - i * 40; e.y = G.player.y + (i % 2 ? 26 : -26);
      G.escort.push(e);
    }

    /* población */
    G.npcs = [];
    const rx = () => U.rand(380, WW - 120);
    const ry = () => U.rand(CFG.STREET_TOP, CFG.STREET_BOT);
    for (let i = 0; i < CFG.N_CITIZENS; i++) G.npcs.push(makeCivil(rx(), ry()));
    for (let i = 0; i < CFG.N_SOLDIERS; i++) G.npcs.push(makeSoldier(rx(), ry()));
    const centers = [];
    for (let i = 0; i < 6; i++) centers.push(U.rand(900, WW - 400));
    for (let i = 0; i < D.constituents; i++) G.npcs.push(makeConst(U.clamp(U.pick(centers) + U.rand(-300, 300), 500, WW - 120), ry(), D));
    G.npcs.forEach((e) => { e.zone = e.x; });

    G.balls = [];
    G.ribbons = [];
    G.sparks = [];
    G.toasts = [];
    G.time = D.time;
    G.score = 0;
    G.holdT = 0;
    G.stats = { thrown: 0, hits: 0, consts: 0, reverted: 0, maxPct: 0 };
    G.ratio = 0; G.fedCount = 0; G.constFed = 0; G.constTotal = D.constituents;
    G.result = null;
    G.camX = U.clamp(G.player.x - W * 0.42, 0, WW - W);
    G.helpT = 14;
    recount();
  };

  G.start = function (diffKey) {
    G.newGame(diffKey || G.diffKey);
    if (DP.Touch) DP.Touch.reset();
    G.state = 'play';
    AU().resume();
    AU().click();
  };

  /* ------------------------------------------------------------------ util */
  function recount() {
    let fed = 0, cf = 0;
    for (const e of G.npcs) if (e.fed) { fed++; if (e.kind === 'const') cf++; }
    G.fedCount = fed; G.constFed = cf;
    G.ratio = fed / G.npcs.length;
    G.stats.maxPct = Math.max(G.stats.maxPct, G.ratio);
  }

  G.toast = function (text, color) {
    G.toasts.push({ text, t: 3, max: 3, color: color || '#fff' });
    if (G.toasts.length > 3) G.toasts.shift();
  };

  function visible(e) { return !e.hidden && e.x > G.camX - 40 && e.x < G.camX + W + 40; }

  function moveTo(e, tx, ty, sp, dt) {
    const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy);
    if (d < 3) { e.moving = Math.max(0, e.moving - dt * 8); e.vx = e.vy = 0; return true; }
    const step = Math.min(d, sp * dt), k = step / d;
    e.x += dx * k; e.y += dy * k;
    e.vx = dx / d * sp; e.vy = dy / d * sp;
    if (Math.abs(dx) > 1) e.dir = dx < 0 ? -1 : 1;
    e.moving = Math.min(1, e.moving + dt * 8);
    e.phase += dt * sp * 0.1;
    e.s = U.scaleAt(e.y);
    return d - step < 3;
  }

  function say(e, text, dur, kind) {
    e.bubble = { text, t: dur, max: dur, kind: kind || 'red' };
  }

  function nearDoorSound(x) { if (Math.abs(x - G.player.x) < 700) AU().door(); }

  /* ---------------------------------------------------- conversión a punzó */
  function makeFederal(e, by) {
    if (e.fed) return;
    e.fed = true;
    e.orig = { look: e.look, flagId: e.flagId };
    e.look = Object.assign({}, e.look, { acc: null });
    e.flagId = 'red';
    e.cheer = true; e.cheerT = 2.6;
    e.state = 'idle'; e.wait = 1.2; e.working = false; e.react = 0; e.alarm = 0;
    e.hidden = false; e.splat = null; e.stun = 0;
    e.mood = 'shout'; e.popT = 0.45;
    say(e, TXT.PHRASE, 4.4, 'red');
    e.chatT = U.rand(7, 13);
    AU().hit();
    const pts = e.kind === 'const' ? 400 : e.kind === 'soldier' ? 150 : 100;
    if (by === 'player') G.score += pts; else G.score += Math.round(pts / 2);
    if (e.kind === 'const') {
      G.stats.consts++;
      G.toast('¡Un constituyente cayó en la Federación!', '#ffd23a');
    }
    G.stats.hits++;
    recount();
  }

  function makeUnitary(e, color) {
    if (!e.fed) return;
    e.fed = false;
    const o = e.orig || { look: e.look, flagId: null };
    e.look = Object.assign({}, o.look);
    e.flagId = (o.look && o.look.acc) ? null : (Math.random() < 0.75 ? 'ar' : U.pick(FOREIGN_FLAGS));
    if (e.kind === 'const') e.flagId = null;
    e.cheer = false; e.cheerT = 0; e.state = 'idle'; e.wait = 0.8;
    e.splat = { c: color === 'green' ? '#2fb552' : '#2f6fe0', t: 2.2 };
    e.mood = e.kind === 'const' ? 'grim' : 'shout';
    e.react = 0;
    say(e, U.pick(TXT.COUNTER), 3.2, 'blue');
    AU().revert();
    G.stats.reverted++;
    recount();
  }

  /* --------------------------------------------------------- escondites */
  function pickSpot(e, avoidPlayer) {
    const p = G.player;
    let best = null, bd = 1e9;
    const dp = Math.hypot(e.x - p.x, (e.y - p.y) * 1.4);
    for (const sp of G.spots) {
      if (sp.count >= sp.cap) continue;
      const d = Math.hypot(sp.x - e.x, (sp.y - e.y) * 1.2);
      if (d > 700) continue;
      const dsp = Math.hypot(sp.x - p.x, (sp.y - p.y) * 1.4);
      if (avoidPlayer && dsp < dp * 0.8) continue;   // no correr hacia el jinete
      if (d < bd) { bd = d; best = sp; }
    }
    return best;
  }

  function startFlee(e) {
    const p = G.player;
    e.alarm = 0; e.working = false;
    const sp = e.noHide > 0 ? null : pickSpot(e, true);
    if (sp) {
      e.state = 'flee'; e.spot = sp; e.wx = sp.x; e.wy = sp.y;
      e.mood = 'alarm';
    } else {
      e.state = 'run'; e.runT = U.rand(1.4, 2.4); e.runDir = (e.x - p.x) >= 0 ? 1 : -1;
      e.mood = 'alarm';
    }
  }

  function enterSpot(e) {
    const sp = e.spot;
    if (!sp || sp.count >= sp.cap) { e.spot = null; e.state = 'run'; e.runT = 1.2; e.runDir = Math.random() < 0.5 ? 1 : -1; return; }
    sp.count++;
    e.hidden = true; e.state = 'hidden'; e.hideT = U.rand(5, 9);
    sp.shake = 0.5;
    if (sp.type === 'door') { sp.door.open = 0.8; nearDoorSound(sp.x); }
  }

  function leaveSpot(e, flush) {
    const sp = e.spot;
    if (sp) {
      sp.count = Math.max(0, sp.count - 1);
      e.x = sp.x + (flush ? U.rand(-14, 14) : 0);
      e.y = sp.type === 'door' ? CFG.SIDEWALK_Y + 8 : sp.y;
      if (sp.type === 'door') { sp.door.open = 0.8; nearDoorSound(sp.x); }
      else sp.shake = 0.6;
    }
    e.s = U.scaleAt(e.y);
    e.hidden = false; e.spot = null;
  }

  function flushSpot(sp) {
    for (const e of G.npcs) {
      if (e.hidden && e.spot === sp) {
        leaveSpot(e, true);
        e.state = 'run'; e.runT = U.rand(1.6, 2.4); e.noHide = 3.2;
        e.runDir = (e.x - G.player.x) >= 0 ? 1 : -1;
        e.mood = 'alarm'; e.alarm = 0.8;
      }
    }
    sp.shake = 0.9; sp.count = 0;
  }

  /* ------------------------------------------------------------- IA NPC */
  function pickWaypoint(e) {
    const WW = CFG.WORLD_W;
    if (e.fed) {
      e.wx = U.clamp(G.player.x + U.rand(-430, 430), 80, WW - 80);
      e.wy = U.rand(CFG.STREET_TOP, CFG.STREET_BOT);
    } else {
      e.zone = U.clamp(e.zone + U.rand(-70, 70), 120, WW - 120);
      e.wx = U.clamp(e.zone + U.rand(-250, 250), 80, WW - 80);
      e.wy = Math.random() < 0.3 ? U.rand(320, 334) : U.rand(CFG.STREET_TOP, CFG.STREET_BOT);
    }
  }

  function updateNpc(e, dt) {
    const p = G.player;
    // timers comunes
    if (e.bubble) { e.bubble.t -= dt; if (e.bubble.t <= 0) { e.bubble = null; if (e.kind !== 'const' || !e.fed) e.mood = e.kind === 'const' && !e.fed ? 'grim' : 'calm'; } }
    if (e.splat) { e.splat.t -= dt; if (e.splat.t <= 0) e.splat = null; }
    if (e.block > 0) e.block -= dt;
    if (e.throwT > 0) e.throwT -= dt;
    if (e.noHide > 0) e.noHide -= dt;
    if (e.popT > 0) e.popT -= dt;
    e.hop = e.popT > 0 ? Math.sin((1 - e.popT / 0.45) * Math.PI) * 6 : 0;
    // rojo: se transforma de a poco
    const goal = e.fed ? 1 : 0;
    if (e.redAmt !== goal) e.redAmt += Math.sign(goal - e.redAmt) * Math.min(Math.abs(goal - e.redAmt), dt * 2.4);
    e.s = U.scaleAt(e.y);

    if (e.state === 'hidden') {
      e.hideT -= dt;
      if (e.hideT <= 0) {
        if (Math.hypot(e.spot.x - p.x, e.spot.y - p.y) > 340) { leaveSpot(e, false); e.state = 'idle'; e.wait = 0.4; e.mood = 'calm'; }
        else e.hideT = 0.6;
      }
      return;
    }

    if (e.kind === 'const') { updateConst(e, dt); return; }

    /* miedo al jinete */
    if (!e.fed && (e.state === 'idle' || e.state === 'walk' || e.state === 'work')) {
      const R = e.kind === 'soldier' ? 185 : 240;
      const d = Math.hypot(e.x - p.x, (e.y - p.y) * 1.5);
      if (d < R) {
        e.react += dt;
        e.alarm = 0.2;
        if (e.react > 0.3) startFlee(e);
      } else e.react = Math.max(0, e.react - dt * 1.5);
    }

    switch (e.state) {
      case 'idle':
        e.moving = Math.max(0, e.moving - dt * 8);
        e.working = false;
        e.wait -= dt;
        if (e.fed && e.cheerT > 0) { e.cheerT -= dt; e.cheer = true; } else if (e.fed) e.cheer = false;
        if (e.wait <= 0) { pickWaypoint(e); e.state = 'walk'; }
        break;
      case 'walk': {
        const arrived = moveTo(e, e.wx, e.wy, e.fed ? e.speed * 1.25 : e.speed, dt);
        e.y = U.clamp(e.y, 318, CFG.STREET_BOT);
        if (e.fed && e.cheerT > 0) { e.cheerT -= dt; e.cheer = true; } else if (e.fed) e.cheer = false;
        if (arrived) {
          if (!e.fed && e.task && Math.random() < 0.65) { e.state = 'work'; e.wait = U.rand(3, 7); e.workT = 0; }
          else { e.state = 'idle'; e.wait = U.rand(0.5, 2.2); }
        }
        break;
      }
      case 'work':
        e.working = true; e.workT += dt;
        e.moving = Math.max(0, e.moving - dt * 8);
        e.wait -= dt;
        if (e.wait <= 0) { e.working = false; e.state = 'idle'; e.wait = 0.4; }
        break;
      case 'flee': {
        const arrived = moveTo(e, e.wx, e.wy, e.kind === 'soldier' ? 135 : 130, dt);
        if (arrived) enterSpot(e);
        break;
      }
      case 'run':
        e.runT -= dt;
        moveTo(e, U.clamp(e.x + e.runDir * 200, 60, CFG.WORLD_W - 60), U.clamp(e.y + Math.sin(G.t * 2 + e.phase) * 40, 320, CFG.STREET_BOT), 150, dt);
        if (e.runT <= 0) { e.state = 'idle'; e.wait = 0.5; e.mood = 'calm'; }
        break;
    }
    if (e.state !== 'flee' && e.state !== 'run' && !e.bubble && e.mood === 'alarm') e.mood = 'calm';

    /* los federales gritan de vez en cuando */
    if (e.fed) {
      e.chatT -= dt;
      if (e.chatT <= 0 && !e.bubble) {
        e.chatT = U.rand(8, 15);
        if (visible(e)) { say(e, U.pick(FED_SHORT), 2.4, 'red'); e.mood = 'shout'; e.cheer = true; e.cheerT = 1.4; }
      }
    }
  }

  function nearestFed(e, maxD) {
    let best = null, bd = maxD;
    for (const f of G.npcs) {
      if (!f.fed || f.hidden || f === e) continue;
      const d = Math.hypot(f.x - e.x, (f.y - e.y) * 1.5);
      if (d < bd) { bd = d; best = f; }
    }
    return best;
  }

  function updateConst(e, dt) {
    const D = G.D;
    if (e.fed) {            // ya cayó: se une a la fiesta federal
      e.state === 'hidden' && (e.state = 'idle');
      updateFedWalk(e, dt);
      return;
    }
    e.bcd -= dt;
    const tgt = nearestFed(e, 1100);
    const p = G.player;
    // se acercan despacio a los federales para poder pegarles
    if (e.throwT <= 0) {
      if (tgt && Math.hypot(tgt.x - e.x, (tgt.y - e.y) * 1.5) > 300) {
        moveTo(e, tgt.x, tgt.y, e.speed * 1.3, dt);
        e.y = U.clamp(e.y, 320, CFG.STREET_BOT);
      } else {
        e.wait -= dt;
        if (e.state === 'walk') {
          if (moveTo(e, e.wx, e.wy, e.speed, dt)) { e.state = 'idle'; e.wait = U.rand(1, 3); }
        } else {
          e.moving = Math.max(0, e.moving - dt * 8);
          if (e.wait <= 0) { pickWaypoint(e); e.state = 'walk'; }
        }
      }
    }
    e.lean = e.throwT > 0 ? 0.3 * Math.sin(Math.min(1, e.throwT / 0.4) * Math.PI) : 0;
    // lanza bolas verdes / azules
    if (e.bcd <= 0 && G.balls.length < D.maxBalls && e.throwT <= 0) {
      let target = tgt && Math.hypot(tgt.x - e.x, (tgt.y - e.y) * 1.5) < 340 ? tgt : null;
      let atPlayer = false;
      if (!target && Math.hypot(p.x - e.x, (p.y - e.y) * 1.5) < 260 && Math.random() < 0.5) { atPlayer = true; }
      if (target || atPlayer) {
        const tx = target ? target.x + target.vx * 0.4 : p.x;
        const ty = target ? target.y - 26 * target.s : p.y - 40 * p.s;
        throwBall(e, tx, ty);
        e.bcd = U.rand(D.ballCd[0], D.ballCd[1]);
      } else e.bcd = 0.7;
    }
  }

  function updateFedWalk(e, dt) {
    if (e.state === 'idle' || e.state === 'work' || e.state === 'flee' || e.state === 'run') {
      e.moving = Math.max(0, e.moving - dt * 8);
      e.wait -= dt;
      if (e.cheerT > 0) { e.cheerT -= dt; e.cheer = true; } else e.cheer = false;
      if (e.wait <= 0) { pickWaypoint(e); e.state = 'walk'; }
    } else if (e.state === 'walk') {
      if (moveTo(e, e.wx, e.wy, e.speed * 1.25, dt)) { e.state = 'idle'; e.wait = U.rand(0.8, 2.5); }
      e.y = U.clamp(e.y, 320, CFG.STREET_BOT);
    }
    e.chatT -= dt;
    if (e.chatT <= 0 && !e.bubble) {
      e.chatT = U.rand(9, 16);
      if (visible(e)) say(e, U.pick(FED_SHORT), 2.4, 'red');
    }
  }

  /* ----------------------------------------------------------- escolta */
  function updateEscort(e, i, dt) {
    const p = G.player;
    const f = Math.floor(i / 2);
    const tx = p.x - p.dir * (95 + f * 62), ty = U.clamp(p.y + (i % 2 ? 34 : -34) + f * 6, CFG.STREET_TOP + 6, CFG.STREET_BOT);
    const d = Math.hypot(tx - e.x, ty - e.y);
    if (d > 900) { e.x = tx; e.y = ty; }
    else moveTo(e, tx, ty, Math.min(260, 70 + d * 3), dt);
    e.s = U.scaleAt(e.y);
    if (d < 6) e.dir = p.dir;
    if (e.throwT > 0) e.throwT -= dt;
    if (e.stun > 0) e.stun -= dt;
    e.bcd -= dt;
    if (e.bcd <= 0 && e.stun <= 0 && !e.flagId) {
      let best = null, bd = 330;
      for (const n of G.npcs) {
        if (n.fed || n.hidden) continue;
        if (n.x < G.camX + 10 || n.x > G.camX + W - 10) continue;
        const dd = Math.hypot(n.x - e.x, (n.y - e.y) * 1.2);
        if (dd < bd) { bd = dd; best = n; }
      }
      if (best) {
        const dist = bd / 640;
        const tx2 = best.x + best.vx * dist + U.rand(-14, 14), ty2 = best.y - 26 * best.s + U.rand(-10, 10);
        const hx = e.x + (tx2 >= e.x ? 10 : -10) * e.s, hy = e.y - 38 * e.s;
        e.dir = tx2 >= e.x ? 1 : -1;
        spawnRibbon(hx, hy, tx2, ty2, 'escort');
        e.throwT = 0.4;
        e.bcd = U.rand(3.4, 5.6);
      } else e.bcd = 0.6;
    }
  }

  /* ------------------------------------------------------- proyectiles */
  function spawnRibbon(x, y, tx, ty, owner) {
    const dx = tx - x, dy = ty - y, d = Math.hypot(dx, dy) || 1;
    const sp = 650;
    G.ribbons.push({ x, y, vx: dx / d * sp, vy: dy / d * sp, dist: 0, max: owner === 'player' ? 540 : 420, rot: Math.random() * 6, owner });
  }

  function throwBall(e, tx, ty) {
    const hx = e.x + e.dir * 10 * e.s, hy = e.y - 36 * e.s;
    const dx = tx - hx, dy = ty - hy, d = Math.hypot(dx, dy) || 1, sp = 320;
    e.dir = dx >= 0 ? 1 : -1;
    e.throwT = 0.45;
    const green = Math.random() < 0.5;
    G.balls.push({ x: hx, y: hy, vx: dx / d * sp, vy: dy / d * sp, life: Math.min(1.8, d / sp + 0.5), color: green ? 'green' : 'blue', from: e });
  }

  G.throwAt = function (aimX, aimY) {
    const p = G.player;
    if (p.cd > 0 || p.ammo < 1 || G.state !== 'play') return false;
    p.ammo -= 1; p.cd = CFG.THROW_COOLDOWN;
    const hx = p.x + (aimX >= p.x ? 14 : -14) * p.s, hy = p.y - 68 * p.s;
    p.dir = aimX >= p.x ? 1 : -1;
    p.aim = Math.atan2(aimY - hy, Math.abs(aimX - hx) + 0.001);
    p.aim = U.clamp(p.aim, -1.2, 1.2);
    p.throwT = 0.4;
    spawnRibbon(hx + p.dir * 10 * p.s, hy - 4, aimX, aimY, 'player');
    G.stats.thrown++;
    AU().throwSfx();
    return true;
  };

  G.autoThrow = function () {
    const p = G.player;
    let best = null, bd = 520;
    for (const n of G.npcs) {
      if (n.fed || n.hidden || !visible(n)) continue;
      const d = Math.hypot(n.x - p.x, (n.y - p.y) * 1.2);
      // prefiere los que están del lado hacia donde mira
      const pen = ((n.x - p.x) * p.dir < 0) ? 80 : 0;
      if (d + pen < bd) { bd = d + pen; best = n; }
    }
    if (best) {
      const t = Math.hypot(best.x - p.x, best.y - p.y) / 650;
      return G.throwAt(best.x + best.vx * t, best.y - 26 * best.s + best.vy * t);
    }
    return G.throwAt(p.x + p.dir * 400, p.y - 40);
  };

  function hitEllipse(px, py, e) {
    const s = e.s, rx = (e.kind === 'const' ? 19 : 16) * s, ry = 30 * s;
    const dx = (px - e.x) / rx, dy = (py - (e.y - 28 * s)) / ry;
    return dx * dx + dy * dy < 1;
  }

  function spark(x, y, col) {
    for (let i = 0; i < 7; i++) {
      const a = Math.random() * 6.28, v = U.rand(40, 150);
      G.sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, t: U.rand(0.25, 0.5), c: col });
    }
  }

  function updateProjectiles(dt) {
    const p = G.player;
    /* divisas */
    for (let i = G.ribbons.length - 1; i >= 0; i--) {
      const r = G.ribbons[i];
      let dead = false;
      const steps = 2, sdt = dt / steps;
      for (let s = 0; s < steps && !dead; s++) {
        r.x += r.vx * sdt; r.y += r.vy * sdt;
        r.dist += Math.hypot(r.vx, r.vy) * sdt;
        r.rot += sdt * 14;
        for (const n of G.npcs) {
          if (n.fed || n.hidden) continue;
          if (!hitEllipse(r.x, r.y, n)) continue;
          if (n.kind === 'const') {
            if (n.block > 0) { spark(r.x, r.y, '#ffffff'); AU().resist(); dead = true; break; }
            n.hp--;
            if (n.hp > 0) {
              n.block = 0.55;
              say(n, U.pick(TXT.RESIST), 1.8, 'blue');
              n.mood = 'grim';
              AU().resist();
              spark(r.x, r.y, '#d4141c');
              if (r.owner === 'player') G.score += 20;
              G.stats.hits += 0;
              if (r.owner === 'player') p.ammo = Math.min(CFG.AMMO_MAX, p.ammo + 0.5);
            } else {
              makeFederal(n, r.owner);
              if (r.owner === 'player') p.ammo = Math.min(CFG.AMMO_MAX, p.ammo + CFG.AMMO_REFUND_ON_HIT);
            }
          } else {
            makeFederal(n, r.owner);
            spark(r.x, r.y, '#ff3a3a');
            if (r.owner === 'player') p.ammo = Math.min(CFG.AMMO_MAX, p.ammo + CFG.AMMO_REFUND_ON_HIT);
          }
          dead = true;
          break;
        }
      }
      if (dead || r.dist > r.max || r.x < 0 || r.x > CFG.WORLD_W) G.ribbons.splice(i, 1);
    }
    /* bolas verdes y azules */
    for (let i = G.balls.length - 1; i >= 0; i--) {
      const b = G.balls[i];
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      let dead = b.life <= 0;
      if (!dead) {
        for (const n of G.npcs) {
          if (!n.fed || n.hidden || n.kind === 'const' && n === b.from) continue;
          if (n.kind === 'const') continue;
          if (hitEllipse(b.x, b.y, n)) {
            makeUnitary(n, b.color);
            AU().splat();
            spark(b.x, b.y, b.color === 'green' ? '#35c05b' : '#3b7cf0');
            dead = true; break;
          }
        }
      }
      if (!dead) {
        for (const e of G.escort) {
          if (hitEllipse(b.x, b.y, e)) {
            e.stun = 1.6; AU().splat();
            spark(b.x, b.y, b.color === 'green' ? '#35c05b' : '#3b7cf0');
            dead = true; break;
          }
        }
      }
      if (!dead) {
        const dx = (b.x - p.x) / (32 * p.s), dy = (b.y - (p.y - 50 * p.s)) / (50 * p.s);
        if (dx * dx + dy * dy < 1) {
          p.slow = 1.6; p.flash = 0.5; AU().ouch();
          spark(b.x, b.y, b.color === 'green' ? '#35c05b' : '#3b7cf0');
          dead = true;
        }
      }
      if (dead) G.balls.splice(i, 1);
    }
    for (let i = G.sparks.length - 1; i >= 0; i--) {
      const s = G.sparks[i];
      s.t -= dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 400 * dt;
      if (s.t <= 0) G.sparks.splice(i, 1);
    }
  }

  /* ------------------------------------------------------------ jugador */
  function updatePlayer(dt) {
    const p = G.player, k = G.keys;
    let ix = (k.right ? 1 : 0) - (k.left ? 1 : 0), iy = (k.down ? 1 : 0) - (k.up ? 1 : 0);
    if (G.stick && (G.stick.x || G.stick.y)) { ix = G.stick.x; iy = G.stick.y; }   // joystick táctil (analógico)
    let sp = (k.shift ? CFG.PLAYER_GALLOP : CFG.PLAYER_SPEED) * (p.slow > 0 ? 0.5 : 1);
    const rawLen = Math.hypot(ix, iy), len = rawLen || 1, mag = Math.min(1, rawLen);
    const vx = ix / len * sp * mag, vy = iy / len * sp * 0.7 * mag;
    if (G.state === 'play') {
      p.x = U.clamp(p.x + vx * dt, 70, CFG.WORLD_W - 70);
      p.y = U.clamp(p.y + vy * dt, CFG.STREET_TOP + 12, CFG.STREET_BOT);
    }
    const mv = (ix || iy) ? 1 : 0;
    p.moving += (mv - p.moving) * Math.min(1, dt * 9);
    p.phase += dt * (5 + sp * 0.03) * (0.25 + p.moving);
    p.hatT += dt;
    p.s = U.scaleAt(p.y) * 0.95;
    if (Math.abs(ix) > 0.2 && !G.useMouse) p.dir = ix > 0 ? 1 : -1;
    else if (G.useMouse && G.state === 'play') p.dir = (G.mouse.x + G.camX) >= p.x ? 1 : -1;
    if (p.throwT > 0) p.throwT -= dt; else {
      const a = Math.atan2(G.mouse.y - (p.y - 68 * p.s), Math.abs(G.mouse.x + G.camX - p.x) + 1);
      p.aim = U.clamp(a, -1.2, 1.2);
    }
    if (p.cd > 0) p.cd -= dt;
    if (p.slow > 0) p.slow -= dt;
    if (p.flash > 0) p.flash -= dt;
    // la escolta te alcanza divisas
    if (p.ammo < CFG.AMMO_MAX) {
      p.regen += dt;
      if (p.regen >= CFG.AMMO_REGEN) { p.regen = 0; p.ammo = Math.min(CFG.AMMO_MAX, p.ammo + 1); }
    } else p.regen = 0;
    if (G.state === 'play' && (G.mouse.down || k.fire)) {
      if (G.mouse.down) G.throwAt(G.mouse.x + G.camX, G.mouse.y);
      else G.autoThrow();
    }
  }

  /* -------------------------------------------------------------- update */
  G.update = function (dt) {
    G.t += dt;
    const playing = G.state === 'play';
    if (G.state === 'pause') return;
    updatePlayer(dt);
    G.escort.forEach((e, i) => updateEscort(e, i, dt));
    for (const n of G.npcs) updateNpc(n, dt);
    updateProjectiles(dt);

    // descubrir escondidos si el jinete se acerca a matorral, barril, carreta u ombú
    const p = G.player;
    for (const sp of G.spots) {
      if (sp.shake > 0) sp.shake -= dt;
      if (sp.type !== 'door' && sp.count > 0 && Math.abs(p.x - sp.x) < 78 * sp.size && Math.abs(p.y - sp.y) < 46) flushSpot(sp);
    }
    for (const d of G.doors) if (d.open > 0) d.open -= dt;

    // cámara
    const target = U.clamp(p.x - W * 0.42 + p.dir * 70, 0, CFG.WORLD_W - W);
    G.camX += (target - G.camX) * Math.min(1, dt * 4.5);

    for (let i = G.toasts.length - 1; i >= 0; i--) { G.toasts[i].t -= dt; if (G.toasts[i].t <= 0) G.toasts.splice(i, 1); }
    if (G.helpT > 0 && playing) G.helpT -= dt;

    if (!playing) return;

    recount();
    G.time -= dt;
    const need = G.D.win;
    if (G.ratio >= need) {
      G.holdT += dt;
      if (G.holdT >= CFG.WIN_HOLD) finish(true);
    } else G.holdT = Math.max(0, G.holdT - dt * 1.5);
    if (G.time <= 0 && G.state === 'play') finish(false);
  };

  function finish(win) {
    G.state = 'end';
    G.result = { win, time: Math.max(0, G.time), score: G.score + (win ? Math.round(Math.max(0, G.time) * 10) : 0) };
    if (win) AU().win(); else AU().lose();
    try {
      const key = 'divisaPunzo_best_' + G.diffKey;
      const prev = parseInt(localStorage.getItem(key) || '0', 10);
      if (win && G.result.score > prev) { localStorage.setItem(key, String(G.result.score)); G.result.record = true; }
      G.result.best = Math.max(prev, win ? G.result.score : 0);
    } catch (e) { G.result.best = 0; }
  }

  /* --------------------------------------------------------------- dibujo */
  function drawNpc(ctx, e) {
    ctx.save();
    ctx.translate(-G.camX, 0);
    A.person(ctx, e, G.t);
    if (e.splat) {
      ctx.globalAlpha = Math.min(1, e.splat.t);
      ctx.fillStyle = e.splat.c;
      const s = e.s;
      ctx.beginPath(); ctx.arc(e.x + e.dir * 2 * s, e.y - 27 * s, 7 * s, 0, 6.3); ctx.fill();
      ctx.beginPath(); ctx.arc(e.x - e.dir * 5 * s, e.y - 20 * s, 3.4 * s, 0, 6.3); ctx.fill();
      ctx.beginPath(); ctx.arc(e.x + e.dir * 6 * s, e.y - 38 * s, 2.6 * s, 0, 6.3); ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (e.kind === 'const') {
      // vidas: cuántas divisas aguanta
      const n = e.maxHp, s = e.s, y0 = e.y - 60 * s;
      if (!e.fed) for (let i = 0; i < n; i++) {
        ctx.beginPath(); ctx.arc(e.x + (i - (n - 1) / 2) * 6 * s, y0, 2.4 * s, 0, 6.3);
        ctx.fillStyle = i < e.hp ? '#2f6fe0' : 'rgba(0,0,0,.3)'; ctx.fill();
        ctx.lineWidth = 0.8; ctx.strokeStyle = '#fff'; ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawProp(ctx, p, sx) {
    if (p.type === 'bush') S.bush(ctx, sx, p.y, p.size, p.shake, p.variant);
    else if (p.type === 'barrel') S.barrel(ctx, sx, p.y, p.size, p.shake);
    else if (p.type === 'cart') S.cart(ctx, sx, p.y, p.size, p.shake);
    else if (p.type === 'ombu') S.ombu(ctx, sx, p.y, p.size, p.shake);
  }

  G.draw = function (ctx) {
    const cam = G.camX, t = G.t;
    ctx.save();
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    S.background(ctx, cam, t);
    // casas
    for (const h of G.houses) {
      const sx = h.x - cam;
      if (sx > W + 20 || sx + h.w < -20) continue;
      if (h.type === 'cabildo') S.cabildo(ctx, h, sx, t); else S.house(ctx, h, sx, t);
    }
    S.ground(ctx, cam);

    // objetos con profundidad
    const items = [];
    for (const p of G.props) { const sx = p.x - cam; if (sx > -160 && sx < W + 160) items.push({ y: p.y, k: 0, o: p, sx }); }
    for (const l of G.lamps) { const sx = l.x - cam; if (sx > -40 && sx < W + 40) items.push({ y: l.y, k: 1, o: l, sx }); }
    { const sx = G.plazaX - cam; if (sx > -120 && sx < W + 120) items.push({ y: 372, k: 2, o: null, sx }); }
    for (const n of G.npcs) if (!n.hidden && n.x - cam > -60 && n.x - cam < W + 60) items.push({ y: n.y, k: 3, o: n });
    for (const e of G.escort) items.push({ y: e.y, k: 3, o: e });
    items.push({ y: G.player.y, k: 4, o: G.player });
    items.sort((a, b) => a.y - b.y);
    for (const it of items) {
      if (it.k === 0) drawProp(ctx, it.o, it.sx);
      else if (it.k === 1) S.lamp(ctx, it.sx, it.o.y, t);
      else if (it.k === 2) S.pyramid(ctx, it.sx, 372, 1.15);
      else if (it.k === 3) drawNpc(ctx, it.o);
      else {
        const p = it.o;
        ctx.save();
        ctx.translate(-cam, 0);
        if (p.flash > 0 && Math.floor(p.flash * 16) % 2 === 0) ctx.globalAlpha = 0.55;
        A.rider(ctx, { x: p.x, y: p.y, s: p.s, dir: p.dir, phase: p.phase, moving: p.moving, throwT: p.throwT, aim: p.aim, hatT: p.hatT }, t);
        ctx.restore();
      }
    }

    // proyectiles
    for (const r of G.ribbons) A.ribbon(ctx, r.x - cam, r.y, 24, 8, r.rot, t);
    for (const b of G.balls) {
      const x = b.x - cam, c = b.color === 'green' ? ['#2fb552', '#9af0b0', '#177a33'] : ['#2f6fe0', '#a8c8ff', '#17408f'];
      ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(x, b.y + 12, 7, 2.5, 0, 0, 6.3); ctx.fill();
      ctx.beginPath(); ctx.arc(x, b.y, 8, 0, 6.3); ctx.fillStyle = c[0]; ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = c[2]; ctx.stroke();
      ctx.beginPath(); ctx.arc(x - 2.5, b.y - 2.5, 2.6, 0, 6.3); ctx.fillStyle = c[1]; ctx.fill();
    }
    for (const s of G.sparks) {
      ctx.globalAlpha = Math.min(1, s.t * 3);
      ctx.fillStyle = s.c; ctx.fillRect(s.x - cam - 2, s.y - 2, 4, 4);
    }
    ctx.globalAlpha = 1;

    // globos de texto (siempre arriba de todo)
    for (const n of G.npcs) {
      if (!n.bubble || n.hidden) continue;
      const sx = n.x - cam;
      if (sx < -40 || sx > W + 40) continue;
      const b = n.bubble, alpha = Math.min(1, b.t * 2.5, (b.max - b.t) * 6 + 0.2);
      const yy = n.y - (n.kind === 'const' ? 66 : 64) * n.s;
      A.bubble(ctx, sx, yy, b.text, b.kind, alpha);
    }
    ctx.restore();
  };

  /* -------------------------------------------------------------- entradas */
  G.bindInput = function (canvas, toLogical) {
    const keyMap = {
      ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right',
      ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', Shift: 'shift'
    };
    window.addEventListener('keydown', (ev) => {
      const k = keyMap[ev.key];
      if (k) { G.keys[k] = true; if (k !== 'shift') G.useMouse = false; ev.preventDefault(); }
      if (ev.key === ' ' || ev.code === 'Space') {
        ev.preventDefault();
        if (G.state === 'play') G.keys.fire = true; else if (G.state === 'menu' || G.state === 'end') { /* lo maneja ui */ }
      }
      DP.UI && DP.UI.onKey(ev);
    });
    window.addEventListener('keyup', (ev) => {
      const k = keyMap[ev.key];
      if (k) G.keys[k] = false;
      if (ev.key === ' ' || ev.code === 'Space') G.keys.fire = false;
    });
    window.addEventListener('blur', () => { G.keys = {}; G.mouse.down = false; if (G.state === 'play') G.state = 'pause'; });
    canvas.addEventListener('mousemove', (ev) => { const p = toLogical(ev); G.mouse.x = p.x; G.mouse.y = p.y; G.useMouse = true; });
    canvas.addEventListener('mousedown', (ev) => {
      AU().resume();
      const p = toLogical(ev); G.mouse.x = p.x; G.mouse.y = p.y;
      if (DP.UI && DP.UI.onClick(p.x, p.y)) return;
      if (G.state === 'play') { G.mouse.down = true; G.useMouse = true; }
    });
    window.addEventListener('mouseup', () => { G.mouse.down = false; });
    canvas.addEventListener('contextmenu', (ev) => ev.preventDefault());
    // táctil: lo maneja touch.js (joystick + botones, multitáctil)
    DP.Touch.bind(canvas, toLogical);
  };
})();
