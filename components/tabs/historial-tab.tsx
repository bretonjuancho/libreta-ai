'use client'

import { useState } from 'react'
import { ClockFading } from 'lucide-react'
import type { TipoOperacion } from '@/lib/types'
import { useStore } from '@/lib/store'
import { MovimientoItem } from '../movimiento-item'

const FILTROS: { label: string; tipo: TipoOperacion | 'TODOS' }[] = [
  { label: 'Todos', tipo: 'TODOS' },
  { label: 'Venta contado', tipo: 'VENTA_CONTADO' },
  { label: 'Fiados', tipo: 'NUEVO_DEUDA' },
  { label: 'Pagos de fiado', tipo: 'PAGO_DEUDA' },
  { label: 'Ingreso stock', tipo: 'INGRESO_STOCK' },
  { label: 'Salidas', tipo: 'SALIDA_STOCK' },
  { label: 'Gasto', tipo: 'GASTO_OPERATIVO' },
]

export function HistorialTab() {
  const { estado } = useStore()
  const [filtro, setFiltro] = useState<TipoOperacion | 'TODOS'>('TODOS')

  const lista =
    filtro === 'TODOS'
      ? estado.historial
      : estado.historial.filter((op) => op.tipo_operacion === filtro)

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <header>
        <h1 className="text-xl font-extrabold text-foreground">Historial de actividad</h1>
        <p className="text-sm text-muted-foreground">Lista completa de cambios del día</p>
      </header>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTROS.map((f) => {
          const activo = filtro === f.tipo
          return (
            <button
              key={f.tipo}
              type="button"
              onClick={() => setFiltro(f.tipo)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activo
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground ring-1 ring-border'
              }`}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {lista.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-card p-8 text-center shadow-sm">
          <ClockFading className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Sin movimientos todavía</p>
          <p className="text-xs text-muted-foreground text-pretty">
            Cuando cargues una operación de este tipo va a aparecer acá.
          </p>
        </div>
      ) : (
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {lista.map((op) => (
            <MovimientoItem key={op.id} op={op} />
          ))}
        </div>
      )}
    </div>
  )
}
