import "@orbit/ui/styles.css";
import "./styles.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  ORBIT_THEME_STORAGE_KEY,
  ThemeProvider,
} from "@orbit/ui/theme-provider";
import { AnchoredToastProvider, ToastProvider } from "@orbit/ui/toast";
import { App } from "./App";

try {
  localStorage.setItem(ORBIT_THEME_STORAGE_KEY, "dark");
  document.documentElement.classList.add("dark");
} catch {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider limit={5} position="top-right" timeout={12_000}>
        <AnchoredToastProvider>
          <App />
        </AnchoredToastProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
);
