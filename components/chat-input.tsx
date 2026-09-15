'use client'

import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'

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
    <div className="flex items-end gap-2 rounded-lg border border-border bg-card pl-3 pr-2 py-2">
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
        className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity hover:bg-primary/90 disabled:opacity-35"
      >
        <Send className="size-4" />
      </button>
    </div>
  )
}
