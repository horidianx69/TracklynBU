import { type ReactNode, createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

const STORAGE_KEY = "theme"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolved: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export default function ThemeProvider({
  defaultTheme = "system",
  children,
}: {
  defaultTheme?: Theme
  children: ReactNode
}) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(STORAGE_KEY) as Theme) || defaultTheme
  )

  // Derive the actual applied theme
  const getResolved = (t: Theme): "light" | "dark" => {
    if (t !== "system") return t
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }

  const [resolved, setResolved] = useState<"light" | "dark">(() => getResolved(theme))

  const setTheme = (value: Theme) => {
    localStorage.setItem(STORAGE_KEY, value)
    setThemeState(value)
    setResolved(getResolved(value))
  }

  // Apply class to <html> whenever resolved changes
  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark")
  }, [resolved])

  // Listen for system preference changes
  useEffect(() => {
    if (theme !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      const next = mq.matches ? "dark" : "light"
      setResolved(next)
      document.documentElement.classList.toggle("dark", mq.matches)
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolved }}>
      {children}
    </ThemeContext.Provider>
  )
}

// ✅ Single hook — use this everywhere instead of touching localStorage directly
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within a ThemeProvider")
  return context
}