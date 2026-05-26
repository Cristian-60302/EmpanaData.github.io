/* ───────────────── DATA STRUCTURES ───────────────── */
const state = {
  activos_fijos: [
    {name:'Maquinaria y equipos', val:24500000},
    {name:'Mobiliario', val:7500000},
    {name:'Equipos de cómputo', val:3500000},
    {name:'Adecuaciones', val:8750000}
  ],
  activos_dif: [
    {name:'Registro mercantil', val:1320000},
    {name:'Licencias', val:700000},
    {name:'Publicidad inicial', val:2200000},
    {name:'Software', val:4850000}
  ],
  capital_trabajo: [
    {name:'Inventario inicial', val:7000000},
    {name:'Nómina primer mes', val:19900000},
    {name:'Arriendo y servicios', val:2750000},
    {name:'Caja menor', val:1200000}
  ],
  cv: [
    {name:'Materias primas y café', val:2000000},
    {name:'Empaques', val:3000000},
    {name:'Insumos varios', val:2000000},
    {name:'Otros costos variables', val:750000}
  ],
  cf: [
    {name:'Arriendo', val:2500000},
    {name:'Servicios públicos', val:600000},
    {name:'Nómina', val:22500000},
    {name:'Internet y software', val:200000},
    {name:'Otros costos fijos', val:400000}
  ],
  ga: [
    {name:'Publicidad', val:2200000},
    {name:'Contabilidad', val:2500000},
    {name:'Papelería y útiles', val:100000}
  ]
};

/* ───────────────── DYNAMIC ROWS ───────────────── */
function renderRows(key, containerId) {
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  state[key].forEach((item, i) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:10px;margin-bottom:10px;align-items:center';
    row.innerHTML = `
      <input type="text" value="${item.name}" placeholder="Descripción"
        style="flex:2;padding:8px 12px;border:1px solid var(--paper-darker);border-radius:4px;font-family:inherit;font-size:13px"
        oninput="state['${key}'][${i}].name=this.value">
      <input type="number" value="${item.val}" placeholder="Valor ($)"
        style="flex:1;padding:8px 12px;border:1px solid var(--paper-darker);border-radius:4px;font-family:inherit;font-size:13px;text-align:right"
        oninput="state['${key}'][${i}].val=+this.value">
      <button onclick="removeRow('${key}','${containerId}',${i})"
        style="background:none;border:none;cursor:pointer;color:var(--ink-light);font-size:18px;line-height:1;padding:4px"
        title="Eliminar">×</button>
    `;
    el.appendChild(row);
  });
}

function addRow(key, containerId) {
  state[key].push({name:'', val:0});
  renderRows(key, containerId);
}

function removeRow(key, containerId, idx) {
  state[key].splice(idx, 1);
  renderRows(key, containerId);
}

/* ───────────────── NAVIGATION ───────────────── */
let currentStep = 0;

function goStep(n) {
  if(n === currentStep && n !== 5) return;
  syncDepreciacion();
  document.getElementById('sec'+currentStep).classList.remove('active');
  document.getElementById('stab'+currentStep).classList.remove('active');
  document.getElementById('s'+currentStep).classList.remove('active');
  currentStep = n;
  document.getElementById('sec'+n).classList.add('active');
  document.getElementById('stab'+n).classList.add('active');
  document.getElementById('s'+n).classList.add('active');
  if(n===1){renderRows('activos_fijos','activos_fijos_list');renderRows('activos_dif','activos_dif_list');renderRows('capital_trabajo','capital_trabajo_list');}
  if(n===2){renderRows('cv','cv_list');renderRows('cf','cf_list');renderRows('ga','ga_list');}
  window.scrollTo({top:0,behavior:'smooth'});
}

function syncDepreciacion() {
  const v = +document.getElementById('dep_valor').value || 0;
  const vida = +document.getElementById('dep_vida').value || 1;
  document.getElementById('dep_anual').value = Math.round(v / vida);
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('dep_valor').addEventListener('input', syncDepreciacion);
  document.getElementById('dep_vida').addEventListener('input', syncDepreciacion);
  renderRows('activos_fijos','activos_fijos_list');
  renderRows('activos_dif','activos_dif_list');
  renderRows('capital_trabajo','capital_trabajo_list');
  renderRows('cv','cv_list');
  renderRows('cf','cf_list');
  renderRows('ga','ga_list');
});

/* ───────────────── FORMAT HELPERS ───────────────── */
const COP = v => '$' + Math.round(v).toLocaleString('es-CO');
const PCT = v => (v * 100).toFixed(2) + '%';

/* ───────────────── CALCULATION ENGINE ───────────────── */
function calcular() {
  syncDepreciacion();

  const anios       = +document.getElementById('p_anios').value;
  const crecimiento = +document.getElementById('p_crecimiento').value / 100;
  const tasaDesc    = +document.getElementById('p_tasa_desc').value / 100;

  /* ── Inversión ── */
  const totalAF = state.activos_fijos.reduce((s,r) => s+r.val, 0);
  const totalAD = state.activos_dif.reduce((s,r) => s+r.val, 0);
  const totalCT = state.capital_trabajo.reduce((s,r) => s+r.val, 0);
  const invTotal = totalAF + totalAD + totalCT;

  /* ── Costos mensuales ── */
  const totalCV_mes     = state.cv.reduce((s,r) => s+r.val, 0);
  const totalCF_mes     = state.cf.reduce((s,r) => s+r.val, 0);
  const totalGA_mes     = state.ga.reduce((s,r) => s+r.val, 0);
  const totalCostos_anio = (totalCV_mes + totalCF_mes + totalGA_mes) * 12;

  /* ── Ingresos ── */
  const ventasDia  = +document.getElementById('ing_ventas_dia').value;
  const precio     = +document.getElementById('ing_precio').value;
  const diasMes    = +document.getElementById('ing_dias_mes').value;
  const ingAnual1  = ventasDia * precio * diasMes * 12;

  /* ── Depreciación ── */
  const depAnual = +document.getElementById('dep_anual').value;

  /* ── Financiamiento ── */
  const finPropio  = +document.getElementById('fin_propio').value;
  const finCredito = +document.getElementById('fin_credito').value;
  const finTasa    = +document.getElementById('fin_tasa').value / 100;
  const finPlazo   = +document.getElementById('fin_plazo').value;
  const tasaImp    = +document.getElementById('fin_impuesto').value / 100;
  const cxcBG      = +document.getElementById('fin_cxc').value;

  const gastosFinAnuales = finCredito * finTasa;
  const pagoCreditoAnual = finCredito / finPlazo;

  /* ── Estado de Resultados ── */
  const cv_anio = totalCV_mes * 12;
  const cf_anio = totalCF_mes * 12;
  const ga_anio = totalGA_mes * 12;
  const utilOp  = ingAnual1 - cv_anio - cf_anio - ga_anio - depAnual;
  const uai     = utilOp - gastosFinAnuales;
  const impuesto = Math.max(0, uai * tasaImp);
  const utilNeta = uai - impuesto;

  /* ── Punto de Equilibrio ── */
  const peP    = +document.getElementById('pe_precio').value;
  const peCVU  = +document.getElementById('pe_cvu').value;
  const peCF   = totalCF_mes * 12;
  const pePunto = peCF / (peP - peCVU);

  /* ── Balance General simplificado ── */
  const cajaBancos     = utilNeta * 0.1125;
  const inventariosBG  = state.capital_trabajo.find(r => r.name.toLowerCase().includes('inventario'))?.val || 7000000;
  const activoCorriente = cajaBancos + inventariosBG + cxcBG;
  const activosNoCorr  = totalAF - depAnual + totalAD;
  const totalActivos   = activoCorriente + activosNoCorr;

  const proveedores      = totalCV_mes * 0.5;
  const impXPagar        = impuesto / 12;
  const totalPasivos     = finCredito + proveedores + impXPagar;
  const utilRetenidas    = utilNeta * 0.15;
  const totalPatrimonio  = finPropio + utilRetenidas;
  const totalPasivoPatrimonio = totalPasivos + totalPatrimonio;

  /* ── Proyección N años ── */
  const ingresos = [], egresos = [], saldos = [-invTotal];
  for(let i = 1; i <= anios; i++){
    const ing = ingAnual1 * Math.pow(1 + crecimiento, i-1);
    const eg  = totalCostos_anio * Math.pow(1.05, i-1) + depAnual + gastosFinAnuales + impuesto + pagoCreditoAnual;
    ingresos.push(ing);
    egresos.push(eg);
    saldos.push(ing - eg);
  }
  const saldoAcum = saldos.reduce((acc, v, i) => { acc.push((acc[i-1] || 0) + v); return acc; }, []);

  /* ── VPN ── */
  let vpn = -invTotal;
  saldos.slice(1).forEach((f, i) => vpn += f / Math.pow(1 + tasaDesc, i+1));

  /* ── TIR (Newton-Raphson) ── */
  let tir = 0.3;
  for(let it = 0; it < 200; it++){
    let npv = -invTotal, dnpv = 0;
    saldos.slice(1).forEach((f, i) => {
      npv  += f / Math.pow(1+tir, i+1);
      dnpv -= (i+1)*f / Math.pow(1+tir, i+2);
    });
    const delta = npv / dnpv;
    tir -= delta;
    if(Math.abs(delta) < 1e-8) break;
  }

  /* ── Relación B/C ── */
  let pvIngresos = 0, pvEgresos = invTotal;
  ingresos.forEach((v, i) => pvIngresos += v / Math.pow(1+tasaDesc, i+1));
  egresos.forEach((v, i) => pvEgresos  += v / Math.pow(1+tasaDesc, i+1));
  const bc = pvIngresos / pvEgresos;

  /* ── Período de recuperación ── */
  let pr = anios, acum = -invTotal;
  for(let i = 0; i < saldos.slice(1).length; i++){
    acum += saldos.slice(1)[i];
    if(acum >= 0){ pr = i + 1 - (acum / saldos.slice(1)[i]); break; }
  }

  /* ── RENDER RESULTADOS ── */
  goStep(5);

  document.getElementById('res_titulo').textContent = document.getElementById('p_nombre').value || 'Estudio Financiero';
  document.getElementById('res_sub').textContent    = document.getElementById('p_objetivo').value || 'Análisis de viabilidad financiera';

  /* KPIs */
  const vpnOk = vpn > 0, tirOk = tir > tasaDesc;
  document.getElementById('kpi_grid').innerHTML = `
    <div class="kpi-card ${vpnOk?'green':'red'}">
      <div class="kpi-label">VPN (Valor Presente Neto)</div>
      <div class="kpi-value">${COP(vpn)}</div>
      <span class="kpi-badge ${vpnOk?'badge-ok':'badge-bad'}">${vpnOk?'Viable':'No viable'}</span>
    </div>
    <div class="kpi-card ${tirOk?'green':'red'}">
      <div class="kpi-label">TIR</div>
      <div class="kpi-value">${(tir*100).toFixed(2)}%</div>
      <div class="kpi-sub">Tasa descuento: ${(tasaDesc*100).toFixed(1)}%</div>
      <span class="kpi-badge ${tirOk?'badge-ok':'badge-bad'}">${tirOk?'Superior':'Inferior'} a la tasa mínima</span>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Relación B/C</div>
      <div class="kpi-value">${bc.toFixed(3)}</div>
      <span class="kpi-badge ${bc>1?'badge-ok':'badge-bad'}">${bc>1?'Beneficios > costos':'Costos > beneficios'}</span>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Período de recuperación</div>
      <div class="kpi-value">${pr.toFixed(2)} años</div>
      <div class="kpi-sub">${(pr*12).toFixed(1)} meses</div>
    </div>
    <div class="kpi-card ${utilNeta>0?'green':'red'}">
      <div class="kpi-label">Utilidad neta año 1</div>
      <div class="kpi-value">${COP(utilNeta)}</div>
      <span class="kpi-badge ${utilNeta>0?'badge-ok':'badge-bad'}">${utilNeta>0?'Positiva':'Negativa'}</span>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Inversión total</div>
      <div class="kpi-value">${COP(invTotal)}</div>
      <div class="kpi-sub">Propio: ${COP(finPropio)} / Crédito: ${COP(finCredito)}</div>
    </div>
  `;

  /* Estado de Resultados */
  const erRows = [
    ['Ingresos operacionales', ingAnual1, false],
    ['( - ) Costos variables', cv_anio, false],
    ['( - ) Costos fijos', cf_anio, false],
    ['( - ) Gastos administrativos', ga_anio, false],
    ['( - ) Depreciación', depAnual, false],
    ['= Utilidad operacional', utilOp, true],
    ['( - ) Gastos financieros', gastosFinAnuales, false],
    ['= Utilidad antes de impuestos', uai, true],
    [`( - ) Impuesto de renta (${(tasaImp*100).toFixed(0)}%)`, impuesto, false],
    ['= UTILIDAD NETA', utilNeta, 'highlight'],
  ];
  document.getElementById('er_table').innerHTML =
    '<tr><th>Concepto</th><th class="num">Valor anual</th></tr>' +
    erRows.map(([c,v,cls]) => `<tr class="${cls===true?'total':cls==='highlight'?'highlight':''}"><td>${c}</td><td class="num">${COP(v)}</td></tr>`).join('');

  /* Indicadores */
  const margenNeto = (utilNeta / ingAnual1) * 100;
  const margenOp   = (utilOp / ingAnual1) * 100;
  document.getElementById('ind_table').innerHTML =
    '<tr><th>Indicador</th><th class="num">Valor</th><th>Interpretación</th></tr>' +
    [
      ['VPN', COP(vpn), vpnOk ? 'Proyecto viable (VPN > 0)' : 'Proyecto no viable (VPN < 0)'],
      ['TIR', (tir*100).toFixed(2)+'%', tirOk ? `Supera la tasa de descuento (${(tasaDesc*100).toFixed(1)}%)` : `Por debajo de la tasa de descuento (${(tasaDesc*100).toFixed(1)}%)`],
      ['Relación B/C', bc.toFixed(3), bc>1 ? 'Por cada $1 invertido se generan $'+bc.toFixed(2)+' de beneficio' : 'No se recupera la inversión'],
      ['Período de recuperación', pr.toFixed(2)+' años', 'Se recupera la inversión en '+Math.ceil(pr*12)+' meses aprox.'],
      ['Margen neto', margenNeto.toFixed(2)+'%', margenNeto>10 ? 'Margen saludable' : 'Margen bajo, revisar estructura de costos'],
      ['Margen operativo', margenOp.toFixed(2)+'%', margenOp>15 ? 'Operación eficiente' : 'Revisar costos operativos'],
      ['Punto de equilibrio (uds/año)', Math.ceil(pePunto).toLocaleString('es-CO')+' uds', 'Necesita vender '+Math.ceil(pePunto)+' unidades/año para cubrir costos fijos'],
    ].map(([c,v,i]) => `<tr><td>${c}</td><td class="num">${v}</td><td style="font-size:12px;color:var(--ink-light)">${i}</td></tr>`).join('');

  /* Balance General */
  document.getElementById('bg_table').innerHTML =
    '<tr><th>Concepto</th><th class="num">Valor</th></tr>' +
    [
      ['ACTIVOS', '', false],
      ['Activo corriente', '', false],
      ['  Caja y bancos', cajaBancos, false],
      ['  Inventarios', inventariosBG, false],
      ['  Cuentas por cobrar', cxcBG, false],
      ['Total activo corriente', activoCorriente, true],
      ['Activo no corriente', '', false],
      ['  Maquinaria y equipos', totalAF, false],
      ['  ( - ) Depreciación acumulada', depAnual, false],
      ['  Activos diferidos', totalAD, false],
      ['Total activo no corriente', activosNoCorr, true],
      ['TOTAL ACTIVOS', totalActivos, 'highlight'],
      ['', '', false],
      ['PASIVOS', '', false],
      ['  Crédito bancario', finCredito, false],
      ['  Proveedores', proveedores, false],
      ['  Impuestos por pagar', impXPagar, false],
      ['TOTAL PASIVOS', totalPasivos, true],
      ['PATRIMONIO', '', false],
      ['  Capital social', finPropio, false],
      ['  Utilidades retenidas', utilRetenidas, false],
      ['TOTAL PATRIMONIO', totalPatrimonio, true],
      ['TOTAL PASIVO + PATRIMONIO', totalPasivoPatrimonio, 'highlight'],
    ].map(([c,v,cls]) => `<tr class="${cls===true?'total':cls==='highlight'?'highlight':''}"><td>${c}</td><td class="num">${typeof v==='number'?COP(v):v}</td></tr>`).join('');

  /* Punto de Equilibrio */
  document.getElementById('pe_table').innerHTML =
    '<tr><th>Concepto</th><th class="num">Valor</th></tr>' +
    [
      ['Precio unitario', COP(peP)],
      ['Costo variable unitario', COP(peCVU)],
      ['Margen de contribución unitario', COP(peP-peCVU)],
      ['Costos fijos anuales', COP(peCF)],
      ['Punto de equilibrio (unidades/año)', Math.ceil(pePunto).toLocaleString('es-CO')+' uds'],
      ['Punto de equilibrio mensual', (pePunto/12).toFixed(0)+' uds/mes'],
      ['Ventas reales anuales', (ventasDia*diasMes*12).toLocaleString('es-CO')+' uds'],
      ['Margen de seguridad', ((1-(pePunto/(ventasDia*diasMes*12)))*100).toFixed(1)+'%'],
    ].map(([c,v]) => `<tr><td>${c}</td><td class="num">${v}</td></tr>`).join('');

  /* Charts */
  const labels = Array.from({length:anios}, (_,i) => 'Año '+(i+1));
  renderChartInversion(totalAF, totalAD, totalCT);
  renderChartFlujo(labels, ingresos, egresos);
  renderChartAcumulado(labels, saldoAcum.slice(1));
  renderChartPE(peP, peCVU, pePunto);

  /* Conclusión */
  const viable = vpnOk && tirOk && bc > 1 && utilNeta > 0;
  document.getElementById('conclusion_box').innerHTML = `
    <h3>Conclusión general</h3>
    <p>El proyecto <strong>${document.getElementById('p_nombre').value||''}</strong>
      ${viable?'presenta viabilidad financiera':'presenta limitaciones de viabilidad financiera'}
      con base en los indicadores calculados:</p>
    <ul style="margin-top:12px">
      <li>${vpnOk?'✓':'✗'} VPN ${vpnOk?'positivo':'negativo'}: ${COP(vpn)} — ${vpnOk?'se generará valor':'se destruirá valor'} con el proyecto.</li>
      <li>${tirOk?'✓':'✗'} TIR de ${(tir*100).toFixed(2)}% ${tirOk?'supera':'no supera'} la tasa mínima requerida de ${(tasaDesc*100).toFixed(1)}%.</li>
      <li>${bc>1?'✓':'✗'} Relación B/C de ${bc.toFixed(3)} — por cada peso invertido se ${bc>1?'genera':'pierde'} $${bc.toFixed(2)}.</li>
      <li>${utilNeta>0?'✓':'✗'} Utilidad neta de ${COP(utilNeta)} en el primer año.</li>
      <li>✓ Punto de equilibrio: ${Math.ceil(pePunto).toLocaleString('es-CO')} unidades/año (${(pePunto/12).toFixed(0)}/mes).</li>
    </ul>
    <p style="margin-top:16px"><strong>${viable
      ? 'Por lo tanto, se recomienda ejecutar el proyecto.'
      : 'Se recomienda revisar la estructura de costos y/o la estrategia de ingresos antes de ejecutar el proyecto.'
    }</strong></p>
  `;
}

/* ───────────────── CHARTS ───────────────── */
const charts = {};

function destroyChart(id) {
  if(charts[id]){ charts[id].destroy(); delete charts[id]; }
}

function renderChartFlujo(labels, ing, eg) {
  destroyChart('flujo');
  charts['flujo'] = new Chart(document.getElementById('chartFlujoCaja'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {label:'Ingresos', data:ing.map(v=>Math.round(v/1e6)), backgroundColor:'#1E7F4E', borderRadius:3},
        {label:'Egresos',  data:eg.map(v=>Math.round(v/1e6)),  backgroundColor:'#C9A84C', borderRadius:3}
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { ticks: { callback: v => v+'M' }, grid: { color: 'rgba(0,0,0,0.05)' } } }
    }
  });
}

function renderChartAcumulado(labels, acum) {
  destroyChart('acum');
  const colors = acum.map(v => v >= 0 ? 'rgba(30,127,78,0.7)' : 'rgba(192,57,43,0.7)');
  charts['acum'] = new Chart(document.getElementById('chartAcumulado'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label:'Flujo acumulado', data:acum.map(v=>Math.round(v/1e6)), backgroundColor:colors, borderRadius:3 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { ticks: { callback: v => v+'M' }, grid: { color: 'rgba(0,0,0,0.05)' } } }
    }
  });
}

function renderChartInversion(af, ad, ct) {
  destroyChart('inv');
  const data = [af, ad, ct];
  const lbls = ['Activos fijos', 'Activos diferidos', 'Capital de trabajo'];
  const cols = ['#1A1612', '#C9A84C', '#8B6914'];
  charts['inv'] = new Chart(document.getElementById('chartInversion'), {
    type: 'doughnut',
    data: { labels: lbls, datasets: [{ data, backgroundColor: cols, borderWidth: 0 }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '60%',
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ' '+COP(c.raw) } } }
    }
  });
  const total = af + ad + ct;
  document.getElementById('inv_leyenda').innerHTML = lbls.map((l, i) => `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
      <span style="width:12px;height:12px;border-radius:2px;background:${cols[i]};flex-shrink:0"></span>
      <span style="flex:1;color:var(--ink-mid)">${l}</span>
      <span style="font-weight:500;font-variant-numeric:tabular-nums">${COP(data[i])}</span>
      <span style="color:var(--ink-light);font-size:11px">${((data[i]/total)*100).toFixed(1)}%</span>
    </div>
  `).join('');
}

function renderChartPE(precio, cvu, peQ) {
  destroyChart('pe');
  const maxQ = Math.ceil(peQ * 1.5 / 1000) * 1000;
  const step = Math.ceil(maxQ / 10 / 1000) * 1000 || 1000;
  const qs = [];
  for(let q = 0; q <= maxQ; q += step) qs.push(q);
  const IT     = qs.map(q => q * precio);
  const CT_data = qs.map(q => q * cvu + state.cf.reduce((s,r) => s+r.val, 0) * 12);
  charts['pe'] = new Chart(document.getElementById('chartPE'), {
    type: 'line',
    data: {
      labels: qs.map(q => q.toLocaleString('es-CO')),
      datasets: [
        {label:'Ingresos totales', data:IT.map(v=>Math.round(v/1e6)),     borderColor:'#1E7F4E', tension:0.1, borderWidth:2, pointRadius:2},
        {label:'Costos totales',   data:CT_data.map(v=>Math.round(v/1e6)), borderColor:'#C9A84C', tension:0.1, borderWidth:2, pointRadius:2, borderDash:[5,3]}
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { callback: v => v+'M' }, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { ticks: { maxRotation: 30, font: { size: 10 } } }
      }
    }
  });
}

/* ───────────────── EXPORT PDF ───────────────── */
function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
  const W = doc.internal.pageSize.getWidth();

  doc.setFillColor(26,22,18);
  doc.rect(0,0,W,28,'F');
  doc.setFont('helvetica','bold');
  doc.setFontSize(14);
  doc.setTextColor(201,168,76);
  doc.text(document.getElementById('p_nombre').value||'Estudio Financiero', 14, 17);
  doc.setFontSize(9);
  doc.setFont('helvetica','normal');
  doc.setTextColor(138,132,128);
  doc.text('Generado el '+new Date().toLocaleDateString('es-CO'), W-14, 17, {align:'right'});

  let y = 40;
  const line = (label, val) => {
    if(y > 270){ doc.addPage(); y = 20; }
    doc.setFont('helvetica','normal');
    doc.setFontSize(10);
    doc.setTextColor(74,69,64);
    doc.text(label, 14, y);
    doc.setTextColor(26,22,18);
    doc.text(String(val), W-14, y, {align:'right'});
    y += 6;
  };
  const section = title => {
    if(y > 260){ doc.addPage(); y = 20; }
    y += 4;
    doc.setFillColor(242,237,224);
    doc.rect(14, y-5, W-28, 8, 'F');
    doc.setFont('helvetica','bold');
    doc.setFontSize(10);
    doc.setTextColor(139,105,20);
    doc.text(title.toUpperCase(), 16, y);
    y += 9;
  };

  section('Estado de Resultados — Año 1');
  const ir = +document.getElementById('ing_ventas_dia').value
           * +document.getElementById('ing_precio').value
           * +document.getElementById('ing_dias_mes').value * 12;
  line('Ingresos operacionales', COP(ir));
  line('Costos variables',        COP(state.cv.reduce((s,r)=>s+r.val,0)*12));
  line('Costos fijos',            COP(state.cf.reduce((s,r)=>s+r.val,0)*12));
  line('Gastos administrativos',  COP(state.ga.reduce((s,r)=>s+r.val,0)*12));

  section('Indicadores Financieros');
  document.querySelectorAll('#kpi_grid .kpi-card').forEach(k => {
    const lbl = k.querySelector('.kpi-label')?.textContent;
    const val = k.querySelector('.kpi-value')?.textContent;
    if(lbl && val) line(lbl, val);
  });

  section('Conclusión');
  const conclusionText = document.getElementById('conclusion_box').innerText;
  const lines = doc.splitTextToSize(conclusionText, W-28);
  doc.setFont('helvetica','normal');
  doc.setFontSize(9);
  doc.setTextColor(74,69,64);
  lines.forEach(l => { if(y>275){doc.addPage();y=20;} doc.text(l,14,y); y+=5; });

  doc.save((document.getElementById('p_nombre').value||'estudio_financiero').replace(/\s+/g,'_')+'.pdf');
}

/* ───────────────── RESET ───────────────── */
function resetForm() {
  if(!confirm('¿Deseas iniciar un nuevo estudio? Los datos actuales se perderán.')) return;
  location.reload();
}