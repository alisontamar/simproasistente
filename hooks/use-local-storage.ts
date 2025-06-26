"use client"

import { useState } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para almacenar nuestro valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }
    try {
      // Obtener del localStorage por clave
      const item = window.localStorage.getItem(key)
      // Parsear JSON almacenado o devolver initialValue si no existe
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // Si hay error, devolver initialValue
      console.log(error)
      return initialValue
    }
  })

  // Función para actualizar el estado
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permitir que value sea una función para tener la misma API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      // Guardar estado
      setStoredValue(valueToStore)
      // Guardar en localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      // Un error más avanzado de manejo sería implementar aquí
      console.log(error)
    }
  }

  return [storedValue, setValue] as const
}
