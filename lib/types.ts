export type TipoOperacion =
  | 'VENTA_CONTADO'
  | 'NUEVO_DEUDA'
  | 'PAGO_DEUDA'
  | 'INGRESO_STOCK'
  | 'SALIDA_STOCK'
  | 'GASTO_OPERATIVO'

export type MedioPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'PENDIENTE' | null

export type MotivoSalida =
  | 'ROTURA'
  | 'VENCIMIENTO'
  | 'AUTOCONSUMO'
  | 'PERDIDA'
  | null

export interface Item {
  producto: string
  cantidad: number
  precio_unitario: number
}

export interface Operacion {
  id: string
  tipo_operacion: TipoOperacion
  cliente: string | null
  medio_pago: MedioPago
  monto_total: number
  motivo_salida: MotivoSalida
  items: Item[]
  texto_original: string
  fecha: string
}

export interface Cliente {
  id: string
  nombre: string
  saldo_deuda: number
  proximo_vencimiento?: string
  movimientos: Operacion[]
}

export interface Producto {
  id: string
  nombre: string
  stock: number
  stock_minimo: number
  precio: number
  unidad: string
  /** Precio unitario de la última operación (venta, fiado o compra) registrada para este producto. */
  ultimo_precio?: number
}

export interface Caja {
  total: number
  efectivo: number
  transferencia: number
}

export interface EstadoApp {
  caja: Caja
  productos: Producto[]
  clientes: Cliente[]
  historial: Operacion[]
}
