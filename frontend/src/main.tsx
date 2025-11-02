
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ThemeProvider from "@/components/theme-provider";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import ReactQueryProvider from "./provider/react-query-provider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="system">
        <ReactQueryProvider>
          <App />
        </ReactQueryProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);


