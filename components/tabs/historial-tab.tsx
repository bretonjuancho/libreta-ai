'use client'

import { useMemo, useState } from 'react'
import { ClockFading } from 'lucide-react'
import type { TipoOperacion } from '@/lib/types'
import { useStore } from '@/lib/store'
import { formatARS } from '@/lib/format'
import { MovimientoItem } from '../movimiento-item'

const FILTROS: { label: string; tipo: TipoOperacion | 'TODOS' }[] = [
  { label: 'Todos', tipo: 'TODOS' },
  { label: 'Ventas', tipo: 'VENTA_CONTADO' },
  { label: 'Fiados', tipo: 'NUEVO_DEUDA' },
  { label: 'Pagos', tipo: 'PAGO_DEUDA' },
  { label: 'Ingresos', tipo: 'INGRESO_STOCK' },
  { label: 'Salidas', tipo: 'SALIDA_STOCK' },
  { label: 'Gastos', tipo: 'GASTO_OPERATIVO' },
]

export function HistorialTab() {
  const { estado } = useStore()
  const [filtro, setFiltro] = useState<TipoOperacion | 'TODOS'>('TODOS')

  const lista =
    filtro === 'TODOS'
      ? estado.historial
      : estado.historial.filter((op) => op.tipo_operacion === filtro)

  const totales = useMemo(() => {
    let ingresa = 0
    let sale = 0
    for (const op of lista) {
      if (op.tipo_operacion === 'VENTA_CONTADO' || op.tipo_operacion === 'PAGO_DEUDA')
        ingresa += op.monto_total
      if (op.tipo_operacion === 'GASTO_OPERATIVO') sale += op.monto_total
    }
    return { ingresa, sale }
  }, [lista])

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <header>
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-foreground">
          Historial
        </h1>
        <p className="text-[13px] text-muted-foreground">
          Todo lo anotado, del más nuevo al más viejo
        </p>
      </header>

      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTROS.map((f) => {
          const activo = filtro === f.tipo
          return (
            <button
              key={f.tipo}
              type="button"
              onClick={() => setFiltro(f.tipo)}
              aria-pressed={activo}
              className={`shrink-0 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
                activo
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      <div className="flex items-baseline justify-between gap-4 rounded-lg border border-border bg-card px-3 py-2.5">
        <span className="text-[12px] text-muted-foreground">
          {lista.length} {lista.length === 1 ? 'movimiento' : 'movimientos'}
        </span>
        <span className="flex items-baseline gap-3 text-[12.5px]">
          <span className="cifra font-semibold text-success">+{formatARS(totales.ingresa)}</span>
          <span className="cifra font-semibold text-danger">−{formatARS(totales.sale)}</span>
        </span>
      </div>

      {lista.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-8 text-center">
          <ClockFading className="size-7 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-[13.5px] font-medium text-foreground">Acá no hay nada todavía</p>
          <p className="text-[12px] text-muted-foreground text-pretty">
            Probá con otro filtro, o anotá un movimiento desde la pestaña Anotar.
          </p>
        </div>
      ) : (
        <div className="columns-1 gap-6 rounded-lg border border-border bg-card px-3 md:columns-2 xl:columns-3">
          {lista.map((op) => (
            <div key={op.id} className="break-inside-avoid">
              <MovimientoItem op={op} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
