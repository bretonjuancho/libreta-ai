import type { Operacion } from '@/lib/types'
import { formatARS, formatHora } from '@/lib/format'
import { ETIQUETAS_MOTIVO, ETIQUETAS_TIPO } from '@/lib/parser'
import { TIPO_VISUAL } from './tipo-visual'

type Tono = 'success' | 'danger' | 'fiado' | 'celeste' | 'violeta' | 'naranja'

const TONO_PILL: Record<Tono, string> = {
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  fiado: 'bg-fiado/12 text-fiado',
  celeste: 'bg-celeste/10 text-celeste',
  violeta: 'bg-violeta/10 text-violeta',
  naranja: 'bg-naranja/10 text-naranja',
}

function asiento(op: Operacion): {
  principal: string
  secundaria: string
  monto: string
  tono: Tono
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
        tono: 'success',
      }
    case 'NUEVO_DEUDA':
      return {
        principal,
        secundaria: `${ETIQUETAS_TIPO.NUEVO_DEUDA} (${op.cliente ?? 'sin cliente'})`,
        monto: `+${formatARS(op.monto_total)}`,
        tono: 'fiado',
      }
    case 'PAGO_DEUDA':
      return {
        principal,
        secundaria: `${ETIQUETAS_TIPO.PAGO_DEUDA} (${op.cliente ?? 'sin cliente'})`,
        monto: `+${formatARS(op.monto_total)}`,
        tono: 'celeste',
      }
    case 'INGRESO_STOCK':
      return {
        principal,
        secundaria: ETIQUETAS_TIPO.INGRESO_STOCK,
        monto: `+${unidades} u.`,
        tono: 'violeta',
      }
    case 'SALIDA_STOCK':
      return {
        principal,
        secundaria: `${ETIQUETAS_TIPO.SALIDA_STOCK} (${
          op.motivo_salida ? ETIQUETAS_MOTIVO[op.motivo_salida] : 'sin motivo'
        })`,
        monto: `−${unidades} u.`,
        tono: 'danger',
      }
    case 'GASTO_OPERATIVO':
      return {
        principal,
        secundaria: `${ETIQUETAS_TIPO.GASTO_OPERATIVO} (${medio})`,
        monto: `−${formatARS(op.monto_total)}`,
        tono: 'naranja',
      }
  }
}

export function MovimientoItem({ op }: { op: Operacion }) {
  const visual = TIPO_VISUAL[op.tipo_operacion]
  const Icon = visual.icon
  const { principal, secundaria, monto, tono } = asiento(op)

  return (
    <div className="flex items-center gap-2.5 border-b border-border/70 py-2.5 last:border-b-0">
      <span className="cifra w-10 shrink-0 text-[11px] text-muted-foreground">
        {formatHora(op.fecha)}
      </span>
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${visual.iconWrap}`}
      >
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-medium leading-snug text-foreground">
          {principal}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className={`size-1.5 shrink-0 rounded-full ${visual.punto}`} aria-hidden />
          <span className="truncate">{secundaria}</span>
        </span>
      </span>
      <span className={`cifra shrink-0 rounded-md px-2 py-1 text-[12.5px] font-semibold ${TONO_PILL[tono]}`}>
        {monto}
      </span>
    </div>
  )
}
