import type { Operacion } from '@/lib/types'
import { formatARS, formatHora } from '@/lib/format'
import { ETIQUETAS_MOTIVO, ETIQUETAS_TIPO } from '@/lib/parser'
import { TIPO_VISUAL } from './tipo-visual'

function asiento(op: Operacion): {
  principal: string
  secundaria: string
  monto: string
  clase: string
} {
  const unidades = op.items.reduce((a, it) => a + it.cantidad, 0)
  const detalleItems = op.items.map((it) => `${it.cantidad}× ${it.producto}`).join(', ')
  const principal = detalleItems || op.texto_original
  const medio = op.medio_pago === 'TRANSFERENCIA' ? 'Transferencia' : 'Efectivo'

  switch (op.tipo_operacion) {
    case 'VENTA_CONTADO':
      return {
        principal,
        secundaria: `${ETIQUETAS_TIPO.VENTA_CONTADO} (${medio})`,
        monto: `+${formatARS(op.monto_total)}`,
        clase: 'text-success',
      }
    case 'NUEVO_DEUDA':
      return {
        principal,
        secundaria: `${ETIQUETAS_TIPO.NUEVO_DEUDA} (${op.cliente ?? 'sin cliente'})`,
        monto: `+${formatARS(op.monto_total)}`,
        clase: 'text-fiado',
      }
    case 'PAGO_DEUDA':
      return {
        principal,
        secundaria: `${ETIQUETAS_TIPO.PAGO_DEUDA} (${op.cliente ?? 'sin cliente'})`,
        monto: `+${formatARS(op.monto_total)}`,
        clase: 'text-celeste',
      }
    case 'INGRESO_STOCK':
      return {
        principal,
        secundaria: ETIQUETAS_TIPO.INGRESO_STOCK,
        monto: `+${unidades} u.`,
        clase: 'text-primary',
      }
    case 'SALIDA_STOCK':
      return {
        principal,
        secundaria: `${ETIQUETAS_TIPO.SALIDA_STOCK} (${
          op.motivo_salida ? ETIQUETAS_MOTIVO[op.motivo_salida] : 'sin motivo'
        })`,
        monto: `−${unidades} u.`,
        clase: 'text-danger',
      }
    case 'GASTO_OPERATIVO':
      return {
        principal,
        secundaria: `${ETIQUETAS_TIPO.GASTO_OPERATIVO} (${medio})`,
        monto: `−${formatARS(op.monto_total)}`,
        clase: 'text-danger',
      }
  }
}

export function MovimientoItem({ op }: { op: Operacion }) {
  const visual = TIPO_VISUAL[op.tipo_operacion]
  const Icon = visual.icon
  const { principal, secundaria, monto, clase } = asiento(op)

  return (
    <div className="flex items-center gap-2.5 border-b border-border/70 py-2.5 last:border-b-0">
      <span className="cifra w-10 shrink-0 text-[11px] text-muted-foreground">
        {formatHora(op.fecha)}
      </span>
      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-md ${visual.iconWrap}`}
      >
        <Icon className="size-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] leading-snug text-foreground">
          {principal}
        </span>
        <span className="block truncate text-[11px] text-muted-foreground">{secundaria}</span>
      </span>
      <span className={`cifra shrink-0 text-[13.5px] font-semibold ${clase}`}>{monto}</span>
    </div>
  )
}
