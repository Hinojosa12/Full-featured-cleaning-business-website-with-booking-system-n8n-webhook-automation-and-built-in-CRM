(function () {
  "use strict";

  const CONFIG = {
    WEBHOOK_URL: "https://n8n-n8n.7toway.easypanel.host/webhook/0e6a220e-8739-4db7-9770-cd6f4a4c35f4",
    SERVICES_PAGE: "standardhomecleaning.html",
    MMG_CHECKOUT_WEBHOOK: "https://n8n-n8n.7toway.easypanel.host/webhook/mmg-generate-checkout",
    MMG_VERIFY_WEBHOOK:   "https://n8n-n8n.7toway.easypanel.host/webhook/mmg-verify-payment",
    GET_BOOKINGS_WEBHOOK: "https://n8n-n8n.7toway.easypanel.host/webhook/get-bookings",
  };

  // ========== SERVICIOS CON NOMBRES CORTOS ==========
  const servicesData = {
    // Inspecciones (nombres cortos)
    "inspection-east":   { name: "Standard Inspection (East Bank / Georgetown)", price: "$10,000", category: "Inspection" },
    "inspection-west":   { name: "Standard Inspection (West Coast / West Bank)", price: "$12,000", category: "Inspection" },

    // AC Services
    "ac-installation":     { name: "AC Installation", price: "$30,000", category: "AC Services" },
    "ac-servicing-standard": { name: "AC Servicing – Standard Cleaning", price: "$15,000", category: "AC Services" },
    "ac-servicing-busdown":  { name: "AC Servicing – Bus down of entire unit", price: "$20,000", category: "AC Services" },

    // Room Cleaning
    "room-bedroom":        { name: "Bedroom Cleaning", price: "$7,500", category: "Room Cleaning" },
    "room-bathroom":       { name: "Bathroom & Toilet Cleaning", price: "$12,000", category: "Room Cleaning" },
    "room-kitchen":        { name: "Kitchen Cleaning", price: "$9,000", category: "Room Cleaning" },
    "room-livingroom":     { name: "Livingroom Cleaning", price: "$12,000", category: "Room Cleaning" },
    "room-studio":         { name: "Studio Apartment Cleaning", price: "$40,000", category: "Room Cleaning" },
    "floor-polishing":     { name: "Floor Polishing", price: "$95 (per unit)", category: "Floor Polishing" },
    "office-space":        { name: "Office Space (per sq ft, min $10,000)", price: "$80/sq ft", category: "Office Cleaning" },

    // Sofás y sillas
    "sofa-1seat":          { name: "1 Seat Sofa", price: "$6,000", category: "Steam Cleaning" },
    "sofa-2seat":          { name: "2 Seat Sofa", price: "$10,000", category: "Steam Cleaning" },
    "sofa-3seat":          { name: "3 Seat Sofa", price: "$14,000", category: "Steam Cleaning" },
    "l-shaped":            { name: "L-Shaped Sofa", price: "$16,000", category: "Steam Cleaning" },
    "suite-321":           { name: "3-2-1 Suite", price: "$24,000", category: "Steam Cleaning" },
    "suite-311":           { name: "3-1-1 Suite", price: "$20,000", category: "Steam Cleaning" },
    "recliners":           { name: "Single Recliner", price: "$6,000", category: "Steam Cleaning" },
    "recliners-joined":    { name: "Joined Recliners", price: "$10,000", category: "Steam Cleaning" },
    "ottoman":             { name: "Ottoman", price: "$5,000", category: "Steam Cleaning" },
    "office-chairs":       { name: "Office Chair", price: "$2,500/each", category: "Steam Cleaning" },
    "dining-chairs":       { name: "Dining Chair", price: "$2,000/each", category: "Steam Cleaning" },

    // Colchones
    "mattress-king":       { name: "King Size Mattress (+2 pillows)", price: "$12,000", category: "Steam Cleaning" },
    "mattress-queen":      { name: "Queen Size Mattress (+2 pillows)", price: "$10,000", category: "Steam Cleaning" },
    "mattress-double":     { name: "Double Size Mattress", price: "$10,000", category: "Steam Cleaning" },
    "mattress-single":     { name: "Single Mattress", price: "$8,000", category: "Steam Cleaning" },

    // Vehículos
    "car":                 { name: "Car Interior (with mats)", price: "$12,000", category: "Steam Cleaning" },
    "suv":                 { name: "SUV Interior (with mats)", price: "$16,000", category: "Steam Cleaning" },
    "tacoma":              { name: "Tacoma / Pick up (with mats)", price: "$24,000", category: "Steam Cleaning" },

    // Alfombras por sq ft
    "carpet-uninstalled":  { name: "Carpet (uninstalled) – per sq ft", price: "$115/sq ft", category: "Carpet Cleaning" },
    "carpet-installed":    { name: "Carpet (installed) – per sq ft", price: "$95/sq ft", category: "Carpet Cleaning" },
    "carpet-deepclean":    { name: "Deep Cleaning (pressure wash, shampoo, steam) – per sq ft", price: "$220/sq ft", category: "Carpet Cleaning" },
    "carpet-pressurewash": { name: "Pressure Washing – Carpet (per sq ft)", price: "$30/sq ft", category: "Carpet Cleaning" },

    // Recogida de alfombras
    "carpet-pickup-gtown": { name: "Carpet Pickup – Georgetown & West Bank", price: "$2,000", category: "Carpet Pickup" },
    "carpet-pickup-westcoast": { name: "Carpet Pickup – West Coast Demerara", price: "$3,000", category: "Carpet Pickup" },

    // Pressure washing exterior
    "pressure-driveway":   { name: "Pressure Washing – Driveway & Walkway", price: "$30/sq ft", category: "Pressure Washing" },
    "pressure-patio":      { name: "Pressure Washing – Patio/Terrace", price: "$30/sq ft", category: "Pressure Washing" },
    "pressure-building":   { name: "Pressure Washing – Building Exterior", price: "$30/sq ft", category: "Pressure Washing" },
    "pressure-fence":      { name: "Pressure Washing – Fence", price: "$30/sq ft", category: "Pressure Washing" },
    "pressure-parking":    { name: "Pressure Washing – Parking Lot", price: "$30/sq ft", category: "Pressure Washing" },

    // Residencial (Quote)
    "residential-1bed":    { name: "Residential – 1 Bedroom Apartment", price: "Quote on visit", category: "Residential Cleaning" },
    "residential-2bed":    { name: "Residential – 2 Bedroom House", price: "Quote on visit", category: "Residential Cleaning" },
    "residential-3bed":    { name: "Residential – 3 Bedroom House", price: "Quote on visit", category: "Residential Cleaning" },
    "residential-general": { name: "Residential – General Home Cleaning", price: "Quote on visit", category: "Residential Cleaning" },
    "residential-onetime": { name: "Residential – One-Time Refresh", price: "Quote on visit", category: "Residential Cleaning" },

    // Deep Cleaning
    "deep-1bed":           { name: "Deep Clean – 1 Bedroom", price: "Quote on visit", category: "Deep Cleaning" },
    "deep-2bed":           { name: "Deep Clean – 2 Bedrooms", price: "Quote on visit", category: "Deep Cleaning" },
    "deep-3bed":           { name: "Deep Clean – 3 Bedrooms", price: "Quote on visit", category: "Deep Cleaning" },
    "deep-4bed":           { name: "Deep Clean – 4+ Bedrooms", price: "Quote on visit", category: "Deep Cleaning" },

    // Commercial
    "commercial-small":    { name: "Commercial – Small Office (up to 500 sq ft)", price: "Quote on visit", category: "Commercial Cleaning" },
    "commercial-medium":   { name: "Commercial – Medium Office (500-1500 sq ft)", price: "Quote on visit", category: "Commercial Cleaning" },
    "commercial-large":    { name: "Commercial – Large Office (1500+ sq ft)", price: "Quote on visit", category: "Commercial Cleaning" },
    "commercial-retail":   { name: "Commercial – Retail Store", price: "Quote on visit", category: "Commercial Cleaning" },
    "commercial-warehouse":{ name: "Commercial – Warehouse/Industrial", price: "Quote on visit", category: "Commercial Cleaning" },

    // Move In/Out
    "movein-1bed":         { name: "Move-In/Out – 1 Bedroom", price: "Quote on visit", category: "Move In/Out" },
    "movein-2bed":         { name: "Move-In/Out – 2 Bedrooms", price: "Quote on visit", category: "Move In/Out" },
    "movein-3bed":         { name: "Move-In/Out – 3 Bedrooms", price: "Quote on visit", category: "Move In/Out" },
    "movein-4bed":         { name: "Move-In/Out – 4+ Bedrooms", price: "Quote on visit", category: "Move In/Out" },
  };

  // Fechas disponibles (igual que antes, pero incluyo las nuevas categorías)
  const availableDates = {
    "Steam Cleaning":       ["2026-4-28","2026-4-29","2026-4-30","2026-5-2","2026-5-4","2026-5-5","2026-5-6","2026-5-7","2026-5-8","2026-5-9","2026-5-11","2026-5-12","2026-5-13","2026-5-14","2026-5-15","2026-5-16","2026-5-18","2026-5-19","2026-5-20","2026-5-21","2026-5-22","2026-5-23","2026-5-25","2026-5-26","2026-5-27","2026-5-28","2026-5-29","2026-5-30"],
    "Carpet Cleaning":      ["2026-4-28","2026-4-29","2026-4-30","2026-5-2","2026-5-4","2026-5-5","2026-5-6","2026-5-7","2026-5-8","2026-5-9","2026-5-11","2026-5-12","2026-5-13","2026-5-14","2026-5-15","2026-5-16","2026-5-18","2026-5-19","2026-5-20","2026-5-21","2026-5-22","2026-5-23","2026-5-25","2026-5-26","2026-5-27","2026-5-28","2026-5-29","2026-5-30"],
    "Carpet Pickup":        ["2026-4-28","2026-4-29","2026-4-30","2026-5-2","2026-5-4","2026-5-5","2026-5-6","2026-5-7","2026-5-8","2026-5-9","2026-5-11","2026-5-12","2026-5-13","2026-5-14","2026-5-15","2026-5-16","2026-5-18","2026-5-19","2026-5-20","2026-5-21","2026-5-22","2026-5-23","2026-5-25","2026-5-26","2026-5-27","2026-5-28","2026-5-29","2026-5-30"],
    "Pressure Washing":     ["2026-4-28","2026-4-29","2026-4-30","2026-5-2","2026-5-5","2026-5-7","2026-5-9","2026-5-11","2026-5-13","2026-5-16","2026-5-18","2026-5-20","2026-5-23","2026-5-25","2026-5-27","2026-5-30"],
    "Residential Cleaning": ["2026-4-28","2026-4-29","2026-4-30","2026-5-2","2026-5-4","2026-5-6","2026-5-8","2026-5-9","2026-5-11","2026-5-13","2026-5-15","2026-5-16","2026-5-18","2026-5-20","2026-5-22","2026-5-23","2026-5-25","2026-5-27","2026-5-29","2026-5-30"],
    "Deep Cleaning":        ["2026-4-28","2026-4-29","2026-4-30","2026-5-2","2026-5-5","2026-5-6","2026-5-8","2026-5-9","2026-5-12","2026-5-13","2026-5-15","2026-5-16","2026-5-19","2026-5-20","2026-5-22","2026-5-23","2026-5-26","2026-5-27","2026-5-29","2026-5-30"],
    "Commercial Cleaning":  ["2026-4-28","2026-4-29","2026-4-30","2026-5-2","2026-5-4","2026-5-5","2026-5-7","2026-5-8","2026-5-11","2026-5-12","2026-5-14","2026-5-15","2026-5-18","2026-5-19","2026-5-21","2026-5-22","2026-5-25","2026-5-26","2026-5-28","2026-5-29"],
    "Move In/Out":          ["2026-4-28","2026-4-29","2026-4-30","2026-5-2","2026-5-4","2026-5-6","2026-5-9","2026-5-11","2026-5-13","2026-5-16","2026-5-18","2026-5-20","2026-5-23","2026-5-25","2026-5-27","2026-5-30"],
    "Inspection":           ["2026-4-28","2026-4-29","2026-4-30","2026-5-2","2026-5-4","2026-5-6","2026-5-8","2026-5-9","2026-5-11","2026-5-13","2026-5-15","2026-5-16","2026-5-18","2026-5-20","2026-5-22","2026-5-23","2026-5-25","2026-5-27","2026-5-29","2026-5-30"],
    "AC Services":          ["2026-4-28","2026-4-29","2026-4-30","2026-5-2","2026-5-4","2026-5-6","2026-5-8","2026-5-9","2026-5-11","2026-5-13","2026-5-15","2026-5-16","2026-5-18","2026-5-20","2026-5-22","2026-5-23","2026-5-25","2026-5-27","2026-5-29","2026-5-30"],
    "Room Cleaning":        ["2026-4-28","2026-4-29","2026-4-30","2026-5-2","2026-5-4","2026-5-6","2026-5-8","2026-5-9","2026-5-11","2026-5-13","2026-5-15","2026-5-16","2026-5-18","2026-5-20","2026-5-22","2026-5-23","2026-5-25","2026-5-27","2026-5-29","2026-5-30"],
    "Floor Polishing":      ["2026-4-28","2026-4-29","2026-4-30","2026-5-2","2026-5-4","2026-5-6","2026-5-8","2026-5-9","2026-5-11","2026-5-13","2026-5-15","2026-5-16","2026-5-18","2026-5-20","2026-5-22","2026-5-23","2026-5-25","2026-5-27","2026-5-29","2026-5-30"],
    "Office Cleaning":      ["2026-4-28","2026-4-29","2026-4-30","2026-5-2","2026-5-4","2026-5-6","2026-5-8","2026-5-9","2026-5-11","2026-5-13","2026-5-15","2026-5-16","2026-5-18","2026-5-20","2026-5-22","2026-5-23","2026-5-25","2026-5-27","2026-5-29","2026-5-30"],
  };

  let bookings = [];
  let countersStarted = false, submitting = false;
  let calMonth, calYear, selectedDate = null, currentCategory = null;
  let lastBookingPayload = null;

  // ========== ESTILOS PARA EL SELECT EN DOS LÍNEAS ==========
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    .lv-option {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 0.6rem 1rem;
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }
    .lv-opt-name {
      font-weight: 500;
      font-size: 0.9rem;
      color: #1e1e2a;
    }
    .lv-opt-price {
      font-size: 0.75rem;
      color: #b8860b;
      margin-top: 0.2rem;
      font-weight: normal;
    }
    .lv-trigger .lv-value {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    .lv-sel-label {
      font-weight: 500;
    }
    .lv-sel-badge {
      font-size: 0.7rem;
      color: #b8860b;
      margin-top: 0.2rem;
    }
  `;
  document.head.appendChild(styleSheet);

  // ========== CUSTOM SELECT MODIFICADO (DOS LÍNEAS) ==========
  var _lvSet = (typeof WeakSet !== "undefined") ? new WeakSet() : null;

  function LvSelect(native) {
    var self = this;
    this.native = native;
    this.isOpen = false;

    this.wrap = document.createElement("div");
    this.wrap.className = "lv-select-wrapper";
    native.parentNode.insertBefore(this.wrap, native);
    this.wrap.appendChild(native);
    this.wrap._lv = this;
    native._lv = this;

    this.trig = document.createElement("div");
    this.trig.className = "lv-trigger";
    this.trig.setAttribute("tabindex", "0");
    this.trig.innerHTML =
      '<span class="lv-value"></span>' +
      '<svg class="lv-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
        '<polyline points="6 9 12 15 18 9"/>' +
      "</svg>";
    this.wrap.appendChild(this.trig);
    this.valEl = this.trig.querySelector(".lv-value");

    this.panel = document.createElement("div");
    this.panel.className = "lv-panel";
    this.wrap.appendChild(this.panel);

    new MutationObserver(function () { self.rebuild(); })
      .observe(native, { childList: true, subtree: true });

    this.trig.addEventListener("click", function (e) {
      e.stopPropagation();
      self.isOpen ? self.close() : self.open();
    });
    this.trig.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); self.isOpen ? self.close() : self.open(); }
      else if (e.key === "Escape") self.close();
      else if (e.key === "ArrowDown") { e.preventDefault(); self.move(1); }
      else if (e.key === "ArrowUp")   { e.preventDefault(); self.move(-1); }
    });
    document.addEventListener("click", function () { self.close(); });
    this.panel.addEventListener("click", function (e) { e.stopPropagation(); });

    this.rebuild();
  }

  LvSelect.prototype.rebuild = function () {
    var self = this, panel = this.panel;
    panel.innerHTML = "";
    var opts = Array.from(this.native.options), lastGrp = null;
    var chk =
      '<svg class="lv-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
        '<polyline points="20 6 9 17 4 12"/>' +
      "</svg>";

    opts.forEach(function (opt, i) {
      var grp = (opt.parentElement.tagName === "OPTGROUP") ? opt.parentElement.label : null;
      if (grp && grp !== lastGrp) {
        lastGrp = grp;
        var gh = document.createElement("div");
        gh.className = "lv-group-header";
        gh.textContent = grp;
        panel.appendChild(gh);
      } else if (!grp) { lastGrp = null; }

      var item = document.createElement("div");
      item.className = "lv-option" +
        (opt.value === "" ? " lv-is-placeholder" : "") +
        (opt.selected && opt.value !== "" ? " lv-is-selected" : "");
      item.dataset.idx = i;

      // Extraer nombre y precio del option (el textContent tiene "nombre — precio")
      var fullText = opt.textContent;
      var lastDashIndex = fullText.lastIndexOf("—");
      var name = (lastDashIndex !== -1) ? fullText.substring(0, lastDashIndex).trim() : fullText;
      var price = (lastDashIndex !== -1) ? fullText.substring(lastDashIndex + 1).trim() : "";

      item.innerHTML = '<span class="lv-opt-name">' + name + '</span>' +
                       (price ? '<span class="lv-opt-price">' + price + '</span>' : '') +
                       chk;

      if (opt.value !== "") {
        item.addEventListener("click", (function (idx) {
          return function (e) { e.stopPropagation(); self.select(idx); };
        })(i));
      }
      panel.appendChild(item);
    });
    this.updateDisplay();
  };

  LvSelect.prototype.select = function (idx) {
    this.native.selectedIndex = idx;
    this.native.dispatchEvent(new Event("change", { bubbles: true }));
    this.updateDisplay();
    this.panel.querySelectorAll(".lv-option").forEach(function (item) {
      item.classList.toggle("lv-is-selected", parseInt(item.dataset.idx) === idx);
    });
    this.close();
  };

  LvSelect.prototype.updateDisplay = function () {
    var sel = this.native.options[this.native.selectedIndex];
    if (!sel || sel.value === "") {
      this.valEl.innerHTML = '<span class="lv-placeholder-txt">' + (sel ? sel.text : "— Select —") + "</span>";
    } else {
      var fullText = sel.textContent;
      var lastDashIndex = fullText.lastIndexOf("—");
      var name = (lastDashIndex !== -1) ? fullText.substring(0, lastDashIndex).trim() : fullText;
      var price = (lastDashIndex !== -1) ? fullText.substring(lastDashIndex + 1).trim() : "";
      this.valEl.innerHTML = '<span class="lv-sel-label">' + name + '</span>' +
                             (price ? '<span class="lv-sel-badge">' + price + '</span>' : '');
    }
  };

  LvSelect.prototype.open = function () {
    document.querySelectorAll(".lv-select-wrapper.lv-open").forEach(function (w) {
      if (w._lv) w._lv.close();
    });
    this.isOpen = true;
    this.wrap.classList.add("lv-open");
    var rect = this.trig.getBoundingClientRect();
    this.wrap.classList.toggle("lv-dropup", (window.innerHeight - rect.bottom) < 260 && rect.top > 260);
    var p = this.panel;
    p.classList.add("lv-animating");
    p.querySelectorAll(".lv-option, .lv-group-header").forEach(function (el, i) {
      el.style.animationDelay = (i * 0.022) + "s";
    });
    setTimeout(function () { p.classList.remove("lv-animating"); }, 400);
  };

  LvSelect.prototype.close = function () {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.wrap.classList.remove("lv-open");
  };

  LvSelect.prototype.move = function (dir) {
    if (!this.isOpen) this.open();
    var opts = this.native.options, idx = this.native.selectedIndex + dir;
    while (idx >= 0 && idx < opts.length && opts[idx].value === "") idx += dir;
    if (idx >= 0 && idx < opts.length) this.select(idx);
  };

  function initLvSelects() {
    document.querySelectorAll("select").forEach(function (sel) {
      if (sel._lv || (sel.parentElement && sel.parentElement.classList.contains("lv-select-wrapper"))) return;
      if (_lvSet) { if (_lvSet.has(sel)) return; _lvSet.add(sel); }
      new LvSelect(sel);
    });
  }

  // ========== RESTO DE FUNCIONES (sin cambios importantes) ==========
  function initLvProgressBar() { ... }  // (mantener igual)
  function initLvCursorGlow() { ... }
  function initLvRipple() { ... }
  function initLvParallax() { ... }
  function initLvUI() { ... }
  async function handleMMGReturn() { ... }
  async function loadBookingsFromSheets(email) { ... }
  function parsePrice(priceStr) { ... }
  function formatGYD(amount) { ... }
  function isFixedPrice(priceStr) { ... }
  function initCalendar() { ... }
  function renderCalendar() { ... }
  function selectDate(day, ds) { ... }
  function onServiceChange() { ... }
  function showToast(m, t, d) { ... }
  function populateSelect() { ... }  // (la que genera options con "nombre — precio")
  function clearErrors() { ... }
  function setError(id, msg) { ... }
  function validateForm() { ... }
  function renderCRM() { ... }
  function setStep(n) { ... }
  async function submitBooking() { ... }
  function showSuccess(p) { ... }
  function openMMGModal() { ... }
  function closeMMGModal() { ... }
  async function processMMGPayment() { ... }
  function resetMMGModal() { ... }
  function animateCounters() { ... }

  var obs = new IntersectionObserver(...);

  function init() {
    populateSelect();
    initLvSelects();
    setStep(1); initCalendar();
    handleMMGReturn();
    // ... (todos los event listeners igual que antes)
    initLvUI();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
