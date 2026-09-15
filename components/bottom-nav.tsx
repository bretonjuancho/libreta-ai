'use client'

import { BarChart3, BookUser, Boxes, History, Home, type LucideIcon } from 'lucide-react'

export type Tab = 'inicio' | 'resumen' | 'stock' | 'historial' | 'clientes'

const ITEMS: { tab: Tab; label: string; icon: LucideIcon }[] = [
  { tab: 'inicio', label: 'Inicio', icon: Home },
  { tab: 'resumen', label: 'Resumen', icon: BarChart3 },
  { tab: 'stock', label: 'Stock', icon: Boxes },
  { tab: 'historial', label: 'Historial', icon: History },
  { tab: 'clientes', label: 'Fiados', icon: BookUser },
]

export function BottomNav({
  activo,
  onCambiar,
}: {
  activo: Tab
  onCambiar: (t: Tab) => void
}) {
  return (
    <nav className="sticky bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 py-1.5">
        {ITEMS.map(({ tab, label, icon: Icon }) => {
          const activoItem = activo === tab
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onCambiar(tab)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] font-semibold transition-colors ${
                activoItem ? 'text-celeste' : 'text-muted-foreground'
              }`}
            >
              <Icon className="size-5" strokeWidth={activoItem ? 2.4 : 2} />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
