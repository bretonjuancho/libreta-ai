'use client'

import { useMemo, useState } from 'react'
import {
  Activity,
  HandCoins,
  PackageSearch,
  ReceiptText,
  Scale,
  ShoppingCart,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { useStore } from '@/lib/store'
import { PERFIL } from '@/lib/mock-data'
import { formatARS } from '@/lib/format'
import { ETIQUETAS_MOTIVO } from '@/lib/parser'
import type { Operacion } from '@/lib/types'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

type Periodo = 'dia' | 'mes' | 'anio'
type MetricaFlujo = 'dinero' | 'stock' | 'ambas'

const OPCIONES_PERIODO: { value: Periodo; label: string }[] = [
  { value: 'dia', label: 'Hoy' },
  { value: 'mes', label: 'Mes' },
  { value: 'anio', label: 'Año' },
]

const OPCIONES_METRICA: { value: MetricaFlujo; label: string }[] = [
  { value: 'dinero', label: 'Dinero' },
  { value: 'stock', label: 'Stock' },
  { value: 'ambas', label: 'Ambas' },
]

function estaEnPeriodo(fechaISO: string, periodo: Periodo, ahora: Date): boolean {
  const d = new Date(fechaISO)
  if (periodo === 'dia') return d.toDateString() === ahora.toDateString()
  if (periodo === 'mes')
    return d.getFullYear() === ahora.getFullYear() && d.getMonth() === ahora.getMonth()
  return d.getFullYear() === ahora.getFullYear()
}

function esHoy(fechaISO: string, ahora: Date): boolean {
  return estaEnPeriodo(fechaISO, 'dia', ahora)
}

function deltaDinero(op: Operacion): number {
  if (op.tipo_operacion === 'VENTA_CONTADO' || op.tipo_operacion === 'PAGO_DEUDA')
    return op.monto_total
  if (op.tipo_operacion === 'GASTO_OPERATIVO') return -op.monto_total
  return 0
}

function deltaStock(op: Operacion): number {
  const unidades = op.items.reduce((s, it) => s + it.cantidad, 0)
  if (op.tipo_operacion === 'INGRESO_STOCK') return unidades
  if (op.tipo_operacion === 'SALIDA_STOCK') return -unidades
  if (op.tipo_operacion === 'VENTA_CONTADO' || op.tipo_operacion === 'NUEVO_DEUDA') return -unidades
  return 0
}

function bucketKeyDe(fecha: Date, periodo: Periodo): string {
  if (periodo === 'dia') return `${fecha.getHours()}`
  if (periodo === 'mes') return `${fecha.getDate()}`
  return MESES[fecha.getMonth()]
}

function compacto(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1000) return `$${(n / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`
  return `$${n}`
}

const flujoLineaConfig = {
  dinero: { label: 'Dinero (neto)', color: 'var(--chart-4)' },
  stock: { label: 'Stock (unidades netas)', color: 'var(--chart-1)' },
} satisfies ChartConfig

const cajaConfig = {
  efectivo: { label: 'Efectivo', color: 'var(--chart-1)' },
  transferencia: { label: 'Transferencia', color: 'var(--chart-4)' },
} satisfies ChartConfig

export function ResumenTab() {
  const { estado } = useStore()
  const [periodoVentas, setPeriodoVentas] = useState<Periodo>('dia')
  const [periodoFlujo, setPeriodoFlujo] = useState<Periodo>('dia')
  const [metricaFlujo, setMetricaFlujo] = useState<MetricaFlujo>('ambas')
  const ahora = useMemo(() => new Date(), [])

  const kpis = useMemo(() => {
    let ingresos = 0
    let egresos = 0
    for (const op of estado.historial) {
      if (!esHoy(op.fecha, ahora)) continue
      if (op.tipo_operacion === 'VENTA_CONTADO' || op.tipo_operacion === 'PAGO_DEUDA')
        ingresos += op.monto_total
      if (op.tipo_operacion === 'GASTO_OPERATIVO') egresos += op.monto_total
    }
    const deuda = estado.clientes.reduce((s, c) => s + c.saldo_deuda, 0)
    return { ingresos, egresos, balance: ingresos - egresos, deuda }
  }, [estado, ahora])

  const caja = useMemo(
    () => [
      {
        medio: 'efectivo',
        label: 'Efectivo',
        value: estado.caja.efectivo,
        fill: 'var(--color-efectivo)',
      },
      {
        medio: 'transferencia',
        label: 'Transferencia',
        value: estado.caja.transferencia,
        fill: 'var(--color-transferencia)',
      },
    ],
    [estado],
  )

  const productos = useMemo(() => {
    const acc = new Map<string, number>()
    for (const op of estado.historial) {
      if (op.tipo_operacion !== 'VENTA_CONTADO' && op.tipo_operacion !== 'NUEVO_DEUDA') continue
      if (!estaEnPeriodo(op.fecha, periodoVentas, ahora)) continue
      for (const it of op.items) {
        acc.set(it.producto, (acc.get(it.producto) ?? 0) + it.cantidad * it.precio_unitario)
      }
    }
    return Array.from(acc, ([producto, monto]) => ({ producto, monto }))
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 5)
  }, [estado, periodoVentas, ahora])

  const ticketPromedio = useMemo(() => {
    const ventas = estado.historial.filter(
      (op) => op.tipo_operacion === 'VENTA_CONTADO' && esHoy(op.fecha, ahora),
    )
    if (ventas.length === 0) return 0
    return Math.round(ventas.reduce((s, op) => s + op.monto_total, 0) / ventas.length)
  }, [estado, ahora])

  const buckets = useMemo(() => {
    if (periodoFlujo === 'dia')
      return Array.from({ length: ahora.getHours() + 1 }, (_, h) => ({
        key: `${h}`,
        label: `${h}h`,
      }))
    if (periodoFlujo === 'mes')
      return Array.from({ length: ahora.getDate() }, (_, i) => ({ key: `${i + 1}`, label: `${i + 1}` }))
    return Array.from({ length: ahora.getMonth() + 1 }, (_, i) => ({ key: MESES[i], label: MESES[i] }))
  }, [periodoFlujo, ahora])

  const flujoLinea = useMemo(() => {
    const acc = new Map(buckets.map((b) => [b.key, { dinero: 0, stock: 0 }]))
    for (const op of estado.historial) {
      if (!estaEnPeriodo(op.fecha, periodoFlujo, ahora)) continue
      const key = bucketKeyDe(new Date(op.fecha), periodoFlujo)
      const cur = acc.get(key)
      if (!cur) continue
      cur.dinero += deltaDinero(op)
      cur.stock += deltaStock(op)
    }
    return buckets.map((b) => ({ periodo: b.label, ...acc.get(b.key)! }))
  }, [estado, buckets, periodoFlujo, ahora])

  const mermas = useMemo(() => {
    const acc = new Map<string, { unidades: number; valor: number }>()
    for (const op of estado.historial) {
      if (op.tipo_operacion !== 'SALIDA_STOCK' || !op.motivo_salida) continue
      const etiqueta = ETIQUETAS_MOTIVO[op.motivo_salida]
      const prev = acc.get(etiqueta) ?? { unidades: 0, valor: 0 }
      for (const it of op.items) {
        prev.unidades += it.cantidad
        prev.valor += it.cantidad * it.precio_unitario
      }
      acc.set(etiqueta, prev)
    }
    return Array.from(acc, ([motivo, v]) => ({ motivo, ...v })).sort((a, b) => b.valor - a.valor)
  }, [estado])

  const totalMermaValor = mermas.reduce((s, m) => s + m.valor, 0)

  const totalAlertas = useMemo(
    () => estado.productos.filter((p) => p.stock <= p.stock_minimo).length,
    [estado],
  )

  const prodConfig = { monto: { label: 'Vendido', color: 'var(--chart-2)' } } satisfies ChartConfig
  const mermaConfig = { valor: { label: 'Pérdida', color: 'var(--chart-5)' } } satisfies ChartConfig
  const mostrarDinero = metricaFlujo !== 'stock'
  const mostrarStock = metricaFlujo !== 'dinero'

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <header>
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-foreground">
          Resumen
        </h1>
        <p className="text-[13px] text-muted-foreground">Cómo viene el {PERFIL.nombre} hoy</p>
      </header>

      <section className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
        <Kpi tono="success" label="Ingresos hoy" valor={formatARS(kpis.ingresos)} icon={TrendingUp} />
        <Kpi tono="danger" label="Egresos hoy" valor={formatARS(kpis.egresos)} icon={TrendingDown} />
        <Kpi
          tono={kpis.balance >= 0 ? 'celeste' : 'danger'}
          label="Balance del día"
          valor={formatARS(kpis.balance)}
          icon={Scale}
        />
        <Kpi tono="fiado" label="En la calle" valor={formatARS(kpis.deuda)} icon={HandCoins} />
        <Kpi tono="violeta" label="Ticket promedio" valor={formatARS(ticketPromedio)} icon={ReceiptText} />
        <Kpi
          tono={totalAlertas > 0 ? 'danger' : 'success'}
          label="Para reponer"
          valor={`${totalAlertas} ${totalAlertas === 1 ? 'producto' : 'productos'}`}
          icon={PackageSearch}
        />
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <Panel
          titulo="Flujo de stock y dinero"
          subtitulo={`Movimiento neto ${
            periodoFlujo === 'dia'
              ? 'de hoy, por hora'
              : periodoFlujo === 'mes'
                ? 'de este mes, por día'
                : 'de este año, por mes'
          }`}
          icon={Activity}
          tono="violeta"
          acciones={<Segmented value={periodoFlujo} onChange={setPeriodoFlujo} options={OPCIONES_PERIODO} />}
        >
          <div className="mb-3">
            <Segmented value={metricaFlujo} onChange={setMetricaFlujo} options={OPCIONES_METRICA} />
          </div>
          <ChartContainer config={flujoLineaConfig} className="h-[190px] w-full">
            <LineChart accessibilityLayer data={flujoLinea} margin={{ left: -8, right: 8, top: 8 }}>
              <XAxis
                dataKey="periodo"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval="preserveStartEnd"
                className="text-[10px]"
              />
              {mostrarDinero && (
                <YAxis
                  yAxisId="dinero"
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tickFormatter={(v: number) => compacto(v)}
                  className="text-[10px]"
                />
              )}
              {mostrarStock && (
                <YAxis
                  yAxisId="stock"
                  orientation={mostrarDinero ? 'right' : 'left'}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  className="text-[10px]"
                />
              )}
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(v, name) => (name === 'dinero' ? formatARS(Number(v)) : `${v} u.`)}
                  />
                }
              />
              {mostrarDinero && (
                <Line
                  yAxisId="dinero"
                  dataKey="dinero"
                  type="monotone"
                  stroke="var(--color-dinero)"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {mostrarStock && (
                <Line
                  yAxisId="stock"
                  dataKey="stock"
                  type="monotone"
                  stroke="var(--color-stock)"
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </LineChart>
          </ChartContainer>
          {metricaFlujo === 'ambas' && (
            <Leyenda
              items={[
                ['var(--chart-4)', 'Dinero (neto)'],
                ['var(--chart-1)', 'Stock (unidades)'],
              ]}
            />
          )}
        </Panel>

        <Panel
          titulo="Composición de la caja"
          subtitulo="De dónde viene la plata disponible"
          icon={Wallet}
          tono="success"
        >
          <div className="flex items-center gap-2">
            <ChartContainer config={cajaConfig} className="h-[170px] flex-1">
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="label" formatter={(v) => formatARS(Number(v))} />}
                />
                <Pie data={caja} dataKey="value" nameKey="label" innerRadius={44} strokeWidth={3}>
                  {caja.map((d) => (
                    <Cell key={d.medio} fill={d.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-col gap-3 pr-1">
              {caja.map((d) => (
                <div key={d.medio} className="flex flex-col">
                  <span className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                    <span className="size-2 rounded-sm" style={{ background: d.fill }} />
                    {d.label}
                  </span>
                  <span className="cifra text-[13.5px] font-semibold text-foreground">
                    {formatARS(d.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel
          titulo="Lo más vendido"
          subtitulo={`Productos que más facturaron ${
            periodoVentas === 'dia' ? 'hoy' : periodoVentas === 'mes' ? 'este mes' : 'este año'
          }`}
          icon={TrendingUp}
          tono="success"
          acciones={<Segmented value={periodoVentas} onChange={setPeriodoVentas} options={OPCIONES_PERIODO} />}
        >
          {productos.length === 0 ? (
            <Vacio texto="Todavía no hay ventas con productos en este período." />
          ) : (
            <ChartContainer
              config={prodConfig}
              className="w-full"
              style={{ height: productos.length * 40 + 16 }}
            >
              <BarChart accessibilityLayer data={productos} layout="vertical" margin={{ left: 4, right: 56 }}>
                <YAxis
                  dataKey="producto"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={96}
                  className="text-[11px]"
                  tickFormatter={(v: string) => (v.length > 14 ? v.slice(0, 13) + '…' : v)}
                />
                <XAxis type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent formatter={(v) => formatARS(Number(v))} />}
                />
                <Bar dataKey="monto" fill="var(--color-monto)" radius={3} />
              </BarChart>
            </ChartContainer>
          )}
        </Panel>

        <Panel
          titulo="Mermas"
          subtitulo="Perdido por rotura, vencimiento u otros motivos"
          icon={Trash2}
          tono="naranja"
        >
          {mermas.length === 0 ? (
            <Vacio texto="No anotaste mermas de stock." icon={Trash2} />
          ) : (
            <>
              <ChartContainer
                config={mermaConfig}
                className="w-full"
                style={{ height: mermas.length * 40 + 16 }}
              >
                <BarChart accessibilityLayer data={mermas} layout="vertical" margin={{ left: 4, right: 56 }}>
                  <YAxis
                    dataKey="motivo"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={88}
                    className="text-[11px]"
                  />
                  <XAxis type="number" hide />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent formatter={(v) => formatARS(Number(v))} />}
                  />
                  <Bar dataKey="valor" fill="var(--color-valor)" radius={3} />
                </BarChart>
              </ChartContainer>
              <p className="mt-2 text-center text-[11.5px] text-muted-foreground">
                Total perdido: <span className="cifra font-semibold text-danger">{formatARS(totalMermaValor)}</span>
              </p>
            </>
          )}
        </Panel>
      </div>
    </div>
  )
}

function Kpi({
  label,
  valor,
  tono,
  icon: Icon,
}: {
  label: string
  valor: string
  tono: 'success' | 'danger' | 'celeste' | 'fiado' | 'violeta'
  icon: LucideIcon
}) {
  const est = {
    success: {
      caja: 'border-success/25 bg-success/5',
      badge: 'bg-success/12 text-success',
      texto: 'text-success',
    },
    danger: {
      caja: 'border-danger/25 bg-danger/5',
      badge: 'bg-danger/12 text-danger',
      texto: 'text-danger',
    },
    celeste: {
      caja: 'border-celeste/25 bg-celeste/5',
      badge: 'bg-celeste/12 text-celeste',
      texto: 'text-celeste',
    },
    fiado: {
      caja: 'border-fiado/25 bg-fiado/5',
      badge: 'bg-fiado/12 text-fiado',
      texto: 'text-fiado',
    },
    violeta: {
      caja: 'border-violeta/25 bg-violeta/5',
      badge: 'bg-violeta/12 text-violeta',
      texto: 'text-violeta',
    },
  }[tono]

  return (
    <div className={`rounded-lg border p-3 ${est.caja}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
        <span className={`flex size-6 shrink-0 items-center justify-center rounded-md ${est.badge}`}>
          <Icon className="size-3.5" />
        </span>
      </div>
      <p className={`cifra mt-1 text-[17px] font-semibold ${est.texto}`}>{valor}</p>
    </div>
  )
}

const TONOS_PANEL = {
  celeste: 'bg-celeste/12 text-celeste',
  violeta: 'bg-violeta/12 text-violeta',
  success: 'bg-success/12 text-success',
  fiado: 'bg-fiado/12 text-fiado',
  danger: 'bg-danger/12 text-danger',
  naranja: 'bg-naranja/12 text-naranja',
} as const

function Panel({
  titulo,
  subtitulo,
  icon: Icon,
  tono = 'celeste',
  acciones,
  children,
}: {
  titulo: string
  subtitulo: string
  icon: LucideIcon
  tono?: keyof typeof TONOS_PANEL
  acciones?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border px-3.5 py-3">
        <div className="flex items-start gap-2.5">
          <span
            className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${TONOS_PANEL[tono]}`}
          >
            <Icon className="size-4" />
          </span>
          <div>
            <h2 className="text-[13px] font-semibold leading-tight text-foreground">{titulo}</h2>
            <p className="text-[11.5px] text-muted-foreground">{subtitulo}</p>
          </div>
        </div>
        {acciones}
      </div>
      <div className="px-3.5 py-3">{children}</div>
    </section>
  )
}

function Leyenda({ items }: { items: [string, string][] }) {
  return (
    <div className="mt-2 flex items-center justify-center gap-4">
      {items.map(([color, label]) => (
        <span key={label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="size-2 rounded-sm" style={{ background: color }} />
          {label}
        </span>
      ))}
    </div>
  )
}

function Vacio({ texto, icon: Icon = ShoppingCart }: { texto: string; icon?: LucideIcon }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <Icon className="size-6 text-muted-foreground" strokeWidth={1.5} />
      <p className="text-[13px] text-muted-foreground text-pretty">{texto}</p>
    </div>
  )
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="flex gap-0.5 rounded-md border border-border bg-background p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`rounded-[4px] px-2 py-1 text-[11.5px] font-medium transition-colors ${
            value === o.value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
