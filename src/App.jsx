import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Navbar from "./components/layout/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";

import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import AddressesPage from "./pages/AddressesPage";
import ProfilePage from "./pages/ProfilePage";

import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminBrandsPage from "./pages/admin/AdminBrandsPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";

function Protected({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
function CustomerOnly({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "CUSTOMER")
    return (
      <div className="container">
        <div className="alert alert-warning">Acesso restrito a CUSTOMER.</div>
      </div>
    );
  return children;
}
function SellerOnly({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "SELLER")
    return (
      <div className="container">
        <div className="alert alert-warning">Acesso restrito a SELLER.</div>
      </div>
    );
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <ErrorBoundary>
          <main className="container">
            <Routes>
              <Route path="/" element={<Navigate to="/products" replace />} />

              <Route path="/login" element={<LoginPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />

              <Route path="/cart" element={<Protected><CartPage /></Protected>} />
              <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />

              <Route path="/orders" element={<CustomerOnly><OrdersPage /></CustomerOnly>} />
              <Route path="/orders/:id" element={<CustomerOnly><OrderDetailPage /></CustomerOnly>} />
              <Route path="/addresses" element={<CustomerOnly><AddressesPage /></CustomerOnly>} />

              <Route path="/admin/products" element={<SellerOnly><AdminProductsPage /></SellerOnly>} />
              <Route path="/admin/products/new" element={<SellerOnly><AdminProductForm /></SellerOnly>} />
              <Route path="/admin/products/:id" element={<SellerOnly><AdminProductForm /></SellerOnly>} />
              <Route path="/admin/orders" element={<SellerOnly><AdminOrdersPage /></SellerOnly>} />
              <Route path="/admin/orders/:id" element={<SellerOnly><AdminOrderDetail /></SellerOnly>} />
              <Route path="/admin/brands" element={<SellerOnly><AdminBrandsPage /></SellerOnly>} />
              <Route path="/admin/categories" element={<SellerOnly><AdminCategoriesPage /></SellerOnly>} />

              <Route
                path="*"
                element={
                  <div className="card">
                    <h2 className="mb-2">404 • Página não encontrada</h2>
                    <p className="mb-2">A rota acessada não existe.</p>
                    <Link className="btn btn-primary" to="/products">Voltar para produtos</Link>
                  </div>
                }
              />
            </Routes>
          </main>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}
