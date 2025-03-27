import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";
import { WhatsAppProvider } from "./context/WhatsAppContext";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <WhatsAppProvider>
      <App />
    </WhatsAppProvider>
  </ThemeProvider>
);
