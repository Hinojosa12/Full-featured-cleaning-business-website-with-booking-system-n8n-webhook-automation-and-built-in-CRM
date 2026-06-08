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
    "bedroom":            { name: "Bedroom",                                                      price: "$7,500",   category: "Cleaning" },
    "bathroom-toilet":    { name: "Bathroom & Toilet",                                            price: "$12,000",  category: "Cleaning" },
    "kitchen":            { name: "Kitchen",                                                      price: "$9,000",   category: "Cleaning" },
    "livingroom":         { name: "Livingroom",                                                   price: "$12,000",  category: "Cleaning" },
    "studio-apartment":   { name: "Studio Apartment",                                             price: "$40,000",  category: "Cleaning" },
    "floor-polishing":    { name: "FLOOR POLISHING",                                              price: "$95",      category: "Floor Polishing" },
    "office-space":       { name: "Office Space (per sq ft, min $10,000)",                        price: "$80",      category: "Office Cleaning" },
    "1-seat-sofa":        { name: "1 seat Sofa",                                                  price: "$6,000",   category: "Furniture Cleaning" },
    "2-seat-sofa":        { name: "2 seat Sofa",                                                  price: "$10,000",  category: "Furniture Cleaning" },
    "3-seat-sofa":        { name: "3 seat Sofa",                                                  price: "$14,000",  category: "Furniture Cleaning" },
    "l-shaped-sofa":      { name: "L Shaped Sofa",                                                price: "$16,000",  category: "Steam Cleaning" },
    "3-2-1-suite":        { name: "3 2 1 Suite",                                                  price: "$24,000",  category: "Steam Cleaning" },
    "3-1-1-suite":        { name: "3 1 1 Suite",                                                  price: "$20,000",  category: "Steam Cleaning" },
    "3-2-suite":          { name: "3 2 Suite",                                                    price: "$20,000",  category: "Steam Cleaning" },
    "2-1-1-suite":        { name: "2 1 1 Suite",                                                  price: "$16,000",  category: "Furniture Cleaning" },
    "ottoman":            { name: "Ottoman",                                                      price: "$5,000",   category: "Furniture Cleaning" },
    "office-chairs":      { name: "Office Chairs",                                                price: "$2,500",   category: "Furniture Cleaning" },
    "dining-chairs":      { name: "Dinning Chairs",                                               price: "$2,000",   category: "Furniture Cleaning" },
    "king-mattress":      { name: "King Size Mattresses (Inclusive of 2 pillows)",                price: "$12,000",  category: "Mattress Cleaning" },
    "queen-mattress":     { name: "Queen Size Mattresses (Inclusive of 2 pillows)",               price: "$10,000",  category: "Mattress Cleaning" },
    "double-mattress":    { name: "Double Size Mattress",                                         price: "$10,000",  category: "Mattress Cleaning" },
    "single-mattress":    { name: "Single Mattress",                                              price: "$8,000",   category: "Mattress Cleaning" },
    "car-cleaning":       { name: "Cars (Inclusive of Mats)",                                     price: "$12,000",  category: "Vehicle Cleaning" },
    "suv-cleaning":       { name: "SUVs (Inclusive of Mats)",                                     price: "$16,000",  category: "Vehicle Cleaning" },
    "tacoma-cleaning":    { name: "Tacoma (Pick ups)",                                            price: "$24,000",  category: "Vehicle Cleaning" },
    "carpet-uninstalled": { name: "Per Square foot L x W (uninstalled)",                          price: "sqft:115", category: "Carpet Installation", isSqft: true, rate: 115 },
    "carpet-deep-cleaning":{ name: "Deep Cleaning (Pressure washing, shampooing and steam)",      price: "sqft:220", category: "Carpet Cleaning",     isSqft: true, rate: 220 },
    // ── NEW: pressure-driveway now registered as sqft service ─────────────
    "pressure-driveway":  { name: "Driveway & Pressure Washing",                                  price: "sqft:30",  category: "Pressure Washing",    isSqft: true, rate: 30  },
    "pressure-washing":   { name: "Per Square foot pressure washing",                             price: "$30",      category: "Pressure Washing" },
    "recliner-single":    { name: "Recliner Single",                                              price: "$6,000",   category: "Recliner Cleaning" },
    "recliner-joined":    { name: "Recliner Joined",                                              price: "$10,000",  category: "Recliner Cleaning" },
  };

  const availableDates = {
    "Steam Cleaning":       ["2026-4-28","2026-4-29","2026-4-30","2026-5-2","2026-5-4","2026-5-5","2026-5-6","2026-5-7","2026-5-8","2026-5-9","2026-5-11","2026-5-12","2026-5-13","2026-5-14","2026-5-15","2026-5-16","2026-5-18","2026-5-19","2026-5-20","2026-5-21","2026-5-22","2026-5-23","2026-5-25","2026-5-26","2026-5-27","2026-5-28","2026-5-29","2026-5-30","2026-6-2","2026-6-3","2026-6-4","2026-6-5","2026-6-6","2026-6-8","2026-6-9","2026-6-10","2026-6-11","2026-6-12","2026-6-13","2026-6-15","2026-6-16","2026-6-17","2026-6-18","2026-6-19","2026-6-20","2026-6-22","2026-6-23","2026-6-24","2026-6-25","2026-6-26","2026-6-27","2026-6-29","2026-6-30"],
    "Carpet Cleaning":      ["2026-4-28","2026-4-29","2026-4-30","2026-5-2","2026-5-4","2026-5-5","2026-5-6","2026-5-7","2026-5-8","2026-5-9","2026-5-11","2026-5-12","2026-5-13","2026-5-14","2026-5-15","2026-5-16","2026-5-18","2026-5-19","2026-5-20","2026-5-21","2026-5-22","2026-5-23","2026-5-25","2026-5-26","2026-5-27","2026-5-28","2026-5-29","2026-5-30","2026-6-2","2026-6-3","2026-6-4","2026-6-5","2026-6-6","2026-6-8","2026-6-9","2026-6-10","2026-6-11","2026-6-12","2026-6-13","2026-6-15","2026-6-16","2026-6-17","2026-6-18","2026-6-19","2026-6-20","2026-6-22","2026-6-23","2026-6-24","2026-6-25","2026-6-26","2026-6-27","2026-6-29","2026-6-30"],
    "Pressure Washing":     ["2026-4-28","2026-4-29","2026-4-30","2026-5-2","2026-5-5","2026-5-7","2026-5-9","2026-5-11","2026-5-13","2026-5-16","2026-5-18","2026-5-20","2026-5-23","2026-5-25","2026-5-27","2026-5-30","2026-6-1","2026-6-3","2026-6-5","2026-6-8","2026-6-10","2026-6-12","2026-6-15","2026-6-17","2026-6-19","2026-6-22","2026-6-24","2026-6-26","2026-6-29"],
    "Residential Cleaning": ["2026-4-28","2026-4-29","2026-4-30","2026-5-2","2026-5-4","2026-5-6","2026-5-8","2026-5-9","2026-5-11","2026-5-13","2026-5-15","2026-5-16","2026-5-18","2026-5-20","2026-5-22","2026-5-23","2026-5-25","2026-5-27","2026-5-29","2026-5-30","2026-6-1","2026-6-2","2026-6-3","2026-6-4","2026-6-5","2026-6-6","2026-6-8","2026-6-9","2026-6-10","2026-6-11","2026-6-12","2026-6-13","2026-6-15","2026-6-16","2026-6-17","2026-6-18","2026-6-19","2026-6-20","2026-6-22","2026-6-23","2026-6-24","2026-6-25","2026-6-26","2026-6-27","2026-6-29","2026-6-30"],
    "Deep Cleaning":        ["2026-4-28","2026-4-29","2026-4-30","2026-5-2","2026-5-5","2026-5-6","2026-5-8","2026-5-9","2026-5-12","2026-5-13","2026-5-15","2026-5-16","2026-5-19","2026-5-20","2026-5-22","2026-5-23","2026-5-26","2026-5-27","2026-5-29","2026-5-30","2026-6-1","2026-6-2","2026-6-4","2026-6-5","2026-6-8","2026-6-9","2026-6-11","2026-6-12","2026-6-15","2026-6-16","2026-6-18","2026-6-19","2026-6-22","2026-6-23","2026-6-25","2026-6-26","2026-6-29","2026-6-30"],
    "Commercial Cleaning":  ["2026-4-28","2026-4-29","2026-4-30","2026-5-2","2026-5-4","2026-5-5","2026-5-7","2026-5-8","2026-5-11","2026-5-12","2026-5-14","2026-5-15","2026-5-18","2026-5-19","2026-5-21","2026-5-22","2026-5-25","2026-5-26","2026-5-28","2026-5-29","2026-6-1","2026-6-2","2026-6-4","2026-6-5","2026-6-8","2026-6-9","2026-6-11","2026-6-12","2026-6-15","2026-6-16","2026-6-18","2026-6-19","2026-6-22","2026-6-23","2026-6-25","2026-6-26","2026-6-29","2026-6-30"],
    "Move In/Out":          ["2026-4-28","2026-4-29","2026-4-30","2026-5-2","2026-5-4","2026-5-6","2026-5-9","2026-5-11","2026-5-13","2026-5-16","2026-5-18","2026-5-20","2026-5-23","2026-5-25","2026-5-27","2026-5-30"],
  };

  // ── Sqft helpers ────────────────────────────────────────────────────────
  function isSqftService(serviceKey) {
    return !!(servicesData[serviceKey] && servicesData[serviceKey].isSqft);
  }
  function getSqftRate(serviceKey) {
    return servicesData[serviceKey] ? servicesData[serviceKey].rate : null;
  }
  function calculateSqftPrice(serviceKey, length, width) {
    var rate = getSqftRate(serviceKey);
    if (!rate) return null;
    return length * width * rate;
  }

  function parsePrice(priceStr) {
    if (!priceStr || (typeof priceStr === "string" && priceStr.toLowerCase().includes("quote"))) return null;
    if (typeof priceStr === "number") return priceStr;
    var cleaned = priceStr.replace(/[^0-9.]/g, "");
    var num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  function formatGYD(amount) {
    return "$" + Number(amount).toLocaleString("en-US", { minimumFractionDigits: 0 });
  }
  function isFixedPrice(priceStr) {
    if (!priceStr) return false;
    if (typeof priceStr === "number") return true;
    return !priceStr.toLowerCase().includes("quote") && !priceStr.includes("/sq ft") && !priceStr.includes("/each");
  }
  function showToast(m, t, d) {
    t = t || "info"; d = d || 4000;
    var e = document.getElementById("toast"); if (!e) return;
    e.textContent = m; e.className = "toast show " + t;
    setTimeout(function () { e.classList.remove("show"); }, d);
  }

  // ════════════════════════════════════════════════════════════════════════
  //  SECTION FORMS  (standardhomecleaning.html: r1, r2, r3, r4, r6)
  // ════════════════════════════════════════════════════════════════════════

  // State per section
  var sectionCals = {};   // { prefix: { month, year, selected, category } }

  // ── toggleForm ──────────────────────────────────────────────────────────
  window.toggleForm = function (formId) {
    var form = document.getElementById(formId);
    if (!form) return;
    var isOpen = form.classList.contains("show");
    document.querySelectorAll(".form-section").forEach(function (f) { f.classList.remove("show"); });
    if (!isOpen) {
      form.classList.add("show");
      setTimeout(function () { form.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
    }
  };

  // ── Section dimension fields ────────────────────────────────────────────
  function createSectionDimensionFields(prefix, serviceKey) {
    var containerId = "dim-" + prefix;
    var existing = document.getElementById(containerId);

    if (!isSqftService(serviceKey)) {
      if (existing) existing.innerHTML = "";
      return;
    }

    // Create container if it doesn't exist yet
    if (!existing) {
      var selectEl = document.getElementById(prefix + "-servicio");
      if (!selectEl) return;
      var selectGroup = selectEl.closest(".fg");
      if (!selectGroup) return;
      var newDiv = document.createElement("div");
      newDiv.id = containerId;
      newDiv.className = "fg span2";
      newDiv.style.marginTop = "0.5rem";
      selectGroup.parentNode.insertBefore(newDiv, selectGroup.nextSibling);
      existing = newDiv;
    }

    var rate = getSqftRate(serviceKey);
    var rateText = rate + " GYD/sq ft";

    existing.innerHTML =
      '<div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-end;">' +
        '<div style="flex:1;min-width:120px;">' +
          '<label><i class="fas fa-arrows-alt-h"></i> Length (feet) *</label>' +
          '<input type="number" id="length-' + prefix + '" step="0.01" min="0.1" placeholder="e.g., 10.5">' +
        '</div>' +
        '<div style="flex:1;min-width:120px;">' +
          '<label><i class="fas fa-arrows-alt-v"></i> Width (feet) *</label>' +
          '<input type="number" id="width-' + prefix + '" step="0.01" min="0.1" placeholder="e.g., 8.2">' +
        '</div>' +
        '<div style="flex:0 0 auto;">' +
          '<div style="background:#f5f0e6;padding:0.5rem 1rem;border-radius:40px;font-weight:700;">' +
            'Total: <span id="sqft-total-' + prefix + '">$0</span>' +
          '</div>' +
          '<small style="font-size:0.7rem;color:var(--muted,#888);">Rate: ' + rateText + '</small>' +
        '</div>' +
      '</div>';

    var lengthInput = document.getElementById("length-" + prefix);
    var widthInput  = document.getElementById("width-"  + prefix);
    var totalSpan   = document.getElementById("sqft-total-" + prefix);

    function updateTotal() {
      var l = parseFloat(lengthInput ? lengthInput.value : 0) || 0;
      var w = parseFloat(widthInput  ? widthInput.value  : 0) || 0;
      totalSpan.textContent = (l > 0 && w > 0) ? formatGYD(calculateSqftPrice(serviceKey, l, w)) : "$0";
    }
    if (lengthInput) lengthInput.addEventListener("input", updateTotal);
    if (widthInput)  widthInput.addEventListener("input", updateTotal);
  }

  // ── Section calendar ────────────────────────────────────────────────────
  function getCategoryForSection(prefix, serviceKey) {
    if (serviceKey === "carpet-uninstalled" || serviceKey === "carpet-deep-cleaning") return "Carpet Cleaning";
    if (serviceKey === "pressure-driveway") return "Pressure Washing";
    var calEl = document.getElementById("cal-" + prefix);
    return calEl ? calEl.dataset.category : null;
  }

  function renderSectionCalendar(prefix) {
    var state = sectionCals[prefix];
    if (!state) return;
    var contentDiv = document.getElementById("cal-content-" + prefix);
    if (!contentDiv) return;

    var mn = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    var dn = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    var now = new Date(); now.setHours(0,0,0,0);
    var availSet = new Set((state.category && availableDates[state.category]) || []);
    var fd = new Date(state.year, state.month, 1).getDay();
    var dm = new Date(state.year, state.month + 1, 0).getDate();

    var html =
      '<div class="calendar-header">' +
        '<div class="calendar-nav"><button type="button" onclick="sectionCalPrev(\'' + prefix + '\')"><i class="fas fa-chevron-left"></i></button></div>' +
        '<h3>' + mn[state.month] + ' ' + state.year + '</h3>' +
        '<div class="calendar-nav"><button type="button" onclick="sectionCalNext(\'' + prefix + '\')"><i class="fas fa-chevron-right"></i></button></div>' +
      '</div>' +
      '<div class="calendar-grid">';

    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(function (d) {
      html += '<div class="calendar-day-label">' + d + '</div>';
    });
    for (var i = 0; i < fd; i++) html += '<div class="calendar-day"></div>';
    for (var d = 1; d <= dm; d++) {
      var dt = new Date(state.year, state.month, d); dt.setHours(0,0,0,0);
      var ds = state.year + "-" + (state.month + 1) + "-" + d;
      var cls = "calendar-day current-month";
      if (dt.getTime() === now.getTime()) cls += " today";
      var clickAttr = "";
      if (dt < now) {
        cls += " unavailable";
      } else if (availSet.has(ds)) {
        cls += " available";
        clickAttr = ' onclick="selectSectionDate(\'' + prefix + '\',\'' + ds + '\')"';
      } else {
        cls += " unavailable";
      }
      if (state.selected === ds) { cls = cls.replace(" unavailable",""); cls += " selected"; clickAttr = ' onclick="selectSectionDate(\'' + prefix + '\',\'' + ds + '\')"'; }
      html += '<div class="' + cls + '"' + clickAttr + '>' + d + '</div>';
    }
    html += '</div>';

    html +=
      '<div class="calendar-legend">' +
        '<div class="legend-item"><div class="legend-dot available"></div> Available</div>' +
        '<div class="legend-item"><div class="legend-dot selected"></div> Selected</div>' +
        '<div class="legend-item"><div class="legend-dot unavailable"></div> Unavailable</div>' +
      '</div>';

    if (state.selected) {
      var p2 = state.selected.split("-");
      var dobj = new Date(parseInt(p2[0]), parseInt(p2[1]) - 1, parseInt(p2[2]));
      html +=
        '<div class="selected-date-display show">' +
          '<i class="fas fa-check-circle"></i>' +
          '<span>' + dn[dobj.getDay()] + ', ' + mn[dobj.getMonth()] + ' ' + p2[2] + ', ' + p2[0] + '</span>' +
        '</div>';
    }

    contentDiv.innerHTML = html;
    contentDiv.classList.remove("hidden");
  }

  window.selectSectionDate = function (prefix, ds) {
    if (!sectionCals[prefix]) return;
    sectionCals[prefix].selected = ds;
    var p = ds.split("-");
    var iso = p[0] + "-" + p[1].padStart(2, "0") + "-" + p[2].padStart(2, "0");
    var fechaEl = document.getElementById(prefix + "-fecha");
    if (fechaEl) fechaEl.value = iso;
    renderSectionCalendar(prefix);
  };

  window.sectionCalPrev = function (prefix) {
    if (!sectionCals[prefix]) return;
    sectionCals[prefix].month--;
    if (sectionCals[prefix].month < 0) { sectionCals[prefix].month = 11; sectionCals[prefix].year--; }
    renderSectionCalendar(prefix);
  };

  window.sectionCalNext = function (prefix) {
    if (!sectionCals[prefix]) return;
    sectionCals[prefix].month++;
    if (sectionCals[prefix].month > 11) { sectionCals[prefix].month = 0; sectionCals[prefix].year++; }
    renderSectionCalendar(prefix);
  };

  // ── onServiceChangeSection ──────────────────────────────────────────────
  window.onServiceChangeSection = function (prefix) {
    var sk = (document.getElementById(prefix + "-servicio") || {}).value || "";
    var fechaEl = document.getElementById(prefix + "-fecha");
    if (fechaEl) fechaEl.value = "";

    // Show/hide dimension fields
    createSectionDimensionFields(prefix, sk);

    if (!sk) {
      var ph = document.getElementById("cal-placeholder-" + prefix);
      var ct = document.getElementById("cal-content-" + prefix);
      if (ph) ph.classList.remove("hidden");
      if (ct) ct.classList.add("hidden");
      return;
    }

    var category = getCategoryForSection(prefix, sk);
    var now = new Date();
    sectionCals[prefix] = { month: now.getMonth(), year: now.getFullYear(), selected: null, category: category };

    var placeholder = document.getElementById("cal-placeholder-" + prefix);
    if (placeholder) placeholder.classList.add("hidden");
    renderSectionCalendar(prefix);
  };

  // ── submitForm (per-section booking) ───────────────────────────────────
  window.submitForm = async function (prefix, formCategory) {
    var nombre    = (document.getElementById(prefix + "-nombre")    || {}).value || "";
    var email     = (document.getElementById(prefix + "-email")     || {}).value || "";
    var telefono  = (document.getElementById(prefix + "-telefono")  || {}).value || "";
    var sk        = (document.getElementById(prefix + "-servicio")  || {}).value || "";
    var fecha     = (document.getElementById(prefix + "-fecha")     || {}).value || "";
    var direccion = (document.getElementById(prefix + "-direccion") || {}).value || "";
    var notas     = (document.getElementById(prefix + "-notas")     || {}).value || "";

    nombre    = nombre.trim();
    email     = email.trim();
    telefono  = telefono.trim();
    direccion = direccion.trim();
    notas     = notas.trim();

    if (!nombre || !email || !telefono || !sk || !fecha || !direccion) {
      showToast("Please fill in all required fields.", "error"); return;
    }

    var sd = servicesData[sk] || { name: sk, price: "Quote on visit", category: formCategory };
    var finalPrice = sd.price;
    var sqftValue  = null;

    if (isSqftService(sk)) {
      var lEl = document.getElementById("length-" + prefix);
      var wEl = document.getElementById("width-"  + prefix);
      var l = parseFloat(lEl ? lEl.value : 0);
      var w = parseFloat(wEl ? wEl.value : 0);
      if (!l || !w || l <= 0 || w <= 0) {
        showToast("Please enter valid Length and Width in feet.", "error"); return;
      }
      sqftValue  = l * w;
      finalPrice = formatGYD(calculateSqftPrice(sk, l, w));
    }

    var btn = document.getElementById("btn-" + prefix);
    var btnSpan = btn ? btn.querySelector("span") : null;
    if (btn) btn.disabled = true;
    if (btnSpan) btnSpan.textContent = "Sending...";

    var payload = {
      nombre:      nombre,
      email:       email,
      telefono:    telefono,
      servicioKey: sk,
      servicio:    sd.name || sk,
      categoria:   sd.category || formCategory,
      precio:      finalPrice,
      fechaHora:   fecha + "T09:00",
      fecha:       fecha,
      horario:     "09:00",
      direccion:   direccion,
      notas:       notas,
      sqft:        sqftValue,
      timestamp:   new Date().toISOString(),
      source:      "standardhomecleaning.html",
    };

    try {
      await fetch(CONFIG.WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) { console.error("Webhook:", err); }

    // Google Ads conversion
    if (typeof gtag === "function") {
      gtag("event", "conversion", {
        send_to: "AW-18135400951/f7l_CPb7v6YcEPeD0cdD",
        value: 1.0, currency: "USD", transaction_id: payload.timestamp,
      });
    }

    // Show inline success panel
    var successPanel = document.getElementById("success-" + prefix);
    if (successPanel) {
      successPanel.innerHTML =
        '<div style="text-align:center;padding:1.5rem;background:#e8f5ed;border-radius:12px;margin-top:1rem;">' +
          '<div style="font-size:2rem;">✓</div>' +
          '<h3 style="color:#1e7c3a;margin:.5rem 0;">Booking Request Sent!</h3>' +
          '<p style="color:#555;">Our team will confirm via WhatsApp shortly.</p>' +
          '<div style="margin-top:1rem;font-size:.9rem;color:#555;line-height:1.7;">' +
            '<strong>Service:</strong> ' + payload.servicio + '<br>' +
            '<strong>Date:</strong> ' + payload.fecha + '<br>' +
            (sqftValue ? '<strong>Area:</strong> ' + sqftValue.toFixed(2) + ' sq ft<br>' : '') +
            '<strong>Amount:</strong> ' + payload.precio +
          '</div>' +
        '</div>';
    }

    showToast("Booking submitted successfully!", "success", 5000);
    if (btn) { btn.disabled = false; if (btnSpan) { btnSpan.innerHTML = '<i class="fas fa-paper-plane"></i> Book ' + formCategory; } }
  };

  // ════════════════════════════════════════════════════════════════════════
  //  MAIN FORM  (index.html single-select form — kept intact)
  // ════════════════════════════════════════════════════════════════════════

  let bookings = [];
  let countersStarted = false, submitting = false;
  let calMonth, calYear, selectedDate = null, currentCategory = null;
  let lastBookingPayload = null;
  let dimensionFieldsContainer = null;

  function createDimensionFields(serviceKey) {
    if (!dimensionFieldsContainer) {
      var selectGroup = document.getElementById("servicio") ? document.getElementById("servicio").closest(".form-group") : null;
      if (!selectGroup) return;
      var parent = selectGroup.parentNode;
      var newDiv = document.createElement("div");
      newDiv.id = "dimensionFieldsContainer";
      newDiv.className = "form-group full";
      newDiv.style.cssText = "margin-top:1rem;padding:0.75rem;background:rgba(0,0,0,0.02);border-radius:12px;";
      parent.insertBefore(newDiv, selectGroup.nextSibling);
      dimensionFieldsContainer = newDiv;
    }
    if (!isSqftService(serviceKey)) { dimensionFieldsContainer.innerHTML = ""; return; }
    var rate = getSqftRate(serviceKey);
    var rateText = rate === 115 ? "115 GYD/sq ft" : rate === 220 ? "220 GYD/sq ft" : rate + " GYD/sq ft";
    dimensionFieldsContainer.innerHTML =
      '<div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-end;">' +
        '<div style="flex:1;min-width:120px;"><label><i class="fas fa-arrows-alt-h"></i> Length (feet) *</label>' +
          '<input type="number" id="lengthFeet" step="0.01" min="0.1" placeholder="e.g., 10.5"></div>' +
        '<div style="flex:1;min-width:120px;"><label><i class="fas fa-arrows-alt-v"></i> Width (feet) *</label>' +
          '<input type="number" id="widthFeet" step="0.01" min="0.1" placeholder="e.g., 8.2"></div>' +
        '<div style="flex:0 0 auto;">' +
          '<div class="sqft-total" style="background:#f5f0e6;padding:0.5rem 1rem;border-radius:40px;font-weight:700;">Total: <span id="sqftTotalDisplay">$0</span></div>' +
          '<small style="font-size:0.7rem;color:var(--muted);">Rate: ' + rateText + '</small>' +
        '</div>' +
      '</div>';
    var lI = document.getElementById("lengthFeet"), wI = document.getElementById("widthFeet"), tS = document.getElementById("sqftTotalDisplay");
    function upd() { var l = parseFloat(lI.value)||0, w = parseFloat(wI.value)||0; tS.textContent = (l>0&&w>0) ? formatGYD(calculateSqftPrice(serviceKey,l,w)) : "$0"; }
    if (lI) lI.addEventListener("input", upd);
    if (wI) wI.addEventListener("input", upd);
  }

  function initCalendar() { var n = new Date(); calMonth = n.getMonth(); calYear = n.getFullYear(); }

  function renderCalendar() {
    var grid = document.getElementById("calendarGrid"); if (!grid) return; grid.innerHTML = "";
    var mn = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    document.getElementById("calMonthYear").textContent = mn[calMonth] + " " + calYear;
    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(function(d){var l=document.createElement("div");l.className="calendar-day-label";l.textContent=d;grid.appendChild(l);});
    var fd=new Date(calYear,calMonth,1).getDay(), dm=new Date(calYear,calMonth+1,0).getDate();
    var td=new Date(); td.setHours(0,0,0,0);
    var cd=(currentCategory&&availableDates[currentCategory])||[], as=new Set(cd);
    for(var i=0;i<fd;i++){var e=document.createElement("div");e.className="calendar-day";grid.appendChild(e);}
    for(var d=1;d<=dm;d++){
      var c=document.createElement("div");c.className="calendar-day current-month";c.textContent=d;
      var dt=new Date(calYear,calMonth,d);dt.setHours(0,0,0,0);
      var ds=calYear+"-"+(calMonth+1)+"-"+d;
      if(dt.getTime()===td.getTime())c.classList.add("today");
      if(dt<td)c.classList.add("unavailable");
      else if(as.has(ds)){c.classList.add("available");c.addEventListener("click",(function(dd,dds){return function(){selectDate(dd,dds);};})(d,ds));}
      else c.classList.add("unavailable");
      if(selectedDate===ds){c.classList.add("selected");c.classList.remove("unavailable");}
      grid.appendChild(c);
    }
  }

  function selectDate(day,ds){
    selectedDate=ds;var p=ds.split("-");
    var iso=p[0]+"-"+p[1].padStart(2,"0")+"-"+p[2].padStart(2,"0");
    document.getElementById("fechaSeleccionada").value=iso;
    var mn=["January","February","March","April","May","June","July","August","September","October","November","December"];
    var dobj=new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]));
    var dn=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    document.getElementById("selectedDateText").textContent=dn[dobj.getDay()]+", "+mn[dobj.getMonth()]+" "+p[2]+", "+p[0];
    document.getElementById("selectedDateDisplay").classList.add("show");
    renderCalendar();
  }

  function onServiceChange(){
    var sk=document.getElementById("servicio").value, sd=servicesData[sk];
    selectedDate=null; document.getElementById("fechaSeleccionada").value="";
    document.getElementById("selectedDateDisplay").classList.remove("show");
    createDimensionFields(sk);
    if(sd){currentCategory=sd.category;document.getElementById("calendarPlaceholder").classList.add("hidden");document.getElementById("calendarContent").classList.remove("hidden");initCalendar();renderCalendar();}
    else{currentCategory=null;document.getElementById("calendarPlaceholder").classList.remove("hidden");document.getElementById("calendarContent").classList.add("hidden");}
  }

  function populateSelect(){
    var s=document.getElementById("servicio");if(!s)return;
    var c={};
    for(var k in servicesData){var d=servicesData[k];if(!c[d.category])c[d.category]=[];c[d.category].push(Object.assign({k:k},d));}
    s.innerHTML='<option value="">— Select a service —</option>';
    for(var cat in c){var g=document.createElement("optgroup");g.label=cat;c[cat].forEach(function(i){var o=document.createElement("option");o.value=i.k;var dp=i.isSqft?(i.rate+" GYD/sq ft"):i.price;o.textContent=i.name+" — "+dp;g.appendChild(o);});s.appendChild(g);}
    s.addEventListener("change",onServiceChange);
  }

  function clearErrors(){document.querySelectorAll(".field-error").forEach(function(e){e.classList.remove("field-error");});document.querySelectorAll(".error-msg").forEach(function(e){e.remove();});}
  function setError(id,msg){var el=document.getElementById(id);if(!el)return;el.classList.add("field-error");var s=document.createElement("span");s.className="error-msg";s.textContent=msg;el.parentNode.appendChild(s);}

  function validateForm(){
    clearErrors();var v=true;
    var n=document.getElementById("nombre").value.trim(), e=document.getElementById("email").value.trim(),
        t=document.getElementById("telefono").value.trim(), s=document.getElementById("servicio").value,
        f=document.getElementById("fechaSeleccionada").value, d=document.getElementById("direccion").value.trim();
    if(!n){setError("nombre","Full name is required.");v=false;}
    if(!e||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){setError("email","Valid email required.");v=false;}
    if(!t||!/^[\+]?[\d\s\-\(\)]{7,15}$/.test(t.replace(/\s/g,""))){setError("telefono","Valid phone required.");v=false;}
    if(!s){setError("servicio","Please select a service.");v=false;}
    if(!f){showToast("Please select an available date from the calendar.","error");v=false;}
    if(!d){setError("direccion","Address is required.");v=false;}
    if(isSqftService(s)){
      var lv=parseFloat((document.getElementById("lengthFeet")||{}).value), wv=parseFloat((document.getElementById("widthFeet")||{}).value);
      if(!lv||lv<=0||!wv||wv<=0){showToast("Please enter valid Length and Width in feet.","error");v=false;}
    }
    return v;
  }

  function renderCRM(){
    var tb=document.getElementById("crm-body");if(!tb)return;
    if(!bookings.length){tb.innerHTML='<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--muted)">No bookings yet.</td></tr>';return;}
    tb.innerHTML="";
    bookings.forEach(function(b){
      var sl=(b.status||"pending").toLowerCase(), sb;
      if(sl==="confirmed") sb='<span style="background:#e8f5ed;color:#1e7c3a;border:1px solid #a8d8b5;padding:.25rem .9rem;border-radius:20px;font-size:.72rem;font-weight:700;">✓ Confirmed</span>';
      else if(sl==="cancelled"||sl==="failed") sb='<span style="background:#fdecea;color:#c0392b;border:1px solid #f5c6cb;padding:.25rem .9rem;border-radius:20px;font-size:.72rem;font-weight:700;">✗ '+sl.charAt(0).toUpperCase()+sl.slice(1)+'</span>';
      else sb='<span style="background:#fff5e6;color:#9a5c00;border:1px solid #ffcc80;padding:.25rem .9rem;border-radius:20px;font-size:.72rem;font-weight:700;">⏳ Pending</span>';
      var r=document.createElement("tr");
      r.innerHTML='<td><strong>'+b.nombre+'</strong></td><td>'+b.telefono+'</td><td>'+b.servicio+'</td><td>'+b.fecha+'</td><td>'+b.direccion+'</td><td>'+sb+'</td>';
      tb.appendChild(r);
    });
  }

  function setStep(n){
    for(var i=1;i<=3;i++){var d=document.getElementById("dot"+i);if(!d)continue;if(i<n){d.className="step-dot done";d.textContent="✓";}else if(i===n){d.className="step-dot active";d.textContent=i;}else{d.className="step-dot";d.textContent=i;}}
    var l1=document.getElementById("line1"),l2=document.getElementById("line2");
    if(l1)l1.className="step-line"+(n>1?" done":"");
    if(l2)l2.className="step-line"+(n>2?" done":"");
  }

  async function loadBookingsFromSheets(email){
    try{
      var url=CONFIG.GET_BOOKINGS_WEBHOOK;if(email)url+="?email="+encodeURIComponent(email);
      var res=await fetch(url),data=await res.json();
      var rows=Array.isArray(data)?data:(data.data||[]);
      bookings=rows.filter(function(r){return r["nombre "]||r.nombre;}).map(function(r){return{nombre:r["nombre "]||r.nombre||"",telefono:r.telefono||"",servicio:r.servicio||"",fecha:r.fecha||"",direccion:r["direccion "]||r.direccion||"",status:(r["statusCode "]||r.statusCode||"pending").toLowerCase()};}).reverse().slice(0,20);
      renderCRM();
    }catch(err){console.error("Error loading bookings:",err);}
  }

  async function handleMMGReturn(){
    var params=new URLSearchParams(window.location.search);
    var token=params.get("TOKEN")||params.get("token")||params.get("mmg_token");if(!token)return;
    window.history.replaceState({},document.title,window.location.pathname);
    showToast("Processing your payment...","info",5000);
    try{
      var res=await fetch(CONFIG.MMG_VERIFY_WEBHOOK+"?TOKEN="+encodeURIComponent(token));
      var data=await res.json();
      var isSuccess=data.isSuccess===true||data.statusCode==="CONFIRMED"||(Array.isArray(data)&&data[0]&&(data[0]["statusCode "]||data[0].statusCode)==="CONFIRMED");
      var isCancelled=data.isCancelledByUser===true||data.resultCode==="6"||data.statusCode==="CANCELLED";
      var pendingEmail=sessionStorage.getItem("mmg_pending_email");sessionStorage.removeItem("mmg_pending_email");
      if(isSuccess){showToast("✓ Payment confirmed!","success",7000);if(pendingEmail)setTimeout(function(){loadBookingsFromSheets(pendingEmail);},1500);}
      else if(isCancelled){showToast("Payment was cancelled.","error",7000);if(pendingEmail)setTimeout(function(){loadBookingsFromSheets(pendingEmail);},1500);}
      else{showToast("Payment could not be completed.","error",7000);if(pendingEmail)setTimeout(function(){loadBookingsFromSheets(pendingEmail);},1500);}
    }catch(err){console.error("MMG verify error:",err);showToast("Could not verify payment.","error",6000);}
  }

  async function submitBooking(){
    if(submitting)return;if(!validateForm()){showToast("Please fix the errors above.","error");return;}
    submitting=true;
    var btn=document.getElementById("btnReservar"),bt=document.getElementById("btnReservarText"),bs=document.getElementById("btnReservarSpinner");
    btn.disabled=true;if(bt)bt.classList.add("hidden");if(bs)bs.classList.remove("hidden");
    var sk=document.getElementById("servicio").value,sd=servicesData[sk]||{},fv=document.getElementById("fechaSeleccionada").value;
    var finalPrice=sd.price,sqftValue=null;
    if(isSqftService(sk)){
      var length=parseFloat((document.getElementById("lengthFeet")||{}).value);
      var width=parseFloat((document.getElementById("widthFeet")||{}).value);
      if(length&&width&&length>0&&width>0){sqftValue=length*width;finalPrice=formatGYD(calculateSqftPrice(sk,length,width));}
      else finalPrice="Quote on visit";
    }
    var payload={nombre:document.getElementById("nombre").value.trim(),email:document.getElementById("email").value.trim(),telefono:document.getElementById("telefono").value.trim(),servicioKey:sk,servicio:sd.name||sk,categoria:sd.category||"",precio:finalPrice,fechaHora:fv+"T09:00",fecha:fv,horario:"09:00",direccion:document.getElementById("direccion").value.trim(),notas:(document.getElementById("notas")?document.getElementById("notas").value.trim():""),cantidad:null,sqft:sqftValue,pickup:null,tipoMudanza:null,timestamp:new Date().toISOString(),source:"index.html"};
    bookings.unshift(Object.assign({},payload,{status:"pending"}));renderCRM();
    try{await fetch(CONFIG.WEBHOOK_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});}catch(err){console.error("Webhook:",err);}
    lastBookingPayload=payload;showSuccess(payload);
    setTimeout(function(){loadBookingsFromSheets(payload.email);},3000);
    submitting=false;btn.disabled=false;if(bt)bt.classList.remove("hidden");if(bs)bs.classList.add("hidden");
  }

  function showSuccess(p){
    document.getElementById("formReserva").classList.add("hidden");
    var pn=document.getElementById("panelEnviado");if(!pn)return;pn.classList.remove("hidden");
    if(typeof gtag==="function")gtag("event","conversion",{"send_to":"AW-18135400951/f7l_CPb7v6YcEPeD0cdD","value":1.0,"currency":"USD","transaction_id":p.timestamp||""});
    document.getElementById("telefonoMostrar").textContent=p.telefono;
    document.getElementById("reciboNombre2").textContent=p.nombre;
    document.getElementById("reciboServicio2").textContent=p.servicio;
    document.getElementById("reciboFecha2").textContent=p.fecha;
    document.getElementById("reciboDireccion2").textContent=p.direccion;
    var pe=document.getElementById("reciboPrecio2");if(pe)pe.textContent=p.precio;
    var mmgBtn=document.getElementById("btnPayMMG"),mmgLabel=document.getElementById("mmgAmountLabel");
    var priceNumber=parsePrice(p.precio);
    if(priceNumber&&priceNumber>0){mmgBtn.classList.remove("mmg-disabled");mmgBtn.disabled=false;mmgLabel.textContent=p.precio;}
    else{mmgBtn.classList.add("mmg-disabled");mmgBtn.disabled=true;mmgLabel.textContent="Quote required";}
    setStep(2);showToast("Data saved, please press Pay via MMG to complete payment.","success",7000);
  }

  function openMMGModal(){
    if(!lastBookingPayload)return;
    var amount=parsePrice(lastBookingPayload.precio);
    if(amount===null&&lastBookingPayload.sqft){var r=getSqftRate(lastBookingPayload.servicioKey);if(r)amount=lastBookingPayload.sqft*r;}
    document.getElementById("mmgService").textContent=lastBookingPayload.servicio;
    document.getElementById("mmgTotal").textContent=formatGYD(amount)+" GYD";
    var phone=lastBookingPayload.telefono.replace(/\+592\s?/,"").replace(/\s/g,"");
    document.getElementById("mmgPhone").value=phone;
    document.getElementById("mmgSuccess").classList.add("hidden");
    document.getElementById("mmgError").classList.add("hidden");
    document.querySelector(".mmg-modal-body").classList.remove("hidden");
    document.getElementById("mmgConfirmPay").classList.remove("hidden");
    document.querySelector(".mmg-secure").classList.remove("hidden");
    document.getElementById("mmgOverlay").classList.add("active");
    document.body.style.overflow="hidden";
  }
  function closeMMGModal(){document.getElementById("mmgOverlay").classList.remove("active");document.body.style.overflow="";}

  async function processMMGPayment(){
    var phoneInput=document.getElementById("mmgPhone"),phone=phoneInput.value.trim().replace(/\s/g,"");
    if(!phone||phone.length<6){phoneInput.classList.add("field-error");showToast("Please enter a valid MMG wallet number.","error");return;}
    phoneInput.classList.remove("field-error");
    var amountValue=parsePrice(lastBookingPayload.precio);
    if(amountValue===null&&lastBookingPayload.sqft){var r=getSqftRate(lastBookingPayload.servicioKey);if(r)amountValue=lastBookingPayload.sqft*r;}
    var payBtn=document.getElementById("mmgConfirmPay"),payText=document.getElementById("mmgPayText"),paySpinner=document.getElementById("mmgPaySpinner");
    payBtn.disabled=true;payText.classList.add("hidden");paySpinner.classList.remove("hidden");
    try{
      var response=await fetch(CONFIG.MMG_CHECKOUT_WEBHOOK,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({nombre:lastBookingPayload.nombre,email:lastBookingPayload.email,telefono:phone,servicio:lastBookingPayload.servicio,precio:formatGYD(amountValue),fecha:lastBookingPayload.fecha,direccion:lastBookingPayload.direccion,categoria:lastBookingPayload.categoria,sqft:lastBookingPayload.sqft})});
      if(!response.ok)throw new Error("Error generating payment URL");
      var data=await response.json();if(!data.checkoutUrl)throw new Error("No checkout URL received");
      sessionStorage.setItem("mmg_pending_email",lastBookingPayload.email);
      closeMMGModal();showToast("Redirecting to MMG payment page...","info",3000);
      setTimeout(function(){window.location.href=data.checkoutUrl;},800);
    }catch(err){
      console.error("MMG Checkout Error:",err);
      document.querySelector(".mmg-modal-body").classList.add("hidden");
      document.getElementById("mmgConfirmPay").classList.add("hidden");
      document.querySelector(".mmg-secure").classList.add("hidden");
      document.getElementById("mmgError").classList.remove("hidden");
      document.getElementById("mmgErrorMsg").textContent=err.message||"Something went wrong.";
    }finally{payBtn.disabled=false;payText.classList.remove("hidden");paySpinner.classList.add("hidden");}
  }

  function resetMMGModal(){
    document.getElementById("mmgError").classList.add("hidden");
    document.querySelector(".mmg-modal-body").classList.remove("hidden");
    document.getElementById("mmgConfirmPay").classList.remove("hidden");
    document.querySelector(".mmg-secure").classList.remove("hidden");
  }

  // ════════════════════════════════════════════════════════════════════════
  //  LIVITY UI  (custom selects, progress bar, cursor glow, ripple, parallax)
  // ════════════════════════════════════════════════════════════════════════
  var _lvSet=(typeof WeakSet!=="undefined")?new WeakSet():null;
  function LvSelect(native){
    var self=this;this.native=native;this.isOpen=false;
    this.wrap=document.createElement("div");this.wrap.className="lv-select-wrapper";
    native.parentNode.insertBefore(this.wrap,native);this.wrap.appendChild(native);this.wrap._lv=this;native._lv=this;
    this.trig=document.createElement("div");this.trig.className="lv-trigger";this.trig.setAttribute("tabindex","0");
    this.trig.innerHTML='<span class="lv-value"></span><svg class="lv-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
    this.wrap.appendChild(this.trig);this.valEl=this.trig.querySelector(".lv-value");
    this.panel=document.createElement("div");this.panel.className="lv-panel";this.wrap.appendChild(this.panel);
    new MutationObserver(function(){self.rebuild();}).observe(native,{childList:true,subtree:true});
    this.trig.addEventListener("click",function(e){e.stopPropagation();self.isOpen?self.close():self.open();});
    this.trig.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();self.isOpen?self.close():self.open();}else if(e.key==="Escape")self.close();else if(e.key==="ArrowDown"){e.preventDefault();self.move(1);}else if(e.key==="ArrowUp"){e.preventDefault();self.move(-1);}});
    document.addEventListener("click",function(){self.close();});
    this.panel.addEventListener("click",function(e){e.stopPropagation();});
    this.rebuild();
  }
  LvSelect.prototype.rebuild=function(){
    var self=this,panel=this.panel;panel.innerHTML="";
    var opts=Array.from(this.native.options),lastGrp=null;
    var chk='<svg class="lv-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    opts.forEach(function(opt,i){
      var grp=(opt.parentElement.tagName==="OPTGROUP")?opt.parentElement.label:null;
      if(grp&&grp!==lastGrp){lastGrp=grp;var gh=document.createElement("div");gh.className="lv-group-header";gh.textContent=grp;panel.appendChild(gh);}else if(!grp)lastGrp=null;
      var item=document.createElement("div");
      item.className="lv-option"+(opt.value===""?" lv-is-placeholder":"")+(opt.selected&&opt.value!==""?" lv-is-selected":"");
      item.dataset.idx=i;
      var m=opt.text.match(/^(.+?)\s*[—\-–]\s*(.+)$/);
      item.innerHTML=m?'<span class="lv-opt-name">'+m[1].trim()+'</span><span class="lv-opt-badge">'+m[2].trim()+"</span>"+chk:'<span class="lv-opt-name">'+opt.text+"</span>"+chk;
      if(opt.value!=="")item.addEventListener("click",(function(idx){return function(e){e.stopPropagation();self.select(idx);};})(i));
      panel.appendChild(item);
    });
    this.updateDisplay();
  };
  LvSelect.prototype.select=function(idx){this.native.selectedIndex=idx;this.native.dispatchEvent(new Event("change",{bubbles:true}));this.updateDisplay();this.panel.querySelectorAll(".lv-option").forEach(function(item){item.classList.toggle("lv-is-selected",parseInt(item.dataset.idx)===idx);});this.close();};
  LvSelect.prototype.updateDisplay=function(){var sel=this.native.options[this.native.selectedIndex];if(!sel||sel.value===""){this.valEl.innerHTML='<span class="lv-placeholder-txt">'+(sel?sel.text:"— Select —")+"</span>";}else{var m=sel.text.match(/^(.+?)\s*[—\-–]\s*(.+)$/);this.valEl.innerHTML=m?'<span class="lv-sel-label">'+m[1].trim()+'</span><span class="lv-sel-badge">'+m[2].trim()+"</span>":'<span class="lv-sel-label">'+sel.text+"</span>";}};
  LvSelect.prototype.open=function(){document.querySelectorAll(".lv-select-wrapper.lv-open").forEach(function(w){if(w._lv)w._lv.close();});this.isOpen=true;this.wrap.classList.add("lv-open");var rect=this.trig.getBoundingClientRect();this.wrap.classList.toggle("lv-dropup",(window.innerHeight-rect.bottom)<260&&rect.top>260);var p=this.panel;p.classList.add("lv-animating");p.querySelectorAll(".lv-option, .lv-group-header").forEach(function(el,i){el.style.animationDelay=(i*0.022)+"s";});setTimeout(function(){p.classList.remove("lv-animating");},400);};
  LvSelect.prototype.close=function(){if(!this.isOpen)return;this.isOpen=false;this.wrap.classList.remove("lv-open");};
  LvSelect.prototype.move=function(dir){if(!this.isOpen)this.open();var opts=this.native.options,idx=this.native.selectedIndex+dir;while(idx>=0&&idx<opts.length&&opts[idx].value==="")idx+=dir;if(idx>=0&&idx<opts.length)this.select(idx);};

  function initLvSelects(){document.querySelectorAll("select").forEach(function(sel){if(sel._lv||(sel.parentElement&&sel.parentElement.classList.contains("lv-select-wrapper")))return;if(_lvSet){if(_lvSet.has(sel))return;_lvSet.add(sel);}new LvSelect(sel);});}
  function initLvProgressBar(){var bar=document.createElement("div");bar.id="lv-progress-bar";document.body.appendChild(bar);window.addEventListener("scroll",function(){var max=document.documentElement.scrollHeight-window.innerHeight;bar.style.width=max>0?Math.min((window.scrollY/max)*100,100)+"%":"0%";},{passive:true});}
  function initLvCursorGlow(){if(!window.matchMedia("(pointer: fine)").matches)return;var g=document.createElement("div");g.className="lv-cursor-glow";document.body.appendChild(g);document.addEventListener("mousemove",function(e){g.style.left=e.clientX+"px";g.style.top=e.clientY+"px";});}
  function initLvRipple(){var sel=".hero-btn,.btn-primary,.btn-gold,.submit-btn,.btn-book,.btn-mmg,.mmg-pay-btn";document.addEventListener("click",function(e){var btn=e.target.closest(sel);if(!btn)return;var c=document.createElement("span");c.className="lv-ripple-circle";var r=btn.getBoundingClientRect();c.style.left=(e.clientX-r.left)+"px";c.style.top=(e.clientY-r.top)+"px";btn.appendChild(c);c.addEventListener("animationend",function(){c.remove();},{once:true});});}
  function initLvParallax(){var heroes=document.querySelectorAll(".hero");if(!heroes.length||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;window.addEventListener("scroll",function(){var sy=window.scrollY;heroes.forEach(function(h){var r=h.getBoundingClientRect();if(r.bottom<0||r.top>window.innerHeight)return;h.style.backgroundPositionY="calc(center + "+(sy*0.22)+"px)";});},{passive:true});}
  function initLvUI(){initLvProgressBar();initLvCursorGlow();initLvRipple();initLvParallax();}

  // ════════════════════════════════════════════════════════════════════════
  //  INIT
  // ════════════════════════════════════════════════════════════════════════
  function init(){
    populateSelect();
    initLvSelects();
    // Init section custom selects (standardhomecleaning.html)
    setTimeout(initLvSelects, 100);

    var hasMainForm = !!document.getElementById("btnReservar");
    if(hasMainForm){ setStep(1); initCalendar(); }
    handleMMGReturn();

    document.querySelectorAll(".animate-on-scroll").forEach(function(el){obs.observe(el);});
    var mt=document.getElementById("menuToggle");if(mt)mt.addEventListener("click",function(){var nl=document.getElementById("navLinks");if(nl)nl.classList.toggle("show");});
    window.addEventListener("scroll",function(){var nb=document.getElementById("mainNavBar");if(nb)nb.classList.toggle("scrolled",window.scrollY>0);});
    var lg=document.getElementById("logo");if(lg)lg.addEventListener("click",function(){window.scrollTo({top:0,behavior:"smooth"});});
    var hl=document.getElementById("homeLink");if(hl)hl.addEventListener("click",function(e){e.preventDefault();window.scrollTo({top:0,behavior:"smooth"});});
    var sl=document.getElementById("serviceLink");if(sl)sl.addEventListener("click",function(){window.location.href=CONFIG.SERVICES_PAGE;});
    var goBook=function(e){if(e)e.preventDefault();var ps=document.getElementById("paymentSection");if(ps)ps.scrollIntoView({behavior:"smooth",block:"start"});};
    var bl=document.getElementById("bookLink");if(bl)bl.addEventListener("click",goBook);
    var bc=document.getElementById("bookCleanBtn");if(bc)bc.addEventListener("click",goBook);
    var showAbout=function(){var as=document.getElementById("aboutSection");if(as){as.classList.add("visible");as.scrollIntoView({behavior:"smooth",block:"center"});}};
    var al=document.getElementById("aboutLink");if(al)al.addEventListener("click",function(e){e.preventDefault();showAbout();});
    var ma=document.getElementById("moreAboutBtn");if(ma)ma.addEventListener("click",showAbout);
    var ca=document.getElementById("closeAboutBtn");if(ca)ca.addEventListener("click",function(){var as=document.getElementById("aboutSection");if(as)as.classList.remove("visible");});
    var st=document.getElementById("scrollTopBtn");if(st)st.addEventListener("click",function(){window.scrollTo({top:0,behavior:"smooth"});});
    var br=document.getElementById("btnReservar");if(br)br.addEventListener("click",function(e){e.preventDefault();submitBooking();});
    var nb=document.getElementById("btnNewBooking");if(nb)nb.addEventListener("click",function(){
      var pe=document.getElementById("panelEnviado");if(pe)pe.classList.add("hidden");
      var fr=document.getElementById("formReserva");if(fr)fr.classList.remove("hidden");
      ["nombre","email","telefono","servicio","direccion","notas"].forEach(function(id){var el=document.getElementById(id);if(el)el.value="";});
      document.getElementById("fechaSeleccionada").value="";selectedDate=null;currentCategory=null;
      document.getElementById("calendarPlaceholder").classList.remove("hidden");
      document.getElementById("calendarContent").classList.add("hidden");
      document.getElementById("selectedDateDisplay").classList.remove("show");
      if(dimensionFieldsContainer)dimensionFieldsContainer.innerHTML="";
      var servSel=document.getElementById("servicio");if(servSel&&servSel._lv)servSel._lv.updateDisplay();
      clearErrors();setStep(1);lastBookingPayload=null;
      var ps=document.getElementById("paymentSection");if(ps)ps.scrollIntoView({behavior:"smooth"});
    });
    var cc=document.getElementById("btnClearCRM");if(cc)cc.addEventListener("click",function(){if(confirm("Clear all booking history?")){bookings=[];renderCRM();showToast("History cleared.","info");}});
    var cp=document.getElementById("carouselPrev");if(cp)cp.addEventListener("click",function(){var ct=document.getElementById("carouselTrack");if(ct)ct.scrollBy({left:-300,behavior:"smooth"});});
    var cn=document.getElementById("carouselNext");if(cn)cn.addEventListener("click",function(){var ct=document.getElementById("carouselTrack");if(ct)ct.scrollBy({left:300,behavior:"smooth"});});
    var clp=document.getElementById("calPrev");if(clp)clp.addEventListener("click",function(){calMonth--;if(calMonth<0){calMonth=11;calYear--;}renderCalendar();});
    var cln=document.getElementById("calNext");if(cln)cln.addEventListener("click",function(){calMonth++;if(calMonth>11){calMonth=0;calYear++;}renderCalendar();});
    document.querySelectorAll(".step-card").forEach(function(c){c.addEventListener("click",function(){var s=c.dataset.section;if(s)window.location.href=CONFIG.SERVICES_PAGE+"#"+s;});});
    var bp=document.getElementById("btnPayMMG");if(bp)bp.addEventListener("click",openMMGModal);
    var mc=document.getElementById("mmgCloseBtn");if(mc)mc.addEventListener("click",closeMMGModal);
    var mo=document.getElementById("mmgOverlay");if(mo)mo.addEventListener("click",function(e){if(e.target===e.currentTarget)closeMMGModal();});
    var mcp=document.getElementById("mmgConfirmPay");if(mcp)mcp.addEventListener("click",function(e){e.preventDefault();processMMGPayment();});
    var md=document.getElementById("mmgDoneBtn");if(md)md.addEventListener("click",closeMMGModal);
    var mr=document.getElementById("mmgRetryBtn");if(mr)mr.addEventListener("click",resetMMGModal);
    initLvUI();
  }

  var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add("visible");if(e.target.closest(".stats-section")&&!countersStarted){countersStarted=true;document.querySelectorAll(".stat-number[data-target]").forEach(function(el){var tgt=parseInt(el.dataset.target),suf=el.dataset.suffix||"",cur=0,step=Math.max(1,Math.floor(tgt/40));var ti=setInterval(function(){cur=Math.min(cur+step,tgt);el.textContent=cur+suf;if(cur>=tgt)clearInterval(ti);},40);});}obs.unobserve(e.target);}});},{threshold:0.15});

  document.addEventListener("DOMContentLoaded", init);
})();
