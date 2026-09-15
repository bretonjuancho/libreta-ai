'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Cliente, EstadoApp, Operacion, Producto } from './types'
import { getEstadoInicial } from './mock-data'

const STORAGE_KEY = 'libretaai-estado-v1'

interface StoreCtx {
  estado: EstadoApp
  productosBajos: Producto[]
  confirmar: (op: Operacion) => void
  reset: () => void
}

const Ctx = createContext<StoreCtx | null>(null)

function slug(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
}

function aplicar(estado: EstadoApp, op: Operacion): EstadoApp {
  const caja = { ...estado.caja }
  let productos = estado.productos.map((p) => ({ ...p }))
  let clientes = estado.clientes.map((c) => ({ ...c }))

  // Guarda el precio unitario usado en esta operación como referencia para la próxima vez
  // que se mencione el mismo producto sin indicar precio (prioriza siempre lo dicho por
  // el usuario en el momento, pero si no dice nada usa el último precio real registrado).
  const actualizarPrecioReferencia = () => {
    for (const it of op.items) {
      if (!it.precio_unitario) continue
      const p = productos.find(
        (x) => x.nombre.toLowerCase() === it.producto.toLowerCase(),
      )
      if (p) {
        p.ultimo_precio = it.precio_unitario
        p.precio = it.precio_unitario
      }
    }
  }

  const restarStock = () => {
    for (const it of op.items) {
      const p = productos.find(
        (x) => x.nombre.toLowerCase() === it.producto.toLowerCase(),
      )
      if (p) p.stock = Math.max(0, p.stock - it.cantidad)
    }
  }

  const sumarStock = () => {
    for (const it of op.items) {
      const p = productos.find(
        (x) => x.nombre.toLowerCase() === it.producto.toLowerCase(),
      )
      if (p) {
        p.stock += it.cantidad
      } else {
        productos.push({
          id: slug(it.producto),
          nombre: it.producto,
          stock: it.cantidad,
          stock_minimo: 6,
          precio: it.precio_unitario,
          ultimo_precio: it.precio_unitario,
          unidad: 'u',
        })
      }
    }
  }

  const sumarCaja = () => {
    caja.total += op.monto_total
    if (op.medio_pago === 'TRANSFERENCIA') caja.transferencia += op.monto_total
    else caja.efectivo += op.monto_total
  }

  const ajustarCliente = (delta: number) => {
    if (!op.cliente) return
    const id = slug(op.cliente)
    let c = clientes.find((x) => x.id === id)
    if (!c) {
      c = {
        id,
        nombre: op.cliente,
        saldo_deuda: 0,
        proximo_vencimiento: 'Sin fecha',
        movimientos: [],
      }
      clientes = [...clientes, c]
    }
    c.saldo_deuda = Math.max(0, c.saldo_deuda + delta)
    c.movimientos = [op, ...c.movimientos]
  }

  switch (op.tipo_operacion) {
    case 'VENTA_CONTADO':
      sumarCaja()
      restarStock()
      actualizarPrecioReferencia()
      break
    case 'NUEVO_DEUDA':
      ajustarCliente(op.monto_total)
      restarStock()
      actualizarPrecioReferencia()
      break
    case 'PAGO_DEUDA':
      ajustarCliente(-op.monto_total)
      sumarCaja()
      break
    case 'INGRESO_STOCK':
      sumarStock()
      actualizarPrecioReferencia()
      break
    case 'SALIDA_STOCK':
      restarStock()
      break
    case 'GASTO_OPERATIVO':
      caja.total -= op.monto_total
      caja.efectivo -= op.monto_total
      break
  }

  return {
    caja,
    productos,
    clientes,
    historial: [op, ...estado.historial],
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoApp | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        setEstado(JSON.parse(raw) as EstadoApp)
        return
      }
    } catch {
      // ignorar
    }
    setEstado(getEstadoInicial())
  }, [])

  useEffect(() => {
    if (estado) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(estado))
      } catch {
        // ignorar
      }
    }
  }, [estado])

  const confirmar = useCallback((op: Operacion) => {
    setEstado((prev) => (prev ? aplicar(prev, op) : prev))
  }, [])

  const reset = useCallback(() => {
    const inicial = getEstadoInicial()
    setEstado(inicial)
  }, [])

  const value = useMemo<StoreCtx | null>(() => {
    if (!estado) return null
    return {
      estado,
      productosBajos: estado.productos.filter((p) => p.stock <= p.stock_minimo),
      confirmar,
      reset,
    }
  }, [estado, confirmar, reset])

  if (!value) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-4 border-muted border-t-celeste" />
          <p className="text-sm text-muted-foreground">Cargando el boliche…</p>
        </div>
      </div>
    )
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore debe usarse dentro de StoreProvider')
  return ctx
}

export type { Cliente }
