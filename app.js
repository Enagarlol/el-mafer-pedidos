(() => {
  const C = window.MAFER;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const money = (n) => "$" + n.toLocaleString("es-MX");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ---------- Estado (se guarda en el navegador para no perder el carrito) ----------
  const store = {
    load() { try { return JSON.parse(localStorage.getItem("mafer-v2") || "{}"); } catch { return {}; } },
    save() { try { localStorage.setItem("mafer-v2", JSON.stringify({ mode: state.mode, cart: state.cart })); } catch {} },
  };
  const saved = store.load();
  const state = {
    mode: saved.mode || "domicilio",
    cart: Array.isArray(saved.cart) ? saved.cart : [],
    cat: "todos",
    branch: C.sucursales[0].id,
  };

  const subtotal = () => state.cart.reduce((s, i) => s + i.precio * i.qty, 0);
  // El envío depende de la ubicación: aquí solo se suma el mínimo y el negocio lo confirma por WhatsApp
  const envio = () => (state.mode === "domicilio" && state.cart.length ? C.envioDesde : 0);
  const incluye = (p) => (p.incluye ? `<p class="incluye"><b>Incluye:</b> ${p.incluye.join(", ")}</p>` : "");

  // ---------- Abierto / cerrado ----------
  const H = C.horario;
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const hora12 = (h) => `${h % 12 || 12}:00 ${h < 12 ? "a.m." : "p.m."}`;
  const abiertoEn = (d) => H.dias.includes(d.getDay()) && d.getHours() >= H.abre && d.getHours() < H.cierra;
  const mismoDia = (a, b) => a.toDateString() === b.toDateString();

  // Primer momento en que abrimos a partir de `desde` (hoy si aún no abrimos, si no el siguiente día laboral)
  function proximaApertura(desde) {
    const t = new Date(desde);
    if (!(H.dias.includes(t.getDay()) && t.getHours() < H.abre)) {
      do t.setDate(t.getDate() + 1); while (!H.dias.includes(t.getDay()));
    }
    t.setHours(H.abre, 0, 0, 0);
    return t;
  }

  function diaRelativo(t, now) {
    if (mismoDia(t, now)) return "hoy";
    const manana = new Date(now);
    manana.setDate(now.getDate() + 1);
    return mismoDia(t, manana) ? "mañana" : `el ${DIAS[t.getDay()]}`;
  }

  function renderStatus() {
    const now = new Date();
    const open = abiertoEn(now);
    const el = $("#status");
    el.className = "status " + (open ? "is-open" : "is-closed");
    el.textContent = open
      ? `Abierto ahora · cerramos a las ${hora12(H.cierra)}`
      : `Cerrado · abrimos ${diaRelativo(proximaApertura(now), now)} a las ${hora12(H.abre)} (puedes programar tu pedido)`;
  }

  // ---------- Modo de entrega ----------
  function setMode(mode) {
    state.mode = mode;
    $$("[data-mode]").forEach((b) => b.setAttribute("aria-checked", b.dataset.mode === mode));
    $$("[data-show]").forEach((el) => (el.hidden = el.dataset.show !== mode));
    $("[name=direccion]").required = mode === "domicilio";
    store.save();
    renderCart();
  }

  // ---------- Menú ----------
  function renderChips() {
    $("#chips").innerHTML = C.categorias
      .map((c) => `<button class="chip" role="tab" data-cat="${c.id}" aria-selected="${c.id === state.cat}">${c.nombre}</button>`)
      .join("");
  }

  function renderGrid() {
    const items = C.productos.filter((p) => state.cat === "todos" || p.cat === state.cat);
    $("#grid").innerHTML = items
      .map((p) => {
        const precios = Object.values(p.tamanos);
        const desde = Math.min(...precios);
        return `
        <article class="card" data-id="${p.id}">
          ${p.tag ? `<span class="tag">${p.tag}</span>` : ""}
          <div class="card-emoji" aria-hidden="true">${p.emoji}</div>
          <h3>${p.nombre}</h3>
          <p>${p.desc}</p>
          ${incluye(p)}
          <div class="card-foot">
            <span class="price">${precios.length > 1 ? "<small>desde</small> " : ""}${money(desde)}</span>
            <button class="btn-add" data-open="${p.id}" aria-label="Agregar ${p.nombre}">+</button>
          </div>
        </article>`;
      })
      .join("");
  }

  // ---------- Modal de producto ----------
  function openProduct(id) {
    const p = C.productos.find((x) => x.id === id);
    const form = $("#product-form");
    const tamanos = Object.entries(p.tamanos);
    const salsas = p.salsas ? Object.entries(p.salsas) : [];
    // Un contador por tamaño, para pedir "pollo y medio" (1 entero + 1 medio) de una vez
    const multi = tamanos.length > 1;
    const cant = Object.fromEntries(tamanos.map(([t], i) => [t, i === 0 ? 1 : 0]));
    const contador = (t, sm) => `
      <div class="qty ${sm ? "qty-sm" : ""}">
        <button type="button" data-size="${t}" data-step="-1" aria-label="Menos ${t}">−</button>
        <output data-out="${t}">${cant[t]}</output>
        <button type="button" data-size="${t}" data-step="1" aria-label="Más ${t}">+</button>
      </div>`;
    form.innerHTML = `
      <div class="sheet-head">
        <h3>${p.emoji} ${p.nombre}</h3>
        <button class="icon-btn" value="cancel" aria-label="Cerrar">✕</button>
      </div>
      <p class="muted">${p.desc}</p>
      ${incluye(p)}
      ${multi ? `
        <h4>${p.cat === "pollos" ? "¿Cuánto pollo?" : "Cantidad"}</h4>
        ${p.cat === "pollos" ? `<p class="hint">Puedes combinar: 1 entero + 1 medio = pollo y medio.</p>` : ""}
        <div class="options">
          ${tamanos.map(([t, pr]) => `
            <div class="option size-row" data-row="${t}">
              <span>${t}</span><b>${money(pr)}</b>${contador(t, true)}
            </div>`).join("")}
        </div>` : ""}
      ${salsas.length ? `<h4>Salsa</h4><div class="options">
        ${salsas.map(([s, pr], i) => `
          <label class="option"><input type="radio" name="salsa" value="${s}" ${i === 0 ? "checked" : ""}>
            <span>${s}</span><b>${pr ? "+" + money(pr) : ""}</b></label>`).join("")}
      </div>` : ""}
      <div class="qty-row">
        ${multi ? "" : contador(tamanos[0][0])}
        <button class="btn-primary" value="add" id="add-btn">Agregar</button>
      </div>`;

    const calc = () => {
      const salsa = new FormData(form).get("salsa");
      const extra = p.salsas ? p.salsas[salsa] : 0;
      const items = Object.entries(cant).filter(([, q]) => q > 0);
      const total = items.reduce((s, [t, q]) => s + (p.tamanos[t] + extra) * q, 0);
      $$("[data-row]", form).forEach((r) => r.classList.toggle("on", cant[r.dataset.row] > 0));
      const btn = $("#add-btn");
      btn.disabled = !items.length;
      btn.textContent = items.length ? `Agregar · ${money(total)}` : "Elige una cantidad";
      return { extra, items, salsa };
    };
    form.onchange = calc;
    form.onclick = (e) => {
      const b = e.target.closest("[data-step]");
      if (!b) return;
      const t = b.dataset.size;
      cant[t] = Math.max(multi ? 0 : 1, Math.min(20, cant[t] + +b.dataset.step));
      $(`[data-out="${t}"]`, form).textContent = cant[t];
      calc();
    };
    calc();

    form.onsubmit = (e) => {
      if (e.submitter?.value !== "add") return;
      const o = calc();
      for (const [t, q] of o.items) {
        const key = [p.id, t, o.salsa].join("|");
        const line = state.cart.find((i) => i.key === key);
        if (line) line.qty += q;
        else state.cart.push({
          key, id: p.id, emoji: p.emoji, nombre: p.nombre,
          detalle: [multi ? t : "", o.salsa || ""].filter(Boolean).join(" · "),
          precio: p.tamanos[t] + o.extra, qty: q,
        });
      }
      store.save();
      renderCart();
      bump();
    };
    $("#product-dialog").showModal();
  }

  // ---------- Carrito ----------
  function renderCart() {
    const count = state.cart.reduce((s, i) => s + i.qty, 0);
    const total = subtotal() + envio();
    $("#cart-fab").hidden = count === 0;
    $("#cart-count").textContent = count;
    $("#cart-fab-total").textContent = money(total);
    $("#envio-label").textContent = `Envío desde ${money(C.envioDesde)}`;

    $("#cart-list").innerHTML = state.cart.length
      ? state.cart.map((i, idx) => `
        <li>
          <span class="cart-emoji">${i.emoji}</span>
          <div class="cart-info"><strong>${i.nombre}</strong>${i.detalle ? `<small>${esc(i.detalle)}</small>` : ""}</div>
          <div class="qty qty-sm">
            <button data-line="${idx}" data-d="-1" aria-label="Menos">−</button>
            <output>${i.qty}</output>
            <button data-line="${idx}" data-d="1" aria-label="Más">+</button>
          </div>
          <b>${money(i.precio * i.qty)}</b>
        </li>`).join("")
      : `<li class="empty">Tu pedido está vacío. ¡Agrega un pollo! 🍗</li>`;

    const domicilio = state.mode === "domicilio";
    $("#totals").innerHTML = `
      <div><span>Subtotal</span><span>${money(subtotal())}</span></div>
      ${domicilio ? `<div><span>Envío</span><span>desde ${money(C.envioDesde)}</span></div>` : ""}
      <div class="grand"><span>${domicilio ? "Total estimado" : "Total"}</span><span>${money(total)}</span></div>
      ${domicilio ? `<p class="note">El envío depende de tu ubicación; te confirmamos el total por WhatsApp.</p>` : ""}`;
    $("#checkout [type=submit]").disabled = !state.cart.length;
  }

  function bump() {
    const fab = $("#cart-fab");
    fab.classList.remove("bump");
    void fab.offsetWidth;
    fab.classList.add("bump");
  }

  // ---------- Sucursales y mapa ----------
  function renderBranches() {
    $("#branches").innerHTML = C.sucursales.map((s) => `
      <button class="branch" data-branch="${s.id}" aria-pressed="${s.id === state.branch}">
        <strong>📍 ${s.nombre}</strong>
        <span>${s.direccion}</span>
        <small>🕒 ${s.horario} · ☎ ${s.telefono}</small>
        <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.mapa)}"
           target="_blank" rel="noopener">Cómo llegar →</a>
      </button>`).join("");
    const s = C.sucursales.find((x) => x.id === state.branch);
    $("#map").src = `https://www.google.com/maps?q=${encodeURIComponent(s.mapa)}&output=embed`;
    $("#sucursal-select").innerHTML = C.sucursales
      .map((x) => `<option value="${x.id}" ${x.id === state.branch ? "selected" : ""}>${x.nombre}</option>`).join("");
  }

  function renderHours() {
    const now = new Date();
    const t = new Date(now);
    t.setMinutes(Math.ceil((t.getMinutes() + 30) / 15) * 15, 0, 0);
    // Si ya cerramos (o es domingo), se ofrecen horas del siguiente día que abrimos
    if (!abiertoEn(t)) t.setTime(proximaApertura(t).getTime());
    const dia = diaRelativo(t, now);
    const prefijo = dia === "hoy" ? "" : dia.replace(/^el /, "").replace(/^./, (c) => c.toUpperCase()) + " ";
    const listoEn20 = new Date(now.getTime() + 20 * 60000);
    const opts = abiertoEn(now) && abiertoEn(listoEn20) ? ["Lo antes posible (~20 min)"] : [];
    while (t.getHours() < H.cierra) {
      opts.push(prefijo + t.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }));
      t.setMinutes(t.getMinutes() + 15);
    }
    $("#hora-select").innerHTML = opts.map((o) => `<option>${o}</option>`).join("");
  }

  // ---------- Enviar pedido por WhatsApp ----------
  // Sin emojis ni símbolos (🍗 ✅ ☎ ⏰…): dentro del enlace WhatsApp los convierte en "�". Acentos, · × y » sí llegan bien.
  // El ticket va entre ``` para que WhatsApp lo muestre en letra de ancho fijo y los precios queden alineados.
  const ANCHO = 30;
  const fila = (izq, der) => {
    const max = ANCHO - der.length - 1;
    if (izq.length > max) izq = izq.slice(0, max - 1) + "…";
    return izq + " ".repeat(ANCHO - izq.length - der.length) + der;
  };

  function buildMessage(f) {
    const domicilio = state.mode === "domicilio";
    const total = subtotal() + envio();
    const folio = Date.now().toString(36).slice(-4).toUpperCase();
    const suc = C.sucursales.find((s) => s.id === f.sucursal);
    const cambio = domicilio && f.pago === "Efectivo" && f.cambio ? +f.cambio : 0;

    const ticket = [
      ...state.cart.flatMap((i) => [
        fila(`${i.qty}× ${i.nombre}`, money(i.precio * i.qty)),
        i.detalle ? `   ${i.detalle}` : null,
      ]),
      "-".repeat(ANCHO),
      domicilio ? fila("Subtotal", money(subtotal())) : null,
      domicilio ? fila("Envío (desde)", money(C.envioDesde)) : null,
      fila(domicilio ? "TOTAL ESTIMADO" : "TOTAL", money(total)),
    ];

    return [
      `*EL MAFER · POLLO ASADO*`,
      `*Nuevo pedido #${folio}*`,
      domicilio ? `» *A DOMICILIO*` : `» *PASA A RECOGER*`,
      ``,
      "```",
      ...ticket,
      "```",
      domicilio ? `_El envío se confirma según la ubicación._` : null,
      ``,
      `*CLIENTE*`,
      `${f.nombre}`,
      `Tel. ${f.telefono}`,
      ``,
      domicilio ? `*ENTREGA*` : `*RECOGE*`,
      ...(domicilio
        ? [`${f.direccion}`, f.referencias ? `_Ref: ${f.referencias}_` : null]
        : [`${suc.nombre}`, `Hora: *${f.hora}*`]),
      ``,
      `*PAGO*`,
      cambio
        ? `${f.pago} · paga con ${money(cambio)} · cambio ${money(cambio - total)}`
        : f.pago,
      ...(f.notas ? [``, `*NOTAS*`, `_${f.notas}_`] : []),
    ]
      .filter((l) => l !== null)
      .join("\n");
  }

  function sendOrder(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const cambio = e.target.cambio;
    const pagaConPoco = state.mode === "domicilio" && f.pago === "Efectivo" && f.cambio && +f.cambio < subtotal() + envio();
    cambio.setCustomValidity(pagaConPoco ? `Debe ser al menos ${money(subtotal() + envio())}` : "");
    if (!e.target.reportValidity()) return;
    window.open(`https://wa.me/${C.whatsapp}?text=${encodeURIComponent(buildMessage(f))}`, "_blank");
    state.cart = [];
    store.save();
    renderCart();
    $("#cart-dialog").close();
  }

  // ---------- Eventos ----------
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-mode],[data-cat],[data-open],[data-line],[data-branch],[data-close],#cart-fab");
    if (!t) return;
    if (t.dataset.mode) setMode(t.dataset.mode);
    else if (t.dataset.cat) { state.cat = t.dataset.cat; renderChips(); renderGrid(); }
    else if (t.dataset.open) openProduct(t.dataset.open);
    else if (t.dataset.line) {
      const line = state.cart[+t.dataset.line];
      line.qty += +t.dataset.d;
      if (line.qty <= 0) state.cart.splice(+t.dataset.line, 1);
      store.save();
      renderCart();
    } else if (t.dataset.branch) {
      if (e.target.closest("a")) return;
      state.branch = t.dataset.branch;
      renderBranches();
    } else if (t.hasAttribute("data-close")) t.closest("dialog").close();
    else if (t.id === "cart-fab") { renderHours(); $("#cart-dialog").showModal(); }
  });

  // Toda la tarjeta abre el producto, no solo el botón +
  $("#grid").addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (card && !e.target.closest("[data-open]")) openProduct(card.dataset.id);
  });

  // Cerrar diálogos al tocar fuera
  $$("dialog").forEach((d) => d.addEventListener("click", (e) => { if (e.target === d) d.close(); }));

  $("#checkout").addEventListener("submit", sendOrder);
  $("#checkout").addEventListener("input", (e) => {
    if (e.target.name === "cambio") e.target.setCustomValidity("");
  });
  $("#checkout").addEventListener("change", (e) => {
    if (e.target.name === "pago") $("#cambio-wrap").hidden = state.mode !== "domicilio" || e.target.value !== "Efectivo";
  });

  renderStatus();
  renderChips();
  renderGrid();
  renderBranches();
  setMode(state.mode);
})();
