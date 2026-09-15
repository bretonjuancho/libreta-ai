'use client'

import { useState } from 'react'
import { BookUser, ChevronRight } from 'lucide-react'
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
  const ordenados = [...estado.clientes].sort((a, b) => b.saldo_deuda - a.saldo_deuda)

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <header>
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-foreground">
          Fiados
        </h1>
        <p className="text-[13px] text-muted-foreground">La libreta de deudas del barrio</p>
      </header>

      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-[12px] font-medium text-muted-foreground">Total en la calle</p>
        <p className="cifra mt-1 text-[30px] font-semibold leading-none text-fiado">
          {formatARS(totalDeuda)}
        </p>
        <p className="mt-2 text-[12px] text-muted-foreground">
          {conDeuda.length === 0
            ? 'Nadie debe nada. Libreta limpia.'
            : `${conDeuda.length} ${conDeuda.length === 1 ? 'cliente debe' : 'clientes deben'} plata`}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card px-3">
        {ordenados.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <BookUser className="size-7 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-[13.5px] font-medium text-foreground">Todavía no hay clientes</p>
            <p className="text-[12px] text-muted-foreground text-pretty">
              Cuando anotes un fiado, el cliente aparece acá.
            </p>
          </div>
        ) : (
          ordenados.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelId(c.id)}
              className="flex w-full items-center gap-3 border-b border-border/70 py-3 text-left last:border-b-0"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/8 text-[13px] font-semibold text-primary">
                {c.nombre.charAt(0)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-semibold text-foreground">
                  {c.nombre}
                </span>
                <span className="block truncate text-[11.5px] text-muted-foreground">
                  {c.saldo_deuda > 0 ? 'Debe' : 'Al día'}
                  {c.proximo_vencimiento ? ` (vence ${c.proximo_vencimiento.toLowerCase()})` : ''}
                </span>
              </span>
              <span
                className={`cifra shrink-0 text-[13.5px] font-semibold ${
                  c.saldo_deuda > 0 ? 'text-fiado' : 'text-muted-foreground'
                }`}
              >
                {formatARS(c.saldo_deuda)}
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ))
        )}
      </div>
    </div>
  )
}
