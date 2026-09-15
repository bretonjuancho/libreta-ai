/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Permite probar el dev server desde el celu en la red local.
  // Si el router te asigna otra IP, agregala acá (o usá build+start, que no tiene este bloqueo).
  allowedDevOrigins: ['192.168.1.12'],
}

export default nextConfig
