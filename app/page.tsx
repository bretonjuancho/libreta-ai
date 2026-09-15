'use client'

import { useState } from 'react'
import type { Operacion } from '@/lib/types'
import { parsearMensaje } from '@/lib/parser'
import { StoreProvider, useStore } from '@/lib/store'
import { BottomNav, type Tab } from '@/components/bottom-nav'
import { ConfirmCard } from '@/components/confirm-card'
import { SuccessOverlay } from '@/components/success-overlay'
import { InicioTab } from '@/components/tabs/inicio-tab'
import { ResumenTab } from '@/components/tabs/resumen-tab'
import { StockTab } from '@/components/tabs/stock-tab'
import { HistorialTab } from '@/components/tabs/historial-tab'
import { ClientesTab } from '@/components/tabs/clientes-tab'

function App() {
  const { estado, confirmar } = useStore()
  const [tab, setTab] = useState<Tab>('inicio')
  const [prefill, setPrefill] = useState<{ texto: string; n: number } | undefined>()
  const [pendiente, setPendiente] = useState<Operacion | null>(null)
  const [exito, setExito] = useState<Operacion | null>(null)

  const procesar = (texto: string) => {
    setPendiente(parsearMensaje(texto, estado.productos))
  }

  const confirmarPendiente = () => {
    if (!pendiente) return
    confirmar(pendiente)
    setExito(pendiente)
    setPendiente(null)
  }

  const corregir = () => {
    if (pendiente) {
      setPrefill({ texto: pendiente.texto_original, n: Date.now() })
      setTab('inicio')
    }
    setPendiente(null)
  }

  const prefillDesdeCliente = (texto: string) => {
    setPrefill({ texto, n: Date.now() })
    setTab('inicio')
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-background">
      <main className="flex-1">
        {tab === 'inicio' && (
          <InicioTab
            onProcesar={procesar}
            onVerHistorial={() => setTab('historial')}
            prefill={prefill?.texto}
            key={prefill?.n ?? 'inicio'}
          />
        )}
        {tab === 'resumen' && <ResumenTab />}
        {tab === 'stock' && <StockTab />}
        {tab === 'historial' && <HistorialTab />}
        {tab === 'clientes' && <ClientesTab onPrefill={prefillDesdeCliente} />}
      </main>

      <BottomNav activo={tab} onCambiar={setTab} />

      {pendiente && (
        <ConfirmCard
          op={pendiente}
          onConfirmar={confirmarPendiente}
          onCorregir={corregir}
        />
      )}

      {exito && (
        <SuccessOverlay
          op={exito}
          onVerMovimiento={() => {
            setExito(null)
            setTab('historial')
          }}
          onVolver={() => {
            setExito(null)
            setTab('inicio')
          }}
        />
      )}
    </div>
  )
}

export default function Page() {
  return (
    <StoreProvider>
      <App />
    </StoreProvider>
  )
}
