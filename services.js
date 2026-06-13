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
    // Puedes agregar más servicios existentes aquí si los necesitas
  };

  function isSqftService(key) { return !!(servicesData[key] && servicesData[key].isSqft); }
  function isRoomBasedService(key) { return !!(servicesData[key] && servicesData[key].isRoomBased); }
  function isPerSideService(key) { return !!(servicesData[key] && servicesData[key].isPerSide); }
  function getSqftRate(key) { return servicesData[key] ? servicesData[key].rate : null; }
  function calculateSqftPrice(key, l, w) { var r = getSqftRate(key); return r ? l * w * r : null; }
  function parsePrice(priceStr) { if (!priceStr) return null; if (typeof priceStr === "number") return priceStr; var cleaned = priceStr.replace(/[^0-9.]/g, ""); var num = parseFloat(cleaned); return isNaN(num) ? null : num; }
  function formatGYD(amount) { if (amount === null || isNaN(amount)) return "$0"; return "$" + Number(amount).toLocaleString("en-US", { minimumFractionDigits: 0 }); }
  function showToast(msg, type, duration) { var t = document.getElementById("toast"); if (!t) return; t.textContent = msg; t.className = "toast show " + (type || "info"); setTimeout(function () { t.classList.remove("show"); }, duration || 4000); }

  // Estado global para MMG
  let lastBookingPayload = null;
  let currentActivePrefix = null;

  // ================= TOGGLE FORM =================
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

  // ================= CREAR CAMPOS DINÁMICOS =================
  function createSectionFields(prefix, serviceKey) {
    var dimId = "dim-" + prefix, roomsId = "rooms-" + prefix, sidesId = "sides-" + prefix;
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
      container.innerHTML = '<div style="display:flex;gap:1rem;flex-wrap:wrap;"><div><label>Length (ft)</label><input type="number" id="length-' + prefix + '" step="0.01"></div><div><label>Width (ft)</label><input type="number" id="width-' + prefix + '" step="0.01"></div><div><div>Total: <span id="sqft-total-' + prefix + '">$0</span></div><small>Rate: ' + rate + ' GYD/sq ft</small></div></div>';
      var lenInput = document.getElementById('length-' + prefix);
      var widInput = document.getElementById('width-' + prefix);
      var totalSpan = document.getElementById('sqft-total-' + prefix);
      function updateTotal() {
        var l = parseFloat(lenInput?.value) || 0;
        var w = parseFloat(widInput?.value) || 0;
        if (l > 0 && w > 0) totalSpan.innerText = formatGYD(calculateSqftPrice(serviceKey, l, w));
        else totalSpan.innerText = formatGYD(0);
      }
      if (lenInput) lenInput.addEventListener('input', updateTotal);
      if (widInput) widInput.addEventListener('input', updateTotal);
    }
  }

  // ================= CALENDARIO POR SECCIÓN =================
  window['sectionCals'] = window['sectionCals'] || {};

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
    var html = '<div class="cal-header"><button type="button" onclick="sectionCalPrev(\'' + prefix + '\')"><i class="fas fa-chevron-left"></i></button><h4>' + mn[state.month] + ' ' + state.year + '</h4><button type="button" onclick="sectionCalNext(\'' + prefix + '\')"><i class="fas fa-chevron-right"></i></button></div><div class="cal-grid">';
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

  // ================= CAMBIO DE SERVICIO =================
  window.onServiceChangeSection = function (prefix) {
    var select = document.getElementById(prefix + "-servicio");
    var sk = select ? select.value : "";
    var fechaInput = document.getElementById(prefix + "-fecha");
    if (fechaInput) fechaInput.value = "";
    // Limpiar campos previos
    var dimDiv = document.getElementById("dim-" + prefix); if (dimDiv) dimDiv.innerHTML = "";
    var roomsDiv = document.getElementById("rooms-" + prefix); if (roomsDiv) roomsDiv.innerHTML = "";
    var sidesDiv = document.getElementById("sides-" + prefix); if (sidesDiv) sidesDiv.innerHTML = "";
    createSectionFields(prefix, sk);
    if (!sk) {
      var placeholder = document.getElementById("cal-placeholder-" + prefix);
      var contentDiv = document.getElementById("cal-content-" + prefix);
      if (placeholder) placeholder.classList.remove("hidden");
      if (contentDiv) contentDiv.classList.add("hidden");
      return;
    }
    var now = new Date();
    window['sectionCals'][prefix] = { month: now.getMonth(), year: now.getFullYear(), selected: null };
    var placeholder = document.getElementById("cal-placeholder-" + prefix);
    if (placeholder) placeholder.classList.add("hidden");
    renderSectionCalendar(prefix);
  };

  // ================= MOSTRAR PANEL DE ÉXITO CON MMG =================
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
    // Calcular monto numérico
    let amountValue = payload.numericPrice;
    if (!amountValue && payload.sqft) {
      var rate = getSqftRate(payload.servicioKey);
      if (rate) amountValue = payload.sqft * rate;
    }
    if (!amountValue && payload.rooms) {
      var total = 0;
      for (var r in payload.rooms) total += payload.rooms[r].subtotal;
      amountValue = total;
    }
    if (!amountValue && payload.sides) {
      var service = servicesData[payload.servicioKey];
      if (service && service.isPerSide) amountValue = payload.sides * service.ratePerSide;
    }
    if (!amountValue) amountValue = parsePrice(payload.precio);
    const displayPrice = formatGYD(amountValue || 0);
    payload.numericPrice = amountValue || 0;
    lastBookingPayload = payload;
    window.lastBookingPayloadForMMG = payload; // para onclick global

    panel.innerHTML = `
      <div style="text-align:center; background:#ffffff; border-radius:24px; padding:2rem; margin:1.5rem 0; box-shadow:0 8px 24px rgba(0,0,0,0.05); border:1px solid #eae2d6;">
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
        <button class="btn-mmg" style="background:#1e7c3a; color:white; border:none; padding:0.8rem 2rem; border-radius:40px; font-weight:600; cursor:pointer; width:100%; margin-bottom:0.8rem;" 
                onclick="window.openMMGModal(window.lastBookingPayloadForMMG)">
          💳 Pay via MMG — ${displayPrice}
        </button>
        <button class="btn-secondary" style="background:transparent; border:1px solid #ccc; padding:0.7rem 1.5rem; border-radius:40px; cursor:pointer;" 
                onclick="window.resetBookingPanel('${prefix}')">
          + New Booking
        </button>
      </div>
    `;
    panel.style.display = "block";
  }

  // Función para resetear el panel (global)
  window.resetBookingPanel = function(prefix) {
    var formSection = document.getElementById("form-" + prefix);
    var panel = document.getElementById("success-panel-" + prefix);
    if (formSection) {
      formSection.querySelectorAll("input, select, textarea").forEach(field => {
        if (field.type !== "button" && field.type !== "submit" && field.id !== prefix + "-servicio") {
          field.value = "";
        }
      });
      var selectEl = document.getElementById(prefix + "-servicio");
      if (selectEl) selectEl.value = "";
      var fechaEl = document.getElementById(prefix + "-fecha");
      if (fechaEl) fechaEl.value = "";
      if (window['sectionCals'][prefix]) {
        window['sectionCals'][prefix].selected = null;
        renderSectionCalendar(prefix);
      }
      var dimDiv = document.getElementById("dim-" + prefix); if (dimDiv) dimDiv.innerHTML = "";
      var roomsDiv = document.getElementById("rooms-" + prefix); if (roomsDiv) roomsDiv.innerHTML = "";
      var sidesDiv = document.getElementById("sides-" + prefix); if (sidesDiv) sidesDiv.innerHTML = "";
    }
    if (panel) panel.style.display = "none";
    if (formSection) formSection.classList.add("open");
    if (formSection) formSection.scrollIntoView({ behavior: "smooth", block: "start" });
    lastBookingPayload = null;
    window.lastBookingPayloadForMMG = null;
  };

  // ================= FUNCIONES MMG =================
  window.openMMGModal = function(bookingPayload) {
    console.log("openMMGModal called", bookingPayload);
    if (!bookingPayload) {
      showToast("No booking data. Please try again.", "error");
      return;
    }
    let amount = bookingPayload.numericPrice;
    if (!amount || amount === 0) {
      amount = parsePrice(bookingPayload.precio);
      if ((!amount || amount === 0) && bookingPayload.sqft) {
        const rate = getSqftRate(bookingPayload.servicioKey);
        if (rate) amount = bookingPayload.sqft * rate;
      }
      if ((!amount || amount === 0) && bookingPayload.rooms) {
        let total = 0;
        for (const r of Object.values(bookingPayload.rooms)) total += r.subtotal;
        amount = total;
      }
      if ((!amount || amount === 0) && bookingPayload.sides) {
        const service = servicesData[bookingPayload.servicioKey];
        if (service && service.isPerSide) amount = bookingPayload.sides * service.ratePerSide;
      }
    }
    if (!amount || amount === 0) {
      showToast("Invalid payment amount.", "error");
      return;
    }
    const mmgServiceSpan = document.getElementById("mmgService");
    const mmgTotalSpan = document.getElementById("mmgTotal");
    const mmgPhoneInput = document.getElementById("mmgPhone");
    if (!mmgServiceSpan || !mmgTotalSpan || !mmgPhoneInput) {
      showToast("MMG modal elements not found. Please refresh.", "error");
      return;
    }
    mmgServiceSpan.textContent = bookingPayload.servicio;
    mmgTotalSpan.textContent = formatGYD(amount) + " GYD";
    let phone = (bookingPayload.telefono || "").replace(/\+592\s?/g, "").replace(/\s/g, "");
    mmgPhoneInput.value = phone;
    document.getElementById("mmgSuccess")?.classList.add("hidden");
    document.getElementById("mmgError")?.classList.add("hidden");
    document.querySelector(".mmg-modal-body")?.classList.remove("hidden");
    document.getElementById("mmgConfirmPay")?.classList.remove("hidden");
    document.querySelector(".mmg-secure")?.classList.remove("hidden");
    document.getElementById("mmgOverlay")?.classList.add("active");
    document.body.style.overflow = "hidden";
    window._mmgCurrentAmount = amount;
  };

  window.processMMGPayment = async function() {
    const phoneInput = document.getElementById("mmgPhone");
    let phone = phoneInput?.value.trim().replace(/\s/g, "") || "";
    if (!phone || phone.length < 6) {
      if (phoneInput) phoneInput.classList.add("field-error");
      showToast("Enter a valid MMG wallet number (without +592).", "error");
      return;
    }
    if (phoneInput) phoneInput.classList.remove("field-error");
    if (!lastBookingPayload) {
      showToast("No booking data. Please reload and try again.", "error");
      return;
    }
    let amountValue = window._mmgCurrentAmount;
    if (!amountValue || amountValue === 0) {
      showToast("Invalid payment amount.", "error");
      return;
    }
    const payBtn = document.getElementById("mmgConfirmPay");
    const payText = document.getElementById("mmgPayText");
    const paySpinner = document.getElementById("mmgPaySpinner");
    if (payBtn) payBtn.disabled = true;
    if (payText) payText.classList.add("hidden");
    if (paySpinner) paySpinner.classList.remove("hidden");

    try {
      const response = await fetch(CONFIG.MMG_CHECKOUT_WEBHOOK, {
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
          sqft:      lastBookingPayload.sqft,
          rooms:     lastBookingPayload.rooms,
          sides:     lastBookingPayload.sides
        })
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const data = await response.json();
      if (!data.checkoutUrl) throw new Error("No checkout URL received");
      sessionStorage.setItem("mmg_pending_email", lastBookingPayload.email);
      closeMMGModal();
      showToast("Redirecting to MMG payment page...", "info", 3000);
      setTimeout(() => { window.location.href = data.checkoutUrl; }, 800);
    } catch (err) {
      console.error("MMG Checkout Error:", err);
      const modalBody = document.querySelector(".mmg-modal-body");
      const confirmBtn = document.getElementById("mmgConfirmPay");
      const secureDiv = document.querySelector(".mmg-secure");
      const errorDiv = document.getElementById("mmgError");
      const errorMsg = document.getElementById("mmgErrorMsg");
      if (modalBody) modalBody.classList.add("hidden");
      if (confirmBtn) confirmBtn.classList.add("hidden");
      if (secureDiv) secureDiv.classList.add("hidden");
      if (errorDiv) errorDiv.classList.remove("hidden");
      if (errorMsg) errorMsg.textContent = err.message || "Something went wrong. Please try again.";
    } finally {
      if (payBtn) payBtn.disabled = false;
      if (payText) payText.classList.remove("hidden");
      if (paySpinner) paySpinner.classList.add("hidden");
    }
  };

  function closeMMGModal() {
    const overlay = document.getElementById("mmgOverlay");
    if (overlay) overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  function resetMMGModal() {
    document.getElementById("mmgError")?.classList.add("hidden");
    document.querySelector(".mmg-modal-body")?.classList.remove("hidden");
    document.getElementById("mmgConfirmPay")?.classList.remove("hidden");
    document.querySelector(".mmg-secure")?.classList.remove("hidden");
  }

  async function handleMMGReturn() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("TOKEN") || params.get("token") || params.get("mmg_token");
    if (!token) return;
    window.history.replaceState({}, document.title, window.location.pathname);
    showToast("Processing payment...", "info", 5000);
    try {
      const res = await fetch(CONFIG.MMG_VERIFY_WEBHOOK + "?TOKEN=" + encodeURIComponent(token));
      const data = await res.json();
      const isSuccess = data.isSuccess === true || data.statusCode === "CONFIRMED" ||
                        (Array.isArray(data) && data[0] && (data[0]["statusCode "] === "CONFIRMED" || data[0].statusCode === "CONFIRMED"));
      const isCancelled = data.isCancelledByUser === true || data.resultCode === "6" || data.statusCode === "CANCELLED";
      const pendingEmail = sessionStorage.getItem("mmg_pending_email");
      sessionStorage.removeItem("mmg_pending_email");
      if (isSuccess) {
        showToast("✓ Payment confirmed! Your booking is confirmed.", "success", 7000);
        if (pendingEmail) loadBookingsFromSheets(pendingEmail);
      } else if (isCancelled) {
        showToast("Payment was cancelled. You can try again.", "error", 7000);
      } else {
        showToast("Payment could not be completed. Please try again.", "error", 7000);
      }
    } catch (err) {
      console.error(err);
      showToast("Could not verify payment. Please check your booking status.", "error", 6000);
    }
  }

  async function loadBookingsFromSheets(email) {
    try {
      let url = CONFIG.GET_BOOKINGS_WEBHOOK;
      if (email) url += "?email=" + encodeURIComponent(email);
      await fetch(url);
    } catch(e) {}
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

  // ================= SUBMIT FORM PRINCIPAL =================
  window.submitForm = async function(prefix, category) {
    var nombre = document.getElementById(prefix + "-nombre")?.value.trim();
    var email = document.getElementById(prefix + "-email")?.value.trim();
    var telefono = document.getElementById(prefix + "-telefono")?.value.trim();
    var sk = document.getElementById(prefix + "-servicio")?.value;
    var fecha = document.getElementById(prefix + "-fecha")?.value;
    var direccion = document.getElementById(prefix + "-direccion")?.value.trim();
    var notas = document.getElementById(prefix + "-notas")?.value.trim();
    if (!nombre || !email || !telefono || !sk || !fecha || !direccion) {
      showToast("Please fill all required fields.", "error");
      return;
    }

    var sd = servicesData[sk] || { name: sk, price: "Quote on visit", category: category };
    var finalPrice = sd.price;
    var sqftValue = null, roomsData = null, sidesValue = null;

    if (isRoomBasedService(sk)) {
      var service = servicesData[sk];
      var total = 0;
      roomsData = {};
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
      if (l <= 0 || w <= 0) {
        showToast("Please enter valid Length and Width in feet.", "error");
        return;
      }
      sqftValue = l * w;
      var rate = getSqftRate(sk);
      var total = sqftValue * rate;
      finalPrice = formatGYD(total);
    }

    var payload = {
      nombre, email, telefono, servicioKey: sk, servicio: sd.name, categoria: sd.category || category,
      precio: finalPrice, fecha, direccion, notas, sqft: sqftValue, rooms: roomsData, sides: sidesValue,
      timestamp: new Date().toISOString(), source: "standardhomecleaning.html"
    };
    try {
      await fetch(CONFIG.WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } catch(e) { console.error(e); }
    showToast("Booking saved! Complete payment via MMG to confirm.", "success", 5000);
    showSuccessPanel(prefix, payload);
  };

  // ================= INICIALIZACIÓN =================
  function init() {
    handleMMGReturn();
    // Vincular eventos del modal
    const closeBtn = document.getElementById("mmgCloseBtn");
    if (closeBtn) closeBtn.addEventListener("click", closeMMGModal);
    const overlay = document.getElementById("mmgOverlay");
    if (overlay) overlay.addEventListener("click", function(e) { if (e.target === overlay) closeMMGModal(); });
    const confirmBtn = document.getElementById("mmgConfirmPay");
    if (confirmBtn) confirmBtn.addEventListener("click", function(e) { e.preventDefault(); window.processMMGPayment(); });
    const doneBtn = document.getElementById("mmgDoneBtn");
    if (doneBtn) doneBtn.addEventListener("click", closeMMGModal);
    const retryBtn = document.getElementById("mmgRetryBtn");
    if (retryBtn) retryBtn.addEventListener("click", resetMMGModal);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  console.log("services.js loaded successfully with MMG modal support");
})();
