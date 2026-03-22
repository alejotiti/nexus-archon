import { useState, useEffect, useCallback, useRef, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   NEXUS ARCHON — Superpower Architecture Laboratory
   ═══════════════════════════════════════════════════════════════ */

// ─── DATA: Categories ───────────────────────────────────────────
const CATEGORIES = [
  "Probabilístico", "Temporal", "Psíquico", "Físico", "Biológico",
  "Espacial", "Energético", "Informacional", "Causal", "Dimensional",
  "Gravitatorio", "Adaptativo", "Cognitivo", "Elemental"
];

const RESTRICTION_TEMPLATES = [
  { id: "phys", label: "Solo estados físicamente posibles", desc: "No puede crear resultados imposibles según las leyes físicas" },
  { id: "no_wish", label: "No concede deseos", desc: "El poder no interpreta intenciones ni autocompleta objetivos abstractos" },
  { id: "no_matter", label: "No puede crear materia", desc: "No genera ni destruye masa/energía, solo la reorganiza" },
  { id: "knowledge", label: "Requiere conocimiento del sistema", desc: "La eficacia depende de cuánto entiende el usuario el sistema objetivo" },
  { id: "range", label: "Alcance limitado", desc: "Opera dentro de un radio o ámbito definido" },
  { id: "concentration", label: "Requiere concentración sostenida", desc: "Se interrumpe si el usuario pierde enfoque" },
  { id: "visual", label: "Requiere contacto visual", desc: "Debe poder ver el objetivo para afectarlo" },
  { id: "backlash", label: "Produce backlash", desc: "Forzar el poder más allá de su límite daña al usuario" },
  { id: "cooldown", label: "Tiene cooldown", desc: "No puede usarse de forma continua, necesita recuperación" },
  { id: "simple_sys", label: "Mejor en sistemas simples", desc: "Pierde precisión en sistemas complejos como sociedades o ecosistemas" },
  { id: "no_autocomplete", label: "No autocompleta rutas causales", desc: "El usuario debe diseñar conscientemente la cadena de eventos" },
  { id: "entropy", label: "Costo entrópico", desc: "Cada uso incrementa el desorden en el entorno circundante" },
  { id: "conscious", label: "Solo con intervención consciente", desc: "No funciona de forma automática ni inconsciente" },
  { id: "fatigue", label: "Fatiga mental acumulativa", desc: "El uso prolongado degrada la capacidad cognitiva del usuario" },
  { id: "no_self", label: "No puede usarse sobre sí mismo", desc: "El poder solo afecta objetivos externos" },
];

const METRIC_KEYS = [
  { key: "rawPower", label: "Potencia Bruta", icon: "⚡" },
  { key: "versatility", label: "Versatilidad", icon: "◈" },
  { key: "precision", label: "Precisión", icon: "◎" },
  { key: "scalability", label: "Escalabilidad", icon: "△" },
  { key: "usability", label: "Usabilidad Práctica", icon: "⬡" },
  { key: "mastery", label: "Dificultad de Dominio", icon: "✧" },
  { key: "risk", label: "Riesgo para el Usuario", icon: "☠" },
  { key: "offense", label: "Capacidad Ofensiva", icon: "⚔" },
  { key: "defense", label: "Capacidad Defensiva", icon: "🛡" },
  { key: "systemControl", label: "Control Sistémico", icon: "⏣" },
  { key: "intDependency", label: "Dependencia de Inteligencia", icon: "🧠" },
  { key: "subtlety", label: "Sutileza", icon: "◌" },
  { key: "narrativeQuality", label: "Calidad Narrativa", icon: "✦" },
  { key: "elegance", label: "Elegancia Conceptual", icon: "❖" },
  { key: "opRisk", label: "Riesgo de Omnipotencia", icon: "⚠" },
];

const defaultMetrics = () => Object.fromEntries(METRIC_KEYS.map(m => [m.key, 50]));

// ─── SAMPLE POWERS ──────────────────────────────────────────────
const SAMPLE_POWERS = [
  {
    id: "prob_manip",
    name: "Manipulación de Probabilidades",
    category: "Probabilístico",
    description: "Capacidad de alterar las probabilidades de ocurrencia de estados físicamente posibles dentro de un sistema dado.",
    mechanism: "Interfiere con las distribuciones de probabilidad cuánticas y macroscópicas, sesgando resultados hacia estados específicos sin violar leyes físicas.",
    canDo: "Sesgar resultados probabilísticos, hacer que eventos improbables pero posibles ocurran, optimizar resultados en sistemas que dependen del azar.",
    cantDo: "Crear eventos imposibles, violar leyes de la física, generar materia de la nada, hacer que alguien actúe contra su voluntad directamente.",
    physicalOnly: true,
    grantsWishes: false,
    needsConscious: true,
    interpretsAbstract: false,
    restrictions: ["phys", "no_wish", "knowledge", "no_autocomplete", "simple_sys", "concentration"],
    metrics: { rawPower: 85, versatility: 90, precision: 60, scalability: 75, usability: 35, mastery: 90, risk: 40, offense: 55, defense: 70, systemControl: 80, intDependency: 95, subtlety: 85, narrativeQuality: 95, elegance: 95, opRisk: 70 },
  },
  {
    id: "superintel",
    name: "Superinteligencia",
    category: "Cognitivo",
    description: "Capacidad cognitiva vastamente superior a cualquier humano, permitiendo modelar sistemas complejos, predecir resultados y diseñar estrategias óptimas.",
    mechanism: "Procesamiento neuronal masivamente paralelo con capacidad de simulación interna de sistemas complejos en tiempo real.",
    canDo: "Modelar cadenas causales, predecir comportamientos, diseñar estrategias óptimas, aprender cualquier disciplina instantáneamente, detectar patrones invisibles.",
    cantDo: "Alterar la realidad, conocer datos que no ha observado (no es omnisciencia), actuar físicamente más allá del cuerpo humano, procesar información que no existe.",
    physicalOnly: true,
    grantsWishes: false,
    needsConscious: true,
    interpretsAbstract: false,
    restrictions: ["phys", "no_wish", "conscious"],
    metrics: { rawPower: 70, versatility: 95, precision: 95, scalability: 90, usability: 80, mastery: 30, risk: 15, offense: 40, defense: 60, systemControl: 85, intDependency: 100, subtlety: 95, narrativeQuality: 85, elegance: 90, opRisk: 50 },
  },
  {
    id: "time_ctrl",
    name: "Control del Tiempo",
    category: "Temporal",
    description: "Capacidad de manipular el flujo temporal: detenerlo, revertirlo, acelerarlo o crear bucles en una zona definida.",
    mechanism: "Genera un campo de distorsión cronológica que altera la métrica temporal del espacio-tiempo local.",
    canDo: "Detener el tiempo en un área, revertir segundos, acelerar procesos, percibir el tiempo más lento, crear pequeños bucles temporales.",
    cantDo: "Viajar arbitrariamente en el tiempo, afectar el pasado lejano, mantener zonas detenidas indefinidamente, evitar paradojas.",
    physicalOnly: true,
    grantsWishes: false,
    needsConscious: true,
    interpretsAbstract: false,
    restrictions: ["phys", "concentration", "backlash", "range", "fatigue"],
    metrics: { rawPower: 95, versatility: 80, precision: 65, scalability: 60, usability: 40, mastery: 85, risk: 75, offense: 80, defense: 90, systemControl: 70, intDependency: 70, subtlety: 50, narrativeQuality: 90, elegance: 85, opRisk: 80 },
  },
  {
    id: "telekinesis",
    name: "Telequinesis",
    category: "Psíquico",
    description: "Capacidad de mover, manipular y ejercer fuerza sobre objetos físicos mediante la voluntad, sin contacto físico.",
    mechanism: "Proyección de campos de fuerza vectoriales controlados mentalmente que interactúan con la materia a nivel macroscópico.",
    canDo: "Mover objetos, generar escudos de fuerza, volar (autolevitación), manipular objetos con precisión milimétrica, ejercer presión a distancia.",
    cantDo: "Manipular a nivel atómico (sin entrenamiento extremo), afectar mentes, crear materia, operar sin línea de percepción.",
    physicalOnly: true,
    grantsWishes: false,
    needsConscious: true,
    interpretsAbstract: false,
    restrictions: ["phys", "concentration", "range", "fatigue", "visual"],
    metrics: { rawPower: 75, versatility: 85, precision: 70, scalability: 70, usability: 65, mastery: 60, risk: 30, offense: 80, defense: 85, systemControl: 40, intDependency: 50, subtlety: 40, narrativeQuality: 70, elegance: 65, opRisk: 40 },
  },
  {
    id: "telepathy",
    name: "Telepatía",
    category: "Psíquico",
    description: "Capacidad de leer, proyectar e interferir con pensamientos y estados mentales de otros seres conscientes.",
    mechanism: "Sintonización con los campos electromagnéticos neuronales, permitiendo decodificar y modular patrones de pensamiento.",
    canDo: "Leer pensamientos superficiales, comunicar telepáticamente, detectar mentiras, implantar sugestiones, sentir emociones ajenas.",
    cantDo: "Control mental absoluto, leer recuerdos profundos sin resistencia, afectar seres sin actividad neural, funcionar a distancia ilimitada.",
    physicalOnly: true,
    grantsWishes: false,
    needsConscious: true,
    interpretsAbstract: false,
    restrictions: ["range", "concentration", "conscious", "backlash"],
    metrics: { rawPower: 60, versatility: 75, precision: 55, scalability: 50, usability: 50, mastery: 70, risk: 45, offense: 50, defense: 55, systemControl: 65, intDependency: 60, subtlety: 90, narrativeQuality: 80, elegance: 75, opRisk: 35 },
  },
  {
    id: "regen",
    name: "Regeneración",
    category: "Biológico",
    description: "Capacidad de reconstruir tejido dañado, órganos perdidos y recuperarse de heridas a velocidad sobrehumana.",
    mechanism: "Aceleración masiva de los procesos de mitosis y diferenciación celular con corrección de errores genéticos en tiempo real.",
    canDo: "Curar heridas en segundos, regenerar extremidades, recuperarse de venenos, resistir enfermedades, frenar el envejecimiento.",
    cantDo: "Sobrevivir a destrucción total, regenerar instantáneamente, funcionar sin energía calórica, resistir daño que supere la tasa de regeneración.",
    physicalOnly: true,
    grantsWishes: false,
    needsConscious: false,
    interpretsAbstract: false,
    restrictions: ["phys", "no_matter"],
    metrics: { rawPower: 65, versatility: 30, precision: 20, scalability: 40, usability: 95, mastery: 10, risk: 15, offense: 10, defense: 95, systemControl: 5, intDependency: 5, subtlety: 60, narrativeQuality: 70, elegance: 60, opRisk: 20 },
  },
  {
    id: "teleport",
    name: "Teletransportación",
    category: "Espacial",
    description: "Capacidad de trasladarse instantáneamente entre dos puntos del espacio sin recorrer la distancia intermedia.",
    mechanism: "Colapso controlado del espacio-tiempo local que conecta dos puntos mediante un puente Einstein-Rosen microscópico.",
    canDo: "Moverse instantáneamente, transportar objetos tocados, escapar de cualquier confinamiento, aparecer en posiciones estratégicas.",
    cantDo: "Transportar a lugares nunca visitados o no visualizados, llevar objetos más grandes que lo tocado, funcionar sin coordenadas mentales.",
    physicalOnly: true,
    grantsWishes: false,
    needsConscious: true,
    interpretsAbstract: false,
    restrictions: ["phys", "conscious", "knowledge", "cooldown"],
    metrics: { rawPower: 70, versatility: 75, precision: 80, scalability: 55, usability: 70, mastery: 50, risk: 35, offense: 50, defense: 90, systemControl: 20, intDependency: 40, subtlety: 70, narrativeQuality: 65, elegance: 60, opRisk: 30 },
  },
  {
    id: "invis",
    name: "Invisibilidad",
    category: "Físico",
    description: "Capacidad de volverse imperceptible a la vista al desviar o absorber la luz visible alrededor del cuerpo.",
    mechanism: "Generación de un campo de refracción que curva los fotones alrededor del usuario, reconstruyendo la imagen del fondo.",
    canDo: "Volverse invisible al espectro visible, ocultar objetos tocados, infiltrarse, observar sin ser detectado.",
    cantDo: "Ocultar sonido, olor o calor, volverse intangible, mantener invisibilidad durante esfuerzo físico intenso, engañar sensores no ópticos.",
    physicalOnly: true,
    grantsWishes: false,
    needsConscious: true,
    interpretsAbstract: false,
    restrictions: ["phys", "concentration", "conscious", "fatigue"],
    metrics: { rawPower: 30, versatility: 50, precision: 60, scalability: 25, usability: 70, mastery: 35, risk: 10, offense: 25, defense: 65, systemControl: 15, intDependency: 25, subtlety: 95, narrativeQuality: 55, elegance: 50, opRisk: 10 },
  },
  {
    id: "speed",
    name: "Supervelocidad",
    category: "Físico",
    description: "Capacidad de moverse, reaccionar y procesar información a velocidades vastamente superiores a las humanas.",
    mechanism: "Campo cinético personal que reduce la inercia aparente y protege al cuerpo de fuerzas G, acelerando también la percepción neural.",
    canDo: "Correr a velocidades supersónicas, esquivar proyectiles, pensar y reaccionar miles de veces más rápido, generar viento y fricción controlada.",
    cantDo: "Mover objetos externos a su velocidad sin dañarlos, percibir en cámara lenta indefinidamente, evitar el consumo calórico extremo.",
    physicalOnly: true,
    grantsWishes: false,
    needsConscious: false,
    interpretsAbstract: false,
    restrictions: ["phys", "fatigue", "no_matter"],
    metrics: { rawPower: 80, versatility: 60, precision: 50, scalability: 45, usability: 75, mastery: 40, risk: 35, offense: 85, defense: 80, systemControl: 10, intDependency: 20, subtlety: 15, narrativeQuality: 60, elegance: 45, opRisk: 35 },
  },
  {
    id: "shapeshift",
    name: "Cambio de Forma",
    category: "Biológico",
    description: "Capacidad de alterar la estructura física del propio cuerpo, adoptando otras formas, tamaños o configuraciones biológicas.",
    mechanism: "Control total sobre la expresión genética y la estructura celular, permitiendo reconfiguración somática en tiempo real.",
    canDo: "Imitar apariencias, cambiar tamaño corporal, generar estructuras biológicas (garras, alas), adaptar el cuerpo al entorno.",
    cantDo: "Cambiar masa total (conservación), mantener formas inestables indefinidamente, replicar poderes de otros, transformarse en materia inorgánica.",
    physicalOnly: true,
    grantsWishes: false,
    needsConscious: true,
    interpretsAbstract: false,
    restrictions: ["phys", "no_matter", "concentration", "conscious", "knowledge"],
    metrics: { rawPower: 55, versatility: 85, precision: 60, scalability: 50, usability: 45, mastery: 75, risk: 40, offense: 55, defense: 70, systemControl: 10, intDependency: 55, subtlety: 80, narrativeQuality: 75, elegance: 70, opRisk: 30 },
  },
  {
    id: "grav_ctrl",
    name: "Control Gravitatorio",
    category: "Gravitatorio",
    description: "Capacidad de manipular la fuerza gravitatoria en zonas específicas: aumentarla, reducirla, invertirla o direccionarla.",
    mechanism: "Modulación del tensor de curvatura espacio-temporal local, alterando cómo la masa-energía deforma el espacio circundante.",
    canDo: "Crear zonas de gravedad cero, aplastar con gravedad aumentada, volar, desviar proyectiles, generar microsingularidades.",
    cantDo: "Crear agujeros negros estables, afectar gravedad a escala planetaria, operar sin rango definido, evitar efectos de marea.",
    physicalOnly: true,
    grantsWishes: false,
    needsConscious: true,
    interpretsAbstract: false,
    restrictions: ["phys", "range", "concentration", "backlash"],
    metrics: { rawPower: 85, versatility: 70, precision: 55, scalability: 65, usability: 45, mastery: 70, risk: 60, offense: 85, defense: 80, systemControl: 35, intDependency: 55, subtlety: 30, narrativeQuality: 80, elegance: 80, opRisk: 55 },
  },
  {
    id: "adapt_evo",
    name: "Adaptación Evolutiva",
    category: "Adaptativo",
    description: "El cuerpo se adapta automáticamente a cualquier amenaza o entorno, desarrollando contramedidas biológicas en tiempo real.",
    mechanism: "Hiperevolución somática dirigida por un sistema inmune-neural que identifica amenazas y reconfigura el fenotipo para contrarrestarlas.",
    canDo: "Desarrollar resistencia a daños repetidos, adaptar el cuerpo a entornos extremos, generar defensas contra venenos, volverse más fuerte con cada amenaza.",
    cantDo: "Adaptarse a lo que no ha experimentado, responder instantáneamente a la primera exposición, mantener todas las adaptaciones simultáneamente, adaptarse a daño conceptual.",
    physicalOnly: true,
    grantsWishes: false,
    needsConscious: false,
    interpretsAbstract: false,
    restrictions: ["phys", "no_matter"],
    metrics: { rawPower: 70, versatility: 60, precision: 15, scalability: 80, usability: 90, mastery: 10, risk: 20, offense: 30, defense: 95, systemControl: 5, intDependency: 5, subtlety: 40, narrativeQuality: 85, elegance: 80, opRisk: 45 },
  },
  {
    id: "power_copy",
    name: "Copia de Poderes",
    category: "Adaptativo",
    description: "Capacidad de replicar temporalmente las habilidades de otros usuarios de poderes tras exposición directa.",
    mechanism: "Escaneo y emulación del patrón energético/biológico/cuántico que genera un poder en otro usuario, creando una copia funcional temporal.",
    canDo: "Copiar un poder al observarlo en uso, usar versiones básicas de poderes copiados, mantener un repertorio limitado de copias.",
    cantDo: "Copiar sin exposición, dominar instantáneamente un poder copiado, mantener copias indefinidamente, copiar poderes que dependen de biología única.",
    physicalOnly: true,
    grantsWishes: false,
    needsConscious: true,
    interpretsAbstract: false,
    restrictions: ["visual", "cooldown", "concentration", "knowledge"],
    metrics: { rawPower: 60, versatility: 95, precision: 40, scalability: 85, usability: 35, mastery: 85, risk: 50, offense: 60, defense: 60, systemControl: 30, intDependency: 75, subtlety: 50, narrativeQuality: 80, elegance: 70, opRisk: 65 },
  },
  {
    id: "matter_create",
    name: "Creación de Materia",
    category: "Energético",
    description: "Capacidad de convertir energía en materia, generando objetos o sustancias a partir de la nada aparente.",
    mechanism: "Conversión directa de energía en masa según E=mc², con control sobre la estructura atómica y molecular del resultado.",
    canDo: "Crear objetos sólidos, generar sustancias químicas, materializar herramientas, producir elementos específicos.",
    cantDo: "Crear materia sin costo energético proporcional, generar materia exótica o imposible, crear seres vivos, producir en escala masiva sin agotamiento.",
    physicalOnly: true,
    grantsWishes: false,
    needsConscious: true,
    interpretsAbstract: false,
    restrictions: ["phys", "knowledge", "fatigue", "conscious", "backlash"],
    metrics: { rawPower: 80, versatility: 80, precision: 65, scalability: 55, usability: 40, mastery: 80, risk: 55, offense: 65, defense: 50, systemControl: 45, intDependency: 70, subtlety: 35, narrativeQuality: 70, elegance: 65, opRisk: 60 },
  },
  {
    id: "causal_manip",
    name: "Manipulación de la Causalidad",
    category: "Causal",
    description: "Capacidad de alterar las relaciones causa-efecto entre eventos, redefiniendo qué resultados se derivan de qué acciones.",
    mechanism: "Intervención directa sobre la estructura causal del universo local, reescribiendo enlaces entre eventos en la cadena de consecuencias.",
    canDo: "Hacer que una acción produzca un resultado diferente al esperado, desconectar causas de sus efectos, crear nuevos enlaces causales.",
    cantDo: "Crear eventos sin causa, alterar causalidad a escala cósmica, evitar paradojas lógicas, operar sin comprensión del sistema causal.",
    physicalOnly: false,
    grantsWishes: false,
    needsConscious: true,
    interpretsAbstract: false,
    restrictions: ["knowledge", "concentration", "backlash", "no_autocomplete", "fatigue"],
    metrics: { rawPower: 95, versatility: 90, precision: 45, scalability: 70, usability: 20, mastery: 95, risk: 85, offense: 70, defense: 75, systemControl: 90, intDependency: 95, subtlety: 70, narrativeQuality: 95, elegance: 90, opRisk: 90 },
  },
  {
    id: "flight",
    name: "Vuelo",
    category: "Físico",
    description: "Capacidad de desplazarse libremente por el aire desafiando la gravedad, con control sobre dirección, velocidad y altitud.",
    mechanism: "Generación de un campo antigravitatorio personal que neutraliza la atracción gravitatoria y permite propulsión direccional.",
    canDo: "Elevarse, flotar, volar a alta velocidad, maniobrar en tres dimensiones, transportar peso adicional limitado.",
    cantDo: "Volar en el vacío (sin referencia gravitatoria), alcanzar velocidades orbitales, llevar cargas masivas, resistir condiciones de gran altitud.",
    physicalOnly: true,
    grantsWishes: false,
    needsConscious: true,
    interpretsAbstract: false,
    restrictions: ["phys", "conscious", "fatigue"],
    metrics: { rawPower: 35, versatility: 40, precision: 60, scalability: 25, usability: 85, mastery: 25, risk: 20, offense: 20, defense: 50, systemControl: 5, intDependency: 10, subtlety: 15, narrativeQuality: 45, elegance: 40, opRisk: 5 },
  },
];

// ─── HELPER: Compute composite scores ────────────────────────────
function computeComposite(metrics) {
  const w = {
    theoretical: { rawPower: 3, versatility: 2, scalability: 2, systemControl: 2, opRisk: -1 },
    practical: { usability: 3, precision: 2, mastery: -2, risk: -1, intDependency: -1 },
    narrative: { narrativeQuality: 3, elegance: 3, subtlety: 2 },
    danger: { rawPower: 2, offense: 2, systemControl: 2, scalability: 1, opRisk: 2 },
  };
  const calc = (weights) => {
    let sum = 0, totalW = 0;
    for (const [k, v] of Object.entries(weights)) {
      const absV = Math.abs(v);
      sum += (metrics[k] || 50) * v;
      totalW += absV * 100;
    }
    return Math.max(0, Math.min(100, Math.round((sum / totalW) * 100 + 50)));
  };
  return {
    theoretical: calc(w.theoretical),
    practical: calc(w.practical),
    narrative: calc(w.narrative),
    danger: calc(w.danger),
  };
}

function getOpRiskLevel(metrics) {
  const score = metrics.opRisk || 0;
  if (score >= 80) return { level: "CRÍTICO", color: "#ff2d55", msg: "Este poder está peligrosamente cerca de ser omnipotencia disfrazada." };
  if (score >= 60) return { level: "ALTO", color: "#ff9500", msg: "Riesgo significativo de que este poder absorba demasiados dominios." };
  if (score >= 40) return { level: "MODERADO", color: "#ffcc00", msg: "Dentro de límites razonables, pero vigilar expansión." };
  return { level: "BAJO", color: "#30d158", msg: "Poder bien delimitado y coherente." };
}

// ─── AI CALL HELPER ──────────────────────────────────────────────
async function callAI(systemPrompt, userPrompt) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    const data = await res.json();
    return data.content?.map(b => b.text || "").join("\n") || "Error en la respuesta.";
  } catch (e) {
    return "Error de conexión con el análisis. Intenta de nuevo.";
  }
}

// ─── STYLES (injected) ──────────────────────────────────────────
const FONT_URL = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap";

const GlobalStyles = () => (
  <style>{`
    @import url('${FONT_URL}');
    :root {
      --bg-deep: #08090d;
      --bg-panel: #0e1017;
      --bg-card: #141621;
      --bg-hover: #1a1d2e;
      --bg-input: #111320;
      --border: #1e2235;
      --border-accent: #2a2f4a;
      --text-primary: #e8eaed;
      --text-secondary: #8b8fa3;
      --text-muted: #555876;
      --accent: #6366f1;
      --accent-glow: #818cf820;
      --accent2: #a78bfa;
      --danger: #ff2d55;
      --warn: #ff9500;
      --success: #30d158;
      --gold: #fbbf24;
      --font-display: 'Cormorant Garamond', serif;
      --font-body: 'Outfit', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg-deep); color: var(--text-primary); font-family: var(--font-body); }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg-deep); }
    ::-webkit-scrollbar-thumb { background: var(--border-accent); border-radius: 3px; }
    input, textarea, select {
      background: var(--bg-input);
      border: 1px solid var(--border);
      color: var(--text-primary);
      font-family: var(--font-body);
      font-size: 14px;
      padding: 10px 14px;
      border-radius: 8px;
      outline: none;
      transition: border-color 0.2s;
      width: 100%;
    }
    input:focus, textarea:focus, select:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }
    textarea { resize: vertical; min-height: 70px; }
    select { cursor: pointer; appearance: none; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 15px var(--accent-glow); } 50% { box-shadow: 0 0 30px var(--accent-glow); } }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .fade-up { animation: fadeUp 0.4s ease-out both; }
    .shimmer-text {
      background: linear-gradient(90deg, var(--accent) 0%, var(--accent2) 50%, var(--accent) 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmer 3s linear infinite;
    }
  `}</style>
);

// ─── REUSABLE COMPONENTS ────────────────────────────────────────
const Btn = ({ children, onClick, variant = "primary", disabled, small, style = {} }) => {
  const base = {
    fontFamily: "var(--font-body)", fontWeight: 500, cursor: disabled ? "not-allowed" : "pointer",
    border: "none", borderRadius: "8px", transition: "all 0.2s",
    padding: small ? "6px 14px" : "10px 20px", fontSize: small ? "13px" : "14px",
    opacity: disabled ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: "6px",
    ...(variant === "primary" ? { background: "var(--accent)", color: "#fff" } :
      variant === "ghost" ? { background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)" } :
      variant === "danger" ? { background: "var(--danger)", color: "#fff" } :
      { background: "var(--bg-hover)", color: "var(--text-primary)" }),
    ...style,
  };
  return <button style={base} onClick={onClick} disabled={disabled} onMouseEnter={e => { if (!disabled) e.target.style.opacity = "0.85"; }} onMouseLeave={e => { e.target.style.opacity = disabled ? "0.5" : "1"; }}>{children}</button>;
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", ...style }}>{children}</div>
);

const Label = ({ children }) => (
  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-mono)" }}>{children}</label>
);

const Toggle = ({ checked, onChange, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => onChange(!checked)}>
    <div style={{
      width: 40, height: 22, borderRadius: 11, background: checked ? "var(--accent)" : "var(--border-accent)",
      position: "relative", transition: "all 0.2s",
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: 9, background: "#fff", position: "absolute",
        top: 2, left: checked ? 20 : 2, transition: "left 0.2s",
      }} />
    </div>
    <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{label}</span>
  </div>
);

const MetricSlider = ({ label, icon, value, onChange }) => {
  const barColor = value > 80 ? "var(--danger)" : value > 60 ? "var(--warn)" : value > 40 ? "var(--accent)" : value > 20 ? "var(--accent2)" : "var(--text-muted)";
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
        <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{icon} {label}</span>
        <span style={{ fontSize: "12px", color: barColor, fontFamily: "var(--font-mono)", fontWeight: 600 }}>{value}</span>
      </div>
      <input type="range" min={0} max={100} value={value} onChange={e => onChange(parseInt(e.target.value))}
        style={{ width: "100%", accentColor: barColor, height: "4px", cursor: "pointer" }} />
    </div>
  );
};

const MetricBar = ({ label, icon, value }) => {
  const barColor = value > 80 ? "var(--danger)" : value > 60 ? "var(--warn)" : value > 40 ? "var(--accent)" : value > 20 ? "var(--accent2)" : "var(--text-muted)";
  return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
        <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{icon} {label}</span>
        <span style={{ fontSize: "11px", color: barColor, fontFamily: "var(--font-mono)", fontWeight: 600 }}>{value}</span>
      </div>
      <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: barColor, borderRadius: 2, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
};

const CompositeGauge = ({ label, value, color }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{
      width: 72, height: 72, borderRadius: "50%", border: `3px solid ${color}20`,
      display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px",
      background: `conic-gradient(${color} ${value * 3.6}deg, var(--bg-deep) 0deg)`,
      position: "relative",
    }}>
      <div style={{
        width: 58, height: 58, borderRadius: "50%", background: "var(--bg-card)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "16px", fontWeight: 700, color, fontFamily: "var(--font-mono)",
      }}>{value}</div>
    </div>
    <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>{label}</span>
  </div>
);

// ─── TAB NAV ──────────────────────────────────────────────────
const TABS = [
  { id: "library", label: "Biblioteca", icon: "⬡" },
  { id: "create", label: "Forjar", icon: "◈" },
  { id: "analyze", label: "Analizar", icon: "◎" },
  { id: "combine", label: "Combinar", icon: "⟡" },
  { id: "names", label: "Nombrar", icon: "✦" },
  { id: "scenarios", label: "Escenarios", icon: "⏣" },
];

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function NexusArchon() {
  const [tab, setTab] = useState("library");
  const [powers, setPowers] = useState(SAMPLE_POWERS);
  const [selectedPower, setSelectedPower] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");

  // Persistence
  useEffect(() => {
    (async () => {
      try {
        const stored = await window.storage.get("powers-data");
        if (stored?.value) {
          const parsed = JSON.parse(stored.value);
          if (parsed.length > 0) setPowers(parsed);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try { await window.storage.set("powers-data", JSON.stringify(powers)); } catch {}
    })();
  }, [powers]);

  const addPower = (power) => {
    const newP = { ...power, id: "custom_" + Date.now() };
    setPowers(prev => [...prev, newP]);
    setSelectedPower(newP);
    setTab("analyze");
  };

  const deletePower = (id) => {
    setPowers(prev => prev.filter(p => p.id !== id));
    if (selectedPower?.id === id) setSelectedPower(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-deep)" }}>
      <GlobalStyles />

      {/* ─── HEADER ─── */}
      <header style={{
        padding: "24px 32px 0", borderBottom: "1px solid var(--border)",
        background: "linear-gradient(180deg, #0e101a 0%, var(--bg-deep) 100%)",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "20px" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "32px", fontWeight: 700, letterSpacing: "-0.02em" }}>
            <span className="shimmer-text">NEXUS ARCHON</span>
          </h1>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Laboratorio de Poderes
          </span>
        </div>
        <nav style={{ display: "flex", gap: "4px" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: tab === t.id ? 600 : 400,
              color: tab === t.id ? "var(--accent)" : "var(--text-muted)", background: tab === t.id ? "var(--bg-card)" : "transparent",
              border: "1px solid", borderColor: tab === t.id ? "var(--border)" : "transparent", borderBottom: "none",
              borderRadius: "8px 8px 0 0", padding: "10px 18px", cursor: "pointer", transition: "all 0.2s",
            }}>
              <span style={{ marginRight: "6px" }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* ─── CONTENT ─── */}
      <main style={{ padding: "24px 32px", maxWidth: "1400px", margin: "0 auto" }}>
        {tab === "library" && <LibraryView powers={powers} onSelect={p => { setSelectedPower(p); setTab("analyze"); }} onDelete={deletePower} />}
        {tab === "create" && <CreateView onSave={addPower} />}
        {tab === "analyze" && <AnalyzeView power={selectedPower} powers={powers} onSelect={setSelectedPower} aiLoading={aiLoading} setAiLoading={setAiLoading} aiResult={aiResult} setAiResult={setAiResult} />}
        {tab === "combine" && <CombineView powers={powers} aiLoading={aiLoading} setAiLoading={setAiLoading} aiResult={aiResult} setAiResult={setAiResult} />}
        {tab === "names" && <NamesView powers={powers} aiLoading={aiLoading} setAiLoading={setAiLoading} aiResult={aiResult} setAiResult={setAiResult} />}
        {tab === "scenarios" && <ScenariosView powers={powers} aiLoading={aiLoading} setAiLoading={setAiLoading} aiResult={aiResult} setAiResult={setAiResult} />}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LIBRARY VIEW
// ═══════════════════════════════════════════════════════════════
function LibraryView({ powers, onSelect, onDelete }) {
  const [filter, setFilter] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const cats = [...new Set(powers.map(p => p.category))];
  const filtered = powers.filter(p => {
    const matchText = p.name.toLowerCase().includes(filter.toLowerCase()) || p.description.toLowerCase().includes(filter.toLowerCase());
    const matchCat = catFilter === "all" || p.category === catFilter;
    return matchText && matchCat;
  });

  return (
    <div className="fade-up">
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <input placeholder="Buscar poderes..." value={filter} onChange={e => setFilter(e.target.value)}
          style={{ maxWidth: "320px" }} />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ maxWidth: "200px" }}>
          <option value="all">Todas las categorías</option>
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
        {filtered.map(p => {
          const comp = computeComposite(p.metrics);
          const opRisk = getOpRiskLevel(p.metrics);
          return (
            <Card key={p.id} style={{ cursor: "pointer", transition: "all 0.2s", position: "relative" }}>
              <div onClick={() => onSelect(p)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <span style={{ fontSize: "10px", color: "var(--accent)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{p.category}</span>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, marginTop: "2px" }}>{p.name}</h3>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: opRisk.color, marginTop: "8px", flexShrink: 0 }} title={`Riesgo OP: ${opRisk.level}`} />
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.description}</p>
                <div style={{ display: "flex", gap: "16px", fontSize: "11px", fontFamily: "var(--font-mono)" }}>
                  <span style={{ color: "var(--accent)" }}>TEO {comp.theoretical}</span>
                  <span style={{ color: "var(--success)" }}>PRA {comp.practical}</span>
                  <span style={{ color: "var(--gold)" }}>NAR {comp.narrative}</span>
                  <span style={{ color: "var(--danger)" }}>PEL {comp.danger}</span>
                </div>
              </div>
              {p.id.startsWith("custom_") && (
                <button onClick={e => { e.stopPropagation(); onDelete(p.id); }}
                  style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "16px" }}
                  title="Eliminar">×</button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CREATE VIEW
// ═══════════════════════════════════════════════════════════════
function CreateView({ onSave }) {
  const empty = {
    name: "", category: CATEGORIES[0], description: "", mechanism: "", canDo: "", cantDo: "",
    physicalOnly: true, grantsWishes: false, needsConscious: true, interpretsAbstract: false,
    restrictions: [], metrics: defaultMetrics(),
  };
  const [form, setForm] = useState(empty);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const toggleRestriction = (id) => setForm(prev => ({
    ...prev, restrictions: prev.restrictions.includes(id) ? prev.restrictions.filter(r => r !== id) : [...prev.restrictions, id],
  }));
  const setMetric = (key, val) => setForm(prev => ({ ...prev, metrics: { ...prev.metrics, [key]: val } }));

  const canSave = form.name.trim().length > 0 && form.description.trim().length > 0;

  return (
    <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
      {/* LEFT COL */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Card>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>Forjar Nuevo Poder</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div><Label>Nombre del Poder</Label><input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ej: Manipulación de Probabilidades" /></div>
            <div><Label>Categoría</Label><select value={form.category} onChange={e => set("category", e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select></div>
            <div><Label>Descripción General</Label><textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="¿Qué hace este poder a nivel fundamental?" /></div>
            <div><Label>Mecanismo Real</Label><textarea value={form.mechanism} onChange={e => set("mechanism", e.target.value)} placeholder="¿Cómo funciona realmente? ¿Cuál es el principio?" /></div>
            <div><Label>Qué puede hacer</Label><textarea value={form.canDo} onChange={e => set("canDo", e.target.value)} /></div>
            <div><Label>Qué NO puede hacer</Label><textarea value={form.cantDo} onChange={e => set("cantDo", e.target.value)} /></div>
          </div>
        </Card>

        <Card>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 600, marginBottom: "12px" }}>Propiedades Fundamentales</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Toggle checked={form.physicalOnly} onChange={v => set("physicalOnly", v)} label="Solo opera sobre estados físicamente posibles" />
            <Toggle checked={form.grantsWishes} onChange={v => set("grantsWishes", v)} label="Concede deseos / interpreta intenciones" />
            <Toggle checked={form.needsConscious} onChange={v => set("needsConscious", v)} label="Requiere activación consciente" />
            <Toggle checked={form.interpretsAbstract} onChange={v => set("interpretsAbstract", v)} label="Interpreta objetivos abstractos" />
          </div>
        </Card>

        <Card>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 600, marginBottom: "12px" }}>Restricciones</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {RESTRICTION_TEMPLATES.map(r => (
              <button key={r.id} onClick={() => toggleRestriction(r.id)}
                title={r.desc}
                style={{
                  padding: "6px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer",
                  fontFamily: "var(--font-body)", border: "1px solid",
                  background: form.restrictions.includes(r.id) ? "var(--accent)" : "var(--bg-input)",
                  color: form.restrictions.includes(r.id) ? "#fff" : "var(--text-secondary)",
                  borderColor: form.restrictions.includes(r.id) ? "var(--accent)" : "var(--border)",
                  transition: "all 0.2s",
                }}>
                {r.label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* RIGHT COL */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Card>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>Métricas de Poder</h3>
          {METRIC_KEYS.map(m => (
            <MetricSlider key={m.key} label={m.label} icon={m.icon} value={form.metrics[m.key]} onChange={v => setMetric(m.key, v)} />
          ))}
        </Card>

        <Btn onClick={() => { if (canSave) onSave(form); }} disabled={!canSave} style={{ width: "100%", padding: "14px", fontSize: "15px", justifyContent: "center" }}>
          ◈ Forjar Poder
        </Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ANALYZE VIEW
// ═══════════════════════════════════════════════════════════════
function AnalyzeView({ power, powers, onSelect, aiLoading, setAiLoading, aiResult, setAiResult }) {
  if (!power) {
    return (
      <div className="fade-up" style={{ textAlign: "center", padding: "80px 0" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "16px", marginBottom: "16px" }}>Selecciona un poder desde la Biblioteca para analizarlo.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
          {powers.slice(0, 6).map(p => (
            <Btn key={p.id} variant="ghost" small onClick={() => onSelect(p)}>{p.name}</Btn>
          ))}
        </div>
      </div>
    );
  }

  const comp = computeComposite(power.metrics);
  const opRisk = getOpRiskLevel(power.metrics);
  const restrictions = RESTRICTION_TEMPLATES.filter(r => power.restrictions.includes(r.id));

  const runDeepAnalysis = async () => {
    setAiLoading(true);
    setAiResult("");
    const sysPrompt = `Eres un analista de sistemas de poderes. Hablas en español. Tu trabajo es analizar superpoderes con rigor lógico, como si fueras un diseñador de sistemas de juego o un teórico de mundos ficticios. NUNCA digas que eres una IA. Responde en texto plano sin markdown.`;
    const userPrompt = `Analiza en profundidad este poder:

NOMBRE: ${power.name}
CATEGORÍA: ${power.category}
DESCRIPCIÓN: ${power.description}
MECANISMO: ${power.mechanism}
PUEDE: ${power.canDo}
NO PUEDE: ${power.cantDo}
SOLO FÍSICO: ${power.physicalOnly}
CONCEDE DESEOS: ${power.grantsWishes}
REQUIERE CONSCIENCIA: ${power.needsConscious}
INTERPRETA ABSTRACTO: ${power.interpretsAbstract}
RESTRICCIONES: ${restrictions.map(r => r.label).join(", ")}
MÉTRICAS: ${JSON.stringify(power.metrics)}

Analiza:
1. Capacidad teórica vs capacidad práctica real
2. Dependencia de la inteligencia del usuario
3. Posibles trampas conceptuales o incoherencias en la definición
4. Formas en que este poder podría ser mal usado como omnipotencia disfrazada
5. Contramedidas posibles contra este poder
6. Qué tan narrativamente interesante es y por qué
7. Si las restricciones son coherentes con el mecanismo

Sé específico, concreto y analítico. No seas genérico.`;

    const result = await callAI(sysPrompt, userPrompt);
    setAiResult(result);
    setAiLoading(false);
  };

  return (
    <div className="fade-up">
      {/* Power selector */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {powers.map(p => (
          <button key={p.id} onClick={() => { onSelect(p); setAiResult(""); }}
            style={{
              padding: "5px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer",
              fontFamily: "var(--font-body)", border: "1px solid",
              background: p.id === power.id ? "var(--accent)" : "var(--bg-input)",
              color: p.id === power.id ? "#fff" : "var(--text-secondary)",
              borderColor: p.id === power.id ? "var(--accent)" : "var(--border)",
            }}>
            {p.name}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* LEFT: Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Card>
            <span style={{ fontSize: "10px", color: "var(--accent)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{power.category}</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, margin: "4px 0 12px" }}>{power.name}</h2>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "12px" }}>{power.description}</p>
            {power.mechanism && <div style={{ marginBottom: "10px" }}><Label>Mecanismo</Label><p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{power.mechanism}</p></div>}
            {power.canDo && <div style={{ marginBottom: "10px" }}><Label>Puede</Label><p style={{ fontSize: "13px", color: "var(--success)", lineHeight: 1.5 }}>{power.canDo}</p></div>}
            {power.cantDo && <div><Label>No Puede</Label><p style={{ fontSize: "13px", color: "var(--danger)", lineHeight: 1.5 }}>{power.cantDo}</p></div>}
          </Card>

          <Card>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 600, marginBottom: "10px" }}>Propiedades</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "12px" }}>
              <PropBadge label="Solo físico" active={power.physicalOnly} positive />
              <PropBadge label="Concede deseos" active={power.grantsWishes} positive={false} />
              <PropBadge label="Requiere consciencia" active={power.needsConscious} positive />
              <PropBadge label="Interpreta abstracto" active={power.interpretsAbstract} positive={false} />
            </div>
          </Card>

          {restrictions.length > 0 && (
            <Card>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 600, marginBottom: "10px" }}>Restricciones Activas</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {restrictions.map(r => (
                  <div key={r.id} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <span style={{ color: "var(--warn)", fontSize: "12px", marginTop: "2px" }}>▸</span>
                    <div>
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{r.label}</span>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Omnipotence Warning */}
          {opRisk.level !== "BAJO" && (
            <Card style={{ borderColor: opRisk.color + "40" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "20px" }}>⚠</span>
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: opRisk.color, fontFamily: "var(--font-mono)" }}>RIESGO {opRisk.level}</span>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", lineHeight: 1.5 }}>{opRisk.msg}</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT: Metrics + AI */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Card>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>Evaluación Compuesta</h3>
            <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px" }}>
              <CompositeGauge label="Teórico" value={comp.theoretical} color="var(--accent)" />
              <CompositeGauge label="Práctico" value={comp.practical} color="var(--success)" />
              <CompositeGauge label="Narrativo" value={comp.narrative} color="var(--gold)" />
              <CompositeGauge label="Peligro" value={comp.danger} color="var(--danger)" />
            </div>
          </Card>

          <Card>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 600, marginBottom: "12px" }}>Métricas Detalladas</h3>
            {METRIC_KEYS.map(m => <MetricBar key={m.key} label={m.label} icon={m.icon} value={power.metrics[m.key]} />)}
          </Card>

          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 600 }}>Análisis Profundo</h3>
              <Btn small onClick={runDeepAnalysis} disabled={aiLoading}>
                {aiLoading ? "Analizando..." : "⟡ Ejecutar Análisis IA"}
              </Btn>
            </div>
            {aiLoading && <LoadingDots />}
            {aiResult && <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{aiResult}</div>}
          </Card>
        </div>
      </div>
    </div>
  );
}

const PropBadge = ({ label, active, positive }) => (
  <div style={{
    padding: "6px 10px", borderRadius: "6px", fontSize: "12px",
    background: active ? (positive ? "var(--success)15" : "var(--danger)15") : "var(--bg-input)",
    color: active ? (positive ? "var(--success)" : "var(--danger)") : "var(--text-muted)",
    border: `1px solid ${active ? (positive ? "var(--success)30" : "var(--danger)30") : "var(--border)"}`,
  }}>
    {active ? "✓" : "✗"} {label}
  </div>
);

const LoadingDots = () => (
  <div style={{ display: "flex", gap: "6px", padding: "20px 0" }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 8, height: 8, borderRadius: "50%", background: "var(--accent)",
        animation: `pulseGlow 1s ease ${i * 0.2}s infinite`,
        opacity: 0.6,
      }} />
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// COMBINE VIEW
// ═══════════════════════════════════════════════════════════════
function CombineView({ powers, aiLoading, setAiLoading, aiResult, setAiResult }) {
  const [sel, setSel] = useState([]);

  const togglePower = (id) => {
    setSel(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev);
  };

  const selectedPowers = powers.filter(p => sel.includes(p.id));

  const runCombine = async () => {
    if (selectedPowers.length < 2) return;
    setAiLoading(true);
    setAiResult("");

    const sysPrompt = `Eres un diseñador de sistemas de poderes. Hablas en español. Tu trabajo es analizar combinaciones de superpoderes con profundidad lógica. NUNCA digas que eres IA. Responde en texto plano sin markdown.`;
    const powersDesc = selectedPowers.map(p => `- ${p.name}: ${p.description} | Restricciones: ${p.restrictions.map(r => RESTRICTION_TEMPLATES.find(t => t.id === r)?.label || r).join(", ")}`).join("\n");

    const userPrompt = `Analiza esta combinación de poderes:

${powersDesc}

Genera:
1. Un nombre épico para la combinación (y variantes: técnico, legendario, sci-fi, filosófico)
2. Descripción del poder combinado
3. Sinergias emergentes: qué puede hacer la combinación que ningún poder individual podría
4. Nuevos límites que surgen de la combinación
5. Por qué la combinación es mayor que la suma de sus partes
6. Si la combinación se vuelve demasiado "rota" o si cae en omnipotencia disfrazada
7. 3 ejemplos concretos de uso que demuestren la sinergia
8. Contramedidas posibles contra esta combinación

Sé específico y analítico. Evita respuestas genéricas.`;

    const result = await callAI(sysPrompt, userPrompt);
    setAiResult(result);
    setAiLoading(false);
  };

  return (
    <div className="fade-up">
      <Card style={{ marginBottom: "20px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>Combinar Poderes</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>Selecciona 2-4 poderes para analizar su sinergia.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {powers.map(p => (
            <button key={p.id} onClick={() => togglePower(p.id)}
              style={{
                padding: "8px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer",
                fontFamily: "var(--font-body)", border: "2px solid",
                background: sel.includes(p.id) ? "var(--accent)" : "var(--bg-input)",
                color: sel.includes(p.id) ? "#fff" : "var(--text-secondary)",
                borderColor: sel.includes(p.id) ? "var(--accent)" : "var(--border)",
                transition: "all 0.2s",
              }}>
              {p.name}
            </button>
          ))}
        </div>
      </Card>

      {selectedPowers.length >= 2 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {selectedPowers.map(p => {
              const comp = computeComposite(p.metrics);
              return (
                <Card key={p.id}>
                  <span style={{ fontSize: "10px", color: "var(--accent)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>{p.category}</span>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, marginTop: "2px" }}>{p.name}</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "6px 0" }}>{p.description}</p>
                  <div style={{ display: "flex", gap: "12px", fontSize: "11px", fontFamily: "var(--font-mono)" }}>
                    <span style={{ color: "var(--accent)" }}>TEO {comp.theoretical}</span>
                    <span style={{ color: "var(--success)" }}>PRA {comp.practical}</span>
                  </div>
                </Card>
              );
            })}
          </div>
          <div>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700 }}>
                  ⟡ Síntesis
                </h3>
                <Btn onClick={runCombine} disabled={aiLoading}>
                  {aiLoading ? "Sintetizando..." : "Analizar Combinación"}
                </Btn>
              </div>
              {aiLoading && <LoadingDots />}
              {aiResult && <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{aiResult}</div>}
              {!aiResult && !aiLoading && <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Presiona "Analizar Combinación" para generar la síntesis de estos poderes.</p>}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NAMES VIEW
// ═══════════════════════════════════════════════════════════════
function NamesView({ powers, aiLoading, setAiLoading, aiResult, setAiResult }) {
  const [sel, setSel] = useState(powers[0]?.id || "");
  const power = powers.find(p => p.id === sel);

  const runNames = async () => {
    if (!power) return;
    setAiLoading(true);
    setAiResult("");

    const sysPrompt = `Eres un naming specialist para poderes. Hablas en español. Generas nombres con identidad real, no genéricos. NUNCA digas que eres IA. Responde en texto plano sin markdown.`;
    const userPrompt = `Genera nombres para este poder:

NOMBRE ACTUAL: ${power.name}
DESCRIPCIÓN: ${power.description}
MECANISMO: ${power.mechanism}
CATEGORÍA: ${power.category}

Genera 5 nombres por cada estilo. Los nombres deben ser evocadores, con peso e identidad, NUNCA genéricos como "Ultra Power X" o "Super Force Alpha".

Estilos:
1. ÉPICO — nombres grandiosos con peso mítico (ej: Dominio del Azar Absoluto)
2. TÉCNICO — nombres que suenan a paper científico o sistema (ej: Ingeniería Probabilística)
3. LEGENDARIO — nombres de mito, grimorio o arte perdido (ej: Arquitectura del Destino)
4. OSCURO — nombres con tono sombrío, ominoso (ej: Cálculo de las Sombras)
5. SCI-FI — nombres con estética tecnológica futurista (ej: Protocolo Estocástico)
6. FILOSÓFICO — nombres contemplativos, abstractos (ej: Predominio de lo Posible)
7. MINIMALISTA — nombres cortos, densos, elegantes (ej: Sesgo, Arbitrio, Vector)

Para cada nombre, agrega una línea breve explicando por qué funciona.`;

    const result = await callAI(sysPrompt, userPrompt);
    setAiResult(result);
    setAiLoading(false);
  };

  return (
    <div className="fade-up">
      <Card>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>Generador de Nombres</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>Nombres con identidad, peso y resonancia. No genéricos.</p>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px" }}>
          <select value={sel} onChange={e => { setSel(e.target.value); setAiResult(""); }} style={{ maxWidth: "300px" }}>
            {powers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <Btn onClick={runNames} disabled={aiLoading || !power}>
            {aiLoading ? "Generando..." : "✦ Generar Nombres"}
          </Btn>
        </div>

        {aiLoading && <LoadingDots />}
        {aiResult && <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{aiResult}</div>}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCENARIOS VIEW
// ═══════════════════════════════════════════════════════════════
function ScenariosView({ powers, aiLoading, setAiLoading, aiResult, setAiResult }) {
  const [sel, setSel] = useState(powers[0]?.id || "");
  const [scenario, setScenario] = useState("Combate 1v1");
  const SCENARIOS = ["Combate 1v1", "Guerra a gran escala", "Política y manipulación", "Supervivencia extrema", "Infiltración", "Dominación global", "Situación absurda pero posible", "Vida cotidiana", "Contraespionaje", "Desastre natural"];
  const power = powers.find(p => p.id === sel);

  const runScenario = async () => {
    if (!power) return;
    setAiLoading(true);
    setAiResult("");

    const restrictions = RESTRICTION_TEMPLATES.filter(r => power.restrictions.includes(r.id));
    const sysPrompt = `Eres un analista de aplicaciones prácticas de superpoderes. Hablas en español. Analizas escenarios con rigor lógico, considerando las restricciones del poder. NUNCA digas que eres IA. Responde en texto plano sin markdown.`;
    const userPrompt = `Analiza cómo se usaría este poder en este escenario:

PODER: ${power.name}
DESCRIPCIÓN: ${power.description}
MECANISMO: ${power.mechanism}
PUEDE: ${power.canDo}
NO PUEDE: ${power.cantDo}
SOLO FÍSICO: ${power.physicalOnly}
CONCEDE DESEOS: ${power.grantsWishes}
REQUIERE CONSCIENCIA: ${power.needsConscious}
RESTRICCIONES: ${restrictions.map(r => r.label).join(", ")}
MÉTRICAS CLAVE: Inteligencia necesaria: ${power.metrics.intDependency}, Usabilidad: ${power.metrics.usability}, Precisión: ${power.metrics.precision}

ESCENARIO: ${scenario}

Analiza:
1. Qué haría el usuario paso a paso en este escenario
2. Qué sería fácil y por qué
3. Qué sería difícil o imposible y por qué
4. Cómo las restricciones afectan la ejecución
5. Qué nivel de inteligencia o conocimiento necesita el usuario
6. Posibles efectos colaterales o riesgos
7. Si el usuario promedio podría lograrlo vs un usuario superinteligente
8. Un ejemplo concreto narrativo breve

Sé específico. No seas genérico. Considera las restricciones reales del poder.`;

    const result = await callAI(sysPrompt, userPrompt);
    setAiResult(result);
    setAiLoading(false);
  };

  return (
    <div className="fade-up">
      <Card>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>Escenarios de Uso</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>¿Cómo funciona un poder en la práctica real? Eso depende del contexto.</p>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
          <select value={sel} onChange={e => { setSel(e.target.value); setAiResult(""); }} style={{ maxWidth: "280px" }}>
            {powers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={scenario} onChange={e => { setScenario(e.target.value); setAiResult(""); }} style={{ maxWidth: "250px" }}>
            {SCENARIOS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <Btn onClick={runScenario} disabled={aiLoading || !power}>
            {aiLoading ? "Simulando..." : "⏣ Simular Escenario"}
          </Btn>
        </div>

        {aiLoading && <LoadingDots />}
        {aiResult && <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{aiResult}</div>}
      </Card>
    </div>
  );
}
