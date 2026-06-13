(function() {
  "use strict";

  const CONFIG = {
    WEBHOOK_URL: "https://n8n-n8n.7toway.easypanel.host/webhook/0e6a220e-8739-4db7-9770-cd6f4a4c35f4",
    SERVICES_PAGE: "standardhomecleaning.html"
  };

  // Servicios principales con sus precios por unidad (para General Home Cleaning)
  const ROOM_RATES = {
    bedroom: 7500,    // GYD por bedroom
    livingroom: 8500,
    kitchen: 12000,
    bathroom: 6500,
    toilet: 4500
  };

  const SERVICES = [
    { value: "Cleaning", label: "General Home Cleaning Service" },
    { value: "OfficeCleaning", label: "Office Cleaning (per sq ft)" },
    { value: "CarpetCleaning", label: "Carpet Cleaning (per sq ft)" },
    { value: "MattressCleaning", label: "Mattress Cleaning (per side)" }
  ];

  // Precios por sq ft para Office y Carpet
  const SQFT_RATES = {
    OfficeCleaning: 45,   // GYD/sq ft
    CarpetCleaning: 55
  };

  // Precio por lado para Mattress
  const MATTRESS_SIDE_RATE = 3500;

  let currentService = "Cleaning";

  function populateSubservices() {
    const select = document.getElementById("service");
    if (!select) return;
    select.innerHTML = '<option value="">Select a service</option>';
    SERVICES.forEach(s => {
      const option = document.createElement("option");
      option.value = s.value;
      option.textContent = s.label;
      select.appendChild(option);
    });
    select.addEventListener("change", onServiceChange);
  }

  function onServiceChange(e) {
    currentService = e.target.value;
    showDynamicFields(currentService);
  }

  function showDynamicFields(service) {
    const container = document.getElementById("dynamic-fields");
    if (!container) return;
    container.innerHTML = "";

    if (service === "Cleaning") {
      renderRoomQuantities(container);
    } else if (service === "OfficeCleaning" || service === "CarpetCleaning") {
      renderSqftFields(container, service);
    } else if (service === "MattressCleaning") {
      renderMattressFields(container);
    }
  }

  // --------------------------------------------------------------
  // 1. General Home Cleaning: cantidad por cada tipo de habitación
  // --------------------------------------------------------------
  function renderRoomQuantities(container) {
    const wrapper = document.createElement("div");
    wrapper.className = "rooms-quantities";

    let html = `<h4>Enter the number of each room:</h4><table class="rooms-table">`;
    for (const [room, rate] of Object.entries(ROOM_RATES)) {
      html += `
        <tr>
          <td>${room.charAt(0).toUpperCase() + room.slice(1)}</td>
          <td><input type="number" id="qty-${room}" min="0" value="0" step="1" style="width:70px"></td>
          <td>${rate.toLocaleString()} GYD</td>
          <td class="room-subtotal" id="subtotal-${room}">0 GYD</td>
        </tr>
      `;
    }
    html += `<tr style="font-weight:bold; border-top:2px solid #ccc;"><td colspan="3">TOTAL</td><td id="general-cleaning-total">0 GYD</td></tr></table>`;
    wrapper.innerHTML = html;
    container.appendChild(wrapper);

    // Agregar event listeners para recalcular
    for (const room of Object.keys(ROOM_RATES)) {
      const input = document.getElementById(`qty-${room}`);
      if (input) input.addEventListener("input", () => updateRoomTotal(room));
    }
    updateRoomTotal(); // inicializar
  }

  function updateRoomTotal(changedRoom) {
    let grandTotal = 0;
    for (const [room, rate] of Object.entries(ROOM_RATES)) {
      const qtyInput = document.getElementById(`qty-${room}`);
      let qty = qtyInput ? parseInt(qtyInput.value) || 0 : 0;
      const subtotal = qty * rate;
      const subtotalSpan = document.getElementById(`subtotal-${room}`);
      if (subtotalSpan) subtotalSpan.innerText = subtotal.toLocaleString() + " GYD";
      grandTotal += subtotal;
    }
    const totalSpan = document.getElementById("general-cleaning-total");
    if (totalSpan) totalSpan.innerText = grandTotal.toLocaleString() + " GYD";
  }

  // --------------------------------------------------------------
  // 2. Office Cleaning / Carpet Cleaning (sq ft)
  // --------------------------------------------------------------
  function renderSqftFields(container, service) {
    const rate = SQFT_RATES[service];
    const wrapper = document.createElement("div");
    wrapper.className = "sqft-fields";
    wrapper.innerHTML = `
      <label>Length (ft): <input type="number" id="length" step="0.1"></label>
      <label>Width (ft): <input type="number" id="width" step="0.1"></label>
      <p>Total area: <span id="area">0</span> sq ft</p>
      <p>Estimated price: <span id="sqft-price">0</span> GYD</p>
      <input type="hidden" id="sqft-rate" value="${rate}">
    `;
    container.appendChild(wrapper);
    const lengthInput = document.getElementById("length");
    const widthInput = document.getElementById("width");
    const update = () => {
      const l = parseFloat(lengthInput.value) || 0;
      const w = parseFloat(widthInput.value) || 0;
      const area = l * w;
      document.getElementById("area").innerText = area.toFixed(2);
      const price = area * rate;
      document.getElementById("sqft-price").innerText = price.toLocaleString();
    };
    lengthInput.addEventListener("input", update);
    widthInput.addEventListener("input", update);
  }

  // --------------------------------------------------------------
  // 3. Mattress Cleaning (por lado)
  // --------------------------------------------------------------
  function renderMattressFields(container) {
    const wrapper = document.createElement("div");
    wrapper.className = "mattress-fields";
    wrapper.innerHTML = `
      <label>Number of sides: <input type="number" id="sides" min="1" value="1" step="1"></label>
      <p>Price per side: ${MATTRESS_SIDE_RATE.toLocaleString()} GYD</p>
      <p>Total: <span id="mattress-total">${MATTRESS_SIDE_RATE.toLocaleString()}</span> GYD</p>
    `;
    container.appendChild(wrapper);
    const sidesInput = document.getElementById("sides");
    sidesInput.addEventListener("input", () => {
      let sides = parseInt(sidesInput.value) || 1;
      let total = sides * MATTRESS_SIDE_RATE;
      document.getElementById("mattress-total").innerText = total.toLocaleString();
    });
  }

  // --------------------------------------------------------------
  // Envío del formulario
  // --------------------------------------------------------------
  window.submitBooking = async function() {
    const name = document.getElementById("name")?.value;
    const email = document.getElementById("email")?.value;
    const phone = document.getElementById("phone")?.value;
    const address = document.getElementById("address")?.value;
    const date = document.getElementById("date")?.value;
    const time = document.getElementById("time")?.value;

    if (!name || !email || !phone || !address || !date || !time) {
      alert("Please fill all fields");
      return;
    }

    let payload = { name, email, phone, address, date, time, service: currentService };

    if (currentService === "Cleaning") {
      const rooms = {};
      let total = 0;
      for (const [room, rate] of Object.entries(ROOM_RATES)) {
        const qty = parseInt(document.getElementById(`qty-${room}`)?.value) || 0;
        rooms[room] = { quantity: qty, rate, subtotal: qty * rate };
        total += qty * rate;
      }
      payload.rooms = rooms;
      payload.totalPrice = total;
    } 
    else if (currentService === "OfficeCleaning" || currentService === "CarpetCleaning") {
      const length = parseFloat(document.getElementById("length")?.value) || 0;
      const width = parseFloat(document.getElementById("width")?.value) || 0;
      const area = length * width;
      const rate = SQFT_RATES[currentService];
      payload.area_sqft = area;
      payload.rate_per_sqft = rate;
      payload.totalPrice = area * rate;
    }
    else if (currentService === "MattressCleaning") {
      const sides = parseInt(document.getElementById("sides")?.value) || 1;
      payload.sides = sides;
      payload.rate_per_side = MATTRESS_SIDE_RATE;
      payload.totalPrice = sides * MATTRESS_SIDE_RATE;
    }

    try {
      const response = await fetch(CONFIG.WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        alert("Booking sent successfully!");
        document.getElementById("booking-form")?.reset();
        const container = document.getElementById("dynamic-fields");
        if (container) container.innerHTML = "";
      } else {
        alert("Error sending booking");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

  function init() {
    populateSubservices();
    const dateInput = document.getElementById("date");
    if (dateInput) {
      const today = new Date().toISOString().split("T")[0];
      dateInput.setAttribute("min", today);
    }
  }
  init();
})();
