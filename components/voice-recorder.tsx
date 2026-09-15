'use client'

import { useEffect, useRef, useState } from 'react'
import { Mic, Square, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Transcripción simulada (fallback): se escribe palabra por palabra como si fuera Whisper.
const FRASE_SIMULADA = 'Anotale dos Cocas y un paquete de fideos al Tano, me paga el viernes, $4500'

// Tipos mínimos para la Web Speech API (no siempre presentes en lib.dom).
interface ResultadoVoz {
  isFinal: boolean
  0: { transcript: string }
}
interface EventoResultadoVoz {
  results: ArrayLike<ResultadoVoz>
}
interface ReconocimientoVoz {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((ev: EventoResultadoVoz) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

declare global {
  interface Window {
    SpeechRecognition?: new () => ReconocimientoVoz
    webkitSpeechRecognition?: new () => ReconocimientoVoz
  }
}

function crearReconocimiento(): ReconocimientoVoz | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition
  if (!Ctor) return null
  try {
    const rec = new Ctor()
    rec.lang = 'es-AR'
    rec.interimResults = true
    rec.continuous = false
    return rec
  } catch {
    return null
  }
}

export function VoiceRecorder({ onProcesar }: { onProcesar: (texto: string) => void }) {
  const [grabando, setGrabando] = useState(false)
  const [transcripcion, setTranscripcion] = useState('')
  const [vozReal, setVozReal] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recRef = useRef<ReconocimientoVoz | null>(null)
  const finalRef = useRef('')

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      try {
        recRef.current?.abort()
      } catch {
        // ignorar
      }
    }
  }, [])

  const empezarSimulado = () => {
    setVozReal(false)
    setTranscripcion('')
    const palabras = FRASE_SIMULADA.split(' ')
    let i = 0
    timerRef.current = setInterval(() => {
      i++
      setTranscripcion(palabras.slice(0, i).join(' '))
      if (i >= palabras.length && timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }, 130)
  }

  const empezar = () => {
    setGrabando(true)
    setTranscripcion('')
    finalRef.current = ''
    const rec = crearReconocimiento()
    if (!rec) {
      empezarSimulado()
      return
    }
    setVozReal(true)
    recRef.current = rec
    rec.onresult = (ev) => {
      let interina = ''
      let final = ''
      for (let i = 0; i < ev.results.length; i++) {
        const r = ev.results[i]
        if (r.isFinal) final += r[0]?.transcript ?? ''
        else interina += r[0]?.transcript ?? ''
      }
      finalRef.current = final.trim()
      setTranscripcion((final + ' ' + interina).trim())
    }
    rec.onerror = () => {
      // Si falla el micrófono/permiso, cae al modo simulado para no bloquear.
      try {
        rec.abort()
      } catch {
        // ignorar
      }
      recRef.current = null
      empezarSimulado()
    }
    rec.onend = () => {
      recRef.current = null
    }
    try {
      rec.start()
    } catch {
      recRef.current = null
      empezarSimulado()
    }
  }

  const cancelar = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    try {
      recRef.current?.abort()
    } catch {
      // ignorar
    }
    recRef.current = null
    setGrabando(false)
    setTranscripcion('')
  }

  const terminar = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    try {
      recRef.current?.stop()
    } catch {
      // ignorar
    }
    recRef.current = null
    const texto = (transcripcion || finalRef.current || FRASE_SIMULADA).trim()
    setGrabando(false)
    setTranscripcion('')
    onProcesar(texto)
  }

  if (!grabando) {
    return (
      <div className="flex flex-col items-center gap-3 py-2">
        <button
          type="button"
          onClick={empezar}
          aria-label="Presioná para dictar"
          className="group relative flex size-24 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
        >
          <span className="absolute inset-0 rounded-full bg-primary/20 blur-md" aria-hidden />
          <Mic className="size-10" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">Presioná para dictar</p>
          <p className="mt-0.5 text-xs text-muted-foreground text-pretty">
            &ldquo;Anotale 2 cocas y fideos al Tano&rdquo;
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl bg-primary p-5 text-primary-foreground shadow-lg">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-danger opacity-75" />
          <span className="relative inline-flex size-2.5 rounded-full bg-danger" />
        </span>
        Escuchando voz…
      </div>

      <div className="flex h-12 items-end gap-1" aria-hidden>
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="w-1.5 origin-bottom rounded-full bg-celeste animate-wave"
            style={{
              height: `${16 + ((i * 7) % 32)}px`,
              animationDelay: `${(i % 6) * 0.09}s`,
            }}
          />
        ))}
      </div>

      <p className="min-h-10 w-full text-center text-sm leading-relaxed text-pretty">
        {transcripcion ? `"${transcripcion}"` : 'Empezá a hablar…'}
      </p>
      {!vozReal && (
        <p className="text-center text-[11px] text-primary-foreground/70">
          Vista previa simulada: este navegador no soporta dictado por voz.
        </p>
      )}

      <div className="flex w-full gap-2">
        <Button
          onClick={cancelar}
          className="h-11 flex-1 rounded-xl bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25"
        >
          <X className="size-4" />
          Cancelar
        </Button>
        <Button
          onClick={terminar}
          className="h-11 flex-1 rounded-xl bg-danger text-danger-foreground hover:bg-danger/90"
        >
          <Square className="size-4 fill-current" />
          Terminar y procesar
        </Button>
      </div>
    </div>
  )
}
