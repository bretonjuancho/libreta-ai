import type { EstadoApp, Item, Operacion, Producto, Cliente } from './types'
import { CATALOGO_PRODUCTOS } from './datos-base'

export const PERFIL = {
  nombre: 'Almacén Don Pedro',
} as const

// El inventario inicial se arma desde el catálogo base: así los nombres y precios
// que reconoce el parser al dictar son exactamente los mismos que hay en stock.
const productos: Producto[] = CATALOGO_PRODUCTOS.map((p) => ({
  id: p.id,
  nombre: p.nombre,
  stock: p.stock_inicial,
  stock_minimo: p.stock_minimo,
  precio: p.precio,
  unidad: p.unidad,
}))

function item(id: string, cantidad: number, precio?: number): Item {
  const p = CATALOGO_PRODUCTOS.find((x) => x.id === id)
  if (!p) throw new Error(`Producto de demo inexistente: ${id}`)
  return { producto: p.nombre, cantidad, precio_unitario: precio ?? p.precio }
}

function total(items: Item[]): number {
  return items.reduce((acc, it) => acc + it.cantidad * it.precio_unitario, 0)
}

function nuevoId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID()
    }
  } catch {
    // cae al fallback de abajo
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

// Si no se pasa monto, se calcula a partir de los ítems (mercadería).
function op(base: Omit<Operacion, 'id' | 'monto_total'>, monto?: number): Operacion {
  return { id: nuevoId(), monto_total: monto ?? total(base.items), ...base }
}

const ahora = new Date()

// Días atrás respecto de hoy, a la hora indicada.
function fecha(diasAtras: number, h: number, m: number): string {
  const d = new Date(ahora)
  d.setDate(d.getDate() - diasAtras)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

// Meses atrás, para darle volumen a los gráficos de mes y año.
function fechaMes(mesesAtras: number, dia: number, h: number, m: number): string {
  const d = new Date(ahora)
  d.setMonth(d.getMonth() - mesesAtras, dia)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

const historial: Operacion[] = [
  // ── Hoy ────────────────────────────────────────────────────────────────
  op(
    {
      tipo_operacion: 'INGRESO_STOCK',
      cliente: null,
      medio_pago: null,
      motivo_salida: null,
      items: [item('leche-entera', 24), item('yogur', 12), item('manteca', 12), item('crema', 12)],
      texto_original: 'Reparto de lácteos: 24 leches, 12 yogures, manteca y crema',
      fecha: fecha(0, 6, 30),
    },
    0,
  ),
  op(
    {
      tipo_operacion: 'INGRESO_STOCK',
      cliente: null,
      medio_pago: null,
      motivo_salida: null,
      items: [item('pan', 40), item('facturas', 60)],
      texto_original: 'Llegó el pan y las facturas',
      fecha: fecha(0, 6, 50),
    },
    0,
  ),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'EFECTIVO',
    motivo_salida: null,
    items: [item('pan', 4), item('facturas', 6)],
    texto_original: 'Venta: 4 panes y media docena de facturas',
    fecha: fecha(0, 7, 5),
  }),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'TRANSFERENCIA',
    motivo_salida: null,
    items: [item('leche-entera', 2), item('galletitas-agua', 1)],
    texto_original: 'Vendí 2 leches y galletitas por transferencia',
    fecha: fecha(0, 7, 40),
  }),
  op({
    tipo_operacion: 'NUEVO_DEUDA',
    cliente: 'Marta',
    medio_pago: 'PENDIENTE',
    motivo_salida: null,
    items: [item('pan', 3), item('leche-entera', 1)],
    texto_original: 'Anotale 3 panes y una leche a Marta',
    fecha: fecha(0, 8, 5),
  }),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'EFECTIVO',
    motivo_salida: null,
    items: [item('cigarrillos', 2), item('coca-15', 1), item('alfajor', 2)],
    texto_original: '2 atados, una coca y 2 alfajores',
    fecha: fecha(0, 8, 35),
  }),
  op(
    {
      tipo_operacion: 'SALIDA_STOCK',
      cliente: null,
      medio_pago: null,
      motivo_salida: 'VENCIMIENTO',
      items: [item('yogur', 3), item('queso-cremoso', 1)],
      texto_original: 'Se venció el yogur y un queso',
      fecha: fecha(0, 9, 10),
    },
    0,
  ),
  op(
    {
      tipo_operacion: 'GASTO_OPERATIVO',
      cliente: null,
      medio_pago: 'EFECTIVO',
      motivo_salida: null,
      items: [],
      texto_original: 'Pagué la boleta de luz $18500',
      fecha: fecha(0, 9, 45),
    },
    18500,
  ),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'TRANSFERENCIA',
    motivo_salida: null,
    items: [
      item('lavandina', 1),
      item('detergente', 1),
      item('jabon-polvo', 1),
      item('rollo-cocina', 2),
    ],
    texto_original: 'Productos de limpieza por transferencia',
    fecha: fecha(0, 10, 15),
  }),
  op(
    {
      tipo_operacion: 'INGRESO_STOCK',
      cliente: null,
      medio_pago: null,
      motivo_salida: null,
      items: [item('coca-15', 24), item('agua-2l', 24), item('cerveza-lit', 24)],
      texto_original: 'Reparto de bebidas: 24 cocas, 24 aguas y 24 cervezas',
      fecha: fecha(0, 10, 50),
    },
    0,
  ),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'EFECTIVO',
    motivo_salida: null,
    items: [
      item('arroz-1kg', 2),
      item('fideos-lucchetti', 3),
      item('aceite-girasol', 1),
      item('azucar-1kg', 1),
    ],
    texto_original: 'Compra de almacén en efectivo',
    fecha: fecha(0, 11, 20),
  }),
  op({
    tipo_operacion: 'NUEVO_DEUDA',
    cliente: 'Laura',
    medio_pago: 'PENDIENTE',
    motivo_salida: null,
    items: [item('galletitas-agua', 2), item('yerba-playadito', 1), item('azucar-1kg', 1)],
    texto_original: 'Anotale galletitas, yerba y azúcar a Laura',
    fecha: fecha(0, 11, 55),
  }),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'TRANSFERENCIA',
    motivo_salida: null,
    items: [item('queso-cremoso', 0.5), item('jamon-cocido', 0.5)],
    texto_original: 'Medio kilo de queso y medio de jamón',
    fecha: fecha(0, 12, 25),
  }),
  op(
    {
      tipo_operacion: 'PAGO_DEUDA',
      cliente: 'Tano',
      medio_pago: 'EFECTIVO',
      motivo_salida: null,
      items: [],
      texto_original: 'El Tano me pagó $5000 de su deuda',
      fecha: fecha(0, 12, 50),
    },
    5000,
  ),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'EFECTIVO',
    motivo_salida: null,
    items: [item('hamburguesas', 1), item('papas-congeladas', 1)],
    texto_original: 'Hamburguesas y papas congeladas',
    fecha: fecha(0, 13, 30),
  }),
  op(
    {
      tipo_operacion: 'SALIDA_STOCK',
      cliente: null,
      medio_pago: null,
      motivo_salida: 'ROTURA',
      items: [item('coca-15', 2)],
      texto_original: 'Se rompieron 2 cocas',
      fecha: fecha(0, 14, 5),
    },
    0,
  ),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'TRANSFERENCIA',
    motivo_salida: null,
    items: [item('galletitas-agua', 2)],
    texto_original: 'Venta contado 2 galletitas por transferencia',
    fecha: fecha(0, 14, 20),
  }),
  op({
    tipo_operacion: 'NUEVO_DEUDA',
    cliente: 'Tano',
    medio_pago: 'PENDIENTE',
    motivo_salida: null,
    items: [item('vino-comun', 2), item('coca-15', 2), item('papas-fritas', 2)],
    texto_original: 'Anotale al Tano 2 vinos, 2 cocas y papas',
    fecha: fecha(0, 15, 15),
  }),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'EFECTIVO',
    motivo_salida: null,
    items: [item('pan', 6), item('criollos', 4), item('huevos', 1)],
    texto_original: 'Pan, criollos y una docena de huevos',
    fecha: fecha(0, 16, 0),
  }),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'TRANSFERENCIA',
    motivo_salida: null,
    items: [item('leche-entera', 6), item('yogur', 2)],
    texto_original: 'Seis leches y dos yogures, transferencia',
    fecha: fecha(0, 16, 45),
  }),
  op(
    {
      tipo_operacion: 'PAGO_DEUDA',
      cliente: 'Marta',
      medio_pago: 'EFECTIVO',
      motivo_salida: null,
      items: [],
      texto_original: 'Marta me pagó $1500 de su deuda',
      fecha: fecha(0, 17, 20),
    },
    1500,
  ),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'EFECTIVO',
    motivo_salida: null,
    items: [item('cigarrillos', 1), item('chicles', 2), item('caramelos', 5)],
    texto_original: 'Un atado y golosinas',
    fecha: fecha(0, 18, 10),
  }),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'TRANSFERENCIA',
    motivo_salida: null,
    items: [item('atun', 3), item('pure-tomate', 2), item('fideos-lucchetti', 2)],
    texto_original: 'Latas de atún y puré por transferencia',
    fecha: fecha(0, 18, 55),
  }),
  op(
    {
      tipo_operacion: 'GASTO_OPERATIVO',
      cliente: null,
      medio_pago: 'EFECTIVO',
      motivo_salida: null,
      items: [],
      texto_original: 'Cargá un gasto de $5000 en bolsas plásticas',
      fecha: fecha(0, 19, 30),
    },
    5000,
  ),
  op(
    {
      tipo_operacion: 'SALIDA_STOCK',
      cliente: null,
      medio_pago: null,
      motivo_salida: 'AUTOCONSUMO',
      items: [item('pan', 2), item('mortadela', 0.5)],
      texto_original: 'Me llevé pan y fiambre para casa',
      fecha: fecha(0, 20, 10),
    },
    0,
  ),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'EFECTIVO',
    motivo_salida: null,
    items: [item('cerveza-lit', 2), item('papas-fritas', 1)],
    texto_original: 'Dos cervezas y papas',
    fecha: fecha(0, 20, 50),
  }),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'TRANSFERENCIA',
    motivo_salida: null,
    items: [item('coca-15', 1), item('alfajor', 2)],
    texto_original: 'Una coca y dos alfajores',
    fecha: fecha(0, 21, 20),
  }),

  // ── Ayer ───────────────────────────────────────────────────────────────
  op(
    {
      tipo_operacion: 'INGRESO_STOCK',
      cliente: null,
      medio_pago: null,
      motivo_salida: null,
      items: [item('fideos-lucchetti', 24), item('arroz-1kg', 12), item('aceite-girasol', 12)],
      texto_original: 'Reparto de almacén: fideos, arroz y aceite',
      fecha: fecha(1, 8, 0),
    },
    0,
  ),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'EFECTIVO',
    motivo_salida: null,
    items: [item('yerba-playadito', 2), item('azucar-1kg', 2)],
    texto_original: 'Dos yerbas y dos azúcares',
    fecha: fecha(1, 9, 20),
  }),
  op({
    tipo_operacion: 'NUEVO_DEUDA',
    cliente: 'Susana',
    medio_pago: 'PENDIENTE',
    motivo_salida: null,
    items: [item('leche-entera', 4), item('pan', 4), item('queso-cremoso', 0.5)],
    texto_original: 'Anotale leche, pan y queso a Susana',
    fecha: fecha(1, 11, 0),
  }),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'TRANSFERENCIA',
    motivo_salida: null,
    items: [item('detergente', 2), item('lavandina', 2), item('papel-higienico', 1)],
    texto_original: 'Detergente, lavandina y papel higiénico',
    fecha: fecha(1, 13, 15),
  }),
  op(
    {
      tipo_operacion: 'PAGO_DEUDA',
      cliente: 'Laura',
      medio_pago: 'EFECTIVO',
      motivo_salida: null,
      items: [],
      texto_original: 'Laura me pagó $4000 de su deuda',
      fecha: fecha(1, 17, 40),
    },
    4000,
  ),
  op(
    {
      tipo_operacion: 'GASTO_OPERATIVO',
      cliente: null,
      medio_pago: 'EFECTIVO',
      motivo_salida: null,
      items: [],
      texto_original: 'Flete de la mercadería $12000',
      fecha: fecha(1, 19, 10),
    },
    12000,
  ),

  // ── Hace 3 días ────────────────────────────────────────────────────────
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'EFECTIVO',
    motivo_salida: null,
    items: [item('pan', 8), item('facturas', 12)],
    texto_original: 'Pan y una docena de facturas',
    fecha: fecha(3, 7, 30),
  }),
  op({
    tipo_operacion: 'NUEVO_DEUDA',
    cliente: 'El Gringo',
    medio_pago: 'PENDIENTE',
    motivo_salida: null,
    items: [item('vino-comun', 3), item('cerveza-lit', 3)],
    texto_original: 'Anotale vinos y cervezas al Gringo',
    fecha: fecha(3, 10, 40),
  }),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'TRANSFERENCIA',
    motivo_salida: null,
    items: [item('cafe', 1), item('te-saquitos', 2), item('mate-cocido', 1)],
    texto_original: 'Café, té y mate cocido',
    fecha: fecha(3, 15, 20),
  }),
  op(
    {
      tipo_operacion: 'SALIDA_STOCK',
      cliente: null,
      medio_pago: null,
      motivo_salida: 'PERDIDA',
      items: [item('queso-rallado', 2)],
      texto_original: 'Se perdió queso rallado',
      fecha: fecha(3, 18, 30),
    },
    0,
  ),

  // ── Hace 5 días ────────────────────────────────────────────────────────
  op(
    {
      tipo_operacion: 'INGRESO_STOCK',
      cliente: null,
      medio_pago: null,
      motivo_salida: null,
      items: [item('coca-15', 24), item('sprite-15', 12)],
      texto_original: 'Reparto de gaseosas',
      fecha: fecha(5, 8, 15),
    },
    0,
  ),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'EFECTIVO',
    motivo_salida: null,
    items: [item('fideos-lucchetti', 4), item('noquis-lucchetti', 3), item('pure-tomate', 3)],
    texto_original: 'Fideos, ñoquis y puré',
    fecha: fecha(5, 9, 50),
  }),
  op({
    tipo_operacion: 'NUEVO_DEUDA',
    cliente: 'Damián',
    medio_pago: 'PENDIENTE',
    motivo_salida: null,
    items: [item('atun', 4), item('arroz-1kg', 2), item('aceite-girasol', 1)],
    texto_original: 'Anotale atún, arroz y aceite a Damián',
    fecha: fecha(5, 12, 30),
  }),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'EFECTIVO',
    motivo_salida: null,
    items: [item('empanadas', 12)],
    texto_original: 'Una docena de empanadas',
    fecha: fecha(5, 20, 0),
  }),

  // ── Hace 6 días ────────────────────────────────────────────────────────
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'EFECTIVO',
    motivo_salida: null,
    items: [item('pan', 10), item('huevos', 2)],
    texto_original: 'Pan y dos docenas de huevos',
    fecha: fecha(6, 7, 20),
  }),
  op({
    tipo_operacion: 'NUEVO_DEUDA',
    cliente: 'Nelly',
    medio_pago: 'PENDIENTE',
    motivo_salida: null,
    items: [item('galletitas-agua', 3), item('chocolate', 2), item('alfajor', 3)],
    texto_original: 'Anotale galletitas, chocolate y alfajores a Nelly',
    fecha: fecha(6, 11, 10),
  }),
  op(
    {
      tipo_operacion: 'PAGO_DEUDA',
      cliente: 'Tano',
      medio_pago: 'TRANSFERENCIA',
      motivo_salida: null,
      items: [],
      texto_original: 'El Tano me transfirió $8000 de su deuda',
      fecha: fecha(6, 16, 30),
    },
    8000,
  ),

  // ── Más temprano este mes ──────────────────────────────────────────────
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'EFECTIVO',
    motivo_salida: null,
    items: [item('leche-entera', 10)],
    texto_original: 'Diez leches para el comedor',
    fecha: fecha(9, 7, 0),
  }),
  op({
    tipo_operacion: 'NUEVO_DEUDA',
    cliente: 'Mirta',
    medio_pago: 'PENDIENTE',
    motivo_salida: null,
    items: [item('yerba-playadito', 1), item('azucar-1kg', 1), item('galletitas-agua', 2)],
    texto_original: 'Anotale yerba, azúcar y galletitas a Mirta',
    fecha: fecha(9, 12, 0),
  }),
  op(
    {
      tipo_operacion: 'GASTO_OPERATIVO',
      cliente: null,
      medio_pago: 'EFECTIVO',
      motivo_salida: null,
      items: [],
      texto_original: 'Pagué el gas del local $22000',
      fecha: fecha(12, 9, 30),
    },
    22000,
  ),
  op(
    {
      tipo_operacion: 'PAGO_DEUDA',
      cliente: 'Susana',
      medio_pago: 'EFECTIVO',
      motivo_salida: null,
      items: [],
      texto_original: 'Susana me pagó $6000 de su deuda',
      fecha: fecha(12, 18, 20),
    },
    6000,
  ),
  op(
    {
      tipo_operacion: 'INGRESO_STOCK',
      cliente: null,
      medio_pago: null,
      motivo_salida: null,
      items: [item('lavandina', 24), item('detergente', 12), item('jabon-polvo', 12)],
      texto_original: 'Reparto de limpieza',
      fecha: fecha(15, 8, 40),
    },
    0,
  ),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'TRANSFERENCIA',
    motivo_salida: null,
    items: [item('cerveza-lit', 6), item('vino-comun', 2)],
    texto_original: 'Cervezas y vinos por transferencia',
    fecha: fecha(15, 19, 0),
  }),
  op({
    tipo_operacion: 'NUEVO_DEUDA',
    cliente: 'Cacho',
    medio_pago: 'PENDIENTE',
    motivo_salida: null,
    items: [item('fideos-lucchetti', 3), item('arroz-1kg', 3), item('aceite-girasol', 2)],
    texto_original: 'Anotale fideos, arroz y aceite a Cacho',
    fecha: fecha(18, 10, 10),
  }),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'EFECTIVO',
    motivo_salida: null,
    items: [item('pan', 12), item('facturas', 24), item('criollos', 12)],
    texto_original: 'Pan, facturas y criollos para una fiesta',
    fecha: fecha(20, 13, 40),
  }),

  // ── Meses anteriores (volumen para los gráficos de mes y año) ─────────
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'EFECTIVO',
    motivo_salida: null,
    items: [item('leche-entera', 12), item('yogur', 6)],
    texto_original: 'Doce leches y seis yogures',
    fecha: fechaMes(1, 6, 10, 0),
  }),
  op(
    {
      tipo_operacion: 'PAGO_DEUDA',
      cliente: 'Beto',
      medio_pago: 'EFECTIVO',
      motivo_salida: null,
      items: [],
      texto_original: 'Beto me pagó $10000 de su deuda',
      fecha: fechaMes(1, 18, 17, 30),
    },
    10000,
  ),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'EFECTIVO',
    motivo_salida: null,
    items: [item('coca-15', 12), item('cerveza-lit', 12)],
    texto_original: 'Venta mayorista de bebidas',
    fecha: fechaMes(1, 22, 11, 15),
  }),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'TRANSFERENCIA',
    motivo_salida: null,
    items: [item('aceite-girasol', 12), item('harina-000', 12)],
    texto_original: 'Aceite y harina por transferencia',
    fecha: fechaMes(2, 8, 9, 20),
  }),
  op(
    {
      tipo_operacion: 'GASTO_OPERATIVO',
      cliente: null,
      medio_pago: 'EFECTIVO',
      motivo_salida: null,
      items: [],
      texto_original: 'Mantenimiento de la heladera $26000',
      fecha: fechaMes(2, 20, 16, 0),
    },
    26000,
  ),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'EFECTIVO',
    motivo_salida: null,
    items: [item('yerba-playadito', 12)],
    texto_original: 'Doce yerbas',
    fecha: fechaMes(2, 25, 12, 40),
  }),
  op(
    {
      tipo_operacion: 'SALIDA_STOCK',
      cliente: null,
      medio_pago: null,
      motivo_salida: 'VENCIMIENTO',
      items: [item('leche-entera', 6)],
      texto_original: 'Se vencieron seis leches',
      fecha: fechaMes(3, 5, 8, 30),
    },
    0,
  ),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'TRANSFERENCIA',
    motivo_salida: null,
    items: [item('atun', 24)],
    texto_original: 'Dos cajas de atún por transferencia',
    fecha: fechaMes(3, 14, 18, 0),
  }),
  op({
    tipo_operacion: 'NUEVO_DEUDA',
    cliente: 'Chichita',
    medio_pago: 'PENDIENTE',
    motivo_salida: null,
    items: [item('pan', 1), item('galletitas-agua', 1)],
    texto_original: 'Anotale pan y galletitas a Chichita',
    fecha: fechaMes(4, 9, 10, 0),
  }),
  op(
    {
      tipo_operacion: 'PAGO_DEUDA',
      cliente: 'Mirta',
      medio_pago: 'EFECTIVO',
      motivo_salida: null,
      items: [],
      texto_original: 'Mirta me pagó $3000 de su deuda',
      fecha: fechaMes(4, 21, 15, 0),
    },
    3000,
  ),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'EFECTIVO',
    motivo_salida: null,
    items: [item('cigarrillos', 20)],
    texto_original: 'Veinte atados para el kiosco',
    fecha: fechaMes(5, 11, 9, 0),
  }),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'EFECTIVO',
    motivo_salida: null,
    items: [item('galletitas-agua', 24)],
    texto_original: 'Dos cajas de galletitas',
    fecha: fechaMes(6, 3, 11, 0),
  }),
].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

function movimientosDe(nombre: string): Operacion[] {
  return historial.filter((o) => o.cliente === nombre)
}

const clientes: Cliente[] = [
  {
    id: 'tano',
    nombre: 'Tano',
    saldo_deuda: 24800,
    proximo_vencimiento: 'Este Viernes',
    movimientos: movimientosDe('Tano'),
  },
  {
    id: 'laura',
    nombre: 'Laura',
    saldo_deuda: 6200,
    proximo_vencimiento: 'Lunes que viene',
    movimientos: movimientosDe('Laura'),
  },
  {
    id: 'marta',
    nombre: 'Marta',
    saldo_deuda: 1550,
    proximo_vencimiento: 'Sin fecha',
    movimientos: movimientosDe('Marta'),
  },
  {
    id: 'susana',
    nombre: 'Susana',
    saldo_deuda: 4300,
    proximo_vencimiento: 'Sin fecha',
    movimientos: movimientosDe('Susana'),
  },
  {
    id: 'damian',
    nombre: 'Damián',
    saldo_deuda: 12750,
    proximo_vencimiento: 'Este Viernes',
    movimientos: movimientosDe('Damián'),
  },
  {
    id: 'el-gringo',
    nombre: 'El Gringo',
    saldo_deuda: 8900,
    proximo_vencimiento: 'Fin de mes',
    movimientos: movimientosDe('El Gringo'),
  },
  {
    id: 'nelly',
    nombre: 'Nelly',
    saldo_deuda: 2100,
    proximo_vencimiento: 'Sin fecha',
    movimientos: movimientosDe('Nelly'),
  },
  {
    id: 'cacho',
    nombre: 'Cacho',
    saldo_deuda: 5600,
    proximo_vencimiento: 'Lunes que viene',
    movimientos: movimientosDe('Cacho'),
  },
  {
    id: 'mirta',
    nombre: 'Mirta',
    saldo_deuda: 3800,
    proximo_vencimiento: 'Sin fecha',
    movimientos: movimientosDe('Mirta'),
  },
  {
    id: 'beto',
    nombre: 'Beto',
    saldo_deuda: 15000,
    proximo_vencimiento: 'Fin de mes',
    movimientos: movimientosDe('Beto'),
  },
  {
    id: 'chichita',
    nombre: 'Chichita',
    saldo_deuda: 980,
    proximo_vencimiento: 'Sin fecha',
    movimientos: movimientosDe('Chichita'),
  },
  {
    id: 'rosa',
    nombre: 'Rosa',
    saldo_deuda: 7400,
    proximo_vencimiento: 'Sin fecha',
    movimientos: [],
  },
  {
    id: 'jorge',
    nombre: 'Jorge',
    saldo_deuda: 0,
    proximo_vencimiento: 'Sin fecha',
    movimientos: [],
  },
  {
    id: 'pablo',
    nombre: 'Pablo',
    saldo_deuda: 0,
    proximo_vencimiento: 'Sin fecha',
    movimientos: [],
  },
]

export function getEstadoInicial(): EstadoApp {
  // Clon profundo: evita que resets o consumidores distintos compartan las
  // mismas referencias a objetos del módulo.
  const clonado: EstadoApp = JSON.parse(
    JSON.stringify({
      caja: { total: 283700, efectivo: 168400, transferencia: 115300 },
      productos,
      clientes,
      historial,
    }),
  )
  return clonado
}
