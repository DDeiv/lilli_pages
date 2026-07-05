/**
 * Scene layout - single source of truth for how the supermarket scales.
 *
 * LINEAR STORE: all aisle segments sit on ONE corridor, one after the
 * other along -Z. The camera walks a straight line through the whole
 * store (no snaking/180° turns - they were disorienting).
 *
 * Every 6 items (3 shelf rows left + 3 right) fills one segment; adding
 * a 7th item appends a new segment behind the previous one and the path
 * simply gets longer.
 *
 * Base measurements are taken from the original hand-placed aisle
 * (scene2.glb coordinates), so segment 0 renders exactly like before.
 */

// ---- Segment module (from the original scene) -------------------------------
export const ITEMS_PER_AISLE = 6;

// Preview floor: render at least this many segments even with few CMS items,
// to get a feel for the store at scale. Set back to 1 once real content
// fills the shelves (content-driven growth still applies beyond this).
export const MIN_AISLES = 3;

const CORRIDOR_X = -5;          // the single camera corridor
const SHELF_LENGTH = 24;        // shelf unit length along Z (measured)
const SEGMENT_GAP = 4;          // gap between consecutive segments
const SEGMENT_SPACING = SHELF_LENGTH + SEGMENT_GAP; // 28

// Product row offsets relative to the corridor center
const LEFT_PRODUCT = { x: -4.187, z: 0.176, ys: [4.656, 2.708, 0.997] };
const RIGHT_PRODUCT = { x: 4.086, z: 0.496, ys: [4.734, 2.708, 0.997] };
const PRODUCT_ROTATION = [0, 0, -Math.PI];
const PRODUCT_SCALE = [-0.313, 0.583, 8.403];

// World-space size of one product strip (measured from scene2.glb:
// origin-centered 2-unit cube geometry x PRODUCT_SCALE).
export const PRODUCT_STRIP_SIZE = { x: 0.626, y: 1.166, z: 16.806 };

// Shelf units relative to the corridor center
const LEFT_SHELF_X = -5.433;
const RIGHT_SHELF_X = 5.5;
const SHELF_SCALE = [0.5, 3, 12];

// Price rail above the left product wall
const RAIL_X = -4.233;

// ---- Cashier / entrance (fixed, does not scale) ------------------------------
export const CASHIER_LOOK_AT = [-7, 3, 21.6];
export const CASHIER_CAMERA_POS = [-4.41, 2.50, 21.57];
export const CASHIER_INTERACT_DISTANCE = 12;

// Tweak these two to taste:
export const STOREFRONT_Z = 40;        // facade distance from the aisles
export const OUTSIDE_TRAVEL = 18;      // how far outside the doors the walk starts

export const DOOR_CENTER_X = -4.25;
export const DOOR_GAP_WIDTH = 5.6;
export const DOOR_GAP_HEIGHT = 5.5;
export const FACADE_HEIGHT = 8;
export const DOOR_OPEN_TRIGGER_Z = STOREFRONT_Z + 5; // camera z below this -> doors open

export const PATH_START = [-4.2, 2.72, STOREFRONT_Z + OUTSIDE_TRAVEL];
// What the camera looks at on a fresh start (the entrance doors)
export const ENTRY_LOOK_AT = [DOOR_CENTER_X, 2.75, STOREFRONT_Z];

// ---- Derived helpers ----------------------------------------------------------

/**
 * Number of segments to render.
 * Mobile browses ONLY the left wall (3 rows per segment), so it may need
 * more segments than desktop to fit the same item count.
 */
export function getAisleCount(itemCount, forMobile = false) {
  const perSegment = forMobile ? 3 : ITEMS_PER_AISLE;
  return Math.max(MIN_AISLES, Math.ceil((itemCount || 0) / perSegment));
}

export function segmentZ(segmentIndex) {
  return -SEGMENT_SPACING * segmentIndex;
}

/**
 * Transforms for every product row slot (segments x 6 slots).
 * Slot order per segment: 3 left rows (top->bottom), then 3 right rows.
 */
export function getProductSlots(itemCount, forMobile = false) {
  const segments = getAisleCount(itemCount, forMobile);
  const slots = [];
  for (let a = 0; a < segments; a++) {
    const zOff = segmentZ(a);
    for (const side of ['left', 'right']) {
      const def = side === 'left' ? LEFT_PRODUCT : RIGHT_PRODUCT;
      def.ys.forEach((y, rowIndex) => {
        slots.push({
          position: [CORRIDOR_X + def.x, y, zOff + def.z],
          rotation: PRODUCT_ROTATION,
          scale: PRODUCT_SCALE,
          segment: a,
          side,
          rowIndex,
        });
      });
    }
  }
  return slots;
}

/**
 * Maps a slot index to the CMS item shown there.
 * Desktop: items fill slots in order (6 per segment, both walls).
 * Mobile: items fill ONLY the left wall (3 per segment); right-wall slots
 * render as plain stock so the scene still looks full.
 */
export function itemIndexForSlot(slotIndex, forMobile = false) {
  if (!forMobile) return slotIndex;
  const withinSegment = slotIndex % 6;
  if (withinSegment >= 3) return -1; // right wall: decoration only on mobile
  return Math.floor(slotIndex / 6) * 3 + withinSegment;
}

/** Shelf units for all segments. */
export function getShelfUnits(itemCount, forMobile = false) {
  const segments = getAisleCount(itemCount, forMobile);
  const units = [];
  for (let a = 0; a < segments; a++) {
    const zOff = segmentZ(a);
    units.push({
      position: [CORRIDOR_X + LEFT_SHELF_X, 3, zOff],
      rotation: [-Math.PI, 0, -Math.PI],
      scale: SHELF_SCALE,
    });
    units.push({
      position: [CORRIDOR_X + RIGHT_SHELF_X, 3, zOff],
      rotation: [0, 0, 0],
      scale: SHELF_SCALE,
    });
  }
  return units;
}

/** Price rails (one above the left product wall of each segment). */
export function getRails(itemCount, forMobile = false) {
  const segments = getAisleCount(itemCount, forMobile);
  const rails = [];
  for (let a = 0; a < segments; a++) {
    rails.push({
      position: [CORRIDOR_X + RAIL_X, 4, segmentZ(a)],
      rotation: [-Math.PI, 0, -Math.PI],
      scale: [0.7, 0.1, 12],
    });
  }
  return rails;
}

/** Ceiling point lights: two per segment + one at the cashier. */
export function getAisleLights(itemCount, forMobile = false) {
  const segments = getAisleCount(itemCount, forMobile);
  const lights = [];
  for (let a = 0; a < segments; a++) {
    const zOff = segmentZ(a);
    lights.push([CORRIDOR_X, 7.6, zOff + 5.7]);
    lights.push([CORRIDOR_X, 7.6, zOff - 5.6]);
  }
  lights.push([-5.45, 7.63, 22.528]); // cashier
  return lights;
}

/**
 * Entry segment only: outside -> through the doors -> up to the cashier.
 * Used by the mobile walk-in (vertical swipe) and as the head of the
 * full desktop path below.
 */
export function getEntryPathPoints() {
  return [
    PATH_START,                          // start outside the supermarket
    [-4.2, 2.6, STOREFRONT_Z + 2],       // approaching the doors
    [-4.2, 2.55, STOREFRONT_Z - 3],      // just inside
    [-4.3, 2.55, (STOREFRONT_Z - 3 + CASHIER_CAMERA_POS[2]) / 2], // stroll towards the cashier
    CASHIER_CAMERA_POS,                  // cashier trigger point
  ];
}

/**
 * Full desktop camera path: entry -> cashier -> ONE straight line down the
 * corridor past every segment. Intermediate points keep the curve's
 * parameterization even so scroll speed feels uniform.
 */
export function getCameraPathPoints(itemCount) {
  const segments = getAisleCount(itemCount);
  const points = [...getEntryPathPoints()];

  points.push([CORRIDOR_X, 2.5, 16]); // corridor entry, in front of segment 0
  for (let a = 0; a < segments; a++) {
    points.push([CORRIDOR_X, 2.3, segmentZ(a)]);
  }
  points.push([CORRIDOR_X, 2.2, segmentZ(segments - 1) - 13]); // just past the last segment

  return points;
}

/** Facade extent - the store is narrow now (single corridor), so it's fixed. */
export function getFacadeExtent() {
  return { xMin: -18, xMax: 14 };
}

/**
 * Store shell: perimeter walls + ceiling enclosing everything from the
 * facade to just past the last segment. Matches the facade's footprint.
 */
export function getStoreShellSpec(itemCount) {
  const segments = Math.max(
    getAisleCount(itemCount, false),
    getAisleCount(itemCount, true)
  );
  const { xMin, xMax } = getFacadeExtent();
  return {
    xMin,
    xMax,
    zFront: STOREFRONT_Z,
    zBack: segmentZ(segments - 1) - 20,
    height: FACADE_HEIGHT,
  };
}

/** Hanging "AISLE N" sign specs, one at the front of each segment. */
export function getAisleSignSpecs(itemCount, forMobile = false) {
  const segments = getAisleCount(itemCount, forMobile);
  const signs = [];
  for (let a = 0; a < segments; a++) {
    signs.push({
      label: `AISLE ${a + 1}`,
      position: [CORRIDOR_X, 6.4, segmentZ(a) + 13.2],
    });
  }
  return signs;
}

/** Floor plane extent (covers the store + the outside approach). */
export function getFloorSpec(itemCount) {
  const segments = Math.max(
    getAisleCount(itemCount, false),
    getAisleCount(itemCount, true)
  );
  const zMin = segmentZ(segments - 1) - 25;
  const zMax = STOREFRONT_Z + OUTSIDE_TRAVEL + 12;
  return {
    // centered plane: position + size (y slightly below the shelf bases
    // to avoid z-fighting where they touch the ground)
    position: [(-18 + 14) / 2, -0.02, (zMin + zMax) / 2],
    size: [60, zMax - zMin],
  };
}

// ---- Mobile browse (camera locked on the LEFT wall) ---------------------------

export const MOBILE_BROWSE = {
  // Camera must stay clear of the RIGHT wall's product strips, which span
  // x -1.227..-0.601 (x=-1 was inside them - camera clipped into products)
  cameraX: -2.4,
  cameraY: 2.7,
  lookX: CORRIDOR_X + LEFT_PRODUCT.x, // -9.187: the product wall
  lookY: 2.8,
  fov: 82,         // wider than the walk-in (75) for usability
  startZ: 8,       // browse starts at the front of segment 0
};

// Walk-in swipe direction: -1 = drag UP to walk forward (page-scroll
// convention, current), +1 = drag DOWN to walk forward. One-line flip.
// Up-to-walk also avoids down-swipes that iOS turns into pull-to-refresh.
export const ENTRY_SWIPE_DIRECTION = -1;

/** Clamped scroll range along the wall (no wrap - the store is linear). */
export function getMobileBrowseBounds(itemCount) {
  const segments = getAisleCount(itemCount, true);
  return {
    max: MOBILE_BROWSE.startZ,
    min: segmentZ(segments - 1) - 10,
  };
}
