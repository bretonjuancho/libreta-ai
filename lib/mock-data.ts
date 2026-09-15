import type { EstadoApp, Operacion, Producto, Cliente } from './types'

export const PERFIL = {
  nombre: 'Almacén Don Pedro',
} as const

const productos: Producto[] = [
  { id: 'coca', nombre: 'Coca-Cola 1.5L', stock: 18, stock_minimo: 6, precio: 3000, unidad: 'u' },
  { id: 'fideos', nombre: 'Fideos Lucchetti 500g', stock: 24, stock_minimo: 8, precio: 1500, unidad: 'u' },
  { id: 'yerba', nombre: 'Yerba Playadito 1kg', stock: 20, stock_minimo: 6, precio: 5200, unidad: 'u' },
  { id: 'aceite', nombre: 'Aceite Girasol 1.5L', stock: 5, stock_minimo: 6, precio: 4200, unidad: 'u' },
  { id: 'leche', nombre: 'Leche Entera 1L', stock: 3, stock_minimo: 6, precio: 1800, unidad: 'u' },
  { id: 'pan', nombre: 'Pan', stock: 30, stock_minimo: 10, precio: 500, unidad: 'u' },
  { id: 'queso', nombre: 'Queso cremoso', stock: 2, stock_minimo: 3, precio: 8900, unidad: 'kg' },
  { id: 'fiambre', nombre: 'Fiambre', stock: 1, stock_minimo: 3, precio: 7600, unidad: 'kg' },
  { id: 'galletitas', nombre: 'Galletitas', stock: 12, stock_minimo: 6, precio: 1200, unidad: 'u' },
]

function op(o: Omit<Operacion, 'id'>): Operacion {
  return { id: crypto.randomUUID(), ...o }
}

// Timestamps fijos para el historial de demo (hoy).
const hoy = new Date()
function hora(h: number, m: number): string {
  const d = new Date(hoy)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

const historial: Operacion[] = [
  op({
    tipo_operacion: 'GASTO_OPERATIVO',
    cliente: null,
    medio_pago: 'EFECTIVO',
    monto_total: 15000,
    motivo_salida: null,
    items: [],
    texto_original: 'Gasto - Boleta de luz $15000',
    fecha: hora(9, 12),
  }),
  op({
    tipo_operacion: 'INGRESO_STOCK',
    cliente: null,
    medio_pago: null,
    monto_total: 0,
    motivo_salida: null,
    items: [{ producto: 'Yerba Playadito 1kg', cantidad: 20, precio_unitario: 5200 }],
    texto_original: 'Ingreso de stock - Yerba 20u',
    fecha: hora(10, 5),
  }),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'EFECTIVO',
    monto_total: 7200,
    motivo_salida: null,
    items: [{ producto: 'Atún', cantidad: 3, precio_unitario: 2400 }],
    texto_original: 'Venta contado 3 latas de atún $7200',
    fecha: hora(11, 30),
  }),
  op({
    tipo_operacion: 'PAGO_DEUDA',
    cliente: 'Marta',
    medio_pago: 'EFECTIVO',
    monto_total: 3000,
    motivo_salida: null,
    items: [],
    texto_original: 'Marta me pagó $3000 de su deuda',
    fecha: hora(12, 15),
  }),
  op({
    tipo_operacion: 'NUEVO_DEUDA',
    cliente: 'Marta',
    medio_pago: 'PENDIENTE',
    monto_total: 1550,
    motivo_salida: null,
    items: [{ producto: 'Pan', cantidad: 3, precio_unitario: 500 }],
    texto_original: 'Anotale pan a Marta $1550',
    fecha: hora(13, 40),
  }),
  op({
    tipo_operacion: 'VENTA_CONTADO',
    cliente: null,
    medio_pago: 'TRANSFERENCIA',
    monto_total: 3400,
    motivo_salida: null,
    items: [{ producto: 'Galletitas', cantidad: 2, precio_unitario: 1200 }],
    texto_original: 'Venta contado $3400 por transferencia',
    fecha: hora(14, 20),
  }),
]

const clientes: Cliente[] = [
  {
    id: 'tano',
    nombre: 'Tano',
    saldo_deuda: 24800,
    proximo_vencimiento: 'Este Viernes',
    movimientos: [],
  },
  {
    id: 'laura',
    nombre: 'Laura',
    saldo_deuda: 6200,
    proximo_vencimiento: 'Lunes que viene',
    movimientos: [],
  },
  {
    id: 'marta',
    nombre: 'Marta',
    saldo_deuda: 1550,
    proximo_vencimiento: 'Sin fecha',
    movimientos: [
      historial.find((h) => h.tipo_operacion === 'NUEVO_DEUDA')!,
      historial.find((h) => h.tipo_operacion === 'PAGO_DEUDA')!,
    ],
  },
]

export function getEstadoInicial(): EstadoApp {
  return {
    caja: { total: 128500, efectivo: 42900, transferencia: 85600 },
    productos,
    clientes,
    historial,
  }
}
