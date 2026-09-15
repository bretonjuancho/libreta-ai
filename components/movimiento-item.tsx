import type { Operacion } from '@/lib/types'
import { formatARS, formatHora } from '@/lib/format'
import { ETIQUETAS_MOTIVO } from '@/lib/parser'
import { TIPO_VISUAL } from './tipo-visual'

function detalle(op: Operacion): { texto: string; clase: string } {
  const unidades = op.items.reduce((a, it) => a + it.cantidad, 0)
  switch (op.tipo_operacion) {
    case 'VENTA_CONTADO':
      return { texto: `+${formatARS(op.monto_total)} · ${op.medio_pago === 'TRANSFERENCIA' ? 'Transf.' : 'Efectivo'}`, clase: 'text-success' }
    case 'NUEVO_DEUDA':
      return { texto: `Deuda +${formatARS(op.monto_total)} · ${op.cliente ?? ''}`, clase: 'text-fiado' }
    case 'PAGO_DEUDA':
      return { texto: `Deuda -${formatARS(op.monto_total)} · ${op.cliente ?? ''}`, clase: 'text-celeste' }
    case 'INGRESO_STOCK':
      return { texto: `+${unidades} un. en stock`, clase: 'text-primary' }
    case 'SALIDA_STOCK':
      return { texto: `-${unidades} un. · ${op.motivo_salida ? ETIQUETAS_MOTIVO[op.motivo_salida] : ''}`, clase: 'text-danger' }
    case 'GASTO_OPERATIVO':
      return { texto: `-${formatARS(op.monto_total)} de caja`, clase: 'text-danger' }
  }
}

export function MovimientoItem({ op }: { op: Operacion }) {
  const visual = TIPO_VISUAL[op.tipo_operacion]
  const Icon = visual.icon
  const det = detalle(op)
  const titulo =
    op.items.length > 0
      ? op.items.map((it) => `${it.cantidad}x ${it.producto}`).join(', ')
      : op.texto_original

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${visual.iconWrap}`}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{visual.titulo}</p>
        <p className="truncate text-xs text-muted-foreground">{titulo}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={`text-sm font-bold ${det.clase}`}>{det.texto.split(' · ')[0]}</p>
        <p className="text-[11px] text-muted-foreground">{formatHora(op.fecha)}</p>
      </div>
    </div>
  )
}
