'use client'

import { useEffect } from 'react'
import { Check } from 'lucide-react'
import type { Operacion } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { MovimientoItem } from './movimiento-item'

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
    const t = setTimeout(onVolver, 4000)
    return () => clearTimeout(t)
  }, [onVolver])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-5 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-background p-6 text-center shadow-2xl duration-300 animate-in zoom-in-95 sm:max-w-md">
        <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-success/15 duration-500 animate-in zoom-in-50">
          <div className="flex size-14 items-center justify-center rounded-full bg-success text-success-foreground">
            <Check className="size-8" strokeWidth={3} />
          </div>
        </div>

        <h2 className="text-xl font-extrabold text-foreground">¡Anotado con éxito!</h2>
        <p className="mt-1 mb-5 text-sm text-muted-foreground">Ya actualicé la caja, el stock y los fiados.</p>

        <div className="mb-5 text-left">
          <MovimientoItem op={op} />
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={onVerMovimiento}
            variant="outline"
            className="h-11 w-full rounded-xl text-sm font-medium"
          >
            Ver movimiento
          </Button>
          <Button
            onClick={onVolver}
            className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  )
}
