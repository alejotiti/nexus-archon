# NEXUS ARCHON — Superpower Architecture Laboratory

A serious, elegant tool for designing, analyzing, and refining superpowers with logical constraints. Built for writers, game designers, worldbuilders, and anyone obsessed with building coherent power systems rather than just slapping "cool abilities" together.

**Core philosophy:** Designing a power isn't inventing something cool — it's constructing a system of capability, limit, control interface, cost, and consequence.

---

## What It Does

The app treats superpowers as engineered systems, not magic wishes. Every power has a mechanism, explicit boundaries, restrictions that affect usability, and metrics that distinguish between theoretical ceiling and practical output.

Ships with **16 deeply defined powers**: probability manipulation, superintelligence, time control, telekinesis, telepathy, regeneration, teleportation, invisibility, superspeed, shapeshifting, gravity control, adaptive evolution, power copying, matter creation, causality manipulation, and flight.

Each one has a real mechanism, clear can/can't lists, toggled properties, selected restrictions, and 15 individually tuned metrics.

### The Probability Manipulation Case

The flagship example. Defined not as wish-granting but as the ability to bias physically possible outcomes — enormously powerful but deeply dependent on user intelligence and system knowledge. This sets the tone for the entire app.

---

## Sections

### Biblioteca (Library)
Browse and filter all powers. Cards show composite scores (Theoretical, Practical, Narrative, Danger) and an omnipotence risk indicator at a glance. Filter by category or search by name/description.

### Forjar (Forge)
Full creation form:
- Name, category, description, mechanism
- What it can and can't do
- 4 fundamental property toggles (physical-only, grants wishes, requires consciousness, interprets abstract goals)
- 15 selectable restriction tags with descriptions
- 15 metric sliders covering raw power, versatility, precision, scalability, usability, mastery difficulty, risk, offense, defense, system control, intelligence dependency, subtlety, narrative quality, conceptual elegance, and omnipotence risk

### Analizar (Analyze)
Deep inspection of any power:
- Composite gauge rings (Theoretical / Practical / Narrative / Danger)
- Detailed metric bars with color-coded severity
- Active restrictions list
- Property badges
- Omnipotence warnings at 4 severity levels
- **AI deep analysis**: rigorous breakdown of theoretical vs practical capacity, intelligence dependency, conceptual traps, incoherences, possible counters, and narrative quality

### Combinar (Combine)
Select 2–4 powers and generate a synthesis via AI:
- Combined name (with style variants)
- Emergent synergies
- New limits arising from the combination
- Why the combination exceeds the sum of its parts
- Whether it collapses into disguised omnipotence
- Concrete usage examples
- Possible countermeasures

### Nombrar (Name)
Name generator across 7 styles:
- **Épico** — grandiose, mythic weight
- **Técnico** — scientific paper / system feel
- **Legendario** — myth, grimoire, lost art
- **Oscuro** — somber, ominous tone
- **Sci-Fi** — futuristic technological aesthetic
- **Filosófico** — contemplative, abstract
- **Minimalista** — short, dense, elegant

Each name includes reasoning. No generic output — names like *Arquitectura del Azar* or *Predominio Estocástico*, never "Ultra Power X."

### Escenarios (Scenarios)
Practical simulation across 10 contexts:
- 1v1 combat
- Large-scale war
- Politics & manipulation
- Extreme survival
- Infiltration
- Global domination
- Absurd but physically possible situations
- Daily life
- Counterespionage
- Natural disaster

The AI considers the power's actual restrictions and explains what's easy, what's hard, what's impossible, and why user intelligence matters.

---

## Technical Details

| Aspect | Detail |
|---|---|
| Framework | React (single-file JSX) |
| Styling | Inline CSS with CSS variables, Tailwind-compatible |
| Fonts | Cormorant Garamond (display), Outfit (body), JetBrains Mono (data) |
| Theme | Dark — deep navy-black, indigo accents, color-coded metrics |
| AI | Anthropic API (Claude Sonnet) for analysis, synthesis, naming, scenarios |
| Language | Spanish (UI and AI prompts) |
| Persistence | `window.storage` for custom powers across sessions |

### Composite Scoring

Scores are computed from weighted metric formulas:
- **Theoretical**: raw power, versatility, scalability, system control (penalized by omnipotence risk)
- **Practical**: usability, precision (penalized by mastery difficulty, risk, intelligence dependency)
- **Narrative**: narrative quality, elegance, subtlety
- **Danger**: raw power, offense, system control, scalability, omnipotence risk

### Omnipotence Risk Detector

Flags powers at 4 severity levels:
- **BAJO** (< 40) — Well-delimited and coherent
- **MODERADO** (40–59) — Within limits, watch for expansion
- **ALTO** (60–79) — Significant risk of absorbing too many domains
- **CRÍTICO** (≥ 80) — Dangerously close to disguised omnipotence

---

## Architecture Decisions

- **Single-file design**: Keeps the app self-contained and deployable as a single React artifact. All components, data, and logic coexist without build complexity.
- **AI as analyst, not generator**: The app doesn't randomly generate powers. It provides structured tools for the user to design powers, then uses AI for deep analysis, combination synthesis, and scenario simulation. The intelligence lives in the framework, the AI enhances it.
- **Restrictions as first-class citizens**: Not an afterthought. Restrictions are selectable, visible in analysis, and directly referenced by AI prompts to produce restriction-aware outputs.
- **Metrics over adjectives**: 15 numeric metrics replace vague labels like "strong" or "versatile." Composite scores aggregate them into meaningful dimensions.
- **Spanish-native**: All UI, data, and AI prompts in Spanish. Names, descriptions, and analysis are generated in Spanish by design.

---

## Extending

- **Add powers**: Push new objects to `SAMPLE_POWERS` following the existing schema, or create them in-app via the Forge.
- **Add restrictions**: Append to `RESTRICTION_TEMPLATES` with an `id`, `label`, and `desc`.
- **Add metrics**: Append to `METRIC_KEYS` and update `defaultMetrics()`, `computeComposite()`, and sample power data.
- **Add scenarios**: Append strings to the `SCENARIOS` array in the Scenarios view.
- **Add categories**: Append to `CATEGORIES`.

All data structures are plain objects and arrays — no ORM, no database, no hidden dependencies.
