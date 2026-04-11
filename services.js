const WEBHOOK = 'https://n8n-n8n.7toway.easypanel.host/webhook/0e6a220e-8739-4db7-9770-cd6f4a4c35f4';

const SVC = {
  'residential-1bed':     { name: 'Residential – 1 Bedroom Apartment',          price: 'Quote on visit', category: 'Residential Cleaning' },
  'residential-2bed':     { name: 'Residential – 2 Bedroom House',               price: 'Quote on visit', category: 'Residential Cleaning' },
  'residential-3bed':     { name: 'Residential – 3 Bedroom House',               price: 'Quote on visit', category: 'Residential Cleaning' },
  'residential-general':  { name: 'Residential – General Home Cleaning',         price: 'Quote on visit', category: 'Residential Cleaning' },
  'residential-onetime':  { name: 'Residential – One-Time Refresh',              price: 'Quote on visit', category: 'Residential Cleaning' },
  'deep-1bed':            { name: 'Deep Clean – 1 Bedroom',                      price: 'Quote on visit', category: 'Deep Cleaning' },
  'deep-2bed':            { name: 'Deep Clean – 2 Bedrooms',                     price: 'Quote on visit', category: 'Deep Cleaning' },
  'deep-3bed':            { name: 'Deep Clean – 3 Bedrooms',                     price: 'Quote on visit', category: 'Deep Cleaning' },
  'deep-4bed':            { name: 'Deep Clean – 4+ Bedrooms',                    price: 'Quote on visit', category: 'Deep Cleaning' },
  'commercial-small':     { name: 'Commercial – Small Office (up to 500 sq ft)', price: 'Quote on visit', category: 'Commercial Cleaning' },
  'commercial-medium':    { name: 'Commercial – Medium Office (500–1,500 sq ft)',price: 'Quote on visit', category: 'Commercial Cleaning' },
  'commercial-large':     { name: 'Commercial – Large Office (1,500+ sq ft)',    price: 'Quote on visit', category: 'Commercial Cleaning' },
  'commercial-retail':    { name: 'Commercial – Retail Store',                   price: 'Quote on visit', category: 'Commercial Cleaning' },
  'commercial-warehouse': { name: 'Commercial – Warehouse/Industrial',           price: 'Quote on visit', category: 'Commercial Cleaning' },
  'sofa-1seat':           { name: '1 Seat Sofa',                                 price: '$6,000',         category: 'Steam Cleaning' },
  'sofa-2seat':           { name: '2 Seat Sofa',                                 price: '$10,000',        category: 'Steam Cleaning' },
  'sofa-3seat':           { name: '3 Seat Sofa',                                 price: '$14,000',        category: 'Steam Cleaning' },
  'l-shaped':             { name: 'L-Shaped Sofa',                               price: '$16,000',        category: 'Steam Cleaning' },
  'suite-321':            { name: '3-2-1 Suite',                                 price: '$24,000',        category: 'Steam Cleaning' },
  'suite-311':            { name: '3-1-1 Suite',                                 price: '$20,000',        category: 'Steam Cleaning' },
  'recliners':            { name: 'Single Recliner',                             price: '$6,000',         category: 'Steam Cleaning' },
  'recliners-joined':     { name: 'Joined Recliners',                            price: '$10,000',        category: 'Steam Cleaning' },
  'mattress-king':        { name: 'King Mattress + 2 Pillows',                   price: '$10,000',        category: 'Steam Cleaning' },
  'mattress-queen':       { name: 'Queen Mattress + 2 Pillows',                  price: '$8,000',         category: 'Steam Cleaning' },
  'car':                  { name: 'Car Interior (with mats)',                     price: '$12,000',        category: 'Steam Cleaning' },
  'suv':                  { name: 'SUV Interior (with mats)',                     price: '$16,000',        category: 'Steam Cleaning' },
  'office-chairs':        { name: 'Office Chair',                                price: '$2,500/each',    category: 'Steam Cleaning' },
  'dining-chairs':        { name: 'Dining Chair',                                price: '$2,000/each',    category: 'Steam Cleaning' },
  'movein-1bed':          { name: 'Move-In/Out – 1 Bedroom',                     price: 'Quote on visit', category: 'Move In/Out' },
  'movein-2bed':          { name: 'Move-In/Out – 2 Bedrooms',                    price: 'Quote on visit', category: 'Move In/Out' },
  'movein-3bed':          { name: 'Move-In/Out – 3 Bedrooms',                    price: 'Quote on visit', category: 'Move In/Out' },
  'movein-4bed':          { name: 'Move-In/Out – 4+ Bedrooms',                   price: 'Quote on visit', category: 'Move In/Out' },
  'pressure-driveway':    { name: 'Pressure Washing – Driveway & Walkway',       price: '$30/sq ft',      category: 'Pressure Washing' },
  'pressure-patio':       { name: 'Pressure Washing – Patio/Terrace',            price: '$30/sq ft',      category: 'Pressure Washing' },
  'pressure-building':    { name: 'Pressure Washing – Building Exterior',        price: '$30/sq ft',      category: 'Pressure Washing' },
  'pressure-fence':       { name: 'Pressure Washing – Fence Cleaning',           price: '$30/sq ft',      category: 'Pressure Washing' },
  'pressure-parking':     { name: 'Pressure Washing – Parking Lot',             price: '$30/sq ft',      category: 'Pressure Washing' },
};

// ┌──────────────────────────────────────────────────────────────────────────┐
// │  AVAILABLE DATES — Edit these to control which dates appear on each     │
// │  calendar. Format: 'YYYY-M-D' (no leading zeros needed).               │
// │  Each category maps to its own list of available dates.                 │
// └──────────────────────────────────────────────────────────────────────────┘
const availableDates = {
  'Steam Cleaning':       ['2026-3-28','2026-3-29','2026-3-30','2026-4-18','2026-4-19','2026-4-10'],
  'Carpet Cleaning':      ['2026-3-28','2026-3-29','2026-4-30','2026-4-8','2026-4-2','2026-4-3'],
  'Pressure Washing':     ['2026-3-28','2026-3-29','2026-3-30'],
  'Residential Cleaning': ['2026-3-28','2026-3-29','2026-3-30'],
  'Deep Cleaning':        ['2026-3-28','2026-3-29','2026-3-30'],
  'Commercial Cleaning':  ['2026-3-28','2026-3-29','2026-3-30'],
  'Move In/Out':          ['2026-3-28','2026-3-29','2026-3-30'],
};

// ── CALENDAR STATE ────────────────────────────────────────────────────────
var calStates = {};
var currentCategories = {}; // tracks current category per prefix

// ── SERVICE CHANGE HANDLER (like index.html) ──────────────────────────────
function onServiceChangeSection(prefix) {
  var sk = document.getElementById(prefix + '-servicio').value;
  var sd = SVC[sk];
  var placeholder = document.getElementById('cal-placeholder-' + prefix);
  var content = document.getElementById('cal-content-' + prefix);

  // Reset selected date
  calStates['cal-' + prefix] = calStates['cal-' + prefix] || {};
  calStates['cal-' + prefix].selected = null;
  document.getElementById(prefix + '-fecha').value = '';

  if (sd) {
    // Service selected — show calendar with available dates
    currentCategories[prefix] = sd.category;
    if (placeholder) placeholder.classList.add('hidden');
    if (content) content.classList.remove('hidden');
    initCalendar('cal-' + prefix);
  } else {
    // No service selected — show placeholder
    currentCategories[prefix] = null;
    if (placeholder) placeholder.classList.remove('hidden');
    if (content) content.classList.add('hidden');
  }
}

// ── CALENDAR ──────────────────────────────────────────────────────────────
function initCalendar(containerId) {
  var now = new Date();
  if (!calStates[containerId]) {
    calStates[containerId] = { month: now.getMonth(), year: now.getFullYear(), selected: null };
  } else {
    calStates[containerId].month = now.getMonth();
    calStates[containerId].year = now.getFullYear();
  }
  renderCalendar(containerId);
}

function renderCalendar(containerId) {
  var prefix = containerId.replace('cal-', '');
  var contentEl = document.getElementById('cal-content-' + prefix);
  if (!contentEl) return;

  var state = calStates[containerId];
  if (!state) return;

  var category = currentCategories[prefix] || document.getElementById(containerId).getAttribute('data-category');
  var catDates = (category && availableDates[category]) || [];
  var availSet = new Set(catDates);

  var monthNames   = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var dayNames     = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var fullDayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  var today = new Date(); today.setHours(0,0,0,0);
  var firstDay = new Date(state.year, state.month, 1).getDay();
  var daysInMonth = new Date(state.year, state.month + 1, 0).getDate();

  var html = '<div class="cal-header">';
  html += '<div class="cal-nav"><button type="button" onclick="calPrev(\'' + containerId + '\')"><i class="fas fa-chevron-left"></i></button></div>';
  html += '<h4>' + monthNames[state.month] + ' ' + state.year + '</h4>';
  html += '<div class="cal-nav"><button type="button" onclick="calNext(\'' + containerId + '\')"><i class="fas fa-chevron-right"></i></button></div>';
  html += '</div><div class="cal-grid">';

  for (var i = 0; i < 7; i++) html += '<div class="cal-label">' + dayNames[i] + '</div>';
  for (var i = 0; i < firstDay; i++) html += '<div class="cal-day"></div>';

  for (var d = 1; d <= daysInMonth; d++) {
    var cellDate = new Date(state.year, state.month, d); cellDate.setHours(0,0,0,0);
    var dateStr  = state.year + '-' + (state.month + 1) + '-' + d;
    var classes  = 'cal-day current-month';
    var onclick  = '';

    if (cellDate.getTime() === today.getTime()) classes += ' today';

    if (cellDate < today) {
      classes += ' unavailable';
    } else if (availSet.has(dateStr)) {
      classes += ' available';
      onclick = ' onclick="selectCalDate(\'' + containerId + '\',\'' + dateStr + '\',\'' + prefix + '\')"';
    } else {
      classes += ' unavailable';
    }

    if (state.selected === dateStr) { classes += ' selected'; classes = classes.replace(' unavailable', ''); }
    html += '<div class="' + classes + '"' + onclick + '>' + d + '</div>';
  }

  html += '</div>';

  // Legend
  html += '<div class="cal-legend">';
  html += '<div class="cal-legend-item"><div class="cal-legend-dot avail"></div> Available</div>';
  html += '<div class="cal-legend-item"><div class="cal-legend-dot sel"></div> Selected</div>';
  html += '<div class="cal-legend-item"><div class="cal-legend-dot unav"></div> Unavailable</div>';
  html += '</div>';

  // Selected date display
  html += '<div class="cal-selected-display' + (state.selected ? ' show' : '') + '" id="caldisp-' + prefix + '">';
  if (state.selected) {
    var parts   = state.selected.split('-');
    var dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    html += '<i class="fas fa-check-circle"></i> ' + fullDayNames[dateObj.getDay()] + ', ' + monthNames[dateObj.getMonth()] + ' ' + parts[2] + ', ' + parts[0];
  }
  html += '</div>';

  contentEl.innerHTML = html;
}

function selectCalDate(containerId, dateStr, prefix) {
  calStates[containerId].selected = dateStr;
  var parts   = dateStr.split('-');
  var isoDate = parts[0] + '-' + parts[1].padStart(2, '0') + '-' + parts[2].padStart(2, '0');
  document.getElementById(prefix + '-fecha').value = isoDate;
  renderCalendar(containerId);
}

function calPrev(containerId) {
  var s = calStates[containerId];
  s.month--;
  if (s.month < 0) { s.month = 11; s.year--; }
  renderCalendar(containerId);
}

function calNext(containerId) {
  var s = calStates[containerId];
  s.month++;
  if (s.month > 11) { s.month = 0; s.year++; }
  renderCalendar(containerId);
}

// ── TOAST ─────────────────────────────────────────────────────────────────
function showToast(msg, type, dur) {
  dur = dur || 4500;
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className   = 'toast show ' + (type || 'info');
  setTimeout(function () { t.classList.remove('show'); }, dur);
}

// ── FORM TOGGLE ───────────────────────────────────────────────────────────
function toggleForm(id) {
  var f = document.getElementById(id);
  if (!f) return;
  var isOpen = f.classList.contains('open');
  document.querySelectorAll('.form-section.open').forEach(function (x) { x.classList.remove('open'); });
  if (!isOpen) {
    f.classList.add('open');
    setTimeout(function () { f.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
  }
}

// ── VALIDATION ────────────────────────────────────────────────────────────
function getVal(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }

function validateForm(p) {
  var ok = true;
  document.querySelectorAll('.field-error').forEach(function (el) { el.classList.remove('field-error'); });
  document.querySelectorAll('.error-msg').forEach(function (el) { el.textContent = ''; });

  function err(id, msg) {
    var el = document.getElementById(id);
    if (el) el.classList.add('field-error');
    var em = document.getElementById('err-' + id);
    if (em) em.textContent = msg;
    ok = false;
  }

  var n = getVal(p + '-nombre'), e = getVal(p + '-email');
  var t = getVal(p + '-telefono'), s = getVal(p + '-servicio');
  var f = getVal(p + '-fecha'),   d = getVal(p + '-direccion');

  if (!n) err(p + '-nombre',   'Name is required.');
  if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) err(p + '-email', 'Valid email required.');
  if (!t || !/^[\+]?[\d\s\-\(\)]{7,15}$/.test(t.replace(/\s/g, ''))) err(p + '-telefono', 'Valid phone required.');
  if (!s) err(p + '-servicio', 'Please select a service.');
  if (!f) { err(p + '-fecha', 'Please select a date.'); showToast('Please select an available date from the calendar.', 'error'); }
  if (!d) err(p + '-direccion', 'Address is required.');
  return ok;
}

// ── SUBMIT ────────────────────────────────────────────────────────────────
async function submitForm(prefix, serviceName) {
  if (!validateForm(prefix)) { showToast('Please fill in all required fields.', 'error'); return; }
  var btn = document.getElementById('btn-' + prefix);
  if (!btn) return;
  btn.disabled  = true;
  btn.innerHTML = '<div class="spinner"></div> Sending...';

  var sk    = getVal(prefix + '-servicio');
  var svcEl = document.getElementById(prefix + '-servicio');
  var svcTx = svcEl && svcEl.options[svcEl.selectedIndex] ? svcEl.options[svcEl.selectedIndex].text : sk;
  var sd    = SVC[sk] || {};
  var fecha = getVal(prefix + '-fecha');

  var payload = {
    nombre:      getVal(prefix + '-nombre'),
    email:       getVal(prefix + '-email'),
    telefono:    getVal(prefix + '-telefono'),
    servicioKey: sk,
    servicio:    sd.name || svcTx,
    categoria:   sd.category || serviceName,
    precio:      sd.price || 'Quote on visit',
    fecha:       fecha,
    horario:     '09:00',
    fechaHora:   fecha + 'T09:00',
    direccion:   getVal(prefix + '-direccion'),
    notas:       getVal(prefix + '-notas'),
    cantidad: null, sqft: null, pickup: null, tipoMudanza: null,
    timestamp:   new Date().toISOString(),
    source:      'standardhomecleaning.html',
  };

  try {
    await fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  } catch (e) { console.error('Webhook error:', e); }

  showSuccessPanel(prefix, payload);
  showToast("Booking sent! We'll confirm via WhatsApp soon.", 'success', 6000);
  btn.disabled  = false;
  btn.innerHTML = '<i class="fas fa-paper-plane"></i><span>Book Again</span>';
}

function showSuccessPanel(prefix, data) {
  var panel = document.getElementById('success-' + prefix);
  if (!panel) return;
  var fmt = data.fecha
    ? new Date(data.fecha + 'T12:00:00').toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
    : 'TBD';
  panel.innerHTML =
    '<div class="success-icon">&#9989;</div>' +
    '<h3>Booking Request Sent!</h3>' +
    '<p>Thank you <strong>' + data.nombre + '</strong>! Our team will confirm via WhatsApp.</p>' +
    '<div class="success-details">' +
    '<div><span>Service</span><span>'  + data.servicio  + '</span></div>' +
    '<div><span>Price</span><span>'    + data.precio    + '</span></div>' +
    '<div><span>Date</span><span>'     + fmt            + '</span></div>' +
    '<div><span>Address</span><span>'  + data.direccion + '</span></div>' +
    '<div><span>WhatsApp</span><span>' + data.telefono  + '</span></div>' +
    '</div>' +
    '<button class="btn-reset" onclick="resetForm(\'' + prefix + '\')"><i class="fas fa-plus"></i> New Booking</button>';
  panel.classList.add('show');
  setTimeout(function () { panel.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 200);
}

function resetForm(prefix) {
  var p = document.getElementById('success-' + prefix);
  if (p) p.classList.remove('show');
  document.querySelectorAll('[id^="' + prefix + '-"]').forEach(function (f) {
    if (f.tagName !== 'BUTTON') f.value = f.type === 'radio' ? f.value : '';
  });
  document.querySelectorAll('.field-error').forEach(function (e) { e.classList.remove('field-error'); });
  document.querySelectorAll('.error-msg').forEach(function (e) { e.textContent = ''; });

  // Reset calendar to placeholder state
  currentCategories[prefix] = null;
  var placeholder = document.getElementById('cal-placeholder-' + prefix);
  var content = document.getElementById('cal-content-' + prefix);
  if (placeholder) placeholder.classList.remove('hidden');
  if (content) content.classList.add('hidden');

  var calId = 'cal-' + prefix;
  if (calStates[calId]) { calStates[calId].selected = null; }
}

// ── INIT ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  var sections = document.querySelectorAll('.service-section');
  var links    = document.querySelectorAll('.quick-nav a');

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        links.forEach(function (l) { l.classList.remove('active'); });
        var lnk = document.querySelector('.quick-nav a[href="#' + e.target.id + '"]');
        if (lnk) lnk.classList.add('active');
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(function (s) { obs.observe(s); });

  var hash = window.location.hash;
  if (hash) {
    var tgt = document.querySelector(hash);
    if (tgt) setTimeout(function () { tgt.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300);
  }
});
