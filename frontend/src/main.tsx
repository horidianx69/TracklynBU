import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import ThemeProvider from "@/components/theme-provider"
import "./index.css"
import { BrowserRouter } from "react-router"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="system">
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)

