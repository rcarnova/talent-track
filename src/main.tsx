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
  createRoot(rootElement).render(<App />);
  console.log("[v0] App rendered successfully");
} else {
  console.error("[v0] Root element not found!");
}
