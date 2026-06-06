(function () {
  "use strict";

  // ── CONFIG ──────────────────────────────────────────────────────────────
  const CONFIG = {
    WEBHOOK_URL: "https://n8n-n8n.7toway.easypanel.host/webhook/0e6a220e-8739-4db7-9770-cd6f4a4c35f4",
    SERVICES_PAGE: "standardhomecleaning.html",
    MMG_CHECKOUT_WEBHOOK: "https://n8n-n8n.7toway.easypanel.host/webhook/mmg-generate-checkout",
    MMG_VERIFY_WEBHOOK:   "https://n8n-n8n.7toway.easypanel.host/webhook/mmg-verify-payment",
    GET_BOOKINGS_WEBHOOK: "https://n8n-n8n.7toway.easypanel.host/webhook/get-bookings",
  };

  const servicesData = {
    // ========== INSPECCIONES ==========
    "inspection-east":     { name: "Standard Inspection – East Bank up to Friendship; East Coast up to Lusignan & Georgetown", price: "$10,000", category: "Inspection" },
    "inspection-west":     { name: "Standard Inspection – West Coast Demerara & West Bank Demerara", price: "$12,000", category: "Inspection" },

    // ========== SERVICIOS DE AC ==========
    "ac-installation":     { name: "AC Installation (client provides materials)", price: "$30,000", category: "AC Services" },
    "ac-servicing-standard": { name: "AC Servicing – Standard Cleaning", price: "$15,000", category: "AC Services" },
    "ac-servicing-busdown":  { name: "AC Servicing – Bus down of entire unit", price: "$20,000", category: "AC Services" },

    // ========== LIMPIEZA POR AMBIENTES ==========
    "room-bedroom":        { name: "Bedroom Cleaning", price: "$7,500", category: "Room Cleaning" },
    "room-bathroom":       { name: "Bathroom & Toilet Cleaning", price: "$12,000", category: "Room Cleaning" },
    "room-kitchen":        { name: "Kitchen Cleaning", price: "$9,000", category: "Room Cleaning" },
    "room-livingroom":     { name: "Livingroom Cleaning", price: "$12,000", category: "Room Cleaning" },
    "room-studio":         { name: "Studio Apartment Cleaning", price: "$40,000", category: "Room Cleaning" },
    "floor-polishing":     { name: "Floor Polishing", price: "$95 (per unit)", category: "Floor Polishing" },
    "office-space":        { name: "Office Space (per sq ft, mopping & surfaces, min $10,000)", price: "$80/sq ft", category: "Office Cleaning" },

    // ========== SOFÁS Y SILLAS ==========
    "sofa-1seat":          { name: "1 Seat Sofa",                              price: "$6,000",        category: "Steam Cleaning" },
    "sofa-2seat":          { name: "2 Seat Sofa",                              price: "$10,000",       category: "Steam Cleaning" },
    "sofa-3seat":          { name: "3 Seat Sofa",                              price: "$14,000",       category: "Steam Cleaning" },
    "l-shaped":            { name: "L-Shaped Sofa",                            price: "$16,000",       category: "Steam Cleaning" },
    "suite-321":           { name: "3-2-1 Suite",                              price: "$24,000",       category: "Steam Cleaning" },
    "suite-311":           { name: "3-1-1 Suite",                              price: "$20,000",       category: "Steam Cleaning" },
    "recliners":           { name: "Single Recliner",                          price: "$6,000",        category: "Steam Cleaning" },
    "recliners-joined":    { name: "Joined Recliners",                         price: "$10,000",       category: "Steam Cleaning" },
    "ottoman":             { name: "Ottoman",                                  price: "$5,000",        category: "Steam Cleaning" },
    "office-chairs":       { name: "Office Chair",                             price: "$2,500/each",   category: "Steam Cleaning" },
    "dining-chairs":       { name: "Dining Chair",                             price: "$2,000/each",   category: "Steam Cleaning" },

    // ========== COLCHONES ==========
    "mattress-king":       { name: "King Size Mattress (Inclusive of 2 pillows)", price: "$12,000",   category: "Steam Cleaning" },
    "mattress-queen":      { name: "Queen Size Mattress (Inclusive of 2 pillows)",price: "$10,000",   category: "Steam Cleaning" },
    "mattress-double":     { name: "Double Size Mattress",                     price: "$10,000",       category: "Steam Cleaning" },
    "mattress-single":     { name: "Single Mattress",                          price: "$8,000",        category: "Steam Cleaning" },

    // ========== VEHÍCULOS ==========
    "car":                 { name: "Car Interior (with mats)",                 price: "$12,000",       category: "Steam Cleaning" },
    "suv":                 { name: "SUV Interior (with mats)",                 price: "$16,000",       category: "Steam Cleaning" },
    "tacoma":              { name: "Tacoma / Pick up (with mats)",             price: "$24,000",       category: "Steam Cleaning" },

    // ========== ALFOMBRAS POR PIE CUADRADO ==========
    "carpet-uninstalled":  { name: "Carpet (uninstalled) – per sq ft",         price: "$115/sq ft",    category: "Carpet Cleaning" },
    "carpet-installed":    { name: "Carpet (installed) – per sq ft",           price: "$95/sq ft",     category: "Carpet Cleaning" },
    "carpet-deepclean":    { name: "Deep Cleaning (pressure washing, shampooing & steam cleaning) – per sq ft", price: "$220/sq ft", category: "Carpet Cleaning" },
    "carpet-pressurewash": { name: "Pressure Washing – Carpet (per sq ft)",    price: "$30/sq ft",     category: "Carpet Cleaning" },

    // ========== RECOGIDA DE ALFOMBRAS ==========
    "carpet-pickup-gtown": { name: "Carpet Pickup – Georgetown & West Bank",   price: "$2,000",        category: "Carpet Pickup" },
    "carpet-pickup-westcoast": { name: "Carpet Pickup – West Coast Demerara",  price: "$3,000",        category: "Carpet Pickup" },

    // ========== LAVADO A PRESIÓN (EXTERIORES) ==========
    "pressure-driveway":   { name: "Pressure Washing – Driveway & Walkway",    price: "$30/sq ft",     category: "Pressure Washing" },
    "pressure-patio":      { name: "Pressure Washing – Patio/Terrace",         price: "$30/sq ft",     category: "Pressure Washing" },
    "pressure-building":   { name: "Pressure Washing – Building Exterior",     price: "$30/sq ft",     category: "Pressure Washing" },
    "pressure-fence":      { name: "Pressure Washing – Fence Cleaning",        price: "$30/sq ft",     category: "Pressure Washing" },
    "pressure-parking":    { name: "Pressure Washing – Parking Lot",           price: "$30/sq ft",     category: "Pressure Washing" },

    // ========== LIMPIEZA RESIDENCIAL (Quote on visit) ==========
    "residential-1bed":    { name: "Residential – 1 Bedroom Apartment",        price: "Quote on visit",category: "Residential Cleaning" },
    "residential-2bed":    { name: "Residential – 2 Bedroom House",            price: "Quote on visit",category: "Residential Cleaning" },
    "residential-3bed":    { name: "Residential – 3 Bedroom House",            price: "Quote on visit",category: "Residential Cleaning" },
    "residential-general": { name: "Residential – General Home Cleaning",      price: "Quote on visit",category: "Residential Cleaning" },
    "residential-onetime": { name: "Residential – One-Time Refresh",           price: "Quote on visit",category: "Residential Cleaning" },

    // ========== LIMPIEZA PROFUNDA ==========
    "deep-1bed":           { name: "Deep Clean – 1 Bedroom",                   price: "Quote on visit",category: "Deep Cleaning" },
    "deep-2bed":           { name: "Deep Clean – 2 Bedrooms",                  price: "Quote on visit",category: "Deep Cleaning" },
    "deep-3bed":           { name: "Deep Clean – 3 Bedrooms",                  price: "Quote on visit",category: "Deep Cleaning" },
    "deep-4bed":           { name: "Deep Clean – 4+ Bedrooms",                 price: "Quote on visit",category: "Deep Cleaning" },

    // ========== LIMPIEZA COMERCIAL ==========
    "commercial-small":    { name: "Commercial – Small Office (up to 500 sq ft)",   price: "Quote on visit",category: "Commercial Cleaning" },
    "commercial-medium":   { name: "Commercial – Medium Office (500-1,500 sq ft)",  price: "Quote on visit",category: "Commercial Cleaning" },
    "commercial-large":    { name: "Commercial – Large Office (1,500+ sq ft)",      price: "Quote on visit",category: "Commercial Cleaning" },
    "commercial-retail":   { name: "Commercial – Retail Store",                price: "Quote on visit",category: "Commercial Cleaning" },
    "commercial-warehouse":{ name: "Commercial – Warehouse/Industrial",        price: "Quote on visit",category: "Commercial Cleaning" },

    // ========== MUDANZAS ==========
    "movein-1bed":         { name: "Move-In/Out – 1 Bedroom Apartment",        price: "Quote on visit",category: "Move In/Out" },
    "movein-2bed":         { name: "Move-In/Out – 2 Bedroom House",            price: "Quote on visit",category: "Move In/Out" },
    "movein-3bed":         { name: "Move-In/Out – 3 Bedroom House",            price: "Quote on visit",category: "Move In/Out" },
    "movein-4bed":         { name: "Move-In/Out – 4+ Bedroom House",           price: "Quote on visit",category: "Move In/Out" },
  };

  const availableDates = { ... }; // (Igual que antes, no cambio por brevedad, pero mantenlo igual)
  // ... (el resto de availableDates y el código existente se mantiene igual)

  // ========== NUEVO ESTILO PARA QUE EL PRECIO SE VEA DEBAJO ==========
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
      color: #b8860b; /* dorado */
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

  // ── CUSTOM SELECT (modificado para mostrar precio debajo) ──
  function LvSelect(native) {
    // ... (igual que antes, solo cambia rebuild y updateDisplay)
  }

  LvSelect.prototype.rebuild = function () {
    var self = this, panel = this.panel;
    panel.innerHTML = '';
    var opts = Array.from(this.native.options), lastGrp = null;
    var chk = '<svg class="lv-check" ...>...</svg>'; // (igual)

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
      item.className = 'lv-option' + (opt.value === '' ? ' lv-is-placeholder' : '') + (opt.selected && opt.value !== '' ? ' lv-is-selected' : '');
      item.dataset.idx = i;

      // Extraer nombre y precio de los atributos personalizados o del texto
      var name = opt.getAttribute('data-name') || opt.textContent;
      var price = opt.getAttribute('data-price') || '';
      // Si no tiene data-price, intentamos extraer del texto original (por si acaso)
      if (!price && opt.textContent) {
        var match = opt.textContent.match(/—\s*(\$[\d,]+(?:\/sq ft|\/each)?)/);
        if (match) price = match[1];
      }

      item.innerHTML = '<span class="lv-opt-name">' + name + '</span>' +
                       (price ? '<span class="lv-opt-price">' + price + '</span>' : '') +
                       chk;

      if (opt.value !== '') {
        item.addEventListener('click', (function (idx) {
          return function (e) { e.stopPropagation(); self.select(idx); };
        })(i));
      }
      panel.appendChild(item);
    });
    this.updateDisplay();
  };

  LvSelect.prototype.updateDisplay = function () {
    var sel = this.native.options[this.native.selectedIndex];
    if (!sel || sel.value === '') {
      this.valEl.innerHTML = '<span class="lv-placeholder-txt">' + (sel ? sel.text : '— Select —') + '</span>';
    } else {
      var name = sel.getAttribute('data-name') || sel.textContent;
      var price = sel.getAttribute('data-price') || '';
      if (!price && sel.textContent) {
        var match = sel.textContent.match(/—\s*(\$[\d,]+(?:\/sq ft|\/each)?)/);
        if (match) price = match[1];
      }
      this.valEl.innerHTML = '<span class="lv-sel-label">' + name + '</span>' +
                             (price ? '<span class="lv-sel-badge">' + price + '</span>' : '');
    }
  };

  // ── FUNCIÓN POPULATE SELECT MODIFICADA ────────────────────────────────
  function populateSelect() {
    var s = document.getElementById("servicio"); if (!s) return;
    var categories = {};
    for (var k in servicesData) {
      var d = servicesData[k];
      if (!categories[d.category]) categories[d.category] = [];
      categories[d.category].push({ key: k, name: d.name, price: d.price });
    }
    s.innerHTML = '<option value="">— Select a service —</option>';
    for (var cat in categories) {
      var group = document.createElement("optgroup");
      group.label = cat;
      categories[cat].forEach(function(item) {
        var option = document.createElement("option");
        option.value = item.key;
        // Guardamos nombre y precio en atributos personalizados
        option.setAttribute("data-name", item.name);
        option.setAttribute("data-price", item.price);
        option.textContent = item.name + " — " + item.price; // Para retrocompatibilidad, pero luego el custom select usará los data-*
        group.appendChild(option);
      });
      s.appendChild(group);
    }
    s.addEventListener("change", onServiceChange);
  }

  // El resto del código (handleMMGReturn, loadBookingsFromSheets, etc.) se mantiene exactamente igual que antes,
  // sin ninguna modificación adicional. Solo cambia lo de arriba.
  // ... (copia todo el resto del código desde tu versión anterior, a partir de aquí)
  // Por brevedad no escribo todo de nuevo, pero asegúrate de mantener las mismas funciones que ya funcionaban.
  // En la práctica, reemplaza únicamente populateSelect, LvSelect.prototype.rebuild y updateDisplay, y añade el estilo.

  // Asegúrate de que initLvSelects se llame después de populateSelect (ya está en init)
})();
