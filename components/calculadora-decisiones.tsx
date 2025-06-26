"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calculator, TrendingUp, Target, AlertTriangle, DollarSign, Factory } from "lucide-react"

interface DecisionData {
  periodo: number
  controlCalidad: number
  mantenimiento: number
  ordenNormal: number
  ordenExpress: number
  linea1: {
    maquina1: { producto: number; operario: number; horas: number; entrenamiento: boolean }
    maquina2: { producto: number; operario: number; horas: number; entrenamiento: boolean }
    maquina3: { producto: number; operario: number; horas: number; entrenamiento: boolean }
    maquina4: { producto: number; operario: number; horas: number; entrenamiento: boolean }
  }
  linea2: {
    maquina1: { producto: number; operario: number; horas: number; entrenamiento: boolean }
    maquina2: { producto: number; operario: number; horas: number; entrenamiento: boolean }
    maquina3: { producto: number; operario: number; horas: number; entrenamiento: boolean }
    maquina4: { producto: number; operario: number; horas: number; entrenamiento: boolean }
  }
}

interface ResultadosDetallados {
  // Producción
  produccionLinea1: { X: number; Y: number; Z: number }
  produccionLinea2: { X: number; Y: number; Z: number }
  rechazosEstimados: { X: number; Y: number; Z: number }

  // Costos detallados (como en la imagen)
  costos: {
    manoObra: { X: number; Y: number; Z: number; total: number }
    preparacionAjuste: { X: number; Y: number; Z: number; total: number }
    reparacionMaquinas: { X: number; Y: number; Z: number; total: number }
    materiaPrima: { X: number; Y: number; Z: number; total: number }
    usoEquipo: { X: number; Y: number; Z: number; total: number }
    almacenajeProcesoIntermedio: { X: number; Y: number; Z: number; total: number }
    almacenajeProductoTerminado: { X: number; Y: number; Z: number; total: number }
    multaDemanda: { X: number; Y: number; Z: number; total: number }
    subTotal: number
  }

  // Análisis de eficiencia
  eficiencia: {
    costosEstandar: { X: number; Y: number; Z: number; total: number }
    eficienciaVsEstandar: number
    costoUnitarioEstandar: number
    costoUnitarioReal: number
    varianza: number
  }

  // Cobertura de demanda
  demanda: {
    pronosticada: { X: number; Y: number; Z: number; total: number }
    cobertura: { X: number; Y: number; Z: number; promedio: number }
    deficit: { X: number; Y: number; Z: number; total: number }
    exceso: { X: number; Y: number; Z: number; total: number }
  }

  // Recursos utilizados
  recursos: {
    operariosUsados: number
    horasTotales: number
    horasNormales: number
    horasSobretiempo: number
    materiaPrimaRequerida: number
    eficienciaOperarios: number
  }
}

export default function CalculadoraDecisiones() {
  const [decision, setDecision] = useState<DecisionData>({
    periodo: 2,
    controlCalidad: 0,
    mantenimiento: 0,
    ordenNormal: 0,
    ordenExpress: 0,
    linea1: {
      maquina1: { producto: 0, operario: 0, horas: 0, entrenamiento: false },
      maquina2: { producto: 0, operario: 0, horas: 0, entrenamiento: false },
      maquina3: { producto: 0, operario: 0, horas: 0, entrenamiento: false },
      maquina4: { producto: 0, operario: 0, horas: 0, entrenamiento: false },
    },
    linea2: {
      maquina1: { producto: 0, operario: 0, horas: 0, entrenamiento: false },
      maquina2: { producto: 0, operario: 0, horas: 0, entrenamiento: false },
      maquina3: { producto: 0, operario: 0, horas: 0, entrenamiento: false },
      maquina4: { producto: 0, operario: 0, horas: 0, entrenamiento: false },
    },
  })

  const [resultados, setResultados] = useState<ResultadosDetallados | null>(null)

  // Datos de referencia
  const costosEstandar = { X: 2.5, Y: 3.5, Z: 4.5 }
  const tasasProduccion = { 1: 50, 2: 40, 3: 30 } // X, Y, Z unidades/hora
  const tiemposPreparacion = { 1: 1, 2: 2, 3: 3 } // X, Y, Z horas
  const materiaPrimaPorUnidad = { 1: 1, 2: 2, 3: 3 } // X', Y', Z'
  const costoMateriaPrima = 1.1 // por unidad

  // Demanda pronosticada por período
  const demandaPronostico = {
    3: { X: 1465, Y: 1095, Z: 1740 },
    6: { X: 1850, Y: 800, Z: 1260 },
    9: { X: 1500, Y: 1640, Z: 2220 },
  }

  const calcularResultadosDetallados = (): ResultadosDetallados => {
    // Inicializar resultados
    const resultados: ResultadosDetallados = {
      produccionLinea1: { X: 0, Y: 0, Z: 0 },
      produccionLinea2: { X: 0, Y: 0, Z: 0 },
      rechazosEstimados: { X: 0, Y: 0, Z: 0 },
      costos: {
        manoObra: { X: 0, Y: 0, Z: 0, total: 0 },
        preparacionAjuste: { X: 0, Y: 0, Z: 0, total: 0 },
        reparacionMaquinas: { X: 0, Y: 0, Z: 0, total: 0 },
        materiaPrima: { X: 0, Y: 0, Z: 0, total: 0 },
        usoEquipo: { X: 0, Y: 0, Z: 0, total: 0 },
        almacenajeProcesoIntermedio: { X: 0, Y: 0, Z: 0, total: 0 },
        almacenajeProductoTerminado: { X: 0, Y: 0, Z: 0, total: 0 },
        multaDemanda: { X: 0, Y: 0, Z: 0, total: 0 },
        subTotal: 0,
      },
      eficiencia: {
        costosEstandar: { X: 0, Y: 0, Z: 0, total: 0 },
        eficienciaVsEstandar: 0,
        costoUnitarioEstandar: 0,
        costoUnitarioReal: 0,
        varianza: 0,
      },
      demanda: {
        pronosticada: { X: 0, Y: 0, Z: 0, total: 0 },
        cobertura: { X: 0, Y: 0, Z: 0, promedio: 0 },
        deficit: { X: 0, Y: 0, Z: 0, total: 0 },
        exceso: { X: 0, Y: 0, Z: 0, total: 0 },
      },
      recursos: {
        operariosUsados: 0,
        horasTotales: 0,
        horasNormales: 0,
        horasSobretiempo: 0,
        materiaPrimaRequerida: 0,
        eficienciaOperarios: 100, // Asumimos 100% por defecto
      },
    }

    const operariosUsados = new Set<number>()
    let horasTotalesAcumuladas = 0
    let horasNormalesAcumuladas = 0
    let horasSobretiempoAcumuladas = 0

    // Calcular producción y costos por línea
    const calcularLinea = (linea: any, esLinea1: boolean) => {
      Object.entries(linea).forEach(([maquina, config]: [string, any]) => {
        if (config.operario > 0 && config.horas > 0 && config.producto > 0) {
          operariosUsados.add(config.operario)
          horasTotalesAcumuladas += config.horas

          // Calcular horas normales y sobretiempo
          const horasNormales = Math.min(config.horas, 8)
          const horasSobretiempo = Math.max(0, config.horas - 8)
          horasNormalesAcumuladas += horasNormales
          horasSobretiempoAcumuladas += horasSobretiempo

          // Calcular producción (con eficiencia estimada)
          const eficienciaOperario = resultados.recursos.eficienciaOperarios / 100
          const tasa = tasasProduccion[config.producto as keyof typeof tasasProduccion] || 0
          const unidadesProducidas = Math.floor(config.horas * tasa * eficienciaOperario)

          // Estimar rechazos (2-5% según calidad)
          const factorCalidad = Math.max(0.02, 0.05 - decision.controlCalidad / 10000)
          const rechazos = Math.floor(unidadesProducidas * factorCalidad)
          const produccionBuena = unidadesProducidas - rechazos

          // Asignar producción por producto
          const productos = ["", "X", "Y", "Z"]
          const producto = productos[config.producto]

          if (esLinea1) {
            resultados.produccionLinea1[producto as keyof typeof resultados.produccionLinea1] += produccionBuena
          } else {
            resultados.produccionLinea2[producto as keyof typeof resultados.produccionLinea2] += produccionBuena
            resultados.rechazosEstimados[producto as keyof typeof resultados.rechazosEstimados] += rechazos
          }

          // Calcular costos detallados por producto
          const productoKey = producto as keyof typeof resultados.costos.manoObra

          // 1. Mano de obra
          const costoManoObra = Math.max(horasNormales * 2, 8) + horasSobretiempo * 3 // Mínimo 4h = $8
          resultados.costos.manoObra[productoKey] += costoManoObra

          // 2. Preparación y ajuste (por cambio de producto)
          const tiempoPrep = tiemposPreparacion[config.producto as keyof typeof tiemposPreparacion] || 0
          const costoPreparacion = tiempoPrep * 10 // $10 por hora de preparación
          resultados.costos.preparacionAjuste[productoKey] += costoPreparacion

          // 3. Uso de equipo
          const costoUsoEquipo = config.horas * 10 // $10 por hora de uso
          resultados.costos.usoEquipo[productoKey] += costoUsoEquipo

          // 4. Entrenamiento (si aplica)
          if (config.entrenamiento) {
            resultados.costos.manoObra[productoKey] += 20
          }
        }
      })
    }

    // Procesar ambas líneas
    calcularLinea(decision.linea1, true)
    calcularLinea(decision.linea2, false)

    // Calcular materia prima requerida
    const materiaPrimaX = resultados.produccionLinea1.X * materiaPrimaPorUnidad[1]
    const materiaPrimaY = resultados.produccionLinea1.Y * materiaPrimaPorUnidad[2]
    const materiaPrimaZ = resultados.produccionLinea1.Z * materiaPrimaPorUnidad[3]

    resultados.recursos.materiaPrimaRequerida = materiaPrimaX + materiaPrimaY + materiaPrimaZ

    // Costos de materia prima
    resultados.costos.materiaPrima.X = materiaPrimaX * costoMateriaPrima
    resultados.costos.materiaPrima.Y = materiaPrimaY * costoMateriaPrima
    resultados.costos.materiaPrima.Z = materiaPrimaZ * costoMateriaPrima

    // Costos de órdenes
    if (decision.ordenNormal > 0) {
      resultados.costos.materiaPrima.total += 100
    }
    if (decision.ordenExpress > 0) {
      resultados.costos.materiaPrima.total += 175
    }

    // Reparación de máquinas (basado en mantenimiento)
    const factorMantenimiento = Math.max(0.1, 0.3 - decision.mantenimiento / 10000)
    const costoReparacion = horasTotalesAcumuladas * 5 * factorMantenimiento
    resultados.costos.reparacionMaquinas.total = costoReparacion

    // Almacenaje (estimado)
    const totalProduccionIntermedia =
      resultados.produccionLinea1.X + resultados.produccionLinea1.Y + resultados.produccionLinea1.Z
    const totalProduccionFinal =
      resultados.produccionLinea2.X + resultados.produccionLinea2.Y + resultados.produccionLinea2.Z

    resultados.costos.almacenajeProcesoIntermedio.total = totalProduccionIntermedia * 0.02
    resultados.costos.almacenajeProductoTerminado.total = totalProduccionFinal * 0.03

    // Inversiones
    resultados.costos.reparacionMaquinas.total += decision.mantenimiento
    // Control de calidad se refleja en menor tasa de rechazos

    // Calcular totales de costos
    Object.keys(resultados.costos.manoObra).forEach((producto) => {
      if (producto !== "total") {
        const prod = producto as keyof typeof resultados.costos.manoObra
        resultados.costos.manoObra.total += resultados.costos.manoObra[prod]
        resultados.costos.preparacionAjuste.total += resultados.costos.preparacionAjuste[prod]
        resultados.costos.materiaPrima.total += resultados.costos.materiaPrima[prod]
        resultados.costos.usoEquipo.total += resultados.costos.usoEquipo[prod]
      }
    })

    // Sub total
    resultados.costos.subTotal =
      resultados.costos.manoObra.total +
      resultados.costos.preparacionAjuste.total +
      resultados.costos.reparacionMaquinas.total +
      resultados.costos.materiaPrima.total +
      resultados.costos.usoEquipo.total +
      resultados.costos.almacenajeProcesoIntermedio.total +
      resultados.costos.almacenajeProductoTerminado.total +
      resultados.costos.multaDemanda.total

    // Calcular eficiencia vs estándar
    const totalProduccionConRechazos = {
      X: resultados.produccionLinea2.X + resultados.rechazosEstimados.X,
      Y: resultados.produccionLinea2.Y + resultados.rechazosEstimados.Y,
      Z: resultados.produccionLinea2.Z + resultados.rechazosEstimados.Z,
    }

    resultados.eficiencia.costosEstandar.X = totalProduccionConRechazos.X * costosEstandar.X
    resultados.eficiencia.costosEstandar.Y = totalProduccionConRechazos.Y * costosEstandar.Y
    resultados.eficiencia.costosEstandar.Z = totalProduccionConRechazos.Z * costosEstandar.Z
    resultados.eficiencia.costosEstandar.total =
      resultados.eficiencia.costosEstandar.X +
      resultados.eficiencia.costosEstandar.Y +
      resultados.eficiencia.costosEstandar.Z

    if (resultados.costos.subTotal > 0) {
      resultados.eficiencia.eficienciaVsEstandar =
        (resultados.eficiencia.costosEstandar.total / resultados.costos.subTotal) * 100
    }

    const totalUnidades = totalProduccionConRechazos.X + totalProduccionConRechazos.Y + totalProduccionConRechazos.Z
    if (totalUnidades > 0) {
      resultados.eficiencia.costoUnitarioEstandar = resultados.eficiencia.costosEstandar.total / totalUnidades
      resultados.eficiencia.costoUnitarioReal = resultados.costos.subTotal / totalUnidades
      resultados.eficiencia.varianza =
        resultados.eficiencia.costoUnitarioEstandar - resultados.eficiencia.costoUnitarioReal
    }

    // Calcular cobertura de demanda
    const proximoCiclo = Math.ceil(decision.periodo / 3) * 3
    const demandaProxima = demandaPronostico[proximoCiclo as keyof typeof demandaPronostico]

    if (demandaProxima) {
      resultados.demanda.pronosticada = {
        ...demandaProxima,
        total: demandaProxima.X + demandaProxima.Y + demandaProxima.Z,
      }

      // Calcular cobertura (producción buena vs demanda)
      resultados.demanda.cobertura.X =
        demandaProxima.X > 0 ? Math.min(100, (resultados.produccionLinea2.X / demandaProxima.X) * 100) : 100
      resultados.demanda.cobertura.Y =
        demandaProxima.Y > 0 ? Math.min(100, (resultados.produccionLinea2.Y / demandaProxima.Y) * 100) : 100
      resultados.demanda.cobertura.Z =
        demandaProxima.Z > 0 ? Math.min(100, (resultados.produccionLinea2.Z / demandaProxima.Z) * 100) : 100
      resultados.demanda.cobertura.promedio =
        (resultados.demanda.cobertura.X + resultados.demanda.cobertura.Y + resultados.demanda.cobertura.Z) / 3

      // Calcular déficit y exceso
      resultados.demanda.deficit.X = Math.max(0, demandaProxima.X - resultados.produccionLinea2.X)
      resultados.demanda.deficit.Y = Math.max(0, demandaProxima.Y - resultados.produccionLinea2.Y)
      resultados.demanda.deficit.Z = Math.max(0, demandaProxima.Z - resultados.produccionLinea2.Z)
      resultados.demanda.deficit.total =
        resultados.demanda.deficit.X + resultados.demanda.deficit.Y + resultados.demanda.deficit.Z

      resultados.demanda.exceso.X = Math.max(0, resultados.produccionLinea2.X - demandaProxima.X)
      resultados.demanda.exceso.Y = Math.max(0, resultados.produccionLinea2.Y - demandaProxima.Y)
      resultados.demanda.exceso.Z = Math.max(0, resultados.produccionLinea2.Z - demandaProxima.Z)
      resultados.demanda.exceso.total =
        resultados.demanda.exceso.X + resultados.demanda.exceso.Y + resultados.demanda.exceso.Z

      // Multas por no cumplir demanda (estimadas)
      if (resultados.demanda.deficit.total > 0) {
        const multaEstimada = resultados.demanda.deficit.total * 0.5 // $0.50 por unidad no entregada
        resultados.costos.multaDemanda.total = multaEstimada
        resultados.costos.subTotal += multaEstimada
      }
    }

    // Actualizar recursos
    resultados.recursos.operariosUsados = operariosUsados.size
    resultados.recursos.horasTotales = horasTotalesAcumuladas
    resultados.recursos.horasNormales = horasNormalesAcumuladas
    resultados.recursos.horasSobretiempo = horasSobretiempoAcumuladas

    return resultados
  }

  const calcularResultados = () => {
    const resultadosDetallados = calcularResultadosDetallados()
    setResultados(resultadosDetallados)
  }

  const MaquinaConfig = ({ linea, maquina, esLinea1 }: { linea: string; maquina: string; esLinea1: boolean }) => {
    const config = decision[linea as keyof DecisionData][maquina as keyof any]

    return (
      <div className="p-4 border rounded-lg space-y-3">
        <h4 className="font-semibold">{maquina.charAt(0).toUpperCase() + maquina.slice(1)}</h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Producto</Label>
            <Select
              value={config.producto.toString()}
              onValueChange={(value) => {
                const newDecision = { ...decision }
                newDecision[linea as keyof DecisionData][maquina as keyof any].producto = Number.parseInt(value)
                setDecision(newDecision)
              }}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sin asignar</SelectItem>
                <SelectItem value="1">{esLinea1 ? "X'" : "X"}</SelectItem>
                <SelectItem value="2">{esLinea1 ? "Y'" : "Y"}</SelectItem>
                <SelectItem value="3">{esLinea1 ? "Z'" : "Z"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Operario</Label>
            <Input
              type="number"
              min="0"
              max="28"
              value={config.operario}
              onChange={(e) => {
                const newDecision = { ...decision }
                newDecision[linea as keyof DecisionData][maquina as keyof any].operario =
                  Number.parseInt(e.target.value) || 0
                setDecision(newDecision)
              }}
              className="h-8"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Horas</Label>
            <Input
              type="number"
              min="0"
              max="12"
              value={config.horas}
              onChange={(e) => {
                const newDecision = { ...decision }
                newDecision[linea as keyof DecisionData][maquina as keyof any].horas =
                  Number.parseInt(e.target.value) || 0
                setDecision(newDecision)
              }}
              className="h-8"
            />
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <input
              type="checkbox"
              id={`${linea}-${maquina}-entrenamiento`}
              checked={config.entrenamiento}
              onChange={(e) => {
                const newDecision = { ...decision }
                newDecision[linea as keyof DecisionData][maquina as keyof any].entrenamiento = e.target.checked
                setDecision(newDecision)
              }}
            />
            <Label htmlFor={`${linea}-${maquina}-entrenamiento`} className="text-xs">
              Entrenamiento
            </Label>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Calculadora de Decisiones SIMPRO - Resultados Completos
          </CardTitle>
          <CardDescription>
            Simula tu decisión y obtén resultados detallados como los que aparecen en SIMPRO
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información General */}
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label>Período</Label>
              <Input
                type="number"
                value={decision.periodo}
                onChange={(e) => setDecision({ ...decision, periodo: Number.parseInt(e.target.value) || 2 })}
              />
            </div>
            <div>
              <Label>Control de Calidad ($)</Label>
              <Input
                type="number"
                min="0"
                max="9999"
                value={decision.controlCalidad}
                onChange={(e) => setDecision({ ...decision, controlCalidad: Number.parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Mantenimiento ($)</Label>
              <Input
                type="number"
                min="0"
                max="9999"
                value={decision.mantenimiento}
                onChange={(e) => setDecision({ ...decision, mantenimiento: Number.parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Órdenes de Materia Prima */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Orden Normal (unidades)</Label>
              <Input
                type="number"
                min="0"
                value={decision.ordenNormal}
                onChange={(e) => setDecision({ ...decision, ordenNormal: Number.parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-gray-500 mt-1">Llega en 3 días - Costo: $100</p>
            </div>
            <div>
              <Label>Orden Express (unidades)</Label>
              <Input
                type="number"
                min="0"
                value={decision.ordenExpress}
                onChange={(e) => setDecision({ ...decision, ordenExpress: Number.parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-gray-500 mt-1">Llega en 1 día - Costo: $175</p>
            </div>
          </div>

          <Separator />

          {/* Línea 1 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Línea 1 - Producción Intermedia</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MaquinaConfig linea="linea1" maquina="maquina1" esLinea1={true} />
              <MaquinaConfig linea="linea1" maquina="maquina2" esLinea1={true} />
              <MaquinaConfig linea="linea1" maquina="maquina3" esLinea1={true} />
              <MaquinaConfig linea="linea1" maquina="maquina4" esLinea1={true} />
            </div>
          </div>

          <Separator />

          {/* Línea 2 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Línea 2 - Producto Final</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MaquinaConfig linea="linea2" maquina="maquina1" esLinea1={false} />
              <MaquinaConfig linea="linea2" maquina="maquina2" esLinea1={false} />
              <MaquinaConfig linea="linea2" maquina="maquina3" esLinea1={false} />
              <MaquinaConfig linea="linea2" maquina="maquina4" esLinea1={false} />
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={calcularResultados} className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Calcular Resultados Completos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados Detallados */}
      {resultados && (
        <div className="space-y-6">
          {/* Resumen Ejecutivo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Resumen Ejecutivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Costo Total Estimado</h4>
                  <p className="text-2xl font-bold text-blue-700">${resultados.costos.subTotal.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900">Eficiencia vs Estándar</h4>
                  <p
                    className={`text-2xl font-bold ${resultados.eficiencia.eficienciaVsEstandar >= 100 ? "text-green-700" : "text-red-700"}`}
                  >
                    {resultados.eficiencia.eficienciaVsEstandar.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-900">Cobertura Demanda</h4>
                  <p
                    className={`text-2xl font-bold ${resultados.demanda.cobertura.promedio >= 95 ? "text-green-700" : "text-red-700"}`}
                  >
                    {resultados.demanda.cobertura.promedio.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900">Operarios Usados</h4>
                  <p className="text-2xl font-bold text-purple-700">{resultados.recursos.operariosUsados}</p>
                  <p className="text-sm text-purple-600">{resultados.recursos.horasTotales}h totales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Producción Detallada */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="w-5 h-5" />
                Datos de Producción (Como en SIMPRO)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Línea 1 - Productos Intermedios</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>X' (Xsara):</span>
                      <Badge variant="outline">{resultados.produccionLinea1.X} unidades</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Y' (Yaris):</span>
                      <Badge variant="outline">{resultados.produccionLinea1.Y} unidades</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Z' (Zafira):</span>
                      <Badge variant="outline">{resultados.produccionLinea1.Z} unidades</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Línea 2 - Productos Finales</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>X (Xsara):</span>
                      <Badge variant="outline">{resultados.produccionLinea2.X} unidades</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Y (Yaris):</span>
                      <Badge variant="outline">{resultados.produccionLinea2.Y} unidades</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Z (Zafira):</span>
                      <Badge variant="outline">{resultados.produccionLinea2.Z} unidades</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div>
                <h4 className="font-semibold mb-3">Rechazos Estimados</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex justify-between">
                    <span>Rechazos X:</span>
                    <Badge variant="destructive">{resultados.rechazosEstimados.X} unidades</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Rechazos Y:</span>
                    <Badge variant="destructive">{resultados.rechazosEstimados.Y} unidades</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Rechazos Z:</span>
                    <Badge variant="destructive">{resultados.rechazosEstimados.Z} unidades</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Costos Detallados (Como en la imagen) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Costos del Período (Como en SIMPRO)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2 text-left">Concepto</th>
                      <th className="border border-gray-300 p-2 text-center">X</th>
                      <th className="border border-gray-300 p-2 text-center">Y</th>
                      <th className="border border-gray-300 p-2 text-center">Z</th>
                      <th className="border border-gray-300 p-2 text-center">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2 font-medium">Mano de Obra</td>
                      <td className="border border-gray-300 p-2 text-center">
                        {resultados.costos.manoObra.X.toFixed(0)}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {resultados.costos.manoObra.Y.toFixed(0)}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {resultados.costos.manoObra.Z.toFixed(0)}
                      </td>
                      <td className="border border-gray-300 p-2 text-center font-semibold">
                        {resultados.costos.manoObra.total.toFixed(0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 font-medium">Preparación Ajuste de Máquina</td>
                      <td className="border border-gray-300 p-2 text-center">
                        {resultados.costos.preparacionAjuste.X.toFixed(0)}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {resultados.costos.preparacionAjuste.Y.toFixed(0)}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {resultados.costos.preparacionAjuste.Z.toFixed(0)}
                      </td>
                      <td className="border border-gray-300 p-2 text-center font-semibold">
                        {resultados.costos.preparacionAjuste.total.toFixed(0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 font-medium">Reparación de Máquinas</td>
                      <td className="border border-gray-300 p-2 text-center">-</td>
                      <td className="border border-gray-300 p-2 text-center">-</td>
                      <td className="border border-gray-300 p-2 text-center">-</td>
                      <td className="border border-gray-300 p-2 text-center font-semibold">
                        {resultados.costos.reparacionMaquinas.total.toFixed(0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 font-medium">Materia Prima</td>
                      <td className="border border-gray-300 p-2 text-center">
                        {resultados.costos.materiaPrima.X.toFixed(0)}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {resultados.costos.materiaPrima.Y.toFixed(0)}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {resultados.costos.materiaPrima.Z.toFixed(0)}
                      </td>
                      <td className="border border-gray-300 p-2 text-center font-semibold">
                        {resultados.costos.materiaPrima.total.toFixed(0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 font-medium">Uso de Equipo</td>
                      <td className="border border-gray-300 p-2 text-center">
                        {resultados.costos.usoEquipo.X.toFixed(0)}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {resultados.costos.usoEquipo.Y.toFixed(0)}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {resultados.costos.usoEquipo.Z.toFixed(0)}
                      </td>
                      <td className="border border-gray-300 p-2 text-center font-semibold">
                        {resultados.costos.usoEquipo.total.toFixed(0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 font-medium">Almacenaje Producto en Proceso</td>
                      <td className="border border-gray-300 p-2 text-center">-</td>
                      <td className="border border-gray-300 p-2 text-center">-</td>
                      <td className="border border-gray-300 p-2 text-center">-</td>
                      <td className="border border-gray-300 p-2 text-center font-semibold">
                        {resultados.costos.almacenajeProcesoIntermedio.total.toFixed(0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 font-medium">Almacenaje Producto Terminado</td>
                      <td className="border border-gray-300 p-2 text-center">-</td>
                      <td className="border border-gray-300 p-2 text-center">-</td>
                      <td className="border border-gray-300 p-2 text-center">-</td>
                      <td className="border border-gray-300 p-2 text-center font-semibold">
                        {resultados.costos.almacenajeProductoTerminado.total.toFixed(0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 font-medium">Multa Demanda</td>
                      <td className="border border-gray-300 p-2 text-center">-</td>
                      <td className="border border-gray-300 p-2 text-center">-</td>
                      <td className="border border-gray-300 p-2 text-center">-</td>
                      <td className="border border-gray-300 p-2 text-center font-semibold">
                        {resultados.costos.multaDemanda.total.toFixed(0)}
                      </td>
                    </tr>
                    <tr className="bg-blue-50">
                      <td className="border border-gray-300 p-2 font-bold">Sub Total</td>
                      <td className="border border-gray-300 p-2 text-center">-</td>
                      <td className="border border-gray-300 p-2 text-center">-</td>
                      <td className="border border-gray-300 p-2 text-center">-</td>
                      <td className="border border-gray-300 p-2 text-center font-bold text-lg">
                        {resultados.costos.subTotal.toFixed(0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Análisis de Eficiencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Análisis de Eficiencia vs Estándar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Costos Estándar</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Producto X:</span>
                      <span>${resultados.eficiencia.costosEstandar.X.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Producto Y:</span>
                      <span>${resultados.eficiencia.costosEstandar.Y.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Producto Z:</span>
                      <span>${resultados.eficiencia.costosEstandar.Z.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total Estándar:</span>
                      <span>${resultados.eficiencia.costosEstandar.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Métricas de Eficiencia</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Eficiencia vs Estándar:</span>
                      <Badge variant={resultados.eficiencia.eficienciaVsEstandar >= 100 ? "default" : "destructive"}>
                        {resultados.eficiencia.eficienciaVsEstandar.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Costo Unitario Estándar:</span>
                      <span>${resultados.eficiencia.costoUnitarioEstandar.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Costo Unitario Real:</span>
                      <span>${resultados.eficiencia.costoUnitarioReal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Varianza por Unidad:</span>
                      <span className={resultados.eficiencia.varianza >= 0 ? "text-green-600" : "text-red-600"}>
                        ${resultados.eficiencia.varianza.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cobertura de Demanda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Cobertura de Demanda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Demanda Pronosticada</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Producto X:</span>
                      <Badge variant="outline">{resultados.demanda.pronosticada.X} unidades</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Producto Y:</span>
                      <Badge variant="outline">{resultados.demanda.pronosticada.Y} unidades</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Producto Z:</span>
                      <Badge variant="outline">{resultados.demanda.pronosticada.Z} unidades</Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <Badge>{resultados.demanda.pronosticada.total} unidades</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Cobertura por Producto</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Cobertura X:</span>
                      <Badge variant={resultados.demanda.cobertura.X >= 95 ? "default" : "destructive"}>
                        {resultados.demanda.cobertura.X.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Cobertura Y:</span>
                      <Badge variant={resultados.demanda.cobertura.Y >= 95 ? "default" : "destructive"}>
                        {resultados.demanda.cobertura.Y.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Cobertura Z:</span>
                      <Badge variant={resultados.demanda.cobertura.Z >= 95 ? "default" : "destructive"}>
                        {resultados.demanda.cobertura.Z.toFixed(1)}%
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Promedio:</span>
                      <Badge variant={resultados.demanda.cobertura.promedio >= 95 ? "default" : "destructive"}>
                        {resultados.demanda.cobertura.promedio.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alertas de déficit */}
              {resultados.demanda.deficit.total > 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-red-800">¡Alerta de Déficit!</h5>
                      <p className="text-sm text-red-700 mt-1">
                        No cumples con la demanda total. Déficit: {resultados.demanda.deficit.total} unidades
                      </p>
                      <div className="text-sm text-red-700 mt-2">
                        <p>• Déficit X: {resultados.demanda.deficit.X} unidades</p>
                        <p>• Déficit Y: {resultados.demanda.deficit.Y} unidades</p>
                        <p>• Déficit Z: {resultados.demanda.deficit.Z} unidades</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Información de exceso */}
              {resultados.demanda.exceso.total > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h5 className="font-semibold text-yellow-800">Sobreproducción</h5>
                  <p className="text-sm text-yellow-700 mt-1">
                    Exceso total: {resultados.demanda.exceso.total} unidades (genera costos de almacenaje)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recursos Utilizados */}
          <Card>
            <CardHeader>
              <CardTitle>Recursos Utilizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Mano de Obra</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Operarios Usados:</span>
                      <Badge variant="outline">{resultados.recursos.operariosUsados}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Horas Normales:</span>
                      <span>{resultados.recursos.horasNormales}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Horas Sobretiempo:</span>
                      <span>{resultados.recursos.horasSobretiempo}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Horas:</span>
                      <Badge>{resultados.recursos.horasTotales}h</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Materia Prima</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Requerida:</span>
                      <Badge variant="outline">{resultados.recursos.materiaPrimaRequerida} unid</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Costo MP:</span>
                      <span>${resultados.costos.materiaPrima.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Eficiencia</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Eficiencia Operarios:</span>
                      <Badge variant="outline">{resultados.recursos.eficienciaOperarios}%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
