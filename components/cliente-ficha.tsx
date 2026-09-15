'use client'

import { useMemo } from 'react'
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
  HandCoins,
  NotebookPen,
} from 'lucide-react'
import type { Cliente, Operacion } from '@/lib/types'
import { formatARS, formatFechaHora } from '@/lib/format'
import { ETIQUETAS_TIPO } from '@/lib/parser'
import { Button } from '@/components/ui/button'

function deltaDeuda(op: Operacion): number {
  if (op.tipo_operacion === 'NUEVO_DEUDA') return op.monto_total
  if (op.tipo_operacion === 'PAGO_DEUDA') return -op.monto_total
  return 0
}

export function ClienteFicha({
  cliente,
  onVolver,
  onPrefill,
}: {
  cliente: Cliente
  onVolver: () => void
  onPrefill: (texto: string) => void
}) {
  // Saldo de la libreta después de cada movimiento (los más nuevos primero).
  const filas = useMemo(() => {
    const out: { op: Operacion; saldo: number }[] = []
    let saldo = cliente.saldo_deuda
    for (const op of cliente.movimientos) {
      out.push({ op, saldo })
      saldo -= deltaDeuda(op)
    }
    return out
  }, [cliente])

  const alDia = cliente.saldo_deuda === 0

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <button
        type="button"
        onClick={onVolver}
        className="flex items-center gap-1.5 self-start text-[13px] font-medium text-celeste hover:underline"
      >
        <ArrowLeft className="size-4" />
        Volver a fiados
      </button>

      <div className="rounded-xl border border-fiado/25 bg-linear-to-br from-fiado/10 to-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-fiado/12 text-[15px] font-semibold text-fiado">
              {cliente.nombre.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-muted-foreground">
                {alDia ? 'Sin deuda' : 'Debe'}
              </p>
              <h1 className="truncate text-[22px] font-semibold leading-tight tracking-tight text-foreground">
                {cliente.nombre}
              </h1>
            </div>
          </div>
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
              alDia ? 'bg-success/12 text-success' : 'bg-fiado/12 text-fiado'
            }`}
          >
            <HandCoins className="size-5" />
          </span>
        </div>

        <p
          className={`cifra mt-3 text-[32px] font-semibold leading-none ${
            alDia ? 'text-success' : 'text-fiado'
          }`}
        >
          {formatARS(cliente.saldo_deuda)}
        </p>
        <div className="mt-3 flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <CalendarClock className="size-3.5" strokeWidth={1.8} />
          {cliente.proximo_vencimiento
            ? `Vence ${cliente.proximo_vencimiento.toLowerCase()}`
            : 'Sin fecha de pago'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => onPrefill(`Anotale 1 pan a ${cliente.nombre} $500`)}
          className="h-11 rounded-md bg-fiado text-[13px] font-semibold text-fiado-foreground hover:bg-fiado/90"
        >
          <NotebookPen className="size-4" />
          Anotarle fiado
        </Button>
        <Button
          onClick={() => onPrefill(`${cliente.nombre} me pagó $500 de su deuda`)}
          className="h-11 rounded-md bg-success text-[13px] font-semibold text-success-foreground hover:bg-success/90"
        >
          <HandCoins className="size-4" />
          Registrar pago
        </Button>
      </div>

      <section>
        <h2 className="mb-1 text-[13px] font-semibold text-foreground">Movimientos</h2>
        {filas.length === 0 ? (
          <p className="rounded-lg border border-border bg-card py-6 text-center text-[13px] text-muted-foreground">
            Todavía no hay movimientos de {cliente.nombre}.
          </p>
        ) : (
          <div className="rounded-lg border border-border bg-card px-3">
            {filas.map(({ op, saldo }) => {
              const esFiado = op.tipo_operacion === 'NUEVO_DEUDA'
              const detalle = op.items.map((it) => `${it.cantidad}× ${it.producto}`).join(', ')
              const Icon = esFiado ? NotebookPen : HandCoins
              return (
                <div
                  key={op.id}
                  className="flex items-center gap-2.5 border-b border-border/70 py-2.5 last:border-b-0"
                >
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                      esFiado ? 'bg-fiado/12 text-fiado' : 'bg-success/12 text-success'
                    }`}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-foreground">
                      {detalle || ETIQUETAS_TIPO[op.tipo_operacion]}
                    </p>
                    <p className="cifra text-[11px] text-muted-foreground">
                      {formatFechaHora(op.fecha)} · saldo {formatARS(saldo)}
                    </p>
                  </div>
                  <span
                    className={`cifra flex shrink-0 items-center gap-0.5 rounded-md px-2 py-1 text-[12.5px] font-semibold ${
                      esFiado ? 'bg-fiado/10 text-fiado' : 'bg-success/10 text-success'
                    }`}
                  >
                    {esFiado ? (
                      <ArrowUpRight className="size-3.5" />
                    ) : (
                      <ArrowDownLeft className="size-3.5" />
                    )}
                    {esFiado ? '+' : '−'}
                    {formatARS(op.monto_total)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
