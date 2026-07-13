/**
 * Fake products for shelf rows without a CMS item - every shelf in
 * DEIV'S MARKET is stocked and inspectable. Deterministic per slot, so
 * the same shelf always sells the same nonsense. Placeholders are
 * clickable but have no portfolio page (placeholder: true hides the
 * SHOW MORE link in the inspection overlay).
 */

const CATALOG = {
  can: [
    { name: 'SLUDGE CHUNKS', type: 'Canned Something', description: 'Now with 40% more chunk. The label says soup. The can disagrees. Best enjoyed cold, alone, at 3am.' },
    { name: 'MYSTERY MEAT', type: 'Protein (Legally)', description: 'Ask no questions and it will tell you no lies. Won a bronze medal at a fair we cannot verify existed.' },
    { name: 'BEANS ETC.', type: 'Beans & Associates', description: 'Mostly beans. The "etc." is doing a lot of heavy lifting here and we respect its hustle.' },
    { name: 'GLUG CHOWDER', type: 'Corporate Soup', description: 'A GLUG family product. Every can purchased powers the smokestack you can see from your window.' },
  ],
  box: [
    { name: 'SUGAR GRAVEL', type: 'Breakfast Cereal', description: 'Stays crunchy in milk, water, and existential dread. Free toy inside (it is a smaller box).' },
    { name: 'FLAKES OF REGRET', type: 'Cereal, Emotional', description: 'Part of an unbalanced breakfast. Pairs beautifully with hitting snooze four times.' },
    { name: 'CARDBOARD CRUNCH', type: 'Fiber Product', description: 'We stopped pretending. It is the box. You are buying the box. 100% recyclable, 0% digestible.' },
    { name: 'OATY BOIS', type: 'Round Cereal', description: 'Each O inspected by hand for roundness. Rejected Os are sold separately as "commas".' },
  ],
  bottle: [
    { name: 'TAP WATER DELUXE', type: 'Premium Beverage', description: 'From the finest municipal pipes. Aged up to 45 minutes. Notes of chlorine and ambition.' },
    { name: 'EEL JUICE', type: 'Energy Drink', description: 'Do not ask how we juice the eels. Contains electrolytes, allegedly. Banned in two provinces.' },
    { name: 'GLUG CLASSIC', type: 'Cola-Type Fluid', description: 'The taste of a corporation trying its best. Now with a new label and the exact same regrets.' },
    { name: 'HOT SAUCE?', type: 'Condiment (Unverified)', description: 'The question mark is part of the legal name. Scoville rating: yes.' },
  ],
  jar: [
    { name: 'PICKLED DOUBTS', type: 'Preserved Feelings', description: 'Crunchy, sour, and impossible to finish. Once opened, keeps forever in the back of your mind.' },
    { name: "GRANDMA'S SECRET", type: 'Spreadable', description: 'She took the recipe to the grave, so we guessed. Contains at least one secret per jar.' },
    { name: 'HONEY-ISH', type: 'Viscous Product', description: 'Made by bees* (*bee suits worn by staff). Never expires because it refuses to acknowledge time.' },
    { name: 'OLIVE COUNCIL', type: 'Olives, Political', description: 'Twelve olives in tense negotiation with the brine. Do not shake - they are close to an agreement.' },
  ],
  bag: [
    { name: 'AIR (SALTED)', type: 'Chip-Adjacent Snack', description: 'Our finest bagged air, lightly salted, with a commemorative chip at the bottom as tradition demands.' },
    { name: 'CRUMBS ORIGINAL', type: 'Pre-Crushed Snack', description: 'We skipped the middleman (you) and crushed them at the factory. Party size. The party is over.' },
    { name: 'SHRIMP PUFFS', type: 'Puffed Enigma', description: 'Contains no shrimp. Contains no puff, philosophically. Glows faintly under supermarket lighting.' },
    { name: 'LOUD SNAX', type: 'Acoustic Food', description: 'Guaranteed audible from two rooms away. Perfect for quiet movies and important announcements.' },
  ],
  carton: [
    { name: 'MILK-ISH', type: 'White Beverage', description: 'From an animal, probably. Shake well and lower your expectations. Now fortified with vitamins we made up.' },
    { name: 'OAT SLUDGE', type: 'Plant Fluid', description: 'The oats were asked nicely. Barista edition: it foams out of spite.' },
    { name: 'EXPIRED TOMORROW', type: 'Time-Sensitive Dairy', description: 'Always expires tomorrow, forever. A paradox you can pour on cereal. Physicists hate it.' },
    { name: 'EGG NOG (JULY)', type: 'Seasonal Error', description: 'A shipping mistake we have chosen to embrace. Festive under any circumstances. Do not question the nog.' },
  ],
}

// Deterministic pick (same slot always sells the same product)
function pick(seed, arr) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return arr[Math.floor((x - Math.floor(x)) * arr.length)]
}

/**
 * A fake item for a shelf slot. Shape matches CMS items where it matters
 * (id, name, type, description); `placeholder: true` disables the
 * portfolio link in the inspection overlay.
 */
export function makeFakeItem(slotIndex, propType) {
  const entry = pick(slotIndex + 1, CATALOG[propType] || CATALOG.can)
  return {
    id: `shelf-filler-${slotIndex}`,
    placeholder: true,
    name: entry.name,
    type: entry.type,
    description: entry.description,
    inspectionModelUrl: null, // always the procedural prop
    inspectionScale: 1,
  }
}
