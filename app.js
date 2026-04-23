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
    "Steam Cleaning":       ["2026-3-28","2026-3-29","2026-3-30","2026-4-18","2026-4-19","2026-4-10"],
    "Carpet Cleaning":      ["2026-3-28","2026-3-29","2026-4-30","2026-4-8","2026-4-2","2026-4-3"],
    "Pressure Washing":     ["2026-3-28","2026-3-29","2026-3-30"],
    "Residential Cleaning": ["2026-3-28","2026-3-29","2026-3-30"],
    "Deep Cleaning":        ["2026-3-28","2026-3-29","2026-3-30"],
    "Commercial Cleaning":  ["2026-3-28","2026-3-29","2026-3-30"],
    "Move In/Out":          ["2026-3-28","2026-3-29","2026-3-30"],
  };

  let bookings = [];
  let countersStarted = false, submitting = false;
  let calMonth, calYear, selectedDate = null, currentCategory = null;
  let lastBookingPayload = null;

  // ── HANDLE MMG RETURN ───────────────────────────────────────────────────
  // When MMG redirects back to livitygy.com?TOKEN=... we verify the payment
  async function handleMMGReturn() {
    var params = new URLSearchParams(window.location.search);
    var token = params.get("TOKEN") || params.get("token") || params.get("mmg_token");
    if (!token) return;

    // Clean URL without reloading
    window.history.replaceState({}, document.title, window.location.pathname);

    showToast("Processing your payment...", "info", 5000);

    try {
      var res = await fetch(CONFIG.MMG_VERIFY_WEBHOOK + "?TOKEN=" + encodeURIComponent(token));
      var data = await res.json();

      if (data.isSuccess || data.resultCode === "0" || data.resultCode === 0 || (Array.isArray(data) && data[0] && (data[0]["statusCode "] === "CONFIRMED" || data[0].statusCode === "CONFIRMED"))) {
        showToast("✓ Payment confirmed! Your booking is now confirmed.", "success", 7000);
        setTimeout(loadBookingsFromSheets, 1500);
        var crm = document.querySelector(".crm-section");
        if (crm) setTimeout(function(){ crm.scrollIntoView({ behavior: "smooth", block: "start" }); }, 800);
      } else if (data.resultCode === "6") {
        showToast("Payment was cancelled. You can try again.", "error", 6000);
      } else {
        showToast("Payment could not be completed. Please try again.", "error", 6000);
      }
    } catch (err) {
      console.error("MMG verify error:", err);
      showToast("Could not verify payment. Please check your booking status.", "error", 6000);
    }
  }

  // ── LOAD BOOKINGS FROM GOOGLE SHEETS ────────────────────────────────────
  async function loadBookingsFromSheets() {
    try {
      var res = await fetch(CONFIG.GET_BOOKINGS_WEBHOOK);
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
        .reverse();
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

  function saveBooking(d) { bookings.unshift(d); try { localStorage.setItem("livityBookings", JSON.stringify(bookings.slice(0, 100))); } catch (e) {} }

  function renderCRM() {
    var tb = document.getElementById("crm-body"); if (!tb) return;
    if (!bookings.length) { tb.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--muted)">No bookings yet.</td></tr>'; return; }
    tb.innerHTML = "";
    bookings.forEach(function(b) {
      var st = { pending: '<span style="background:#fff5e6;color:#9a5c00;border:1px solid #ffcc80;padding:.2rem .7rem;border-radius:20px;font-size:.72rem;font-weight:700">⏳ Pending</span>', confirmed: '<span style="background:#e8f5ed;color:#1e7c3a;border:1px solid #a8d8b5;padding:.2rem .7rem;border-radius:20px;font-size:.72rem;font-weight:700">✓ Confirmed</span>' };
      var r = document.createElement("tr");
      r.innerHTML = '<td><strong>'+b.nombre+'</strong></td><td>'+b.telefono+'</td><td>'+b.servicio+'</td><td>'+b.fecha+'</td><td>'+b.direccion+'</td><td>'+(st[b.status]||st["pending"])+'</td>';
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
    // Optimistically add to local CRM while Sheets loads
    bookings.unshift(Object.assign({}, payload, { status: "pending" })); renderCRM();
    try { await fetch(CONFIG.WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); } catch (err) { console.error("Webhook:", err); }
    lastBookingPayload = payload; showSuccess(payload);
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

  // ── MMG CHECKOUT (redirects to MMG payment page) ─────────────────────────
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

      // ── Redirigir al cliente a la página de pago de MMG ──
      closeMMGModal();
      showToast("Redirecting to MMG payment page...", "info", 3000);
      setTimeout(function() {
        window.location.href = data.checkoutUrl;
      }, 800);

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
    populateSelect(); setStep(1); initCalendar();
    handleMMGReturn();   // Check if returning from MMG payment
    loadBookingsFromSheets(); // Load CRM from Google Sheets
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
      clearErrors(); setStep(1); lastBookingPayload = null;
      var ps=document.getElementById("paymentSection"); if(ps) ps.scrollIntoView({ behavior: "smooth" });
    });

    var cc = document.getElementById("btnClearCRM"); if(cc) cc.addEventListener("click", function() {
      if (confirm("Clear all booking history?")) { bookings = []; localStorage.removeItem("livityBookings"); renderCRM(); showToast("History cleared.", "info"); }
    });

    var cp = document.getElementById("carouselPrev"); if(cp) cp.addEventListener("click", function(){ var ct=document.getElementById("carouselTrack"); if(ct) ct.scrollBy({ left: -300, behavior: "smooth" }); });
    var cn = document.getElementById("carouselNext"); if(cn) cn.addEventListener("click", function(){ var ct=document.getElementById("carouselTrack"); if(ct) ct.scrollBy({ left: 300, behavior: "smooth" }); });
    var clp = document.getElementById("calPrev"); if(clp) clp.addEventListener("click", function(){ calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } renderCalendar(); });
    var cln = document.getElementById("calNext"); if(cln) cln.addEventListener("click", function(){ calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } renderCalendar(); });

    document.querySelectorAll(".step-card").forEach(function(c){ c.addEventListener("click", function(){ var s = c.dataset.section; if (s) window.location.href = CONFIG.SERVICES_PAGE + "#" + s; }); });

    // MMG Payment Events
    var bp = document.getElementById("btnPayMMG"); if(bp) bp.addEventListener("click", openMMGModal);
    var mc = document.getElementById("mmgCloseBtn"); if(mc) mc.addEventListener("click", closeMMGModal);
    var mo = document.getElementById("mmgOverlay"); if(mo) mo.addEventListener("click", function(e){ if(e.target===e.currentTarget) closeMMGModal(); });
    var mcp = document.getElementById("mmgConfirmPay"); if(mcp) mcp.addEventListener("click", function(e){ e.preventDefault(); processMMGPayment(); });
    var md = document.getElementById("mmgDoneBtn"); if(md) md.addEventListener("click", closeMMGModal);
    var mr = document.getElementById("mmgRetryBtn"); if(mr) mr.addEventListener("click", resetMMGModal);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
