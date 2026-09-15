import { Banknote, HandCoins, Wallet, type LucideIcon } from 'lucide-react'
import { formatARS } from '@/lib/format'
import { useStore } from '@/lib/store'

interface Tarjeta {
  label: string
  valor: string
  icon: LucideIcon
  caja: string
  badge: string
  texto: string
}

export function MiniCards() {
  const { estado } = useStore()
  const enLaCalle = estado.clientes.reduce((s, c) => s + c.saldo_deuda, 0)

  const tarjetas: Tarjeta[] = [
    {
      label: 'En caja',
      valor: formatARS(estado.caja.total),
      icon: Wallet,
      caja: 'border-celeste/25 bg-celeste/5',
      badge: 'bg-celeste/12 text-celeste',
      texto: 'text-celeste',
    },
    {
      label: 'Efectivo',
      valor: formatARS(estado.caja.efectivo),
      icon: Banknote,
      caja: 'border-success/25 bg-success/5',
      badge: 'bg-success/12 text-success',
      texto: 'text-success',
    },
    {
      label: 'En la calle',
      valor: formatARS(enLaCalle),
      icon: HandCoins,
      caja: 'border-fiado/25 bg-fiado/5',
      badge: 'bg-fiado/12 text-fiado',
      texto: 'text-fiado',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {tarjetas.map(({ label, valor, icon: Icon, caja, badge, texto }) => (
        <div key={label} className={`rounded-lg border p-3 ${caja}`}>
          <div className={`mb-1.5 flex size-7 items-center justify-center rounded-md ${badge}`}>
            <Icon className="size-4" />
          </div>
          <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
          <p className={`cifra text-[15px] font-semibold ${texto}`}>{valor}</p>
        </div>
      ))}
    </div>
  )
}
