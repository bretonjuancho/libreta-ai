import {
  HandCoins,
  NotebookPen,
  PackageMinus,
  PackagePlus,
  Receipt,
  ShoppingCart,
  type LucideIcon,
} from 'lucide-react'
import type { TipoOperacion } from '@/lib/types'

interface TipoVisual {
  icon: LucideIcon
  // clases de texto + fondo suave para chips/iconos
  chip: string
  iconWrap: string
  titulo: string
}

export const TIPO_VISUAL: Record<TipoOperacion, TipoVisual> = {
  VENTA_CONTADO: {
    icon: ShoppingCart,
    chip: 'bg-success/12 text-success',
    iconWrap: 'bg-success/12 text-success',
    titulo: 'Venta contado',
  },
  NUEVO_DEUDA: {
    icon: NotebookPen,
    chip: 'bg-fiado/15 text-fiado',
    iconWrap: 'bg-fiado/15 text-fiado',
    titulo: 'Nuevo fiado',
  },
  PAGO_DEUDA: {
    icon: HandCoins,
    chip: 'bg-celeste/15 text-celeste',
    iconWrap: 'bg-celeste/15 text-celeste',
    titulo: 'Pago de fiado',
  },
  INGRESO_STOCK: {
    icon: PackagePlus,
    chip: 'bg-primary/10 text-primary',
    iconWrap: 'bg-primary/10 text-primary',
    titulo: 'Ingreso de stock',
  },
  SALIDA_STOCK: {
    icon: PackageMinus,
    chip: 'bg-danger/12 text-danger',
    iconWrap: 'bg-danger/12 text-danger',
    titulo: 'Salida de stock',
  },
  GASTO_OPERATIVO: {
    icon: Receipt,
    chip: 'bg-muted-foreground/15 text-muted-foreground',
    iconWrap: 'bg-muted-foreground/15 text-muted-foreground',
    titulo: 'Gasto operativo',
  },
}
