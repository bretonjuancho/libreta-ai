'use client'

import { useMemo, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  ClockFading,
  HandCoins,
  LayoutList,
  NotebookPen,
  PackageMinus,
  PackagePlus,
  Receipt,
  ShoppingCart,
  type LucideIcon,
} from 'lucide-react'
import type { TipoOperacion } from '@/lib/types'
import { useStore } from '@/lib/store'
import { formatARS } from '@/lib/format'
import { MovimientoItem } from '../movimiento-item'

interface Filtro {
  label: string
  tipo: TipoOperacion | 'TODOS'
  icon: LucideIcon
  activo: string
}

const FILTROS: Filtro[] = [
  {
    label: 'Todos',
    tipo: 'TODOS',
    icon: LayoutList,
    activo: 'border-primary/30 bg-primary/8 text-primary',
  },
  {
    label: 'Ventas',
    tipo: 'VENTA_CONTADO',
    icon: ShoppingCart,
    activo: 'border-success/30 bg-success/12 text-success',
  },
  {
    label: 'Fiados',
    tipo: 'NUEVO_DEUDA',
    icon: NotebookPen,
    activo: 'border-fiado/30 bg-fiado/12 text-fiado',
  },
  {
    label: 'Pagos',
    tipo: 'PAGO_DEUDA',
    icon: HandCoins,
    activo: 'border-celeste/30 bg-celeste/12 text-celeste',
  },
  {
    label: 'Ingresos',
    tipo: 'INGRESO_STOCK',
    icon: PackagePlus,
    activo: 'border-violeta/30 bg-violeta/12 text-violeta',
  },
  {
    label: 'Salidas',
    tipo: 'SALIDA_STOCK',
    icon: PackageMinus,
    activo: 'border-danger/30 bg-danger/12 text-danger',
  },
  {
    label: 'Gastos',
    tipo: 'GASTO_OPERATIVO',
    icon: Receipt,
    activo: 'border-naranja/30 bg-naranja/12 text-naranja',
  },
]

export function HistorialTab() {
  const { estado } = useStore()
  const [filtro, setFiltro] = useState<TipoOperacion | 'TODOS'>('TODOS')

  const lista =
    filtro === 'TODOS'
      ? estado.historial
      : estado.historial.filter((op) => op.tipo_operacion === filtro)

  const conteos = useMemo(() => {
    const c: Record<string, number> = { TODOS: estado.historial.length }
    for (const op of estado.historial) {
      c[op.tipo_operacion] = (c[op.tipo_operacion] ?? 0) + 1
    }
    return c
  }, [estado.historial])

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
          const Icon = f.icon
          const n = conteos[f.tipo] ?? 0
          return (
            <button
              key={f.tipo}
              type="button"
              onClick={() => setFiltro(f.tipo)}
              aria-pressed={activo}
              className={`flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
                activo
                  ? f.activo
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="size-3.5" />
              {f.label}
              {n > 0 && <span className="cifra text-[10.5px] opacity-70">{n}</span>}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
        <span className="text-[12px] text-muted-foreground">
          {lista.length} {lista.length === 1 ? 'movimiento' : 'movimientos'}
        </span>
        {(totales.ingresa > 0 || totales.sale > 0) && (
          <span className="flex items-center gap-2">
            {totales.ingresa > 0 && (
              <span className="flex items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-[12px] font-semibold text-success">
                <ArrowDownLeft className="size-3.5" />
                <span className="cifra">+{formatARS(totales.ingresa)}</span>
              </span>
            )}
            {totales.sale > 0 && (
              <span className="flex items-center gap-1 rounded-md bg-danger/10 px-2 py-1 text-[12px] font-semibold text-danger">
                <ArrowUpRight className="size-3.5" />
                <span className="cifra">−{formatARS(totales.sale)}</span>
              </span>
            )}
          </span>
        )}
      </div>

      {lista.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-8 text-center">
          <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <ClockFading className="size-5 text-muted-foreground" strokeWidth={1.5} />
          </span>
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
