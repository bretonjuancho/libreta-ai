'use client'

import { useState } from 'react'
import { ChevronRight, TriangleAlert } from 'lucide-react'
import { useStore } from '@/lib/store'
import { formatARS } from '@/lib/format'
import { ClienteFicha } from '../cliente-ficha'

export function ClientesTab({ onPrefill }: { onPrefill: (texto: string) => void }) {
  const { estado } = useStore()
  const [selId, setSelId] = useState<string | null>(null)

  const seleccionado = estado.clientes.find((c) => c.id === selId) ?? null

  if (seleccionado) {
    return (
      <ClienteFicha
        cliente={seleccionado}
        onVolver={() => setSelId(null)}
        onPrefill={onPrefill}
      />
    )
  }

  const conDeuda = estado.clientes.filter((c) => c.saldo_deuda > 0)
  const totalDeuda = conDeuda.reduce((a, c) => a + c.saldo_deuda, 0)

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <header>
        <h1 className="text-xl font-extrabold text-foreground">Fiados</h1>
        <p className="text-sm text-muted-foreground">La libreta de deudas del barrio</p>
      </header>

      <div className="rounded-3xl bg-fiado/12 p-4 ring-1 ring-fiado/25">
        <p className="text-xs font-semibold text-fiado">Total en la calle</p>
        <p className="text-3xl font-extrabold text-foreground">{formatARS(totalDeuda)}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {conDeuda.length} {conDeuda.length === 1 ? 'cliente debe' : 'clientes deben'} plata
        </p>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        {estado.clientes.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelId(c.id)}
            className="flex items-center gap-3 rounded-2xl bg-card p-3.5 text-left shadow-sm transition-colors hover:bg-accent"
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
              {c.nombre.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">{c.nombre}</p>
              <p className="text-xs text-muted-foreground">
                Vence: {c.proximo_vencimiento ?? 'Sin fecha'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="text-right">
                <p className="text-base font-bold text-fiado">{formatARS(c.saldo_deuda)}</p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-start gap-2 rounded-2xl bg-muted p-3 text-xs text-muted-foreground">
        <TriangleAlert className="size-4 shrink-0 text-fiado" />
        <p className="text-pretty">
          Entrá a un cliente para anotarle un nuevo fiado o registrar un pago hablándole a la libreta.
        </p>
      </div>
    </div>
  )
}
