"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface PeriodoData {
  periodo: number
  produccionX: number
  produccionY: number
  produccionZ: number
  costosReales: number
}

export default function AnalisisEficiencia() {
  const [periodos, setPeriodos] = useState<PeriodoData[]>([])
  const [nuevoPeriodo, setNuevoPeriodo] = useState<PeriodoData>({
    periodo: 1,
    produccionX: 0,
    produccionY: 0,
    produccionZ: 0,
    costosReales: 0,
  })

  const costosEstandar = { X: 2.5, Y: 3.5, Z: 4.5 }

  const agregarPeriodo = () => {
    setPeriodos([...periodos, { ...nuevoPeriodo }])
    setNuevoPeriodo({
      periodo: nuevoPeriodo.periodo + 1,
      produccionX: 0,
      produccionY: 0,
      produccionZ: 0,
      costosReales: 0,
    })
  }

  const calcularEficiencia = (periodo: PeriodoData) => {
    const costosEstandarTotal =
      periodo.produccionX * costosEstandar.X +
      periodo.produccionY * costosEstandar.Y +
      periodo.produccionZ * costosEstandar.Z

    if (periodo.costosReales === 0) return 0
    return (costosEstandarTotal / periodo.costosReales) * 100
  }

  const calcularVarianza = (periodo: PeriodoData) => {
    const totalUnidades = periodo.produccionX + periodo.produccionY + periodo.produccionZ
    if (totalUnidades === 0) return 0

    const costosEstandarTotal =
      periodo.produccionX * costosEstandar.X +
      periodo.produccionY * costosEstandar.Y +
      periodo.produccionZ * costosEstandar.Z

    const costoEstandarUnitario = costosEstandarTotal / totalUnidades
    const costoRealUnitario = periodo.costosReales / totalUnidades

    return costoEstandarUnitario - costoRealUnitario
  }

  const calcularEficienciaAcumulada = () => {
    const totales = periodos.reduce(
      (acc, periodo) => ({
        costosEstandar:
          acc.costosEstandar +
          periodo.produccionX * costosEstandar.X +
          periodo.produccionY * costosEstandar.Y +
          periodo.produccionZ * costosEstandar.Z,
        costosReales: acc.costosReales + periodo.costosReales,
        unidades: acc.unidades + periodo.produccionX + periodo.produccionY + periodo.produccionZ,
      }),
      { costosEstandar: 0, costosReales: 0, unidades: 0 },
    )

    if (totales.costosReales === 0) return { eficiencia: 0, varianza: 0 }

    const eficiencia = (totales.costosEstandar / totales.costosReales) * 100
    const varianza =
      totales.unidades > 0 ? totales.costosEstandar / totales.unidades - totales.costosReales / totales.unidades : 0

    return { eficiencia, varianza }
  }

  const acumulado = calcularEficienciaAcumulada()

  const EficienciaIcon = ({ eficiencia }: { eficiencia: number }) => {
    if (eficiencia > 100) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (eficiencia < 100) return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-yellow-600" />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Análisis de Eficiencia y Varianza
          </CardTitle>
          <CardDescription>Calcula tu eficiencia comparada con los costos estándar de SIMPRO</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formulario para nuevo período */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-4">Agregar Nuevo Período</h3>
            <div className="grid md:grid-cols-5 gap-4">
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
                <Label>Producción X</Label>
                <Input
                  type="number"
                  value={nuevoPeriodo.produccionX}
                  onChange={(e) =>
                    setNuevoPeriodo({
                      ...nuevoPeriodo,
                      produccionX: Number.parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label>Producción Y</Label>
                <Input
                  type="number"
                  value={nuevoPeriodo.produccionY}
                  onChange={(e) =>
                    setNuevoPeriodo({
                      ...nuevoPeriodo,
                      produccionY: Number.parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label>Producción Z</Label>
                <Input
                  type="number"
                  value={nuevoPeriodo.produccionZ}
                  onChange={(e) =>
                    setNuevoPeriodo({
                      ...nuevoPeriodo,
                      produccionZ: Number.parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label>Costos Reales ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={nuevoPeriodo.costosReales}
                  onChange={(e) =>
                    setNuevoPeriodo({
                      ...nuevoPeriodo,
                      costosReales: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <Button onClick={agregarPeriodo} className="mt-4">
              Agregar Período
            </Button>
          </div>

          {/* Resumen Acumulado */}
          {periodos.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Eficiencia Acumulada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <EficienciaIcon eficiencia={acumulado.eficiencia} />
                    <span className="text-2xl font-bold">{acumulado.eficiencia.toFixed(1)}%</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {acumulado.eficiencia > 100 ? "Por encima" : acumulado.eficiencia < 100 ? "Por debajo" : "Igual"}{" "}
                    del estándar
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Varianza Acumulada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-2xl font-bold ${
                        acumulado.varianza > 0
                          ? "text-green-600"
                          : acumulado.varianza < 0
                            ? "text-red-600"
                            : "text-gray-600"
                      }`}
                    >
                      ${acumulado.varianza.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Por unidad vs. estándar</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabla de períodos */}
          {periodos.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-left">Período</th>
                    <th className="border border-gray-300 p-2 text-center">Prod. X</th>
                    <th className="border border-gray-300 p-2 text-center">Prod. Y</th>
                    <th className="border border-gray-300 p-2 text-center">Prod. Z</th>
                    <th className="border border-gray-300 p-2 text-center">Costos Estándar</th>
                    <th className="border border-gray-300 p-2 text-center">Costos Reales</th>
                    <th className="border border-gray-300 p-2 text-center">Eficiencia</th>
                    <th className="border border-gray-300 p-2 text-center">Varianza/Unid</th>
                  </tr>
                </thead>
                <tbody>
                  {periodos.map((periodo, index) => {
                    const costosEstandarTotal =
                      periodo.produccionX * costosEstandar.X +
                      periodo.produccionY * costosEstandar.Y +
                      periodo.produccionZ * costosEstandar.Z
                    const eficiencia = calcularEficiencia(periodo)
                    const varianza = calcularVarianza(periodo)

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2 font-medium">{periodo.periodo}</td>
                        <td className="border border-gray-300 p-2 text-center">{periodo.produccionX}</td>
                        <td className="border border-gray-300 p-2 text-center">{periodo.produccionY}</td>
                        <td className="border border-gray-300 p-2 text-center">{periodo.produccionZ}</td>
                        <td className="border border-gray-300 p-2 text-center">${costosEstandarTotal.toFixed(2)}</td>
                        <td className="border border-gray-300 p-2 text-center">${periodo.costosReales.toFixed(2)}</td>
                        <td className="border border-gray-300 p-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <EficienciaIcon eficiencia={eficiencia} />
                            <span
                              className={
                                eficiencia > 100
                                  ? "text-green-600"
                                  : eficiencia < 100
                                    ? "text-red-600"
                                    : "text-gray-600"
                              }
                            >
                              {eficiencia.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <span
                            className={
                              varianza > 0 ? "text-green-600" : varianza < 0 ? "text-red-600" : "text-gray-600"
                            }
                          >
                            ${varianza.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Información de costos estándar */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Costos Estándar de Referencia</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <span className="font-medium">Producto X</span>
                <p className="text-blue-700">$2.50 por unidad</p>
              </div>
              <div className="text-center">
                <span className="font-medium">Producto Y</span>
                <p className="text-blue-700">$3.50 por unidad</p>
              </div>
              <div className="text-center">
                <span className="font-medium">Producto Z</span>
                <p className="text-blue-700">$4.50 por unidad</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
