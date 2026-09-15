import { BookUser, Wallet } from 'lucide-react'
import { formatARS } from '@/lib/format'
import { useStore } from '@/lib/store'

export function MiniCards() {
  const { estado } = useStore()
  const enLaCalle = estado.clientes.reduce((s, c) => s + c.saldo_deuda, 0)

  return (
    <div className="grid grid-cols-3 gap-2.5">
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="mb-1.5 flex size-7 items-center justify-center rounded-md bg-primary/8 text-primary">
          <Wallet className="size-4" />
        </div>
        <p className="text-[11px] font-medium text-muted-foreground">En caja</p>
        <p className="cifra text-[15px] font-semibold text-foreground">
          {formatARS(estado.caja.total)}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <div className="mb-1.5 flex size-7 items-center justify-center rounded-md bg-celeste/12 text-celeste">
          <Wallet className="size-4" />
        </div>
        <p className="text-[11px] font-medium text-muted-foreground">Efectivo</p>
        <p className="cifra text-[15px] font-semibold text-foreground">
          {formatARS(estado.caja.efectivo)}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <div className="mb-1.5 flex size-7 items-center justify-center rounded-md bg-fiado/12 text-fiado">
          <BookUser className="size-4" />
        </div>
        <p className="text-[11px] font-medium text-muted-foreground">En la calle</p>
        <p className="cifra text-[15px] font-semibold text-fiado">{formatARS(enLaCalle)}</p>
      </div>
    </div>
  )
}
