import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// Font imports
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
