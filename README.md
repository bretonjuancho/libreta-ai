# LibretaAI — El boliche en orden

Asistente de stock, caja y fiados para el almacén de barrio. Actualizá todo hablando o escribiendo.

LibretaAI es una app mobile-first (PWA-ready) pensada para el mostrador: el almacenero registra ventas, fiados, pagos, ingresos/salidas de stock y gastos operativos con lenguaje natural, por texto o voz, y la app lo convierte en una operación estructurada lista para confirmar.

Proyecto actual: prototipo funcional en Next.js con estado local (persistido en `localStorage`) y datos de demo (`Almacén Don Pedro`).

## ¿Qué hace hoy?

- **Inicio:** input de texto + dictado por voz (Web Speech API con fallback simulado). Ejemplos que entiende:
  - `Venta contado 3 latas de atún`
  - `Anotale pan a Marta $1550`
  - `Marta me pagó $3000 de su deuda`
  - `Ingreso de stock - Yerba 20u`
  - `Gasto - Boleta de luz $15000`
- **Parser en español (`lib/parser.ts`):** detecta cliente, productos del catálogo (con alias, cantidades en números o palabras, precio explícito o último precio usado) o mercadería nueva por patrón `<cantidad> <unidad> de <nombre>`, monto total, medio de pago y tipo de operación. Distingue "no me pagó" (fiado) de un pago real.
- **Confirmación:** cada mensaje parseado genera una tarjeta de confirmación (`ConfirmCard`) con opción a corregir antes de impactar en caja/stock. Overlay de éxito al confirmar.
- **Resumen:** KPIs del día (ingresos / egresos / balance / deuda en la calle), ticket promedio de hoy, flujo por franja horaria, flujo neto de dinero y stock por período (hoy / mes / año), composición de caja, top deudores, lo más vendido por período, alertas de stock y mermas por motivo.
- **Stock:** lista de productos con stock actual, stock mínimo, alertas de reposición y valor total del stock.
- **Historial:** todas las operaciones con filtros por tipo.
- **Clientes / Fiados:** saldo de deuda por cliente, próximos vencimientos, ficha con movimientos y acción rápida para pre-cargar un nuevo fiado o pago.

Tipos de operación soportados (`lib/types.ts`):
`VENTA_CONTADO` · `NUEVO_DEUDA` · `PAGO_DEUDA` · `INGRESO_STOCK` · `SALIDA_STOCK` · `GASTO_OPERATIVO`

## Stack

- **Framework:** Next.js 16.3.3 + React 19
- **Estilos:** Tailwind CSS 4 + shadcn + `Plus_Jakarta_Sans`
- **UI / Charts:** lucide-react, recharts, @base-ui/react
- **Estado:** React Context (`lib/store.tsx`) + datos iniciales de demo (`lib/mock-data.ts`), persistido en `localStorage`
- **Package manager:** pnpm

## Estructura

```
app/
  page.tsx      # App principal + navegación por tabs
  layout.tsx    # Metadata, fuente, viewport mobile
  manifest.ts   # Manifiesto PWA
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

Chequeo de tipos:

```bash
pnpm typecheck
```

Build / prod:

```bash
pnpm build
pnpm start
```

## Estado y roadmap

- [x] Prototipo UI mobile + parser local + demo store
- [x] Resumen con flujo de dinero/stock, mermas y alertas
- [x] Dictado por voz real (Web Speech API) con fallback
- [ ] Persistencia real (DB) y auth multi-comercio
- [ ] IA real para parseo (hoy es reglas + catálogo) y voz-a-texto
- [ ] Cierre de caja, reportes y exportación
- [ ] PWA instalable / offline-first para el mostrador

---
Hecho para almacenes de barrio. Simple en el mostrador, ordenado en los números.
