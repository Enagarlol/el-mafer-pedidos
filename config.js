// Todo lo que el negocio necesita cambiar vive aquí: menú, precios, sucursales y WhatsApp.
// Los datos de sucursales y el número son de EJEMPLO, reemplázalos por los reales.
window.MAFER = {
  whatsapp: "521234567890", // 52 + 1 + 10 dígitos, sin espacios
  envio: 35,
  pedidoMinimoDomicilio: 150,
  horario: { abre: 11, cierra: 21 }, // 24 h

  sucursales: [
    {
      id: "centro",
      nombre: "Sucursal Centro",
      direccion: "Av. Principal 123, Centro",
      mapa: "Av. Principal 123, Centro",
      telefono: "123 456 7890",
      horario: "Lun a Dom · 11:00 – 21:00",
    },
    {
      id: "norte",
      nombre: "Sucursal Norte",
      direccion: "Blvd. Norte 456, Col. Las Palmas",
      mapa: "Blvd. Norte 456, Las Palmas",
      telefono: "123 456 7891",
      horario: "Mar a Dom · 12:00 – 20:00",
    },
  ],

  categorias: [
    { id: "todos", nombre: "Todo" },
    { id: "pollos", nombre: "🍗 Pollos" },
    { id: "combos", nombre: "🔥 Combos" },
    { id: "extras", nombre: "🌽 Complementos" },
    { id: "bebidas", nombre: "🥤 Bebidas" },
  ],

  // tamanos: precio por porción. salsas: opcionales, con costo extra si lo tienen.
  productos: [
    {
      id: "asado", cat: "pollos", emoji: "🍗", nombre: "Pollo Asado",
      desc: "Marinado en achiote y naranja, asado al carbón.",
      tamanos: { "Entero": 189, "Medio": 105, "Cuarto": 60 },
      tag: "El favorito",
    },
    {
      id: "campero", cat: "pollos", emoji: "🌶️", nombre: "Pollo Campero",
      desc: "Adobo de chiles secos y especias de rancho.",
      tamanos: { "Entero": 199, "Medio": 110, "Cuarto": 62 },
    },
    {
      id: "bbq", cat: "pollos", emoji: "🔥", nombre: "Pollo BBQ",
      desc: "Bañado en salsa BBQ ahumada y glaseado al carbón.",
      tamanos: { "Entero": 215, "Medio": 120, "Cuarto": 68 },
      salsas: { "BBQ clásica": 0, "BBQ chipotle": 0, "BBQ mango habanero": 10 },
    },
    {
      id: "salsas", cat: "pollos", emoji: "🥫", nombre: "Pollo en Salsa",
      desc: "Pollo asado bañado en la salsa que elijas.",
      tamanos: { "Entero": 209, "Medio": 115, "Cuarto": 65 },
      salsas: { "Búfalo": 0, "Mango habanero": 0, "Ajo parmesano": 0, "Tamarindo chipotle": 0 },
    },
    {
      id: "familiar", cat: "combos", emoji: "👨‍👩‍👧‍👦", nombre: "Combo Familiar",
      desc: "2 pollos asados, arroz, frijoles, tortillas y refresco 2 L.",
      tamanos: { "Para 6–8": 449 },
      tag: "Ahorra $60",
    },
    {
      id: "pareja", cat: "combos", emoji: "💛", nombre: "Combo Pareja",
      desc: "1 pollo asado, papas, ensalada, tortillas y 2 aguas frescas.",
      tamanos: { "Para 2–3": 259 },
    },
    {
      id: "arroz", cat: "extras", emoji: "🍚", nombre: "Arroz rojo",
      desc: "Porción para compartir.", tamanos: { "Chico": 30, "Grande": 50 },
    },
    {
      id: "frijoles", cat: "extras", emoji: "🫘", nombre: "Frijoles charros",
      desc: "Con tocino y chorizo.", tamanos: { "Chico": 35, "Grande": 55 },
    },
    {
      id: "papas", cat: "extras", emoji: "🍟", nombre: "Papas a la francesa",
      desc: "Crujientes, con sal de la casa.", tamanos: { "Orden": 45 },
    },
    {
      id: "tortillas", cat: "extras", emoji: "🫓", nombre: "Tortillas",
      desc: "De maíz, recién hechas.", tamanos: { "½ kg": 18, "1 kg": 32 },
    },
    {
      id: "refresco", cat: "bebidas", emoji: "🥤", nombre: "Refresco",
      desc: "Cola, naranja o limón.", tamanos: { "600 ml": 25, "2 L": 45 },
    },
    {
      id: "agua", cat: "bebidas", emoji: "🍹", nombre: "Agua fresca",
      desc: "Horchata, jamaica o del día.", tamanos: { "1 L": 35 },
    },
  ],
};
