import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/i18n";

// Defer font loading to not block initial render
const loadFonts = () => {
  import("@fontsource/playfair-display/400.css");
  import("@fontsource/playfair-display/600.css");
  import("@fontsource/playfair-display/700.css");
  import("@fontsource/inter/400.css");
  import("@fontsource/inter/500.css");
  import("@fontsource/inter/600.css");
};

// Load fonts after initial render
if (typeof window !== 'undefined') {
  if (document.readyState === 'complete') {
    loadFonts();
  } else {
    window.addEventListener('load', loadFonts);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
