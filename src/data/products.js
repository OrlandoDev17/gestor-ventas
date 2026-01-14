// CONFIGURACIÓN DE PRODUCTOS
// Edita este archivo para cambiar los precios y nombres.

export const DESSERTS = [
  { id: 1, name: "Red Velvet", price: 5, currency: "USD" },
  { id: 2, name: "Cheesecake", price: 5, currency: "USD" },
  { id: 3, name: "Beso de angel", price: 5, currency: "USD" },
  { id: 4, name: "Chocoquesillo", price: 5, currency: "USD" },
  { id: 5, name: "Quesillo", price: 4, currency: "USD" },
  { id: 6, name: "Pie", price: 4, currency: "USD" },
  { id: 7, name: "3 Leches", price: 4, currency: "USD" },
  { id: 8, name: "Marquesa de Chocolate", price: 4, currency: "USD" },
  { id: 9, name: "Selva Negra", price: 4, currency: "USD" },
  { id: 10, name: "Oreo", price: 4, currency: "USD" },
  { id: 11, name: "Malteada", price: 6, currency: "USD" },
  { id: 12, name: "Waffle", price: 5, currency: "USD" },
];

export const WHOLE_CAKES = [
  { id: 201, name: "Quesillo 1kg", price: 15, currency: "USD" },
  { id: 202, name: "Quesillo decorado 1kg", price: 25, currency: "USD" },
  { id: 203, name: "Chocoquesillo 1kg", price: 20, currency: "USD" },
  { id: 204, name: "Chocoquesillo decorado 1kg", price: 25, currency: "USD" },
  { id: 205, name: "Chocoquesillo 2kg", price: 36, currency: "USD" },
  { id: 206, name: "Chocoquesillo decorado 2kg", price: 42, currency: "USD" },
  { id: 207, name: "Selva Negra 1kg", price: 20, currency: "USD" },
  { id: 208, name: "Selva Negra 2kg", price: 28, currency: "USD" },
  { id: 209, name: "Oreo 1kg", price: 20, currency: "USD" },
  { id: 210, name: "Oreo 2kg", price: 28, currency: "USD" },
  { id: 211, name: "Pie 2kg", price: 35, currency: "USD" },
  { id: 212, name: "3 Leches 1.5kg", price: 25, currency: "USD" },
  { id: 212, name: "3 Leches 3kg", price: 45, currency: "USD" },
  { id: 213, name: "Beso de Angel 2kg", price: 30, currency: "USD" },
  { id: 214, name: "Beso de Angel 4kg", price: 50, currency: "USD" },
  { id: 215, name: "Red Velvet 1kg", price: 25, currency: "USD" },
  { id: 216, name: "Red Velvet 2kg", price: 45, currency: "USD" },
  { id: 217, name: "Cheesecake 2kg", price: 45, currency: "USD" },
  { id: 218, name: "Vainifresa 2kg", price: 25, currency: "USD" },
];

export const DRINKS = [
  { id: 101, name: "Malta", price: 300, currency: "VES" },
  { id: 102, name: "Refresco", price: 300, currency: "VES" },
  { id: 103, name: "Agua Mineral", price: 2, currency: "USD" },
  { id: 104, name: "Té", price: 2, currency: "USD" },
  { id: 105, name: "Gatorade", price: 2.5, currency: "USD" },
];

// Estructura Agrupada para el Modal
export const ALL_PRODUCTS_GROUPED = [
  { label: "Postres / Raciones", options: DESSERTS },
  { label: "Tortas Completas", options: WHOLE_CAKES },
  { label: "Bebidas", options: DRINKS },
];

// Helper plano por si se necesita buscar por ID
export const ALL_PRODUCTS_FLAT = [...DESSERTS, ...WHOLE_CAKES, ...DRINKS];
