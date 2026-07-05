# Plant Evolution Strategy Game - Design Document

## 1. Game Design Structure

**Title:** *Phylogenesis* (Working Title)
**Genre:** Simulation / Strategy / Sandbox
**Platform:** PC (Mouse & Keyboard)
**Perspective:** Top-down 2D (Tileset) with 3D Inspection View

### Core Pillars
1.  **Systemic Depth:** Every part of the plant (root, stem, leaf) has a function and a cost.
2.  **Emergent Evolution:** Form follows function. Players don't sculpt; they guide growth parameters.
3.  **Failure as Narrative:** Collapse is inevitable and instructive.
4.  **Procedural Plausibility:** Alien but biologically grounded.

---

## 2. Core Gameplay Loop

The loop operates on three time scales:

### Micro-Loop (Seconds/Minutes) - *Metabolism & Transport*
*   **Input:** Player adjusts resource allocation sliders (e.g., "Prioritize Root Growth" vs. "Prioritize Leaf Expansion").
*   **Process:** Roots absorb water/nutrients. Leaves generate sugars via photosynthesis. Vascular system transports resources.
*   **Output:** Energy is stored or consumed for maintenance.

### Meso-Loop (Minutes/Hours) - *Growth & Adaptation*
*   **Input:** Player selects a growth node or sets a hormonal gradient (e.g., "Grow towards light").
*   **Process:** The plant physically expands. New cells are generated. Structural load increases.
*   **Output:** New morphology emerges. The plant reaches new resource pockets or fails structurally.

### Macro-Loop (Hours/Days) - *Reproduction & Evolution*
*   **Input:** Player initiates flowering/fruiting phase.
*   **Process:** Pollination occurs (influenced by flower traits). Seeds are produced with genetic mutations.
*   **Output:** The current plant dies (or enters dormancy). A new generation begins with mutated traits, carrying over genetic progress.

---

## 3. Progression System

Progression is not linear (XP/Levels) but **Genetic & Environmental**.

### Tier 1: The Sprout (Survival)
*   **Goal:** Establish a stable energy loop.
*   **Challenge:** Limited energy storage, shallow roots, vulnerability to drying out.
*   **Unlocks:** Basic organ differentiation (Taproot vs. Fibrous root).

### Tier 2: The Structure (Expansion)
*   **Goal:** Verticality and stability.
*   **Challenge:** Gravity, wind, shading self-leaves.
*   **Unlocks:** Lignin (wood), branching algorithms, bark.

### Tier 3: The Reproductive (Legacy)
*   **Goal:** Create viable offspring.
*   **Challenge:** High energy cost of flowers/fruit, attracting pollinators.
*   **Unlocks:** Specialized reproductive organs, toxins, symbiosis.

### Tier 4: The Forest (Ecosystem)
*   **Goal:** Manage a colony of plants.
*   **Challenge:** Resource competition, disease spread, soil depletion.
*   **Unlocks:** Mycorrhizal networks (resource sharing), allelopathy (chemical warfare).

---

## 4. Procedural Generation Specifications

### L-System + Voxel Hybrid
The plant is generated using a modified L-System that reacts to a voxel grid environment.

**Parameters:**
*   `InternodeLength`: Distance between branches.
*   `BranchAngle`: Variance in growth direction.
*   `TropismVector`: Strength of pull towards light (phototropism) or gravity (gravitropism).
*   `ApicalDominance`: Tendency to grow up vs. out.

**Biomorphic Constraints:**
*   **Square-Cube Law:** Cross-sectional area of the stem must support the mass above it. If `Mass > Strength * Area`, the branch snaps.
*   **Phyllotaxy:** Leaves spiral to minimize self-shading (Golden Angle ~137.5 degrees).
*   **Hydraulic Limit:** Maximum height is capped by root pressure and transpiration rates.

### Visual Generation
*   **Skeleton:** The L-System graph.
*   **Mesh:** Procedural mesh generation wrapping the skeleton.
*   **Texture:** Dynamic shaders based on tissue health (green = healthy, brown = lignified, yellow = dying).

---

## 5. Environmental & Evolutionary Systems

### Level 1: Local Environment (The Voxel Grid)
*   **Soil Voxels:** Properties include `WaterContent`, `Nitrogen`, `Phosphorus`, `Density`.
*   **Air Voxels:** Properties include `LightIntensity`, `WindSpeed`, `Humidity`.
*   **Dynamic Agents:**
    *   *Pollinators:* AI agents that seek specific flower colors/scents.
    *   *Pests:* Procedural insects that attack specific tissue types (e.g., sap suckers vs. leaf chewers).

### Level 2: Planetary Climate
*   **Seasons:** Cyclic changes in temperature and light.
*   **Catastrophes:** Droughts, floods, volcanic ash (blocks light).

### Evolution Mechanic
Evolution is "Semi-Lamarckian" for gameplay purposes.
*   **Epigenetics:** If a plant struggles with drought, its seeds will have a `+DroughtResistance` buff but `-GrowthSpeed` debuff.
*   **Mutation:** Random variation applied to base stats (Leaf Size, Stem Girth) during seed generation.

---

## 6. Failure-State Mechanics

Failure is granular, not binary.

1.  **Hydraulic Failure (Wilting):**
    *   *Cause:* Transpiration > Root Absorption.
    *   *Effect:* Leaves stop working. If prolonged, branches die back (Cavitation).
    *   *Recovery:* Shed leaves to reduce water loss.

2.  **Structural Failure (Snapping):**
    *   *Cause:* Wind stress or own weight exceeds stem strength.
    *   *Effect:* Parts of the plant break off. Open wounds attract infection.
    *   *Recovery:* Regrow from lower dormant buds.

3.  **Starvation (Etiolation):**
    *   *Cause:* Negative energy balance (Respiration > Photosynthesis).
    *   *Effect:* Plant consumes its own tissues.
    *   *Recovery:* Desperate growth towards light.

4.  **Systemic Collapse (Death):**
    *   *Cause:* Critical organ failure (root rot, severed main stem).
    *   *Effect:* Game Over for *this* individual. Player selects a seed from the "Seed Bank" (previous successes) to restart.

---

## 7. Player UX Flow

**View 1: The Garden (Main View)**
*   Top-down, 2D pixel-art/stylized view.
*   Shows the plant in the context of the terrain.
*   Overlays: Water map, Nutrient map, Stress map.

**View 2: The Organism (Inspection)**
*   3D rotatable model of the specific plant.
*   X-Ray mode: See internal vascular flow (blue = water, white = sugar).
*   Slicing tool: Check stem cross-section for stability.

**View 3: The Genome (Control)**
*   Not a skill tree, but a "Hormone Mixing Board".
*   Sliders for:
    *   Auxin (Vertical Growth)
    *   Cytokinin (Branching)
    *   Gibberellin (Germination/Fruit)
*   Graphs showing energy income/expense.

---

## 8. Pseudocode: Growth Step

```python
class PlantNode:
    def __init__(self, position, type, parent):
        self.position = position
        self.type = type # ROOT, STEM, LEAF, MERISTEM
        self.resources = {'water': 0, 'sugar': 0}
        self.structural_load = 0

    def step(self, environment):
        # 1. Acquire Resources
        if self.type == ROOT:
            self.resources['water'] += environment.get_water(self.position)
        elif self.type == LEAF:
            self.resources['sugar'] += environment.get_sunlight(self.position) * PHOTOSYNTHESIS_RATE

        # 2. Consume Maintenance Cost
        self.resources['sugar'] -= BASE_METABOLISM
        
        # 3. Transport (simplified diffusion)
        self.exchange_resources_with_neighbors()

        # 4. Check Health
        if self.resources['sugar'] < 0:
            self.die()

class Plant:
    def grow_tick(self):
        # Calculate structural stress bottom-up
        self.calculate_physics()
        
        # Distribute growth hormones top-down
        self.distribute_hormones()
        
        active_meristems = [node for node in self.nodes if node.is_meristem]
        
        for meristem in active_meristems:
            # Decision logic based on local resources and hormones
            if meristem.resources['sugar'] > GROWTH_COST:
                if meristem.hormone_signal == 'GROW_TALL':
                    self.add_node(meristem, direction=UP)
                elif meristem.hormone_signal == 'BRANCH':
                    self.add_node(meristem, direction=SIDEWAYS)
```

---

## 9. Example Gameplay Scenarios

**Scenario A: The Windy Cliff**
*   **Context:** High wind, rocky soil.
*   **Player Strategy:** Invest heavily in root anchoring (high carbon cost). Keep profile low (prostrate growth). Evolve thick, waxy leaves to prevent wind desiccation.
*   **Emergent Result:** A gnarled, creeping pine-like shrub.

**Scenario B: The Dark Jungle Floor**
*   **Context:** Very low light, high humidity, nutrient-rich soil.
*   **Player Strategy:** "All-in" on vertical growth to breach the canopy. Sacrifice structural stability for speed (vines/lianas). Large, thin leaves to catch dappled light.
*   **Emergent Result:** A fragile, climbing vine that relies on (simulated) neighbor trees for support.

---

## 10. Multiplayer Evolutionary Interactions (Asynchronous)

**The Global Seed Bank**
*   When a player's plant produces seeds, the "genotype" is uploaded.
*   Other players' worlds are populated by NPC plants drawn from this database.
*   **Invasive Species Event:** A highly successful player-created plant (e.g., "The Iron Weed") might start appearing in many players' games, outcompeting their native flora. Players must evolve defenses or counter-strategies.

**Pollination Contracts**
*   Players can specialize. One player builds a "Male" plant that produces massive amounts of pollen (high energy cost). Another builds a "Female" plant.
*   Wind/Insect simulation carries genetic traits between neighboring player plots (if spatially mapped) or via the server.
