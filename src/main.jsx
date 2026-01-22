import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./styles/index.css";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";

import { AuthProvider } from "./store/AuthContext";
import { CartProvider } from "./store/CartContext";
import { NotificationProvider } from "./store/NotificationContext";
import { ProductsProvider } from "./store/ProductsContext";
import { SubscriptionProvider } from "./store/SubscriptionContext";
import { ReviewsProvider } from "./store/ReviewsContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <ProductsProvider>
          <CartProvider>
            <SubscriptionProvider>
              <ReviewsProvider>
                <App />
              </ReviewsProvider>
            </SubscriptionProvider>
          </CartProvider>
        </ProductsProvider>
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>
);
