import { NavLink } from "react-router-dom";

export default function AdminLayout({ title, actions, children }) {
  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <aside className="admin-sidebar slide-in">
        <div className="sidebar-brand">Admin</div>
        <nav className="sidebar-nav">
          <NavLink to="/admin/products" className="sidebar-link">Produtos</NavLink>
          <NavLink to="/admin/orders" className="sidebar-link">Pedidos</NavLink>
          <NavLink to="/admin/brands" className="sidebar-link">Marcas</NavLink>
          <NavLink to="/admin/categories" className="sidebar-link">Categorias</NavLink>
        </nav>
      </aside>

      <main className="admin-content container fade-in">
        <header className="d-flex align-center justify-between mb-3">
          <h1>{title}</h1>
          <div className="d-flex gap-2">{actions}</div>
        </header>
        <section className="card">{children}</section>
      </main>
    </div>
  );
}
