'use client'

import { BarChart3, BookUser, Boxes, History, PenLine, type LucideIcon } from 'lucide-react'

export type Tab = 'inicio' | 'resumen' | 'stock' | 'historial' | 'clientes'

const ITEMS: { tab: Tab; label: string; icon: LucideIcon }[] = [
  { tab: 'inicio', label: 'Anotar', icon: PenLine },
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
    <nav className="sticky bottom-0 z-30 border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-md items-stretch justify-around px-1 py-1 sm:max-w-3xl sm:justify-center sm:gap-2 sm:px-6 xl:max-w-6xl">
        {ITEMS.map(({ tab, label, icon: Icon }) => {
          const activoItem = activo === tab
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onCambiar(tab)}
              aria-current={activoItem ? 'page' : undefined}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors sm:flex-none sm:px-5 sm:text-xs ${
                activoItem ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="size-5" strokeWidth={activoItem ? 2.2 : 1.8} />
              {label}
              {activoItem && (
                <span className="absolute -top-px h-0.5 w-8 rounded-full bg-primary" aria-hidden />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
