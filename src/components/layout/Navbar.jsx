import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav>
      <NavLink to="/products">Produtos</NavLink>
      <NavLink to="/cart">Carrinho</NavLink>

      {user?.role === "CUSTOMER" && (
        <>
          <NavLink to="/orders">Pedidos</NavLink>
          <NavLink to="/addresses">Endereços</NavLink>
        </>
      )}

      {user?.role === "SELLER" && (
        <>
          <NavLink to="/admin/products">Admin</NavLink>
          <NavLink to="/admin/orders">Pedidos</NavLink>
          <NavLink to="/admin/brands">Marcas</NavLink>
          <NavLink to="/admin/categories">Categorias</NavLink>
        </>
      )}

      <div className="nav-user">
        {user?.role === "SELLER" && (
          <Link to="/admin/products/new" className="nav-btn nav-btn-primary">
            + Adicionar
          </Link>
        )}

        {user && <NavLink to="/profile" className="nav-btn">Perfil</NavLink>}
        {user ? (
          <>
            <span>Olá, {user.name || user.email} ({user.role})</span>
            <button className="nav-btn" onClick={logout}>Sair</button>
          </>
        ) : (
          <NavLink to="/login" className="nav-btn nav-btn-primary">Entrar</NavLink>
        )}
      </div>
    </nav>
  );
}
