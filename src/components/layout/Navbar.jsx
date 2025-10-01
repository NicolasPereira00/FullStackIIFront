import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav>
      {/* Botão hamburger (só no mobile) */}
      <button
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menu"
      >
        {menuOpen ? "✖" : "☰"}
      </button>

      {/* Links principais */}
      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        <NavLink to="/products" onClick={closeMenu}>Produtos</NavLink>
        <NavLink to="/cart" onClick={closeMenu}>Carrinho</NavLink>

        {user?.role === "CUSTOMER" && (
          <>
            <NavLink to="/orders" onClick={closeMenu}>Pedidos</NavLink>
            <NavLink to="/addresses" onClick={closeMenu}>Endereços</NavLink>
          </>
        )}

        {user?.role === "SELLER" && (
          <>
            <NavLink to="/admin/products" onClick={closeMenu}>Admin</NavLink>
            <NavLink to="/admin/orders" onClick={closeMenu}>Pedidos</NavLink>
            <NavLink to="/admin/brands" onClick={closeMenu}>Marcas</NavLink>
            <NavLink to="/admin/categories" onClick={closeMenu}>Categorias</NavLink>
          </>
        )}

        <div className="nav-user">
          {user?.role === "SELLER" && (
            <Link
              to="/admin/products/new"
              className="nav-btn nav-btn-primary"
              onClick={closeMenu}
            >
              + Adicionar
            </Link>
          )}

          {user && (
            <NavLink to="/profile" className="nav-btn" onClick={closeMenu}>
              Perfil
            </NavLink>
          )}

          {user ? (
            <>
              <span>Olá, {user.name || user.email} ({user.role})</span>
              <button
                className="nav-btn"
                onClick={() => {
                  logout();
                  closeMenu();
                }}
              >
                Sair
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className="nav-btn nav-btn-primary"
              onClick={closeMenu}
            >
              Entrar
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
