import { AlertTriangle, Banknote, Wallet } from 'lucide-react'
import { formatARS } from '@/lib/format'
import { useStore } from '@/lib/store'

export function MiniCards() {
  const { estado, productosBajos } = useStore()

  return (
    <div className="grid grid-cols-3 gap-2.5">
      <div className="rounded-2xl bg-card p-3 shadow-sm">
        <div className="mb-1.5 flex size-7 items-center justify-center rounded-lg bg-celeste/15 text-celeste">
          <Wallet className="size-4" />
        </div>
        <p className="text-[11px] font-medium text-muted-foreground">Saldo del día</p>
        <p className="text-sm font-bold text-foreground">{formatARS(estado.caja.total)}</p>
      </div>

      <div className="rounded-2xl bg-card p-3 shadow-sm">
        <div className="mb-1.5 flex size-7 items-center justify-center rounded-lg bg-success/15 text-success">
          <Banknote className="size-4" />
        </div>
        <p className="text-[11px] font-medium text-muted-foreground">Efectivo</p>
        <p className="text-sm font-bold text-foreground">{formatARS(estado.caja.efectivo)}</p>
      </div>

      <div className="rounded-2xl bg-card p-3 shadow-sm ring-1 ring-danger/20">
        <div className="mb-1.5 flex size-7 items-center justify-center rounded-lg bg-danger/12 text-danger">
          <AlertTriangle className="size-4" />
        </div>
        <p className="text-[11px] font-medium text-muted-foreground">Stock bajo</p>
        <p className="text-sm font-bold text-danger">{productosBajos.length} alertas</p>
      </div>
    </div>
  )
}
