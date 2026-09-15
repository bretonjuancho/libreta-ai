'use client'

import { useMemo, useState } from 'react'
import {
  Boxes,
  CircleAlert,
  CircleCheck,
  Coins,
  PackageSearch,
  Search,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'
import { formatARS } from '@/lib/format'
import { useStore } from '@/lib/store'
import type { Producto } from '@/lib/types'

function nivel(p: Producto): 'critico' | 'bajo' | 'ok' {
  if (p.stock <= p.stock_minimo) return 'critico'
  if (p.stock <= p.stock_minimo * 1.3) return 'bajo'
  return 'ok'
}

const ESTILOS: Record<
  ReturnType<typeof nivel>,
  { barra: string; texto: string; chip: string; tarjeta: string; label: string; icon: LucideIcon }
> = {
  critico: {
    barra: 'bg-danger',
    texto: 'text-danger',
    chip: 'bg-danger/12 text-danger',
    tarjeta: 'border-danger/30 bg-danger/5',
    label: 'Reponer ya',
    icon: TriangleAlert,
  },
  bajo: {
    barra: 'bg-fiado',
    texto: 'text-fiado',
    chip: 'bg-fiado/12 text-fiado',
    tarjeta: 'border-fiado/30 bg-fiado/5',
    label: 'Justo',
    icon: CircleAlert,
  },
  ok: {
    barra: 'bg-success',
    texto: 'text-success',
    chip: 'bg-success/12 text-success',
    tarjeta: 'border-border bg-card',
    label: 'Al día',
    icon: CircleCheck,
  },
}

export function StockTab() {
  const { estado } = useStore()
  const [busqueda, setBusqueda] = useState('')

  const productos = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const lista = q
      ? estado.productos.filter((p) => p.nombre.toLowerCase().includes(q))
      : estado.productos
    return [...lista].sort((a, b) => {
      const orden = { critico: 0, bajo: 1, ok: 2 }
      return orden[nivel(a)] - orden[nivel(b)] || a.nombre.localeCompare(b.nombre)
    })
  }, [estado.productos, busqueda])

  const criticos = estado.productos.filter((p) => nivel(p) === 'critico').length
  const valorTotal = estado.productos.reduce((acc, p) => acc + p.stock * p.precio, 0)

  const resumen = [
    {
      label: 'Productos',
      valor: `${estado.productos.length}`,
      icon: Boxes,
      caja: 'border-celeste/25 bg-celeste/5',
      badge: 'bg-celeste/12 text-celeste',
      texto: 'text-celeste',
    },
    {
      label: 'Valor del stock',
      valor: formatARS(valorTotal),
      icon: Coins,
      caja: 'border-success/25 bg-success/5',
      badge: 'bg-success/12 text-success',
      texto: 'text-success',
    },
    {
      label: 'Para reponer',
      valor: `${criticos} ${criticos === 1 ? 'producto' : 'productos'}`,
      icon: TriangleAlert,
      caja: 'border-danger/25 bg-danger/5',
      badge: 'bg-danger/12 text-danger',
      texto: 'text-danger',
    },
  ]

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <header>
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-foreground">
          Stock
        </h1>
        <p className="text-[13px] text-muted-foreground">Qué queda de cada producto en el local</p>
      </header>

      <div className="grid grid-cols-3 gap-2.5">
        {resumen.map(({ label, valor, icon: Icon, caja, badge, texto }) => (
          <div key={label} className={`rounded-lg border p-3 ${caja}`}>
            <div className={`mb-1.5 flex size-7 items-center justify-center rounded-md ${badge}`}>
              <Icon className="size-4" />
            </div>
            <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
            <p className={`cifra text-[15px] font-semibold ${texto}`}>{valor}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.8}
        />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar mercadería…"
          aria-label="Buscar mercadería"
          className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-[13.5px] text-foreground placeholder:text-muted-foreground focus:border-celeste/50 focus:outline-none focus:ring-2 focus:ring-celeste/15"
        />
      </div>

      {productos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-8 text-center">
          <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <PackageSearch className="size-5 text-muted-foreground" strokeWidth={1.5} />
          </span>
          <p className="text-[13.5px] font-medium text-foreground">No hay nada con ese nombre</p>
          <p className="text-[12px] text-muted-foreground text-pretty">
            Probá con otra palabra: «fideos», «yerba», «pan».
          </p>
        </div>
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {productos.map((p) => {
            const est = ESTILOS[nivel(p)]
            const Icon = est.icon
            const pct = Math.min(100, Math.round((p.stock / Math.max(p.stock_minimo * 2, 1)) * 100))
            return (
              <div key={p.id} className={`rounded-lg border p-3.5 ${est.tarjeta}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-semibold text-foreground">
                      {p.nombre}
                    </p>
                    <p className="cifra text-[11.5px] text-muted-foreground">
                      {formatARS(p.precio)} por {p.unidad}
                    </p>
                  </div>
                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${est.chip}`}
                  >
                    <Icon className="size-3" />
                    {est.label}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full ${est.barra}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className={`cifra shrink-0 text-[12.5px] font-semibold ${est.texto}`}>
                    {p.stock} {p.unidad}
                  </p>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Mínimo {p.stock_minimo} {p.unidad}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
