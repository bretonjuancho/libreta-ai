'use client'

import { ArrowLeft, CalendarClock, HandCoins, NotebookPen } from 'lucide-react'
import type { Cliente } from '@/lib/types'
import { formatARS } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { MovimientoItem } from './movimiento-item'

export function ClienteFicha({
  cliente,
  onVolver,
  onPrefill,
}: {
  cliente: Cliente
  onVolver: () => void
  onPrefill: (texto: string) => void
}) {
  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <button
        type="button"
        onClick={onVolver}
        className="flex items-center gap-1.5 text-sm font-semibold text-celeste"
      >
        <ArrowLeft className="size-4" />
        Volver a fiados
      </button>

      <div className="rounded-3xl bg-primary p-5 text-primary-foreground shadow-sm">
        <p className="text-sm font-medium text-primary-foreground/70">Deuda de</p>
        <h1 className="text-2xl font-extrabold">{cliente.nombre}</h1>
        <p className="mt-3 text-4xl font-extrabold text-fiado">{formatARS(cliente.saldo_deuda)}</p>
        <div className="mt-3 flex items-center gap-1.5 text-sm text-primary-foreground/80">
          <CalendarClock className="size-4" />
          Próximo vencimiento: {cliente.proximo_vencimiento ?? 'Sin fecha'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => onPrefill(`Anotale $ a ${cliente.nombre}`)}
          className="h-12 rounded-xl bg-fiado text-sm font-semibold text-fiado-foreground hover:bg-fiado/90"
        >
          <NotebookPen className="size-4" />
          Anotarle fiado
        </Button>
        <Button
          onClick={() => onPrefill(`${cliente.nombre} me pagó $ de su deuda`)}
          className="h-12 rounded-xl bg-success text-sm font-semibold text-success-foreground hover:bg-success/90"
        >
          <HandCoins className="size-4" />
          Registrar pago
        </Button>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-bold text-foreground">Movimientos del cliente</h2>
        {cliente.movimientos.length === 0 ? (
          <div className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-sm">
            Todavía no hay movimientos registrados.
          </div>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {cliente.movimientos.map((op) => (
              <MovimientoItem key={op.id} op={op} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
