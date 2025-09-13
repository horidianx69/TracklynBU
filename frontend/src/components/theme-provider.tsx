
"use client"

import { ReactNode, useEffect, useMemo, useState } from "react"

type Theme = "light" | "dark" | "system"

const STORAGE_KEY = "theme"

export default function ThemeProvider({
  defaultTheme = "system",
  children,
}: {
  defaultTheme?: Theme
  children: ReactNode
}) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(STORAGE_KEY) as Theme) || defaultTheme
  )

  // resolve actual theme (system or user choice)
  const resolved = useMemo<"light" | "dark">(() => {
    if (theme !== "system") return theme
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", resolved === "dark")
    localStorage.setItem(STORAGE_KEY, theme)
  }, [resolved, theme])

  // re-check if system theme changes
  useEffect(() => {
    if (theme !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      document.documentElement.classList.toggle("dark", mq.matches)
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [theme])

  return <>{children}</>
}

export function useTheme() {
  const get = (): Theme => (localStorage.getItem(STORAGE_KEY) as Theme) || "system"
  const set = (value: Theme) => localStorage.setItem(STORAGE_KEY, value)
  return { get, set }
}
