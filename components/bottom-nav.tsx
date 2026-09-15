'use client'

import { BarChart3, BookUser, Boxes, History, PenLine, type LucideIcon } from 'lucide-react'

export type Tab = 'inicio' | 'resumen' | 'stock' | 'historial' | 'clientes'

interface ItemNav {
  tab: Tab
  label: string
  icon: LucideIcon
  activo: string
  pill: string
  barra: string
}

const ITEMS: ItemNav[] = [
  {
    tab: 'inicio',
    label: 'Anotar',
    icon: PenLine,
    activo: 'text-celeste',
    pill: 'bg-celeste/12',
    barra: 'bg-celeste',
  },
  {
    tab: 'resumen',
    label: 'Resumen',
    icon: BarChart3,
    activo: 'text-violeta',
    pill: 'bg-violeta/12',
    barra: 'bg-violeta',
  },
  {
    tab: 'stock',
    label: 'Stock',
    icon: Boxes,
    activo: 'text-success',
    pill: 'bg-success/12',
    barra: 'bg-success',
  },
  {
    tab: 'historial',
    label: 'Historial',
    icon: History,
    activo: 'text-primary',
    pill: 'bg-primary/8',
    barra: 'bg-primary',
  },
  {
    tab: 'clientes',
    label: 'Fiados',
    icon: BookUser,
    activo: 'text-fiado',
    pill: 'bg-fiado/12',
    barra: 'bg-fiado',
  },
]

export function BottomNav({
  activo,
  onCambiar,
}: {
  activo: Tab
  onCambiar: (t: Tab) => void
}) {
  return (
    <nav className="sticky bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-md items-stretch justify-around px-1 py-1 sm:max-w-3xl sm:justify-center sm:gap-2 sm:px-6 xl:max-w-6xl">
        {ITEMS.map((item) => {
          const activoItem = activo === item.tab
          const Icon = item.icon
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => onCambiar(item.tab)}
              aria-current={activoItem ? 'page' : undefined}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[11px] font-medium transition-colors sm:flex-none sm:px-5 sm:text-xs ${
                activoItem ? item.activo : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span
                className={`flex size-8 items-center justify-center rounded-lg transition-colors ${
                  activoItem ? item.pill : ''
                }`}
              >
                <Icon className="size-[18px]" strokeWidth={activoItem ? 2.3 : 1.8} />
              </span>
              {item.label}
              {activoItem && (
                <span
                  className={`absolute -top-px h-0.5 w-8 rounded-full ${item.barra}`}
                  aria-hidden
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
