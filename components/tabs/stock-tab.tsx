'use client'

import { useMemo, useState } from 'react'
import { Boxes, Search } from 'lucide-react'
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
  { barra: string; texto: string; chip: string; label: string }
> = {
  critico: {
    barra: 'bg-danger',
    texto: 'text-danger',
    chip: 'bg-danger/12 text-danger',
    label: 'Reponer ya',
  },
  bajo: {
    barra: 'bg-fiado',
    texto: 'text-fiado',
    chip: 'bg-fiado/12 text-fiado',
    label: 'Justo',
  },
  ok: {
    barra: 'bg-success',
    texto: 'text-success',
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
  const valorTotal = estado.productos.reduce((acc, p) => acc + p.stock * p.precio, 0)

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <header>
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-foreground">
          Stock
        </h1>
        <p className="text-[13px] text-muted-foreground">Qué queda de cada producto en el local</p>
      </header>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="mb-1.5 flex size-7 items-center justify-center rounded-md bg-primary/8 text-primary">
            <Boxes className="size-4" />
          </div>
          <p className="text-[11px] font-medium text-muted-foreground">Productos</p>
          <p className="cifra text-[15px] font-semibold text-foreground">
            {estado.productos.length}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="mb-1.5 flex size-7 items-center justify-center rounded-md bg-celeste/12 text-celeste">
            <Boxes className="size-4" />
          </div>
          <p className="text-[11px] font-medium text-muted-foreground">Valor del stock</p>
          <p className="cifra text-[15px] font-semibold text-foreground">
            {formatARS(valorTotal)}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="mb-1.5 flex size-7 items-center justify-center rounded-md bg-danger/12 text-danger">
            <Boxes className="size-4" />
          </div>
          <p className="text-[11px] font-medium text-muted-foreground">Para reponer</p>
          <p className="cifra text-[15px] font-semibold text-danger">
            {criticos} {criticos === 1 ? 'producto' : 'productos'}
          </p>
        </div>
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
          className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-[13.5px] text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {productos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-8 text-center">
          <Boxes className="size-7 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-[13.5px] font-medium text-foreground">No hay nada con ese nombre</p>
          <p className="text-[12px] text-muted-foreground text-pretty">
            Probá con otra palabra: «fideos», «yerba», «pan».
          </p>
        </div>
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {productos.map((p) => {
            const est = ESTILOS[nivel(p)]
            const pct = Math.min(100, Math.round((p.stock / Math.max(p.stock_minimo * 2, 1)) * 100))
            return (
              <div key={p.id} className="rounded-lg border border-border bg-card p-3.5">
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
                    className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold ${est.chip}`}
                  >
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
