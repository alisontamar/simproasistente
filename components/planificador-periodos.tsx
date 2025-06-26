"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Target, AlertCircle, Clock } from "lucide-react"
import GestionOperarios from "./gestion-operarios"

interface DemandaPronostico {
  periodo: number
  X: number
  Y: number
  Z: number
}

// Datos de demanda pronosticada hasta el período 9 (según solicitud)
const demandaPronostico3: DemandaPronostico[] = [
  { periodo: 3, X: 1465, Y: 1095, Z: 1740 }, // Datos de la segunda imagen
  { periodo: 6, X: 1850, Y: 800, Z: 1260 }, // Datos del manual
  { periodo: 9, X: 1500, Y: 1640, Z: 2220 }, // Datos del manual
]

export default function PlanificadorPeriodos() {
  const [periodoActual, setPeriodoActual] = useState(2)
  const [inventarioActual, setInventarioActual] = useState({
    X: 413, // Datos de la segunda imagen
    Y: 288, // Datos de la segunda imagen
    Z: 323, // Datos de la segunda imagen
    "X'": 711, // Datos de la segunda imagen
    "Y'": 551, // Datos de la segunda imagen
    "Z'": 296, // Datos de la segunda imagen
    materiaPrima: 1000,
  })

  const [planProduccion, setPlanProduccion] = useState<any[]>([])
  const [operariosRecomendados, setOperariosRecomendados] = useState<any[]>([])

  const obtenerProximaDemanda = () => {
    const proximoCiclo = Math.ceil(periodoActual / 3) * 3
    return demandaPronostico3.find((d) => d.periodo === proximoCiclo)
  }

  const calcularRequerimientosProduccion = () => {
    const proximaDemanda = obtenerProximaDemanda()
    if (!proximaDemanda) return null

    const diasRestantes = proximaDemanda.periodo - periodoActual

    // Calcular déficit de productos finales (CRÍTICO PARA CUMPLIR DEMANDA)
    const deficitX = Math.max(0, proximaDemanda.X - inventarioActual.X)
    const deficitY = Math.max(0, proximaDemanda.Y - inventarioActual.Y)
    const deficitZ = Math.max(0, proximaDemanda.Z - inventarioActual.Z)

    // Calcular horas necesarias para cubrir déficit
    const horasNecesariasX = Math.ceil(deficitX / 50) // 50 unid/hora para X
    const horasNecesariasY = Math.ceil(deficitY / 40) // 40 unid/hora para Y
    const horasNecesariasZ = Math.ceil(deficitZ / 30) // 30 unid/hora para Z
    const totalHorasNecesarias = horasNecesariasX + horasNecesariasY + horasNecesariasZ

    // CORRECCIÓN: Máximo 8 operarios (8 máquinas disponibles)
    const maxOperariosPorDia = 8
    const maxHorasPorDia = maxOperariosPorDia * 8 // 64 horas normales por día
    const maxHorasPorDiaConSobretiempo = maxOperariosPorDia * 12 // 96 horas con sobretiempo por día

    // Calcular si es posible cumplir con la capacidad disponible
    const horasDisponiblesSinSobretiempo = maxHorasPorDia * diasRestantes
    const horasDisponiblesConSobretiempo = maxHorasPorDiaConSobretiempo * diasRestantes

    // Determinar estrategia óptima
    let estrategia = "normal"
    let horasPorDia = 0
    let operariosPorDia = 0
    let horasPorOperario = 8

    if (totalHorasNecesarias <= horasDisponiblesSinSobretiempo) {
      // Se puede cumplir con horario normal
      estrategia = "normal"
      horasPorDia = Math.ceil(totalHorasNecesarias / diasRestantes)
      operariosPorDia = Math.min(maxOperariosPorDia, Math.ceil(horasPorDia / 8))
      horasPorOperario = Math.min(8, Math.ceil(horasPorDia / operariosPorDia))
    } else if (totalHorasNecesarias <= horasDisponiblesConSobretiempo) {
      // Se necesita sobretiempo
      estrategia = "sobretiempo"
      horasPorDia = Math.ceil(totalHorasNecesarias / diasRestantes)
      operariosPorDia = maxOperariosPorDia
      horasPorOperario = Math.min(12, Math.ceil(horasPorDia / operariosPorDia))
    } else {
      // Imposible cumplir con la capacidad actual
      estrategia = "imposible"
      horasPorDia = maxHorasPorDiaConSobretiempo
      operariosPorDia = maxOperariosPorDia
      horasPorOperario = 12
    }

    // Calcular distribución por período
    const distribucionPorPeriodo = []
    let horasRestantes = totalHorasNecesarias

    for (let periodo = periodoActual; periodo < proximaDemanda.periodo; periodo++) {
      const horasEstePeriodo = Math.min(horasRestantes, horasPorDia)
      const operariosEstePeriodo = Math.min(maxOperariosPorDia, Math.ceil(horasEstePeriodo / horasPorOperario))
      const horasRealesEstePeriodo = operariosEstePeriodo * horasPorOperario

      distribucionPorPeriodo.push({
        periodo,
        horasNecesarias: horasEstePeriodo,
        operarios: operariosEstePeriodo,
        horasPorOperario: horasPorOperario,
        horasReales: horasRealesEstePeriodo,
        eficiencia: (horasEstePeriodo / horasRealesEstePeriodo) * 100,
      })

      horasRestantes -= horasEstePeriodo
      if (horasRestantes <= 0) break
    }

    // Calcular porcentaje de cumplimiento actual
    const cumplimientoActualX = Math.min(100, (inventarioActual.X / proximaDemanda.X) * 100)
    const cumplimientoActualY = Math.min(100, (inventarioActual.Y / proximaDemanda.Y) * 100)
    const cumplimientoActualZ = Math.min(100, (inventarioActual.Z / proximaDemanda.Z) * 100)
    const cumplimientoPromedio = (cumplimientoActualX + cumplimientoActualY + cumplimientoActualZ) / 3

    // Calcular requerimientos de productos intermedios
    const requerimientoXPrima = Math.max(0, deficitX - inventarioActual["X'"])
    const requerimientoYPrima = Math.max(0, deficitY - inventarioActual["Y'"])
    const requerimientoZPrima = Math.max(0, deficitZ - inventarioActual["Z'"])

    // Calcular materia prima necesaria
    const materiaPrimaNecesaria = requerimientoXPrima + requerimientoYPrima * 2 + requerimientoZPrima * 3
    const deficitMateriaPrima = Math.max(0, materiaPrimaNecesaria - inventarioActual.materiaPrima)

    return {
      proximaDemanda,
      diasRestantes,
      deficit: { X: deficitX, Y: deficitY, Z: deficitZ },
      cumplimientoActual: {
        X: cumplimientoActualX,
        Y: cumplimientoActualY,
        Z: cumplimientoActualZ,
        promedio: cumplimientoPromedio,
      },
      requerimientos: {
        "X'": requerimientoXPrima,
        "Y'": requerimientoYPrima,
        "Z'": requerimientoZPrima,
      },
      materiaPrimaNecesaria,
      deficitMateriaPrima,
      horasNecesarias: {
        X: horasNecesariasX,
        Y: horasNecesariasY,
        Z: horasNecesariasZ,
        total: totalHorasNecesarias,
      },
      capacidad: {
        estrategia,
        horasPorDia,
        operariosPorDia,
        horasPorOperario,
        esFactible: estrategia !== "imposible",
        porcentajeCumplimiento:
          estrategia === "imposible" ? (horasDisponiblesConSobretiempo / totalHorasNecesarias) * 100 : 100,
      },
      distribucionPorPeriodo,
    }
  }

  const generarPlanOptimo = () => {
    const analisis = calcularRequerimientosProduccion()
    if (!analisis) return

    const { requerimientos, diasRestantes } = analisis

    // Calcular producción diaria requerida
    const produccionDiariaX = Math.ceil(requerimientos["X'"] / diasRestantes)
    const produccionDiariaY = Math.ceil(requerimientos["Y'"] / diasRestantes)
    const produccionDiariaZ = Math.ceil(requerimientos["Z'"] / diasRestantes)

    // Calcular horas necesarias por producto (asumiendo eficiencia 100%)
    const horasX = Math.ceil(produccionDiariaX / 50) // 50 unid/hora para X
    const horasY = Math.ceil(produccionDiariaY / 40) // 40 unid/hora para Y
    const horasZ = Math.ceil(produccionDiariaZ / 30) // 30 unid/hora para Z

    const plan = {
      analisis,
      recomendaciones: {
        linea1: {
          X: { produccionDiaria: produccionDiariaX, horasNecesarias: horasX },
          Y: { produccionDiaria: produccionDiariaY, horasNecesarias: horasY },
          Z: { produccionDiaria: produccionDiariaZ, horasNecesarias: horasZ },
        },
        operariosRecomendados: Math.min(8, Math.ceil((horasX + horasY + horasZ) / 8)),
        inversionesRecomendadas: {
          mantenimiento: Math.min(500, 100 * Math.ceil((horasX + horasY + horasZ) / 8)),
          calidad: Math.min(300, (50 * (produccionDiariaX + produccionDiariaY + produccionDiariaZ)) / 100),
        },
      },
    }

    setPlanProduccion([plan])
  }

  const handleOperariosRecomendados = (operarios: any[]) => {
    setOperariosRecomendados(operarios)
  }

  const analisis = calcularRequerimientosProduccion()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Planificador de Períodos
          </CardTitle>
          <CardDescription>
            Planifica tu producción para CUMPLIR 100% DE LA DEMANDA. Máximo 8 operarios (8 máquinas disponibles).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuración inicial */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-base font-semibold">Período Actual</Label>
              <Input
                type="number"
                min="1"
                max="9"
                value={periodoActual}
                onChange={(e) => setPeriodoActual(Number.parseInt(e.target.value) || 2)}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Planificación limitada hasta el período 9</p>
            </div>
          </div>

          {/* Inventarios actuales */}
          <div>
            <Label className="text-base font-semibold">Inventarios Actuales</Label>
            <div className="grid md:grid-cols-4 gap-4 mt-2">
              <div>
                <Label className="text-sm">Productos Finales</Label>
                <div className="space-y-2 mt-1">
                  <Input
                    placeholder="X"
                    type="number"
                    value={inventarioActual.X}
                    onChange={(e) =>
                      setInventarioActual({
                        ...inventarioActual,
                        X: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <Input
                    placeholder="Y"
                    type="number"
                    value={inventarioActual.Y}
                    onChange={(e) =>
                      setInventarioActual({
                        ...inventarioActual,
                        Y: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <Input
                    placeholder="Z"
                    type="number"
                    value={inventarioActual.Z}
                    onChange={(e) =>
                      setInventarioActual({
                        ...inventarioActual,
                        Z: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm">Productos Intermedios</Label>
                <div className="space-y-2 mt-1">
                  <Input
                    placeholder="X'"
                    type="number"
                    value={inventarioActual["X'"]}
                    onChange={(e) =>
                      setInventarioActual({
                        ...inventarioActual,
                        "X'": Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <Input
                    placeholder="Y'"
                    type="number"
                    value={inventarioActual["Y'"]}
                    onChange={(e) =>
                      setInventarioActual({
                        ...inventarioActual,
                        "Y'": Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <Input
                    placeholder="Z'"
                    type="number"
                    value={inventarioActual["Z'"]}
                    onChange={(e) =>
                      setInventarioActual({
                        ...inventarioActual,
                        "Z'": Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm">Materia Prima</Label>
                <Input
                  type="number"
                  value={inventarioActual.materiaPrima}
                  onChange={(e) =>
                    setInventarioActual({
                      ...inventarioActual,
                      materiaPrima: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <Button onClick={generarPlanOptimo} className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Generar Plan Óptimo
          </Button>
        </CardContent>
      </Card>

      {/* Análisis de demanda */}
      {analisis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Análisis de Demanda y Capacidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Próxima Entrega (Período {analisis.proximaDemanda?.periodo})</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Producto X:</span>
                    <Badge variant="outline">{analisis.proximaDemanda?.X} unidades</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Producto Y:</span>
                    <Badge variant="outline">{analisis.proximaDemanda?.Y} unidades</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Producto Z:</span>
                    <Badge variant="outline">{analisis.proximaDemanda?.Z} unidades</Badge>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Días restantes:</span>
                    <Badge>{analisis.diasRestantes} días</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Déficit a Cubrir</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Déficit X:</span>
                    <Badge variant={analisis.deficit.X > 0 ? "destructive" : "secondary"}>
                      {analisis.deficit.X} unidades
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Déficit Y:</span>
                    <Badge variant={analisis.deficit.Y > 0 ? "destructive" : "secondary"}>
                      {analisis.deficit.Y} unidades
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Déficit Z:</span>
                    <Badge variant={analisis.deficit.Z > 0 ? "destructive" : "secondary"}>
                      {analisis.deficit.Z} unidades
                    </Badge>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Materia Prima Faltante:</span>
                    <Badge variant={analisis.deficitMateriaPrima > 0 ? "destructive" : "secondary"}>
                      {analisis.deficitMateriaPrima} unidades
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Análisis de Horas y Capacidad</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Horas para X:</span>
                    <Badge variant={analisis.horasNecesarias.X > 0 ? "destructive" : "secondary"}>
                      {analisis.horasNecesarias.X}h
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Horas para Y:</span>
                    <Badge variant={analisis.horasNecesarias.Y > 0 ? "destructive" : "secondary"}>
                      {analisis.horasNecesarias.Y}h
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Horas para Z:</span>
                    <Badge variant={analisis.horasNecesarias.Z > 0 ? "destructive" : "secondary"}>
                      {analisis.horasNecesarias.Z}h
                    </Badge>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total Horas Necesarias:</span>
                    <Badge variant={analisis.horasNecesarias.total > 0 ? "destructive" : "secondary"}>
                      {analisis.horasNecesarias.total}h
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Estrategia Recomendada:</span>
                    <Badge
                      variant={
                        analisis.capacidad.estrategia === "normal"
                          ? "default"
                          : analisis.capacidad.estrategia === "sobretiempo"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {analisis.capacidad.estrategia === "normal"
                        ? "Horario Normal"
                        : analisis.capacidad.estrategia === "sobretiempo"
                          ? "Con Sobretiempo"
                          : "Imposible"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Operarios por día:</span>
                    <Badge variant="outline">{analisis.capacidad.operariosPorDia}/8</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Horas por operario:</span>
                    <Badge variant="outline">{analisis.capacidad.horasPorOperario}h</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Cumplimiento posible:</span>
                    <Badge variant={analisis.capacidad.porcentajeCumplimiento >= 100 ? "default" : "destructive"}>
                      {analisis.capacidad.porcentajeCumplimiento.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Distribución por período */}
            {analisis.distribucionPorPeriodo.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Distribución de Trabajo por Período
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left">Período</th>
                        <th className="border border-gray-300 p-2 text-center">Horas Necesarias</th>
                        <th className="border border-gray-300 p-2 text-center">Operarios</th>
                        <th className="border border-gray-300 p-2 text-center">Horas/Operario</th>
                        <th className="border border-gray-300 p-2 text-center">Horas Reales</th>
                        <th className="border border-gray-300 p-2 text-center">Eficiencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analisis.distribucionPorPeriodo.map((dist, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2 font-medium">{dist.periodo}</td>
                          <td className="border border-gray-300 p-2 text-center">{dist.horasNecesarias}h</td>
                          <td className="border border-gray-300 p-2 text-center">{dist.operarios}</td>
                          <td className="border border-gray-300 p-2 text-center">
                            <Badge variant={dist.horasPorOperario > 8 ? "secondary" : "default"}>
                              {dist.horasPorOperario}h
                            </Badge>
                          </td>
                          <td className="border border-gray-300 p-2 text-center">{dist.horasReales}h</td>
                          <td className="border border-gray-300 p-2 text-center">
                            <Badge variant={dist.eficiencia >= 90 ? "default" : "secondary"}>
                              {dist.eficiencia.toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Alertas específicas */}
            {analisis.capacidad.estrategia === "sobretiempo" && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-yellow-800">Sobretiempo Requerido</h5>
                    <p className="text-sm text-yellow-700 mt-1">
                      Necesitas usar sobretiempo para cumplir la demanda. Cada operario trabajará{" "}
                      {analisis.capacidad.horasPorOperario} horas por día.
                    </p>
                    <div className="text-sm text-yellow-700 mt-2">
                      <p>
                        • Costo adicional: $
                        {(
                          (analisis.capacidad.horasPorOperario - 8) *
                          analisis.capacidad.operariosPorDia *
                          analisis.diasRestantes *
                          3
                        ).toFixed(0)}{" "}
                        por sobretiempo
                      </p>
                      <p>• Usa los 8 operarios disponibles al máximo</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {analisis.capacidad.estrategia === "imposible" && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-red-800">¡Imposible Cumplir 100% de la Demanda!</h5>
                    <p className="text-sm text-red-700 mt-1">
                      Con 8 operarios trabajando 12h/día durante {analisis.diasRestantes} días, solo puedes cumplir{" "}
                      {analisis.capacidad.porcentajeCumplimiento.toFixed(1)}% de la demanda.
                    </p>
                    <div className="text-sm text-red-700 mt-2">
                      <p>• Capacidad máxima: {8 * 12 * analisis.diasRestantes} horas</p>
                      <p>• Horas necesarias: {analisis.horasNecesarias.total} horas</p>
                      <p>• Considera priorizar productos con mayor margen</p>
                      <p>• Acepta multas por incumplimiento parcial</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {analisis.capacidad.estrategia === "normal" && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Target className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-green-800">✅ Cumplimiento Factible</h5>
                    <p className="text-sm text-green-700 mt-1">
                      Puedes cumplir 100% de la demanda con horario normal. Usa {analisis.capacidad.operariosPorDia}{" "}
                      operarios trabajando {analisis.capacidad.horasPorOperario}h por día.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-3">Estado Actual de Cumplimiento</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Cumplimiento X:</span>
                  <Badge variant={analisis.cumplimientoActual.X >= 100 ? "default" : "destructive"}>
                    {analisis.cumplimientoActual.X.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Cumplimiento Y:</span>
                  <Badge variant={analisis.cumplimientoActual.Y >= 100 ? "default" : "destructive"}>
                    {analisis.cumplimientoActual.Y.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Cumplimiento Z:</span>
                  <Badge variant={analisis.cumplimientoActual.Z >= 100 ? "default" : "destructive"}>
                    {analisis.cumplimientoActual.Z.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Cumplimiento Promedio:</span>
                  <Badge variant={analisis.cumplimientoActual.promedio >= 100 ? "default" : "destructive"}>
                    {analisis.cumplimientoActual.promedio.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>

            {analisis.deficitMateriaPrima > 0 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-red-800">¡Alerta de Materia Prima!</h5>
                    <p className="text-sm text-red-700 mt-1">
                      Necesitas ordenar {analisis.deficitMateriaPrima} unidades de materia prima. Considera una orden
                      express si quedan pocos días.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Plan de producción generado */}
      {planProduccion.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Plan de Producción Recomendado</CardTitle>
          </CardHeader>
          <CardContent>
            {planProduccion.map((plan, index) => (
              <div key={index} className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Línea 1 - Producción Diaria Recomendada</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-semibold text-blue-900">Producto X'</h5>
                      <p className="text-2xl font-bold text-blue-700">
                        {plan.recomendaciones.linea1.X.produccionDiaria}
                      </p>
                      <p className="text-sm text-blue-600">
                        {plan.recomendaciones.linea1.X.horasNecesarias} horas necesarias
                      </p>
                      <p className="text-xs text-blue-500 mt-1">Tasa estándar: 50 unid/hora</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h5 className="font-semibold text-green-900">Producto Y'</h5>
                      <p className="text-2xl font-bold text-green-700">
                        {plan.recomendaciones.linea1.Y.produccionDiaria}
                      </p>
                      <p className="text-sm text-green-600">
                        {plan.recomendaciones.linea1.Y.horasNecesarias} horas necesarias
                      </p>
                      <p className="text-xs text-green-500 mt-1">Tasa estándar: 40 unid/hora</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h5 className="font-semibold text-purple-900">Producto Z'</h5>
                      <p className="text-2xl font-bold text-purple-700">
                        {plan.recomendaciones.linea1.Z.produccionDiaria}
                      </p>
                      <p className="text-sm text-purple-600">
                        {plan.recomendaciones.linea1.Z.horasNecesarias} horas necesarias
                      </p>
                      <p className="text-xs text-purple-500 mt-1">Tasa estándar: 30 unid/hora</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Recursos Recomendados</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Operarios necesarios:</span>
                        <Badge variant="outline">{plan.recomendaciones.operariosRecomendados}/8</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Horas totales/día:</span>
                        <Badge variant="outline">
                          {plan.recomendaciones.linea1.X.horasNecesarias +
                            plan.recomendaciones.linea1.Y.horasNecesarias +
                            plan.recomendaciones.linea1.Z.horasNecesarias}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Inversiones Recomendadas</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Mantenimiento:</span>
                        <Badge variant="outline">${plan.recomendaciones.inversionesRecomendadas.mantenimiento}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Control de Calidad:</span>
                        <Badge variant="outline">${plan.recomendaciones.inversionesRecomendadas.calidad}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Componente de gestión de operarios integrado */}
      <GestionOperarios demandaProxima={analisis?.proximaDemanda} onSelectOperarios={handleOperariosRecomendados} />

      {/* Pronóstico completo */}
      <Card>
        <CardHeader>
          <CardTitle>Pronóstico de Demanda Completo</CardTitle>
          <CardDescription>Demanda pronosticada hasta el período 9</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-2 text-left">Período</th>
                  <th className="border border-gray-300 p-2 text-center">Producto X</th>
                  <th className="border border-gray-300 p-2 text-center">Producto Y</th>
                  <th className="border border-gray-300 p-2 text-center">Producto Z</th>
                  <th className="border border-gray-300 p-2 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {demandaPronostico3.map((demanda, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-gray-50 ${
                      demanda.periodo === Math.ceil(periodoActual / 3) * 3 ? "bg-yellow-50" : ""
                    }`}
                  >
                    <td className="border border-gray-300 p-2 font-medium">
                      {demanda.periodo}
                      {demanda.periodo === Math.ceil(periodoActual / 3) * 3 && (
                        <Badge variant="secondary" className="ml-2">
                          Próximo
                        </Badge>
                      )}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">{demanda.X}</td>
                    <td className="border border-gray-300 p-2 text-center">{demanda.Y}</td>
                    <td className="border border-gray-300 p-2 text-center">{demanda.Z}</td>
                    <td className="border border-gray-300 p-2 text-center font-semibold">
                      {demanda.X + demanda.Y + demanda.Z}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
