import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import { Toaster } from "sonner";
import { AuthProvider } from "./auth/AuthContext";

const storedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
const initialTheme =
  storedTheme === "dark" || storedTheme === "light"
    ? storedTheme
    : prefersDark
      ? "dark"
      : "light";

document.documentElement.dataset.theme = initialTheme;
document.documentElement.style.colorScheme = initialTheme;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
