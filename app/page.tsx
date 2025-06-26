"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Calculator, TrendingUp, Settings, Lightbulb, Users, Target } from "lucide-react"
import InstructivoSection from "@/components/instructivo-section"
import CalculadoraDecisiones from "@/components/calculadora-decisiones"
import AnalisisEficiencia from "@/components/analisis-eficiencia"
import PlanificadorPeriodos from "@/components/planificador-periodos"
import ConsejosOptimizacion from "@/components/consejos-optimizacion"
import GestionOperarios from "@/components/gestion-operarios"
import EficienciaVsEstandar from "@/components/eficiencia-vs-estandar"

export default function SimproAssistant() {
  const [activeTab, setActiveTab] = useState("instructivo")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header - Responsive */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">LABSAG SIMPRO Asistente</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 px-4">
            Tu guía completa para dominar el simulador de Gerencia de Operaciones
          </p>

          {/* Badges - Responsive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:justify-center gap-2 px-4">
            <Badge variant="secondary" className="text-xs sm:text-sm flex items-center justify-center gap-1 p-2">
              <Target className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Cumplimiento de</span>
              <span>Demanda</span>
            </Badge>
            <Badge variant="secondary" className="text-xs sm:text-sm flex items-center justify-center gap-1 p-2">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Eficiencia vs</span>
              <span>Estándar</span>
            </Badge>
            <Badge variant="secondary" className="text-xs sm:text-sm flex items-center justify-center gap-1 p-2">
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Instructivo</span>
              <span className="sm:hidden">Guía</span>
            </Badge>
            <Badge variant="secondary" className="text-xs sm:text-sm flex items-center justify-center gap-1 p-2">
              <Calculator className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Calculadoras</span>
              <span className="sm:hidden">Calc</span>
            </Badge>
            <Badge variant="secondary" className="text-xs sm:text-sm flex items-center justify-center gap-1 p-2">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Gestión de</span>
              <span>Operarios</span>
            </Badge>
            <Badge variant="secondary" className="text-xs sm:text-sm flex items-center justify-center gap-1 p-2">
              <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Consejos</span>
              <span className="sm:hidden">Tips</span>
            </Badge>
          </div>
        </div>

        {/* Main Navigation - Responsive */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Desktop Navigation */}
          <TabsList className="hidden lg:grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="instructivo" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Instructivo
            </TabsTrigger>
            <TabsTrigger value="eficiencia" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Eficiencia vs Estándar
            </TabsTrigger>
            <TabsTrigger value="calculadora" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Calculadora
            </TabsTrigger>
            <TabsTrigger value="operarios" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Operarios
            </TabsTrigger>
            <TabsTrigger value="planificador" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Planificador
            </TabsTrigger>
            <TabsTrigger value="consejos" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Consejos
            </TabsTrigger>
          </TabsList>

          {/* Tablet Navigation */}
          <TabsList className="hidden md:grid lg:hidden w-full grid-cols-3 gap-2 mb-8">
            <TabsTrigger value="instructivo" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Instructivo</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="eficiencia" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Eficiencia</span>
              <span className="sm:hidden">Análisis</span>
            </TabsTrigger>
            <TabsTrigger value="calculadora" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Calculadora</span>
              <span className="sm:hidden">Calc</span>
            </TabsTrigger>
          </TabsList>

          <TabsList className="hidden md:grid lg:hidden w-full grid-cols-3 gap-2 mb-8">
            <TabsTrigger value="operarios" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Operarios</span>
              <span className="sm:hidden">RRHH</span>
            </TabsTrigger>
            <TabsTrigger value="planificador" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Planificador</span>
              <span className="sm:hidden">Plan</span>
            </TabsTrigger>
            <TabsTrigger value="consejos" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Consejos</span>
              <span className="sm:hidden">Tips</span>
            </TabsTrigger>
          </TabsList>

          {/* Mobile Navigation - Dropdown Style */}
          <div className="md:hidden mb-8">
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="instructivo">📖 Instructivo</option>
                <option value="eficiencia">📊 Eficiencia vs Estándar</option>
                <option value="calculadora">🧮 Calculadora</option>
                <option value="operarios">👥 Gestión Operarios</option>
                <option value="planificador">⚙️ Planificador</option>
                <option value="consejos">💡 Consejos</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Mobile Tab Indicator */}
            <div className="mt-4 flex items-center justify-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
                {activeTab === "instructivo" && <BookOpen className="w-4 h-4 text-blue-600" />}
                {activeTab === "eficiencia" && <TrendingUp className="w-4 h-4 text-blue-600" />}
                {activeTab === "calculadora" && <Calculator className="w-4 h-4 text-blue-600" />}
                {activeTab === "operarios" && <Users className="w-4 h-4 text-blue-600" />}
                {activeTab === "planificador" && <Settings className="w-4 h-4 text-blue-600" />}
                {activeTab === "consejos" && <Lightbulb className="w-4 h-4 text-blue-600" />}
                <span className="text-sm font-medium text-blue-800">
                  {activeTab === "instructivo" && "Instructivo"}
                  {activeTab === "eficiencia" && "Eficiencia vs Estándar"}
                  {activeTab === "calculadora" && "Calculadora"}
                  {activeTab === "operarios" && "Gestión Operarios"}
                  {activeTab === "planificador" && "Planificador"}
                  {activeTab === "consejos" && "Consejos"}
                </span>
              </div>
            </div>
          </div>

          <TabsContent value="instructivo">
            <InstructivoSection />
          </TabsContent>

          <TabsContent value="eficiencia">
            <EficienciaVsEstandar />
          </TabsContent>

          <TabsContent value="calculadora">
            <CalculadoraDecisiones />
          </TabsContent>

          <TabsContent value="analisis">
            <AnalisisEficiencia />
          </TabsContent>

          <TabsContent value="operarios">
            <GestionOperarios />
          </TabsContent>

          <TabsContent value="planificador">
            <PlanificadorPeriodos />
          </TabsContent>

          <TabsContent value="consejos">
            <ConsejosOptimizacion />
          </TabsContent>
        </Tabs>

        {/* Footer - Responsive */}
        <div className="mt-8 sm:mt-12 text-center text-gray-500 text-xs sm:text-sm px-4">
          <p>© 2025 SIMPRO Asistente - Herramienta no oficial</p>
          <p className="mt-2">Basado en el Manual del Usuario Básico de LABSAG LTD.</p>
        </div>
      </div>
    </div>
  )
}
