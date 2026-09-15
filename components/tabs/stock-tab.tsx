'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, Boxes, Search } from 'lucide-react'
import { formatARS } from '@/lib/format'
import { useStore } from '@/lib/store'
import type { Producto } from '@/lib/types'

function nivel(p: Producto): 'critico' | 'bajo' | 'ok' {
  if (p.stock <= 0 || p.stock < p.stock_minimo) return 'critico'
  if (p.stock <= p.stock_minimo * 1.3) return 'bajo'
  return 'ok'
}

const ESTILOS: Record<
  ReturnType<typeof nivel>,
  { barra: string; texto: string; chip: string; label: string }
> = {
  critico: {
    barra: 'bg-danger',
    texto: 'text-danger',
    chip: 'bg-danger/12 text-danger',
    label: 'Crítico',
  },
  bajo: {
    barra: 'bg-fiado',
    texto: 'text-fiado',
    chip: 'bg-fiado/15 text-fiado',
    label: 'Bajo',
  },
  ok: {
    barra: 'bg-success',
    texto: 'text-muted-foreground',
    chip: 'bg-success/12 text-success',
    label: 'Al día',
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
  const bajos = estado.productos.filter((p) => nivel(p) === 'bajo').length
  const valorTotal = estado.productos.reduce((acc, p) => acc + p.stock * p.precio, 0)

  return (
    <div className="flex flex-col gap-4 p-4">
      <header>
        <h1 className="text-xl font-extrabold text-foreground">Stock de mercadería</h1>
        <p className="text-sm text-muted-foreground">Qué queda de cada producto en el local</p>
      </header>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl bg-card p-3 shadow-sm">
          <div className="mb-1.5 flex size-7 items-center justify-center rounded-lg bg-celeste/15 text-celeste">
            <Boxes className="size-4" />
          </div>
          <p className="text-[11px] font-medium text-muted-foreground">Productos</p>
          <p className="text-sm font-bold text-foreground">{estado.productos.length}</p>
        </div>

        <div className="rounded-2xl bg-card p-3 shadow-sm">
          <div className="mb-1.5 flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Boxes className="size-4" />
          </div>
          <p className="text-[11px] font-medium text-muted-foreground">Valor stock</p>
          <p className="text-sm font-bold text-foreground">{formatARS(valorTotal)}</p>
        </div>

        <div className="rounded-2xl bg-card p-3 shadow-sm ring-1 ring-danger/20">
          <div className="mb-1.5 flex size-7 items-center justify-center rounded-lg bg-danger/12 text-danger">
            <AlertTriangle className="size-4" />
          </div>
          <p className="text-[11px] font-medium text-muted-foreground">Para reponer</p>
          <p className="text-sm font-bold text-danger">{criticos + bajos} alertas</p>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar mercadería..."
          className="w-full rounded-2xl bg-card py-2.5 pl-10 pr-3.5 text-sm text-foreground shadow-sm ring-1 ring-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-celeste"
        />
      </div>

      {productos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-card p-8 text-center shadow-sm">
          <Boxes className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No encontramos esa mercadería</p>
          <p className="text-xs text-muted-foreground text-pretty">
            Probá con otro nombre o revisá que esté cargada.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {productos.map((p) => {
            const est = ESTILOS[nivel(p)]
            const pct = Math.min(100, Math.round((p.stock / Math.max(p.stock_minimo * 2, 1)) * 100))
            return (
              <div key={p.id} className="rounded-2xl bg-card p-3.5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{p.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatARS(p.precio)} por {p.unidad}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${est.chip}`}
                  >
                    {est.label}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${est.barra}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className={`shrink-0 text-xs font-bold ${est.texto === 'text-muted-foreground' ? 'text-foreground' : est.texto}`}>
                    {p.stock} {p.unidad}
                  </p>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Mínimo recomendado: {p.stock_minimo} {p.unidad}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
