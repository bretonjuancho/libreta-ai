'use client'

import { useEffect, useRef, useState } from 'react'
import { AudioLines, Mic, Square, TriangleAlert, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Tipos mínimos para la Web Speech API (no siempre presentes en lib.dom).
interface ResultadoVoz {
  isFinal: boolean
  0: { transcript: string }
}
interface EventoResultadoVoz {
  results: ArrayLike<ResultadoVoz>
}
interface EventoErrorVoz {
  error: string
  message?: string
}
interface ReconocimientoVoz {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((ev: EventoResultadoVoz) => void) | null
  onerror: ((ev: EventoErrorVoz) => void) | null
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

// Traduce el código de error de la Web Speech API a un mensaje accionable.
function mensajeDeErrorVoz(codigo: string): string {
  switch (codigo) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'El navegador no tiene permiso para usar el micrófono. Habilitalo desde el candado de la barra de direcciones y en los permisos de micrófono de Windows, o usá el campo de texto.'
    case 'audio-capture':
      return 'No se encontró un micrófono disponible. Conectá uno y probá de nuevo, o usá el campo de texto.'
    case 'network':
      return 'El dictado necesita internet para reconocer la voz y no pudo conectarse. Revisá la conexión o el firewall, o usá el campo de texto.'
    case 'no-speech':
      return 'No se escuchó nada. Acercate al micrófono, hablá y probá de nuevo, o usá el campo de texto.'
    case 'aborted':
      return 'Se cortó el dictado. Probá de nuevo, o usá el campo de texto.'
    case 'language-not-supported':
      return 'El navegador no soporta dictado en español. Usá el campo de texto.'
    default:
      return 'No se pudo usar el micrófono. Revisá el permiso, o usá el campo de texto.'
  }
}

// Pide el micrófono antes de dictar: confirma el permiso y, si el navegador
// o el sistema lo bloquean, devuelve un mensaje que explica el motivo real.
async function verificarMicrofono(): Promise<string | null> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return null
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((t) => t.stop())
    return null
  } catch (err) {
    const nombre = err instanceof DOMException ? err.name : ''
    if (nombre === 'NotAllowedError' || nombre === 'SecurityError')
      return 'El navegador bloqueó el micrófono. Habilitalo desde el candado de la barra de direcciones y en los permisos de micrófono de Windows, o usá el campo de texto.'
    if (nombre === 'NotFoundError' || nombre === 'DevicesNotFoundError')
      return 'No se encontró ningún micrófono conectado. Conectá uno y probá de nuevo, o usá el campo de texto.'
    if (nombre === 'NotReadableError' || nombre === 'TrackStartError')
      return 'Otro programa está usando el micrófono. Cerrá otras apps de audio y probá de nuevo, o usá el campo de texto.'
    return 'No se pudo acceder al micrófono. Revisá el permiso, o usá el campo de texto.'
  }
}

export function VoiceRecorder({ onProcesar }: { onProcesar: (texto: string) => void }) {
  const [grabando, setGrabando] = useState(false)
  const [transcripcion, setTranscripcion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [preparando, setPreparando] = useState(false)
  // null = aún no detectado (primer render / SSR)
  const [soporteVoz, setSoporteVoz] = useState<boolean | null>(null)
  const [contextoSeguro, setContextoSeguro] = useState(true)
  const recRef = useRef<ReconocimientoVoz | null>(null)

  useEffect(() => {
    setSoporteVoz(
      typeof window !== 'undefined' &&
        !!(window.SpeechRecognition ?? window.webkitSpeechRecognition),
    )
    setContextoSeguro(
      typeof window === 'undefined' ? true : window.isSecureContext,
    )
  }, [])

  useEffect(() => {
    return () => {
      detenerReconocimiento()
    }
  }, [])

  const detenerReconocimiento = () => {
    const rec = recRef.current
    recRef.current = null
    if (!rec) return
    rec.onresult = null
    rec.onerror = null
    rec.onend = null
    try {
      rec.abort()
    } catch {
      // ignorar
    }
  }

  const empezar = async () => {
    setError(null)
    setTranscripcion('')
    if (!contextoSeguro) {
      setError(
        'El micrófono necesita HTTPS. Entrá por HTTPS para dictar, o usá el campo de texto.',
      )
      return
    }
    setPreparando(true)
    const problemaMicrofono = await verificarMicrofono()
    if (problemaMicrofono) {
      setPreparando(false)
      setError(problemaMicrofono)
      return
    }
    const rec = crearReconocimiento()
    if (!rec) {
      setPreparando(false)
      setError('Este navegador no soporta dictado por voz. Usá el campo de texto.')
      return
    }
    recRef.current = rec
    rec.onresult = (ev) => {
      let interina = ''
      let final = ''
      for (let i = 0; i < ev.results.length; i++) {
        const r = ev.results[i]
        if (r.isFinal) final += r[0]?.transcript ?? ''
        else interina += r[0]?.transcript ?? ''
      }
      const texto = (final + ' ' + interina).trim()
      if (texto) {
        setTranscripcion(texto)
        setError(null)
      }
    }
    rec.onerror = (ev) => {
      detenerReconocimiento()
      setGrabando(false)
      setError(mensajeDeErrorVoz(ev?.error ?? ''))
    }
    rec.onend = () => {
      recRef.current = null
    }
    try {
      rec.start()
      setGrabando(true)
    } catch {
      recRef.current = null
      setError('No se pudo iniciar el micrófono. Probá de nuevo o usá el campo de texto.')
    } finally {
      setPreparando(false)
    }
  }

  const cancelar = () => {
    detenerReconocimiento()
    setGrabando(false)
    setTranscripcion('')
    setError(null)
  }

  const terminar = () => {
    const texto = transcripcion.trim()
    if (!texto) {
      // No se procesa nada: solo sale de acá lo que realmente se escuchó.
      setError('No se entendió nada del audio. Hablá de nuevo o usá el campo de texto.')
      return
    }
    detenerReconocimiento()
    setGrabando(false)
    setTranscripcion('')
    setError(null)
    onProcesar(texto)
  }

  if (!grabando) {
    const sinSoporte = soporteVoz === false
    return (
      <div className="flex flex-col items-center gap-3 py-2">
        <button
          type="button"
          onClick={empezar}
          disabled={sinSoporte || preparando || !contextoSeguro}
          aria-busy={preparando}
          aria-label="Presioná para dictar"
          className={`relative flex size-20 items-center justify-center rounded-full bg-linear-to-br from-celeste to-primary text-primary-foreground shadow-lg shadow-celeste/25 transition-transform active:scale-95 disabled:opacity-35 disabled:shadow-none ${
            preparando ? 'animate-pulse' : ''
          }`}
        >
          <span
            className="absolute inset-0 rounded-full ring-4 ring-celeste/15"
            aria-hidden
          />
          <Mic className="size-8" strokeWidth={1.8} />
        </button>
        <div className="text-center">
          <p className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-foreground">
            <AudioLines className="size-4 text-celeste" strokeWidth={2} />
            {preparando ? 'Pidiendo permiso…' : 'Presioná para dictar'}
          </p>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground text-pretty">
            &ldquo;Anotale 2 cocas y fideos al Tano&rdquo;
          </p>
          {error ? (
            <p className="mx-auto mt-1.5 flex max-w-60 items-start justify-center gap-1 text-[11.5px] font-medium text-danger text-pretty">
              <TriangleAlert className="mt-px size-3.5 shrink-0" />
              {error}
            </p>
          ) : !contextoSeguro ? (
            <p className="mx-auto mt-1.5 max-w-60 text-[11.5px] text-muted-foreground text-pretty">
              Estás en HTTP: el micrófono no está disponible. Entrá por HTTPS o escribí abajo.
            </p>
          ) : (
            sinSoporte && (
              <p className="mx-auto mt-1.5 max-w-60 text-[11.5px] text-muted-foreground text-pretty">
                Este navegador no soporta dictado por voz. Escribí el movimiento abajo.
              </p>
            )
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg bg-linear-to-br from-primary to-celeste p-5 text-primary-foreground">
      <div className="flex items-center gap-2 text-[13px] font-semibold">
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
            className="animate-wave w-1.5 origin-bottom rounded-full bg-celeste"
            style={{
              height: `${16 + ((i * 7) % 32)}px`,
              animationDelay: `${(i % 6) * 0.09}s`,
            }}
          />
        ))}
      </div>

      <p
        aria-live="polite"
        className="min-h-10 w-full text-center text-sm leading-relaxed text-pretty"
      >
        {transcripcion ? `"${transcripcion}"` : 'Empezá a hablar…'}
      </p>

      {error && (
        <p className="flex items-start justify-center gap-1.5 rounded-md bg-card px-2.5 py-1.5 text-center text-[11.5px] font-medium text-danger text-pretty">
          <TriangleAlert className="mt-px size-3.5 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex w-full gap-2">
        <Button
          onClick={cancelar}
          variant="outline"
          className="h-11 flex-1 rounded-md border-primary-foreground/25 bg-transparent text-[13px] font-medium text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <X className="size-4" />
          Cancelar
        </Button>
        <Button
          onClick={terminar}
          className="h-11 flex-1 rounded-md bg-danger text-[13px] font-semibold text-danger-foreground hover:bg-danger/90"
        >
          <Square className="size-3.5 fill-current" />
          Terminar y anotar
        </Button>
      </div>
    </div>
  )
}
