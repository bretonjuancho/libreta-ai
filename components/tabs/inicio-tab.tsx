'use client'

import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  HandCoins,
  History,
  Inbox,
  NotebookPen,
  PackagePlus,
  Receipt,
  ShoppingCart,
  Sparkles,
  Store,
  type LucideIcon,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { PERFIL } from '@/lib/mock-data'
import { MiniCards } from '../mini-cards'
import { VoiceRecorder } from '../voice-recorder'
import { ChatInput } from '../chat-input'
import { MovimientoItem } from '../movimiento-item'

interface Ejemplo {
  texto: string
  icon: LucideIcon
  chip: string
}

const EJEMPLOS: Ejemplo[] = [
  {
    texto: 'Vendí 2 cocas en efectivo',
    icon: ShoppingCart,
    chip: 'bg-success/12 text-success',
  },
  {
    texto: 'Anotale 1 pan a Marta $500',
    icon: NotebookPen,
    chip: 'bg-fiado/12 text-fiado',
  },
  {
    texto: 'El Tano me pagó $8300 de su deuda',
    icon: HandCoins,
    chip: 'bg-celeste/12 text-celeste',
  },
  {
    texto: 'Entraron 12 paquetes de Ñoquis Lucchetti',
    icon: PackagePlus,
    chip: 'bg-violeta/12 text-violeta',
  },
  {
    texto: 'Cargá un gasto de $5000 en bolsas plásticas',
    icon: Receipt,
    chip: 'bg-naranja/12 text-naranja',
  },
]

export function InicioTab({
  onProcesar,
  onVerHistorial,
  prefill,
}: {
  onProcesar: (texto: string) => void
  onVerHistorial: () => void
  prefill?: string
}) {
  const { estado } = useStore()
  const ultimos = estado.historial.slice(0, 3)
  const hoy = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })

  return (
    <div className="flex flex-col gap-5 p-4 pb-4 sm:p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-celeste to-primary text-primary-foreground shadow-sm">
            <Store className="size-5" strokeWidth={1.9} />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-[24px] font-semibold leading-tight tracking-tight text-foreground">
              {PERFIL.nombre}
            </h1>
            <p className="truncate text-[13px] text-muted-foreground">
              LibretaAI <span className="text-border">|</span> demo con datos de ejemplo
            </p>
          </div>
        </div>
        <span className="mt-0.5 flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-[11.5px] text-muted-foreground">
          <CalendarDays className="size-3.5 text-celeste" />
          <span className="cifra">{hoy}</span>
        </span>
      </header>

      <MiniCards />

      <div className="rounded-xl border border-celeste/25 bg-linear-to-b from-celeste/8 to-card p-4">
        <VoiceRecorder onProcesar={onProcesar} />
      </div>

      <ChatInput onProcesar={onProcesar} prefill={prefill} />

      <section>
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
            <Sparkles className="size-3.5 text-violeta" />
            Ejemplos para dictar
          </h2>
          <span className="text-[11px] text-muted-foreground">Tocalos y se cargan</span>
        </div>
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {EJEMPLOS.map(({ texto, icon: Icon, chip }) => (
            <button
              key={texto}
              type="button"
              onClick={() => onProcesar(texto)}
              className="group flex w-full items-center gap-2.5 border-b border-border/70 px-3 py-2.5 text-left text-[13px] text-foreground transition-colors last:border-b-0 hover:bg-muted/60"
            >
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-md ${chip}`}
              >
                <Icon className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1 text-pretty">&ldquo;{texto}&rdquo;</span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-celeste" />
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
            <History className="size-3.5 text-primary" />
            Últimos movimientos
          </h2>
          <button
            type="button"
            onClick={onVerHistorial}
            className="flex items-center gap-1 rounded-md bg-celeste/10 px-2 py-1 text-[11.5px] font-semibold text-celeste transition-colors hover:bg-celeste/15"
          >
            Ver todos
            <ArrowRight className="size-3.5" />
          </button>
        </div>
        {ultimos.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card py-6 text-center">
            <Inbox className="size-6 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-[13px] text-muted-foreground">
              Todavía no hay movimientos. Dictá el primero arriba.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card px-3">
            {ultimos.map((op) => (
              <MovimientoItem key={op.id} op={op} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
