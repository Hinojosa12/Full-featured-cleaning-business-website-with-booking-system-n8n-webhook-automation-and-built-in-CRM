var WEBHOOK = 'https://n8n-n8n.7toway.easypanel.host/webhook/0e6a220e-8739-4db7-9770-cd6f4a4c35f4';

var MMG_PAYMENT_WEBHOOK = 'https://n8n-n8n.7toway.easypanel.host/webhook/mmg-payment';

var SVC = {
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

var availableDates = {
  'Steam Cleaning':       ['2026-3-28','2026-3-29','2026-3-30','2026-4-18','2026-4-19','2026-4-10'],
  'Carpet Cleaning':      ['2026-3-28','2026-3-29','2026-4-30','2026-4-8','2026-4-2','2026-4-3'],
  'Pressure Washing':     ['2026-3-28','2026-3-29','2026-3-30'],
  'Residential Cleaning': ['2026-3-28','2026-3-29','2026-3-30'],
  'Deep Cleaning':        ['2026-3-28','2026-3-29','2026-3-30'],
  'Commercial Cleaning':  ['2026-3-28','2026-3-29','2026-3-30'],
  'Move In/Out':          ['2026-3-28','2026-3-29','2026-3-30'],
};

// ── STATE ─────────────────────────────────────────────────────────────────
var calStates = {};
var currentCategories = {};
var lastBookingPayload = null;

// ══════════════════════════════════════════════════════════════════════════
//  LIVITY UI — Custom Select Dropdown + Visual Enhancements
//  (No existing logic was modified — only added below this block)
// ══════════════════════════════════════════════════════════════════════════
var _lvSet = (typeof WeakSet !== 'undefined') ? new WeakSet() : null;

function LvSelect(native) {
  var self = this;
  this.native = native;
  this.isOpen = false;

  // Wrap the native select
  this.wrap = document.createElement('div');
  this.wrap.className = 'lv-select-wrapper';
  native.parentNode.insertBefore(this.wrap, native);
  this.wrap.appendChild(native);
  this.wrap._lv = this;
  native._lv = this;

  // Trigger button
  this.trig = document.createElement('div');
  this.trig.className = 'lv-trigger';
  this.trig.setAttribute('tabindex', '0');
  this.trig.innerHTML =
    '<span class="lv-value"></span>' +
    '<svg class="lv-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<polyline points="6 9 12 15 18 9"/>' +
    '</svg>';
  this.wrap.appendChild(this.trig);
  this.valEl = this.trig.querySelector('.lv-value');

  // Dropdown panel
  this.panel = document.createElement('div');
  this.panel.className = 'lv-panel';
  this.wrap.appendChild(this.panel);

  // Watch for option changes
  new MutationObserver(function () { self.rebuild(); })
    .observe(native, { childList: true, subtree: true });

  // Events
  this.trig.addEventListener('click', function (e) {
    e.stopPropagation();
    self.isOpen ? self.close() : self.open();
  });
  this.trig.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); self.isOpen ? self.close() : self.open(); }
    else if (e.key === 'Escape') self.close();
    else if (e.key === 'ArrowDown') { e.preventDefault(); self.move(1); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); self.move(-1); }
  });
  document.addEventListener('click', function () { self.close(); });
  this.panel.addEventListener('click', function (e) { e.stopPropagation(); });

  this.rebuild();
}

LvSelect.prototype.rebuild = function () {
  var self = this, panel = this.panel;
  panel.innerHTML = '';
  var opts = Array.from(this.native.options), lastGrp = null;
  var chk =
    '<svg class="lv-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<polyline points="20 6 9 17 4 12"/>' +
    '</svg>';

  opts.forEach(function (opt, i) {
    var grp = (opt.parentElement.tagName === 'OPTGROUP') ? opt.parentElement.label : null;
    if (grp && grp !== lastGrp) {
      lastGrp = grp;
      var gh = document.createElement('div');
      gh.className = 'lv-group-header';
      gh.textContent = grp;
      panel.appendChild(gh);
    } else if (!grp) { lastGrp = null; }

    var item = document.createElement('div');
    item.className = 'lv-option' +
      (opt.value === '' ? ' lv-is-placeholder' : '') +
      (opt.selected && opt.value !== '' ? ' lv-is-selected' : '');
    item.dataset.idx = i;

    var m = opt.text.match(/^(.+?)\s*[—\-–]\s*(.+)$/);
    item.innerHTML = m
      ? '<span class="lv-opt-name">' + m[1].trim() + '</span><span class="lv-opt-badge">' + m[2].trim() + '</span>' + chk
      : '<span class="lv-opt-name">' + opt.text + '</span>' + chk;

    if (opt.value !== '') {
      item.addEventListener('click', (function (idx) {
        return function (e) { e.stopPropagation(); self.select(idx); };
      })(i));
    }
    panel.appendChild(item);
  });
  this.updateDisplay();
};

LvSelect.prototype.select = function (idx) {
  this.native.selectedIndex = idx;
  // Dispatch change on native → triggers all existing onchange= handlers
  this.native.dispatchEvent(new Event('change', { bubbles: true }));
  this.updateDisplay();
  this.panel.querySelectorAll('.lv-option').forEach(function (item) {
    item.classList.toggle('lv-is-selected', parseInt(item.dataset.idx) === idx);
  });
  this.close();
};

LvSelect.prototype.updateDisplay = function () {
  var sel = this.native.options[this.native.selectedIndex];
  if (!sel || sel.value === '') {
    this.valEl.innerHTML = '<span class="lv-placeholder-txt">' + (sel ? sel.text : '— Select —') + '</span>';
  } else {
    var m = sel.text.match(/^(.+?)\s*[—\-–]\s*(.+)$/);
    this.valEl.innerHTML = m
      ? '<span class="lv-sel-label">' + m[1].trim() + '</span><span class="lv-sel-badge">' + m[2].trim() + '</span>'
      : '<span class="lv-sel-label">' + sel.text + '</span>';
  }
};

LvSelect.prototype.open = function () {
  document.querySelectorAll('.lv-select-wrapper.lv-open').forEach(function (w) {
    if (w._lv) w._lv.close();
  });
  this.isOpen = true;
  this.wrap.classList.add('lv-open');
  var rect = this.trig.getBoundingClientRect();
  this.wrap.classList.toggle('lv-dropup', (window.innerHeight - rect.bottom) < 260 && rect.top > 260);
  var p = this.panel;
  p.classList.add('lv-animating');
  p.querySelectorAll('.lv-option, .lv-group-header').forEach(function (el, i) {
    el.style.animationDelay = (i * 0.022) + 's';
  });
  setTimeout(function () { p.classList.remove('lv-animating'); }, 400);
};

LvSelect.prototype.close = function () {
  if (!this.isOpen) return;
  this.isOpen = false;
  this.wrap.classList.remove('lv-open');
};

LvSelect.prototype.move = function (dir) {
  if (!this.isOpen) this.open();
  var opts = this.native.options, idx = this.native.selectedIndex + dir;
  while (idx >= 0 && idx < opts.length && opts[idx].value === '') idx += dir;
  if (idx >= 0 && idx < opts.length) this.select(idx);
};

function initLvSelects() {
  document.querySelectorAll('select').forEach(function (sel) {
    if (sel._lv || (sel.parentElement && sel.parentElement.classList.contains('lv-select-wrapper'))) return;
    if (_lvSet) { if (_lvSet.has(sel)) return; _lvSet.add(sel); }
    new LvSelect(sel);
  });
}

function initLvProgressBar() {
  var bar = document.createElement('div');
  bar.id = 'lv-progress-bar';
  document.body.appendChild(bar);
  window.addEventListener('scroll', function () {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = max > 0 ? Math.min((window.scrollY / max) * 100, 100) + '%' : '0%';
  }, { passive: true });
}

function initLvCursorGlow() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  var g = document.createElement('div');
  g.className = 'lv-cursor-glow';
  document.body.appendChild(g);
  document.addEventListener('mousemove', function (e) {
    g.style.left = e.clientX + 'px';
    g.style.top  = e.clientY + 'px';
  });
}

function initLvRipple() {
  var sel = '.hero-btn,.btn-primary,.btn-gold,.submit-btn,.btn-book,.btn-mmg,.mmg-pay-btn';
  document.addEventListener('click', function (e) {
    var btn = e.target.closest(sel);
    if (!btn) return;
    var c = document.createElement('span');
    c.className = 'lv-ripple-circle';
    var r = btn.getBoundingClientRect();
    c.style.left = (e.clientX - r.left) + 'px';
    c.style.top  = (e.clientY - r.top)  + 'px';
    btn.appendChild(c);
    c.addEventListener('animationend', function () { c.remove(); }, { once: true });
  });
}

function initLvParallax() {
  var heroes = document.querySelectorAll('.service-section');
  if (!heroes.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  window.addEventListener('scroll', function () {
    var sy = window.scrollY;
    heroes.forEach(function (h) {
      var r = h.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      h.style.backgroundPositionY = 'calc(center + ' + (sy * 0.18) + 'px)';
    });
  }, { passive: true });
}

function initLvUI() {
  initLvProgressBar();
  initLvCursorGlow();
  initLvRipple();
  initLvParallax();
  initLvSelects();
}
// ══════════════════════════════════════════════════════════════════════════
//  END LIVITY UI ENHANCEMENTS
// ══════════════════════════════════════════════════════════════════════════

// ── HELPER FUNCTIONS ──────────────────────────────────────────────────────
function parsePrice(priceStr) {
  if (!priceStr || priceStr.toLowerCase().indexOf('quote') !== -1) return null;
  var cleaned = priceStr.replace(/[^0-9.]/g, '');
  var num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function formatGYD(amount) {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0 });
}

function isFixedPrice(priceStr) {
  if (!priceStr) return false;
  return priceStr.toLowerCase().indexOf('quote') === -1 && priceStr.indexOf('/sq ft') === -1 && priceStr.indexOf('/each') === -1;
}

// ── SERVICE CHANGE HANDLER ────────────────────────────────────────────────
function onServiceChangeSection(prefix) {
  var sk = document.getElementById(prefix + '-servicio').value;
  var sd = SVC[sk];
  var placeholder = document.getElementById('cal-placeholder-' + prefix);
  var content = document.getElementById('cal-content-' + prefix);

  calStates['cal-' + prefix] = calStates['cal-' + prefix] || {};
  calStates['cal-' + prefix].selected = null;
  document.getElementById(prefix + '-fecha').value = '';

  if (sd) {
    currentCategories[prefix] = sd.category;
    if (placeholder) placeholder.classList.add('hidden');
    if (content) content.classList.remove('hidden');
    initCalendar('cal-' + prefix);
  } else {
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
  html += '<div class="cal-legend">';
  html += '<div class="cal-legend-item"><div class="cal-legend-dot avail"></div> Available</div>';
  html += '<div class="cal-legend-item"><div class="cal-legend-dot sel"></div> Selected</div>';
  html += '<div class="cal-legend-item"><div class="cal-legend-dot unav"></div> Unavailable</div>';
  html += '</div>';
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

  lastBookingPayload = payload;
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

  var mmgBtnClass    = isFixedPrice(data.precio) ? 'btn-mmg' : 'btn-mmg mmg-disabled';
  var mmgBtnDisabled = isFixedPrice(data.precio) ? '' : ' disabled';
  var mmgAmountText  = isFixedPrice(data.precio) ? data.precio + ' GYD' : 'Quote required';

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
    '<div class="success-actions">' +
      '<button class="btn-reset" onclick="resetForm(\'' + prefix + '\')"><i class="fas fa-plus"></i> New Booking</button>' +
      '<button class="' + mmgBtnClass + '"' + mmgBtnDisabled + ' onclick="openMMGModal()">' +
        '<span class="mmg-btn-inner">' +
          '<span class="mmg-icon-wrap"><i class="fas fa-wallet"></i></span>' +
          '<span class="mmg-btn-text">' +
            '<span class="mmg-label">Pay via MMG</span>' +
            '<span class="mmg-amount">' + mmgAmountText + '</span>' +
          '</span>' +
        '</span>' +
      '</button>' +
    '</div>';
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

  currentCategories[prefix] = null;
  var placeholder = document.getElementById('cal-placeholder-' + prefix);
  var content = document.getElementById('cal-content-' + prefix);
  if (placeholder) placeholder.classList.remove('hidden');
  if (content) content.classList.add('hidden');

  var calId = 'cal-' + prefix;
  if (calStates[calId]) { calStates[calId].selected = null; }

  // Reset the custom select display
  var selEl = document.getElementById(prefix + '-servicio');
  if (selEl && selEl._lv) { selEl._lv.updateDisplay(); }

  lastBookingPayload = null;
}

// ── MMG PAYMENT ───────────────────────────────────────────────────────────
function openMMGModal() {
  if (!lastBookingPayload) return;
  var amount = parsePrice(lastBookingPayload.precio);
  document.getElementById('mmgService').textContent = lastBookingPayload.servicio;
  document.getElementById('mmgTotal').textContent = formatGYD(amount) + ' GYD';
  var phone = lastBookingPayload.telefono.replace(/\+592\s?/, '').replace(/\s/g, '');
  document.getElementById('mmgPhone').value = phone;
  document.getElementById('mmgSuccess').classList.add('hidden');
  document.getElementById('mmgError').classList.add('hidden');
  document.querySelector('.mmg-modal-body').classList.remove('hidden');
  document.getElementById('mmgConfirmPay').classList.remove('hidden');
  document.querySelector('.mmg-secure').classList.remove('hidden');
  document.getElementById('mmgOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMMGModal() {
  document.getElementById('mmgOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

async function processMMGPayment() {
  var phoneInput = document.getElementById('mmgPhone');
  var phone = phoneInput.value.trim().replace(/\s/g, '');
  if (!phone || phone.length < 6) { phoneInput.classList.add('field-error'); showToast('Please enter a valid MMG wallet number.', 'error'); return; }
  phoneInput.classList.remove('field-error');
  var amount = parsePrice(lastBookingPayload.precio);
  if (!amount) { showToast('Cannot determine payment amount.', 'error'); return; }

  var payBtn = document.getElementById('mmgConfirmPay'), payText = document.getElementById('mmgPayText'), paySpinner = document.getElementById('mmgPaySpinner');
  payBtn.disabled = true; payText.classList.add('hidden'); paySpinner.classList.remove('hidden');

  try {
    var paymentPayload = { action: 'mmg_payment', customerPhone: phone, amount: amount.toFixed(2), currency: 'GYD', servicio: lastBookingPayload.servicio, nombre: lastBookingPayload.nombre, email: lastBookingPayload.email, fecha: lastBookingPayload.fecha };
    var response = await fetch(MMG_PAYMENT_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(paymentPayload) });
    if (!response.ok) { var errorText = await response.text(); throw new Error('Server error: ' + (errorText || response.status)); }
    var result = await response.json();
    if (result.success || result.transactionId || result.statusCode === '1000') {
      document.querySelector('.mmg-modal-body').classList.add('hidden');
      document.getElementById('mmgConfirmPay').classList.add('hidden');
      document.querySelector('.mmg-secure').classList.add('hidden');
      document.getElementById('mmgSuccess').classList.remove('hidden');
      document.getElementById('mmgTxnId').textContent = result.transactionId || result.serverCorrelationId || '—';
      showToast('Payment request sent to your MMG wallet!', 'success', 6000);
    } else { throw new Error(result.message || result.errorMessage || 'Payment was declined by MMG.'); }
  } catch (err) {
    console.error('MMG Payment Error:', err);
    document.querySelector('.mmg-modal-body').classList.add('hidden');
    document.getElementById('mmgConfirmPay').classList.add('hidden');
    document.querySelector('.mmg-secure').classList.add('hidden');
    document.getElementById('mmgError').classList.remove('hidden');
    document.getElementById('mmgErrorMsg').textContent = err.message || 'Something went wrong. Please try again.';
  } finally { payBtn.disabled = false; payText.classList.remove('hidden'); paySpinner.classList.add('hidden'); }
}

function resetMMGModal() {
  document.getElementById('mmgError').classList.add('hidden');
  document.querySelector('.mmg-modal-body').classList.remove('hidden');
  document.getElementById('mmgConfirmPay').classList.remove('hidden');
  document.querySelector('.mmg-secure').classList.remove('hidden');
}

// ── INIT ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  var sections = document.querySelectorAll('.service-section');
  var links    = document.querySelectorAll('.quick-nav a');

  // Intersection observer for active nav state (existing logic)
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

  // Smooth scroll for quick-nav clicks (new)
  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (href && href.charAt(0) === '#') {
        e.preventDefault();
        var target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // MMG Modal Events
  var mc = document.getElementById('mmgCloseBtn'); if (mc) mc.addEventListener('click', closeMMGModal);
  var mo = document.getElementById('mmgOverlay'); if (mo) mo.addEventListener('click', function(e) { if (e.target === e.currentTarget) closeMMGModal(); });
  var mcp = document.getElementById('mmgConfirmPay'); if (mcp) mcp.addEventListener('click', function(e) { e.preventDefault(); processMMGPayment(); });
  var md = document.getElementById('mmgDoneBtn'); if (md) md.addEventListener('click', closeMMGModal);
  var mr = document.getElementById('mmgRetryBtn'); if (mr) mr.addEventListener('click', resetMMGModal);

  var hash = window.location.hash;
  if (hash) {
    var tgt = document.querySelector(hash);
    if (tgt) setTimeout(function () { tgt.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300);
  }

  // Launch visual enhancements
  initLvUI();
});
