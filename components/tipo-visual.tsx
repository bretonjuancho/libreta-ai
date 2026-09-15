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
  // banda de color para cabeceras (recibo, confirmación)
  banda: string
  // color plano para puntos y barras
  punto: string
  titulo: string
}

export const TIPO_VISUAL: Record<TipoOperacion, TipoVisual> = {
  VENTA_CONTADO: {
    icon: ShoppingCart,
    chip: 'bg-success/12 text-success',
    iconWrap: 'bg-success/12 text-success',
    banda: 'from-success/15',
    punto: 'bg-success',
    titulo: 'Venta contado',
  },
  NUEVO_DEUDA: {
    icon: NotebookPen,
    chip: 'bg-fiado/12 text-fiado',
    iconWrap: 'bg-fiado/12 text-fiado',
    banda: 'from-fiado/15',
    punto: 'bg-fiado',
    titulo: 'Nuevo fiado',
  },
  PAGO_DEUDA: {
    icon: HandCoins,
    chip: 'bg-celeste/12 text-celeste',
    iconWrap: 'bg-celeste/12 text-celeste',
    banda: 'from-celeste/15',
    punto: 'bg-celeste',
    titulo: 'Pago de fiado',
  },
  INGRESO_STOCK: {
    icon: PackagePlus,
    chip: 'bg-violeta/12 text-violeta',
    iconWrap: 'bg-violeta/12 text-violeta',
    banda: 'from-violeta/15',
    punto: 'bg-violeta',
    titulo: 'Ingreso de stock',
  },
  SALIDA_STOCK: {
    icon: PackageMinus,
    chip: 'bg-danger/12 text-danger',
    iconWrap: 'bg-danger/12 text-danger',
    banda: 'from-danger/15',
    punto: 'bg-danger',
    titulo: 'Salida de stock',
  },
  GASTO_OPERATIVO: {
    icon: Receipt,
    chip: 'bg-naranja/12 text-naranja',
    iconWrap: 'bg-naranja/12 text-naranja',
    banda: 'from-naranja/15',
    punto: 'bg-naranja',
    titulo: 'Gasto operativo',
  },
}
