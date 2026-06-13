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
      name: "General Home Cleaning",
      price: "variable",
      category: "General Home Cleaning",
      isRoomBased: true,
      rooms: {
        bedroom:    { name: "Bedroom",           rate: 7500  },
        livingroom: { name: "Living Room",        rate: 12000 },
        kitchen:    { name: "Kitchen",            rate: 9000  },
        bathroom:   { name: "Bathroom & Toilet",  rate: 12000 },
      }
    },
    "office-cleaning-sqft": { name: "Office Cleaning (per sq ft, min $10,000)", price: "sqft:80", category: "Office Cleaning", isSqft: true, rate: 80, minPrice: 10000 },
    "office-chairs":        { name: "Office Chairs", price: "$2,500", category: "Office Cleaning" },
    "carpet-uninstalled":   { name: "Per Square foot L x W (uninstalled)",                    price: "sqft:115", category: "Carpet Installation", isSqft: true, rate: 115 },
    "carpet-deep-cleaning": { name: "Deep Cleaning (Pressure washing, shampooing and steam)", price: "sqft:220", category: "Carpet Cleaning",     isSqft: true, rate: 220 },
    "pressure-driveway":    { name: "Driveway & Pressure Washing",                            price: "sqft:30",  category: "Pressure Washing",    isSqft: true, rate: 30  },
    "mattress-cleaning-per-side": { name: "Mattress Cleaning (per side)", price: "side:3500", category: "Mattress Cleaning", isPerSide: true, ratePerSide: 3500 },
    "sofa-l":    { name: "L Shaped Sofa", price: "$16,000", category: "Steam Cleaning" },
    "sofa-321":  { name: "3+2+1 Suite",   price: "$24,000", category: "Steam Cleaning" },
    "sofa-311":  { name: "3+1+1 Suite",   price: "$20,000", category: "Steam Cleaning" },
    "sofa-32":   { name: "3+2 Suite",     price: "$20,000", category: "Steam Cleaning" },
    "deep-floor":   { name: "Floor Polishing",      price: "$95",    category: "Deep Cleaning" },
    "deep-sofa1":   { name: "1 seat Sofa",          price: "$6,000", category: "Deep Cleaning" },
    "deep-sofa2":   { name: "2 seat Sofa",          price: "$10,000",category: "Deep Cleaning" },
    "deep-sofa3":   { name: "3 seat Sofa",          price: "$14,000",category: "Deep Cleaning" },
    "deep-suite211":{ name: "2+1+1 Suite",          price: "$16,000",category: "Deep Cleaning" },
    "deep-ottoman": { name: "Ottoman",              price: "$5,000", category: "Deep Cleaning" },
    "deep-dining":  { name: "Dinning Chairs",       price: "$2,000", category: "Deep Cleaning" },
    "deep-king":    { name: "King Size Mattress",   price: "$12,000/side", category:"Deep Cleaning", isPerSide:true, ratePerSide:12000 },
    "deep-queen":   { name: "Queen Size Mattress",  price: "$10,000/side", category:"Deep Cleaning", isPerSide:true, ratePerSide:10000 },
    "deep-double":  { name: "Double Size Mattress", price: "$10,000/side", category:"Deep Cleaning", isPerSide:true, ratePerSide:10000 },
    "deep-single":  { name: "Single Mattress",      price: "$8,000/side",  category:"Deep Cleaning", isPerSide:true, ratePerSide:8000  },
    "deep-reclS":   { name: "Recliner Single",      price: "$6,000", category: "Deep Cleaning" },
    "deep-reclJ":   { name: "Recliner Joined",      price: "$10,000",category: "Deep Cleaning" },
    "deep-carpet":  { name: "Carpet Cleaning",      price: "$16,000",category: "Deep Cleaning" },
  };

  // ── HELPERS ──────────────────────────────────────────────────────────────
  function isSqftService(sk)      { return !!(servicesData[sk] && servicesData[sk].isSqft); }
  function isRoomBasedService(sk) { return !!(servicesData[sk] && servicesData[sk].isRoomBased); }
  function isPerSideService(sk)   { return !!(servicesData[sk] && servicesData[sk].isPerSide); }
  function getSqftRate(sk)        { return servicesData[sk] ? servicesData[sk].rate : null; }
  function getSqftMin(sk)         { return servicesData[sk] ? (servicesData[sk].minPrice || 0) : 0; }
  function calculateSqftPrice(sk,l,w){ var r=getSqftRate(sk);if(!r)return null;return Math.max(l*w*r,getSqftMin(sk)); }
  function parsePrice(p){ if(!p)return null;if(typeof p==="number")return p;var c=p.replace(/[^0-9.]/g,"");var n=parseFloat(c);return isNaN(n)?null:n; }
  function formatGYD(a){ if(a===null||isNaN(a))return "$0";return "$"+Number(a).toLocaleString("en-US",{minimumFractionDigits:0}); }
  function showToast(m,t,d){ t=t||"info";d=d||4000;var e=document.getElementById("toast");if(!e)return;e.textContent=m;e.className="toast show "+t;setTimeout(function(){e.classList.remove("show");},d); }
  function escHtml(s){ if(!s)return"";return s.replace(/[&<>"']/g,function(m){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m];}); }

  var lastBookingPayload = null;
  var sectionCals = {};
  var sectionRoomQtys = {};

  // ── TOGGLE FORM ──────────────────────────────────────────────────────────
  window.toggleForm = function(formId){
    var form=document.getElementById(formId);if(!form)return;
    var isOpen=form.classList.contains("open");
    document.querySelectorAll(".form-section").forEach(function(f){f.classList.remove("open");});
    if(!isOpen){form.classList.add("open");setTimeout(function(){form.scrollIntoView({behavior:"smooth",block:"start"});},100);}
  };

  // ── ROOM BUILDER ─────────────────────────────────────────────────────────
  window.changeRoomQtySection = function(prefix, roomKey, delta){
    if(!sectionRoomQtys[prefix])sectionRoomQtys[prefix]={};
    sectionRoomQtys[prefix][roomKey]=Math.max(0,(sectionRoomQtys[prefix][roomKey]||0)+delta);
    var sk=(document.getElementById(prefix+"-servicio")||{}).value||"";
    var service=servicesData[sk];if(!service||!service.rooms||!service.rooms[roomKey])return;
    var qty=sectionRoomQtys[prefix][roomKey],rate=service.rooms[roomKey].rate;
    var qEl=document.getElementById("rb-qty-"+prefix+"-"+roomKey);
    var sEl=document.getElementById("rb-sub-"+prefix+"-"+roomKey);
    var tEl=document.getElementById("rb-total-"+prefix);
    if(qEl)qEl.textContent=qty;if(sEl)sEl.textContent=formatGYD(qty*rate);
    var grand=0;for(var rk in service.rooms)grand+=(sectionRoomQtys[prefix][rk]||0)*service.rooms[rk].rate;
    if(tEl)tEl.textContent=formatGYD(grand);
  };

  function buildRoomBuilderHTML(prefix,sk){
    var service=servicesData[sk];if(!service||!service.rooms)return"";
    sectionRoomQtys[prefix]={};for(var rk in service.rooms)sectionRoomQtys[prefix][rk]=0;
    var html='<div style="background:#f8f6f0;border-radius:14px;padding:1.1rem;margin-top:.5rem;">';
    html+='<p style="font-weight:700;color:var(--gold,#886902);margin-bottom:.9rem;font-size:.82rem;letter-spacing:.05em;text-transform:uppercase;">Select rooms & quantities:</p>';
    html+='<div style="display:flex;flex-direction:column;gap:.55rem;">';
    for(var roomKey in service.rooms){
      var room=service.rooms[roomKey];
      html+='<div style="display:flex;align-items:center;gap:.7rem;background:white;border-radius:9px;padding:.55rem .9rem;border:1px solid #eae2d6;">';
      html+='<span style="flex:1;font-weight:600;font-size:.85rem;">'+room.name+'</span>';
      html+='<span style="color:#5b6e73;font-size:.76rem;white-space:nowrap;">'+formatGYD(room.rate)+'/each</span>';
      html+='<div style="display:flex;align-items:center;gap:.35rem;">';
      html+='<button type="button" onclick="changeRoomQtySection(\''+prefix+'\',\''+roomKey+'\',-1)" style="width:26px;height:26px;border-radius:50%;border:1.5px solid var(--gold,#886902);background:white;color:var(--gold,#886902);font-weight:700;cursor:pointer;font-size:.95rem;display:flex;align-items:center;justify-content:center;">−</button>';
      html+='<span id="rb-qty-'+prefix+'-'+roomKey+'" style="min-width:22px;text-align:center;font-weight:700;font-size:.88rem;">0</span>';
      html+='<button type="button" onclick="changeRoomQtySection(\''+prefix+'\',\''+roomKey+'\',1)" style="width:26px;height:26px;border-radius:50%;border:1.5px solid var(--gold,#886902);background:var(--gold,#886902);color:white;font-weight:700;cursor:pointer;font-size:.95rem;display:flex;align-items:center;justify-content:center;">+</button>';
      html+='</div>';
      html+='<span id="rb-sub-'+prefix+'-'+roomKey+'" style="min-width:62px;text-align:right;font-weight:700;font-size:.85rem;">$0</span>';
      html+='</div>';
    }
    html+='</div>';
    html+='<div style="display:flex;justify-content:space-between;align-items:center;margin-top:.9rem;padding-top:.7rem;border-top:2px solid #eae2d6;">';
    html+='<span style="font-weight:700;font-size:.9rem;">Total</span>';
    html+='<span id="rb-total-'+prefix+'" style="font-weight:800;font-size:1rem;color:var(--gold,#886902);">$0</span>';
    html+='</div></div>';
    return html;
  }

  // ── SECTION SPECIAL FIELDS ───────────────────────────────────────────────
  function createSectionFields(prefix,sk){
    ["dim-","sides-","rooms-"].forEach(function(pfx){var el=document.getElementById(pfx+prefix);if(el)el.innerHTML="";});
    if(!sk)return;
    function getOrCreate(id){
      var ex=document.getElementById(id);if(ex)return ex;
      var sel=document.getElementById(prefix+"-servicio");if(!sel)return null;
      var sg=sel.closest(".fg");if(!sg)return null;
      var d=document.createElement("div");d.id=id;d.className="fg span2";d.style.marginTop=".5rem";
      sg.parentNode.insertBefore(d,sg.nextSibling);return d;
    }
    if(isRoomBasedService(sk)){
      var c=getOrCreate("rooms-"+prefix);if(c)c.innerHTML=buildRoomBuilderHTML(prefix,sk);
    } else if(isSqftService(sk)){
      var c=getOrCreate("dim-"+prefix);if(!c)return;
      var rate=getSqftRate(sk),minP=getSqftMin(sk);
      var rateLabel=rate+" GYD/sq ft"+(minP>0?" (min "+formatGYD(minP)+")":"");
      c.innerHTML='<div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-end;background:#f8f6f0;border-radius:12px;padding:.9rem;">'+
        '<div style="flex:1;min-width:110px;"><label><i class="fas fa-arrows-alt-h"></i> Length (feet) *</label>'+
        '<input type="number" id="length-'+prefix+'" step="0.01" min="0.1" placeholder="e.g., 10.5"></div>'+
        '<div style="flex:1;min-width:110px;"><label><i class="fas fa-arrows-alt-v"></i> Width (feet) *</label>'+
        '<input type="number" id="width-'+prefix+'" step="0.01" min="0.1" placeholder="e.g., 8.2"></div>'+
        '<div style="flex:0 0 auto;"><div style="background:white;padding:.45rem .9rem;border-radius:40px;font-weight:700;border:1px solid #eae2d6;">Total: <span id="sqft-total-'+prefix+'">$0</span></div>'+
        '<small style="font-size:.7rem;color:#5b6e73;">Rate: '+rateLabel+'</small></div></div>';
      var lI=document.getElementById("length-"+prefix),wI=document.getElementById("width-"+prefix),tS=document.getElementById("sqft-total-"+prefix);
      function upd(){var l=parseFloat(lI?lI.value:0)||0,w=parseFloat(wI?wI.value:0)||0;if(tS)tS.textContent=(l>0&&w>0)?formatGYD(calculateSqftPrice(sk,l,w)):"$0";}
      if(lI)lI.addEventListener("input",upd);if(wI)wI.addEventListener("input",upd);
    } else if(isPerSideService(sk)){
      var c=getOrCreate("sides-"+prefix);if(!c)return;
      var pps=servicesData[sk].ratePerSide||0;
      c.innerHTML='<div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;background:#f8f6f0;border-radius:12px;padding:.9rem;">'+
        '<div style="flex:1;min-width:150px;"><label style="font-size:.72rem;font-weight:700;color:#5b6e73;text-transform:uppercase;display:block;margin-bottom:4px;"><i class="fas fa-layer-group" style="color:var(--gold,#886902);margin-right:4px;"></i> Number of Sides *</label>'+
        '<input type="number" id="sides-'+prefix+'" min="1" max="20" value="1" placeholder="e.g., 2"></div>'+
        '<div style="flex:0 0 auto;"><div style="background:white;padding:.45rem .9rem;border-radius:40px;font-weight:700;border:1px solid #eae2d6;">Total: <span id="sides-total-'+prefix+'">'+formatGYD(pps)+'</span></div>'+
        '<small style="font-size:.7rem;color:#5b6e73;">'+formatGYD(pps)+' per side</small></div></div>';
      var sI=document.getElementById("sides-"+prefix),sT=document.getElementById("sides-total-"+prefix);
      if(sI)sI.addEventListener("input",function(){if(sT)sT.textContent=formatGYD((parseInt(sI.value)||1)*pps);});
    }
  }

  // ── CALENDAR ─────────────────────────────────────────────────────────────
  function renderSectionCalendar(prefix){
    var state=sectionCals[prefix];if(!state)return;
    var contentDiv=document.getElementById("cal-content-"+prefix);if(!contentDiv)return;
    var mn=["January","February","March","April","May","June","July","August","September","October","November","December"];
    var dn=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    var now=new Date();now.setHours(0,0,0,0);
    var fd=new Date(state.year,state.month,1).getDay(),dm=new Date(state.year,state.month+1,0).getDate();
    var html='<div class="cal-header"><div class="cal-nav"><button type="button" onclick="sectionCalPrev(\''+prefix+'\')"><i class="fas fa-chevron-left"></i></button></div><h4>'+mn[state.month]+' '+state.year+'</h4><div class="cal-nav"><button type="button" onclick="sectionCalNext(\''+prefix+'\')"><i class="fas fa-chevron-right"></i></button></div></div><div class="cal-grid">';
    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(function(d){html+='<div class="cal-label">'+d+'</div>';});
    for(var i=0;i<fd;i++)html+='<div class="cal-day empty"></div>';
    for(var d=1;d<=dm;d++){
      var dt=new Date(state.year,state.month,d);dt.setHours(0,0,0,0);
      var ds=state.year+"-"+(state.month+1)+"-"+d;
      var cls="cal-day current-month",click="";
      if(dt.getTime()===now.getTime())cls+=" today";
      if(dt<now){cls+=" unavailable";}else{cls+=" available";click=' onclick="selectSectionDate(\''+prefix+'\',\''+ds+'\')"';}
      if(state.selected===ds){cls=cls.replace("unavailable","").replace("available","")+" selected";click=' onclick="selectSectionDate(\''+prefix+'\',\''+ds+'\')"';}
      html+='<div class="'+cls+'"'+click+'>'+d+'</div>';
    }
    html+='</div><div class="cal-legend"><div class="cal-legend-item"><div class="cal-legend-dot avail"></div> Available</div><div class="cal-legend-item"><div class="cal-legend-dot sel"></div> Selected</div><div class="cal-legend-item"><div class="cal-legend-dot unav"></div> Unavailable</div></div>';
    if(state.selected){
      var p2=state.selected.split("-"),dobj=new Date(parseInt(p2[0]),parseInt(p2[1])-1,parseInt(p2[2]));
      html+='<div class="cal-selected-display show"><i class="fas fa-check-circle"></i><span>'+dn[dobj.getDay()]+', '+mn[dobj.getMonth()]+' '+p2[2]+', '+p2[0]+'</span></div>';
    }
    contentDiv.innerHTML=html;contentDiv.classList.remove("hidden");
  }

  window.selectSectionDate=function(prefix,ds){
    if(!sectionCals[prefix])return;sectionCals[prefix].selected=ds;
    var p=ds.split("-"),iso=p[0]+"-"+p[1].padStart(2,"0")+"-"+p[2].padStart(2,"0");
    var fechaEl=document.getElementById(prefix+"-fecha");if(fechaEl)fechaEl.value=iso;
    renderSectionCalendar(prefix);
  };
  window.sectionCalPrev=function(prefix){if(!sectionCals[prefix])return;sectionCals[prefix].month--;if(sectionCals[prefix].month<0){sectionCals[prefix].month=11;sectionCals[prefix].year--;}renderSectionCalendar(prefix);};
  window.sectionCalNext=function(prefix){if(!sectionCals[prefix])return;sectionCals[prefix].month++;if(sectionCals[prefix].month>11){sectionCals[prefix].month=0;sectionCals[prefix].year++;}renderSectionCalendar(prefix);};

  window.onServiceChangeSection=function(prefix){
    var sk=(document.getElementById(prefix+"-servicio")||{}).value||"";
    var fechaEl=document.getElementById(prefix+"-fecha");if(fechaEl)fechaEl.value="";
    createSectionFields(prefix,sk);
    if(!sk){
      var ph=document.getElementById("cal-placeholder-"+prefix),ct=document.getElementById("cal-content-"+prefix);
      if(ph)ph.classList.remove("hidden");if(ct)ct.classList.add("hidden");return;
    }
    var now=new Date();sectionCals[prefix]={month:now.getMonth(),year:now.getFullYear(),selected:null};
    var ph=document.getElementById("cal-placeholder-"+prefix);if(ph)ph.classList.add("hidden");
    renderSectionCalendar(prefix);
  };

  // ── SUBMIT FORM ──────────────────────────────────────────────────────────
  window.submitForm=async function(prefix,formCategory){
    var nombre   =(document.getElementById(prefix+"-nombre")   ||{}).value||"";
    var email    =(document.getElementById(prefix+"-email")    ||{}).value||"";
    var telefono =(document.getElementById(prefix+"-telefono") ||{}).value||"";
    var sk       =(document.getElementById(prefix+"-servicio") ||{}).value||"";
    var fecha    =(document.getElementById(prefix+"-fecha")    ||{}).value||"";
    var direccion=(document.getElementById(prefix+"-direccion")||{}).value||"";
    var notas    =(document.getElementById(prefix+"-notas")    ||{}).value||"";
    nombre=nombre.trim();email=email.trim();telefono=telefono.trim();direccion=direccion.trim();

    if(!nombre||!email||!telefono||!fecha||!direccion){showToast("Please fill in all required fields.","error");return;}

    var sd=servicesData[sk];
    if(!sd){
      var selEl=document.getElementById(prefix+"-servicio");
      var optText=selEl?(selEl.options[selEl.selectedIndex]||{}).text||"":"";
      var match=optText.match(/[—\-–]\s*([\d,]+)/);
      var rawP=match?parseFloat(match[1].replace(/,/g,"")):null;
      sd={name:optText.replace(/\s*[—\-–].*/,"").trim()||sk,price:rawP?"$"+rawP:"Quote on visit",category:formCategory};
    }

    var finalPrice=sd.price||"Quote on visit",sqftValue=null,sidesValue=null,roomsData=null,serviceName=sd.name||sk;
    var numericAmount=0;

    if(isRoomBasedService(sk)){
      var service=servicesData[sk],qtys=sectionRoomQtys[prefix]||{};
      var total=0;roomsData={};var parts=[];
      for(var rk in service.rooms){
        var qty=qtys[rk]||0;
        roomsData[rk]={name:service.rooms[rk].name,quantity:qty,rate:service.rooms[rk].rate,subtotal:qty*service.rooms[rk].rate};
        total+=qty*service.rooms[rk].rate;if(qty>0)parts.push(qty+"x "+service.rooms[rk].name);
      }
      if(total===0){showToast("Please add at least one room.","error");return;}
      finalPrice=formatGYD(total);numericAmount=total;
      serviceName="General Home Cleaning ("+parts.join(", ")+")";

    } else if(isSqftService(sk)){
      if(!sk){showToast("Please select a service.","error");return;}
      var lEl=document.getElementById("length-"+prefix),wEl=document.getElementById("width-"+prefix);
      var l=parseFloat(lEl?lEl.value:0),w=parseFloat(wEl?wEl.value:0);
      if(!l||!w||l<=0||w<=0){showToast("Please enter valid Length and Width in feet.","error");return;}
      sqftValue=l*w;numericAmount=calculateSqftPrice(sk,l,w);finalPrice=formatGYD(numericAmount);

    } else if(isPerSideService(sk)){
      var sEl=document.getElementById("sides-"+prefix);
      var sides=parseInt(sEl?sEl.value:1)||1;
      if(sides<1){showToast("Please enter a valid number of sides.","error");return;}
      sidesValue=sides;numericAmount=sides*(sd.ratePerSide||0);finalPrice=formatGYD(numericAmount);
      serviceName=sd.name+" ("+sides+" side"+(sides>1?"s":"")+")";

    } else if(!sk){
      showToast("Please select a service.","error");return;
    } else {
      numericAmount=parsePrice(finalPrice)||0;
    }

    var btn=document.getElementById("btn-"+prefix);
    var btnSpan=btn?btn.querySelector("span"):null;
    if(btn)btn.disabled=true;if(btnSpan)btnSpan.textContent="Sending...";

    var payload={
      nombre,email,telefono,
      servicioKey:sk,servicio:serviceName,categoria:sd.category||formCategory,precio:finalPrice,
      numericAmount:numericAmount,
      fechaHora:fecha+"T09:00",fecha,horario:"09:00",direccion,notas:notas.trim(),
      sqft:sqftValue,sides:sidesValue,rooms:roomsData,
      timestamp:new Date().toISOString(),source:"standardhomecleaning.html"
    };

    try{await fetch(CONFIG.WEBHOOK_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});}
    catch(err){console.error("Webhook:",err);}

    if(typeof gtag==="function")gtag("event","conversion",{"send_to":"AW-18135400951/f7l_CPb7v6YcEPeD0cdD","value":1.0,"currency":"USD","transaction_id":payload.timestamp});

    lastBookingPayload=payload;
    showSectionSuccess(prefix,payload);
    showToast("Booking saved! Complete payment via MMG to confirm.","success",5000);
    if(btn){btn.disabled=false;if(btnSpan)btnSpan.innerHTML='<i class="fas fa-paper-plane"></i> Book '+formCategory;}
  };

  // ── SUCCESS PANEL — igual al flujo de index.html ─────────────────────────
  function showSectionSuccess(prefix,p){
    // Ocultar el formulario
    var formSection=document.getElementById("form-"+prefix);
    if(formSection)formSection.classList.remove("open");

    var successDiv=document.getElementById("success-"+prefix);
    if(!successDiv)return;

    var amount=p.numericAmount||parsePrice(p.precio)||0;
    var hasMMG=(amount>0);

    // Detalle de rooms/sides/sqft
    var extraDetail="";
    if(p.rooms){
      var parts=[];for(var rk in p.rooms)if(p.rooms[rk].quantity>0)parts.push(p.rooms[rk].quantity+"x "+p.rooms[rk].name);
      if(parts.length)extraDetail='<div class="receipt-row"><span>Rooms</span><span>'+escHtml(parts.join(", "))+'</span></div>';
    } else if(p.sides){
      extraDetail='<div class="receipt-row"><span>Sides</span><span>'+p.sides+'</span></div>';
    } else if(p.sqft){
      extraDetail='<div class="receipt-row"><span>Area</span><span>'+p.sqft.toFixed(2)+' sq ft</span></div>';
    }

    successDiv.innerHTML=
      '<div class="confirm-panel" style="margin-top:1.5rem;">'+
        '<div class="confirm-icon">📨</div>'+
        '<div>'+
          '<div class="section-tag">Booking Sent</div>'+
          '<h2 class="section-title" style="font-size:1.6rem;">Request Sent!</h2>'+
          '<p style="color:var(--muted);max-width:420px;margin:.5rem auto 0;font-size:.9rem;">Our team will confirm via WhatsApp within minutes.</p>'+
        '</div>'+
        '<div class="wa-box">'+
          '<strong style="font-size:.85rem;">📱 Confirmation to:</strong><br>'+
          '<span style="font-size:1.05rem;color:var(--gold);font-weight:700;">'+escHtml(p.telefono)+'</span>'+
        '</div>'+
        '<div class="receipt">'+
          '<div class="receipt-row"><span>Customer</span><span>'+escHtml(p.nombre)+'</span></div>'+
          '<div class="receipt-row"><span>Service</span><span>'+escHtml(p.servicio)+'</span></div>'+
          '<div class="receipt-row"><span>Date</span><span>'+escHtml(p.fecha)+'</span></div>'+
          '<div class="receipt-row"><span>Address</span><span>'+escHtml(p.direccion)+'</span></div>'+
          extraDetail+
          '<div class="receipt-row"><span>Amount</span><span class="receipt-amount">'+escHtml(p.precio)+'</span></div>'+
          '<div class="receipt-row"><span>Status</span><span class="pill-pend">⏳ Pending</span></div>'+
        '</div>'+
        '<div class="badge-row">'+
          '<span class="badge">📱 WhatsApp sent</span>'+
          '<span class="badge">📊 Saved in CRM</span>'+
          '<span class="badge">📅 Calendar check</span>'+
        '</div>'+
        '<div class="confirm-actions">'+
          '<button class="btn-gold" onclick="resetSectionForm(\''+prefix+'\')" style="display:inline-flex;align-items:center;gap:.4rem;"><i class="fas fa-plus"></i> New Booking</button>'+
          (hasMMG
            ? '<button class="btn-mmg" id="mmg-pay-btn-'+prefix+'">'+
                '<span class="mmg-btn-inner">'+
                  '<span class="mmg-icon-wrap"><i class="fas fa-wallet"></i></span>'+
                  '<span class="mmg-btn-text">'+
                    '<span class="mmg-label">Pay via MMG</span>'+
                    '<span class="mmg-amount">'+escHtml(p.precio)+'</span>'+
                  '</span>'+
                '</span>'+
              '</button>'
            : '<button class="btn-mmg mmg-disabled" disabled>'+
                '<span class="mmg-btn-inner">'+
                  '<span class="mmg-icon-wrap"><i class="fas fa-wallet"></i></span>'+
                  '<span class="mmg-btn-text">'+
                    '<span class="mmg-label">Pay via MMG</span>'+
                    '<span class="mmg-amount">Quote required</span>'+
                  '</span>'+
                '</span>'+
              '</button>'
          )+
        '</div>'+
      '</div>';

    successDiv.classList.add("show");
    successDiv.scrollIntoView({behavior:"smooth",block:"start"});

    // Vincular botón MMG
    if(hasMMG){
      var mmgBtn=document.getElementById("mmg-pay-btn-"+prefix);
      if(mmgBtn)mmgBtn.addEventListener("click",function(){ openMMGModal(lastBookingPayload); });
    }
  }

  window.resetSectionForm=function(prefix){
    var successDiv=document.getElementById("success-"+prefix);
    if(successDiv){successDiv.innerHTML="";successDiv.classList.remove("show");}
    var formSection=document.getElementById("form-"+prefix);
    if(formSection){
      formSection.querySelectorAll("input:not([type=hidden]),select,textarea").forEach(function(f){f.value="";});
      var fechaEl=document.getElementById(prefix+"-fecha");if(fechaEl)fechaEl.value="";
      formSection.classList.add("open");
      formSection.scrollIntoView({behavior:"smooth",block:"start"});
    }
    if(sectionCals[prefix]){sectionCals[prefix].selected=null;}
    var ct=document.getElementById("cal-content-"+prefix);if(ct)ct.classList.add("hidden");
    var ph=document.getElementById("cal-placeholder-"+prefix);if(ph)ph.classList.remove("hidden");
    ["dim-","sides-","rooms-"].forEach(function(pfx){var el=document.getElementById(pfx+prefix);if(el)el.innerHTML="";});
    if(sectionRoomQtys[prefix])sectionRoomQtys[prefix]={};
    lastBookingPayload=null;
  };

  // ── MMG MODAL ────────────────────────────────────────────────────────────
  function openMMGModal(bookingPayload){
    if(!bookingPayload)return;
    var amount=bookingPayload.numericAmount||parsePrice(bookingPayload.precio)||0;
    if((!amount||amount===0)&&bookingPayload.sqft){var r=getSqftRate(bookingPayload.servicioKey);if(r)amount=Math.max(bookingPayload.sqft*r,getSqftMin(bookingPayload.servicioKey));}
    if((!amount||amount===0)&&bookingPayload.rooms){var tot=0;for(var rk in bookingPayload.rooms)tot+=bookingPayload.rooms[rk].subtotal;amount=tot;}
    if((!amount||amount===0)&&bookingPayload.sides){var sd=servicesData[bookingPayload.servicioKey];if(sd&&sd.isPerSide)amount=bookingPayload.sides*sd.ratePerSide;}
    if(!amount||amount===0){showToast("Cannot process: invalid amount.","error");return;}

    document.getElementById("mmgService").textContent=bookingPayload.servicio;
    document.getElementById("mmgTotal").textContent=formatGYD(amount)+" GYD";
    var phone=bookingPayload.telefono.replace(/\+592\s?/g,"").replace(/\s/g,"");
    document.getElementById("mmgPhone").value=phone;
    document.getElementById("mmgSuccess").classList.add("hidden");
    document.getElementById("mmgError").classList.add("hidden");
    document.querySelector(".mmg-modal-body").classList.remove("hidden");
    document.getElementById("mmgConfirmPay").classList.remove("hidden");
    document.querySelector(".mmg-secure").classList.remove("hidden");
    document.getElementById("mmgOverlay").classList.add("active");
    document.body.style.overflow="hidden";
    window._mmgCurrentAmount=amount;
    lastBookingPayload=bookingPayload;
  }

  function closeMMGModal(){
    var ov=document.getElementById("mmgOverlay");if(ov)ov.classList.remove("active");
    document.body.style.overflow="";
  }
  function resetMMGModal(){
    document.getElementById("mmgError").classList.add("hidden");
    document.querySelector(".mmg-modal-body").classList.remove("hidden");
    document.getElementById("mmgConfirmPay").classList.remove("hidden");
    document.querySelector(".mmg-secure").classList.remove("hidden");
  }

  async function processMMGPayment(){
    var phoneInput=document.getElementById("mmgPhone"),phone=phoneInput?phoneInput.value.trim().replace(/\s/g,""):"";
    if(!phone||phone.length<6){if(phoneInput)phoneInput.classList.add("field-error");showToast("Enter a valid MMG wallet number.","error");return;}
    if(phoneInput)phoneInput.classList.remove("field-error");
    if(!lastBookingPayload){showToast("No booking data. Please try again.","error");return;}
    var amountValue=window._mmgCurrentAmount||lastBookingPayload.numericAmount||parsePrice(lastBookingPayload.precio)||0;
    var payBtn=document.getElementById("mmgConfirmPay"),payText=document.getElementById("mmgPayText"),paySpinner=document.getElementById("mmgPaySpinner");
    if(payBtn)payBtn.disabled=true;if(payText)payText.classList.add("hidden");if(paySpinner)paySpinner.classList.remove("hidden");
    try{
      var response=await fetch(CONFIG.MMG_CHECKOUT_WEBHOOK,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({nombre:lastBookingPayload.nombre,email:lastBookingPayload.email,telefono:phone,servicio:lastBookingPayload.servicio,precio:formatGYD(amountValue),fecha:lastBookingPayload.fecha,direccion:lastBookingPayload.direccion,categoria:lastBookingPayload.categoria,sqft:lastBookingPayload.sqft,rooms:lastBookingPayload.rooms,sides:lastBookingPayload.sides})});
      if(!response.ok)throw new Error("HTTP "+response.status);
      var data=await response.json();if(!data.checkoutUrl)throw new Error("No checkout URL received");
      sessionStorage.setItem("mmg_pending_email",lastBookingPayload.email);
      closeMMGModal();showToast("Redirecting to MMG payment page...","info",3000);
      setTimeout(function(){window.location.href=data.checkoutUrl;},800);
    }catch(err){
      console.error("MMG error:",err);
      var mb=document.querySelector(".mmg-modal-body"),cp=document.getElementById("mmgConfirmPay"),sc=document.querySelector(".mmg-secure"),ed=document.getElementById("mmgError"),em=document.getElementById("mmgErrorMsg");
      if(mb)mb.classList.add("hidden");if(cp)cp.classList.add("hidden");if(sc)sc.classList.add("hidden");
      if(ed)ed.classList.remove("hidden");if(em)em.textContent=err.message||"Something went wrong.";
    }finally{
      if(payBtn)payBtn.disabled=false;if(payText)payText.classList.remove("hidden");if(paySpinner)paySpinner.classList.add("hidden");
    }
  }

  async function handleMMGReturn(){
    var params=new URLSearchParams(window.location.search);
    var token=params.get("TOKEN")||params.get("token")||params.get("mmg_token");if(!token)return;
    window.history.replaceState({},document.title,window.location.pathname);
    showToast("Processing payment...","info",5000);
    try{
      var res=await fetch(CONFIG.MMG_VERIFY_WEBHOOK+"?TOKEN="+encodeURIComponent(token));var data=await res.json();
      var isSuccess=data.isSuccess===true||data.statusCode==="CONFIRMED"||(Array.isArray(data)&&data[0]&&(data[0]["statusCode "]==="CONFIRMED"||data[0].statusCode==="CONFIRMED"));
      var isCancelled=data.isCancelledByUser===true||data.resultCode==="6"||data.statusCode==="CANCELLED";
      sessionStorage.removeItem("mmg_pending_email");
      if(isSuccess)showToast("✓ Payment confirmed! Your booking is confirmed.","success",7000);
      else if(isCancelled)showToast("Payment was cancelled.","error",7000);
      else showToast("Payment could not be completed.","error",7000);
    }catch(err){console.error(err);showToast("Could not verify payment.","error",6000);}
  }

  // ── INIT ─────────────────────────────────────────────────────────────────
  function init(){
    handleMMGReturn();
    var mc=document.getElementById("mmgCloseBtn");if(mc)mc.addEventListener("click",closeMMGModal);
    var mo=document.getElementById("mmgOverlay");if(mo)mo.addEventListener("click",function(e){if(e.target===mo)closeMMGModal();});
    var mcp=document.getElementById("mmgConfirmPay");if(mcp)mcp.addEventListener("click",function(e){e.preventDefault();processMMGPayment();});
    var md=document.getElementById("mmgDoneBtn");if(md)md.addEventListener("click",closeMMGModal);
    var mr=document.getElementById("mmgRetryBtn");if(mr)mr.addEventListener("click",resetMMGModal);
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
