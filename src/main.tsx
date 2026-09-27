import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { SocketProvider } from "./hooks/useSocket";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <SocketProvider>
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  </SocketProvider>,
);
