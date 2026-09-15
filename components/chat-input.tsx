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
    <div className="flex items-center gap-2 rounded-2xl bg-card p-2 shadow-sm ring-1 ring-border">
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
        placeholder="Escribí: Vendí 2 cocas en efectivo…"
        className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      <button
        type="button"
        onClick={enviar}
        disabled={!texto.trim()}
        aria-label="Enviar"
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-celeste text-celeste-foreground transition-opacity disabled:opacity-40"
      >
        <Send className="size-5" />
      </button>
    </div>
  )
}
