import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/sora/400.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";

console.log("[v0] main.tsx loaded, rendering App...");

const rootElement = document.getElementById("root");
console.log("[v0] Root element:", rootElement);

if (rootElement) {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log("[v0] App rendered successfully");
  } catch (error) {
    console.error("[v0] Error rendering App:", error);
    rootElement.innerHTML = `<div style="padding: 20px; color: red;">Error: ${error}</div>`;
  }
} else {
  console.error("[v0] Root element not found!");
}
