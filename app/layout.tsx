import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Archivo, Chivo_Mono } from 'next/font/google'
import './globals.css'

// Archivo (Omnibus-Type): grotesca de señalética, pensada para leer de lejos.
const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
})

// Chivo Mono (Omnibus-Type): las columnas de cifras de la libreta.
const chivoMono = Chivo_Mono({
  subsets: ['latin'],
  variable: '--font-chivo-mono',
})

export const metadata: Metadata = {
  title: 'LibretaAI — El boliche en orden',
  description:
    'Asistente de stock, caja y fiados para el almacén de barrio. Actualizá todo hablando o escribiendo.',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0f2a44',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-background">
      <body className={`${archivo.variable} ${chivoMono.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
