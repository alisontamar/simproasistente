"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lightbulb, TrendingUp, Users, Settings, AlertTriangle, CheckCircle, Target } from "lucide-react"

interface SituacionActual {
  periodo: number
  eficiencia: number
  inventarioX: number
  inventarioY: number
  inventarioZ: number
  operariosActivos: number
  costosUltimoPeriodo: number
  proximaDemandaDias: number
}

export default function ConsejosOptimizacion() {
  const [situacion, setSituacion] = useState<SituacionActual>({
    periodo: 2,
    eficiencia: 95,
    inventarioX: 0,
    inventarioY: 0,
    inventarioZ: 0,
    operariosActivos: 8,
    costosUltimoPeriodo: 4500,
    proximaDemandaDias: 2,
  })

  const [consejos, setConsejos] = useState<any[]>([])

  const generarConsejos = () => {
    const nuevosConsejos = []

    // Análisis de cumplimiento de demanda (PRIORIDAD MÁXIMA)
    const inventarioTotal = situacion.inventarioX + situacion.inventarioY + situacion.inventarioZ
    if (inventarioTotal < 1000 && situacion.proximaDemandaDias <= 2) {
      nuevosConsejos.push({
        tipo: "critico",
        categoria: "Cumplimiento de Demanda",
        titulo: "¡RIESGO DE NO CUMPLIR DEMANDA!",
        descripcion: `Tienes inventarios bajos (${inventarioTotal} unidades) y la entrega es en ${situacion.proximaDemandaDias} días.`,
        recomendaciones: [
          "URGENTE: Programa sobretiempo inmediatamente",
          "Asigna tus mejores operarios a producción crítica",
          "Considera órdenes express de materia prima",
          "Prioriza productos con mayor déficit",
          "El cumplimiento de demanda es MÁS IMPORTANTE que los costos",
        ],
        icono: <AlertTriangle className="w-5 h-5 text-red-600" />,
      })
    }

    // Análisis de eficiencia (ahora enfocado en cumplimiento)
    if (situacion.eficiencia < 95) {
      nuevosConsejos.push({
        tipo: "critico",
        categoria: "Eficiencia vs Estándar",
        titulo: "Eficiencia Baja - Enfócate en Cumplir Demanda",
        descripcion: `Tu eficiencia del ${situacion.eficiencia}% está baja. El cumplimiento de demanda es clave para mejorarla.`,
        recomendaciones: [
          "PRIORIDAD #1: Cumple 100% de la demanda",
          "Planifica producción con 2-3 días de anticipación",
          "Usa operarios más eficientes para productos críticos",
          "Mantén inventarios suficientes para cumplir entregas",
          "La eficiencia mejora dramáticamente al cumplir demanda",
        ],
        icono: <AlertTriangle className="w-5 h-5 text-red-600" />,
      })
    } else if (situacion.eficiencia > 120) {
      nuevosConsejos.push({
        tipo: "excelente",
        categoria: "Eficiencia vs Estándar",
        titulo: "¡Excelente Eficiencia! Mantén el Cumplimiento",
        descripcion: `Tu eficiencia del ${situacion.eficiencia}% es excelente. Sigue cumpliendo la demanda.`,
        recomendaciones: [
          "Mantén el 100% de cumplimiento de demanda",
          "Documenta tu estrategia exitosa",
          "Continúa con la planificación anticipada",
          "Optimiza costos sin comprometer el cumplimiento",
        ],
        icono: <CheckCircle className="w-5 h-5 text-green-600" />,
      })
    }

    // Análisis de inventarios
    const inventarioTotal2 = situacion.inventarioX + situacion.inventarioY + situacion.inventarioZ
    if (inventarioTotal2 > 2000) {
      nuevosConsejos.push({
        tipo: "advertencia",
        categoria: "Inventarios",
        titulo: "Inventarios Altos",
        descripcion: "Tienes inventarios altos que generan costos de almacenaje innecesarios.",
        recomendaciones: [
          "Reduce la producción de productos con mayor inventario",
          "Enfócate en productos con menor stock",
          "Revisa si puedes cumplir demanda futura sin producir tanto",
        ],
        icono: <Settings className="w-5 h-5 text-yellow-600" />,
      })
    }

    // Análisis de proximidad a entrega
    if (situacion.proximaDemandaDias <= 1) {
      nuevosConsejos.push({
        tipo: "urgente",
        categoria: "Demanda",
        titulo: "¡Entrega Inminente!",
        descripcion: "La próxima entrega es mañana. Asegúrate de tener suficiente producción.",
        recomendaciones: [
          "Programa sobretiempo si es necesario para cumplir demanda",
          "Prioriza productos con mayor déficit",
          "Considera órdenes express de materia prima si falta",
          "Asigna tus mejores operarios a producción crítica",
        ],
        icono: <AlertTriangle className="w-5 h-5 text-red-600" />,
      })
    }

    // Análisis de operarios
    if (situacion.operariosActivos < 6) {
      nuevosConsejos.push({
        tipo: "advertencia",
        categoria: "Recursos Humanos",
        titulo: "Pocos Operarios Activos",
        descripcion: `Solo tienes ${situacion.operariosActivos} operarios activos. Podrías necesitar más.`,
        recomendaciones: [
          "Considera contratar operarios adicionales de la lista de espera",
          "Programa más horas para operarios actuales si es necesario",
          "Evalúa si necesitas entrenar operarios para mejorar eficiencia",
        ],
        icono: <Users className="w-5 h-5 text-yellow-600" />,
      })
    }

    // Consejos generales de optimización
    nuevosConsejos.push({
      tipo: "general",
      categoria: "Estrategia de Cumplimiento",
      titulo: "Estrategias para Cumplir Demanda y Maximizar Eficiencia",
      descripcion: "El cumplimiento de demanda es el factor más importante para la eficiencia vs estándar.",
      recomendaciones: [
        "REGLA DE ORO: Cumple 100% de la demanda siempre",
        "Planifica producción 2-3 días antes de la entrega",
        "Mantén inventarios de seguridad (10-15% extra)",
        "Usa operarios eficientes para productos con mayor demanda",
        "Invierte en mantenimiento para evitar paradas críticas",
        "El cumplimiento de demanda vale más que ahorrar costos",
      ],
      icono: <Target className="w-5 h-5 text-blue-600" />,
    })

    // Consejos específicos por producto
    const costoPromedio =
      situacion.costosUltimoPeriodo / (situacion.inventarioX + situacion.inventarioY + situacion.inventarioZ || 1)
    if (costoPromedio > 3.5) {
      nuevosConsejos.push({
        tipo: "advertencia",
        categoria: "Costos",
        titulo: "Costos Unitarios Altos",
        descripcion: `Tu costo promedio por unidad (${costoPromedio.toFixed(2)}) está por encima del estándar.`,
        recomendaciones: [
          "Prioriza producción de producto X (menor costo estándar: $2.50)",
          "Reduce sobretiempo innecesario",
          "Optimiza uso de materia prima",
          "Mejora eficiencia de operarios con entrenamiento",
        ],
        icono: <TrendingUp className="w-5 h-5 text-red-600" />,
      })
    }

    setConsejos(nuevosConsejos)
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "critico":
        return "border-red-200 bg-red-50"
      case "urgente":
        return "border-red-200 bg-red-50"
      case "advertencia":
        return "border-yellow-200 bg-yellow-50"
      case "excelente":
        return "border-green-200 bg-green-50"
      case "general":
        return "border-blue-200 bg-blue-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case "critico":
        return "destructive"
      case "urgente":
        return "destructive"
      case "advertencia":
        return "secondary"
      case "excelente":
        return "default"
      case "general":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Consejos de Optimización Inteligentes
          </CardTitle>
          <CardDescription>
            Ingresa tu situación actual y recibe consejos personalizados para mejorar tu desempeño
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formulario de situación actual */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Período Actual</Label>
              <Input
                type="number"
                value={situacion.periodo}
                onChange={(e) =>
                  setSituacion({
                    ...situacion,
                    periodo: Number.parseInt(e.target.value) || 2,
                  })
                }
              />
            </div>
            <div>
              <Label>Eficiencia Actual (%)</Label>
              <Input
                type="number"
                value={situacion.eficiencia}
                onChange={(e) =>
                  setSituacion({
                    ...situacion,
                    eficiencia: Number.parseFloat(e.target.value) || 95,
                  })
                }
              />
            </div>
            <div>
              <Label>Operarios Activos</Label>
              <Input
                type="number"
                value={situacion.operariosActivos}
                onChange={(e) =>
                  setSituacion({
                    ...situacion,
                    operariosActivos: Number.parseInt(e.target.value) || 8,
                  })
                }
              />
            </div>
            <div>
              <Label>Días hasta Entrega</Label>
              <Input
                type="number"
                value={situacion.proximaDemandaDias}
                onChange={(e) =>
                  setSituacion({
                    ...situacion,
                    proximaDemandaDias: Number.parseInt(e.target.value) || 2,
                  })
                }
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Inventario X</Label>
              <Input
                type="number"
                value={situacion.inventarioX}
                onChange={(e) =>
                  setSituacion({
                    ...situacion,
                    inventarioX: Number.parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <Label>Inventario Y</Label>
              <Input
                type="number"
                value={situacion.inventarioY}
                onChange={(e) =>
                  setSituacion({
                    ...situacion,
                    inventarioY: Number.parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <Label>Inventario Z</Label>
              <Input
                type="number"
                value={situacion.inventarioZ}
                onChange={(e) =>
                  setSituacion({
                    ...situacion,
                    inventarioZ: Number.parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <Label>Costos Último Período ($)</Label>
              <Input
                type="number"
                value={situacion.costosUltimoPeriodo}
                onChange={(e) =>
                  setSituacion({
                    ...situacion,
                    costosUltimoPeriodo: Number.parseFloat(e.target.value) || 4500,
                  })
                }
              />
            </div>
          </div>

          <Button onClick={generarConsejos} className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Generar Consejos Personalizados
          </Button>
        </CardContent>
      </Card>

      {/* Consejos generados */}
      {consejos.length > 0 && (
        <div className="space-y-4">
          {consejos.map((consejo, index) => (
            <Card key={index} className={getTipoColor(consejo.tipo)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {consejo.icono}
                    <div>
                      <CardTitle className="text-lg">{consejo.titulo}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getTipoBadge(consejo.tipo) as any}>{consejo.categoria}</Badge>
                        <Badge variant="outline" className="text-xs">
                          {consejo.tipo.charAt(0).toUpperCase() + consejo.tipo.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2">{consejo.descripcion}</CardDescription>
              </CardHeader>
              <CardContent>
                <h5 className="font-semibold mb-2">Recomendaciones:</h5>
                <ul className="space-y-1">
                  {consejo.recomendaciones.map((rec: string, recIndex: number) => (
                    <li key={recIndex} className="flex items-start gap-2 text-sm">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Consejos rápidos siempre visibles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Consejos Rápidos Siempre Útiles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-800">✅ Mejores Prácticas</h4>
              <ul className="space-y-2 text-sm">
                <li>• Mantén eficiencia por encima del 100%</li>
                <li>• Planifica con 3 días de anticipación</li>
                <li>• Usa operarios eficientes para productos complejos</li>
                <li>• Balancea inversiones: 70% mantenimiento, 30% calidad</li>
                <li>• Programa productos similares consecutivamente</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-red-800">❌ Errores Comunes</h4>
              <ul className="space-y-2 text-sm">
                <li>• No planificar órdenes de materia prima</li>
                <li>• Mantener inventarios excesivos</li>
                <li>• Cambiar productos frecuentemente (preparaciones)</li>
                <li>• No entrenar operarios nuevos</li>
                <li>• Ignorar la demanda pronosticada</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
