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
  function renderStatus() {
    const h = new Date().getHours();
    const open = h >= C.horario.abre && h < C.horario.cierra;
    const el = $("#status");
    el.className = "status " + (open ? "is-open" : "is-closed");
    el.textContent = open
      ? `Abierto ahora · cerramos a las ${C.horario.cierra}:00`
      : `Cerrado · abrimos a las ${C.horario.abre}:00 (puedes programar tu pedido)`;
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
    form.innerHTML = `
      <div class="sheet-head">
        <h3>${p.emoji} ${p.nombre}</h3>
        <button class="icon-btn" value="cancel" aria-label="Cerrar">✕</button>
      </div>
      <p class="muted">${p.desc}</p>
      ${incluye(p)}
      ${tamanos.length > 1 ? `<h4>Tamaño</h4>` : ""}
      <div class="options" ${tamanos.length > 1 ? "" : "hidden"}>
        ${tamanos.map(([t, pr], i) => `
          <label class="option"><input type="radio" name="tamano" value="${t}" ${i === 0 ? "checked" : ""}>
            <span>${t}</span><b>${money(pr)}</b></label>`).join("")}
      </div>
      ${salsas.length ? `<h4>Salsa</h4><div class="options">
        ${salsas.map(([s, pr], i) => `
          <label class="option"><input type="radio" name="salsa" value="${s}" ${i === 0 ? "checked" : ""}>
            <span>${s}</span><b>${pr ? "+" + money(pr) : ""}</b></label>`).join("")}
      </div>` : ""}
      <div class="qty-row">
        <div class="qty">
          <button type="button" data-step="-1" aria-label="Menos">−</button>
          <output name="qty">1</output>
          <button type="button" data-step="1" aria-label="Más">+</button>
        </div>
        <button class="btn-primary" value="add" id="add-btn">Agregar</button>
      </div>`;

    const calc = () => {
      const fd = new FormData(form);
      const base = p.tamanos[fd.get("tamano")];
      const extra = p.salsas ? p.salsas[fd.get("salsa")] : 0;
      const qty = +form.qty.value;
      $("#add-btn").textContent = `Agregar · ${money((base + extra) * qty)}`;
      return { base: base + extra, qty, tamano: fd.get("tamano"), salsa: fd.get("salsa") };
    };
    form.onchange = calc;
    form.onclick = (e) => {
      const step = e.target.dataset.step;
      if (!step) return;
      form.qty.value = Math.max(1, Math.min(20, +form.qty.value + +step));
      calc();
    };
    calc();

    form.onsubmit = (e) => {
      if (e.submitter?.value !== "add") return;
      const o = calc();
      const key = [p.id, o.tamano, o.salsa].join("|");
      const line = state.cart.find((i) => i.key === key);
      if (line) line.qty += o.qty;
      else state.cart.push({
        key, id: p.id, emoji: p.emoji, nombre: p.nombre,
        detalle: [Object.keys(p.tamanos).length > 1 ? o.tamano : "", o.salsa || ""].filter(Boolean).join(" · "),
        precio: o.base, qty: o.qty,
      });
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
    // Si ya cerramos, se ofrecen horas de mañana
    const manana = t.getHours() >= C.horario.cierra || t.getDate() !== now.getDate();
    if (manana) {
      t.setDate(now.getDate() + 1);
      t.setHours(C.horario.abre, 0, 0, 0);
    }
    const abierto = !manana && now.getHours() >= C.horario.abre;
    const opts = abierto ? ["Lo antes posible (~20 min)"] : [];
    while (t.getHours() < C.horario.cierra && opts.length < 16) {
      if (t.getHours() >= C.horario.abre) {
        const hora = t.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
        opts.push(manana ? `Mañana ${hora}` : hora);
      }
      t.setMinutes(t.getMinutes() + 15);
    }
    $("#hora-select").innerHTML = opts.map((o) => `<option>${o}</option>`).join("");
  }

  // ---------- Enviar pedido por WhatsApp ----------
  function sendOrder(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const suc = C.sucursales.find((s) => s.id === f.sucursal);
    const lines = [
      `*Nuevo pedido · El Mafer* 🍗`,
      `*${state.mode === "domicilio" ? "🛵 A DOMICILIO" : "🏪 PASA A RECOGER"}*`,
      ``,
      ...state.cart.map((i) => `• ${i.qty}× ${i.nombre}${i.detalle ? ` (${i.detalle})` : ""} — ${money(i.precio * i.qty)}`),
      ``,
      `Subtotal: ${money(subtotal())}`,
      state.mode === "domicilio" ? `Envío: desde ${money(C.envioDesde)} (por confirmar según ubicación)` : null,
      state.mode === "domicilio"
        ? `*Total estimado: ${money(subtotal() + envio())}*`
        : `*Total: ${money(subtotal())}*`,
      ``,
      `👤 ${f.nombre} · ${f.telefono}`,
      state.mode === "domicilio"
        ? `📍 ${f.direccion}${f.referencias ? ` (${f.referencias})` : ""}`
        : `📍 ${suc.nombre} · 🕒 ${f.hora}`,
      `💰 ${f.pago}${state.mode === "domicilio" && f.pago === "Efectivo" && f.cambio ? ` · paga con ${money(+f.cambio)}` : ""}`,
      f.notas ? `📝 ${f.notas}` : null,
    ].filter((l) => l !== null);

    window.open(`https://wa.me/${C.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
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
  $("#checkout").addEventListener("change", (e) => {
    if (e.target.name === "pago") $("#cambio-wrap").hidden = state.mode !== "domicilio" || e.target.value !== "Efectivo";
  });

  renderStatus();
  renderChips();
  renderGrid();
  renderBranches();
  setMode(state.mode);
})();
