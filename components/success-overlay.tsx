'use client'

import { useEffect } from 'react'
import { Check } from 'lucide-react'
import type { Operacion, TipoOperacion } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { MovimientoItem } from './movimiento-item'

const SELLOS: Record<TipoOperacion, { palabra: string; clase: string }> = {
  VENTA_CONTADO: { palabra: 'En caja', clase: 'border-success text-success' },
  NUEVO_DEUDA: { palabra: 'Anotado', clase: 'border-fiado text-fiado' },
  PAGO_DEUDA: { palabra: 'Cobrado', clase: 'border-success text-success' },
  INGRESO_STOCK: { palabra: 'En stock', clase: 'border-primary text-primary' },
  SALIDA_STOCK: { palabra: 'Descontado', clase: 'border-danger text-danger' },
  GASTO_OPERATIVO: { palabra: 'Pagado', clase: 'border-danger text-danger' },
}

export function SuccessOverlay({
  op,
  onVerMovimiento,
  onVolver,
}: {
  op: Operacion
  onVerMovimiento: () => void
  onVolver: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onVolver, 4500)
    return () => clearTimeout(t)
  }, [onVolver])

  const sello = SELLOS[op.tipo_operacion]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-5 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Registro confirmado"
        className="w-full max-w-sm rounded-lg bg-card p-6 text-center animate-recibo sm:max-w-md"
      >
        <div
          className={`animate-sello mx-auto inline-flex items-center gap-1.5 rounded-md border-2 px-3.5 py-1.5 ${sello.clase}`}
        >
          <Check className="size-4" strokeWidth={3} />
          <span className="text-sm font-bold uppercase tracking-[0.12em]">{sello.palabra}</span>
        </div>

        <h2 className="mt-4 text-lg font-semibold text-foreground">Quedó anotado.</h2>
        <p className="mt-1 mb-4 text-[13px] text-muted-foreground">La libreta ya está al día.</p>

        <div className="border-t border-border text-left">
          <MovimientoItem op={op} />
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <Button
            onClick={onVolver}
            className="h-11 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Seguir anotando
          </Button>
          <Button
            onClick={onVerMovimiento}
            variant="outline"
            className="h-10 w-full rounded-md text-[13px] font-medium"
          >
            Ver el movimiento
          </Button>
        </div>
      </div>
    </div>
  )
}
