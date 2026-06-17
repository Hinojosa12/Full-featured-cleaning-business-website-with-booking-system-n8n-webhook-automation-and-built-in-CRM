(function () {
  "use strict";

  var STORAGE_KEY = "livity_cart_v1";
  var WEBHOOK_URL = "https://n8n-n8n.7toway.easypanel.host/webhook/0e6a220e-8739-4db7-9770-cd6f4a4c35f4";
  var MMG_CHECKOUT_WEBHOOK = "https://n8n-n8n.7toway.easypanel.host/webhook/mmg-generate-checkout";

  function load() { try { var r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; } catch (e) { return []; } }
  function persist() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) {} }
  function fmt(n) { return "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0 }); }
  function esc(s) { return (s == null ? "" : String(s)).replace(/[&<>"']/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]; }); }
  function uid() { return "c" + Date.now() + Math.random().toString(36).slice(2, 7); }
  function toast(m, t, d) { var e = document.getElementById("toast"); if (!e) return; e.textContent = m; e.className = "toast show " + (t || "info"); setTimeout(function () { e.classList.remove("show"); }, d || 3000); }

  var items = load();
  var checkoutDraft = { nombre: "", email: "", telefono: "", direccion: "", fecha: "", notas: "" };

  function firstNonEmpty(ids) {
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el && el.value && el.value.trim()) return el.value.trim();
    }
    return "";
  }

  function captureDraft() {
    var n = (document.getElementById("lvcNombre") || {}).value;
    var e = (document.getElementById("lvcEmail") || {}).value;
    var t = (document.getElementById("lvcTelefono") || {}).value;
    var d = (document.getElementById("lvcDireccion") || {}).value;
    var f = (document.getElementById("lvcFecha") || {}).value;
    var no = (document.getElementById("lvcNotas") || {}).value;
    if (n != null) checkoutDraft.nombre = n;
    if (e != null) checkoutDraft.email = e;
    if (t != null) checkoutDraft.telefono = t;
    if (d != null) checkoutDraft.direccion = d;
    if (f != null) checkoutDraft.fecha = f;
    if (no != null) checkoutDraft.notas = no;
  }

  function grandTotal() { return items.reduce(function (s, i) { return s + (i.numericAmount || 0); }, 0); }

  // ── STYLES (self-contained, no edits needed to existing CSS files) ───────
  function injectStyles() {
    if (document.getElementById("lv-cart-styles")) return;
    var css =
      ".lv-cart-add-btn{background:transparent;border:1.5px solid #886902;color:#886902;border-radius:40px;padding:.55rem 1.1rem;font-weight:700;font-size:.82rem;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;margin-top:.6rem;margin-left:.5rem;}" +
      ".lv-cart-add-btn:hover{background:#886902;color:#fff;}" +
      ".lv-cart-bar{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:#1c1c1c;color:#fff;border-radius:50px;padding:.65rem 1.3rem;display:none;align-items:center;gap:.7rem;box-shadow:0 10px 28px rgba(0,0,0,.3);z-index:9998;cursor:pointer;font-family:inherit;}" +
      ".lv-cart-bar.show{display:flex;}" +
      ".lv-cart-bar .lv-c-count{background:#886902;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:800;}" +
      ".lv-cart-bar .lv-c-total{font-weight:800;font-size:.88rem;}" +
      ".lv-cart-bar .lv-c-label{font-size:.82rem;opacity:.85;}" +
      ".lv-cart-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;z-index:99999;padding:1rem;}" +
      ".lv-cart-overlay.active{display:flex;}" +
      ".lv-cart-modal{background:#fff;border-radius:22px;max-width:460px;width:100%;max-height:90vh;overflow-y:auto;padding:1.6rem;position:relative;font-family:inherit;color:#222;}" +
      ".lv-cart-modal h3{margin:0 0 1rem;font-size:1.15rem;font-weight:800;}" +
      ".lv-cart-close{position:absolute;top:1rem;right:1rem;background:#f2f2f2;border:none;width:30px;height:30px;border-radius:50%;font-size:1rem;cursor:pointer;color:#777;}" +
      ".lv-c-item{display:flex;justify-content:space-between;align-items:center;gap:.6rem;padding:.65rem 0;border-bottom:1px solid #f0f0f0;}" +
      ".lv-c-item-name{font-size:.84rem;font-weight:600;}" +
      ".lv-c-item-cat{font-size:.7rem;color:#999;display:block;}" +
      ".lv-c-item-price{font-size:.85rem;font-weight:700;color:#886902;white-space:nowrap;}" +
      ".lv-c-item-remove{background:none;border:none;color:#c0392b;cursor:pointer;font-size:1rem;padding:0 .2rem;margin-left:.5rem;}" +
      ".lv-c-empty{text-align:center;color:#999;padding:2rem 0;font-size:.88rem;}" +
      ".lv-c-total-row{display:flex;justify-content:space-between;font-weight:800;font-size:1.05rem;padding-top:1rem;margin-top:.4rem;border-top:2px solid #eee;}" +
      ".lv-c-field{margin-bottom:.85rem;}" +
      ".lv-c-field label{display:block;font-size:.76rem;font-weight:700;color:#555;margin-bottom:.3rem;text-transform:uppercase;letter-spacing:.02em;}" +
      ".lv-c-field input,.lv-c-field textarea{width:100%;padding:.65rem .8rem;border:1.5px solid #e2e2e2;border-radius:10px;font-size:.85rem;font-family:inherit;box-sizing:border-box;}" +
      ".lv-c-field input:focus,.lv-c-field textarea:focus{outline:none;border-color:#886902;}" +
      ".lv-c-btn{width:100%;padding:.85rem;border-radius:40px;border:none;font-weight:700;cursor:pointer;font-size:.9rem;margin-top:.5rem;}" +
      ".lv-c-btn-primary{background:#886902;color:#fff;}" +
      ".lv-c-btn-primary:disabled{opacity:.5;cursor:not-allowed;}" +
      ".lv-c-btn-secondary{background:#f2f2f2;color:#333;}" +
      ".lv-c-btn-green{background:#1e7c3a;color:#fff;}" +
      ".lv-c-success-icon{font-size:2.6rem;text-align:center;margin-bottom:.5rem;}" +
      ".lv-c-receipt{background:#f8f6f0;border-radius:14px;padding:.9rem;font-size:.84rem;margin:1rem 0;}" +
      ".lv-c-receipt-row{display:flex;justify-content:space-between;padding:.3rem 0;}" +
      ".lv-c-err{color:#c0392b;font-size:.75rem;margin-top:1rem;text-align:center;}";
    var st = document.createElement("style");
    st.id = "lv-cart-styles";
    st.textContent = css;
    document.head.appendChild(st);
  }

  // ── DOM SCAFFOLDING ────────────────────────────────────────────────────
  var barEl, overlayEl;

  function ensureDom() {
    if (barEl) return;
    barEl = document.createElement("div");
    barEl.className = "lv-cart-bar";
    barEl.innerHTML = '<i class="fas fa-shopping-cart"></i><span class="lv-c-label">View Cart</span><span class="lv-c-count">0</span><span class="lv-c-total">$0</span>';
    barEl.addEventListener("click", openModal);
    document.body.appendChild(barEl);

    overlayEl = document.createElement("div");
    overlayEl.className = "lv-cart-overlay";
    overlayEl.innerHTML = '<div class="lv-cart-modal"><button class="lv-cart-close" type="button">&times;</button><div id="lvCartBody"></div></div>';
    document.body.appendChild(overlayEl);
    overlayEl.querySelector(".lv-cart-close").addEventListener("click", closeModal);
    overlayEl.addEventListener("click", function (e) { if (e.target === overlayEl) closeModal(); });
  }

  function renderBar() {
    if (!barEl) return;
    var n = items.length;
    barEl.querySelector(".lv-c-count").textContent = n;
    barEl.querySelector(".lv-c-total").textContent = fmt(grandTotal());
    barEl.classList.toggle("show", n > 0);
  }

  function openModal() {
    ensureDom();
    renderCartStep();
    overlayEl.classList.add("active");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    if (!overlayEl) return;
    overlayEl.classList.remove("active");
    document.body.style.overflow = "";
  }

  // ── STEP 1: Cart list ──────────────────────────────────────────────────
  function renderCartStep() {
    var body = document.getElementById("lvCartBody");
    if (!body) return;
    var html = '<h3><i class="fas fa-shopping-cart"></i> Your Cart</h3>';
    if (!items.length) {
      html += '<div class="lv-c-empty">Your cart is empty.<br>Add a service to get started.</div>';
    } else {
      items.forEach(function (it) {
        html += '<div class="lv-c-item"><div><span class="lv-c-item-name">' + esc(it.servicio) + '</span>' + (it.categoria ? '<span class="lv-c-item-cat">' + esc(it.categoria) + '</span>' : '') + '</div><div style="display:flex;align-items:center;"><span class="lv-c-item-price">' + esc(it.precio) + '</span><button class="lv-c-item-remove" data-id="' + it.id + '" type="button">&times;</button></div></div>';
      });
      html += '<div class="lv-c-total-row"><span>Total</span><span>' + fmt(grandTotal()) + '</span></div>';
      html += '<button class="lv-c-btn lv-c-btn-primary" id="lvCartCheckoutBtn" type="button"><i class="fas fa-arrow-right"></i> Proceed to Checkout</button>';
    }
    body.innerHTML = html;
    body.querySelectorAll(".lv-c-item-remove").forEach(function (btn) {
      btn.addEventListener("click", function () { removeItem(btn.getAttribute("data-id")); });
    });
    var co = document.getElementById("lvCartCheckoutBtn");
    if (co) co.addEventListener("click", renderCheckoutStep);
  }

  function removeItem(id) {
    items = items.filter(function (i) { return i.id !== id; });
    persist(); renderBar(); renderCartStep();
  }

  // ── STEP 2: Checkout form (collected ONCE for the whole cart) ───────────
  function renderCheckoutStep() {
    var body = document.getElementById("lvCartBody");
    if (!body) return;
    var today = new Date().toISOString().split("T")[0];

    var preNombre   = checkoutDraft.nombre   || firstNonEmpty(["nombre", "r1-nombre", "r2-nombre", "r3-nombre", "r4-nombre", "r6-nombre"]);
    var preEmail    = checkoutDraft.email    || firstNonEmpty(["email", "r1-email", "r2-email", "r3-email", "r4-email", "r6-email"]);
    var preTelefono = checkoutDraft.telefono || firstNonEmpty(["telefono", "r1-telefono", "r2-telefono", "r3-telefono", "r4-telefono", "r6-telefono"]);
    var preDireccion= checkoutDraft.direccion|| firstNonEmpty(["direccion", "r1-direccion", "r2-direccion", "r3-direccion", "r4-direccion", "r6-direccion"]);
    var preFecha    = checkoutDraft.fecha    || firstNonEmpty(["fechaSeleccionada", "r1-fecha", "r2-fecha", "r3-fecha", "r4-fecha", "r6-fecha"]);
    var preNotas    = checkoutDraft.notas    || firstNonEmpty(["notas", "r1-notas", "r2-notas", "r3-notas", "r4-notas", "r6-notas"]);

    var html = '<h3><i class="fas fa-clipboard-list"></i> Your Details</h3>';
    html += '<div class="lv-c-field"><label>Full Name *</label><input type="text" id="lvcNombre" value="' + esc(preNombre) + '" placeholder="e.g., John Smith"></div>';
    html += '<div class="lv-c-field"><label>Email *</label><input type="email" id="lvcEmail" value="' + esc(preEmail) + '" placeholder="john@email.com"></div>';
    html += '<div class="lv-c-field"><label>WhatsApp *</label><input type="tel" id="lvcTelefono" value="' + esc(preTelefono) + '" placeholder="+592 123 4567"></div>';
    html += '<div class="lv-c-field"><label>Address *</label><input type="text" id="lvcDireccion" value="' + esc(preDireccion) + '" placeholder="Street, city, region"></div>';
    html += '<div class="lv-c-field"><label>Preferred Date *</label><input type="date" id="lvcFecha" min="' + today + '" value="' + esc(preFecha) + '"></div>';
    html += '<div class="lv-c-field"><label>Notes</label><textarea id="lvcNotas" rows="2" placeholder="Special instructions...">' + esc(preNotas) + '</textarea></div>';
    html += '<div class="lv-c-total-row"><span>Total (' + items.length + ' service' + (items.length > 1 ? "s" : "") + ')</span><span>' + fmt(grandTotal()) + '</span></div>';
    html += '<div id="lvcErr" class="lv-c-err" style="display:none;"></div>';
    html += '<button class="lv-c-btn lv-c-btn-primary" id="lvcSubmitBtn" type="button"><i class="fas fa-paper-plane"></i> Submit Booking Request</button>';
    html += '<button class="lv-c-btn lv-c-btn-secondary" id="lvcBackBtn" type="button">&larr; Back to Cart</button>';
    body.innerHTML = html;
    document.getElementById("lvcBackBtn").addEventListener("click", function () { captureDraft(); renderCartStep(); });
    document.getElementById("lvcSubmitBtn").addEventListener("click", submitCart);
  }

  async function submitCart() {
    var nombre = (document.getElementById("lvcNombre") || {}).value || "";
    var email = (document.getElementById("lvcEmail") || {}).value || "";
    var telefono = (document.getElementById("lvcTelefono") || {}).value || "";
    var direccion = (document.getElementById("lvcDireccion") || {}).value || "";
    var fecha = (document.getElementById("lvcFecha") || {}).value || "";
    var notas = (document.getElementById("lvcNotas") || {}).value || "";
    nombre = nombre.trim(); email = email.trim(); telefono = telefono.trim(); direccion = direccion.trim(); notas = notas.trim();

    var errEl = document.getElementById("lvcErr");
    if (!nombre || !email || !telefono || !direccion || !fecha) {
      if (errEl) { errEl.textContent = "Please fill in all required fields."; errEl.style.display = "block"; }
      return;
    }
    if (errEl) errEl.style.display = "none";

    var btn = document.getElementById("lvcSubmitBtn");
    if (btn) { btn.disabled = true; btn.innerHTML = "Sending..."; }

    var total = grandTotal();
    var combinedName = items.map(function (i) { return i.servicio; }).join(", ");

    var payload = {
      nombre: nombre, email: email, telefono: telefono, direccion: direccion,
      fecha: fecha, fechaHora: fecha + "T09:00", horario: "09:00", notas: notas,
      servicio: combinedName, categoria: "Multiple Services",
      precio: fmt(total), numericAmount: total,
      items: items.map(function (i) { return { servicio: i.servicio, categoria: i.categoria, precio: i.precio, numericAmount: i.numericAmount }; }),
      timestamp: new Date().toISOString(), source: "cart"
    };

    try {
      await fetch(WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } catch (e) { console.error("Cart webhook error:", e); }

    renderSuccessStep(payload);
    items = []; persist(); renderBar();
  }

  // ── STEP 3: Success + Pay via MMG ─────────────────────────────────────
  function renderSuccessStep(p) {
    var body = document.getElementById("lvCartBody");
    if (!body) return;
    var html = '<div class="lv-c-success-icon">✅</div>';
    html += '<h3 style="text-align:center;color:#1e7c3a;">Booking Request Sent!</h3>';
    html += '<p style="text-align:center;color:#666;font-size:.85rem;margin-top:-.5rem;">Our team will confirm via WhatsApp shortly.</p>';
    html += '<div class="lv-c-receipt">';
    p.items.forEach(function (it) {
      html += '<div class="lv-c-receipt-row"><span>' + esc(it.servicio) + '</span><span>' + esc(it.precio) + '</span></div>';
    });
    html += '<div class="lv-c-receipt-row" style="border-top:1px solid #e6ddc8;padding-top:.5rem;margin-top:.3rem;font-weight:800;"><span>Total</span><span>' + esc(p.precio) + '</span></div>';
    html += '</div>';
    html += '<button class="lv-c-btn lv-c-btn-green" id="lvcPayBtn" type="button"><i class="fas fa-wallet"></i> Pay via MMG — ' + esc(p.precio) + '</button>';
    html += '<button class="lv-c-btn lv-c-btn-secondary" id="lvcCloseBtn" type="button">Close</button>';
    body.innerHTML = html;
    document.getElementById("lvcCloseBtn").addEventListener("click", closeModal);
    document.getElementById("lvcPayBtn").addEventListener("click", function () { renderPaymentStep(p); });
  }

  // ── STEP 4: MMG payment (self-contained, doesn't touch the existing MMG modal) ──
  function renderPaymentStep(p) {
    var body = document.getElementById("lvCartBody");
    if (!body) return;
    var phone = (p.telefono || "").replace(/\+592\s?/g, "").replace(/\s/g, "");
    var html = '<h3><i class="fas fa-wallet"></i> Pay via MMG</h3>';
    html += '<div class="lv-c-total-row" style="border-top:none;padding-top:0;"><span>Total</span><span>' + esc(p.precio) + '</span></div>';
    html += '<div class="lv-c-field"><label>MMG Wallet Number *</label><input type="tel" id="lvcMmgPhone" value="' + esc(phone) + '" placeholder="e.g., 6437296"></div>';
    html += '<div id="lvcMmgErr" class="lv-c-err" style="display:none;"></div>';
    html += '<button class="lv-c-btn lv-c-btn-green" id="lvcMmgConfirm" type="button"><i class="fas fa-lock"></i> Confirm & Pay</button>';
    html += '<button class="lv-c-btn lv-c-btn-secondary" id="lvcMmgBack" type="button">&larr; Back</button>';
    body.innerHTML = html;
    document.getElementById("lvcMmgBack").addEventListener("click", function () { renderSuccessStep(p); });
    document.getElementById("lvcMmgConfirm").addEventListener("click", function () { processCartMMG(p); });
  }

  async function processCartMMG(p) {
    var phoneInput = document.getElementById("lvcMmgPhone");
    var phone = phoneInput ? phoneInput.value.trim().replace(/\s/g, "") : "";
    var errEl = document.getElementById("lvcMmgErr");
    if (!phone || phone.length < 6) {
      if (errEl) { errEl.textContent = "Enter a valid MMG wallet number (without +592)."; errEl.style.display = "block"; }
      return;
    }
    if (errEl) errEl.style.display = "none";
    var btn = document.getElementById("lvcMmgConfirm");
    if (btn) { btn.disabled = true; btn.innerHTML = "Processing..."; }

    try {
      var res = await fetch(MMG_CHECKOUT_WEBHOOK, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: p.nombre, email: p.email, telefono: phone,
          servicio: p.servicio, precio: p.precio,
          fecha: p.fecha, direccion: p.direccion, categoria: p.categoria,
          items: p.items
        })
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      var data = await res.json();
      if (!data.checkoutUrl) throw new Error("No checkout URL received");
      sessionStorage.setItem("mmg_pending_email", p.email);
      closeModal();
      toast("Redirecting to MMG payment page...", "info", 3000);
      setTimeout(function () { window.location.href = data.checkoutUrl; }, 600);
    } catch (err) {
      console.error("Cart MMG error:", err);
      if (errEl) { errEl.textContent = err.message || "Something went wrong. Please try again."; errEl.style.display = "block"; }
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-lock"></i> Confirm & Pay'; }
    }
  }

  // ── PUBLIC API ────────────────────────────────────────────────────────
  window.LivityCart = {
    add: function (item) {
      injectStyles(); ensureDom();
      item.id = uid();
      items.push(item);
      persist(); renderBar();
      toast("Added to cart!", "success", 2200);
    },
    remove: removeItem,
    open: openModal,
    count: function () { return items.length; },
    total: grandTotal
  };

  // ── INIT ──────────────────────────────────────────────────────────────
  function init() {
    injectStyles();
    ensureDom();
    renderBar();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

})();
