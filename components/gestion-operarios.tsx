"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Award, TrendingUp } from "lucide-react"

// Datos de operarios según la imagen proporcionada
const datosOperarios = [
  { id: 1, diasSinEntrenamiento: 1, diasConEntrenamiento: 2, potencial: "Promedio" },
  { id: 2, diasSinEntrenamiento: 8, diasConEntrenamiento: 1, potencial: "Bueno" },
  { id: 3, diasSinEntrenamiento: 5, diasConEntrenamiento: 6, potencial: "Excelente" },
  { id: 4, diasSinEntrenamiento: 4, diasConEntrenamiento: 1, potencial: "Bueno" },
  { id: 5, diasSinEntrenamiento: 4, diasConEntrenamiento: 1, potencial: "Promedio" },
  { id: 6, diasSinEntrenamiento: 5, diasConEntrenamiento: 7, potencial: "Pobre" },
  { id: 7, diasSinEntrenamiento: 7, diasConEntrenamiento: 7, potencial: "Regular" },
  { id: 8, diasSinEntrenamiento: 1, diasConEntrenamiento: 1, potencial: "Promedio" },
  { id: 9, diasSinEntrenamiento: 1, diasConEntrenamiento: 1, potencial: "Promedio" },
  { id: 10, diasSinEntrenamiento: 3, diasConEntrenamiento: 2, potencial: "Promedio" },
  { id: 11, diasSinEntrenamiento: 8, diasConEntrenamiento: 0, potencial: "Promedio" },
  { id: 12, diasSinEntrenamiento: 4, diasConEntrenamiento: 2, potencial: "Pobre" },
  { id: 13, diasSinEntrenamiento: 3, diasConEntrenamiento: 0, potencial: "Excelente" },
  { id: 14, diasSinEntrenamiento: 0, diasConEntrenamiento: 2, potencial: "Regular" },
  { id: 15, diasSinEntrenamiento: 2, diasConEntrenamiento: 4, potencial: "Pobre" },
  { id: 16, diasSinEntrenamiento: 3, diasConEntrenamiento: 1, potencial: "Bueno" },
  { id: 17, diasSinEntrenamiento: 7, diasConEntrenamiento: 1, potencial: "Regular" },
  { id: 18, diasSinEntrenamiento: 1, diasConEntrenamiento: 1, potencial: "Excelente" },
  { id: 19, diasSinEntrenamiento: 2, diasConEntrenamiento: 2, potencial: "Bueno" },
  { id: 20, diasSinEntrenamiento: 4, diasConEntrenamiento: 2, potencial: "Promedio" },
  { id: 21, diasSinEntrenamiento: 3, diasConEntrenamiento: 1, potencial: "Promedio" },
  { id: 22, diasSinEntrenamiento: 2, diasConEntrenamiento: 1, potencial: "Bueno" },
  { id: 23, diasSinEntrenamiento: 5, diasConEntrenamiento: 1, potencial: "Regular" },
  { id: 24, diasSinEntrenamiento: 1, diasConEntrenamiento: 1, potencial: "Promedio" },
  { id: 25, diasSinEntrenamiento: 0, diasConEntrenamiento: 5, potencial: "Pobre" },
  { id: 26, diasSinEntrenamiento: 3, diasConEntrenamiento: 1, potencial: "Excelente" },
  { id: 27, diasSinEntrenamiento: 5, diasConEntrenamiento: 2, potencial: "Promedio" },
  { id: 28, diasSinEntrenamiento: 3, diasConEntrenamiento: 3, potencial: "Regular" },
]

// Tasas de producción estándar por producto
const tasasProduccion = {
  X: 50, // unidades/hora
  Y: 40, // unidades/hora
  Z: 30, // unidades/hora
}

// Función para calcular la eficiencia estimada de un operario
const calcularEficienciaOperario = (operario: any) => {
  // Factores de ponderación
  const factorPotencial = {
    Excelente: 1.2,
    Bueno: 1.1,
    Promedio: 1.0,
    Regular: 0.9,
    Pobre: 0.8,
  }

  // Experiencia total (días trabajados con y sin entrenamiento)
  const experienciaTotal = operario.diasSinEntrenamiento + operario.diasConEntrenamiento

  // Factor de experiencia (aumenta con más días, pero con rendimientos decrecientes)
  const factorExperiencia = Math.min(1.2, 0.8 + experienciaTotal / 20)

  // Factor de entrenamiento (premia más días de entrenamiento)
  const factorEntrenamiento = 1 + (operario.diasConEntrenamiento / (experienciaTotal || 1)) * 0.2

  // Eficiencia combinada
  const eficiencia =
    factorPotencial[operario.potencial as keyof typeof factorPotencial] * factorExperiencia * factorEntrenamiento

  return Math.round(eficiencia * 100)
}

// Calcular producción por hora para cada operario y producto
const calcularProduccionPorHora = (operario: any) => {
  const eficiencia = calcularEficienciaOperario(operario) / 100
  return {
    X: Math.round(tasasProduccion.X * eficiencia),
    Y: Math.round(tasasProduccion.Y * eficiencia),
    Z: Math.round(tasasProduccion.Z * eficiencia),
  }
}

interface GestionOperariosProps {
  demandaProxima?: {
    periodo: number
    X: number
    Y: number
    Z: number
  }
  onSelectOperarios?: (operarios: any[]) => void
}

export default function GestionOperarios({ demandaProxima, onSelectOperarios }: GestionOperariosProps) {
  const [filtro, setFiltro] = useState("todos")
  const [productoSeleccionado, setProductoSeleccionado] = useState("X")
  const [operariosContratados, setOperariosContratados] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8]) // Inicialmente los 8 primeros
  const [operariosRecomendados, setOperariosRecomendados] = useState<any[]>([])

  // Calcular eficiencia para todos los operarios
  const operariosConEficiencia = datosOperarios.map((operario) => {
    const eficiencia = calcularEficienciaOperario(operario)
    const produccionPorHora = calcularProduccionPorHora(operario)
    return {
      ...operario,
      eficiencia,
      produccionPorHora,
      contratado: operariosContratados.includes(operario.id),
    }
  })

  // Ordenar operarios por eficiencia
  const operariosOrdenados = [...operariosConEficiencia].sort((a, b) => b.eficiencia - a.eficiencia)

  // Filtrar operarios según el filtro seleccionado
  const operariosFiltrados = operariosOrdenados.filter((operario) => {
    if (filtro === "todos") return true
    if (filtro === "contratados") return operariosContratados.includes(operario.id)
    if (filtro === "disponibles") return !operariosContratados.includes(operario.id)
    if (filtro === "excelentes") return operario.potencial === "Excelente"
    return true
  })

  // Generar recomendaciones basadas en la demanda
  const generarRecomendaciones = () => {
    if (!demandaProxima) return

    // Calcular cuántos operarios necesitamos para cada producto
    const diasRestantes = Math.max(1, demandaProxima.periodo - 1) // Asumimos que estamos en período 1 si no se especifica

    // Unidades por día necesarias
    const unidadesPorDiaX = Math.ceil(demandaProxima.X / diasRestantes)
    const unidadesPorDiaY = Math.ceil(demandaProxima.Y / diasRestantes)
    const unidadesPorDiaZ = Math.ceil(demandaProxima.Z / diasRestantes)

    // Horas necesarias por día (asumiendo eficiencia 100%)
    const horasNecesariasX = Math.ceil(unidadesPorDiaX / tasasProduccion.X)
    const horasNecesariasY = Math.ceil(unidadesPorDiaY / tasasProduccion.Y)
    const horasNecesariasZ = Math.ceil(unidadesPorDiaZ / tasasProduccion.Z)

    // Total de horas necesarias
    const totalHorasNecesarias = horasNecesariasX + horasNecesariasY + horasNecesariasZ

    // Operarios necesarios (asumiendo 8 horas por operario)
    const operariosNecesarios = Math.ceil(totalHorasNecesarias / 8)

    // Seleccionar los mejores operarios para cada producto
    const mejoresParaX = [...operariosConEficiencia]
      .sort((a, b) => b.produccionPorHora.X - a.produccionPorHora.X)
      .slice(0, Math.ceil(horasNecesariasX / 8))

    const mejoresParaY = [...operariosConEficiencia]
      .sort((a, b) => b.produccionPorHora.Y - a.produccionPorHora.Y)
      .slice(0, Math.ceil(horasNecesariasY / 8))

    const mejoresParaZ = [...operariosConEficiencia]
      .sort((a, b) => b.produccionPorHora.Z - a.produccionPorHora.Z)
      .slice(0, Math.ceil(horasNecesariasZ / 8))

    // Combinar recomendaciones (eliminando duplicados)
    const recomendacionesCombinadas = [
      ...mejoresParaX.map((op) => ({ ...op, recomendadoPara: "X" })),
      ...mejoresParaY.map((op) => ({ ...op, recomendadoPara: "Y" })),
      ...mejoresParaZ.map((op) => ({ ...op, recomendadoPara: "Z" })),
    ]

    // Eliminar duplicados manteniendo la primera ocurrencia
    const idsVistos = new Set()
    const recomendacionesUnicas = recomendacionesCombinadas.filter((op) => {
      if (idsVistos.has(op.id)) return false
      idsVistos.add(op.id)
      return true
    })

    setOperariosRecomendados(recomendacionesUnicas)

    // Si hay callback, enviar los operarios recomendados
    if (onSelectOperarios) {
      onSelectOperarios(recomendacionesUnicas)
    }
  }

  // Generar recomendaciones cuando cambia la demanda
  useEffect(() => {
    if (demandaProxima) {
      generarRecomendaciones()
    }
  }, [demandaProxima])

  // Color según potencial
  const getPotencialColor = (potencial: string) => {
    switch (potencial) {
      case "Excelente":
        return "text-green-600"
      case "Bueno":
        return "text-blue-600"
      case "Promedio":
        return "text-gray-600"
      case "Regular":
        return "text-yellow-600"
      case "Pobre":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  // Badge según eficiencia
  const getEficienciaBadge = (eficiencia: number) => {
    if (eficiencia >= 110) return <Badge className="bg-green-500">Excelente</Badge>
    if (eficiencia >= 100) return <Badge className="bg-blue-500">Buena</Badge>
    if (eficiencia >= 90) return <Badge className="bg-yellow-500">Regular</Badge>
    return <Badge className="bg-red-500">Baja</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gestión de Operarios
          </CardTitle>
          <CardDescription>
            Analiza la eficiencia de los operarios y recibe recomendaciones para asignación óptima
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filtros y controles */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <Label>Filtrar operarios</Label>
              <Select value={filtro} onValueChange={setFiltro}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los operarios</SelectItem>
                  <SelectItem value="contratados">Contratados</SelectItem>
                  <SelectItem value="disponibles">Disponibles</SelectItem>
                  <SelectItem value="excelentes">Potencial excelente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Label>Ordenar por producción</Label>
              <Select value={productoSeleccionado} onValueChange={setProductoSeleccionado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="X">Producto X (50 unid/h)</SelectItem>
                  <SelectItem value="Y">Producto Y (40 unid/h)</SelectItem>
                  <SelectItem value="Z">Producto Z (30 unid/h)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={generarRecomendaciones} className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Generar Recomendaciones
              </Button>
            </div>
          </div>

          {/* Información de demanda si está disponible */}
          {demandaProxima && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Demanda para Período {demandaProxima.periodo}
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Producto X:</span>
                  <p className="font-semibold">{demandaProxima.X} unidades</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Producto Y:</span>
                  <p className="font-semibold">{demandaProxima.Y} unidades</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Producto Z:</span>
                  <p className="font-semibold">{demandaProxima.Z} unidades</p>
                </div>
              </div>
            </div>
          )}

          {/* Tabla de operarios */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-2 text-left">ID</th>
                  <th className="border border-gray-300 p-2 text-left">Potencial</th>
                  <th className="border border-gray-300 p-2 text-center">Experiencia</th>
                  <th className="border border-gray-300 p-2 text-center">Eficiencia</th>
                  <th className="border border-gray-300 p-2 text-center">Prod. X/hora</th>
                  <th className="border border-gray-300 p-2 text-center">Prod. Y/hora</th>
                  <th className="border border-gray-300 p-2 text-center">Prod. Z/hora</th>
                  <th className="border border-gray-300 p-2 text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {operariosFiltrados.map((operario) => (
                  <tr
                    key={operario.id}
                    className={`hover:bg-gray-50 ${
                      operariosRecomendados.some((op) => op.id === operario.id) ? "bg-green-50" : ""
                    }`}
                  >
                    <td className="border border-gray-300 p-2 font-medium">
                      {operario.id}
                      {operariosRecomendados.some((op) => op.id === operario.id) && (
                        <Badge variant="outline" className="ml-2">
                          Recomendado
                        </Badge>
                      )}
                    </td>
                    <td className={`border border-gray-300 p-2 ${getPotencialColor(operario.potencial)}`}>
                      {operario.potencial}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <div className="text-xs">
                        <span>{operario.diasSinEntrenamiento + operario.diasConEntrenamiento} días totales</span>
                        <br />
                        <span className="text-blue-600">{operario.diasConEntrenamiento} con entrenamiento</span>
                      </div>
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      {getEficienciaBadge(operario.eficiencia)}
                      <div className="text-xs mt-1">{operario.eficiencia}%</div>
                    </td>
                    <td className="border border-gray-300 p-2 text-center font-mono">{operario.produccionPorHora.X}</td>
                    <td className="border border-gray-300 p-2 text-center font-mono">{operario.produccionPorHora.Y}</td>
                    <td className="border border-gray-300 p-2 text-center font-mono">{operario.produccionPorHora.Z}</td>
                    <td className="border border-gray-300 p-2 text-center">
                      {operario.contratado ? (
                        <Badge variant="default">Contratado</Badge>
                      ) : (
                        <Badge variant="outline">Disponible</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recomendaciones */}
          {operariosRecomendados.length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-green-600" />
                Recomendaciones para la Demanda Actual
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-green-700">
                  Basado en la demanda próxima, te recomendamos utilizar los siguientes operarios:
                </p>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  {operariosRecomendados.map((op) => (
                    <div key={op.id} className="p-3 bg-white rounded-lg border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Operario #{op.id}</span>
                        <Badge>{op.eficiencia}%</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {op.potencial} • Recomendado para {op.recomendadoPara}
                      </p>
                      <div className="text-xs mt-2 text-gray-500">
                        Producción: X={op.produccionPorHora.X}, Y={op.produccionPorHora.Y}, Z={op.produccionPorHora.Z}{" "}
                        unid/h
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
