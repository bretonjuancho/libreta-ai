import type {
  Item,
  MedioPago,
  MotivoSalida,
  Operacion,
  Producto,
  TipoOperacion,
} from './types'
import { CATALOGO_PRODUCTOS, NOMBRES_CLIENTES } from './datos-base'

const NOMBRES_CONOCIDOS = NOMBRES_CLIENTES

const PALABRAS_NUMERO: Record<string, number> = {
  un: 1,
  una: 1,
  uno: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
  once: 11,
  doce: 12,
  docena: 12,
  quince: 15,
  veinte: 20,
}

// alias -> nombre canónico + precio de referencia
interface CatalogoEntry {
  alias: string[]
  nombre: string
  precio: number
}

// El catálogo que entiende el parser sale de los mismos datos que el inventario
// de la app (lib/datos-base.ts), así un producto nuevo se reconoce al dictarlo.
const CATALOGO: CatalogoEntry[] = CATALOGO_PRODUCTOS.map((p) => ({
  alias: p.aliases,
  nombre: p.nombre,
  precio: p.precio,
}))

function normalizar(texto: string): string {
  return texto.toLowerCase().trim()
}

function escaparRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// \b no sirve acá: no considera vocales acentuadas ni la ñ como letras
// (ej. el alias "ñoquis" jamás matchearía). Bordes "palabra" inclusive.
// Bordes "palabra" inclusive: \b no sirve acá porque no considera vocales
// acentuadas ni la ñ como letras (el alias "ñoquis" jamás matchearía).
// La variante global recorre todas las apariciones de un alias (el mismo producto
// puede nombrarse dos veces, o un alias corto aparecer dentro de otro más largo).
function regexPalabraGlobal(alias: string): RegExp {
  return new RegExp(`(?<![a-záéíóúñ0-9])${escaparRegex(alias)}(?![a-záéíóúñ0-9])`, 'gi')
}

function nuevoId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID()
    }
  } catch {
    // cae al fallback de abajo
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

const CONECTORES_MENORES = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'en', 'y'])

function capitalizarNombreProducto(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .map((w, i) => (i > 0 && CONECTORES_MENORES.has(w.toLowerCase()) ? w.toLowerCase() : capitalizar(w)))
    .join(' ')
}

function extraerMonto(texto: string): number {
  // El signo "$" es opcional: el usuario casi nunca lo dice en voz alta.
  // Prioriza montos precedidos por "$" si están, pero no son obligatorios.
  const conSigno = texto.match(/\$\s?(\d{1,3}(?:[.,]\d{3})+|\d+)([.,]\d{1,2})?/)
  if (conSigno) {
    return parseInt(conSigno[1].replace(/[.,]/g, ''), 10)
  }
  // Monto pegado a un verbo de plata (deuda/pago/venta/gasto/caja), con o sin "$",
  // ej. "me debe 4000", "pagó 2.000", "gasté 500 en flete", "saqué 3000 de la caja".
  const conVerbo = texto.match(
    /(?:debe|deben|debo|deb[ií]a|pag[óo]|pagu[eé]|abon[óo]|cost[óo]|costaron|sale|vale|valen|gast[óeé]|saqu[éeo]|retir[óeé]|compr[óeé]|deposit[óeé]|cobr[óeé]|recib[íi][óeó]?|entregu[éeó]|prest[óeé]|regal[óeé])\s+\$?\s?(\d{1,3}(?:[.,]\d{3})+|\d+)/i,
  )
  if (conVerbo) {
    return parseInt(conVerbo[1].replace(/[.,]/g, ''), 10)
  }
  // Último recurso: cualquier número "grande" (2+ cifras, o con separador de miles)
  // en el texto, para no perder montos dichos sin signo ni verbo reconocido.
  const suelto = texto.match(/\b(\d{1,3}(?:[.,]\d{3})+|\d{2,})\b/)
  if (suelto) {
    return parseInt(suelto[1].replace(/[.,]/g, ''), 10)
  }
  return 0
}

function palabraANumero(w: string): number | null {
  const limpio = w.replace(/[^a-záéíóúñ0-9]/gi, '')
  if (/^\d+$/.test(limpio)) return parseInt(limpio, 10)
  if (limpio in PALABRAS_NUMERO) return PALABRAS_NUMERO[limpio]
  return null
}

function cantidadAntesDe(texto: string, indice: number): number {
  const previo = texto.slice(0, indice).trim()
  if (!previo) return 1
  const palabras = previo.split(/\s+/)
  const inicio = Math.max(0, palabras.length - 5)
  for (let i = palabras.length - 1; i >= inicio; i--) {
    const n = palabraANumero(palabras[i])
    if (n !== null) return n
  }
  return 1
}

// Precio explícito dicho por el usuario en la ventana de texto que sigue al producto,
// ej. "2 galletitas a 5000", "3 fideos a $1800 c/u", "1 coca por 3500",
// "3 botellas de aceite a Damián por 6000 pesos" (el conector puede no estar pegado
// al producto porque en el medio aparece a quién se le vende).
function extraerPrecioExplicito(ventana: string): number | null {
  const conSigno = ventana.match(/\$\s?(\d{1,3}(?:[.,]\d{3})+|\d+)/)
  if (conSigno) return parseInt(conSigno[1].replace(/[.,]/g, ''), 10)

  const conConector = ventana.match(
    /\b(?:a|x|por)\s+\$?\s?(\d{1,3}(?:[.,]\d{3})+|\d+)(?:\s*pesos?)?\b/i,
  )
  if (conConector) return parseInt(conConector[1].replace(/[.,]/g, ''), 10)

  return null
}

interface MatchCatalogo {
  entry: CatalogoEntry
  index: number
  length: number
}

const UNIDADES_GENERICAS = [
  'paquetes?',
  'paq\\.?',
  'bolsas?',
  'botellas?',
  'latas?',
  'cajas?',
  'cajones?',
  'unidades?',
  'docenas?',
  'kilos?',
  'kg',
  'litros?',
  'packs?',
  'frascos?',
  'sobres?',
  'bandejas?',
  'bidones?',
  'atados?',
]

// Cuando el producto no está en el catálogo conocido (ej. "15 paquetes de ravioles de
// verduras"), lo reconoce igual a partir del patrón "<cantidad> <unidad> de <nombre>",
// para que cualquier mercadería nueva se pueda dar de alta con solo mencionarla.
function extraerItemGenerico(
  texto: string,
): { nombre: string; cantidad: number; precio: number | null } | null {
  const numeros = Object.keys(PALABRAS_NUMERO)
    .sort((a, b) => b.length - a.length)
    .join('|')
  const unidadPattern = UNIDADES_GENERICAS.join('|')
  const re = new RegExp(
    `\\b(\\d+|${numeros})\\s+(?:${unidadPattern})\\s+de\\s+([a-záéíóúñ]+(?:\\s+[a-záéíóúñ]+){0,4}?)(?=\\s+(?:a|x|por)\\s+\\$?\\s?\\d|\\s+\\$|\\s+y\\b|[,.]|$)`,
    'i',
  )
  const m = texto.match(re)
  if (!m || m.index === undefined) return null

  const cantidad = /^\d+$/.test(m[1]) ? parseInt(m[1], 10) : PALABRAS_NUMERO[m[1]] ?? 1
  const nombre = capitalizarNombreProducto(m[2])
  const resto = texto.slice(m.index + m[0].length)
  const precio = extraerPrecioExplicito(resto) ?? extraerPrecioExplicito(m[0])

  return { nombre, cantidad, precio }
}

function extraerItems(texto: string, productos?: Producto[]): Item[] {
  // Junta todas las apariciones de todos los alias. Después elige, de más larga
  // a más corta, las que no se solapan: así "pan rallado" gana sobre "pan" y
  // "jabón en polvo" no tapa al "jabón" de tocador de más adelante. Cada producto
  // se registra una sola vez.
  const candidatos: MatchCatalogo[] = []
  for (const entry of CATALOGO) {
    for (const alias of entry.alias) {
      const re = regexPalabraGlobal(alias)
      let m: RegExpExecArray | null
      while ((m = re.exec(texto)) !== null) {
        candidatos.push({ entry, index: m.index, length: m[0].length })
        if (m.index === re.lastIndex) re.lastIndex++
      }
    }
  }

  candidatos.sort((a, b) => b.length - a.length || a.index - b.index)

  const usados = new Set<string>()
  const ocupados: [number, number][] = []
  const matches: MatchCatalogo[] = []
  for (const c of candidatos) {
    if (usados.has(c.entry.nombre)) continue
    const fin = c.index + c.length
    if (ocupados.some(([s, e]) => c.index < e && fin > s)) continue
    usados.add(c.entry.nombre)
    ocupados.push([c.index, fin])
    matches.push(c)
  }

  matches.sort((a, b) => a.index - b.index)

  const items: Item[] = []
  for (let i = 0; i < matches.length; i++) {
    const { entry, index, length } = matches[i]
    const finVentana = i + 1 < matches.length ? matches[i + 1].index : texto.length
    const ventana = texto.slice(index + length, finVentana)

    const cantidad = cantidadAntesDe(texto, index)
    const prodReal = productos?.find(
      (p) => p.nombre.toLowerCase() === entry.nombre.toLowerCase(),
    )

    // Prioridad: precio que dice el usuario en el mensaje > último precio usado
    // para ese producto > precio guardado en el catálogo/app.
    const precioExplicito = extraerPrecioExplicito(ventana)
    const precio_unitario =
      precioExplicito ?? prodReal?.ultimo_precio ?? prodReal?.precio ?? entry.precio

    items.push({ producto: entry.nombre, cantidad, precio_unitario })
  }

  // Si no hay ningún producto del catálogo conocido, intenta reconocer una mercadería
  // nueva por su nombre (ej. "15 paquetes de ravioles de verduras") para que se pueda
  // dar de alta y sumar al stock aunque nunca se haya registrado antes.
  if (items.length === 0) {
    const generico = extraerItemGenerico(texto)
    if (generico) {
      const prodReal = productos?.find(
        (p) => p.nombre.toLowerCase() === generico.nombre.toLowerCase(),
      )
      const precio_unitario = generico.precio ?? prodReal?.ultimo_precio ?? prodReal?.precio ?? 0
      items.push({
        producto: prodReal?.nombre ?? generico.nombre,
        cantidad: generico.cantidad,
        precio_unitario,
      })
    }
  }

  return items
}

const PALABRAS_EXCLUIDAS_CLIENTE = [
  'caja',
  'negocio',
  'viernes',
  'lunes',
  'martes',
  'miercoles',
  'miércoles',
  'jueves',
  'sabado',
  'sábado',
  'domingo',
  'flete',
  'luz',
  'deuda',
  'cuenta',
  'plata',
  'pago',
  'fiado',
  'proveedor',
]

function capitalizar(palabra: string): string {
  return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase()
}

function detectarCliente(textoOriginal: string): string | null {
  const texto = normalizar(textoOriginal)

  for (const nombre of NOMBRES_CONOCIDOS) {
    if (new RegExp(`\\b${nombre}\\b`, 'i').test(texto)) return nombre
  }

  // Patrones explícitos con nombre propio (conocido o no): "Damian me debe", "le fio a Damian",
  // "anotale a Damian", "al Pedro", "a la Susana", "el Gringo".
  const patrones = [
    /\b([a-záéíóúñ]{3,})\s+me\s+debe\b/i,
    /\bme\s+debe\s+([a-záéíóúñ]{3,})\b/i,
    /\b(?:le\s+fi[oó]|le\s+fi[ée]|anot[aá]le|fiale)\s+a\s+([a-záéíóúñ]{3,})/i,
  ]
  for (const re of patrones) {
    const m = texto.match(re)
    if (m) {
      const palabra = m[1]
      if (!PALABRAS_EXCLUIDAS_CLIENTE.includes(palabra.toLowerCase())) {
        return capitalizar(palabra)
      }
    }
  }

  // Nombre propio (con mayúscula) precedido de "a/al/a la", en cualquier parte del mensaje
  // original, ej. "Le vendí 3 botellas de aceite a Damián por 6000 pesos". Requiere
  // mayúscula para no confundirse con "a la caja", "al negocio", etc.
  const mConector = textoOriginal.match(/\b(?:al|a la|a)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,})\b/)
  if (mConector && !PALABRAS_EXCLUIDAS_CLIENTE.includes(mConector[1].toLowerCase())) {
    return capitalizar(mConector[1])
  }

  // Alternativa más laxa, en minúsculas: "al pedro", "a la susana", "el gringo".
  const mLaxo = texto.match(/\b(?:al|a la|el|la)\s+([a-záéíóúñ]{3,})/i)
  if (mLaxo && !PALABRAS_EXCLUIDAS_CLIENTE.includes(mLaxo[1].toLowerCase())) {
    return capitalizar(mLaxo[1])
  }

  // Última alternativa: nombre propio (con mayúscula) al inicio del mensaje original,
  // ej. "Damian me debe 4000".
  const mCap = textoOriginal.trim().match(/^([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,})\b/)
  if (mCap && !PALABRAS_EXCLUIDAS_CLIENTE.includes(mCap[1].toLowerCase())) {
    return capitalizar(mCap[1])
  }

  return null
}

function detectarMedioPago(texto: string): MedioPago {
  if (/transferencia|transfer|mercado\s?pago|mp\b/i.test(texto)) return 'TRANSFERENCIA'
  if (/efectivo|cash|mano/i.test(texto)) return 'EFECTIVO'
  return 'EFECTIVO'
}

function detectarMotivo(texto: string): MotivoSalida {
  if (/rompi|rotura|roto|se cayó/i.test(texto)) return 'ROTURA'
  if (/vencid|venció|vencimiento/i.test(texto)) return 'VENCIMIENTO'
  if (/agarr|autoconsumo|para m[ií]|me com[íi]/i.test(texto)) return 'AUTOCONSUMO'
  if (/perd[íi]|se perdió|pérdida/i.test(texto)) return 'PERDIDA'
  return 'ROTURA'
}

function clasificar(texto: string, cliente: string | null): TipoOperacion {
  // "no me pagó todavía", "no pagó", "sin pagar": indica que una venta quedó fiada, no que
  // se cobró. Se detecta antes que el patrón de PAGO_DEUDA para no confundirlos.
  const negacionDePago =
    /\bno\s+(?:me\s+)?(?:pag[óoa]|abon[óoa])\b|\bsin\s+pagar\b|\btodav[íi]a\s+no\s+(?:me\s+)?pag/i.test(
      texto,
    )

  if (/se rompi|rotura|vencid|venció|tir[ée]|agarr[ée]|autoconsumo|se rompió|perd[íi]/i.test(texto))
    return 'SALIDA_STOCK'

  if (
    /\bgasto\b|flete|boleta|luz|agua de la|servicio|bolsas|alquiler|expensas|saqu[ée]\s+.*caja|pagu[ée]\s+(el|la)?\s*(flete|luz|boleta)/i.test(
      texto,
    )
  )
    return 'GASTO_OPERATIVO'

  if (/entraron|entr[óo]|ingres[óo]|ingreso|repuse|reposici[óo]n|llegaron|compr[ée]\s+.*proveedor|compr[ée]\s+\d/i.test(texto))
    return 'INGRESO_STOCK'

  if (
    negacionDePago ||
    /anotal|anot[áa]|anota|fial|fiado|\bfia\b|me paga\b|me va a pagar|\bdebe\b|le fi[aoóeé]|me fi[oó]|se lo fi[éeoó]|a cuenta/i.test(
      texto,
    )
  )
    return 'NUEVO_DEUDA'

  if (
    !negacionDePago &&
    ((cliente && /pag[óo]\b|me dej[óo]|sald[óo]|abon[óo]|me vino a dejar|de su deuda|de lo que deb[íi]a/i.test(texto)) ||
      /pago de fiado/i.test(texto))
  )
    return 'PAGO_DEUDA'

  return 'VENTA_CONTADO'
}

export function parsearMensaje(texto: string, productos?: Producto[]): Operacion {
  const t = normalizar(texto)
  const cliente = detectarCliente(texto)
  const tipo = clasificar(t, cliente)
  const items = extraerItems(t, productos)

  // Cuando hay ítems detectados, el monto siempre se calcula a partir de ellos
  // (cantidad × precio ya resuelto: explícito del usuario, último precio usado, o de catálogo).
  // Esto evita que un precio unitario dentro del mensaje ("a $5000") se confunda con un
  // monto total aparte cuando en realidad hay más de una unidad o más de un producto.
  let monto =
    items.length > 0 && (tipo === 'VENTA_CONTADO' || tipo === 'NUEVO_DEUDA' || tipo === 'INGRESO_STOCK')
      ? items.reduce((acc, it) => acc + it.cantidad * it.precio_unitario, 0)
      : extraerMonto(t)

  let medio_pago: MedioPago = null
  let motivo_salida: MotivoSalida = null

  if (tipo === 'VENTA_CONTADO' || tipo === 'PAGO_DEUDA' || tipo === 'GASTO_OPERATIVO') {
    medio_pago = detectarMedioPago(t)
  } else if (tipo === 'NUEVO_DEUDA') {
    medio_pago = 'PENDIENTE'
  } else if (tipo === 'SALIDA_STOCK') {
    motivo_salida = detectarMotivo(t)
  }

  return {
    id: nuevoId(),
    tipo_operacion: tipo,
    cliente: tipo === 'NUEVO_DEUDA' || tipo === 'PAGO_DEUDA' ? cliente : null,
    medio_pago,
    monto_total: monto,
    motivo_salida,
    items,
    texto_original: texto.trim(),
    fecha: new Date().toISOString(),
  }
}

export const ETIQUETAS_TIPO: Record<TipoOperacion, string> = {
  VENTA_CONTADO: 'Venta contado',
  NUEVO_DEUDA: 'Nuevo fiado',
  PAGO_DEUDA: 'Pago de fiado',
  INGRESO_STOCK: 'Ingreso de stock',
  SALIDA_STOCK: 'Salida de stock',
  GASTO_OPERATIVO: 'Gasto operativo',
}

export const ETIQUETAS_MOTIVO: Record<NonNullable<MotivoSalida>, string> = {
  ROTURA: 'Rotura',
  VENCIMIENTO: 'Vencimiento',
  AUTOCONSUMO: 'Autoconsumo',
  PERDIDA: 'Pérdida',
}
