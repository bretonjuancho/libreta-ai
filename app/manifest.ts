import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LibretaAI — El negocio en orden',
    short_name: 'LibretaAI',
    description: 'Asistente de stock, caja y fiados para el almacén de barrio.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f2f5f7',
    theme_color: '#0f2a44',
    lang: 'es',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      { src: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
  }
}
