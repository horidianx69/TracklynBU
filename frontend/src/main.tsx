import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import ThemeProvider from "@/components/theme-provider"
import "./index.css"
import { BrowserRouter } from "react-router"
import { AuthProvider } from "./lib/AuthContext"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
    <AuthProvider>
      <ThemeProvider defaultTheme="system">
        <App />
      </ThemeProvider>
    </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)

