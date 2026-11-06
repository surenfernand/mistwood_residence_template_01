import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { PhotoProvider } from "./photos.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PhotoProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PhotoProvider>
  </StrictMode>
);
