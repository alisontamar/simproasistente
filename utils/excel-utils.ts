// Función para convertir datos a formato CSV (compatible con Excel)
export function convertirDatosACSV(periodos: any[], costosEstandar: any) {
  const headers = [
    "Período",
    "Producción X",
    "Producción Y",
    "Producción Z",
    "Rechazos X",
    "Rechazos Y",
    "Rechazos Z",
    "Costos Reales",
    "Demanda X",
    "Demanda Y",
    "Demanda Z",
    "Costos Estándar Total",
    "Eficiencia vs Estándar (%)",
    "Varianza por Unidad ($)",
    "Cumplimiento Demanda (%)",
    "Costo Unitario Real ($)",
  ]

  const filas = periodos.map((periodo) => {
    const totalProduccionX = periodo.produccionX + (periodo.rechazosX || 0)
    const totalProduccionY = periodo.produccionY + (periodo.rechazosY || 0)
    const totalProduccionZ = periodo.produccionZ + (periodo.rechazosZ || 0)

    const costosEstandarTotal =
      totalProduccionX * costosEstandar.X + totalProduccionY * costosEstandar.Y + totalProduccionZ * costosEstandar.Z

    const eficiencia = periodo.costosReales > 0 ? (costosEstandarTotal / periodo.costosReales) * 100 : 0

    const totalUnidades = totalProduccionX + totalProduccionY + totalProduccionZ
    const varianza = totalUnidades > 0 ? costosEstandarTotal / totalUnidades - periodo.costosReales / totalUnidades : 0

    const totalDemanda = periodo.demandaX + periodo.demandaY + periodo.demandaZ
    const totalProduccionBuena = periodo.produccionX + periodo.produccionY + periodo.produccionZ
    const cumplimiento = totalDemanda > 0 ? Math.min(100, (totalProduccionBuena / totalDemanda) * 100) : 100

    const costoUnitarioReal = totalProduccionBuena > 0 ? periodo.costosReales / totalProduccionBuena : 0

    return [
      periodo.periodo,
      periodo.produccionX,
      periodo.produccionY,
      periodo.produccionZ,
      periodo.rechazosX || 0,
      periodo.rechazosY || 0,
      periodo.rechazosZ || 0,
      periodo.costosReales,
      periodo.demandaX,
      periodo.demandaY,
      periodo.demandaZ,
      costosEstandarTotal.toFixed(2),
      eficiencia.toFixed(2),
      varianza.toFixed(2),
      cumplimiento.toFixed(2),
      costoUnitarioReal.toFixed(2),
    ]
  })

  // Convertir a CSV
  const csvContent = [headers.join(","), ...filas.map((fila) => fila.join(","))].join("\n")

  return csvContent
}

// Función para parsear CSV importado
export function parsearCSVImportado(csvContent: string) {
  const lineas = csvContent.split("\n").filter((linea) => linea.trim())

  if (lineas.length < 2) {
    throw new Error("El archivo debe tener al menos una fila de encabezados y una fila de datos")
  }

  const headers = lineas[0].split(",").map((h) => h.trim())
  const filas = lineas.slice(1)

  // Mapear índices de columnas
  const indices = {
    periodo: headers.findIndex((h) => h.toLowerCase().includes("período") || h.toLowerCase().includes("periodo")),
    produccionX: headers.findIndex(
      (h) => h.toLowerCase().includes("producción x") || h.toLowerCase().includes("produccion x"),
    ),
    produccionY: headers.findIndex(
      (h) => h.toLowerCase().includes("producción y") || h.toLowerCase().includes("produccion y"),
    ),
    produccionZ: headers.findIndex(
      (h) => h.toLowerCase().includes("producción z") || h.toLowerCase().includes("produccion z"),
    ),
    rechazosX: headers.findIndex((h) => h.toLowerCase().includes("rechazos x")),
    rechazosY: headers.findIndex((h) => h.toLowerCase().includes("rechazos y")),
    rechazosZ: headers.findIndex((h) => h.toLowerCase().includes("rechazos z")),
    costosReales: headers.findIndex((h) => h.toLowerCase().includes("costos reales")),
    demandaX: headers.findIndex((h) => h.toLowerCase().includes("demanda x")),
    demandaY: headers.findIndex((h) => h.toLowerCase().includes("demanda y")),
    demandaZ: headers.findIndex((h) => h.toLowerCase().includes("demanda z")),
  }

  const periodos = filas
    .map((fila) => {
      const valores = fila.split(",").map((v) => v.trim())

      return {
        periodo: Number.parseInt(valores[indices.periodo]) || 0,
        produccionX: Number.parseInt(valores[indices.produccionX]) || 0,
        produccionY: Number.parseInt(valores[indices.produccionY]) || 0,
        produccionZ: Number.parseInt(valores[indices.produccionZ]) || 0,
        rechazosX: Number.parseInt(valores[indices.rechazosX]) || 0,
        rechazosY: Number.parseInt(valores[indices.rechazosY]) || 0,
        rechazosZ: Number.parseInt(valores[indices.rechazosZ]) || 0,
        costosReales: Number.parseFloat(valores[indices.costosReales]) || 0,
        demandaX: Number.parseInt(valores[indices.demandaX]) || 0,
        demandaY: Number.parseInt(valores[indices.demandaY]) || 0,
        demandaZ: Number.parseInt(valores[indices.demandaZ]) || 0,
      }
    })
    .filter((periodo) => periodo.periodo > 0) // Filtrar filas inválidas

  return periodos
}

// Función para descargar CSV como Excel
export function descargarComoExcel(csvContent: string, nombreArchivo: string) {
  // Crear BOM para UTF-8 (para caracteres especiales)
  const BOM = "\uFEFF"
  const csvConBOM = BOM + csvContent

  const blob = new Blob([csvConBOM], {
    type: "text/csv;charset=utf-8;",
  })

  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${nombreArchivo}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Función para crear plantilla Excel
export function crearPlantillaExcel() {
  const headers = [
    "Período",
    "Producción X",
    "Producción Y",
    "Producción Z",
    "Rechazos X",
    "Rechazos Y",
    "Rechazos Z",
    "Costos Reales",
    "Demanda X",
    "Demanda Y",
    "Demanda Z",
  ]

  // Datos de ejemplo
  const ejemplos = [
    [1, 100, 80, 60, 5, 3, 2, 850.5, 120, 90, 70],
    [2, 120, 95, 75, 3, 2, 1, 920.75, 130, 100, 80],
    [3, 110, 88, 68, 4, 4, 3, 890.25, 125, 95, 75],
  ]

  const csvContent = [headers.join(","), ...ejemplos.map((fila) => fila.join(","))].join("\n")

  return csvContent
}
