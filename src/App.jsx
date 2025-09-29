import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AddressesPage from './pages/AddressesPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';

function Protected({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
function CustomerOnly({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'CUSTOMER') return <div style={{ padding: 16 }}>Acesso restrito a CUSTOMER.</div>;
  return children;
}
function SellerOnly({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'SELLER') return <div style={{ padding: 16 }}>Acesso restrito a SELLER.</div>;
  return children;
}

function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav style={{ display: 'flex', gap: 12, padding: 12, borderBottom: '1px solid #eee' }}>
      <Link to="/products">Produtos</Link>
      <Link to="/cart">Carrinho</Link>

      {user?.role === 'CUSTOMER' && (
        <>
          <Link to="/orders">Pedidos</Link>
          <Link to="/addresses">Endereços</Link>
        </>
      )}

      {user?.role === 'SELLER' && (
        <>
          <Link to="/admin/products">Admin</Link>
          <Link to="/admin/orders">Pedidos</Link>
        </>
      )}

      <div style={{ marginLeft: 'auto' }}>
        {user ? (
          <>
            <span style={{ marginRight: 8 }}>
              Olá, {user.name || user.email} ({user.role})
            </span>
            <button onClick={logout}>Sair</button>
          </>
        ) : (
          <Link to="/login">Entrar</Link>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route
            path="/cart"
            element={
              <Protected>
                <CartPage />
              </Protected>
            }
          />

          <Route
            path="/orders"
            element={
              <CustomerOnly>
                <OrdersPage />
              </CustomerOnly>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <CustomerOnly>
                <OrderDetailPage />
              </CustomerOnly>
            }
          />
          <Route
            path="/addresses"
            element={
              <CustomerOnly>
                <AddressesPage />
              </CustomerOnly>
            }
          />

          <Route
            path="/admin/products"
            element={
              <SellerOnly>
                <AdminProductsPage />
              </SellerOnly>
            }
          />
          <Route
            path="/admin/products/new"
            element={
              <SellerOnly>
                <AdminProductForm />
              </SellerOnly>
            }
          />
          <Route
            path="/admin/products/:id"
            element={
              <SellerOnly>
                <AdminProductForm />
              </SellerOnly>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <SellerOnly>
                <AdminOrdersPage />
              </SellerOnly>
            }
          />
          <Route
            path="/admin/orders/:id"
            element={
              <SellerOnly>
                <AdminOrderDetail />
              </SellerOnly>
            }
          />

          <Route path="*" element={<div style={{ padding: 24 }}>404</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
