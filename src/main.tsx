import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { installNativeHaptics } from "./lib/native";
import "./index.css";

installNativeHaptics();

createRoot(document.getElementById("root")!).render(<App />);
