'use client'

import { ChevronRight } from 'lucide-react'
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
  const hoy = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })

  return (
    <div className="flex flex-col gap-5 p-4 pb-4 sm:p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-foreground">
            {PERFIL.nombre}
          </h1>
          <p className="text-[13px] text-muted-foreground">
            LibretaAI <span className="text-border">|</span> demo con datos de ejemplo
          </p>
        </div>
        <span className="cifra mt-1 shrink-0 text-[12px] text-muted-foreground">{hoy}</span>
      </header>

      <MiniCards />

      <div className="rounded-lg border border-border bg-card p-4">
        <VoiceRecorder onProcesar={onProcesar} />
      </div>

      <ChatInput onProcesar={onProcesar} prefill={prefill} />

      <section>
        <div className="mb-1 flex items-baseline justify-between gap-3">
          <h2 className="text-[13px] font-semibold text-foreground">Ejemplos para dictar</h2>
          <span className="text-[11px] text-muted-foreground">Tocalos y se cargan</span>
        </div>
        <div className="rounded-lg border border-border bg-card px-3">
          {EJEMPLOS.map((ej) => (
            <button
              key={ej}
              type="button"
              onClick={() => onProcesar(ej)}
              className="flex w-full items-center justify-between gap-3 border-b border-border/70 py-2.5 text-left text-[13.5px] text-foreground last:border-b-0 hover:text-celeste"
            >
              <span className="text-pretty">&ldquo;{ej}&rdquo;</span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-1 flex items-baseline justify-between gap-3">
          <h2 className="text-[13px] font-semibold text-foreground">Últimos movimientos</h2>
          <button
            type="button"
            onClick={onVerHistorial}
            className="text-[12px] font-medium text-celeste hover:underline"
          >
            Ver todos
          </button>
        </div>
        {ultimos.length === 0 ? (
          <p className="rounded-lg border border-border bg-card py-6 text-center text-[13px] text-muted-foreground">
            Todavía no hay movimientos. Dictá el primero arriba.
          </p>
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
