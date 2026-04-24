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
    "sofa-1seat":        { name: "1 Seat Sofa",                              price: "$6,000",        category: "Steam Cleaning" },
    "sofa-2seat":        { name: "2 Seat Sofa",                              price: "$10,000",       category: "Steam Cleaning" },
    "sofa-3seat":        { name: "3 Seat Sofa",                              price: "$14,000",       category: "Steam Cleaning" },
    "l-shaped":          { name: "L-Shaped Sofa",                            price: "$16,000",       category: "Steam Cleaning" },
    "suite-321":         { name: "3-2-1 Suite",                              price: "$24,000",       category: "Steam Cleaning" },
    "suite-311":         { name: "3-1-1 Suite",                              price: "$20,000",       category: "Steam Cleaning" },
    "recliners":         { name: "Single Recliner",                          price: "$6,000",        category: "Steam Cleaning" },
    "recliners-joined":  { name: "Joined Recliners",                         price: "$10,000",       category: "Steam Cleaning" },
    "mattress-king":     { name: "King Mattress + 2 Pillows",                price: "$10,000",       category: "Steam Cleaning" },
    "mattress-queen":    { name: "Queen Mattress + 2 Pillows",               price: "$8,000",        category: "Steam Cleaning" },
    "car":               { name: "Car Interior (with mats)",                 price: "$12,000",       category: "Steam Cleaning" },
    "suv":               { name: "SUV Interior (with mats)",                 price: "$16,000",       category: "Steam Cleaning" },
    "office-chairs":     { name: "Office Chair",                             price: "$2,500/each",   category: "Steam Cleaning" },
    "dining-chairs":     { name: "Dining Chair",                             price: "$2,000/each",   category: "Steam Cleaning" },
    "carpet-uninstalled":{ name: "Carpet (uninstalled)",                     price: "$115/sq ft",    category: "Carpet Cleaning" },
    "carpet-installed":  { name: "Carpet (installed)",                       price: "$95/sq ft",     category: "Carpet Cleaning" },
    "pressure-driveway": { name: "Pressure Washing - Driveway & Walkway",    price: "$30/sq ft",     category: "Pressure Washing" },
    "pressure-patio":    { name: "Pressure Washing - Patio/Terrace",         price: "$30/sq ft",     category: "Pressure Washing" },
    "pressure-building": { name: "Pressure Washing - Building Exterior",     price: "$30/sq ft",     category: "Pressure Washing" },
    "pressure-fence":    { name: "Pressure Washing - Fence Cleaning",        price: "$30/sq ft",     category: "Pressure Washing" },
    "pressure-parking":  { name: "Pressure Washing - Parking Lot",           price: "$30/sq ft",     category: "Pressure Washing" },
    "residential-1bed":  { name: "Residential - 1 Bedroom Apartment",        price: "Quote on visit",category: "Residential Cleaning" },
    "residential-2bed":  { name: "Residential - 2 Bedroom House",            price: "Quote on visit",category: "Residential Cleaning" },
    "residential-3bed":  { name: "Residential - 3 Bedroom House",            price: "Quote on visit",category: "Residential Cleaning" },
    "residential-general":{ name: "Residential - General Home Cleaning",     price: "Quote on visit",category: "Residential Cleaning" },
    "residential-onetime":{ name: "Residential - One-Time Refresh",          price: "Quote on visit",category: "Residential Cleaning" },
    "deep-1bed":         { name: "Deep Clean - 1 Bedroom",                   price: "Quote on visit",category: "Deep Cleaning" },
    "deep-2bed":         { name: "Deep Clean - 2 Bedrooms",                  price: "Quote on visit",category: "Deep Cleaning" },
    "deep-3bed":         { name: "Deep Clean - 3 Bedrooms",                  price: "Quote on visit",category: "Deep Cleaning" },
    "deep-4bed":         { name: "Deep Clean - 4+ Bedrooms",                 price: "Quote on visit",category: "Deep Cleaning" },
    "commercial-small":  { name: "Commercial - Small Office (up to 500 sq ft)",   price: "Quote on visit",category: "Commercial Cleaning" },
    "commercial-medium": { name: "Commercial - Medium Office (500-1,500 sq ft)",  price: "Quote on visit",category: "Commercial Cleaning" },
    "commercial-large":  { name: "Commercial - Large Office (1,500+ sq ft)",      price: "Quote on visit",category: "Commercial Cleaning" },
    "commercial-retail": { name: "Commercial - Retail Store",                price: "Quote on visit",category: "Commercial Cleaning" },
    "commercial-warehouse":{ name: "Commercial - Warehouse/Industrial",      price: "Quote on visit",category: "Commercial Cleaning" },
    "movein-1bed":       { name: "Move-In/Out - 1 Bedroom Apartment",        price: "Quote on visit",category: "Move In/Out" },
    "movein-2bed":       { name: "Move-In/Out - 2 Bedroom House",            price: "Quote on visit",category: "Move In/Out" },
    "movein-3bed":       { name: "Move-In/Out - 3 Bedroom House",            price: "Quote on visit",category: "Move In/Out" },
    "movein-4bed":       { name: "Move-In/Out - 4+ Bedroom House",           price: "Quote on visit",category: "Move In/Out" },
  };

  const availableDates = {
    "Steam Cleaning":       ["2026-4-28","2026-4-29","2026-4-30","2026-4-28","2026-4-29","2026-4-30"],
    "Carpet Cleaning":      ["2026-4-28","2026-4-29","2026-4-30","2026-4-28","2026-4-29","2026-4-30"],
    "Pressure Washing":     ["2026-4-28","2026-4-29","2026-4-30"],
    "Residential Cleaning": ["2026-4-28","2026-4-29","2026-4-30"],
    "Deep Cleaning":        ["2026-4-28","2026-4-29","2026-4-30"],
    "Commercial Cleaning":  ["2026-4-28","2026-4-29","2026-4-30"],
    "Move In/Out":          ["2026-4-28","2026-4-29","2026-4-30"],
  };

  let bookings = [];
  let countersStarted = false, submitting = false;
  let calMonth, calYear, selectedDate = null, currentCategory = null;
  let lastBookingPayload = null;

  // ══════════════════════════════════════════════════════════════════════════
  //  LIVITY UI — Custom Select Dropdown + Visual Enhancements
  //  (No existing logic was modified — only added below this block)
  // ══════════════════════════════════════════════════════════════════════════
  var _lvSet = (typeof WeakSet !== "undefined") ? new WeakSet() : null;

  function LvSelect(native) {
    var self = this;
    this.native = native;
    this.isOpen = false;

    // Wrap the native select
    this.wrap = document.createElement("div");
    this.wrap.className = "lv-select-wrapper";
    native.parentNode.insertBefore(this.wrap, native);
    this.wrap.appendChild(native);
    this.wrap._lv = this;
    native._lv = this;

    // Trigger button
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

    // Dropdown panel
    this.panel = document.createElement("div");
    this.panel.className = "lv-panel";
    this.wrap.appendChild(this.panel);

    // Watch for option changes (handles dynamic populateSelect)
    new MutationObserver(function () { self.rebuild(); })
      .observe(native, { childList: true, subtree: true });

    // Events
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

      var m = opt.text.match(/^(.+?)\s*[—\-–]\s*(.+)$/);
      item.innerHTML = m
        ? '<span class="lv-opt-name">' + m[1].trim() + '</span><span class="lv-opt-badge">' + m[2].trim() + "</span>" + chk
        : '<span class="lv-opt-name">' + opt.text + "</span>" + chk;

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
    // Dispatch change on native → triggers all existing onchange handlers
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
      var m = sel.text.match(/^(.+?)\s*[—\-–]\s*(.+)$/);
      this.valEl.innerHTML = m
        ? '<span class="lv-sel-label">' + m[1].trim() + '</span><span class="lv-sel-badge">' + m[2].trim() + "</span>"
        : '<span class="lv-sel-label">' + sel.text + "</span>";
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

  function initLvProgressBar() {
    var bar = document.createElement("div");
    bar.id = "lv-progress-bar";
    document.body.appendChild(bar);
    window.addEventListener("scroll", function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = max > 0 ? Math.min((window.scrollY / max) * 100, 100) + "%" : "0%";
    }, { passive: true });
  }

  function initLvCursorGlow() {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    var g = document.createElement("div");
    g.className = "lv-cursor-glow";
    document.body.appendChild(g);
    document.addEventListener("mousemove", function (e) {
      g.style.left = e.clientX + "px";
      g.style.top  = e.clientY + "px";
    });
  }

  function initLvRipple() {
    var sel = ".hero-btn,.btn-primary,.btn-gold,.submit-btn,.btn-book,.btn-mmg,.mmg-pay-btn";
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(sel);
      if (!btn) return;
      var c = document.createElement("span");
      c.className = "lv-ripple-circle";
      var r = btn.getBoundingClientRect();
      c.style.left = (e.clientX - r.left) + "px";
      c.style.top  = (e.clientY - r.top)  + "px";
      btn.appendChild(c);
      c.addEventListener("animationend", function () { c.remove(); }, { once: true });
    });
  }

  function initLvParallax() {
    var heroes = document.querySelectorAll(".hero");
    if (!heroes.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    window.addEventListener("scroll", function () {
      var sy = window.scrollY;
      heroes.forEach(function (h) {
        var r = h.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        h.style.backgroundPositionY = "calc(center + " + (sy * 0.22) + "px)";
      });
    }, { passive: true });
  }

  function initLvUI() {
    initLvProgressBar();
    initLvCursorGlow();
    initLvRipple();
    initLvParallax();
    // Selects are initialized after populateSelect() inside init()
  }
  // ══════════════════════════════════════════════════════════════════════════
  //  END LIVITY UI ENHANCEMENTS
  // ══════════════════════════════════════════════════════════════════════════

  // ── HANDLE MMG RETURN ───────────────────────────────────────────────────
  async function handleMMGReturn() {
    var params = new URLSearchParams(window.location.search);
    var token = params.get("TOKEN") || params.get("token") || params.get("mmg_token");
    if (!token) return;

    window.history.replaceState({}, document.title, window.location.pathname);
    showToast("Processing your payment...", "info", 5000);

    try {
      var res = await fetch(CONFIG.MMG_VERIFY_WEBHOOK + "?TOKEN=" + encodeURIComponent(token));
      var data = await res.json();

      var isSuccess = data.isSuccess === true ||
                      data.statusCode === "CONFIRMED" ||
                      (Array.isArray(data) && data[0] && (
                        data[0]["statusCode "] === "CONFIRMED" ||
                        data[0].statusCode === "CONFIRMED"
                      ));

      var isCancelled = data.isCancelledByUser === true ||
                        data.resultCode === "6" ||
                        data.statusCode === "CANCELLED";

      if (isSuccess) {
        showToast("✓ Payment confirmed! Your booking is now confirmed.", "success", 7000);
        var pendingEmail = sessionStorage.getItem("mmg_pending_email");
        sessionStorage.removeItem("mmg_pending_email");
        if (pendingEmail) {
          setTimeout(function() { loadBookingsFromSheets(pendingEmail); }, 1500);
          var crm = document.querySelector(".crm-section");
          if (crm) setTimeout(function(){ crm.scrollIntoView({ behavior: "smooth", block: "start" }); }, 800);
        }
      } else if (isCancelled) {
        showToast("Payment was cancelled. You can try again from your booking.", "error", 7000);
        var cancelEmail = sessionStorage.getItem("mmg_pending_email");
        sessionStorage.removeItem("mmg_pending_email");
        if (cancelEmail) setTimeout(function() { loadBookingsFromSheets(cancelEmail); }, 1500);
      } else {
        showToast("Payment could not be completed. Please try again.", "error", 7000);
        var failEmail = sessionStorage.getItem("mmg_pending_email");
        sessionStorage.removeItem("mmg_pending_email");
        if (failEmail) setTimeout(function() { loadBookingsFromSheets(failEmail); }, 1500);
      }
    } catch (err) {
      console.error("MMG verify error:", err);
      showToast("Could not verify payment. Please check your booking status.", "error", 6000);
    }
  }

  // ── LOAD BOOKINGS FROM GOOGLE SHEETS ────────────────────────────────────
  async function loadBookingsFromSheets(email) {
    try {
      var url = CONFIG.GET_BOOKINGS_WEBHOOK;
      if (email) url += "?email=" + encodeURIComponent(email);
      var res = await fetch(url);
      var data = await res.json();
      var rows = Array.isArray(data) ? data : (data.data || []);
      bookings = rows
        .filter(function(r) { return r["nombre "] || r.nombre; })
        .map(function(r) {
          return {
            nombre:    r["nombre "] || r.nombre || "",
            telefono:  r.telefono || "",
            servicio:  r.servicio || "",
            fecha:     r.fecha || "",
            direccion: r["direccion "] || r.direccion || "",
            status:    (r["statusCode "] || r.statusCode || "pending").toLowerCase()
          };
        })
        .reverse()
        .slice(0, 20);
      renderCRM();
    } catch (err) {
      console.error("Error loading bookings from Sheets:", err);
    }
  }

  function parsePrice(priceStr) {
    if (!priceStr || priceStr.toLowerCase().includes("quote")) return null;
    var cleaned = priceStr.replace(/[^0-9.]/g, "");
    var num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  function formatGYD(amount) {
    return "$" + amount.toLocaleString("en-US", { minimumFractionDigits: 0 });
  }
  function isFixedPrice(priceStr) {
    if (!priceStr) return false;
    return !priceStr.toLowerCase().includes("quote") && !priceStr.includes("/sq ft") && !priceStr.includes("/each");
  }

  function initCalendar() { var now = new Date(); calMonth = now.getMonth(); calYear = now.getFullYear(); }

  function renderCalendar() {
    var grid = document.getElementById("calendarGrid"); if (!grid) return; grid.innerHTML = "";
    var mn = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    document.getElementById("calMonthYear").textContent = mn[calMonth] + " " + calYear;
    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(function(d) { var l = document.createElement("div"); l.className = "calendar-day-label"; l.textContent = d; grid.appendChild(l); });
    var fd = new Date(calYear, calMonth, 1).getDay();
    var dm = new Date(calYear, calMonth + 1, 0).getDate();
    var td = new Date(); td.setHours(0,0,0,0);
    var cd = (currentCategory && availableDates[currentCategory]) || [];
    var as = new Set(cd);
    for (var i = 0; i < fd; i++) { var e = document.createElement("div"); e.className = "calendar-day"; grid.appendChild(e); }
    for (var d = 1; d <= dm; d++) {
      var c = document.createElement("div"); c.className = "calendar-day current-month"; c.textContent = d;
      var dt = new Date(calYear, calMonth, d); dt.setHours(0,0,0,0);
      var ds = calYear + "-" + (calMonth + 1) + "-" + d;
      if (dt.getTime() === td.getTime()) c.classList.add("today");
      if (dt < td) c.classList.add("unavailable");
      else if (as.has(ds)) { c.classList.add("available"); c.addEventListener("click", (function(dd,dds){ return function(){ selectDate(dd,dds); }; })(d,ds)); }
      else c.classList.add("unavailable");
      if (selectedDate === ds) { c.classList.add("selected"); c.classList.remove("unavailable"); }
      grid.appendChild(c);
    }
  }

  function selectDate(day, ds) {
    selectedDate = ds; var p = ds.split("-");
    var iso = p[0] + "-" + p[1].padStart(2,"0") + "-" + p[2].padStart(2,"0");
    document.getElementById("fechaSeleccionada").value = iso;
    var mn = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    var dobj = new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
    var dn = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    document.getElementById("selectedDateText").textContent = dn[dobj.getDay()] + ", " + mn[dobj.getMonth()] + " " + p[2] + ", " + p[0];
    document.getElementById("selectedDateDisplay").classList.add("show");
    renderCalendar();
  }

  function onServiceChange() {
    var sk = document.getElementById("servicio").value;
    var sd = servicesData[sk];
    selectedDate = null; document.getElementById("fechaSeleccionada").value = "";
    document.getElementById("selectedDateDisplay").classList.remove("show");
    if (sd) { currentCategory = sd.category; document.getElementById("calendarPlaceholder").classList.add("hidden"); document.getElementById("calendarContent").classList.remove("hidden"); initCalendar(); renderCalendar(); }
    else { currentCategory = null; document.getElementById("calendarPlaceholder").classList.remove("hidden"); document.getElementById("calendarContent").classList.add("hidden"); }
  }

  function showToast(m, t, d) { t = t || "info"; d = d || 4000; var e = document.getElementById("toast"); if (!e) return; e.textContent = m; e.className = "toast show " + t; setTimeout(function(){ e.classList.remove("show"); }, d); }

  function populateSelect() {
    var s = document.getElementById("servicio"); if (!s) return;
    var c = {};
    for (var k in servicesData) { var d = servicesData[k]; if (!c[d.category]) c[d.category] = []; c[d.category].push(Object.assign({ k: k }, d)); }
    s.innerHTML = '<option value="">— Select a service —</option>';
    for (var cat in c) { var g = document.createElement("optgroup"); g.label = cat; c[cat].forEach(function(i) { var o = document.createElement("option"); o.value = i.k; o.textContent = i.name + " — " + i.price; g.appendChild(o); }); s.appendChild(g); }
    s.addEventListener("change", onServiceChange);
  }

  function clearErrors() { document.querySelectorAll(".field-error").forEach(function(e){ e.classList.remove("field-error"); }); document.querySelectorAll(".error-msg").forEach(function(e){ e.remove(); }); }
  function setError(id, msg) { var el = document.getElementById(id); if (!el) return; el.classList.add("field-error"); var s = document.createElement("span"); s.className = "error-msg"; s.textContent = msg; el.parentNode.appendChild(s); }

  function validateForm() {
    clearErrors(); var v = true;
    var n = document.getElementById("nombre").value.trim();
    var e = document.getElementById("email").value.trim();
    var t = document.getElementById("telefono").value.trim();
    var s = document.getElementById("servicio").value;
    var f = document.getElementById("fechaSeleccionada").value;
    var d = document.getElementById("direccion").value.trim();
    if (!n) { setError("nombre", "Full name is required."); v = false; }
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { setError("email", "Valid email required."); v = false; }
    if (!t || !/^[\+]?[\d\s\-\(\)]{7,15}$/.test(t.replace(/\s/g,""))) { setError("telefono", "Valid phone required."); v = false; }
    if (!s) { setError("servicio", "Please select a service."); v = false; }
    if (!f) { showToast("Please select an available date from the calendar.", "error"); v = false; }
    if (!d) { setError("direccion", "Address is required."); v = false; }
    return v;
  }

  function renderCRM() {
    var tb = document.getElementById("crm-body"); if (!tb) return;
    if (!bookings.length) { tb.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--muted)">No bookings yet.</td></tr>'; return; }
    tb.innerHTML = "";
    bookings.forEach(function(b) {
      var statusLower = (b.status || "pending").toLowerCase();
      var statusBadge;
      if (statusLower === "confirmed") {
        statusBadge = '<span style="background:#e8f5ed;color:#1e7c3a;border:1px solid #a8d8b5;padding:.25rem .9rem;border-radius:20px;font-size:.72rem;font-weight:700;display:inline-flex;align-items:center;gap:.3rem;white-space:nowrap">✓ Confirmed</span>';
      } else if (statusLower === "cancelled") {
        statusBadge = '<span style="background:#fdecea;color:#c0392b;border:1px solid #f5c6cb;padding:.25rem .9rem;border-radius:20px;font-size:.72rem;font-weight:700;display:inline-flex;align-items:center;gap:.3rem;white-space:nowrap">✗ Cancelled</span>';
      } else if (statusLower === "failed") {
        statusBadge = '<span style="background:#fdecea;color:#c0392b;border:1px solid #f5c6cb;padding:.25rem .9rem;border-radius:20px;font-size:.72rem;font-weight:700;display:inline-flex;align-items:center;gap:.3rem;white-space:nowrap">✗ Failed</span>';
      } else {
        statusBadge = '<span style="background:#fff5e6;color:#9a5c00;border:1px solid #ffcc80;padding:.25rem .9rem;border-radius:20px;font-size:.72rem;font-weight:700;display:inline-flex;align-items:center;gap:.3rem;white-space:nowrap">⏳ Pending</span>';
      }
      var r = document.createElement("tr");
      r.innerHTML = '<td><strong>'+b.nombre+'</strong></td><td>'+b.telefono+'</td><td>'+b.servicio+'</td><td>'+b.fecha+'</td><td>'+b.direccion+'</td><td>'+statusBadge+'</td>';
      tb.appendChild(r);
    });
  }

  function setStep(n) {
    for (var i = 1; i <= 3; i++) { var d = document.getElementById("dot" + i); if (!d) continue; if (i < n) { d.className = "step-dot done"; d.textContent = "✓"; } else if (i === n) { d.className = "step-dot active"; d.textContent = i; } else { d.className = "step-dot"; d.textContent = i; } }
    var l1 = document.getElementById("line1"), l2 = document.getElementById("line2");
    if (l1) l1.className = "step-line" + (n > 1 ? " done" : "");
    if (l2) l2.className = "step-line" + (n > 2 ? " done" : "");
  }

  async function submitBooking() {
    if (submitting) return; if (!validateForm()) { showToast("Please fix the errors above.", "error"); return; }
    submitting = true;
    var btn = document.getElementById("btnReservar"), bt = document.getElementById("btnReservarText"), bs = document.getElementById("btnReservarSpinner");
    btn.disabled = true; if (bt) bt.classList.add("hidden"); if (bs) bs.classList.remove("hidden");
    var sk = document.getElementById("servicio").value, sd = servicesData[sk] || {}, fv = document.getElementById("fechaSeleccionada").value;
    var payload = {
      nombre: document.getElementById("nombre").value.trim(),
      email: document.getElementById("email").value.trim(),
      telefono: document.getElementById("telefono").value.trim(),
      servicioKey: sk,
      servicio: sd.name || sk,
      categoria: sd.category || "",
      precio: sd.price || "Quote on visit",
      fechaHora: fv + "T09:00",
      fecha: fv,
      horario: "09:00",
      direccion: document.getElementById("direccion").value.trim(),
      notas: (document.getElementById("notas") ? document.getElementById("notas").value.trim() : ""),
      cantidad: null, sqft: null, pickup: null, tipoMudanza: null,
      timestamp: new Date().toISOString(),
      source: "index.html"
    };
    bookings.unshift(Object.assign({}, payload, { status: "pending" })); renderCRM();
    try { await fetch(CONFIG.WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); } catch (err) { console.error("Webhook:", err); }
    lastBookingPayload = payload; showSuccess(payload);
    setTimeout(function() { loadBookingsFromSheets(payload.email); }, 3000);
    submitting = false; btn.disabled = false; if (bt) bt.classList.remove("hidden"); if (bs) bs.classList.add("hidden");
  }

  function showSuccess(p) {
    document.getElementById("formReserva").classList.add("hidden");
    var pn = document.getElementById("panelEnviado"); if (!pn) return; pn.classList.remove("hidden");
    document.getElementById("telefonoMostrar").textContent = p.telefono;
    document.getElementById("reciboNombre2").textContent = p.nombre;
    document.getElementById("reciboServicio2").textContent = p.servicio;
    document.getElementById("reciboFecha2").textContent = p.fecha;
    document.getElementById("reciboDireccion2").textContent = p.direccion;
    var precioEl = document.getElementById("reciboPrecio2"); if (precioEl) precioEl.textContent = p.precio;
    var mmgBtn = document.getElementById("btnPayMMG"), mmgLabel = document.getElementById("mmgAmountLabel");
    if (isFixedPrice(p.precio)) {
      mmgBtn.classList.remove("mmg-disabled"); mmgBtn.disabled = false;
      mmgLabel.textContent = p.precio + " GYD";
    } else {
      mmgBtn.classList.add("mmg-disabled"); mmgBtn.disabled = true;
      mmgLabel.textContent = "Quote required";
    }
    setStep(2); showToast("Booking submitted! You'll receive a WhatsApp confirmation shortly.", "success", 6000);
  }

  // ── MMG CHECKOUT ─────────────────────────────────────────────────────────
  function openMMGModal() {
    if (!lastBookingPayload) return;
    var amount = parsePrice(lastBookingPayload.precio);
    document.getElementById("mmgService").textContent = lastBookingPayload.servicio;
    document.getElementById("mmgTotal").textContent = formatGYD(amount) + " GYD";
    var phone = lastBookingPayload.telefono.replace(/\+592\s?/, "").replace(/\s/g, "");
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
    var phoneInput = document.getElementById("mmgPhone");
    var phone = phoneInput.value.trim().replace(/\s/g, "");
    if (!phone || phone.length < 6) {
      phoneInput.classList.add("field-error");
      showToast("Please enter a valid MMG wallet number.", "error");
      return;
    }
    phoneInput.classList.remove("field-error");

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
          precio:    lastBookingPayload.precio,
          fecha:     lastBookingPayload.fecha,
          direccion: lastBookingPayload.direccion,
          categoria: lastBookingPayload.categoria
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

  function animateCounters() {
    document.querySelectorAll(".stat-number[data-target]").forEach(function(el) {
      var tgt = parseInt(el.dataset.target), suf = el.dataset.suffix || "", cur = 0, step = Math.max(1, Math.floor(tgt / 40));
      var ti = setInterval(function() { cur = Math.min(cur + step, tgt); el.textContent = cur + suf; if (cur >= tgt) clearInterval(ti); }, 40);
    });
  }

  var obs = new IntersectionObserver(function(entries) { entries.forEach(function(e) { if (e.isIntersecting) { e.target.classList.add("visible"); if (e.target.closest(".stats-section") && !countersStarted) { countersStarted = true; animateCounters(); } obs.unobserve(e.target); } }); }, { threshold: 0.15 });

  function init() {
    populateSelect();
    // Initialize custom selects right after populating options
    initLvSelects();

    setStep(1); initCalendar();
    handleMMGReturn();
    document.querySelectorAll(".animate-on-scroll").forEach(function(el){ obs.observe(el); });
    var mt = document.getElementById("menuToggle"); if(mt) mt.addEventListener("click", function(){ var nl=document.getElementById("navLinks"); if(nl) nl.classList.toggle("show"); });
    window.addEventListener("scroll", function(){ var nb=document.getElementById("mainNavBar"); if(nb) nb.classList.toggle("scrolled", window.scrollY > 0); });
    var lg = document.getElementById("logo"); if(lg) lg.addEventListener("click", function(){ window.scrollTo({ top: 0, behavior: "smooth" }); });
    var hl = document.getElementById("homeLink"); if(hl) hl.addEventListener("click", function(e){ e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); });
    var sl = document.getElementById("serviceLink"); if(sl) sl.addEventListener("click", function(){ window.location.href = CONFIG.SERVICES_PAGE; });

    var goBook = function(e) { if(e) e.preventDefault(); var ps=document.getElementById("paymentSection"); if(ps) ps.scrollIntoView({ behavior: "smooth", block: "start" }); };
    var bl = document.getElementById("bookLink"); if(bl) bl.addEventListener("click", goBook);
    var bc = document.getElementById("bookCleanBtn"); if(bc) bc.addEventListener("click", goBook);

    var showAbout = function() { var as=document.getElementById("aboutSection"); if(as){ as.classList.add("visible"); as.scrollIntoView({ behavior: "smooth", block: "center" }); } };
    var al = document.getElementById("aboutLink"); if(al) al.addEventListener("click", function(e){ e.preventDefault(); showAbout(); });
    var ma = document.getElementById("moreAboutBtn"); if(ma) ma.addEventListener("click", showAbout);
    var ca = document.getElementById("closeAboutBtn"); if(ca) ca.addEventListener("click", function(){ var as=document.getElementById("aboutSection"); if(as) as.classList.remove("visible"); });
    var st = document.getElementById("scrollTopBtn"); if(st) st.addEventListener("click", function(){ window.scrollTo({ top: 0, behavior: "smooth" }); });
    var br = document.getElementById("btnReservar"); if(br) br.addEventListener("click", function(e){ e.preventDefault(); submitBooking(); });

    var nb = document.getElementById("btnNewBooking"); if(nb) nb.addEventListener("click", function() {
      var pe=document.getElementById("panelEnviado"); if(pe) pe.classList.add("hidden");
      var fr=document.getElementById("formReserva"); if(fr) fr.classList.remove("hidden");
      ["nombre","email","telefono","servicio","direccion","notas"].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=""; });
      document.getElementById("fechaSeleccionada").value = ""; selectedDate = null; currentCategory = null;
      document.getElementById("calendarPlaceholder").classList.remove("hidden");
      document.getElementById("calendarContent").classList.add("hidden");
      document.getElementById("selectedDateDisplay").classList.remove("show");
      // Reset the custom select display as well
      var servSel = document.getElementById("servicio");
      if (servSel && servSel._lv) { servSel._lv.updateDisplay(); }
      clearErrors(); setStep(1); lastBookingPayload = null;
      var ps=document.getElementById("paymentSection"); if(ps) ps.scrollIntoView({ behavior: "smooth" });
    });

    var cc = document.getElementById("btnClearCRM"); if(cc) cc.addEventListener("click", function() {
      if (confirm("Clear all booking history?")) { bookings = []; renderCRM(); showToast("History cleared.", "info"); }
    });

    var cp = document.getElementById("carouselPrev"); if(cp) cp.addEventListener("click", function(){ var ct=document.getElementById("carouselTrack"); if(ct) ct.scrollBy({ left: -300, behavior: "smooth" }); });
    var cn = document.getElementById("carouselNext"); if(cn) cn.addEventListener("click", function(){ var ct=document.getElementById("carouselTrack"); if(ct) ct.scrollBy({ left: 300, behavior: "smooth" }); });
    var clp = document.getElementById("calPrev"); if(clp) clp.addEventListener("click", function(){ calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } renderCalendar(); });
    var cln = document.getElementById("calNext"); if(cln) cln.addEventListener("click", function(){ calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } renderCalendar(); });

    document.querySelectorAll(".step-card").forEach(function(c){ c.addEventListener("click", function(){ var s = c.dataset.section; if (s) window.location.href = CONFIG.SERVICES_PAGE + "#" + s; }); });

    var bp = document.getElementById("btnPayMMG"); if(bp) bp.addEventListener("click", openMMGModal);
    var mc = document.getElementById("mmgCloseBtn"); if(mc) mc.addEventListener("click", closeMMGModal);
    var mo = document.getElementById("mmgOverlay"); if(mo) mo.addEventListener("click", function(e){ if(e.target===e.currentTarget) closeMMGModal(); });
    var mcp = document.getElementById("mmgConfirmPay"); if(mcp) mcp.addEventListener("click", function(e){ e.preventDefault(); processMMGPayment(); });
    var md = document.getElementById("mmgDoneBtn"); if(md) md.addEventListener("click", closeMMGModal);
    var mr = document.getElementById("mmgRetryBtn"); if(mr) mr.addEventListener("click", resetMMGModal);

    // Launch visual enhancements
    initLvUI();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
