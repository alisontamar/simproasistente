// Función para crear archivo Excel real con datos correctos de SIMPRO
export function crearArchivoExcel(periodos: any[], costosEstandar: any) {
  const datos = [
    // Encabezados principales
    ["ANÁLISIS DE EFICIENCIA VS ESTÁNDAR - SIMPRO", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    [""], // Fila vacía
    [
      "IMPORTANTE: Usar COSTO TOTAL de la pestaña 'Costos' como Costos Reales",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    [
      "Los datos de producción vienen de la pestaña 'Producción' - Línea 2",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    [""], // Fila vacía
    // Encabezados de columnas
    [
      "Período",
      "Producción Final X",
      "Producción Final Y",
      "Producción Final Z",
      "Rechazos X",
      "Rechazos Y",
      "Rechazos Z",
      "Costo Total ($)",
      "Demanda X",
      "Demanda Y",
      "Demanda Z",
      "Costos Estándar Total",
      "Eficiencia vs Estándar (%)",
      "Varianza por Unidad ($)",
      "Cumplimiento Demanda (%)",
      "Costo Unitario Real ($)",
    ],
    [
      "",
      "(Línea 2)",
      "(Línea 2)",
      "(Línea 2)",
      "(Línea 2)",
      "(Línea 2)",
      "(Línea 2)",
      "(Pestaña Costos)",
      "(Pronóstico)",
      "(Pronóstico)",
      "(Pronóstico)",
      "(Calculado)",
      "(Calculado)",
      "(Calculado)",
      "(Calculado)",
      "(Calculado)",
    ],
  ]

  // Agregar datos de períodos
  periodos.forEach((periodo) => {
    const totalProduccionX = periodo.produccionX + (periodo.rechazosX || 0)
    const totalProduccionY = periodo.produccionY + (periodo.rechazosY || 0)
    const totalProduccionZ = periodo.produccionZ + (periodo.rechazosZ || 0)

    const costosEstandarTotal =
      totalProduccionX * costosEstandar.X + totalProduccionY * costosEstandar.Y + totalProduccionZ * costosEstandar.Z

    const eficiencia = periodo.costoTotal > 0 ? (costosEstandarTotal / periodo.costoTotal) * 100 : 0

    const totalUnidades = totalProduccionX + totalProduccionY + totalProduccionZ
    const varianza = totalUnidades > 0 ? costosEstandarTotal / totalUnidades - periodo.costoTotal / totalUnidades : 0

    const totalDemanda = periodo.demandaX + periodo.demandaY + periodo.demandaZ
    const totalProduccionBuena = periodo.produccionX + periodo.produccionY + periodo.produccionZ
    const cumplimiento = totalDemanda > 0 ? Math.min(100, (totalProduccionBuena / totalDemanda) * 100) : 100

    const costoUnitarioReal = totalProduccionBuena > 0 ? periodo.costoTotal / totalProduccionBuena : 0

    datos.push([
      periodo.periodo,
      periodo.produccionX,
      periodo.produccionY,
      periodo.produccionZ,
      periodo.rechazosX || 0,
      periodo.rechazosY || 0,
      periodo.rechazosZ || 0,
      periodo.costoTotal, // Cambiado de costosReales a costoTotal
      periodo.demandaX,
      periodo.demandaY,
      periodo.demandaZ,
      Number.parseFloat(costosEstandarTotal.toFixed(2)),
      Number.parseFloat(eficiencia.toFixed(2)),
      Number.parseFloat(varianza.toFixed(2)),
      Number.parseFloat(cumplimiento.toFixed(2)),
      Number.parseFloat(costoUnitarioReal.toFixed(2)),
    ])
  })

  // Agregar información adicional
  datos.push([""], ["COSTOS ESTÁNDAR (Manual SIMPRO):"])
  datos.push(["Producto X:", `$${costosEstandar.X}`, "por unidad"])
  datos.push(["Producto Y:", `$${costosEstandar.Y}`, "por unidad"])
  datos.push(["Producto Z:", `$${costosEstandar.Z}`, "por unidad"])
  datos.push([""])
  datos.push(["FÓRMULA EFICIENCIA:", "(Costos Estándar / Costo Total) × 100"])
  datos.push(["FUENTE COSTO TOTAL:", "Pestaña 'Costos' → Sub Total (ej: $2967)"])
  datos.push(["FUENTE PRODUCCIÓN:", "Pestaña 'Producción' → Línea 2 → Columna 'Producción'"])

  return datos
}

// Función para parsear archivo Excel/TSV importado con nombres correctos
export function parsearExcelImportado(contenido: string) {
  const lineas = contenido.split("\n").filter((linea) => linea.trim())

  // Buscar la fila de encabezados
  let indiceEncabezados = -1
  for (let i = 0; i < lineas.length; i++) {
    if (lineas[i].toLowerCase().includes("período") || lineas[i].toLowerCase().includes("periodo")) {
      indiceEncabezados = i
      break
    }
  }

  if (indiceEncabezados === -1) {
    throw new Error("No se encontraron los encabezados. Asegúrate de usar la plantilla correcta.")
  }

  const headers = lineas[indiceEncabezados].split("\t").map((h) => h.trim())
  const filasDatos = lineas.slice(indiceEncabezados + 1)

  // Mapear índices de columnas
  const indices = {
    periodo: headers.findIndex((h) => h.toLowerCase().includes("período") || h.toLowerCase().includes("periodo")),
    produccionX: headers.findIndex(
      (h) =>
        h.toLowerCase().includes("producción final x") ||
        h.toLowerCase().includes("produccion final x") ||
        h.toLowerCase().includes("producción x") ||
        h.toLowerCase().includes("produccion x"),
    ),
    produccionY: headers.findIndex(
      (h) =>
        h.toLowerCase().includes("producción final y") ||
        h.toLowerCase().includes("produccion final y") ||
        h.toLowerCase().includes("producción y") ||
        h.toLowerCase().includes("produccion y"),
    ),
    produccionZ: headers.findIndex(
      (h) =>
        h.toLowerCase().includes("producción final z") ||
        h.toLowerCase().includes("produccion final z") ||
        h.toLowerCase().includes("producción z") ||
        h.toLowerCase().includes("produccion z"),
    ),
    rechazosX: headers.findIndex((h) => h.toLowerCase().includes("rechazos x")),
    rechazosY: headers.findIndex((h) => h.toLowerCase().includes("rechazos y")),
    rechazosZ: headers.findIndex((h) => h.toLowerCase().includes("rechazos z")),
    costoTotal: headers.findIndex(
      (h) =>
        h.toLowerCase().includes("costo total") ||
        h.toLowerCase().includes("costos reales") ||
        h.toLowerCase().includes("sub total"),
    ),
    demandaX: headers.findIndex((h) => h.toLowerCase().includes("demanda x")),
    demandaY: headers.findIndex((h) => h.toLowerCase().includes("demanda y")),
    demandaZ: headers.findIndex((h) => h.toLowerCase().includes("demanda z")),
  }

  const periodos = filasDatos
    .map((fila) => {
      const valores = fila.split("\t").map((v) => v.trim())

      if (valores.length < 4 || !valores[indices.periodo] || isNaN(Number(valores[indices.periodo]))) {
        return null
      }

      return {
        periodo: Number.parseInt(valores[indices.periodo]) || 0,
        produccionX: Number.parseInt(valores[indices.produccionX]) || 0,
        produccionY: Number.parseInt(valores[indices.produccionY]) || 0,
        produccionZ: Number.parseInt(valores[indices.produccionZ]) || 0,
        rechazosX: Number.parseInt(valores[indices.rechazosX]) || 0,
        rechazosY: Number.parseInt(valores[indices.rechazosY]) || 0,
        rechazosZ: Number.parseInt(valores[indices.rechazosZ]) || 0,
        costoTotal: Number.parseFloat(valores[indices.costoTotal]) || 0, // Cambiado
        demandaX: Number.parseInt(valores[indices.demandaX]) || 0,
        demandaY: Number.parseInt(valores[indices.demandaY]) || 0,
        demandaZ: Number.parseInt(valores[indices.demandaZ]) || 0,
      }
    })
    .filter((periodo) => periodo !== null && periodo.periodo > 0)

  return periodos
}

// Función para crear plantilla Excel con instrucciones correctas
export function crearPlantillaExcelReal(costosEstandar: any) {
  const datos = [
    ["PLANTILLA EFICIENCIA VS ESTÁNDAR - SIMPRO"],
    [""],
    ["INSTRUCCIONES PARA OBTENER LOS DATOS:"],
    [""],
    ["1. PRODUCCIÓN (Pestaña 'Producción' → Línea 2):"],
    ["   - Producción Final X: Suma de columna 'Producción' para producto X"],
    ["   - Producción Final Y: Suma de columna 'Producción' para producto Y"],
    ["   - Producción Final Z: Suma de columna 'Producción' para producto Z"],
    ["   - Rechazos: Suma de columna 'Rechazos' por producto"],
    [""],
    ["2. COSTO TOTAL (Pestaña 'Costos'):"],
    ["   - Usar el valor 'Sub Total' (ej: $2967)"],
    ["   - NO usar costos acumulados"],
    [""],
    ["3. DEMANDA (Pronóstico conocido):"],
    ["   - Usar demanda pronosticada para el período"],
    [""],
    ["COSTOS ESTÁNDAR ACTUALES:"],
    [`Producto X: $${costosEstandar.X} por unidad`],
    [`Producto Y: $${costosEstandar.Y} por unidad`],
    [`Producto Z: $${costosEstandar.Z} por unidad`],
    [""],
    ["DATOS A COMPLETAR:"],
    [
      "Período",
      "Producción Final X",
      "Producción Final Y",
      "Producción Final Z",
      "Rechazos X",
      "Rechazos Y",
      "Rechazos Z",
      "Costo Total ($)",
      "Demanda X",
      "Demanda Y",
      "Demanda Z",
    ],
    [
      "",
      "(Línea 2)",
      "(Línea 2)",
      "(Línea 2)",
      "(Línea 2)",
      "(Línea 2)",
      "(Línea 2)",
      "(Pestaña Costos)",
      "(Pronóstico)",
      "(Pronóstico)",
      "(Pronóstico)",
    ],
    // Ejemplos con datos más realistas
    [1, 248, 170, 293, 25, 35, 23, 2967, 1465, 1095, 1740],
    [2, 280, 190, 310, 15, 20, 18, 3150, 1465, 1095, 1740],
    [3, 265, 185, 305, 20, 25, 22, 3050, 1465, 1095, 1740],
  ]

  const tsvContent = datos.map((fila) => fila.join("\t")).join("\n")
  return tsvContent
}

// Función para convertir datos a formato TSV
export function convertirDatosATSV(periodos: any[], costosEstandar: any) {
  const datos = crearArchivoExcel(periodos, costosEstandar)
  const tsvContent = datos.map((fila) => fila.join("\t")).join("\n")
  return tsvContent
}

// Función para descargar como archivo Excel real
export function descargarExcelReal(periodos: any[], costosEstandar: any, nombreArchivo: string) {
  const tsvContent = convertirDatosATSV(periodos, costosEstandar)
  const BOM = "\uFEFF"
  const contenidoConBOM = BOM + tsvContent

  const blob = new Blob([contenidoConBOM], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  })

  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${nombreArchivo}.xls`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
