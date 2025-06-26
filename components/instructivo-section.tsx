import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Factory, Users, Package, TrendingUp, AlertTriangle, Clock } from "lucide-react"

export default function InstructivoSection() {
  return (
    <div className="space-y-6">
      {/* Introducción */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="w-5 h-5" />
            ¿Qué es LABSAG SIMPRO?
          </CardTitle>
          <CardDescription>Comprende los fundamentos del simulador de gerencia de operaciones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            SIMPRO es un simulador de gerencia de operaciones donde el modelo LABSAG permite aventurarse dentro de cálculos en efeciencia y demanda de x, y y z.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Producto X</h4>
              <p className="text-sm text-blue-700">Producto con producción más rápida</p>
              <Badge variant="outline" className="mt-2">
                50 unid/hora
              </Badge>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Producto Y</h4>
              <p className="text-sm text-green-700">Producto con producción media</p>
              <Badge variant="outline" className="mt-2">
                40 unid/hora
              </Badge>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Producto Z</h4>
              <p className="text-sm text-purple-700">Producto con producción más tardía</p>
              <Badge variant="outline" className="mt-2">
                30 unid/hora
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proceso de Producción */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Proceso de Producción
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold">Línea 1 - Producción Intermedia</h4>
                <p className="text-sm text-gray-600">Materia prima → X', Y', Z' (productos sin terminar)</p>
              </div>
              <Badge>4 Máquinas</Badge>
            </div>

            <div className="flex justify-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-white"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold">Línea 2 - Producto Final</h4>
                <p className="text-sm text-gray-600">X', Y', Z' → X, Y, Z (productos terminados)</p>
              </div>
              <Badge>4 Máquinas</Badge>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Requerimientos de Materia Prima</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>X' (X):</span>
                  <Badge variant="outline">55 unidades</Badge>
                </li>
                <li className="flex justify-between">
                  <span>Y' (Y):</span>
                  <Badge variant="outline">44 unidades</Badge>
                </li>
                <li className="flex justify-between">
                  <span>Z' (Z):</span>
                  <Badge variant="outline">33 unidades</Badge>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Tiempos de Preparación</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>X, X':</span>
                  <Badge variant="outline">1 hora</Badge>
                </li>
                <li className="flex justify-between">
                  <span>Y, Y':</span>
                  <Badge variant="outline">2 horas</Badge>
                </li>
                <li className="flex justify-between">
                  <span>Z, Z':</span>
                  <Badge variant="outline">3 horas</Badge>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gestión de Operarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gestión de Operarios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Disponibilidad</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  • <strong>28 operarios</strong> disponibles en total
                </li>
                <li>
                  • <strong>8 operarios</strong> ya contratados (IDs 1-8)
                </li>
                <li>
                  • <strong>20 operarios</strong> en lista de espera (IDs 9-28)
                </li>
                <li>
                  • Máximo <strong>12 horas</strong> por operario por día
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Costos Laborales</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  • <strong>$2/hora</strong> tiempo normal (hasta 8h)
                </li>
                <li>
                  • <strong>$3/hora</strong> sobretiempo (+8h)
                </li>
                <li>
                  • <strong>$50</strong> costo de contratación
                </li>
                <li>
                  • <strong>$25</strong> costo de despido
                </li>
                <li>
                  • <strong>$8</strong> pago por suspensión
                </li>
                <li>
                  • <strong>$20</strong> costo de entrenamiento
                </li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h5 className="font-semibold text-yellow-800">Reglas Importantes</h5>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                  <li>• Pago mínimo de 4 horas aunque trabajen menos</li>
                  <li>• Despido automático tras 3 días consecutivos sin asignar</li>
                  <li>• Un operario despedido no puede ser recontratado</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decisiones Clave */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Decisiones Clave por Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Inversiones</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  • <strong>Control de Calidad:</strong> $0 - $9,999
                </li>
                <li>
                  • <strong>Mantenimiento:</strong> $0 - $9,999
                </li>
              </ul>

              <h4 className="font-semibold">Materia Prima</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  • <strong>Orden Normal:</strong> $100 + costo MP (llega en 3 días)
                </li>
                <li>
                  • <strong>Orden Express:</strong> $175 + costo MP (llega en 1 día)
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Programación</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  • <strong>Productos en máquinas:</strong> 1=X/X', 2=Y/Y', 3=Z/Z'
                </li>
                <li>
                  • <strong>Asignación de operarios</strong> a cada máquina
                </li>
                <li>
                  • <strong>Horas programadas</strong> por operario
                </li>
                <li>
                  • <strong>Entrenamiento</strong> de operarios
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Costos Estándar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Costos Estándar y Objetivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900">Producto X</h4>
              <p className="text-2xl font-bold text-blue-700">$2.50</p>
              <p className="text-sm text-blue-600">por unidad</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900">Producto Y</h4>
              <p className="text-2xl font-bold text-green-700">$3.50</p>
              <p className="text-sm text-green-600">por unidad</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900">Producto Z</h4>
              <p className="text-2xl font-bold text-purple-700">$4.50</p>
              <p className="text-sm text-purple-600">por unidad</p>
            </div>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h5 className="font-semibold text-green-800 mb-2">Objetivo Principal</h5>
            <p className="text-sm text-green-700">
              <strong>Minimizar costos totales</strong> manteniendo la eficiencia por encima del 100% comparado con los
              costos estándar. La demanda se entrega cada 3 días (períodos 3, 6, 9, 12...).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
