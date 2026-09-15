'use client'

import { Check, Pencil } from 'lucide-react'
import type { Operacion } from '@/lib/types'
import { formatARS, formatHora } from '@/lib/format'
import { ETIQUETAS_MOTIVO, ETIQUETAS_TIPO } from '@/lib/parser'
import { Button } from '@/components/ui/button'
import { TIPO_VISUAL } from './tipo-visual'

function efectos(op: Operacion): string[] {
  const unidades = op.items.reduce((a, it) => a + it.cantidad, 0)
  const medio = op.medio_pago === 'TRANSFERENCIA' ? 'transferencia' : 'efectivo'
  switch (op.tipo_operacion) {
    case 'VENTA_CONTADO':
      return [
        `Entran ${formatARS(op.monto_total)} a la caja (${medio}).`,
        unidades > 0
          ? `Salen ${unidades} ${unidades === 1 ? 'unidad' : 'unidades'} del stock.`
          : 'No cambia el stock.',
      ]
    case 'NUEVO_DEUDA':
      return [
        `${op.cliente ?? 'El cliente'} queda debiendo ${formatARS(op.monto_total)}.`,
        unidades > 0
          ? `Salen ${unidades} ${unidades === 1 ? 'unidad' : 'unidades'} del stock.`
          : 'No cambia el stock.',
      ]
    case 'PAGO_DEUDA':
      return [
        `${op.cliente ?? 'El cliente'} queda debiendo ${formatARS(op.monto_total)} menos.`,
        `Entran ${formatARS(op.monto_total)} a la caja (${medio}).`,
      ]
    case 'INGRESO_STOCK':
      return [
        `Entran ${unidades} ${unidades === 1 ? 'unidad' : 'unidades'} al stock.`,
        'No toca la caja.',
      ]
    case 'SALIDA_STOCK':
      return [
        `Salen ${unidades} ${unidades === 1 ? 'unidad' : 'unidades'} del stock (${
          op.motivo_salida ? ETIQUETAS_MOTIVO[op.motivo_salida].toLowerCase() : 'sin motivo'
        }).`,
        'No toca la caja.',
      ]
    case 'GASTO_OPERATIVO':
      return [
        `Salen ${formatARS(op.monto_total)} de la caja (${medio}).`,
        'No cambia el stock.',
      ]
  }
}

export function ConfirmCard({
  op,
  onConfirmar,
  onCorregir,
}: {
  op: Operacion
  onConfirmar: () => void
  onCorregir: () => void
}) {
  const visual = TIPO_VISUAL[op.tipo_operacion]
  const Icon = visual.icon
  const sinPlata = op.tipo_operacion === 'INGRESO_STOCK' || op.tipo_operacion === 'SALIDA_STOCK'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-primary/40 backdrop-blur-[2px] sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Confirmar registro"
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-lg bg-card pb-5 shadow-2xl animate-recibo sm:rounded-lg"
      >
        <div className="perforado mx-5 mt-4 h-2" aria-hidden />

        <div className="px-5">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-[13px] font-semibold text-foreground">Recibo</h2>
            <span className="cifra text-[11px] text-muted-foreground">{formatHora(op.fecha)}</span>
          </div>

          <p className="mt-2 text-sm italic leading-relaxed text-foreground text-pretty">
            &ldquo;{op.texto_original}&rdquo;
          </p>

          <div className="mt-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold ${visual.chip}`}
            >
              <Icon className="size-3.5" />
              {ETIQUETAS_TIPO[op.tipo_operacion]}
            </span>
          </div>

          <div className="mt-4 border-t border-border">
            {op.cliente && (
              <div className="flex items-baseline justify-between gap-4 border-b border-border/70 py-2">
                <span className="text-[13px] text-muted-foreground">Cliente</span>
                <span className="text-[13.5px] font-semibold text-foreground">{op.cliente}</span>
              </div>
            )}

            {op.items.length > 0 ? (
              op.items.map((it, i) => (
                <div
                  key={i}
                  className="flex items-baseline justify-between gap-4 border-b border-border/70 py-2"
                >
                  <span className="min-w-0 truncate text-[13.5px] text-foreground">
                    {it.cantidad}× {it.producto}
                  </span>
                  <span className="cifra shrink-0 text-[13px] text-muted-foreground">
                    {formatARS(it.precio_unitario)}
                  </span>
                </div>
              ))
            ) : (
              <div className="border-b border-border/70 py-2 text-[13px] text-muted-foreground">
                Sin artículos identificados.
              </div>
            )}

            <div className="flex items-baseline justify-between gap-4 py-3">
              <span className="text-sm font-semibold text-foreground">Total anotado</span>
              <span className="cifra text-xl font-semibold text-foreground">
                {sinPlata ? `${op.items.reduce((a, it) => a + it.cantidad, 0)} u.` : formatARS(op.monto_total)}
              </span>
            </div>
          </div>

          <div className="mt-1 border-l-2 border-celeste pl-3">
            <p className="mb-1.5 text-[11px] font-semibold text-muted-foreground">Va a pasar</p>
            <ul className="flex flex-col gap-1.5">
              {efectos(op).map((e, i) => (
                <li key={i} className="text-[13px] leading-snug text-foreground text-pretty">
                  {e}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <Button
              onClick={onConfirmar}
              className="h-11 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Check className="size-4" />
              Confirmar y registrar
            </Button>
            <Button
              variant="outline"
              onClick={onCorregir}
              className="h-10 w-full rounded-md text-[13px] font-medium"
            >
              <Pencil className="size-4" />
              Corregir dictado
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
