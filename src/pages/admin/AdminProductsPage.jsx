import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { adminListProducts, adminDeleteProduct } from "../../api/products.admin";
import { listBrands } from "../../api/brands";

const money = (n) =>
  Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const toArray = (res) => {
  if (Array.isArray(res)) return res;
  if (res?.data && Array.isArray(res.data)) return res.data;
  if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
  return [];
};

export default function AdminProductsPage() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);

  const [q, setQ] = useState("");
  const [brandId, setBrandId] = useState("");
  const [status, setStatus] = useState("");

  async function fetchAll() {
    try {
      setLoading(true);
      setErr("");

      const [bs, ps] = await Promise.all([
        listBrands(),
        adminListProducts({
          q: q || undefined,
          brandId: brandId || undefined,
          status: status || undefined,
        }),
      ]);

      setBrands(toArray(bs));
      setProducts(toArray(ps));
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.error || e?.message || "Erro ao carregar produtos.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, [q, brandId, status]);

  async function handleDelete(id) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      await adminDeleteProduct(id);
      await fetchAll();
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || "Falha ao excluir.");
    }
  }

  const actions = (
    <>
      <Link className="btn btn-outline" to="/admin/products/new">
        Novo produto
      </Link>
      <button
        className="btn btn-primary"
        type="button"
        onClick={() => alert("Exportar: implemente no backend (CSV/Excel).")}
      >
        Exportar
      </button>
    </>
  );

  const rows = useMemo(() => {
    return products.map((p) => {
      const stockFromVariants = Array.isArray(p.variants)
        ? p.variants.reduce((acc, v) => acc + Number(v.stock || 0), 0)
        : undefined;
      const stock = p.stock ?? p.totalStock ?? stockFromVariants ?? 0;

      return {
        id: p.id,
        name: p.name,
        brand: p.brand?.name || p.brandName || "",
        price: p.price,
        stock,
        status: p.status || "active",
      };
    });
  }, [products]);

  return (
    <AdminLayout title="Produtos" actions={actions}>
      <div className="mb-3 grid grid-3">
        <input
          className="form-control"
          placeholder="Buscar por nome, marca..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="form-control"
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
        >
          <option value="">Todas as marcas</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          className="form-control"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Status</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>
      </div>

      {err && <div className="alert alert-error mb-2">{err}</div>}
      {loading && <div className="spinner" />}

      {!loading && (
        <div className="table">
          <table className="table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Marca</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.brand || "-"}</td>
                  <td>{money(r.price)}</td>
                  <td>
                    {Number(r.stock) > 0 ? (
                      <span className="badge badge-success">{Number(r.stock)} un.</span>
                    ) : (
                      <span className="badge badge-danger">sem estoque</span>
                    )}
                  </td>
                  <td>
                    {String(r.status).toLowerCase() === "active" ||
                    String(r.status).toLowerCase() === "ativo" ? (
                      <span className="badge badge-primary">ATIVO</span>
                    ) : (
                      <span className="badge badge-warning">INATIVO</span>
                    )}
                  </td>
                  <td className="text-right">
                    <Link className="btn btn-outline" to={`/admin/products/${r.id}`}>
                      Editar
                    </Link>
                    <button
                      className="btn btn-danger ml-2"
                      onClick={() => handleDelete(r.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}

              {!rows.length && (
                <tr>
                  <td colSpan={6}>
                    <div className="p-2">Nenhum produto encontrado.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
