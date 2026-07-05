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
  // Atmosphere
  fog: '#a9a79a',        // smoggy warm gray - also the sky/background
  fogNear: 9,
  fogFar: 60,

  // Concrete world
  concrete: '#8f8f8f',       // shelf bodies, facade walls
  concreteLight: '#a5a5a5',  // shelf boards
  concreteDark: '#6f6f6f',   // counter, rail
  floor: '#787672',          // floor plane - slightly warm dark concrete
  doors: '#7c8a89',          // entry doors - faint teal tint

  // Characters get a pop of color ("weird characters" rule)
  cashierFigure: '#c9645c',

  // Products carry the color in an otherwise gray world.
  // Cycled per shelf row - muted-but-loud, dirty tones.
  productAccents: ['#d9b23c', '#5cb5a2', '#d96f6f', '#8aa356', '#b878c9', '#6f87d9'],

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
