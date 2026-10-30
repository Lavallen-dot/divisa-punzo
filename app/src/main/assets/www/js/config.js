/* =====================================================================
   DIVISA PUNZÓ — Buenos Aires, 1854
   config.js : constantes y ajustes del juego (podés tocar los números)
   ===================================================================== */
window.DP = window.DP || {};

DP.CFG = {
  W: 960,                 // ancho interno del canvas
  H: 540,                 // alto interno del canvas
  WORLD_W: 7600,          // largo de la calle (en px)

  HOUSE_BASE: 300,        // y donde terminan las paredes de las casas
  SIDEWALK_Y: 318,        // y de las puertas (vereda)
  STREET_TOP: 326,        // y mínima por donde camina la gente
  STREET_BOT: 506,        // y máxima

  PLAYER_SPEED: 180,      // trote
  PLAYER_GALLOP: 300,     // galope (Shift)
  THROW_COOLDOWN: 0.26,   // segundos entre divisas
  AMMO_MAX: 20,
  AMMO_REGEN: 1.0,        // segundos por divisa que te alcanzan los de la escolta
  AMMO_REFUND_ON_HIT: 1,  // divisas que recuperás al acertar

  WIN_RATIO: 0.70,        // % de federalización necesario
  WIN_HOLD: 4,            // segundos que hay que sostener ese % para ganar

  N_CITIZENS: 44,
  N_SOLDIERS: 14,
  N_ESCORT: 4
};

/* Dificultades: cantidad de "constituyentes" (el del libro) y qué tan duros son */
DP.DIFF = {
  1: { key: 1, name: 'Fácil',   constituents: 10, hp: 3, ballCd: [5.0, 7.0], time: 270, win: 0.55, maxBalls: 2 },
  2: { key: 2, name: 'Normal',  constituents: 15, hp: 4, ballCd: [3.6, 5.4], time: 240, win: 0.62, maxBalls: 3 },
  3: { key: 3, name: 'Difícil', constituents: 20, hp: 5, ballCd: [2.6, 4.0], time: 210, win: 0.70, maxBalls: 5 }
};

DP.TEXT = {
  PHRASE: '¡Viva Rosas, mueran los salvajes unitarios!',
  COUNTER: ['¡Viva la Constitución!', '¡Constitución!', '¡Viva la Constitución!'],
  RESIST: ['¡Constitución!', '¡No me convencen!', '¡Ley y orden!'],
  TITLE: 'DIVISA PUNZÓ',
  SUB: 'Buenos Aires, 1854'
};

DP.RED = '#d4141c';       // rojo punzó
DP.RED_DARK = '#8f0c12';
