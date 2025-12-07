import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // We might not need this if we use App.css, but Vite expects it sometimes.
// Actually we used App.css in App.jsx. Let's keep index.css empty or minimal if it exists.
// We'll delete index.css call if we want, or just leave it.

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
