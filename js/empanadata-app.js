// EmpanaData - logica del mapa, diagnostico inicial y variables comerciales.
// Depende de: empanadata.js (DATA) y Leaflet.js

const ZONES = [
  {
    id: "ciudad-universitaria",
    name: "Ciudad Universitaria (UN)",
    lat: 4.638, lon: -74.083, radius: 800, score: 98, level: "hot",
    desc: "Mayor concentracion universitaria de Bogota. Alto flujo estudiantil y buena demanda diurna."
  },
  {
    id: "chapinero-zona-rosa",
    name: "Chapinero / Zona Rosa",
    lat: 4.656, lon: -74.052, radius: 700, score: 92, level: "hot",
    desc: "Alta densidad de oficinas, universidades, bares y restaurantes. Flujo constante."
  },
  {
    id: "centro-candelaria",
    name: "Centro Historico / La Candelaria",
    lat: 4.597, lon: -74.076, radius: 650, score: 88, level: "hot",
    desc: "Universidades, oficinas publicas, turismo y alto flujo peatonal entre semana."
  },
  {
    id: "teusaquillo-palermo",
    name: "Teusaquillo / Palermo",
    lat: 4.627, lon: -74.068, radius: 600, score: 80, level: "mid",
    desc: "Zona mixta con estudiantes, residentes y trabajadores. Buen equilibrio de costos."
  },
  {
    id: "suba-niza",
    name: "Suba / Niza",
    lat: 4.741, lon: -74.083, radius: 550, score: 72, level: "mid",
    desc: "Mercado residencial amplio, familias y centros comerciales cercanos."
  },
  {
    id: "kennedy-americas",
    name: "Kennedy / Americas",
    lat: 4.626, lon: -74.148, radius: 500, score: 60, level: "low",
    desc: "Zona residencial y comercial popular con costos mas bajos y demanda por precio."
  },
];

const PRODUCT_PROFILES = {
  empanadas: {
    label: "Empanadas",
    ticket: 4200,
    prep: 4,
    demandBoost: 1.15,
    costFactor: 0.62,
    fit: { students: 1.18, offices: 1.05, tourism: 1.05, residential: 1.08 }
  },
  hamburguesas: {
    label: "Hamburguesas",
    ticket: 18000,
    prep: 12,
    demandBoost: 0.95,
    costFactor: 0.68,
    fit: { students: 0.96, offices: 1.10, tourism: 1.12, residential: 1.06 }
  },
  perros: {
    label: "Perros calientes",
    ticket: 11000,
    prep: 7,
    demandBoost: 1.05,
    costFactor: 0.58,
    fit: { students: 1.12, offices: 1.00, tourism: 0.98, residential: 1.12 }
  },
  pizza: {
    label: "Pizza personal",
    ticket: 14000,
    prep: 10,
    demandBoost: 0.98,
    costFactor: 0.60,
    fit: { students: 1.04, offices: 1.08, tourism: 1.10, residential: 1.03 }
  },
  arepas: {
    label: "Arepas rellenas",
    ticket: 9000,
    prep: 8,
    demandBoost: 1.08,
    costFactor: 0.55,
    fit: { students: 1.09, offices: 1.04, tourism: 1.02, residential: 1.14 }
  }
};

const LOCATION_METRICS = {
  "ciudad-universitaria": {
    estrato: "3-4", ingreso: 3200000, edad: 24, trabajadores: 18500,
    peatonesHora: 2600, sitp: "180 m", pico: "Muy alto", transmilenio: "650 m",
    restaurantes: 78, fastFood: 36, competidor: "95 m", rating: 4.2, clientesComp: 1150,
    arriendo: 4500000, metro2: 72000, servicios: 980000, impuestos: 620000, adecuacion: 18500000,
    normativa: "Uso comercial permitido", licencias: "Concepto sanitario y camara de comercio", anden: "3.2 m", domicilios: "Alta", juridica: "Media-alta",
    hurtos: 32, seguridad: "Media", iluminacion: "Buena", policia: "CAI cercano",
    oficinas: 65, centros: 2, industriales: 1, terminales: 1, turismo: "Medio",
    cobertura: "Rappi, DiDi, iFood", entrega: 24, pedidos: "Alta", apps: "Alta", logistica: 3800,
    ventasHora: 30, ventasDia: 360, temporada: "Semestres academicos", festivos: "Baja leve", eventos: "Ferias universitarias", clima: "Lluvia reduce 8%",
    residencias: "Media", acceso: 16, segment: "students"
  },
  "chapinero-zona-rosa": {
    estrato: "4-6", ingreso: 6200000, edad: 31, trabajadores: 42000,
    peatonesHora: 3400, sitp: "120 m", pico: "Muy alto", transmilenio: "500 m",
    restaurantes: 165, fastFood: 82, competidor: "45 m", rating: 4.4, clientesComp: 2400,
    arriendo: 7600000, metro2: 118000, servicios: 1450000, impuestos: 980000, adecuacion: 26000000,
    normativa: "Uso comercial permitido", licencias: "Concepto sanitario, bomberos y Sayco si aplica", anden: "4.1 m", domicilios: "Muy alta", juridica: "Alta",
    hurtos: 41, seguridad: "Media-alta", iluminacion: "Muy buena", policia: "Alta presencia",
    oficinas: 210, centros: 4, industriales: 0, terminales: 1, turismo: "Alto",
    cobertura: "Rappi, DiDi, Uber Eats", entrega: 21, pedidos: "Muy alta", apps: "Muy alta", logistica: 4700,
    ventasHora: 42, ventasDia: 520, temporada: "Quincenas y fines de semana", festivos: "Alta nocturna", eventos: "Conciertos y rumba", clima: "Lluvia reduce 5%",
    residencias: "Media-alta", acceso: 12, segment: "offices"
  },
  "centro-candelaria": {
    estrato: "2-4", ingreso: 2800000, edad: 29, trabajadores: 55000,
    peatonesHora: 3900, sitp: "90 m", pico: "Muy alto", transmilenio: "300 m",
    restaurantes: 128, fastFood: 58, competidor: "70 m", rating: 4.0, clientesComp: 2100,
    arriendo: 5200000, metro2: 85000, servicios: 1120000, impuestos: 720000, adecuacion: 20500000,
    normativa: "Revisar restricciones patrimoniales", licencias: "Concepto sanitario y permisos de fachada", anden: "2.6 m", domicilios: "Media-alta", juridica: "Media",
    hurtos: 56, seguridad: "Media-baja", iluminacion: "Media", policia: "Presencia por cuadrantes",
    oficinas: 260, centros: 3, industriales: 0, terminales: 2, turismo: "Alto",
    cobertura: "Rappi, DiDi, mensajeria local", entrega: 28, pedidos: "Alta", apps: "Alta", logistica: 4300,
    ventasHora: 36, ventasDia: 430, temporada: "Calendario laboral y turismo", festivos: "Alta turistica", eventos: "Festivales culturales", clima: "Lluvia reduce 10%",
    residencias: "Media", acceso: 10, segment: "tourism"
  },
  "teusaquillo-palermo": {
    estrato: "3-5", ingreso: 4100000, edad: 33, trabajadores: 26000,
    peatonesHora: 2100, sitp: "160 m", pico: "Alto", transmilenio: "700 m",
    restaurantes: 92, fastFood: 40, competidor: "110 m", rating: 4.3, clientesComp: 1200,
    arriendo: 4300000, metro2: 69000, servicios: 900000, impuestos: 580000, adecuacion: 17000000,
    normativa: "Uso mixto con verificacion de ruido", licencias: "Concepto sanitario", anden: "3.0 m", domicilios: "Alta", juridica: "Alta",
    hurtos: 27, seguridad: "Media-alta", iluminacion: "Buena", policia: "Media",
    oficinas: 105, centros: 2, industriales: 0, terminales: 1, turismo: "Medio",
    cobertura: "Rappi y DiDi", entrega: 23, pedidos: "Media-alta", apps: "Alta", logistica: 3600,
    ventasHora: 25, ventasDia: 310, temporada: "Eventos universitarios", festivos: "Media", eventos: "Partidos y conciertos cercanos", clima: "Lluvia reduce 7%",
    residencias: "Alta", acceso: 14, segment: "residential"
  },
  "suba-niza": {
    estrato: "3-5", ingreso: 3900000, edad: 35, trabajadores: 18000,
    peatonesHora: 1600, sitp: "140 m", pico: "Alto", transmilenio: "900 m",
    restaurantes: 70, fastFood: 34, competidor: "130 m", rating: 4.1, clientesComp: 980,
    arriendo: 3600000, metro2: 61000, servicios: 820000, impuestos: 500000, adecuacion: 15500000,
    normativa: "Uso comercial barrial", licencias: "Concepto sanitario", anden: "2.8 m", domicilios: "Alta", juridica: "Alta",
    hurtos: 24, seguridad: "Media", iluminacion: "Buena", policia: "Media",
    oficinas: 58, centros: 5, industriales: 1, terminales: 0, turismo: "Bajo",
    cobertura: "Rappi, DiDi y domicilios propios", entrega: 30, pedidos: "Media-alta", apps: "Alta", logistica: 4100,
    ventasHora: 20, ventasDia: 260, temporada: "Fines de semana familiares", festivos: "Alta residencial", eventos: "Activaciones en centros comerciales", clima: "Lluvia impulsa domicilios",
    residencias: "Muy alta", acceso: 22, segment: "residential"
  },
  "kennedy-americas": {
    estrato: "2-3", ingreso: 2400000, edad: 30, trabajadores: 30000,
    peatonesHora: 2900, sitp: "110 m", pico: "Muy alto", transmilenio: "550 m",
    restaurantes: 115, fastFood: 62, competidor: "80 m", rating: 3.9, clientesComp: 1750,
    arriendo: 3100000, metro2: 52000, servicios: 760000, impuestos: 430000, adecuacion: 14000000,
    normativa: "Uso comercial permitido", licencias: "Concepto sanitario y manipulacion de alimentos", anden: "2.4 m", domicilios: "Media-alta", juridica: "Media-alta",
    hurtos: 49, seguridad: "Media-baja", iluminacion: "Media", policia: "Media",
    oficinas: 72, centros: 4, industriales: 5, terminales: 1, turismo: "Bajo",
    cobertura: "Rappi, DiDi y domicilios propios", entrega: 32, pedidos: "Alta", apps: "Media-alta", logistica: 3900,
    ventasHora: 34, ventasDia: 400, temporada: "Quincenas y fines de semana", festivos: "Alta", eventos: "Comercio de Plaza de las Americas", clima: "Lluvia reduce calle, sube domicilio",
    residencias: "Muy alta", acceso: 18, segment: "students"
  }
};

const VARIABLE_GROUPS = [
  ["Demograficas", [["Estrato socioeconomico", "estrato"], ["Ingreso promedio hogares", "ingreso", "money"], ["Edad promedio", "edad", "years"], ["Trabajadores en la zona", "trabajadores", "number"]]],
  ["Movilidad y flujo", [["Trafico peatonal por hora", "peatonesHora", "number"], ["Cercania a paraderos SITP", "sitp"], ["Flujo en horas pico", "pico"], ["Cercania a TransMilenio", "transmilenio"]]],
  ["Competencia", [["Restaurantes cercanos", "restaurantes", "number"], ["Negocios de comida rapida", "fastFood", "number"], ["Competidor mas cercano", "competidor"], ["Calificacion competidores", "rating"], ["Clientes de competidores", "clientesComp", "number"]]],
  ["Economicas", [["Valor del arriendo", "arriendo", "money"], ["Valor del metro cuadrado", "metro2", "money"], ["Servicios publicos", "servicios", "money"], ["Impuestos locales", "impuestos", "money"], ["Adecuacion del local", "adecuacion", "money"]]],
  ["Urbanisticas", [["Restricciones normativas", "normativa"], ["Licencias requeridas", "licencias"], ["Ancho de andenes", "anden"], ["Posibilidad de domicilios", "domicilios"], ["Seguridad juridica", "juridica"]]],
  ["Seguridad", [["Hurtos reportados", "hurtos", "number"], ["Percepcion de seguridad", "seguridad"], ["Iluminacion publica", "iluminacion"], ["Presencia policial", "policia"]]],
  ["Demanda especifica", [["Oficinas cercanas", "oficinas", "number"], ["Centros comerciales", "centros", "number"], ["Zonas industriales", "industriales", "number"], ["Terminales de transporte", "terminales", "number"], ["Lugares turisticos", "turismo"]]],
  ["Digitales", [["Cobertura de plataformas", "cobertura"], ["Tiempo promedio de entrega", "entrega", "minutes"], ["Densidad de pedidos", "pedidos"], ["Presencia en apps", "apps"], ["Costos logisticos", "logistica", "money"]]],
  ["Temporales", [["Ventas por hora", "ventasHora", "number"], ["Ventas por dia", "ventasDia", "number"], ["Temporadas", "temporada"], ["Festivos", "festivos"], ["Eventos especiales", "eventos"], ["Clima", "clima"]]],
  ["Geoespaciales", [["Latitud y longitud", "coordinates"], ["Distancia a competidores", "competidor"], ["Distancia a estaciones", "transmilenio"], ["Distancia a centros comerciales", "centros", "number"], ["Distancia a zonas residenciales", "residencias"], ["Tiempo de acceso", "acceso", "minutes"]]]
];

const ZONE_COLORS = { hot: "#15803D", mid: "#B45309", low: "#B91C1C" };
const COP = value => "$" + Math.round(value).toLocaleString("es-CO");

function formatMetric(metrics, zone, key, kind) {
  if (key === "coordinates") return `${zone.lat.toFixed(3)}, ${zone.lon.toFixed(3)}`;
  const value = metrics[key];
  if (kind === "money") return COP(value);
  if (kind === "number") return Number(value).toLocaleString("es-CO");
  if (kind === "minutes") return `${value} min`;
  if (kind === "years") return `${value} anos`;
  return value;
}

function getMarkerColor(clusterCount) {
  if (clusterCount >= 15) return "#15803D";
  if (clusterCount >= 6) return "#B45309";
  return "#B91C1C";
}

function getMarkerRadius(clusterCount) {
  return Math.max(5, Math.min(16, 4 + clusterCount * 0.6));
}

function getOpportunityLevel(clusterCount) {
  if (clusterCount >= 15) return "alta";
  if (clusterCount >= 6) return "media";
  return "baja";
}

function getOpportunityText(clusterCount) {
  if (clusterCount >= 15) return "Alta oportunidad de venta";
  if (clusterCount >= 6) return "Oportunidad media";
  return "Zona de baja densidad";
}

function buildPopup(u) {
  const level = getOpportunityLevel(u.cluster_count);
  const text = getOpportunityText(u.cluster_count);
  return `
    <div class="pop-title">${u.nombre}</div>
    <div class="pop-d">Direccion: ${u.direccion || "Sin direccion registrada"}</div>
    <div class="pop-d">Programas: ${u.programas}</div>
    <div class="pop-d">Instituciones cercanas: ${u.cluster_count}</div>
    <div class="pop-score ${level}">${text}</div>
  `;
}

function calculateDiagnostic(zone, product) {
  const metrics = LOCATION_METRICS[zone.id];
  const profile = PRODUCT_PROFILES[product];
  const segmentFit = profile.fit[metrics.segment] || 1;
  const demand = metrics.ventasDia * profile.demandBoost * segmentFit;
  const revenue = demand * profile.ticket;
  const variableCost = revenue * profile.costFactor;
  const fixedCosts = (metrics.arriendo + metrics.servicios + metrics.impuestos) / 30;
  const logisticCost = demand * 0.28 * metrics.logistica;
  const estimatedCosts = variableCost + fixedCosts + logisticCost;
  const rentability = revenue - estimatedCosts;

  const flowScore = Math.min(25, metrics.peatonesHora / 160);
  const demandScore = Math.min(25, demand / 18);
  const costScore = Math.max(5, 25 - metrics.arriendo / 500000);
  const safetyScore = Math.max(4, 15 - metrics.hurtos / 5);
  const digitalScore = metrics.pedidos.includes("Muy") ? 10 : metrics.pedidos.includes("Alta") ? 8 : 6;
  const competitionPenalty = Math.min(14, metrics.fastFood / 8);
  const total = Math.round(flowScore + demandScore + costScore + safetyScore + digitalScore - competitionPenalty + 22);

  return {
    zone,
    product: profile,
    metrics,
    demand: Math.round(demand),
    revenue: Math.round(revenue),
    estimatedCosts: Math.round(estimatedCosts),
    rentability: Math.round(rentability),
    score: Math.max(35, Math.min(99, total))
  };
}

const map = L.map("map").setView([4.651, -74.065], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
  maxZoom: 18,
}).addTo(map);

const zoneLayers = {};
let activeZoneLayer = null;

ZONES.forEach(z => {
  const layer = L.circle([z.lat, z.lon], {
    radius: z.radius,
    color: ZONE_COLORS[z.level],
    fillColor: ZONE_COLORS[z.level],
    fillOpacity: 0.08,
    weight: 2,
    dashArray: "6 4",
  })
    .addTo(map)
    .bindTooltip(`<b>${z.name}</b><br>Score base: ${z.score}/100`, { sticky: true });

  zoneLayers[z.id] = layer;
});

let allMarkers = [];

DATA.universities.forEach(u => {
  const color = getMarkerColor(u.cluster_count);
  const radius = getMarkerRadius(u.cluster_count);

  const marker = L.circleMarker([u.lat, u.lon], {
    radius,
    fillColor: color,
    color: "rgba(255,255,255,0.7)",
    weight: 1.5,
    fillOpacity: 0.85,
  });

  marker.bindPopup(buildPopup(u), { maxWidth: 260 });
  marker._uni = u;
  marker.addTo(map);
  allMarkers.push(marker);
});

function filterMap(type, btn) {
  document.querySelectorAll(".fbtn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  allMarkers.forEach(marker => {
    const u = marker._uni;
    let visible = true;

    if (type === "alta") visible = u.cluster_count >= 15;
    else if (type === "media") visible = u.cluster_count >= 6 && u.cluster_count < 15;
    else if (type === "norte") visible = u.lat > 4.68;
    else if (type === "centro") visible = u.lat >= 4.60 && u.lat <= 4.68;
    else if (type === "sur") visible = u.lat < 4.60;

    if (visible) marker.addTo(map);
    else map.removeLayer(marker);
  });
}

function focusZone(zone) {
  map.setView([zone.lat, zone.lon], 15);
  document.querySelectorAll(".zone-card").forEach(c => c.classList.remove("active"));
  document.querySelector(`[data-zone="${zone.id}"]`)?.classList.add("active");

  if (activeZoneLayer) activeZoneLayer.setStyle({ fillOpacity: 0.08, weight: 2 });
  activeZoneLayer = zoneLayers[zone.id];
  activeZoneLayer?.setStyle({ fillOpacity: 0.18, weight: 4 });
}

function renderZoneCards() {
  const zoneCardsEl = document.getElementById("zone-cards");
  zoneCardsEl.innerHTML = "";

  ZONES.forEach(z => {
    const card = document.createElement("div");
    card.className = `zone-card ${z.level}`;
    card.dataset.zone = z.id;
    card.innerHTML = `
      <div class="zone-name">${z.name}</div>
      <div class="zone-desc">${z.desc}</div>
      <div class="zone-meta">
        <span class="zbadge score">Score base: ${z.score}/100</span>
      </div>
    `;
    card.addEventListener("click", () => focusZone(z));
    zoneCardsEl.appendChild(card);
  });
}

function renderIesList() {
  const iesListEl = document.getElementById("ies-list");
  const maxMatricula = DATA.top_enrollment[0].matriculados;
  iesListEl.innerHTML = "";

  DATA.top_enrollment.slice(0, 15).forEach((ies, i) => {
    const pct = Math.round((ies.matriculados / maxMatricula) * 100);
    const clean = ies.nombre.replace(/-$/, "").trim();
    const item = document.createElement("div");
    item.className = "ies-item";
    item.innerHTML = `
      <div class="ies-rank">${i + 1}</div>
      <div style="flex:1">
        <div class="ies-name">${clean}</div>
        <div class="ies-bar" style="width:${pct}%"></div>
      </div>
      <div class="ies-num">${Math.round(ies.matriculados).toLocaleString("es-CO")}</div>
    `;
    iesListEl.appendChild(item);
  });
}

function renderDiagnostic(result) {
  const profileCard = document.getElementById("profile-card");
  profileCard.innerHTML = `
    <div class="profile-top">
      <div>
        <div class="profile-label">Producto</div>
        <strong>${result.product.label}</strong>
      </div>
      <div class="profile-score">${result.score}</div>
    </div>
    <div class="profile-zone">${result.zone.name}</div>
    <div class="profile-kpis">
      <div><span>Ventas/dia</span><strong>${result.demand.toLocaleString("es-CO")}</strong></div>
      <div><span>Ingreso diario</span><strong>${COP(result.revenue)}</strong></div>
      <div><span>Costos diarios</span><strong>${COP(result.estimatedCosts)}</strong></div>
      <div><span>Rentabilidad</span><strong>${COP(result.rentability)}</strong></div>
    </div>
  `;

  const variableList = document.getElementById("variable-list");
  variableList.innerHTML = VARIABLE_GROUPS.map(([title, rows]) => `
    <details class="variable-group" ${title === "Demograficas" || title === "Economicas" ? "open" : ""}>
      <summary>${title}</summary>
      <div class="variable-table">
        ${rows.map(([label, key, kind]) => `
          <div class="variable-row">
            <span>${label}</span>
            <strong>${formatMetric(result.metrics, result.zone, key, kind)}</strong>
          </div>
        `).join("")}
        ${title === "Economicas" ? `
          <div class="variable-row highlight">
            <span>Rentabilidad diaria estimada</span>
            <strong>${COP(result.rentability)}</strong>
          </div>
        ` : ""}
      </div>
    </details>
  `).join("");
}

function openStartup() {
  document.getElementById("onboarding").classList.remove("is-hidden");
}

function closeStartup() {
  document.getElementById("onboarding").classList.add("is-hidden");
  setTimeout(() => map.invalidateSize(), 200);
}

function applyStartup(locationId, productId, persist = true) {
  const zone = ZONES.find(item => item.id === locationId) || ZONES[0];
  const result = calculateDiagnostic(zone, productId || "empanadas");
  renderDiagnostic(result);
  focusZone(zone);
  closeStartup();

  if (persist) {
    localStorage.setItem("empanadata-startup", JSON.stringify({ locationId: zone.id, productId }));
  }
}

function initStartup() {
  const locationSelect = document.getElementById("startup-location");
  locationSelect.innerHTML = ZONES.map(zone => `<option value="${zone.id}">${zone.name}</option>`).join("");

  document.getElementById("startup-form").addEventListener("submit", event => {
    event.preventDefault();
    applyStartup(locationSelect.value, document.getElementById("startup-product").value);
  });

  document.getElementById("skip-startup").addEventListener("click", closeStartup);
  document.getElementById("open-startup").addEventListener("click", openStartup);

  const saved = localStorage.getItem("empanadata-startup");
  if (saved) {
    try {
      const { locationId, productId } = JSON.parse(saved);
      locationSelect.value = locationId;
      document.getElementById("startup-product").value = productId;
      applyStartup(locationId, productId, false);
      return;
    } catch (error) {
      localStorage.removeItem("empanadata-startup");
    }
  }

  renderDiagnostic(calculateDiagnostic(ZONES[0], "empanadas"));
  focusZone(ZONES[0]);
  openStartup();
}

renderZoneCards();
renderIesList();
initStartup();
