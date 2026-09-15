'use client'

import { ChevronRight, Lightbulb } from 'lucide-react'
import { useStore } from '@/lib/store'
import { PERFIL } from '@/lib/mock-data'
import { MiniCards } from '../mini-cards'
import { VoiceRecorder } from '../voice-recorder'
import { ChatInput } from '../chat-input'
import { MovimientoItem } from '../movimiento-item'

const EJEMPLOS = [
  'Entraron 12 paquetes de Ñoquis Lucchetti',
  'El Tano me pagó $8300 de su deuda',
  'Cargá un gasto de $5000 en bolsas plásticas',
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

  return (
    <div className="flex flex-col gap-5 p-4 pb-4">
      <header className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">LibretaAI</h1>
            <span className="rounded-full bg-fiado/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-fiado">
              DEMO
            </span>
          </div>
          <p className="text-sm text-muted-foreground">El boliche en orden · {PERFIL.nombre}</p>
        </div>
      </header>

      <MiniCards />

      <div className="rounded-3xl bg-card p-4 shadow-sm">
        <VoiceRecorder onProcesar={onProcesar} />
      </div>

      <ChatInput onProcesar={onProcesar} prefill={prefill} />

      <section>
        <div className="mb-2 flex items-center gap-1.5">
          <Lightbulb className="size-4 text-fiado" />
          <h2 className="text-sm font-bold text-foreground">¿Qué podés decirle?</h2>
        </div>
        <div className="flex flex-col gap-2">
          {EJEMPLOS.map((ej) => (
            <button
              key={ej}
              type="button"
              onClick={() => onProcesar(ej)}
              className="flex items-center justify-between gap-2 rounded-2xl bg-card px-4 py-3 text-left text-sm text-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-accent"
            >
              <span className="text-pretty">&ldquo;{ej}&rdquo;</span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Últimos movimientos</h2>
          <button
            type="button"
            onClick={onVerHistorial}
            className="text-xs font-semibold text-celeste"
          >
            Ver todos
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {ultimos.map((op) => (
            <MovimientoItem key={op.id} op={op} />
          ))}
        </div>
      </section>
    </div>
  )
}
