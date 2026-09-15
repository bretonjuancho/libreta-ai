'use client'

import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowDownRight,
  ArrowUpRight,
  BookUser,
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
import type { LucideIcon } from 'lucide-react'

const FRANJAS = [
  { label: 'Mañana', desde: 6, hasta: 12 },
  { label: 'Mediodía', desde: 12, hasta: 15 },
  { label: 'Tarde', desde: 15, hasta: 20 },
  { label: 'Noche', desde: 20, hasta: 30 },
] as const

function compacto(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1000) return `$${(n / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`
  return `$${n}`
}

const flujoConfig = {
  ingresos: { label: 'Ingresos', color: 'var(--chart-2)' },
  egresos: { label: 'Egresos', color: 'var(--chart-5)' },
} satisfies ChartConfig

const cajaConfig = {
  efectivo: { label: 'Efectivo', color: 'var(--chart-1)' },
  transferencia: { label: 'Transferencia', color: 'var(--chart-4)' },
} satisfies ChartConfig

export function ResumenTab() {
  const { estado } = useStore()

  const kpis = useMemo(() => {
    let ingresos = 0
    let egresos = 0
    for (const op of estado.historial) {
      if (op.tipo_operacion === 'VENTA_CONTADO' || op.tipo_operacion === 'PAGO_DEUDA')
        ingresos += op.monto_total
      if (op.tipo_operacion === 'GASTO_OPERATIVO') egresos += op.monto_total
    }
    const deuda = estado.clientes.reduce((s, c) => s + c.saldo_deuda, 0)
    return { ingresos, egresos, balance: ingresos - egresos, deuda }
  }, [estado])

  const flujo = useMemo(() => {
    return FRANJAS.map((f) => {
      let ingresos = 0
      let egresos = 0
      for (const op of estado.historial) {
        const h = new Date(op.fecha).getHours()
        const hh = h < 6 ? h + 24 : h
        if (hh < f.desde || hh >= f.hasta) continue
        if (op.tipo_operacion === 'VENTA_CONTADO' || op.tipo_operacion === 'PAGO_DEUDA')
          ingresos += op.monto_total
        if (op.tipo_operacion === 'GASTO_OPERATIVO') egresos += op.monto_total
      }
      return { franja: f.label, ingresos, egresos }
    })
  }, [estado])

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
      for (const it of op.items) {
        acc.set(it.producto, (acc.get(it.producto) ?? 0) + it.cantidad * it.precio_unitario)
      }
    }
    return Array.from(acc, ([producto, monto]) => ({ producto, monto }))
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 5)
  }, [estado])

  const deudaConfig = { deuda: { label: 'Deuda', color: 'var(--chart-3)' } } satisfies ChartConfig
  const prodConfig = { monto: { label: 'Vendido', color: 'var(--chart-1)' } } satisfies ChartConfig

  return (
    <div className="flex flex-col gap-5 p-4 pb-4">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Resumen</h1>
        <p className="text-sm text-muted-foreground">Cómo viene el {PERFIL.nombre}</p>
      </header>

      <section className="grid grid-cols-2 gap-3">
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
      </section>

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

      <Panel titulo="Lo más vendido" subtitulo="Productos que más facturaron hoy">
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
  children,
}: {
  titulo: string
  subtitulo: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-1.5">
        <TrendingUp className="size-4 text-celeste" />
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
