"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import {
  TrendingUp,
  Target,
  Award,
  Calculator,
  Upload,
  Trash2,
  Save,
  FileSpreadsheet,
  FileText,
  Info,
  Lightbulb,
  ArrowRight,
} from "lucide-react"
import { useSimproData } from "@/hooks/use-simpro-data"
import { descargarExcelReal, parsearExcelImportado, crearPlantillaExcelReal } from "@/utils/excel-utils-real"

interface PeriodoEficiencia {
  periodo: number
  produccionX: number
  produccionY: number
  produccionZ: number
  costoTotal: number // Cambiado de costosReales
  demandaX: number
  demandaY: number
  demandaZ: number
  rechazosX?: number
  rechazosY?: number
  rechazosZ?: number
}

export default function EficienciaVsEstandar() {
  const { data, actualizarPeriodos, limpiarDatos } = useSimproData()
  const [periodos, setPeriodos] = useState<PeriodoEficiencia[]>([])
  const [nuevoPeriodo, setNuevoPeriodo] = useState<PeriodoEficiencia>({
    periodo: 1,
    produccionX: 0,
    produccionY: 0,
    produccionZ: 0,
    costoTotal: 0, // Cambiado
    demandaX: 0,
    demandaY: 0,
    demandaZ: 0,
    rechazosX: 0,
    rechazosY: 0,
    rechazosZ: 0,
  })

  // Cargar datos del localStorage al inicializar
  useEffect(() => {
    if (data.periodos.length > 0) {
      setPeriodos(data.periodos)
      const ultimoPeriodo = Math.max(...data.periodos.map((p) => p.periodo), 0)
      setNuevoPeriodo((prev) => ({ ...prev, periodo: ultimoPeriodo + 1 }))
    }
  }, [data.periodos])

  const costosEstandar = data.configuracion.costosEstandar

  const agregarPeriodo = () => {
    const nuevosPeridos = [...periodos, { ...nuevoPeriodo }]
    setPeriodos(nuevosPeridos)
    actualizarPeriodos(nuevosPeridos)

    setNuevoPeriodo({
      periodo: nuevoPeriodo.periodo + 1,
      produccionX: 0,
      produccionY: 0,
      produccionZ: 0,
      costoTotal: 0,
      demandaX: 0,
      demandaY: 0,
      demandaZ: 0,
      rechazosX: 0,
      rechazosY: 0,
      rechazosZ: 0,
    })
  }

  const eliminarPeriodo = (index: number) => {
    const nuevosPeridos = periodos.filter((_, i) => i !== index)
    setPeriodos(nuevosPeridos)
    actualizarPeriodos(nuevosPeridos)
  }

  const guardarDatos = () => {
    actualizarPeriodos(periodos)
  }

  // Exportar a Excel real
  const exportarAExcel = () => {
    try {
      const fecha = new Date().toISOString().split("T")[0]
      descargarExcelReal(periodos, costosEstandar, `simpro-eficiencia-${fecha}`)
    } catch (error) {
      alert("Error al exportar datos: " + error)
    }
  }

  // Descargar plantilla Excel
  const descargarPlantilla = () => {
    try {
      const plantilla = crearPlantillaExcelReal(costosEstandar)
      const BOM = "\uFEFF"
      const contenidoConBOM = BOM + plantilla

      const blob = new Blob([contenidoConBOM], {
        type: "application/vnd.ms-excel;charset=utf-8;",
      })

      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "simpro-plantilla-eficiencia.xls")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      alert("Error al crear plantilla: " + error)
    }
  }

  // Importar desde Excel
  const handleImportarExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const contenido = e.target?.result as string
          const periodosImportados = parsearExcelImportado(contenido)

          if (periodosImportados.length === 0) {
            alert("No se encontraron datos válidos en el archivo")
            return
          }

          const confirmar = confirm(
            `Se importarán ${periodosImportados.length} períodos.\n\n` +
              "¿Deseas reemplazar los datos actuales?\n\n" +
              "Aceptar = Reemplazar todos los datos\n" +
              "Cancelar = Agregar a los datos existentes",
          )

          let nuevosPeridos: PeriodoEficiencia[]
          if (confirmar) {
            nuevosPeridos = periodosImportados
          } else {
            const periodosExistentes = new Set(periodos.map((p) => p.periodo))
            const periodosNuevos = periodosImportados.filter((p) => !periodosExistentes.has(p.periodo))
            nuevosPeridos = [...periodos, ...periodosNuevos]
          }

          setPeriodos(nuevosPeridos)
          actualizarPeriodos(nuevosPeridos)

          const ultimoPeriodo = Math.max(...nuevosPeridos.map((p) => p.periodo), 0)
          setNuevoPeriodo((prev) => ({ ...prev, periodo: ultimoPeriodo + 1 }))

          alert(`Importación exitosa: ${periodosImportados.length} períodos procesados`)
        } catch (error) {
          alert("Error al importar archivo: " + error)
        }
      }
      reader.readAsText(file)
    }
    event.target.value = ""
  }

  const limpiarTodosDatos = () => {
    if (confirm("¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.")) {
      limpiarDatos()
      setPeriodos([])
      setNuevoPeriodo({
        periodo: 1,
        produccionX: 0,
        produccionY: 0,
        produccionZ: 0,
        costoTotal: 0,
        demandaX: 0,
        demandaY: 0,
        demandaZ: 0,
        rechazosX: 0,
        rechazosY: 0,
        rechazosZ: 0,
      })
    }
  }

  // Cálculos corregidos
  const calcularEficienciaVsEstandar = (periodo: PeriodoEficiencia) => {
    const totalProduccionX = periodo.produccionX + (periodo.rechazosX || 0)
    const totalProduccionY = periodo.produccionY + (periodo.rechazosY || 0)
    const totalProduccionZ = periodo.produccionZ + (periodo.rechazosZ || 0)

    const costosEstandarTotal =
      totalProduccionX * costosEstandar.X + totalProduccionY * costosEstandar.Y + totalProduccionZ * costosEstandar.Z

    if (periodo.costoTotal === 0 || costosEstandarTotal === 0) return 0
    return (costosEstandarTotal / periodo.costoTotal) * 100
  }

  const calcularVarianzaPorUnidad = (periodo: PeriodoEficiencia) => {
    const totalUnidades =
      periodo.produccionX +
      periodo.produccionY +
      periodo.produccionZ +
      (periodo.rechazosX || 0) +
      (periodo.rechazosY || 0) +
      (periodo.rechazosZ || 0)

    if (totalUnidades === 0) return 0

    const totalProduccionX = periodo.produccionX + (periodo.rechazosX || 0)
    const totalProduccionY = periodo.produccionY + (periodo.rechazosY || 0)
    const totalProduccionZ = periodo.produccionZ + (periodo.rechazosZ || 0)

    const costosEstandarTotal =
      totalProduccionX * costosEstandar.X + totalProduccionY * costosEstandar.Y + totalProduccionZ * costosEstandar.Z

    const costoEstandarUnitario = costosEstandarTotal / totalUnidades
    const costoRealUnitario = periodo.costoTotal / totalUnidades

    return costoEstandarUnitario - costoRealUnitario
  }

  const calcularCumplimientoDemanda = (periodo: PeriodoEficiencia) => {
    const totalDemanda = periodo.demandaX + periodo.demandaY + periodo.demandaZ
    const totalProduccionBuena = periodo.produccionX + periodo.produccionY + periodo.produccionZ

    if (totalDemanda === 0) return 100
    return Math.min(100, (totalProduccionBuena / totalDemanda) * 100)
  }

  // Función predictiva nueva
  const generarPrediccionProximoPeriodo = () => {
    if (periodos.length === 0) return null

    const ultimoPeriodo = periodos[periodos.length - 1]
    const eficienciaActual = calcularEficienciaVsEstandar(ultimoPeriodo)
    const cumplimientoActual = calcularCumplimientoDemanda(ultimoPeriodo)

    // Análisis de tendencias
    let tendenciaEficiencia = "estable"
    let tendenciaCumplimiento = "estable"

    if (periodos.length >= 2) {
      const penultimoPeriodo = periodos[periodos.length - 2]
      const eficienciaAnterior = calcularEficienciaVsEstandar(penultimoPeriodo)
      const cumplimientoAnterior = calcularCumplimientoDemanda(penultimoPeriodo)

      tendenciaEficiencia =
        eficienciaActual > eficienciaAnterior
          ? "mejorando"
          : eficienciaActual < eficienciaAnterior
            ? "empeorando"
            : "estable"
      tendenciaCumplimiento =
        cumplimientoActual > cumplimientoAnterior
          ? "mejorando"
          : cumplimientoActual < cumplimientoAnterior
            ? "empeorando"
            : "estable"
    }

    // Predicciones para próximo período
    const proximoPeriodo = ultimoPeriodo.periodo + 1

    // Demanda pronosticada (ciclos de 3)
    const demandaPronostico = {
      3: { X: 1465, Y: 1095, Z: 1740 },
      6: { X: 1850, Y: 800, Z: 1260 },
      9: { X: 1500, Y: 1640, Z: 2220 },
    }

    const proximoCiclo = Math.ceil(proximoPeriodo / 3) * 3
    const demandaProxima = demandaPronostico[proximoCiclo as keyof typeof demandaPronostico]

    return {
      periodo: proximoPeriodo,
      eficienciaActual,
      cumplimientoActual,
      tendenciaEficiencia,
      tendenciaCumplimiento,
      demandaProxima,
      proximoCiclo,
      recomendaciones: generarRecomendacionesEstrategicas(
        eficienciaActual,
        cumplimientoActual,
        tendenciaEficiencia,
        demandaProxima,
      ),
    }
  }

  const generarRecomendacionesEstrategicas = (
    eficiencia: number,
    cumplimiento: number,
    tendencia: string,
    demanda: any,
  ) => {
    const recomendaciones = []

    // Recomendaciones basadas en eficiencia
    if (eficiencia < 90) {
      recomendaciones.push({
        tipo: "critico",
        categoria: "Eficiencia",
        mensaje: "Eficiencia muy baja. Revisar costos y procesos inmediatamente.",
        acciones: [
          "Reducir sobretiempo innecesario",
          "Mejorar eficiencia de operarios con entrenamiento",
          "Optimizar asignación de productos a máquinas",
          "Revisar inversiones en mantenimiento",
        ],
      })
    } else if (eficiencia < 100) {
      recomendaciones.push({
        tipo: "advertencia",
        categoria: "Eficiencia",
        mensaje: "Eficiencia por debajo del estándar. Hay oportunidades de mejora.",
        acciones: [
          "Analizar costos de mano de obra",
          "Optimizar uso de materia prima",
          "Considerar entrenamiento adicional",
        ],
      })
    }

    // Recomendaciones basadas en cumplimiento
    if (cumplimiento < 95) {
      recomendaciones.push({
        tipo: "critico",
        categoria: "Cumplimiento",
        mensaje: "Riesgo de no cumplir demanda. Acción inmediata requerida.",
        acciones: [
          "Programar sobretiempo para productos críticos",
          "Priorizar producción de productos con mayor déficit",
          "Considerar órdenes express de materia prima",
        ],
      })
    }

    // Recomendaciones específicas para próxima demanda
    if (demanda) {
      const totalDemanda = demanda.X + demanda.Y + demanda.Z
      recomendaciones.push({
        tipo: "estrategico",
        categoria: "Planificación",
        mensaje: `Preparación para demanda del período ${Math.ceil((periodos.length + 1) / 3) * 3}: ${totalDemanda} unidades totales`,
        acciones: [
          `Priorizar producto Z (${demanda.Z} unidades - mayor demanda)`,
          `Asegurar materia prima: ${demanda.X + demanda.Y * 2 + demanda.Z * 3} unidades`,
          "Planificar con 2-3 días de anticipación",
          "Mantener inventario de seguridad del 10-15%",
        ],
      })
    }

    return recomendaciones
  }

  const prediccion = generarPrediccionProximoPeriodo()

  const datosGrafico = periodos.map((periodo) => ({
    periodo: periodo.periodo,
    eficiencia: calcularEficienciaVsEstandar(periodo),
    cumplimiento: calcularCumplimientoDemanda(periodo),
    varianza: calcularVarianzaPorUnidad(periodo),
    costoUnitarioReal: periodo.costoTotal / (periodo.produccionX + periodo.produccionY + periodo.produccionZ || 1),
  }))

  const eficienciaPromedio =
    datosGrafico.length > 0 ? datosGrafico.reduce((sum, p) => sum + p.eficiencia, 0) / datosGrafico.length : 0

  const cumplimientoPromedio =
    datosGrafico.length > 0 ? datosGrafico.reduce((sum, p) => sum + p.cumplimiento, 0) / datosGrafico.length : 0

  const varianzaPromedio =
    datosGrafico.length > 0 ? datosGrafico.reduce((sum, p) => sum + p.varianza, 0) / datosGrafico.length : 0

  const getEficienciaColor = (eficiencia: number) => {
    if (eficiencia >= 100) return "text-green-600"
    if (eficiencia >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const getEficienciaBadge = (eficiencia: number) => {
    if (eficiencia >= 100) return <Badge className="bg-green-500">Eficiente</Badge>
    if (eficiencia >= 80) return <Badge className="bg-yellow-500">Regular</Badge>
    return <Badge className="bg-red-500">Deficiente</Badge>
  }

  const getVarianzaColor = (varianza: number) => {
    if (varianza > 0) return "text-green-600"
    if (varianza < 0) return "text-red-600"
    return "text-gray-600"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Eficiencia vs Estándar SIMPRO - Sistema Predictivo
          </CardTitle>
          <CardDescription>
            Analiza resultados pasados y predice estrategias para próximas decisiones. Última actualización:{" "}
            {new Date(data.ultimaActualizacion).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Alerta sobre fuentes de datos */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800">📊 Fuentes de Datos en SIMPRO</h4>
                <div className="text-sm text-blue-700 mt-2 grid md:grid-cols-2 gap-4">
                  <div>
                    <p>
                      <strong>✅ Producción:</strong> Pestaña "Producción" → Línea 2 → Columna "Producción"
                    </p>
                    <p>
                      <strong>✅ Rechazos:</strong> Pestaña "Producción" → Línea 2 → Columna "Rechazos"
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>✅ Costo Total:</strong> Pestaña "Costos" → "Sub Total" (ej: $2967)
                    </p>
                    <p>
                      <strong>✅ Demanda:</strong> Pronóstico conocido del manual
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Flujo predictivo */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800">🔄 Flujo Predictivo SIMPRO</h4>
                <div className="text-sm text-green-700 mt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">Decisión 0</Badge>
                    <ArrowRight className="w-4 h-4" />
                    <Badge variant="outline">Resultados Período 1</Badge>
                    <ArrowRight className="w-4 h-4" />
                    <Badge variant="outline">Análisis + Predicción</Badge>
                    <ArrowRight className="w-4 h-4" />
                    <Badge variant="outline">Decisión 1</Badge>
                    <ArrowRight className="w-4 h-4" />
                    <Badge variant="outline">...</Badge>
                  </div>
                  <p className="mt-2">
                    Ingresa los resultados de tu última decisión para recibir predicciones y estrategias para la
                    próxima.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Controles de datos */}
          <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
            <Button onClick={guardarDatos} variant="outline" className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Guardar Datos
            </Button>

            <Button onClick={exportarAExcel} variant="outline" className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Exportar Excel
            </Button>

            <Button onClick={descargarPlantilla} variant="outline" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Descargar Plantilla
            </Button>

            <div className="relative">
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.txt"
                onChange={handleImportarExcel}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Importar Excel
              </Button>
            </div>

            <Button onClick={limpiarTodosDatos} variant="destructive" className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Limpiar Todo
            </Button>

            <div className="ml-auto text-sm text-gray-600">
              {periodos.length} período{periodos.length !== 1 ? "s" : ""} guardado{periodos.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Predicción para próximo período */}
          {prediccion && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Predicción y Estrategia - Período {prediccion.periodo}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900">Estado Actual</h4>
                    <p className="text-sm text-blue-700">Eficiencia: {prediccion.eficienciaActual.toFixed(1)}%</p>
                    <p className="text-sm text-blue-700">Cumplimiento: {prediccion.cumplimientoActual.toFixed(1)}%</p>
                    <p className="text-sm text-blue-700">Tendencia: {prediccion.tendenciaEficiencia}</p>
                  </div>

                  {prediccion.demandaProxima && (
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-semibold text-yellow-900">
                        Próxima Demanda (Período {prediccion.proximoCiclo})
                      </h4>
                      <p className="text-sm text-yellow-700">X: {prediccion.demandaProxima.X} unidades</p>
                      <p className="text-sm text-yellow-700">Y: {prediccion.demandaProxima.Y} unidades</p>
                      <p className="text-sm text-yellow-700">Z: {prediccion.demandaProxima.Z} unidades</p>
                    </div>
                  )}

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900">Recomendaciones</h4>
                    <p className="text-sm text-green-700">{prediccion.recomendaciones.length} estrategias generadas</p>
                    <p className="text-sm text-green-700">Basadas en análisis de tendencias</p>
                  </div>
                </div>

                {/* Recomendaciones detalladas */}
                <div className="space-y-3">
                  {prediccion.recomendaciones.map((rec, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        rec.tipo === "critico"
                          ? "bg-red-50 border-red-200"
                          : rec.tipo === "advertencia"
                            ? "bg-yellow-50 border-yellow-200"
                            : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Badge
                          variant={
                            rec.tipo === "critico"
                              ? "destructive"
                              : rec.tipo === "advertencia"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {rec.categoria}
                        </Badge>
                        <div className="flex-1">
                          <h5 className="font-semibold">{rec.mensaje}</h5>
                          <ul className="text-sm mt-2 space-y-1">
                            {rec.acciones.map((accion, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-gray-400 mt-1">•</span>
                                <span>{accion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Métricas principales */}
          {datosGrafico.length > 0 && (
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Eficiencia Promedio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getEficienciaColor(eficienciaPromedio)}`}>
                      {eficienciaPromedio.toFixed(1)}%
                    </span>
                    {getEficienciaBadge(eficienciaPromedio)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Cumplimiento Promedio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-2xl font-bold ${cumplimientoPromedio >= 95 ? "text-green-600" : cumplimientoPromedio >= 85 ? "text-yellow-600" : "text-red-600"}`}
                    >
                      {cumplimientoPromedio.toFixed(1)}%
                    </span>
                    <Badge variant={cumplimientoPromedio >= 95 ? "default" : "destructive"}>
                      {cumplimientoPromedio >= 95 ? "Excelente" : cumplimientoPromedio >= 85 ? "Bueno" : "Mejorar"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Varianza Promedio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getVarianzaColor(varianzaPromedio)}`}>
                      ${varianzaPromedio.toFixed(2)}
                    </span>
                    <Badge variant={varianzaPromedio > 0 ? "default" : "destructive"}>
                      {varianzaPromedio > 0 ? "Favorable" : varianzaPromedio < 0 ? "Desfavorable" : "Neutral"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Último Período</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <span className="text-2xl font-bold">#{datosGrafico[datosGrafico.length - 1]?.periodo || 0}</span>
                    <p className="text-sm text-gray-600">
                      {datosGrafico[datosGrafico.length - 1]?.eficiencia.toFixed(1)}% eficiencia
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Formulario para nuevo período */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-4">Agregar Resultados del Período {nuevoPeriodo.periodo}</h3>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Cómo obtener los datos:</strong> Después de ejecutar tu decisión en SIMPRO, ve a las pestañas
                correspondientes y copia los valores.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label>Período</Label>
                <Input
                  type="number"
                  value={nuevoPeriodo.periodo}
                  onChange={(e) =>
                    setNuevoPeriodo({
                      ...nuevoPeriodo,
                      periodo: Number.parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
              <div>
                <Label>Producción Final X</Label>
                <Input
                  type="number"
                  value={nuevoPeriodo.produccionX}
                  onChange={(e) =>
                    setNuevoPeriodo({
                      ...nuevoPeriodo,
                      produccionX: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Línea 2 - Producto X"
                />
              </div>
              <div>
                <Label>Producción Final Y</Label>
                <Input
                  type="number"
                  value={nuevoPeriodo.produccionY}
                  onChange={(e) =>
                    setNuevoPeriodo({
                      ...nuevoPeriodo,
                      produccionY: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Línea 2 - Producto Y"
                />
              </div>
              <div>
                <Label>Producción Final Z</Label>
                <Input
                  type="number"
                  value={nuevoPeriodo.produccionZ}
                  onChange={(e) =>
                    setNuevoPeriodo({
                      ...nuevoPeriodo,
                      produccionZ: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Línea 2 - Producto Z"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label>Rechazos X (opcional)</Label>
                <Input
                  type="number"
                  value={nuevoPeriodo.rechazosX || 0}
                  onChange={(e) =>
                    setNuevoPeriodo({
                      ...nuevoPeriodo,
                      rechazosX: Number.parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label>Rechazos Y (opcional)</Label>
                <Input
                  type="number"
                  value={nuevoPeriodo.rechazosY || 0}
                  onChange={(e) =>
                    setNuevoPeriodo({
                      ...nuevoPeriodo,
                      rechazosY: Number.parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label>Rechazos Z (opcional)</Label>
                <Input
                  type="number"
                  value={nuevoPeriodo.rechazosZ || 0}
                  onChange={(e) =>
                    setNuevoPeriodo({
                      ...nuevoPeriodo,
                      rechazosZ: Number.parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label>Costo Total ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={nuevoPeriodo.costoTotal}
                  onChange={(e) =>
                    setNuevoPeriodo({
                      ...nuevoPeriodo,
                      costoTotal: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="Pestaña Costos - Sub Total"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label>Demanda X</Label>
                <Input
                  type="number"
                  value={nuevoPeriodo.demandaX}
                  onChange={(e) =>
                    setNuevoPeriodo({
                      ...nuevoPeriodo,
                      demandaX: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Pronóstico conocido"
                />
              </div>
              <div>
                <Label>Demanda Y</Label>
                <Input
                  type="number"
                  value={nuevoPeriodo.demandaY}
                  onChange={(e) =>
                    setNuevoPeriodo({
                      ...nuevoPeriodo,
                      demandaY: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Pronóstico conocido"
                />
              </div>
              <div>
                <Label>Demanda Z</Label>
                <Input
                  type="number"
                  value={nuevoPeriodo.demandaZ}
                  onChange={(e) =>
                    setNuevoPeriodo({
                      ...nuevoPeriodo,
                      demandaZ: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Pronóstico conocido"
                />
              </div>
            </div>

            <Button onClick={agregarPeriodo} className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Agregar Período y Generar Predicción
            </Button>
          </div>

          {/* Información de costos estándar */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Costos Estándar SIMPRO (Manual Oficial)</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <span className="font-medium">Producto X</span>
                <p className="text-blue-700">${costosEstandar.X.toFixed(2)} por unidad</p>
              </div>
              <div className="text-center">
                <span className="font-medium">Producto Y</span>
                <p className="text-blue-700">${costosEstandar.Y.toFixed(2)} por unidad</p>
              </div>
              <div className="text-center">
                <span className="font-medium">Producto Z</span>
                <p className="text-blue-700">${costosEstandar.Z.toFixed(2)} por unidad</p>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">* Fórmula: (Costos Estándar / Costo Total) × 100</p>
          </div>

          {/* Gráfico de eficiencia */}
          {datosGrafico.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Evolución de Eficiencia vs Estándar</CardTitle>
                <CardDescription>Análisis de tendencias para predicción estratégica</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={datosGrafico}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodo" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any, name: string) => [
                          `${value.toFixed(2)}${name === "eficiencia" ? "%" : name === "cumplimiento" ? "%" : name === "varianza" ? "" : ""}`,
                          name === "eficiencia"
                            ? "Eficiencia vs Estándar"
                            : name === "cumplimiento"
                              ? "Cumplimiento Demanda"
                              : name === "varianza"
                                ? "Varianza por Unidad ($)"
                                : "Costo Unitario Real",
                        ]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="eficiencia"
                        stroke="#2563eb"
                        strokeWidth={3}
                        name="Eficiencia vs Estándar (%)"
                      />
                      <Line
                        type="monotone"
                        dataKey="cumplimiento"
                        stroke="#16a34a"
                        strokeWidth={2}
                        name="Cumplimiento Demanda (%)"
                      />
                      <Line
                        type="monotone"
                        dataKey="varianza"
                        stroke="#dc2626"
                        strokeWidth={2}
                        name="Varianza por Unidad ($)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabla de resultados detallada */}
          {periodos.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-left">Período</th>
                    <th className="border border-gray-300 p-2 text-center">Prod. Final Total</th>
                    <th className="border border-gray-300 p-2 text-center">Rechazos</th>
                    <th className="border border-gray-300 p-2 text-center">Costos Estándar</th>
                    <th className="border border-gray-300 p-2 text-center">Costo Total</th>
                    <th className="border border-gray-300 p-2 text-center">Eficiencia vs Estándar</th>
                    <th className="border border-gray-300 p-2 text-center">Varianza/Unidad</th>
                    <th className="border border-gray-300 p-2 text-center">Cumplimiento</th>
                    <th className="border border-gray-300 p-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {periodos.map((periodo, index) => {
                    const totalProduccionX = periodo.produccionX + (periodo.rechazosX || 0)
                    const totalProduccionY = periodo.produccionY + (periodo.rechazosY || 0)
                    const totalProduccionZ = periodo.produccionZ + (periodo.rechazosZ || 0)

                    const costosEstandarTotal =
                      totalProduccionX * costosEstandar.X +
                      totalProduccionY * costosEstandar.Y +
                      totalProduccionZ * costosEstandar.Z

                    const eficiencia = calcularEficienciaVsEstandar(periodo)
                    const varianza = calcularVarianzaPorUnidad(periodo)
                    const cumplimiento = calcularCumplimientoDemanda(periodo)
                    const totalProduccion = periodo.produccionX + periodo.produccionY + periodo.produccionZ
                    const totalRechazos = (periodo.rechazosX || 0) + (periodo.rechazosY || 0) + (periodo.rechazosZ || 0)

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2 font-medium">{periodo.periodo}</td>
                        <td className="border border-gray-300 p-2 text-center">{totalProduccion}</td>
                        <td className="border border-gray-300 p-2 text-center">{totalRechazos}</td>
                        <td className="border border-gray-300 p-2 text-center">${costosEstandarTotal.toFixed(2)}</td>
                        <td className="border border-gray-300 p-2 text-center">${periodo.costoTotal.toFixed(2)}</td>
                        <td className="border border-gray-300 p-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className={getEficienciaColor(eficiencia)}>{eficiencia.toFixed(1)}%</span>
                            {getEficienciaBadge(eficiencia)}
                          </div>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <span className={getVarianzaColor(varianza)}>${varianza.toFixed(2)}</span>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <span
                            className={
                              cumplimiento >= 95
                                ? "text-green-600"
                                : cumplimiento >= 85
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }
                          >
                            {cumplimiento.toFixed(1)}%
                          </span>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => eliminarPeriodo(index)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
