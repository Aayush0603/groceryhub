import React from "react";

import ReactDOM from "react-dom/client";

import App from "./App";

import "./index.css";

import "./i18n/config";

import CartProvider from "./context/CartContext";

import AuthProvider from "./context/AuthContext";

import { FavoritesProvider } from "./context/FavoritesContext";

ReactDOM.createRoot(
  document.getElementById("root")
).render(

  <React.StrictMode>

    <AuthProvider>

      <FavoritesProvider>
        <CartProvider>

          <App />

        </CartProvider>
      </FavoritesProvider>

  </AuthProvider>

</React.StrictMode>

);