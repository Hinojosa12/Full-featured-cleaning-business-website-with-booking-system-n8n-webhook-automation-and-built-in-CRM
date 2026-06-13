(function () {
  "use strict";

  const CONFIG = {
    WEBHOOK_URL: "https://n8n-n8n.7toway.easypanel.host/webhook/0e6a220e-8739-4db7-9770-cd6f4a4c35f4",
    MMG_CHECKOUT_WEBHOOK: "https://n8n-n8n.7toway.easypanel.host/webhook/mmg-generate-checkout",
    MMG_VERIFY_WEBHOOK: "https://n8n-n8n.7toway.easypanel.host/webhook/mmg-verify-payment",
    GET_BOOKINGS_WEBHOOK: "https://n8n-n8n.7toway.easypanel.host/webhook/get-bookings",
  };

  const servicesData = {
    "general-home-cleaning": { name: "General Home Cleaning", price: "variable", category: "General Home Cleaning", isRoomBased: true, rooms: { bedroom: { name: "Bedroom", rate: 7500 }, livingroom: { name: "Livingroom", rate: 8500 }, kitchen: { name: "Kitchen", rate: 12000 }, bathroom: { name: "Bathroom", rate: 6500 }, toilet: { name: "Toilet", rate: 4500 } } },
    "office-cleaning-sqft": { name: "Office Cleaning (per sq ft)", price: "sqft:45", category: "Office Cleaning", isSqft: true, rate: 45 },
    "mattress-cleaning-per-side": { name: "Mattress Cleaning (per side)", price: "side:3500", category: "Mattress Cleaning", isPerSide: true, ratePerSide: 3500 },
    "carpet-uninstalled": { name: "Per Square foot L x W (uninstalled)", price: "sqft:115", category: "Carpet Installation", isSqft: true, rate: 115 },
    "carpet-deep-cleaning": { name: "Deep Cleaning (Pressure washing, shampooing and steam)", price: "sqft:220", category: "Carpet Cleaning", isSqft: true, rate: 220 },
    "pressure-driveway": { name: "Driveway & Pressure Washing", price: "sqft:30", category: "Pressure Washing", isSqft: true, rate: 30 },
    "office-chairs": { name: "Office Chairs", price: "$2,500", category: "Furniture Cleaning" },
    // ... puedes agregar más servicios existentes si los necesitas
  };

  function isSqftService(key) { return !!(servicesData[key] && servicesData[key].isSqft); }
  function isRoomBasedService(key) { return !!(servicesData[key] && servicesData[key].isRoomBased); }
  function isPerSideService(key) { return !!(servicesData[key] && servicesData[key].isPerSide); }
  function getSqftRate(key) { return servicesData[key] ? servicesData[key].rate : null; }
  function calculateSqftPrice(key, l, w) { var r = getSqftRate(key); return r ? l * w * r : null; }
  function formatGYD(amount) { if (amount === null || isNaN(amount)) return "$0"; return "$" + Number(amount).toLocaleString("en-US", { minimumFractionDigits: 0 }); }
  function showToast(msg, type, duration) { var t = document.getElementById("toast"); if (!t) return; t.textContent = msg; t.className = "toast show " + (type || "info"); setTimeout(function () { t.classList.remove("show"); }, duration || 4000); }

  // toggleForm (la función que falta)
  window.toggleForm = function (formId) {
    var form = document.getElementById(formId);
    if (!form) return;
    var isOpen = form.classList.contains("open");
    document.querySelectorAll(".form-section").forEach(function (f) { f.classList.remove("open"); });
    document.querySelectorAll(".booking-success-panel").forEach(function (p) { p.style.display = "none"; });
    if (!isOpen) {
      form.classList.add("open");
      setTimeout(function () { form.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
    }
  };

  // Crear campos dinámicos por sección
  function createSectionFields(prefix, serviceKey) {
    var dimId = "dim-" + prefix, roomsId = "rooms-" + prefix, sidesId = "sides-" + prefix;
    // limpiar anteriores
    var oldDim = document.getElementById(dimId); if (oldDim) oldDim.innerHTML = "";
    var oldRooms = document.getElementById(roomsId); if (oldRooms) oldRooms.innerHTML = "";
    var oldSides = document.getElementById(sidesId); if (oldSides) oldSides.innerHTML = "";

    if (isRoomBasedService(serviceKey)) {
      var service = servicesData[serviceKey];
      var container = document.getElementById(roomsId) || (function() {
        var selectEl = document.getElementById(prefix + "-servicio");
        if (!selectEl) return null;
        var selectGroup = selectEl.closest(".fg");
        if (!selectGroup) return null;
        var newDiv = document.createElement("div");
        newDiv.id = roomsId;
        newDiv.className = "fg span2";
        newDiv.style.marginTop = "0.5rem";
        selectGroup.parentNode.insertBefore(newDiv, selectGroup.nextSibling);
        return newDiv;
      })();
      if (!container) return;
      var html = '<h4>Enter number of each room:</h4><table style="width:100%;">';
      for (var roomKey in service.rooms) {
        var room = service.rooms[roomKey];
        html += '<tr><td><strong>' + room.name + '</strong></td><td><input type="number" id="qty-' + prefix + '-' + roomKey + '" min="0" value="0" step="1" style="width:70px;"></td><td>' + formatGYD(room.rate) + '</td><td id="subtotal-' + prefix + '-' + roomKey + '" style="text-align:right;">' + formatGYD(0) + '</td></tr>';
      }
      html += '<tr style="border-top:2px solid #ccc;"><td colspan="3"><strong>TOTAL</strong></td><td id="total-' + prefix + '" style="text-align:right;">' + formatGYD(0) + '</td></tr></table>';
      container.innerHTML = html;
      var updateTotal = function () {
        var grand = 0;
        for (var rk in service.rooms) {
          var qty = parseInt(document.getElementById('qty-' + prefix + '-' + rk)?.value) || 0;
          var subtotal = qty * service.rooms[rk].rate;
          var subSpan = document.getElementById('subtotal-' + prefix + '-' + rk);
          if (subSpan) subSpan.innerText = formatGYD(subtotal);
          grand += subtotal;
        }
        var totalSpan = document.getElementById('total-' + prefix);
        if (totalSpan) totalSpan.innerText = formatGYD(grand);
        window['_roomTotal_' + prefix] = grand;
      };
      for (var rk in service.rooms) {
        var inp = document.getElementById('qty-' + prefix + '-' + rk);
        if (inp) inp.addEventListener('input', updateTotal);
      }
      updateTotal();
    }
    else if (isPerSideService(serviceKey)) {
      var service = servicesData[serviceKey];
      var container = document.getElementById(sidesId) || (function() {
        var selectEl = document.getElementById(prefix + "-servicio");
        if (!selectEl) return null;
        var selectGroup = selectEl.closest(".fg");
        if (!selectGroup) return null;
        var newDiv = document.createElement("div");
        newDiv.id = sidesId;
        newDiv.className = "fg span2";
        newDiv.style.marginTop = "0.5rem";
        selectGroup.parentNode.insertBefore(newDiv, selectGroup.nextSibling);
        return newDiv;
      })();
      if (!container) return;
      container.innerHTML = '<label>Number of sides: <input type="number" id="sides-' + prefix + '" min="1" value="1" step="1" style="width:100px;"></label><p>Price per side: ' + formatGYD(service.ratePerSide) + '</p><p>Total: <span id="sides-total-' + prefix + '">' + formatGYD(service.ratePerSide) + '</span></p>';
      var sidesInput = document.getElementById('sides-' + prefix);
      sidesInput.addEventListener('input', function () {
        var sides = parseInt(sidesInput.value) || 1;
        var total = sides * service.ratePerSide;
        document.getElementById('sides-total-' + prefix).innerText = formatGYD(total);
        window['_sidesTotal_' + prefix] = total;
      });
      window['_sidesTotal_' + prefix] = service.ratePerSide;
    }
    else if (isSqftService(serviceKey)) {
      var rate = getSqftRate(serviceKey);
      var container = document.getElementById(dimId) || (function() {
        var selectEl = document.getElementById(prefix + "-servicio");
        if (!selectEl) return null;
        var selectGroup = selectEl.closest(".fg");
        if (!selectGroup) return null;
        var newDiv = document.createElement("div");
        newDiv.id = dimId;
        newDiv.className = "fg span2";
        newDiv.style.marginTop = "0.5rem";
        selectGroup.parentNode.insertBefore(newDiv, selectGroup.nextSibling);
        return newDiv;
      })();
      if (!container) return;
      container.innerHTML = '<div style="display:flex;gap:1rem;"><div><label>Length (ft)</label><input type="number" id="length-' + prefix + '" step="0.01"></div><div><label>Width (ft)</label><input type="number" id="width-' + prefix + '" step="0.01"></div><div><div>Total: <span id="sqft-total-' + prefix + '">$0</span></div><small>Rate: ' + rate + ' GYD/sq ft</small></div></div>';
      var lenInput = document.getElementById('length-' + prefix);
      var widInput = document.getElementById('width-' + prefix);
      var totalSpan = document.getElementById('sqft-total-' + prefix);
      function updateTotal() {
        var l = parseFloat(lenInput?.value) || 0;
        var w = parseFloat(widInput?.value) || 0;
        if (l > 0 && w > 0) totalSpan.innerText = formatGYD(calculateSqftPrice(serviceKey, l, w));
        else totalSpan.innerText = formatGYD(0);
      }
      lenInput.addEventListener('input', updateTotal);
      widInput.addEventListener('input', updateTotal);
    }
  }

  window.onServiceChangeSection = function (prefix) {
    var select = document.getElementById(prefix + "-servicio");
    var sk = select ? select.value : "";
    var fechaInput = document.getElementById(prefix + "-fecha");
    if (fechaInput) fechaInput.value = "";
    createSectionFields(prefix, sk);
    // calendario (simplificado)
    var now = new Date();
    window['sectionCals'] = window['sectionCals'] || {};
    window['sectionCals'][prefix] = { month: now.getMonth(), year: now.getFullYear(), selected: null };
    var placeholder = document.getElementById("cal-placeholder-" + prefix);
    if (placeholder) placeholder.classList.add("hidden");
    renderSectionCalendar(prefix);
  };

  function renderSectionCalendar(prefix) {
    var state = window['sectionCals'][prefix];
    if (!state) return;
    var contentDiv = document.getElementById("cal-content-" + prefix);
    if (!contentDiv) return;
    var mn = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    var dn = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    var now = new Date(); now.setHours(0,0,0,0);
    var fd = new Date(state.year, state.month, 1).getDay();
    var dm = new Date(state.year, state.month + 1, 0).getDate();
    var html = '<div class="cal-header"><button onclick="sectionCalPrev(\'' + prefix + '\')"><i class="fas fa-chevron-left"></i></button><h4>' + mn[state.month] + ' ' + state.year + '</h4><button onclick="sectionCalNext(\'' + prefix + '\')"><i class="fas fa-chevron-right"></i></button></div><div class="cal-grid">';
    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(function(d){ html += '<div class="cal-label">' + d + '</div>'; });
    for (var i = 0; i < fd; i++) html += '<div class="cal-day empty"></div>';
    for (var d = 1; d <= dm; d++) {
      var dt = new Date(state.year, state.month, d); dt.setHours(0,0,0,0);
      var ds = state.year + "-" + (state.month+1) + "-" + d;
      var cls = "cal-day current-month";
      if (dt.getTime() === now.getTime()) cls += " today";
      if (dt < now) cls += " unavailable";
      else cls += " available";
      if (state.selected === ds) cls = cls.replace("unavailable","").replace("available","") + " selected";
      html += '<div class="' + cls + '" onclick="selectSectionDate(\'' + prefix + '\',\'' + ds + '\')">' + d + '</div>';
    }
    html += '</div>';
    contentDiv.innerHTML = html;
    contentDiv.classList.remove("hidden");
  }

  window.selectSectionDate = function(prefix, ds) {
    if (!window['sectionCals'][prefix]) return;
    window['sectionCals'][prefix].selected = ds;
    var p = ds.split("-");
    var iso = p[0] + "-" + p[1].padStart(2,"0") + "-" + p[2].padStart(2,"0");
    var fechaEl = document.getElementById(prefix + "-fecha");
    if (fechaEl) fechaEl.value = iso;
    renderSectionCalendar(prefix);
  };
  window.sectionCalPrev = function(prefix) {
    var state = window['sectionCals'][prefix];
    if (!state) return;
    state.month--; if (state.month < 0) { state.month = 11; state.year--; }
    renderSectionCalendar(prefix);
  };
  window.sectionCalNext = function(prefix) {
    var state = window['sectionCals'][prefix];
    if (!state) return;
    state.month++; if (state.month > 11) { state.month = 0; state.year++; }
    renderSectionCalendar(prefix);
  };

  window.submitForm = async function(prefix, category) {
    var nombre = document.getElementById(prefix + "-nombre")?.value.trim();
    var email = document.getElementById(prefix + "-email")?.value.trim();
    var telefono = document.getElementById(prefix + "-telefono")?.value.trim();
    var sk = document.getElementById(prefix + "-servicio")?.value;
    var fecha = document.getElementById(prefix + "-fecha")?.value;
    var direccion = document.getElementById(prefix + "-direccion")?.value.trim();
    var notas = document.getElementById(prefix + "-notas")?.value.trim();
    if (!nombre || !email || !telefono || !sk || !fecha || !direccion) { showToast("Please fill all fields", "error"); return; }

    var sd = servicesData[sk] || { name: sk, price: "Quote on visit", category: category };
    var finalPrice = sd.price;
    var sqftValue = null, roomsData = null, sidesValue = null;

    if (isRoomBasedService(sk)) {
      var service = servicesData[sk];
      var total = 0; roomsData = {};
      for (var rk in service.rooms) {
        var qty = parseInt(document.getElementById('qty-' + prefix + '-' + rk)?.value) || 0;
        var subtotal = qty * service.rooms[rk].rate;
        roomsData[rk] = { name: service.rooms[rk].name, quantity: qty, rate: service.rooms[rk].rate, subtotal: subtotal };
        total += subtotal;
      }
      finalPrice = formatGYD(total);
    } else if (isPerSideService(sk)) {
      var sides = parseInt(document.getElementById('sides-' + prefix)?.value) || 1;
      sidesValue = sides;
      var total = sides * servicesData[sk].ratePerSide;
      finalPrice = formatGYD(total);
    } else if (isSqftService(sk)) {
      var l = parseFloat(document.getElementById('length-' + prefix)?.value) || 0;
      var w = parseFloat(document.getElementById('width-' + prefix)?.value) || 0;
      if (l <= 0 || w <= 0) { showToast("Enter valid Length and Width", "error"); return; }
      sqftValue = l * w;
      var total = sqftValue * getSqftRate(sk);
      finalPrice = formatGYD(total);
    }

    var payload = { nombre, email, telefono, servicioKey: sk, servicio: sd.name, categoria: sd.category || category, precio: finalPrice, fecha, direccion, notas, sqft: sqftValue, rooms: roomsData, sides: sidesValue, timestamp: new Date().toISOString(), source: "standardhomecleaning.html" };
    try { await fetch(CONFIG.WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); } catch(e) { console.error(e); }
    showToast("Booking saved! Complete payment via MMG.", "success");
    // Aquí puedes mostrar un panel de éxito similar al de app.js si deseas
    // Por ahora solo mostramos toast y limpiamos el formulario opcional
    var formSection = document.getElementById("form-" + prefix);
    if (formSection) formSection.classList.remove("open");
  };

  // Inicialización opcional: manejar MMG return
  async function handleMMGReturn() {
    var params = new URLSearchParams(window.location.search);
    var token = params.get("TOKEN") || params.get("token") || params.get("mmg_token");
    if (!token) return;
    window.history.replaceState({}, document.title, window.location.pathname);
    showToast("Processing payment...", "info", 5000);
    try {
      var res = await fetch(CONFIG.MMG_VERIFY_WEBHOOK + "?TOKEN=" + encodeURIComponent(token));
      var data = await res.json();
      var isSuccess = data.isSuccess === true || data.statusCode === "CONFIRMED";
      if (isSuccess) showToast("✓ Payment confirmed!", "success", 7000);
      else showToast("Payment failed or cancelled.", "error", 7000);
    } catch(e) { console.error(e); }
  }
  handleMMGReturn();

  console.log("services.js loaded successfully");
})();
