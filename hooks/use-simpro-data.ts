import { useLocalStorage } from "./use-local-storage"

export interface SimproData {
  periodos: any[]
  operarios: any[]
  configuracion: {
    costosEstandar: { X: number; Y: number; Z: number }
    factorSeguridad: number
    horasEstandar: number
  }
  ultimaActualizacion: string
}

const defaultData: SimproData = {
  periodos: [],
  operarios: [],
  configuracion: {
    costosEstandar: { X: 2.5, Y: 3.5, Z: 4.5 },
    factorSeguridad: 0.15,
    horasEstandar: 10,
  },
  ultimaActualizacion: new Date().toISOString(),
}

export function useSimproData() {
  const [data, setData] = useLocalStorage<SimproData>("simpro-data", defaultData)

  const actualizarPeriodos = (periodos: any[]) => {
    setData((prev) => ({
      ...prev,
      periodos,
      ultimaActualizacion: new Date().toISOString(),
    }))
  }

  const actualizarOperarios = (operarios: any[]) => {
    setData((prev) => ({
      ...prev,
      operarios,
      ultimaActualizacion: new Date().toISOString(),
    }))
  }

  const actualizarConfiguracion = (configuracion: Partial<SimproData["configuracion"]>) => {
    setData((prev) => ({
      ...prev,
      configuracion: { ...prev.configuracion, ...configuracion },
      ultimaActualizacion: new Date().toISOString(),
    }))
  }

  const limpiarDatos = () => {
    setData(defaultData)
  }

  const exportarDatos = () => {
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `simpro-data-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importarDatos = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string)
          setData(importedData)
          resolve()
        } catch (error) {
          reject(error)
        }
      }
      reader.readAsText(file)
    })
  }

  return {
    data,
    actualizarPeriodos,
    actualizarOperarios,
    actualizarConfiguracion,
    limpiarDatos,
    exportarDatos,
    importarDatos,
  }
}
