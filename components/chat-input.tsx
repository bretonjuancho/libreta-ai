'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles } from 'lucide-react'

export function ChatInput({
  onProcesar,
  prefill,
}: {
  onProcesar: (texto: string) => void
  prefill?: string
}) {
  const [texto, setTexto] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (prefill) {
      setTexto(prefill)
      inputRef.current?.focus()
    }
  }, [prefill])

  const enviar = () => {
    const limpio = texto.trim()
    if (!limpio) return
    setTexto('')
    onProcesar(limpio)
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card py-1.5 pl-3 pr-1.5 transition-colors focus-within:border-celeste/50 focus-within:ring-2 focus-within:ring-celeste/15">
      <Sparkles className="size-4 shrink-0 text-violeta" strokeWidth={1.9} />
      <input
        ref={inputRef}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (
            e.key === 'Enter' &&
            !e.nativeEvent.isComposing &&
            e.keyCode !== 229
          ) {
            e.preventDefault()
            enviar()
          }
        }}
        placeholder="Escribí lo que pasó: vendí 2 cocas en efectivo…"
        aria-label="Escribir un movimiento"
        className="min-w-0 flex-1 bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      <button
        type="button"
        onClick={enviar}
        disabled={!texto.trim()}
        aria-label="Anotar"
        className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-celeste to-primary text-primary-foreground shadow-sm transition-all hover:opacity-90 disabled:opacity-35 disabled:shadow-none"
      >
        <Send className="size-4" />
      </button>
    </div>
  )
}
