'use client'

import { useMemo, useState } from 'react'
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
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BookUser,
  LineChart as LineChartIcon,
  PackageX,
  Receipt,
  Scale,
  TrendingUp,
} from 'lucide-react'
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
import type { LucideIcon } from 'lucide-react'

const FRANJAS = [
  { label: 'Mañana', desde: 6, hasta: 12 },
  { label: 'Mediodía', desde: 12, hasta: 15 },
  { label: 'Tarde', desde: 15, hasta: 20 },
  { label: 'Noche', desde: 20, hasta: 30 },
] as const

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

type Periodo = 'dia' | 'mes' | 'anio'
type MetricaFlujo = 'dinero' | 'stock' | 'ambas'

const OPCIONES_PERIODO: { value: Periodo; label: string }[] = [
  { value: 'dia', label: 'Hoy' },
  { value: 'mes', label: 'Mes' },
  { value: 'anio', label: 'Año' },
]

function estaEnPeriodo(fechaISO: string, periodo: Periodo, ahora: Date): boolean {
  const d = new Date(fechaISO)
  if (periodo === 'dia') return d.toDateString() === ahora.toDateString()
  if (periodo === 'mes') return d.getFullYear() === ahora.getFullYear() && d.getMonth() === ahora.getMonth()
  return d.getFullYear() === ahora.getFullYear()
}

function esHoy(fechaISO: string, ahora: Date): boolean {
  return estaEnPeriodo(fechaISO, 'dia', ahora)
}

function deltaDinero(op: Operacion): number {
  if (op.tipo_operacion === 'VENTA_CONTADO' || op.tipo_operacion === 'PAGO_DEUDA') return op.monto_total
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

const flujoConfig = {
  ingresos: { label: 'Ingresos', color: 'var(--chart-2)' },
  egresos: { label: 'Egresos', color: 'var(--chart-5)' },
} satisfies ChartConfig

const flujoLineaConfig = {
  dinero: { label: 'Dinero (neto)', color: 'var(--chart-1)' },
  stock: { label: 'Stock (unidades netas)', color: 'var(--chart-4)' },
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

  const flujo = useMemo(() => {
    return FRANJAS.map((f) => {
      let ingresos = 0
      let egresos = 0
      for (const op of estado.historial) {
        if (!esHoy(op.fecha, ahora)) continue
        const h = new Date(op.fecha).getHours()
        const hh = h < 6 ? h + 24 : h
        if (hh < f.desde || hh >= f.hasta) continue
        if (op.tipo_operacion === 'VENTA_CONTADO' || op.tipo_operacion === 'PAGO_DEUDA')
          ingresos += op.monto_total
        if (op.tipo_operacion === 'GASTO_OPERATIVO') egresos += op.monto_total
      }
      return { franja: f.label, ingresos, egresos }
    })
  }, [estado, ahora])

  const caja = useMemo(
    () => [
      { medio: 'efectivo', label: 'Efectivo', value: estado.caja.efectivo, fill: 'var(--color-efectivo)' },
      {
        medio: 'transferencia',
        label: 'Transferencia',
        value: estado.caja.transferencia,
        fill: 'var(--color-transferencia)',
      },
    ],
    [estado],
  )

  const deudores = useMemo(
    () =>
      estado.clientes
        .filter((c) => c.saldo_deuda > 0)
        .sort((a, b) => b.saldo_deuda - a.saldo_deuda)
        .slice(0, 5)
        .map((c) => ({ nombre: c.nombre, deuda: c.saldo_deuda })),
    [estado],
  )

  const productos = useMemo(() => {
    const acc = new Map<string, number>()
    for (const op of estado.historial) {
      if (op.tipo_operacion !== 'VENTA_CONTADO' && op.tipo_operacion !== 'NUEVO_DEUDA')
        continue
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
      return Array.from({ length: ahora.getHours() + 1 }, (_, h) => ({ key: `${h}`, label: `${h}h` }))
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

  const alertasStock = useMemo(
    () =>
      estado.productos
        .filter((p) => p.stock <= p.stock_minimo)
        .sort((a, b) => a.stock / a.stock_minimo - b.stock / b.stock_minimo)
        .slice(0, 5),
    [estado],
  )

  const deudaConfig = { deuda: { label: 'Deuda', color: 'var(--chart-3)' } } satisfies ChartConfig
  const prodConfig = { monto: { label: 'Vendido', color: 'var(--chart-1)' } } satisfies ChartConfig
  const mermaConfig = { valor: { label: 'Pérdida', color: 'var(--chart-5)' } } satisfies ChartConfig
  const mostrarDinero = metricaFlujo !== 'stock'
  const mostrarStock = metricaFlujo !== 'dinero'

  return (
    <div className="flex flex-col gap-5 p-4 pb-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Resumen</h1>
        <p className="text-sm text-muted-foreground">Cómo viene el {PERFIL.nombre}</p>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi
          icon={ArrowUpRight}
          tono="success"
          label="Ingresos hoy"
          valor={formatARS(kpis.ingresos)}
        />
        <Kpi icon={ArrowDownRight} tono="danger" label="Egresos hoy" valor={formatARS(kpis.egresos)} />
        <Kpi
          icon={Scale}
          tono={kpis.balance >= 0 ? 'celeste' : 'danger'}
          label="Balance del día"
          valor={formatARS(kpis.balance)}
        />
        <Kpi icon={BookUser} tono="fiado" label="En la calle" valor={formatARS(kpis.deuda)} />
        <Kpi icon={Receipt} tono="celeste" label="Ticket promedio hoy" valor={formatARS(ticketPromedio)} />
        <Kpi
          icon={AlertTriangle}
          tono={alertasStock.length > 0 ? 'danger' : 'success'}
          label="Alertas de stock"
          valor={`${alertasStock.length} producto${alertasStock.length === 1 ? '' : 's'}`}
        />
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-2">
      <Panel titulo="Flujo del día" subtitulo="Ingresos y egresos por franja horaria">
        <ChartContainer config={flujoConfig} className="h-[190px] w-full">
          <BarChart accessibilityLayer data={flujo} margin={{ left: -8, right: 8, top: 8 }}>
            <XAxis
              dataKey="franja"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-[10px]"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(v: number) => compacto(v)}
              className="text-[10px]"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent formatter={(v) => formatARS(Number(v))} />}
            />
            <Bar dataKey="ingresos" fill="var(--color-ingresos)" radius={[5, 5, 0, 0]} />
            <Bar dataKey="egresos" fill="var(--color-egresos)" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ChartContainer>
        <Leyenda items={[['var(--chart-2)', 'Ingresos'], ['var(--chart-5)', 'Egresos']]} />
      </Panel>

      <Panel
        titulo="Flujo de stock y dinero"
        subtitulo={`Movimiento neto ${
          periodoFlujo === 'dia' ? 'de hoy, por hora' : periodoFlujo === 'mes' ? 'de este mes, por día' : 'de este año, por mes'
        }`}
        icon={LineChartIcon}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <Segmented
            value={metricaFlujo}
            onChange={setMetricaFlujo}
            options={[
              { value: 'dinero', label: 'Dinero' },
              { value: 'stock', label: 'Stock' },
              { value: 'ambas', label: 'Ambas' },
            ]}
          />
          <Segmented value={periodoFlujo} onChange={setPeriodoFlujo} options={OPCIONES_PERIODO} />
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
          <Leyenda items={[['var(--chart-1)', 'Dinero (neto)'], ['var(--chart-4)', 'Stock (unidades)']]} />
        )}
      </Panel>

      <Panel titulo="Composición de la caja" subtitulo="De dónde viene la plata disponible">
        <div className="flex items-center gap-2">
          <ChartContainer config={cajaConfig} className="h-[170px] flex-1">
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="label" formatter={(v) => formatARS(Number(v))} />}
              />
              <Pie data={caja} dataKey="value" nameKey="label" innerRadius={44} strokeWidth={4}>
                {caja.map((d) => (
                  <Cell key={d.medio} fill={d.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="flex flex-col gap-3 pr-1">
            {caja.map((d) => (
              <div key={d.medio} className="flex flex-col">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-2.5 rounded-full" style={{ background: d.fill }} />
                  {d.label}
                </span>
                <span className="text-sm font-bold text-foreground">{formatARS(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel titulo="Deuda en la calle" subtitulo="Quiénes te deben más">
        {deudores.length === 0 ? (
          <Vacio texto="No hay fiados pendientes. ¡Todo cobrado!" />
        ) : (
          <ChartContainer
            config={deudaConfig}
            className="w-full"
            style={{ height: deudores.length * 44 + 20 }}
          >
            <BarChart accessibilityLayer data={deudores} layout="vertical" margin={{ left: 4, right: 44 }}>
              <YAxis
                dataKey="nombre"
                type="category"
                tickLine={false}
                axisLine={false}
                width={72}
                className="text-xs"
              />
              <XAxis type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent formatter={(v) => formatARS(Number(v))} />}
              />
              <Bar dataKey="deuda" fill="var(--color-deuda)" radius={5} />
            </BarChart>
          </ChartContainer>
        )}
      </Panel>

      <Panel
        titulo="Lo más vendido"
        subtitulo={`Productos que más facturaron ${
          periodoVentas === 'dia' ? 'hoy' : periodoVentas === 'mes' ? 'este mes' : 'este año'
        }`}
      >
        <div className="mb-3 flex justify-end">
          <Segmented value={periodoVentas} onChange={setPeriodoVentas} options={OPCIONES_PERIODO} />
        </div>
        {productos.length === 0 ? (
          <Vacio texto="Todavía no registraste ventas con productos." />
        ) : (
          <ChartContainer
            config={prodConfig}
            className="w-full"
            style={{ height: productos.length * 44 + 20 }}
          >
            <BarChart accessibilityLayer data={productos} layout="vertical" margin={{ left: 4, right: 44 }}>
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
              <Bar dataKey="monto" fill="var(--color-monto)" radius={5} />
            </BarChart>
          </ChartContainer>
        )}
      </Panel>

      <Panel titulo="Alertas de stock" subtitulo="Productos que se están agotando" icon={AlertTriangle}>
        {alertasStock.length === 0 ? (
          <Vacio texto="Ningún producto está bajo el mínimo. ¡Bien surtido!" />
        ) : (
          <ul className="flex flex-col gap-3">
            {alertasStock.map((p) => {
              const pct = Math.min(100, Math.round((p.stock / Math.max(1, p.stock_minimo)) * 100))
              const critico = p.stock === 0
              return (
                <li key={p.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{p.nombre}</span>
                    <span className={critico ? 'font-bold text-danger' : 'font-bold text-fiado'}>
                      {p.stock} {p.unidad} en stock
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${critico ? 'bg-danger' : 'bg-fiado'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Panel>

      <Panel titulo="Mermas de stock" subtitulo="Pérdidas por rotura, vencimiento u otros motivos" icon={PackageX}>
        {mermas.length === 0 ? (
          <Vacio texto="No registraste mermas de stock." />
        ) : (
          <>
            <ChartContainer
              config={mermaConfig}
              className="w-full"
              style={{ height: mermas.length * 44 + 20 }}
            >
              <BarChart accessibilityLayer data={mermas} layout="vertical" margin={{ left: 4, right: 52 }}>
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
                <Bar dataKey="valor" fill="var(--color-valor)" radius={5} />
              </BarChart>
            </ChartContainer>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Total perdido: <span className="font-bold text-danger">{formatARS(totalMermaValor)}</span>
            </p>
          </>
        )}
      </Panel>
      </div>
    </div>
  )
}

function Kpi({
  icon: Icon,
  label,
  valor,
  tono,
}: {
  icon: LucideIcon
  label: string
  valor: string
  tono: 'success' | 'danger' | 'celeste' | 'fiado'
}) {
  const tonos: Record<typeof tono, string> = {
    success: 'bg-success/12 text-success',
    danger: 'bg-danger/12 text-danger',
    celeste: 'bg-celeste/12 text-celeste',
    fiado: 'bg-fiado/15 text-fiado',
  }
  return (
    <div className="flex flex-col gap-2 rounded-3xl bg-card p-4 shadow-sm">
      <span className={`flex size-8 items-center justify-center rounded-full ${tonos[tono]}`}>
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
        <p className="text-lg font-extrabold tracking-tight text-foreground">{valor}</p>
      </div>
    </div>
  )
}

function Panel({
  titulo,
  subtitulo,
  icon: Icon = TrendingUp,
  children,
}: {
  titulo: string
  subtitulo: string
  icon?: LucideIcon
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-1.5">
        <Icon className="size-4 text-celeste" />
        <div>
          <h2 className="text-sm font-bold leading-tight text-foreground">{titulo}</h2>
          <p className="text-[11px] text-muted-foreground">{subtitulo}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function Leyenda({ items }: { items: [string, string][] }) {
  return (
    <div className="mt-2 flex items-center justify-center gap-4">
      {items.map(([color, label]) => (
        <span key={label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="size-2.5 rounded-full" style={{ background: color }} />
          {label}
        </span>
      ))}
    </div>
  )
}

function Vacio({ texto }: { texto: string }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{texto}</p>
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
    <div className="flex gap-0.5 rounded-full bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
            value === o.value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
