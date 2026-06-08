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
    "pressure-driveway":  { name: "Driveway & Pressure Washing",                                  price: "sqft:30",  category: "Pressure Washing",    isSqft: true, rate: 30  },
    "pressure-washing":   { name: "Per Square foot pressure washing",                             price: "$30",      category: "Pressure Washing" },
    "recliner-single":    { name: "Recliner Single",                                              price: "$6,000",   category: "Recliner Cleaning" },
    "recliner-joined":    { name: "Recliner Joined",                                              price: "$10,000",  category: "Recliner Cleaning" },
  };

  // ── Utilidades ──────────────────────────────────────────────────────────
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
    if (!priceStr) return null;
    if (typeof priceStr === "number") return priceStr;
    var cleaned = priceStr.replace(/[^0-9.]/g, "");
    var num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  function formatGYD(amount) {
    if (amount === null || isNaN(amount)) return "$0";
    return "$" + Number(amount).toLocaleString("en-US", { minimumFractionDigits: 0 });
  }
  function showToast(m, t, d) {
    t = t || "info"; d = d || 4000;
    var e = document.getElementById("toast"); if (!e) return;
    e.textContent = m; e.className = "toast show " + t;
    setTimeout(function () { e.classList.remove("show"); }, d);
  }

  // ── Estado global para MMG ─────────────────────────────────────────────
  let lastBookingPayload = null;
  let currentActivePrefix = null;

  // ════════════════════════════════════════════════════════════════════════
  //  FUNCIONES DE LAS SECCIONES (formularios de standardhomecleaning.html)
  // ════════════════════════════════════════════════════════════════════════

  var sectionCals = {};

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

  function createSectionDimensionFields(prefix, serviceKey) {
    var containerId = "dim-" + prefix;
    var existing = document.getElementById(containerId);

    if (!isSqftService(serviceKey)) {
      if (existing) existing.innerHTML = "";
      return;
    }

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

  function renderSectionCalendar(prefix) {
    var state = sectionCals[prefix];
    if (!state) return;
    var contentDiv = document.getElementById("cal-content-" + prefix);
    if (!contentDiv) return;

    var mn = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    var dn = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    var now = new Date(); now.setHours(0,0,0,0);
    var fd = new Date(state.year, state.month, 1).getDay();
    var dm = new Date(state.year, state.month + 1, 0).getDate();

    var html =
      '<div class="cal-header">' +
        '<div class="cal-nav"><button type="button" onclick="sectionCalPrev(\'' + prefix + '\')"><i class="fas fa-chevron-left"></i></button></div>' +
        '<h4>' + mn[state.month] + ' ' + state.year + '</h4>' +
        '<div class="cal-nav"><button type="button" onclick="sectionCalNext(\'' + prefix + '\')"><i class="fas fa-chevron-right"></i></button></div>' +
      '</div>' +
      '<div class="cal-grid">';

    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(function (d) {
      html += '<div class="cal-label">' + d + '</div>';
    });

    for (var i = 0; i < fd; i++) html += '<div class="cal-day empty"></div>';
    for (var d = 1; d <= dm; d++) {
      var dt = new Date(state.year, state.month, d); dt.setHours(0,0,0,0);
      var ds = state.year + "-" + (state.month + 1) + "-" + d;
      var cls = "cal-day current-month";
      var clickAttr = "";
      if (dt.getTime() === now.getTime()) cls += " today";
      if (dt < now) {
        cls += " unavailable";
      } else {
        cls += " available";
        clickAttr = ' onclick="selectSectionDate(\'' + prefix + '\',\'' + ds + '\')"';
      }
      if (state.selected === ds) {
        cls = cls.replace(" unavailable","").replace(" available","") + " selected";
        clickAttr = ' onclick="selectSectionDate(\'' + prefix + '\',\'' + ds + '\')"';
      }
      html += '<div class="' + cls + '"' + clickAttr + '>' + d + '</div>';
    }
    html += '</div>';

    html +=
      '<div class="cal-legend">' +
        '<div class="cal-legend-item"><div class="cal-legend-dot avail"></div> Available</div>' +
        '<div class="cal-legend-item"><div class="cal-legend-dot sel"></div> Selected</div>' +
        '<div class="cal-legend-item"><div class="cal-legend-dot unav"></div> Unavailable</div>' +
      '</div>';

    if (state.selected) {
      var p2 = state.selected.split("-");
      var dobj = new Date(parseInt(p2[0]), parseInt(p2[1]) - 1, parseInt(p2[2]));
      html +=
        '<div class="cal-selected-display show">' +
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

  window.onServiceChangeSection = function (prefix) {
    var sk = (document.getElementById(prefix + "-servicio") || {}).value || "";
    var fechaEl = document.getElementById(prefix + "-fecha");
    if (fechaEl) fechaEl.value = "";

    createSectionDimensionFields(prefix, sk);

    if (!sk) {
      var ph = document.getElementById("cal-placeholder-" + prefix);
      var ct = document.getElementById("cal-content-" + prefix);
      if (ph) ph.classList.remove("hidden");
      if (ct) ct.classList.add("hidden");
      return;
    }

    var now = new Date();
    sectionCals[prefix] = { month: now.getMonth(), year: now.getFullYear(), selected: null };

    var placeholder = document.getElementById("cal-placeholder-" + prefix);
    if (placeholder) placeholder.classList.add("hidden");
    renderSectionCalendar(prefix);
  };

  function getPriceFromSelectOption(prefix) {
    var select = document.getElementById(prefix + "-servicio");
    if (!select) return null;
    var selectedOption = select.options[select.selectedIndex];
    if (!selectedOption) return null;
    var text = selectedOption.text;
    var match = text.match(/[—\-–]\s*([\$]?[\d,]+(?:\s*GYD\/sq\s*ft)?)/i);
    if (match) {
      var pricePart = match[1];
      if (pricePart.toLowerCase().includes("sq ft")) {
        var numMatch = pricePart.match(/\d+/);
        if (numMatch) return "sqft:" + numMatch[0];
      }
      return pricePart;
    }
    return null;
  }

  function ensureSuccessPanel(prefix) {
    var panelId = "success-panel-" + prefix;
    var existing = document.getElementById(panelId);
    if (existing) return existing;
    var formSection = document.getElementById("form-" + prefix);
    if (!formSection) return null;
    var panel = document.createElement("div");
    panel.id = panelId;
    panel.className = "booking-success-panel";
    panel.style.display = "none";
    formSection.parentNode.insertBefore(panel, formSection.nextSibling);
    return panel;
  }

  function showSuccessPanel(prefix, payload) {
    var formSection = document.getElementById("form-" + prefix);
    var panel = ensureSuccessPanel(prefix);
    if (!formSection || !panel) return;

    formSection.classList.remove("open");
    let amountValue = null;
    if (payload.sqft && payload.sqft > 0) {
      const rate = getSqftRate(payload.servicioKey);
      if (rate) amountValue = payload.sqft * rate;
    }
    if (amountValue === null) {
      amountValue = parsePrice(payload.precio);
    }
    const displayPrice = formatGYD(amountValue || 0);
    payload.numericPrice = amountValue || 0;

    panel.innerHTML = `
      <div style="text-align:center; background:#ffffff; border-radius:24px; padding:2rem; margin:1.5rem 0; box-shadow:0 8px 24px rgba(0,0,0,0.05); border:1px solid var(--cream-border,#eae2d6);">
        <div style="font-size:3rem; margin-bottom:0.5rem;">✅</div>
        <h3 style="color:#1e7c3a; margin:0 0 0.5rem;">Booking Request Sent!</h3>
        <p style="color:#555;">Your booking has been recorded. Complete payment below to confirm.</p>
        <div style="background:#f8f6f0; border-radius:16px; padding:1rem; margin:1.5rem 0; text-align:left;">
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;"><strong>Service:</strong> <span>${escapeHtml(payload.servicio)}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;"><strong>Date:</strong> <span>${payload.fecha}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;"><strong>Address:</strong> <span>${escapeHtml(payload.direccion)}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;"><strong>Amount:</strong> <span style="font-weight:700;">${displayPrice} GYD</span></div>
          ${payload.sqft ? `<div style="display:flex; justify-content:space-between;"><strong>Area:</strong> <span>${payload.sqft.toFixed(2)} sq ft</span></div>` : ''}
        </div>
        <button id="mmg-pay-btn-${prefix}" class="btn-mmg" style="background:#1e7c3a; color:white; border:none; padding:0.8rem 2rem; border-radius:40px; font-weight:600; cursor:pointer; width:100%; margin-bottom:0.8rem; transition:background 0.2s;" onmouseover="this.style.background='#155d2e'" onmouseout="this.style.background='#1e7c3a'">
          💳 Pay via MMG — ${displayPrice}
        </button>
        <button id="new-booking-btn-${prefix}" class="btn-secondary" style="background:transparent; border:1px solid #ccc; padding:0.7rem 1.5rem; border-radius:40px; cursor:pointer;">
          + New Booking
        </button>
      </div>
    `;
    panel.style.display = "block";

    var payBtn = document.getElementById(`mmg-pay-btn-${prefix}`);
    if (payBtn) {
      payBtn.addEventListener("click", function() {
        currentActivePrefix = prefix;
        openMMGModal(payload);
      });
    }
    var newBtn = document.getElementById(`new-booking-btn-${prefix}`);
    if (newBtn) {
      newBtn.addEventListener("click", function() {
        var form = formSection;
        form.querySelectorAll("input, select, textarea").forEach(field => {
          if (field.type !== "button" && field.type !== "submit" && field.id !== prefix + "-servicio") {
            field.value = "";
          }
        });
        var selectEl = document.getElementById(prefix + "-servicio");
        if (selectEl) selectEl.value = "";
        var fechaEl = document.getElementById(prefix + "-fecha");
        if (fechaEl) fechaEl.value = "";
        if (sectionCals[prefix]) {
          sectionCals[prefix].selected = null;
          renderSectionCalendar(prefix);
        }
        var dimContainer = document.getElementById(`dim-${prefix}`);
        if (dimContainer) dimContainer.innerHTML = "";
        panel.style.display = "none";
        formSection.classList.add("open");
        formSection.scrollIntoView({ behavior: "smooth", block: "start" });
        lastBookingPayload = null;
        currentActivePrefix = null;
      });
    }
  }

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

    var sd = servicesData[sk];
    if (!sd) {
      var fallbackPrice = getPriceFromSelectOption(prefix);
      sd = { name: sk, price: fallbackPrice || "Quote on visit", category: formCategory };
      if (fallbackPrice && fallbackPrice.toString().startsWith("sqft:")) {
        var rate = parseFloat(fallbackPrice.split(":")[1]);
        sd.isSqft = true;
        sd.rate = rate;
        sd.price = "sqft:" + rate;
      }
    }

    var finalPrice = sd.price;
    var sqftValue  = null;

    if (isSqftService(sk) || (sd.isSqft === true)) {
      var lEl = document.getElementById("length-" + prefix);
      var wEl = document.getElementById("width-"  + prefix);
      var l = parseFloat(lEl ? lEl.value : 0);
      var w = parseFloat(wEl ? wEl.value : 0);
      if (!l || !w || l <= 0 || w <= 0) {
        showToast("Please enter valid Length and Width in feet.", "error"); return;
      }
      sqftValue  = l * w;
      var rate = sd.rate || getSqftRate(sk);
      if (rate) {
        var totalPrice = sqftValue * rate;
        finalPrice = formatGYD(totalPrice);
      } else {
        finalPrice = "Quote on visit";
      }
    } else {
      if (typeof finalPrice === "string" && !finalPrice.startsWith("$") && !finalPrice.toLowerCase().includes("sqft")) {
        finalPrice = "$" + finalPrice;
      }
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

    if (typeof gtag === "function") {
      gtag("event", "conversion", {
        send_to: "AW-18135400951/f7l_CPb7v6YcEPeD0cdD",
        value: 1.0, currency: "USD", transaction_id: payload.timestamp,
      });
    }

    showSuccessPanel(prefix, payload);
    showToast("Booking saved! Complete payment via MMG to confirm.", "success", 5000);
    lastBookingPayload = payload;
    currentActivePrefix = prefix;

    if (btn) { btn.disabled = false; if (btnSpan) { btnSpan.innerHTML = '<i class="fas fa-paper-plane"></i> Book ' + formCategory; } }
  };

  // ════════════════════════════════════════════════════════════════════════
  //  FUNCIONES DE MMG (EXACTAMENTE IGUAL QUE EN app.js)
  // ════════════════════════════════════════════════════════════════════════

  function openMMGModal(bookingPayload) {
    if (!bookingPayload) return;
    let amount = bookingPayload.numericPrice;
    if (amount === undefined || amount === null) {
      amount = parsePrice(bookingPayload.precio);
    }
    if ((amount === null || amount === 0) && bookingPayload.sqft) {
      const rate = getSqftRate(bookingPayload.servicioKey);
      if (rate) amount = bookingPayload.sqft * rate;
    }
    if (amount === null || amount === 0) {
      showToast("Cannot process payment: amount is zero or invalid. Please contact support.", "error");
      return;
    }
    document.getElementById("mmgService").textContent = bookingPayload.servicio;
    document.getElementById("mmgTotal").textContent = formatGYD(amount) + " GYD";
    var phone = bookingPayload.telefono.replace(/\+592\s?/, "").replace(/\s/g, "");
    document.getElementById("mmgPhone").value = phone;
    document.getElementById("mmgSuccess").classList.add("hidden");
    document.getElementById("mmgError").classList.add("hidden");
    document.querySelector(".mmg-modal-body").classList.remove("hidden");
    document.getElementById("mmgConfirmPay").classList.remove("hidden");
    document.querySelector(".mmg-secure").classList.remove("hidden");
    document.getElementById("mmgOverlay").classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeMMGModal() {
    document.getElementById("mmgOverlay").classList.remove("active");
    document.body.style.overflow = "";
  }

  async function processMMGPayment() {
    if (!lastBookingPayload) return;
    var phoneInput = document.getElementById("mmgPhone");
    var phone = phoneInput.value.trim().replace(/\s/g, "");
    if (!phone || phone.length < 6) {
      phoneInput.classList.add("field-error");
      showToast("Please enter a valid MMG wallet number.", "error");
      return;
    }
    phoneInput.classList.remove("field-error");

    let amountValue = lastBookingPayload.numericPrice;
    if (amountValue === undefined || amountValue === null) {
      amountValue = parsePrice(lastBookingPayload.precio);
    }
    if ((amountValue === null || amountValue === 0) && lastBookingPayload.sqft) {
      const rate = getSqftRate(lastBookingPayload.servicioKey);
      if (rate) amountValue = lastBookingPayload.sqft * rate;
    }
    if (amountValue === null || amountValue === 0) {
      showToast("Invalid payment amount.", "error");
      return;
    }

    var payBtn = document.getElementById("mmgConfirmPay");
    var payText = document.getElementById("mmgPayText");
    var paySpinner = document.getElementById("mmgPaySpinner");
    payBtn.disabled = true;
    payText.classList.add("hidden");
    paySpinner.classList.remove("hidden");

    try {
      var response = await fetch(CONFIG.MMG_CHECKOUT_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre:    lastBookingPayload.nombre,
          email:     lastBookingPayload.email,
          telefono:  phone,
          servicio:  lastBookingPayload.servicio,
          precio:    formatGYD(amountValue),
          fecha:     lastBookingPayload.fecha,
          direccion: lastBookingPayload.direccion,
          categoria: lastBookingPayload.categoria,
          sqft:      lastBookingPayload.sqft
        })
      });

      if (!response.ok) throw new Error("Error generating payment URL");
      var data = await response.json();
      if (!data.checkoutUrl) throw new Error("No checkout URL received");

      sessionStorage.setItem("mmg_pending_email", lastBookingPayload.email);
      closeMMGModal();
      showToast("Redirecting to MMG payment page...", "info", 3000);
      setTimeout(function() { window.location.href = data.checkoutUrl; }, 800);
    } catch (err) {
      console.error("MMG Checkout Error:", err);
      document.querySelector(".mmg-modal-body").classList.add("hidden");
      document.getElementById("mmgConfirmPay").classList.add("hidden");
      document.querySelector(".mmg-secure").classList.add("hidden");
      document.getElementById("mmgError").classList.remove("hidden");
      document.getElementById("mmgErrorMsg").textContent = err.message || "Something went wrong. Please try again.";
    } finally {
      payBtn.disabled = false;
      payText.classList.remove("hidden");
      paySpinner.classList.add("hidden");
    }
  }

  function resetMMGModal() {
    document.getElementById("mmgError").classList.add("hidden");
    document.querySelector(".mmg-modal-body").classList.remove("hidden");
    document.getElementById("mmgConfirmPay").classList.remove("hidden");
    document.querySelector(".mmg-secure").classList.remove("hidden");
  }

  async function handleMMGReturn() {
    var params = new URLSearchParams(window.location.search);
    var token = params.get("TOKEN") || params.get("token") || params.get("mmg_token");
    if (!token) return;

    window.history.replaceState({}, document.title, window.location.pathname);
    showToast("Processing your payment...", "info", 5000);

    try {
      var res = await fetch(CONFIG.MMG_VERIFY_WEBHOOK + "?TOKEN=" + encodeURIComponent(token));
      var data = await res.json();
      var isSuccess = data.isSuccess === true || data.statusCode === "CONFIRMED" ||
                      (Array.isArray(data) && data[0] && (data[0]["statusCode "] === "CONFIRMED" || data[0].statusCode === "CONFIRMED"));
      var isCancelled = data.isCancelledByUser === true || data.resultCode === "6" || data.statusCode === "CANCELLED";
      var pendingEmail = sessionStorage.getItem("mmg_pending_email");
      sessionStorage.removeItem("mmg_pending_email");
      if (isSuccess) {
        showToast("✓ Payment confirmed! Your booking is now confirmed.", "success", 7000);
        if (pendingEmail) setTimeout(function() { loadBookingsFromSheets(pendingEmail); }, 1500);
      } else if (isCancelled) {
        showToast("Payment was cancelled. You can try again from your booking.", "error", 7000);
        if (pendingEmail) setTimeout(function() { loadBookingsFromSheets(pendingEmail); }, 1500);
      } else {
        showToast("Payment could not be completed. Please try again.", "error", 7000);
        if (pendingEmail) setTimeout(function() { loadBookingsFromSheets(pendingEmail); }, 1500);
      }
    } catch (err) {
      console.error("MMG verify error:", err);
      showToast("Could not verify payment. Please check your booking status.", "error", 6000);
    }
  }

  async function loadBookingsFromSheets(email) {
    try {
      var url = CONFIG.GET_BOOKINGS_WEBHOOK;
      if (email) url += "?email=" + encodeURIComponent(email);
      await fetch(url);
    } catch (err) {}
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  //  INICIALIZACIÓN
  // ════════════════════════════════════════════════════════════════════════

  function init() {
    handleMMGReturn();

    var bp = document.getElementById("btnPayMMG");
    if (bp) bp.addEventListener("click", function() { if (lastBookingPayload) openMMGModal(lastBookingPayload); });
    var mc = document.getElementById("mmgCloseBtn");
    if (mc) mc.addEventListener("click", closeMMGModal);
    var mo = document.getElementById("mmgOverlay");
    if (mo) mo.addEventListener("click", function(e) { if (e.target === e.currentTarget) closeMMGModal(); });
    var mcp = document.getElementById("mmgConfirmPay");
    if (mcp) mcp.addEventListener("click", function(e) { e.preventDefault(); processMMGPayment(); });
    var md = document.getElementById("mmgDoneBtn");
    if (md) md.addEventListener("click", closeMMGModal);
    var mr = document.getElementById("mmgRetryBtn");
    if (mr) mr.addEventListener("click", resetMMGModal);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
