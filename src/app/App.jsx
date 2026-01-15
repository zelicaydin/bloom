import { AuthProvider } from "../store/AuthContext";
import { CartProvider } from "../store/CartContext";
import { NotificationProvider } from "../store/NotificationContext";
import { ProductsProvider } from "../store/ProductsContext";
import AppRouter from "./router"; // our router.jsx file

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ProductsProvider>
          <CartProvider>
            <AppRouter /> 
          </CartProvider>
        </ProductsProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
