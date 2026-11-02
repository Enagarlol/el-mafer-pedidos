// Todo lo que el negocio necesita cambiar vive aquí: menú, precios, sucursal y WhatsApp.
window.MAFER = {
  whatsapp: "529622560427", // 52 + 10 dígitos, sin espacios
  envioDesde: 35, // el costo real depende de la ubicación y se confirma por WhatsApp
  horario: { abre: 9, cierra: 17, dias: [1, 2, 3, 4, 5, 6] }, // 24 h · días: 0 = domingo … 6 = sábado

  sucursales: [
    {
      id: "matriz",
      nombre: "Pollos Asados El Mafer",
      direccion: "30 Oriente 35, Local A, esq. Callejón del Zapato, Col. Benito Juárez, C.P. 30790",
      mapa: "14.8896096,-92.2692316", // coordenadas del local (Tapachula, Chis.), de https://maps.app.goo.gl/8BGB2DndiWXkT7xg7
      telefono: "962 256 0427",
      horario: "Lun a Sáb · 9:00 a.m. – 5:00 p.m. · Domingo cerrado",
    },
  ],

  redes: [
    { red: "instagram", nombre: "Instagram", usuario: "@el.mafer", url: "https://www.instagram.com/el.mafer/" },
    { red: "facebook", nombre: "Facebook", usuario: "El Mafer", url: "https://www.facebook.com/profile.php?id=61592933766319" },
    { red: "tiktok", nombre: "TikTok", usuario: "@pollos.asados.el.m", url: "https://www.tiktok.com/@pollos.asados.el.m" },
  ],

  categorias: [
    { id: "todos", nombre: "Todo" },
    { id: "pollos", nombre: "🍗 Pollos" },
    { id: "extras", nombre: "🫘 Complementos" },
  ],

  // tamanos: precio por porción. salsas: a elegir, con costo extra si lo tienen.
  // incluye: complementos que ya trae el pollo.
  productos: [
    {
      id: "natural", cat: "pollos", emoji: "🍗", nombre: "Pollo Asado Natural",
      desc: "Asado al carbón. Entero, medio o cuarto.",
      incluye: ["Frijol", "Ensalada de col", "Salsa roja", "Cebolla asada", "Chiles asados"],
      tamanos: { "Entero": 200, "Medio": 100, "Cuarto": 55 },
      tag: "El clásico",
    },
    {
      id: "banado", cat: "pollos", emoji: "🔥", nombre: "Pollo Asado Bañado",
      desc: "Asado y bañado en la salsa que elijas.",
      incluye: ["Ensalada de col", "Frijol", "Ranch"],
      tamanos: { "Entero": 200, "Medio": 100, "Cuarto": 55 },
      salsas: { "Mango habanero": 0, "BBQ": 0, "Búfalo": 0 },
    },
    {
      id: "campero", cat: "pollos", emoji: "🌶️", nombre: "Pollo Campero",
      desc: "Estilo campero. Pídelo bañado en salsa por +$15.",
      incluye: ["Frijol", "Ensalada de col", "Salsa"],
      tamanos: { "Entero": 200, "Medio": 100, "Cuarto": 55 },
      salsas: { "Sin bañar": 0, "Mango habanero": 15, "BBQ": 15, "Búfalo": 15 },
    },
    { id: "x-frijol", cat: "extras", emoji: "🫘", nombre: "Frijol extra", desc: "Porción extra.", tamanos: { "Porción": 10 } },
    { id: "x-col", cat: "extras", emoji: "🥗", nombre: "Ensalada de col extra", desc: "Porción extra.", tamanos: { "Porción": 10 } },
    { id: "x-salsa", cat: "extras", emoji: "🌶️", nombre: "Salsa roja extra", desc: "Porción extra.", tamanos: { "Porción": 10 } },
    { id: "x-cebolla", cat: "extras", emoji: "🧅", nombre: "Cebolla asada extra", desc: "Porción extra.", tamanos: { "Porción": 10 } },
    { id: "x-chiles", cat: "extras", emoji: "🫑", nombre: "Chiles asados extra", desc: "Porción extra.", tamanos: { "Porción": 10 } },
    {
      id: "x-salsas", cat: "extras", emoji: "🥫", nombre: "Salsa extra",
      desc: "Porción extra de la salsa que elijas.", tamanos: { "Porción": 15 },
      salsas: { "Ranch": 0, "BBQ": 0, "Mango habanero": 0, "Búfalo": 0 },
    },
    {
      id: "tortillas", cat: "extras", emoji: "🫓", nombre: "Tortillas",
      desc: "De maíz.", tamanos: { "Medio kilo": 10, "Kilo": 20 },
    },
  ],
};
