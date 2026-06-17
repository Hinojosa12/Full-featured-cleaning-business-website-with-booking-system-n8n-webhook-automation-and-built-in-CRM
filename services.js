(function () {
  "use strict";

  const CONFIG = {
    WEBHOOK_URL: "https://n8n-n8n.7toway.easypanel.host/webhook/0e6a220e-8739-4db7-9770-cd6f4a4c35f4",
    MMG_CHECKOUT_WEBHOOK: "https://n8n-n8n.7toway.easypanel.host/webhook/mmg-generate-checkout",
    MMG_VERIFY_WEBHOOK:   "https://n8n-n8n.7toway.easypanel.host/webhook/mmg-verify-payment",
    GET_BOOKINGS_WEBHOOK: "https://n8n-n8n.7toway.easypanel.host/webhook/get-bookings",
  };

  const servicesData = {
    "general-home-cleaning": {
      name: "General Home Cleaning", price: "variable", category: "General Home Cleaning",
      isRoomBased: true,
      rooms: {
        bedroom:    { name: "Bedroom",          rate: 7500  },
        livingroom: { name: "Living Room",       rate: 12000 },
        kitchen:    { name: "Kitchen",           rate: 9000  },
        bathroom:   { name: "Bathroom & Toilet", rate: 12000 },
      }
    },
    "office-cleaning-sqft": { name: "Office Cleaning", price: "sqft:80",  category: "Office Cleaning",     isSqft: true, rate: 80,  minPrice: 10000 },
    "office-chairs":        { name: "Office Chairs",                             price: "$2,500",   category: "Office Cleaning" },
    "carpet-uninstalled":   { name: "Carpet Steam Cleaning",                    price: "sqft:115", category: "Carpet Cleaning", isSqft: true, rate: 115 },
    "carpet-deep-cleaning": { name: "Deep Cleaning (Pressure washing, shampooing and steam)", price: "sqft:220", category: "Carpet Cleaning", isSqft: true, rate: 220 },
    "pressure-driveway":    { name: "Driveway & Pressure Washing",               price: "sqft:50",  category: "Pressure Washing",    isSqft: true, rate: 50  },
    "mattress-cleaning-per-side": { name: "Mattress Cleaning (per side)", price: "side:3500", category: "Mattress Cleaning", isPerSide: true, ratePerSide: 3500 },
    "sofa-l":    { name: "L Shaped Sofa", price: "$16,000", category: "Steam Cleaning" },
    "sofa-321":  { name: "3+2+1 Suite",   price: "$24,000", category: "Steam Cleaning" },
    "sofa-311":  { name: "3+1+1 Suite",   price: "$20,000", category: "Steam Cleaning" },
    "sofa-32":   { name: "3+2 Suite",     price: "$20,000", category: "Steam Cleaning" },
    "deep-floor":    { name: "Floor Polishing",      price: "sqft:95", category: "Deep Cleaning", isSqft: true, rate: 95 },
    "deep-sofa1":    { name: "1 seat Sofa",          price: "$6,000", category: "Deep Cleaning" },
    "deep-sofa2":    { name: "2 seat Sofa",          price: "$10,000",category: "Deep Cleaning" },
    "deep-sofa3":    { name: "3 seat Sofa",          price: "$14,000",category: "Deep Cleaning" },
    "deep-suite211": { name: "2+1+1 Suite",          price: "$16,000",category: "Deep Cleaning" },
    "deep-ottoman":  { name: "Ottoman",              price: "$5,000", category: "Deep Cleaning" },
    "deep-dining":   { name: "Dinning Chairs",       price: "$2,000", category: "Deep Cleaning" },
    "deep-king":     { name: "King Size Mattress",   price: "$12,000/side", category: "Deep Cleaning", isPerSide: true, ratePerSide: 12000 },
    "deep-queen":    { name: "Queen Size Mattress",  price: "$10,000/side", category: "Deep Cleaning", isPerSide: true, ratePerSide: 10000 },
    "deep-double":   { name: "Double Size Mattress", price: "$10,000/side", category: "Deep Cleaning", isPerSide: true, ratePerSide: 10000 },
    "deep-single":   { name: "Single Mattress",      price: "$8,000/side",  category: "Deep Cleaning", isPerSide: true, ratePerSide: 8000  },
    "deep-reclS":    { name: "Recliner Single",      price: "$6,000", category: "Deep Cleaning" },
    "deep-reclJ":    { name: "Recliner Joined",      price: "$10,000",category: "Deep Cleaning" },
    "deep-carpet":   { name: "Carpet Cleaning",      price: "$16,000",category: "Deep Cleaning" },
  };

  // ── HELPERS ──────────────────────────────────────────────────────────────
  function isSqftService(sk)      { return !!(servicesData[sk] && servicesData[sk].isSqft); }
  function isRoomBasedService(sk) { return !!(servicesData[sk] && servicesData[sk].isRoomBased); }
  function isPerSideService(sk)   { return !!(servicesData[sk] && servicesData[sk].isPerSide); }
  function getSqftRate(sk)        { return servicesData[sk] ? (servicesData[sk].rate || null) : null; }
  function getSqftMin(sk)         { return servicesData[sk] ? (servicesData[sk].minPrice || 0) : 0; }
  function calcSqft(sk, l, w)     { var r = getSqftRate(sk); return r ? Math.max(l * w * r, getSqftMin(sk)) : 0; }
  function parseNum(p)            { if (!p) return 0; if (typeof p === "number") return p; var n = parseFloat(p.replace(/[^0-9.]/g, "")); return isNaN(n) ? 0 : n; }
  function fmt(a)                 { return "$" + Number(a || 0).toLocaleString("en-US", { minimumFractionDigits: 0 }); }
  function esc(s)                 { return (s || "").replace(/[&<>"']/g, function(m){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]; }); }
  function toast(m, t, d)         { var e = document.getElementById("toast"); if (!e) return; e.textContent = m; e.className = "toast show " + (t||"info"); setTimeout(function(){ e.classList.remove("show"); }, d||4000); }
  function $id(id)                { return document.getElementById(id); }

  // ── STATE ─────────────────────────────────────────────────────────────────
  var lastPayload = null;
  var sectionCals = {};
  var roomQtys = {};   // { prefix: { bedroom: 0, ... } }

  // ── EXPOSE openMMGModal globally so success panel can call it ─────────────
  window._lv_openMMG = function(payload) { openMMGModal(payload); };

  // ── TOGGLE FORM ───────────────────────────────────────────────────────────
  window.toggleForm = function(formId) {
    var form = $id(formId); if (!form) return;
    var isOpen = form.classList.contains("open");
    document.querySelectorAll(".form-section").forEach(function(f){ f.classList.remove("open"); });
    if (!isOpen) {
      form.classList.add("open");
      setTimeout(function(){ form.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
    }
  };

  // ── ROOM BUILDER ──────────────────────────────────────────────────────────
  window.rbChange = function(prefix, key, delta) {
    if (!roomQtys[prefix]) roomQtys[prefix] = {};
    roomQtys[prefix][key] = Math.max(0, (roomQtys[prefix][key] || 0) + delta);
    var sk = ($id(prefix + "-servicio") || {}).value || "";
    var svc = servicesData[sk]; if (!svc || !svc.rooms || !svc.rooms[key]) return;
    var qty = roomQtys[prefix][key], rate = svc.rooms[key].rate;
    var qEl = $id("rb-q-" + prefix + "-" + key);
    var sEl = $id("rb-s-" + prefix + "-" + key);
    var tEl = $id("rb-t-" + prefix);
    if (qEl) qEl.textContent = qty;
    if (sEl) sEl.textContent = fmt(qty * rate);
    var grand = 0;
    for (var rk in svc.rooms) grand += (roomQtys[prefix][rk] || 0) * svc.rooms[rk].rate;
    if (tEl) tEl.textContent = fmt(grand);
  };

  function buildRoomHTML(prefix, sk) {
    var svc = servicesData[sk]; if (!svc || !svc.rooms) return "";
    roomQtys[prefix] = {};
    for (var rk in svc.rooms) roomQtys[prefix][rk] = 0;
    var h = '<div style="background:#f8f6f0;border-radius:14px;padding:1.1rem;margin-top:.5rem;">';
    h += '<p style="font-weight:700;color:var(--gold,#886902);margin-bottom:.9rem;font-size:.82rem;letter-spacing:.05em;text-transform:uppercase;">Select rooms & quantities:</p>';
    h += '<div style="display:flex;flex-direction:column;gap:.55rem;">';
    for (var k in svc.rooms) {
      var r = svc.rooms[k];
      h += '<div style="display:flex;align-items:center;gap:.7rem;background:white;border-radius:9px;padding:.55rem .9rem;border:1px solid #eae2d6;">';
      h += '<span style="flex:1;font-weight:600;font-size:.85rem;">' + r.name + '</span>';
      h += '<span style="color:#5b6e73;font-size:.76rem;white-space:nowrap;">' + fmt(r.rate) + '/each</span>';
      h += '<div style="display:flex;align-items:center;gap:.35rem;">';
      h += '<button type="button" onclick="rbChange(\'' + prefix + '\',\'' + k + '\',-1)" style="width:26px;height:26px;border-radius:50%;border:1.5px solid var(--gold,#886902);background:white;color:var(--gold,#886902);font-weight:700;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;">−</button>';
      h += '<span id="rb-q-' + prefix + '-' + k + '" style="min-width:22px;text-align:center;font-weight:700;">0</span>';
      h += '<button type="button" onclick="rbChange(\'' + prefix + '\',\'' + k + '\',1)" style="width:26px;height:26px;border-radius:50%;border:1.5px solid var(--gold,#886902);background:var(--gold,#886902);color:white;font-weight:700;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;">+</button>';
      h += '</div>';
      h += '<span id="rb-s-' + prefix + '-' + k + '" style="min-width:62px;text-align:right;font-weight:700;font-size:.85rem;">$0</span>';
      h += '</div>';
    }
    h += '</div>';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:.9rem;padding-top:.7rem;border-top:2px solid #eae2d6;">';
    h += '<span style="font-weight:700;">Total</span>';
    h += '<span id="rb-t-' + prefix + '" style="font-weight:800;font-size:1rem;color:var(--gold,#886902);">$0</span>';
    h += '</div></div>';
    return h;
  }

  // ── SECTION SPECIAL FIELDS ────────────────────────────────────────────────
  function buildSpecialFields(prefix, sk) {
    // Clear existing
    ["dim-", "sides-", "rooms-"].forEach(function(p) { var el = $id(p + prefix); if (el) el.innerHTML = ""; });
    if (!sk) return;

    function getOrCreate(id) {
      var el = $id(id); if (el) return el;
      var sel = $id(prefix + "-servicio"); if (!sel) return null;
      var sg = sel.closest(".fg"); if (!sg) return null;
      var d = document.createElement("div");
      d.id = id; d.className = "fg span2"; d.style.marginTop = ".5rem";
      sg.parentNode.insertBefore(d, sg.nextSibling);
      return d;
    }

    if (isRoomBasedService(sk)) {
      var c = getOrCreate("rooms-" + prefix); if (c) c.innerHTML = buildRoomHTML(prefix, sk);

    } else if (isSqftService(sk)) {
      var c = getOrCreate("dim-" + prefix); if (!c) return;
      var rate = getSqftRate(sk), minP = getSqftMin(sk);
      var rLbl = rate + " GYD/sq ft" + (minP > 0 ? " (min " + fmt(minP) + ")" : "");
      c.innerHTML =
        '<div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-end;background:#f8f6f0;border-radius:12px;padding:.9rem;">' +
          '<div style="flex:1;min-width:110px;"><label><i class="fas fa-arrows-alt-h"></i> Length (feet) *</label>' +
          '<input type="number" id="len-' + prefix + '" step="0.01" min="0.1" placeholder="e.g., 10.5"></div>' +
          '<div style="flex:1;min-width:110px;"><label><i class="fas fa-arrows-alt-v"></i> Width (feet) *</label>' +
          '<input type="number" id="wid-' + prefix + '" step="0.01" min="0.1" placeholder="e.g., 8.2"></div>' +
          '<div style="flex:0 0 auto;"><div style="background:white;padding:.45rem .9rem;border-radius:40px;font-weight:700;border:1px solid #eae2d6;">Total: <span id="st-' + prefix + '">$0</span></div>' +
          '<small style="font-size:.7rem;color:#5b6e73;">Rate: ' + rLbl + '</small></div></div>';
      var lI = $id("len-" + prefix), wI = $id("wid-" + prefix), tS = $id("st-" + prefix);
      function upd() { if (tS) tS.textContent = (parseFloat(lI&&lI.value)||0) > 0 && (parseFloat(wI&&wI.value)||0) > 0 ? fmt(calcSqft(sk, parseFloat(lI.value), parseFloat(wI.value))) : "$0"; }
      if (lI) lI.addEventListener("input", upd);
      if (wI) wI.addEventListener("input", upd);

    } else if (isPerSideService(sk)) {
      var c = getOrCreate("sides-" + prefix); if (!c) return;
      var pps = (servicesData[sk] || {}).ratePerSide || 0;
      c.innerHTML =
        '<div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;background:#f8f6f0;border-radius:12px;padding:.9rem;">' +
          '<div style="flex:1;min-width:150px;"><label style="font-size:.72rem;font-weight:700;color:#5b6e73;text-transform:uppercase;display:block;margin-bottom:4px;"><i class="fas fa-layer-group" style="color:var(--gold,#886902);margin-right:4px;"></i> Number of Sides *</label>' +
          '<input type="number" id="sds-' + prefix + '" min="1" max="20" value="1" placeholder="e.g., 2"></div>' +
          '<div style="flex:0 0 auto;"><div style="background:white;padding:.45rem .9rem;border-radius:40px;font-weight:700;border:1px solid #eae2d6;">Total: <span id="sdt-' + prefix + '">' + fmt(pps) + '</span></div>' +
          '<small style="font-size:.7rem;color:#5b6e73;">' + fmt(pps) + ' per side</small></div></div>';
      var sI = $id("sds-" + prefix), sT = $id("sdt-" + prefix);
      if (sI) sI.addEventListener("input", function(){ if (sT) sT.textContent = fmt((parseInt(sI.value)||1) * pps); });
    }
  }

  // ── CALENDAR ──────────────────────────────────────────────────────────────
  function renderCal(prefix) {
    var st = sectionCals[prefix]; if (!st) return;
    var cd = $id("cal-content-" + prefix); if (!cd) return;
    var mn = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    var dn = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    var now = new Date(); now.setHours(0,0,0,0);
    var fd = new Date(st.year, st.month, 1).getDay(), dm = new Date(st.year, st.month + 1, 0).getDate();
    var h = '<div class="cal-header"><div class="cal-nav"><button type="button" onclick="calPrev(\'' + prefix + '\')"><i class="fas fa-chevron-left"></i></button></div>' +
            '<h4>' + mn[st.month] + ' ' + st.year + '</h4>' +
            '<div class="cal-nav"><button type="button" onclick="calNext(\'' + prefix + '\')"><i class="fas fa-chevron-right"></i></button></div></div><div class="cal-grid">';
    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(function(d){ h += '<div class="cal-label">' + d + '</div>'; });
    for (var i = 0; i < fd; i++) h += '<div class="cal-day empty"></div>';
    for (var d = 1; d <= dm; d++) {
      var dt = new Date(st.year, st.month, d); dt.setHours(0,0,0,0);
      var ds = st.year + "-" + (st.month + 1) + "-" + d;
      var cls = "cal-day current-month", click = "";
      if (dt.getTime() === now.getTime()) cls += " today";
      if (dt < now) { cls += " unavailable"; }
      else { cls += " available"; click = ' onclick="selDate(\'' + prefix + '\',\'' + ds + '\')"'; }
      if (st.selected === ds) { cls = cls.replace("unavailable","").replace("available","") + " selected"; click = ' onclick="selDate(\'' + prefix + '\',\'' + ds + '\')"'; }
      h += '<div class="' + cls + '"' + click + '>' + d + '</div>';
    }
    h += '</div><div class="cal-legend"><div class="cal-legend-item"><div class="cal-legend-dot avail"></div> Available</div><div class="cal-legend-item"><div class="cal-legend-dot sel"></div> Selected</div><div class="cal-legend-item"><div class="cal-legend-dot unav"></div> Unavailable</div></div>';
    if (st.selected) {
      var p2 = st.selected.split("-"), dobj = new Date(parseInt(p2[0]), parseInt(p2[1])-1, parseInt(p2[2]));
      h += '<div class="cal-selected-display show"><i class="fas fa-check-circle"></i><span>' + dn[dobj.getDay()] + ', ' + mn[dobj.getMonth()] + ' ' + p2[2] + ', ' + p2[0] + '</span></div>';
    }
    cd.innerHTML = h; cd.classList.remove("hidden");
  }

  window.selDate = function(prefix, ds) {
    if (!sectionCals[prefix]) return;
    sectionCals[prefix].selected = ds;
    var p = ds.split("-"), iso = p[0] + "-" + p[1].padStart(2,"0") + "-" + p[2].padStart(2,"0");
    var fel = $id(prefix + "-fecha"); if (fel) fel.value = iso;
    renderCal(prefix);
  };
  window.calPrev = function(prefix) {
    if (!sectionCals[prefix]) return;
    sectionCals[prefix].month--; if (sectionCals[prefix].month < 0) { sectionCals[prefix].month = 11; sectionCals[prefix].year--; }
    renderCal(prefix);
  };
  window.calNext = function(prefix) {
    if (!sectionCals[prefix]) return;
    sectionCals[prefix].month++; if (sectionCals[prefix].month > 11) { sectionCals[prefix].month = 0; sectionCals[prefix].year++; }
    renderCal(prefix);
  };

  window.onServiceChangeSection = function(prefix) {
    var sk = ($id(prefix + "-servicio") || {}).value || "";
    var fel = $id(prefix + "-fecha"); if (fel) fel.value = "";
    buildSpecialFields(prefix, sk);
    var ph = $id("cal-placeholder-" + prefix), ct = $id("cal-content-" + prefix);
    if (!sk) { if (ph) ph.classList.remove("hidden"); if (ct) ct.classList.add("hidden"); return; }
    var now = new Date(); sectionCals[prefix] = { month: now.getMonth(), year: now.getFullYear(), selected: null };
    if (ph) ph.classList.add("hidden");
    renderCal(prefix);
  };

  // ── SUBMIT FORM ───────────────────────────────────────────────────────────
  window.submitForm = async function(prefix, formCategory) {
    var btn = $id("btn-" + prefix);
    var btnSpan = btn ? btn.querySelector("span") : null;

    // Enable button cleanup always
    function resetBtn() {
      if (btn) btn.disabled = false;
      if (btnSpan) btnSpan.innerHTML = 'Book ' + formCategory;
    }

    try {
      var nombre    = ($id(prefix + "-nombre")    || {}).value || "";
      var email     = ($id(prefix + "-email")     || {}).value || "";
      var telefono  = ($id(prefix + "-telefono")  || {}).value || "";
      var sk        = ($id(prefix + "-servicio")  || {}).value || "";
      var fecha     = ($id(prefix + "-fecha")     || {}).value || "";
      var direccion = ($id(prefix + "-direccion") || {}).value || "";
      var notas     = ($id(prefix + "-notas")     || {}).value || "";

      nombre = nombre.trim(); email = email.trim(); telefono = telefono.trim(); direccion = direccion.trim(); notas = notas.trim();

      // Validation
      if (!nombre || !email || !telefono || !fecha || !direccion) {
        toast("Please fill in all required fields.", "error"); return;
      }
      if (!sk) { toast("Please select a service.", "error"); return; }

      // Disable button while processing
      if (btn) btn.disabled = true;
      if (btnSpan) btnSpan.textContent = "Sending...";

      var sd = servicesData[sk] || { name: sk, price: "Quote on visit", category: formCategory };
      var finalPrice = sd.price || "Quote on visit";
      var numericAmount = 0, sqftValue = null, sidesValue = null, roomsData = null, serviceName = sd.name || sk;

      if (isRoomBasedService(sk)) {
        var svc = servicesData[sk], qtys = roomQtys[prefix] || {};
        var total = 0; roomsData = {}; var parts = [];
        for (var rk in svc.rooms) {
          var qty = qtys[rk] || 0;
          roomsData[rk] = { name: svc.rooms[rk].name, quantity: qty, rate: svc.rooms[rk].rate, subtotal: qty * svc.rooms[rk].rate };
          total += qty * svc.rooms[rk].rate;
          if (qty > 0) parts.push(qty + "x " + svc.rooms[rk].name);
        }
        if (total === 0) { toast("Please add at least one room.", "error"); resetBtn(); return; }
        numericAmount = total; finalPrice = fmt(total);
        serviceName = "General Home Cleaning (" + parts.join(", ") + ")";

      } else if (isSqftService(sk)) {
        var lEl = $id("len-" + prefix), wEl = $id("wid-" + prefix);
        var l = parseFloat(lEl ? lEl.value : 0) || 0, w = parseFloat(wEl ? wEl.value : 0) || 0;
        if (l <= 0 || w <= 0) { toast("Please enter valid Length and Width in feet.", "error"); resetBtn(); return; }
        sqftValue = l * w; numericAmount = calcSqft(sk, l, w); finalPrice = fmt(numericAmount);

      } else if (isPerSideService(sk)) {
        var sEl = $id("sds-" + prefix);
        var sides = parseInt(sEl ? sEl.value : 1) || 1;
        if (sides < 1) { toast("Please enter a valid number of sides.", "error"); resetBtn(); return; }
        sidesValue = sides; numericAmount = sides * (sd.ratePerSide || 0); finalPrice = fmt(numericAmount);
        serviceName = sd.name + " (" + sides + " side" + (sides > 1 ? "s" : "") + ")";

      } else {
        numericAmount = parseNum(finalPrice);
      }

      var payload = {
        nombre: nombre, email: email, telefono: telefono,
        servicioKey: sk, servicio: serviceName, categoria: sd.category || formCategory,
        precio: finalPrice, numericAmount: numericAmount,
        fechaHora: fecha + "T09:00", fecha: fecha, horario: "09:00",
        direccion: direccion, notas: notas,
        sqft: sqftValue, sides: sidesValue, rooms: roomsData,
        timestamp: new Date().toISOString(), source: "standardhomecleaning.html"
      };

      // Send webhook (non-blocking)
      fetch(CONFIG.WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .catch(function(err){ console.error("Webhook error:", err); });

      if (typeof gtag === "function") {
        gtag("event", "conversion", { send_to: "AW-18135400951/f7l_CPb7v6YcEPeD0cdD", value: 1.0, currency: "USD", transaction_id: payload.timestamp });
      }

      lastPayload = payload;
      showSuccess(prefix, payload);
      toast("Booking submitted! Pay via MMG to confirm.", "success", 5000);

    } catch (err) {
      console.error("submitForm error:", err);
      toast("An error occurred. Please try again.", "error");
    } finally {
      resetBtn();
    }
  };

  // ── SUCCESS PANEL — mismo flujo que index.html ────────────────────────────
  function showSuccess(prefix, p) {
    var formSection = $id("form-" + prefix);
    // Keep form-section open (it's the container) but hide the form fields inside
    if (formSection) {
      formSection.classList.add("open");
      var inner = formSection.querySelector(".form-grid-2");
      var h3    = formSection.querySelector("h3");
      var btn   = $id("btn-" + prefix);
      var ru    = $id("rooms-" + prefix);
      var di    = $id("dim-" + prefix);
      var si    = $id("sides-" + prefix);
      if (inner) inner.style.display = "none";
      if (h3)    h3.style.display    = "none";
      if (btn)   btn.style.display   = "none";
      if (ru)    ru.style.display    = "none";
      if (di)    di.style.display    = "none";
      if (si)    si.style.display    = "none";
    }

    var sd = $id("success-" + prefix);
    if (!sd) return;

    var hasMMG = (p.numericAmount > 0);

    // Extra detail row (rooms / sides / sqft)
    var extraRow = "";
    if (p.rooms) {
      var parts = [];
      for (var rk in p.rooms) { if (p.rooms[rk].quantity > 0) parts.push(p.rooms[rk].quantity + "x " + p.rooms[rk].name); }
      if (parts.length) extraRow = '<div class="receipt-row"><span>Rooms</span><span>' + esc(parts.join(", ")) + '</span></div>';
    } else if (p.sides) {
      extraRow = '<div class="receipt-row"><span>Sides</span><span>' + p.sides + '</span></div>';
    } else if (p.sqft) {
      extraRow = '<div class="receipt-row"><span>Area</span><span>' + p.sqft.toFixed(2) + ' sq ft</span></div>';
    }

    sd.innerHTML =
      '<div class="confirm-panel" style="margin-top:1.5rem;">' +
        '<div class="confirm-icon">📨</div>' +
        '<div>' +
          '<div class="section-tag">Booking Sent</div>' +
          '<h2 class="section-title" style="font-size:1.6rem;">Request Sent!</h2>' +
          '<p style="color:var(--muted);max-width:420px;margin:.5rem auto 0;font-size:.9rem;">Our team will confirm via WhatsApp within minutes.</p>' +
        '</div>' +
        '<div class="wa-box">' +
          '<strong style="font-size:.85rem;">📱 Confirmation to:</strong><br>' +
          '<span style="font-size:1.05rem;color:var(--gold);font-weight:700;">' + esc(p.telefono) + '</span>' +
        '</div>' +
        '<div class="receipt">' +
          '<div class="receipt-row"><span>Customer</span><span>' + esc(p.nombre) + '</span></div>' +
          '<div class="receipt-row"><span>Service</span><span>' + esc(p.servicio) + '</span></div>' +
          '<div class="receipt-row"><span>Date</span><span>' + esc(p.fecha) + '</span></div>' +
          '<div class="receipt-row"><span>Address</span><span>' + esc(p.direccion) + '</span></div>' +
          extraRow +
          '<div class="receipt-row"><span>Amount</span><span class="receipt-amount">' + esc(p.precio) + '</span></div>' +
          '<div class="receipt-row"><span>Status</span><span class="pill-pend">⏳ Pending</span></div>' +
        '</div>' +
        '<div class="badge-row">' +
          '<span class="badge">📱 WhatsApp sent</span>' +
          '<span class="badge">📊 Saved in CRM</span>' +
          '<span class="badge">📅 Calendar check</span>' +
        '</div>' +
        '<div class="confirm-actions">' +
          '<button class="btn-gold" onclick="resetSection(\'' + prefix + '\')" style="display:inline-flex;align-items:center;gap:.4rem;">' +
            '<i class="fas fa-plus"></i> New Booking' +
          '</button>' +
          (hasMMG
            ? '<button class="btn-mmg" onclick="window._lv_openMMG(window._lv_lastPayload)">' +
                '<span class="mmg-btn-inner">' +
                  '<span class="mmg-icon-wrap"><i class="fas fa-wallet"></i></span>' +
                  '<span class="mmg-btn-text">' +
                    '<span class="mmg-label">Pay via MMG</span>' +
                    '<span class="mmg-amount">' + esc(p.precio) + '</span>' +
                  '</span>' +
                '</span>' +
              '</button>'
            : '<button class="btn-mmg mmg-disabled" disabled>' +
                '<span class="mmg-btn-inner">' +
                  '<span class="mmg-icon-wrap"><i class="fas fa-wallet"></i></span>' +
                  '<span class="mmg-btn-text">' +
                    '<span class="mmg-label">Pay via MMG</span>' +
                    '<span class="mmg-amount">Quote required</span>' +
                  '</span>' +
                '</span>' +
              '</button>'
          ) +
        '</div>' +
      '</div>';

    sd.classList.add("show");
    sd.scrollIntoView({ behavior: "smooth", block: "start" });

    // Store payload globally so the inline onclick can access it
    window._lv_lastPayload = p;
  }

  window.resetSection = function(prefix) {
    var sd = $id("success-" + prefix);
    if (sd) { sd.innerHTML = ""; sd.classList.remove("show"); }
    var form = $id("form-" + prefix);
    if (form) {
      form.querySelectorAll("input:not([type=hidden]), select, textarea").forEach(function(f){ f.value = ""; });
      var fel = $id(prefix + "-fecha"); if (fel) fel.value = "";
      // Restore hidden form elements
      var inner = form.querySelector(".form-grid-2");
      var h3    = form.querySelector("h3");
      var btn   = $id("btn-" + prefix);
      if (inner) inner.style.display = "";
      if (h3)    h3.style.display    = "";
      if (btn)   btn.style.display   = "";
      form.classList.add("open");
      setTimeout(function(){ form.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
    }
    if (sectionCals[prefix]) sectionCals[prefix].selected = null;
    var ct = $id("cal-content-" + prefix); if (ct) ct.classList.add("hidden");
    var ph = $id("cal-placeholder-" + prefix); if (ph) ph.classList.remove("hidden");
    ["dim-", "sides-", "rooms-"].forEach(function(p){ var el = $id(p + prefix); if (el) el.innerHTML = ""; });
    if (roomQtys[prefix]) roomQtys[prefix] = {};
    lastPayload = null;
    window._lv_lastPayload = null;
  };

  // ── MMG MODAL ─────────────────────────────────────────────────────────────
  function openMMGModal(p) {
    if (!p) { toast("No booking data. Please try again.", "error"); return; }
    var amount = p.numericAmount || parseNum(p.precio) || 0;
    if (!amount) { toast("Cannot process: amount is zero.", "error"); return; }

    $id("mmgService").textContent = p.servicio;
    $id("mmgTotal").textContent = fmt(amount) + " GYD";
    var phone = (p.telefono || "").replace(/\+592\s?/g, "").replace(/\s/g, "");
    $id("mmgPhone").value = phone;
    $id("mmgSuccess").classList.add("hidden");
    $id("mmgError").classList.add("hidden");
    document.querySelector(".mmg-modal-body").classList.remove("hidden");
    $id("mmgConfirmPay").classList.remove("hidden");
    document.querySelector(".mmg-secure").classList.remove("hidden");
    $id("mmgOverlay").classList.add("active");
    document.body.style.overflow = "hidden";
    window._mmgAmount = amount;
    lastPayload = p;
  }

  function closeMMGModal() {
    var ov = $id("mmgOverlay"); if (ov) ov.classList.remove("active");
    document.body.style.overflow = "";
  }

  function resetMMGModal() {
    $id("mmgError").classList.add("hidden");
    document.querySelector(".mmg-modal-body").classList.remove("hidden");
    $id("mmgConfirmPay").classList.remove("hidden");
    document.querySelector(".mmg-secure").classList.remove("hidden");
  }

  async function processMMGPayment() {
    var phoneInput = $id("mmgPhone"), phone = phoneInput ? phoneInput.value.trim().replace(/\s/g, "") : "";
    if (!phone || phone.length < 6) {
      if (phoneInput) phoneInput.classList.add("field-error");
      toast("Enter a valid MMG wallet number (without +592).", "error"); return;
    }
    if (phoneInput) phoneInput.classList.remove("field-error");
    if (!lastPayload) { toast("No booking data. Please try again.", "error"); return; }

    var amount = window._mmgAmount || lastPayload.numericAmount || parseNum(lastPayload.precio) || 0;
    if (!amount) { toast("Invalid payment amount.", "error"); return; }

    var payBtn = $id("mmgConfirmPay"), payText = $id("mmgPayText"), paySpinner = $id("mmgPaySpinner");
    if (payBtn) payBtn.disabled = true;
    if (payText) payText.classList.add("hidden");
    if (paySpinner) paySpinner.classList.remove("hidden");

    try {
      var res = await fetch(CONFIG.MMG_CHECKOUT_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: lastPayload.nombre, email: lastPayload.email, telefono: phone,
          servicio: lastPayload.servicio, precio: fmt(amount),
          fecha: lastPayload.fecha, direccion: lastPayload.direccion,
          categoria: lastPayload.categoria, sqft: lastPayload.sqft,
          rooms: lastPayload.rooms, sides: lastPayload.sides
        })
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      var data = await res.json();
      if (!data.checkoutUrl) throw new Error("No checkout URL received");
      sessionStorage.setItem("mmg_pending_email", lastPayload.email);
      closeMMGModal();
      toast("Redirecting to MMG payment page...", "info", 3000);
      setTimeout(function(){ window.location.href = data.checkoutUrl; }, 800);
    } catch (err) {
      console.error("MMG error:", err);
      document.querySelector(".mmg-modal-body").classList.add("hidden");
      $id("mmgConfirmPay").classList.add("hidden");
      document.querySelector(".mmg-secure").classList.add("hidden");
      $id("mmgError").classList.remove("hidden");
      $id("mmgErrorMsg").textContent = err.message || "Something went wrong. Please try again.";
    } finally {
      if (payBtn) payBtn.disabled = false;
      if (payText) payText.classList.remove("hidden");
      if (paySpinner) paySpinner.classList.add("hidden");
    }
  }

  async function handleMMGReturn() {
    var params = new URLSearchParams(window.location.search);
    var token = params.get("TOKEN") || params.get("token") || params.get("mmg_token");
    if (!token) return;
    window.history.replaceState({}, document.title, window.location.pathname);
    toast("Processing payment...", "info", 5000);
    try {
      var res = await fetch(CONFIG.MMG_VERIFY_WEBHOOK + "?TOKEN=" + encodeURIComponent(token));
      var data = await res.json();
      var ok = data.isSuccess === true || data.statusCode === "CONFIRMED" ||
                (Array.isArray(data) && data[0] && (data[0]["statusCode "] === "CONFIRMED" || data[0].statusCode === "CONFIRMED"));
      var cancelled = data.isCancelledByUser === true || data.resultCode === "6" || data.statusCode === "CANCELLED";
      sessionStorage.removeItem("mmg_pending_email");
      if (ok) toast("✓ Payment confirmed! Your booking is confirmed.", "success", 7000);
      else if (cancelled) toast("Payment was cancelled.", "error", 7000);
      else toast("Payment could not be completed. Please try again.", "error", 7000);
    } catch(err) { console.error(err); toast("Could not verify payment.", "error", 6000); }
  }

  // ── INIT ──────────────────────────────────────────────────────────────────
  function init() {
    handleMMGReturn();
    var mc = $id("mmgCloseBtn");  if (mc)  mc.addEventListener("click", closeMMGModal);
    var mo = $id("mmgOverlay");   if (mo)  mo.addEventListener("click", function(e){ if (e.target === mo) closeMMGModal(); });
    var mcp = $id("mmgConfirmPay"); if (mcp) mcp.addEventListener("click", function(e){ e.preventDefault(); processMMGPayment(); });
    var md = $id("mmgDoneBtn");   if (md)  md.addEventListener("click", closeMMGModal);
    var mr = $id("mmgRetryBtn");  if (mr)  mr.addEventListener("click", resetMMGModal);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

})();
