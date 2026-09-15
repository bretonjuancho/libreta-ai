'use client'

import { useState } from 'react'
import {
  BookUser,
  CalendarClock,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  HandCoins,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { formatARS } from '@/lib/format'
import { ClienteFicha } from '../cliente-ficha'

const AVATARES = [
  'bg-celeste/15 text-celeste',
  'bg-success/15 text-success',
  'bg-fiado/15 text-fiado',
  'bg-violeta/15 text-violeta',
  'bg-naranja/15 text-naranja',
  'bg-danger/15 text-danger',
]

function avatarDe(nombre: string): string {
  let h = 0
  for (let i = 0; i < nombre.length; i++) h = (h * 31 + nombre.charCodeAt(i)) % AVATARES.length
  return AVATARES[h]
}

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
  const maxDeuda = ordenados[0]?.saldo_deuda ?? 0

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <header>
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-foreground">
          Fiados
        </h1>
        <p className="text-[13px] text-muted-foreground">La libreta de deudas del barrio</p>
      </header>

      <div className="rounded-xl border border-fiado/25 bg-linear-to-br from-fiado/10 to-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
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
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-fiado/12 text-fiado">
            <HandCoins className="size-5" />
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card px-3">
        {ordenados.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <BookUser className="size-5 text-muted-foreground" strokeWidth={1.5} />
            </span>
            <p className="text-[13.5px] font-medium text-foreground">Todavía no hay clientes</p>
            <p className="text-[12px] text-muted-foreground text-pretty">
              Cuando anotes un fiado, el cliente aparece acá.
            </p>
          </div>
        ) : (
          ordenados.map((c) => {
            const debe = c.saldo_deuda > 0
            const vence =
              c.proximo_vencimiento && c.proximo_vencimiento.toLowerCase() !== 'sin fecha'
                ? c.proximo_vencimiento
                : null
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelId(c.id)}
                className="flex w-full flex-col gap-2 border-b border-border/70 py-3 text-left last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-[13px] font-semibold ${avatarDe(c.nombre)}`}
                  >
                    {c.nombre.charAt(0)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-semibold text-foreground">
                      {c.nombre}
                    </span>
                    <span className="mt-0.5 flex items-center gap-2 text-[11.5px]">
                      {debe ? (
                        <span className="flex items-center gap-1 font-medium text-fiado">
                          <CircleAlert className="size-3" />
                          Debe
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-medium text-success">
                          <CircleCheck className="size-3" />
                          Al día
                        </span>
                      )}
                      {vence && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <CalendarClock className="size-3" />
                          Vence {vence.toLowerCase()}
                        </span>
                      )}
                    </span>
                  </span>
                  <span
                    className={`cifra shrink-0 rounded-md px-2 py-1 text-[12.5px] font-semibold ${
                      debe ? 'bg-fiado/12 text-fiado' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {formatARS(c.saldo_deuda)}
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </div>
                {debe && maxDeuda > 0 && (
                  <div className="ml-12 h-1 overflow-hidden rounded-full bg-fiado/10">
                    <div
                      className="h-full rounded-full bg-fiado"
                      style={{
                        width: `${Math.max(8, Math.round((c.saldo_deuda / maxDeuda) * 100))}%`,
                      }}
                    />
                  </div>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
