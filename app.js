(function () {
  "use strict";

  // ── CONFIG ──────────────────────────────────────────────────────────────
  const CONFIG = {
    WEBHOOK_URL: "https://n8n-n8n.7toway.easypanel.host/webhook/0e6a220e-8739-4db7-9770-cd6f4a4c35f4",
    SERVICES_PAGE: "standardhomecleaning.html",
  };

  // ── SERVICES DATA ────────────────────────────────────────────────────────
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
    "pressure-driveway": { name: "Pressure Washing – Driveway & Walkway",    price: "$30/sq ft",     category: "Pressure Washing" },
    "pressure-patio":    { name: "Pressure Washing – Patio/Terrace",         price: "$30/sq ft",     category: "Pressure Washing" },
    "pressure-building": { name: "Pressure Washing – Building Exterior",     price: "$30/sq ft",     category: "Pressure Washing" },
    "pressure-fence":    { name: "Pressure Washing – Fence Cleaning",        price: "$30/sq ft",     category: "Pressure Washing" },
    "pressure-parking":  { name: "Pressure Washing – Parking Lot",           price: "$30/sq ft",     category: "Pressure Washing" },
    "residential-1bed":  { name: "Residential – 1 Bedroom Apartment",        price: "Quote on visit",category: "Residential Cleaning" },
    "residential-2bed":  { name: "Residential – 2 Bedroom House",            price: "Quote on visit",category: "Residential Cleaning" },
    "residential-3bed":  { name: "Residential – 3 Bedroom House",            price: "Quote on visit",category: "Residential Cleaning" },
    "residential-general":{ name: "Residential – General Home Cleaning",     price: "Quote on visit",category: "Residential Cleaning" },
    "residential-onetime":{ name: "Residential – One-Time Refresh",          price: "Quote on visit",category: "Residential Cleaning" },
    "deep-1bed":         { name: "Deep Clean – 1 Bedroom",                   price: "Quote on visit",category: "Deep Cleaning" },
    "deep-2bed":         { name: "Deep Clean – 2 Bedrooms",                  price: "Quote on visit",category: "Deep Cleaning" },
    "deep-3bed":         { name: "Deep Clean – 3 Bedrooms",                  price: "Quote on visit",category: "Deep Cleaning" },
    "deep-4bed":         { name: "Deep Clean – 4+ Bedrooms",                 price: "Quote on visit",category: "Deep Cleaning" },
    "commercial-small":  { name: "Commercial – Small Office (up to 500 sq ft)",   price: "Quote on visit",category: "Commercial Cleaning" },
    "commercial-medium": { name: "Commercial – Medium Office (500–1,500 sq ft)",  price: "Quote on visit",category: "Commercial Cleaning" },
    "commercial-large":  { name: "Commercial – Large Office (1,500+ sq ft)",      price: "Quote on visit",category: "Commercial Cleaning" },
    "commercial-retail": { name: "Commercial – Retail Store",                price: "Quote on visit",category: "Commercial Cleaning" },
    "commercial-warehouse":{ name: "Commercial – Warehouse/Industrial",      price: "Quote on visit",category: "Commercial Cleaning" },
    "movein-1bed":       { name: "Move-In/Out – 1 Bedroom Apartment",        price: "Quote on visit",category: "Move In/Out" },
    "movein-2bed":       { name: "Move-In/Out – 2 Bedroom House",            price: "Quote on visit",category: "Move In/Out" },
    "movein-3bed":       { name: "Move-In/Out – 3 Bedroom House",            price: "Quote on visit",category: "Move In/Out" },
    "movein-4bed":       { name: "Move-In/Out – 4+ Bedroom House",           price: "Quote on visit",category: "Move In/Out" },
  };

  // ── AVAILABLE DATES ──────────────────────────────────────────────────────
  const availableDates = {
    "Steam Cleaning":       ["2026-3-28","2026-3-29","2026-3-30","2026-4-18","2026-4-19","2026-4-10"],
    "Carpet Cleaning":      ["2026-3-28","2026-3-29","2026-4-30","2026-4-8","2026-4-2","2026-4-3"],
    "Pressure Washing":     ["2026-3-28","2026-3-29","2026-3-30"],
    "Residential Cleaning": ["2026-3-28","2026-3-29","2026-3-30"],
    "Deep Cleaning":        ["2026-3-28","2026-3-29","2026-3-30"],
    "Commercial Cleaning":  ["2026-3-28","2026-3-29","2026-3-30"],
    "Move In/Out":          ["2026-3-28","2026-3-29","2026-3-30"],
  };

  // ── STATE ────────────────────────────────────────────────────────────────
  let bookings = [];
  try { bookings = JSON.parse(localStorage.getItem("livityBookings") || "[]"); } catch (e) { bookings = []; }
  let countersStarted = false, submitting = false;
  let calMonth, calYear, selectedDate = null, currentCategory = null;

  // ── CALENDAR ─────────────────────────────────────────────────────────────
  function initCalendar() {
    const now = new Date();
    calMonth = now.getMonth();
    calYear  = now.getFullYear();
  }

  function renderCalendar() {
    const grid = document.getElementById("calendarGrid");
    if (!grid) return;
    grid.innerHTML = "";
    const mn = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    document.getElementById("calMonthYear").textContent = mn[calMonth] + " " + calYear;
    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(d => {
      const l = document.createElement("div");
      l.className = "calendar-day-label";
      l.textContent = d;
      grid.appendChild(l);
    });
    const fd = new Date(calYear, calMonth, 1).getDay();
    const dm = new Date(calYear, calMonth + 1, 0).getDate();
    const td = new Date(); td.setHours(0,0,0,0);
    const cd = (currentCategory && availableDates[currentCategory]) || [];
    const as = new Set(cd);
    for (let i = 0; i < fd; i++) { const e = document.createElement("div"); e.className = "calendar-day"; grid.appendChild(e); }
    for (let d = 1; d <= dm; d++) {
      const c = document.createElement("div");
      c.className = "calendar-day current-month";
      c.textContent = d;
      const dt = new Date(calYear, calMonth, d); dt.setHours(0,0,0,0);
      const ds = calYear + "-" + (calMonth + 1) + "-" + d;
      if (dt.getTime() === td.getTime()) c.classList.add("today");
      if (dt < td) c.classList.add("unavailable");
      else if (as.has(ds)) { c.classList.add("available"); c.addEventListener("click", () => selectDate(d, ds)); }
      else c.classList.add("unavailable");
      if (selectedDate === ds) { c.classList.add("selected"); c.classList.remove("unavailable"); }
      grid.appendChild(c);
    }
  }

  function selectDate(day, ds) {
    selectedDate = ds;
    const p = ds.split("-");
    const iso = p[0] + "-" + p[1].padStart(2,"0") + "-" + p[2].padStart(2,"0");
    document.getElementById("fechaSeleccionada").value = iso;
    const disp = document.getElementById("selectedDateDisplay");
    const mn = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const dobj = new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
    const dn = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    document.getElementById("selectedDateText").textContent = dn[dobj.getDay()] + ", " + mn[dobj.getMonth()] + " " + p[2] + ", " + p[0];
    disp.classList.add("show");
    renderCalendar();
  }

  function onServiceChange() {
    const sk = document.getElementById("servicio").value;
    const sd = servicesData[sk];
    selectedDate = null;
    document.getElementById("fechaSeleccionada").value = "";
    document.getElementById("selectedDateDisplay").classList.remove("show");
    if (sd) {
      currentCategory = sd.category;
      document.getElementById("calendarPlaceholder").classList.add("hidden");
      document.getElementById("calendarContent").classList.remove("hidden");
      initCalendar(); renderCalendar();
    } else {
      currentCategory = null;
      document.getElementById("calendarPlaceholder").classList.remove("hidden");
      document.getElementById("calendarContent").classList.add("hidden");
    }
  }

  // ── TOAST ────────────────────────────────────────────────────────────────
  function showToast(m, t = "info", d = 4000) {
    const e = document.getElementById("toast");
    if (!e) return;
    e.textContent = m;
    e.className = "toast show " + t;
    setTimeout(() => e.classList.remove("show"), d);
  }

  // ── SELECT ───────────────────────────────────────────────────────────────
  function populateSelect() {
    const s = document.getElementById("servicio");
    if (!s) return;
    const c = {};
    for (const [k, d] of Object.entries(servicesData)) {
      if (!c[d.category]) c[d.category] = [];
      c[d.category].push({ k, ...d });
    }
    s.innerHTML = '<option value="">— Select a service —</option>';
    for (const [cat, items] of Object.entries(c)) {
      const g = document.createElement("optgroup");
      g.label = cat;
      items.forEach(i => {
        const o = document.createElement("option");
        o.value = i.k;
        o.textContent = i.name + " — " + i.price;
        g.appendChild(o);
      });
      s.appendChild(g);
    }
    s.addEventListener("change", onServiceChange);
  }

  // ── VALIDATION ───────────────────────────────────────────────────────────
  function clearErrors() {
    document.querySelectorAll(".field-error").forEach(e => e.classList.remove("field-error"));
    document.querySelectorAll(".error-msg").forEach(e => e.remove());
  }

  function setError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add("field-error");
    const s = document.createElement("span");
    s.className = "error-msg"; s.textContent = msg;
    el.parentNode.appendChild(s);
  }

  function validateForm() {
    clearErrors();
    let v = true;
    const n = document.getElementById("nombre").value.trim();
    const e = document.getElementById("email").value.trim();
    const t = document.getElementById("telefono").value.trim();
    const s = document.getElementById("servicio").value;
    const f = document.getElementById("fechaSeleccionada").value;
    const d = document.getElementById("direccion").value.trim();
    if (!n) { setError("nombre", "Full name is required."); v = false; }
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { setError("email", "Valid email required."); v = false; }
    if (!t || !/^[\+]?[\d\s\-\(\)]{7,15}$/.test(t.replace(/\s/g,""))) { setError("telefono", "Valid phone required."); v = false; }
    if (!s) { setError("servicio", "Please select a service."); v = false; }
    if (!f) { showToast("Please select an available date from the calendar.", "error"); v = false; }
    if (!d) { setError("direccion", "Address is required."); v = false; }
    return v;
  }

  // ── CRM ──────────────────────────────────────────────────────────────────
  function saveBooking(d) {
    bookings.unshift(d);
    try { localStorage.setItem("livityBookings", JSON.stringify(bookings.slice(0, 100))); } catch (e) {}
  }

  function renderCRM() {
    const tb = document.getElementById("crm-body");
    if (!tb) return;
    if (!bookings.length) {
      tb.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--muted)">No bookings yet.</td></tr>';
      return;
    }
    tb.innerHTML = "";
    bookings.forEach(b => {
      const st = {
        pending:   '<span style="background:#fff5e6;color:#9a5c00;border:1px solid #ffcc80;padding:.2rem .7rem;border-radius:20px;font-size:.72rem;font-weight:700">⏳ Pending</span>',
        confirmed: '<span style="background:#e8f5ed;color:#1e7c3a;border:1px solid #a8d8b5;padding:.2rem .7rem;border-radius:20px;font-size:.72rem;font-weight:700">✓ Confirmed</span>',
      };
      const r = document.createElement("tr");
      r.innerHTML = `<td><strong>${b.nombre}</strong></td><td>${b.telefono}</td><td>${b.servicio}</td><td>${b.fecha}</td><td>${b.direccion}</td><td>${st[b.status] || st["pending"]}</td>`;
      tb.appendChild(r);
    });
  }

  // ── STEP INDICATOR ───────────────────────────────────────────────────────
  function setStep(n) {
    for (let i = 1; i <= 3; i++) {
      const d = document.getElementById("dot" + i);
      if (!d) continue;
      if (i < n) { d.className = "step-dot done"; d.textContent = "✓"; }
      else if (i === n) { d.className = "step-dot active"; d.textContent = i; }
      else { d.className = "step-dot"; d.textContent = i; }
    }
    const l1 = document.getElementById("line1"), l2 = document.getElementById("line2");
    if (l1) l1.className = "step-line" + (n > 1 ? " done" : "");
    if (l2) l2.className = "step-line" + (n > 2 ? " done" : "");
  }

  // ── SUBMIT ───────────────────────────────────────────────────────────────
  async function submitBooking() {
    if (submitting) return;
    if (!validateForm()) { showToast("Please fix the errors above.", "error"); return; }
    submitting = true;
    const btn = document.getElementById("btnReservar");
    const bt  = document.getElementById("btnReservarText");
    const bs  = document.getElementById("btnReservarSpinner");
    btn.disabled = true;
    if (bt) bt.classList.add("hidden");
    if (bs) bs.classList.remove("hidden");
    const sk = document.getElementById("servicio").value;
    const sd = servicesData[sk] || {};
    const fv = document.getElementById("fechaSeleccionada").value;
    const payload = {
      nombre:       document.getElementById("nombre").value.trim(),
      email:        document.getElementById("email").value.trim(),
      telefono:     document.getElementById("telefono").value.trim(),
      servicioKey:  sk, servicio: sd.name || sk,
      categoria:    sd.category || "", precio: sd.price || "Quote on visit",
      fechaHora:    fv + "T09:00", fecha: fv, horario: "09:00",
      direccion:    document.getElementById("direccion").value.trim(),
      notas:        document.getElementById("notas")?.value.trim() || "",
      cantidad: null, sqft: null, pickup: null, tipoMudanza: null,
      timestamp:    new Date().toISOString(), source: "index.html",
    };
    saveBooking({ ...payload, status: "pending" });
    renderCRM();
    try { await fetch(CONFIG.WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
    catch (err) { console.error("Webhook:", err); }
    showSuccess(payload);
    submitting = false;
    btn.disabled = false;
    if (bt) bt.classList.remove("hidden");
    if (bs) bs.classList.add("hidden");
  }

  function showSuccess(p) {
    document.getElementById("formReserva").classList.add("hidden");
    const pn = document.getElementById("panelEnviado");
    if (!pn) return;
    pn.classList.remove("hidden");
    document.getElementById("telefonoMostrar").textContent  = p.telefono;
    document.getElementById("reciboNombre2").textContent    = p.nombre;
    document.getElementById("reciboServicio2").textContent  = p.servicio;
    document.getElementById("reciboFecha2").textContent     = p.fecha;
    document.getElementById("reciboDireccion2").textContent = p.direccion;
    setStep(2);
    showToast("Booking submitted! You'll receive a WhatsApp confirmation shortly.", "success", 6000);
  }

  // ── COUNTERS ─────────────────────────────────────────────────────────────
  function animateCounters() {
    document.querySelectorAll(".stat-number[data-target]").forEach(el => {
      const tgt = parseInt(el.dataset.target), suf = el.dataset.suffix || "";
      let cur = 0;
      const step = Math.max(1, Math.floor(tgt / 40));
      const ti = setInterval(() => { cur = Math.min(cur + step, tgt); el.textContent = cur + suf; if (cur >= tgt) clearInterval(ti); }, 40);
    });
  }

  // ── INTERSECTION OBSERVER ────────────────────────────────────────────────
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        if (e.target.closest(".stats-section") && !countersStarted) { countersStarted = true; animateCounters(); }
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  // ── INIT ─────────────────────────────────────────────────────────────────
  function init() {
    populateSelect(); renderCRM(); setStep(1); initCalendar();
    document.querySelectorAll(".animate-on-scroll").forEach(el => obs.observe(el));

    document.getElementById("menuToggle")?.addEventListener("click", () => document.getElementById("navLinks")?.classList.toggle("show"));
    window.addEventListener("scroll", () => document.getElementById("mainNavBar")?.classList.toggle("scrolled", window.scrollY > 0));
    document.getElementById("logo")?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    document.getElementById("homeLink")?.addEventListener("click", e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.getElementById("serviceLink")?.addEventListener("click", () => window.location.href = CONFIG.SERVICES_PAGE);

    const goBook = e => { e?.preventDefault(); document.getElementById("paymentSection")?.scrollIntoView({ behavior: "smooth", block: "start" }); };
    document.getElementById("bookLink")?.addEventListener("click", goBook);
    document.getElementById("bookCleanBtn")?.addEventListener("click", goBook);

    const showAbout = () => { document.getElementById("aboutSection")?.classList.add("visible"); document.getElementById("aboutSection")?.scrollIntoView({ behavior: "smooth", block: "center" }); };
    document.getElementById("aboutLink")?.addEventListener("click", e => { e.preventDefault(); showAbout(); });
    document.getElementById("moreAboutBtn")?.addEventListener("click", showAbout);
    document.getElementById("closeAboutBtn")?.addEventListener("click", () => document.getElementById("aboutSection")?.classList.remove("visible"));
    document.getElementById("scrollTopBtn")?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    document.getElementById("btnReservar")?.addEventListener("click", e => { e.preventDefault(); submitBooking(); });

    document.getElementById("btnNewBooking")?.addEventListener("click", () => {
      document.getElementById("panelEnviado")?.classList.add("hidden");
      document.getElementById("formReserva")?.classList.remove("hidden");
      ["nombre","email","telefono","servicio","direccion","notas"].forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
      document.getElementById("fechaSeleccionada").value = "";
      selectedDate = null; currentCategory = null;
      document.getElementById("calendarPlaceholder").classList.remove("hidden");
      document.getElementById("calendarContent").classList.add("hidden");
      document.getElementById("selectedDateDisplay").classList.remove("show");
      clearErrors(); setStep(1);
      document.getElementById("paymentSection")?.scrollIntoView({ behavior: "smooth" });
    });

    document.getElementById("btnClearCRM")?.addEventListener("click", () => {
      if (confirm("Clear all booking history?")) { bookings = []; localStorage.removeItem("livityBookings"); renderCRM(); showToast("History cleared.", "info"); }
    });

    document.getElementById("carouselPrev")?.addEventListener("click", () => document.getElementById("carouselTrack")?.scrollBy({ left: -300, behavior: "smooth" }));
    document.getElementById("carouselNext")?.addEventListener("click", () => document.getElementById("carouselTrack")?.scrollBy({ left: 300, behavior: "smooth" }));
    document.getElementById("calPrev")?.addEventListener("click", () => { calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } renderCalendar(); });
    document.getElementById("calNext")?.addEventListener("click", () => { calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } renderCalendar(); });

    document.querySelectorAll(".step-card").forEach(c => c.addEventListener("click", () => { const s = c.dataset.section; if (s) window.location.href = CONFIG.SERVICES_PAGE + "#" + s; }));
  }

  document.addEventListener("DOMContentLoaded", init);
})();
