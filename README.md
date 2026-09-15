# LibretaAI — El boliche en orden

Asistente de stock, caja y fiados para el almacén de barrio. Actualizá todo hablando o escribiendo.

LibretaAI es una app mobile-first (PWA-ready) pensada para el mostrador: el almacenero registra ventas, fiados, pagos, ingresos/salidas de stock y gastos operativos con lenguaje natural, por texto o voz, y la app lo convierte en una operación estructurada lista para confirmar.

Proyecto actual: prototipo funcional en Next.js con estado local y datos de demo (`Almacén Don Pedro`).

## ¿Qué hace hoy?

- **Inicio:** input de texto + grabación de voz. Ejemplos que entiende:
  - `Venta contado 3 latas de atún $7200`
  - `Anotale pan a Marta $1550`
  - `Marta me pagó $3000 de su deuda`
  - `Ingreso de stock - Yerba 20u`
  - `Gasto - Boleta de luz $15000`
- **Parser en español (`lib/parser.ts`):** detecta cliente, productos del catálogo (con alias, cantidades en números o palabras, precio explícito o último precio usado), monto total, medio de pago y tipo de operación.
- **Confirmación:** cada mensaje parseado genera una tarjeta de confirmación (`ConfirmCard`) con opción a corregir antes de impactar en caja/stock. Overlay de éxito al confirmar.
- **Resumen:** caja del día (total / efectivo / transferencia), movimientos, gráficos.
- **Stock:** lista de productos con stock actual, stock mínimo, alertas de reposición, último precio.
- **Historial:** todas las operaciones del día con tipo, cliente, medio de pago y monto.
- **Clientes / Fiados:** saldo de deuda por cliente, próximos vencimientos, ficha con movimientos y acción rápida para pre-cargar un nuevo fiado o pago.

Tipos de operación soportados (`lib/types.ts`):
`VENTA_CONTADO` · `NUEVO_DEUDA` · `PAGO_DEUDA` · `INGRESO_STOCK` · `SALIDA_STOCK` · `GASTO_OPERATIVO`

## Stack

- **Framework:** Next.js 16.3.3 + React 19
- **Estilos:** Tailwind CSS 4 + shadcn + `Plus_Jakarta_Sans`
- **UI / Charts:** lucide-react, recharts, @base-ui/react
- **Estado:** React Context (`lib/store.tsx`) + datos iniciales de demo (`lib/mock-data.ts`)
- **Package manager:** pnpm

## Estructura

```
app/
  page.tsx      # App principal + navegación por tabs
  layout.tsx    # Metadata, fuente, viewport mobile
  globals.css
lib/
  parser.ts     # parsearMensaje: lenguaje natural -> Operacion
  types.ts      # Operacion, Cliente, Producto, Caja, EstadoApp
  store.tsx     # StoreProvider, confirmar()
  mock-data.ts  # Estado inicial demo
  format.ts
components/
  bottom-nav.tsx
  chat-input.tsx / voice-recorder.tsx
  confirm-card.tsx / success-overlay.tsx
  tabs/ (inicio-tab, resumen-tab, stock-tab, historial-tab, clientes-tab)
```

## Cómo correrlo

```bash
pnpm install
pnpm dev
# abrir http://localhost:3000
```

Build / prod:

```bash
pnpm build
pnpm start
```

## Estado y roadmap

- [x] Prototipo UI mobile + parser local + demo store
- [ ] Persistencia real (DB) y auth multi-comercio
- [ ] IA real para parseo (hoy es reglas + catálogo) y voz-a-texto
- [ ] Cierre de caja, reportes y exportación
- [ ] PWA instalable / offline-first para el mostrador

---
Hecho para almacenes de barrio. Simple en el mostrador, ordenado en los números.
