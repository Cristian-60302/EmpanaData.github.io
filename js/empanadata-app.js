// ════════════════════════════════════════════════════════
//  EmpanaData — Lógica del mapa e interfaz
//  Depende de: empanadata.js (DATA) y Leaflet.js
// ════════════════════════════════════════════════════════

// ── Zonas estratégicas definidas manualmente ──
const ZONES = [
  {
    name: "Ciudad Universitaria (UN)",
    lat: 4.638, lon: -74.083, radius: 800, score: 98, level: "hot",
    desc: "Mayor concentración universitaria de Bogotá. UNAL, UNIMINUTO cercana."
  },
  {
    name: "Chapinero / Zona Rosa",
    lat: 4.656, lon: -74.052, radius: 700, score: 92, level: "hot",
    desc: "Alta densidad de institutos técnicos y universitarios. Flujo peatonal constante."
  },
  {
    name: "Centro Histórico / La Candelaria",
    lat: 4.597, lon: -74.076, radius: 650, score: 88, level: "hot",
    desc: "Universidad Externado, U. Central y flujo de oficinas y turismo."
  },
  {
    name: "Teusaquillo / Palermo",
    lat: 4.627, lon: -74.068, radius: 600, score: 80, level: "mid",
    desc: "Institutos técnicos y tecnológicos. Buen flujo estudiantil diurno."
  },
  {
    name: "Suba / Niza",
    lat: 4.741, lon: -74.083, radius: 550, score: 72, level: "mid",
    desc: "Crecimiento en instituciones de formación. Alta población joven."
  },
  {
    name: "Kennedy / Américas",
    lat: 4.626, lon: -74.148, radius: 500, score: 60, level: "low",
    desc: "Zona residencial con institutos técnicos. Oportunidad emergente."
  },
];

// ── Colores según nivel de oportunidad ──
const ZONE_COLORS = { hot: '#15803D', mid: '#B45309', low: '#B91C1C' };

// ── Helpers para marcadores ──
function getMarkerColor(clusterCount) {
  if (clusterCount >= 15) return '#15803D';
  if (clusterCount >= 6)  return '#B45309';
  return '#B91C1C';
}

function getMarkerRadius(clusterCount) {
  return Math.max(5, Math.min(16, 4 + clusterCount * 0.6));
}

function getOpportunityLevel(clusterCount) {
  if (clusterCount >= 15) return 'alta';
  if (clusterCount >= 6)  return 'media';
  return 'baja';
}

function getOpportunityText(clusterCount) {
  if (clusterCount >= 15) return '🟢 Alta oportunidad de venta';
  if (clusterCount >= 6)  return '🟡 Oportunidad media';
  return '🔴 Zona de baja densidad';
}

// ── Construir popup HTML ──
function buildPopup(u) {
  const level = getOpportunityLevel(u.cluster_count);
  const text  = getOpportunityText(u.cluster_count);
  return `
    <div class="pop-title">${u.nombre}</div>
    <div class="pop-d">📍 ${u.direccion || 'Sin dirección registrada'}</div>
    <div class="pop-d">📚 Programas: ${u.programas}</div>
    <div class="pop-d">🏫 Instituciones cercanas: ${u.cluster_count}</div>
    <div class="pop-score ${level}">${text}</div>
  `;
}

// ════════════════════════════════════════════════════════
//  INICIALIZACIÓN DEL MAPA
// ════════════════════════════════════════════════════════
const map = L.map('map').setView([4.651, -74.065], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 18,
}).addTo(map);

// ── Dibujar zonas estratégicas ──
ZONES.forEach(z => {
  L.circle([z.lat, z.lon], {
    radius:      z.radius,
    color:       ZONE_COLORS[z.level],
    fillColor:   ZONE_COLORS[z.level],
    fillOpacity: 0.08,
    weight:      2,
    dashArray:   '6 4',
  })
  .addTo(map)
  .bindTooltip(`<b>${z.name}</b><br>Score: ${z.score}/100`, { sticky: true });
});

// ── Dibujar marcadores de instituciones ──
let allMarkers = [];

DATA.universities.forEach(u => {
  const color  = getMarkerColor(u.cluster_count);
  const radius = getMarkerRadius(u.cluster_count);

  const marker = L.circleMarker([u.lat, u.lon], {
    radius,
    fillColor:   color,
    color:       'rgba(255,255,255,0.7)',
    weight:      1.5,
    fillOpacity: 0.85,
  });

  marker.bindPopup(buildPopup(u), { maxWidth: 260 });
  marker._uni = u; // referencia para filtros
  marker.addTo(map);
  allMarkers.push(marker);
});

// ════════════════════════════════════════════════════════
//  FILTROS
// ════════════════════════════════════════════════════════
function filterMap(type, btn) {
  // Actualizar estado visual de botones
  document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Mostrar u ocultar marcadores según filtro
  allMarkers.forEach(marker => {
    const u = marker._uni;
    let visible = true;

    if      (type === 'alta')   visible = u.cluster_count >= 15;
    else if (type === 'media')  visible = u.cluster_count >= 6 && u.cluster_count < 15;
    else if (type === 'norte')  visible = u.lat > 4.68;
    else if (type === 'centro') visible = u.lat >= 4.60 && u.lat <= 4.68;
    else if (type === 'sur')    visible = u.lat < 4.60;

    if (visible) marker.addTo(map);
    else         map.removeLayer(marker);
  });
}

// ════════════════════════════════════════════════════════
//  SIDEBAR — Zona cards
// ════════════════════════════════════════════════════════
const zoneCardsEl = document.getElementById('zone-cards');

ZONES.forEach(z => {
  const card = document.createElement('div');
  card.className = `zone-card ${z.level}`;
  card.innerHTML = `
    <div class="zone-name">${z.name}</div>
    <div class="zone-desc">${z.desc}</div>
    <div class="zone-meta">
      <span class="zbadge score">Score: ${z.score}/100</span>
    </div>
  `;
  card.addEventListener('click', () => {
    map.setView([z.lat, z.lon], 15);
    document.querySelectorAll('.zone-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
  });
  zoneCardsEl.appendChild(card);
});

// ════════════════════════════════════════════════════════
//  SIDEBAR — Ranking IES
// ════════════════════════════════════════════════════════
const iesListEl = document.getElementById('ies-list');
const maxMatricula = DATA.top_enrollment[0].matriculados;

DATA.top_enrollment.slice(0, 15).forEach((ies, i) => {
  const pct   = Math.round((ies.matriculados / maxMatricula) * 100);
  const clean = ies.nombre.replace(/-$/, '').trim();

  const item = document.createElement('div');
  item.className = 'ies-item';
  item.innerHTML = `
    <div class="ies-rank">${i + 1}</div>
    <div style="flex:1">
      <div class="ies-name">${clean}</div>
      <div class="ies-bar" style="width:${pct}%"></div>
    </div>
    <div class="ies-num">${Math.round(ies.matriculados).toLocaleString()}</div>
  `;
  iesListEl.appendChild(item);
});
