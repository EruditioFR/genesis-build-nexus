import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/i18n";

// Defer font loading to not block initial render
const loadFonts = () => {
  import("@fontsource/playfair-display/400.css");
  import("@fontsource/playfair-display/600.css");
  import("@fontsource/playfair-display/700.css");
  import("@fontsource/dm-sans/400.css");
  import("@fontsource/dm-sans/500.css");
  import("@fontsource/dm-sans/600.css");
  import("@fontsource/dm-sans/700.css");
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
