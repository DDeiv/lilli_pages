/**
 * Sludge Life-inspired theme - single source of truth for colors.
 *
 * The recipe (from Terri Vellmann's own postmortem): a cold gray concrete
 * world, color reserved for products/accents, toon outlines, hazy fog,
 * and a layer of "digital grime" (VHS-ish post filter) on top.
 *
 * The Windows 95 UI this replaced is preserved in git history
 * (see CLAUDE.md "Style swap" notes) if we ever want it back.
 */

export const SLUDGE = {
  // Atmosphere - STRONG pale warm-green haze; fog is the main depth cue
  // (shading is a flat 2-band toon, so distance = wash-out, like SL)
  fog: '#ccc6a4',
  fogNear: 7,
  fogFar: 42,

  // Every element gets a deliberate color (sampled from the SL screenshot)
  wall: '#b7c2a4',           // interior walls + facade: pale mint-gray
  ceiling: '#9aa287',        // ceiling: deeper warm green-gray
  shelf: '#e8dcc4',          // shelf back panels: off-white (same as boards)
  shelfBoard: '#e8dcc4',     // shelf boards: cream
  rail: '#e05a4a',           // price rail: red-orange (table red)
  counter: '#f0942c',        // checkout cabinet: hero orange (the hot dog stand)
  counterTop: '#efe4cd',     // checkout top: cream
  floor: '#c4a494',          // OUTSIDE floor: pinkish sun-washed concrete
  doors: '#5fb8b0',          // entry doors: teal
  checkerLight: '#e9dfcc',   // inside floor tiles: cream
  checkerDark: '#2e2b26',    // inside floor tiles: brown-black (not pure black)

  // Legacy aliases (a few props still reference these)
  concrete: '#b7c2a4',
  concreteLight: '#e8dcc4',
  concreteDark: '#8a8272',

  // Characters get a pop of color ("weird characters" rule)
  cashierFigure: '#57d996',  // mint-green blob energy (swap if too weird)

  // Products carry the color - screenshot-family saturated pops
  productAccents: ['#f0942c', '#5fd98f', '#e8656e', '#f2c53d', '#f287b0', '#4fa8d9'],

  // Outlines stay as they are (intentional) - defined in JaggedEdges defaults.

  // Lo-fi UI (dark chunky panels, one accent, no graffiti)
  ui: {
    pageBg: '#121210',      // full-page background for non-3D pages
    panel: '#1a1a19',
    panelAlt: '#242422',
    border: '#000000',
    text: '#e8e4d8',
    textDim: '#9a968a',
    accent: '#d8e24a',      // dirty acid yellow-green
    accentText: '#141410',
    link: '#8fd4c2',
    shadow: '6px 6px 0px rgba(0,0,0,0.35)',
    font: 'Courier New, monospace',
    // Subtle grain for panels (very low opacity noise overlay)
    noise: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
  },
};
