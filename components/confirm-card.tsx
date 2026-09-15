'use client'

import { Check, Pencil, Quote } from 'lucide-react'
import type { Operacion } from '@/lib/types'
import { formatARS } from '@/lib/format'
import { ETIQUETAS_MOTIVO, ETIQUETAS_TIPO } from '@/lib/parser'
import { Button } from '@/components/ui/button'
import { TIPO_VISUAL } from './tipo-visual'

function efectos(op: Operacion): string[] {
  const unidades = op.items.reduce((a, it) => a + it.cantidad, 0)
  const medio = op.medio_pago === 'TRANSFERENCIA' ? 'transferencia' : 'efectivo'
  switch (op.tipo_operacion) {
    case 'VENTA_CONTADO':
      return [
        `Suma a la caja +${formatARS(op.monto_total)} (${medio})`,
        unidades > 0 ? `Descuenta de stock -${unidades} unidades` : 'No modifica el stock',
      ]
    case 'NUEVO_DEUDA':
      return [
        `Aumenta la deuda del cliente +${formatARS(op.monto_total)}`,
        unidades > 0 ? `Descuenta de stock -${unidades} unidades` : 'No modifica el stock',
      ]
    case 'PAGO_DEUDA':
      return [
        `Reduce la deuda del cliente -${formatARS(op.monto_total)}`,
        `Suma a la caja +${formatARS(op.monto_total)} (${medio})`,
      ]
    case 'INGRESO_STOCK':
      return [`Aumenta el stock +${unidades} unidades`, 'No toca la caja ni los clientes']
    case 'SALIDA_STOCK':
      return [
        `Descuenta de stock -${unidades} unidades`,
        `Motivo: ${op.motivo_salida ? ETIQUETAS_MOTIVO[op.motivo_salida] : 'Sin especificar'} · no toca caja`,
      ]
    case 'GASTO_OPERATIVO':
      return [`Descuenta de la caja -${formatARS(op.monto_total)}`, 'No modifica el stock']
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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-primary/40 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-background p-5 pb-6 shadow-2xl duration-300 animate-in slide-in-from-bottom sm:rounded-3xl sm:slide-in-from-bottom-4">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />

        <h2 className="mb-3 text-center text-base font-bold text-foreground">Confirmar registro</h2>

        <div className="mb-4 flex gap-2 rounded-2xl bg-muted p-3">
          <Quote className="size-4 shrink-0 text-muted-foreground" />
          <p className="text-sm italic text-foreground text-pretty">{op.texto_original}</p>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${visual.chip}`}>
            <Icon className="size-3.5" />
            {ETIQUETAS_TIPO[op.tipo_operacion]}
          </span>
        </div>

        {op.cliente && (
          <div className="mb-3 flex items-center justify-between rounded-xl bg-card px-3 py-2.5 shadow-sm">
            <span className="text-xs font-medium text-muted-foreground">Cliente detectado</span>
            <span className="text-sm font-bold text-foreground">{op.cliente}</span>
          </div>
        )}

        {op.items.length > 0 && (
          <div className="mb-3 rounded-xl bg-card p-3 shadow-sm">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Artículos identificados</p>
            <ul className="flex flex-col gap-1.5">
              {op.items.map((it, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">
                    {it.cantidad}x {it.producto}
                  </span>
                  <span className="text-muted-foreground">{formatARS(it.precio_unitario)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {op.tipo_operacion !== 'INGRESO_STOCK' && op.tipo_operacion !== 'SALIDA_STOCK' && (
          <div className="mb-4 rounded-xl bg-card p-3 text-center shadow-sm">
            <p className="text-xs font-medium text-muted-foreground">Total anotado</p>
            <p className="text-3xl font-extrabold text-foreground">{formatARS(op.monto_total)}</p>
          </div>
        )}

        <div className="mb-5 rounded-xl bg-accent/60 p-3">
          <p className="mb-2 text-xs font-semibold text-foreground">Efecto de la operación</p>
          <ul className="flex flex-col gap-2">
            {efectos(op).map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
                  <Check className="size-3" />
                </span>
                {e}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={onConfirmar}
            className="h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Check className="size-5" />
            Confirmar y registrar
          </Button>
          <Button
            variant="outline"
            onClick={onCorregir}
            className="h-11 w-full rounded-xl text-sm font-medium"
          >
            <Pencil className="size-4" />
            Corregir dictado
          </Button>
        </div>
      </div>
    </div>
  )
}
