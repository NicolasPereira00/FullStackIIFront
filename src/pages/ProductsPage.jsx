import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listProducts } from "../api/products";
import { listBrands } from "../api/brands";
import { listCategories } from "../api/categories";

function money(n) {
  return Number(n || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ProductsPage() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [q, setQ] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sort, setSort] = useState("relevance");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    (async () => {
      try {
        const [bs, cs] = await Promise.all([listBrands(), listCategories()]);
        setBrands(Array.isArray(bs) ? bs : bs?.data || []);
        setCategories(Array.isArray(cs) ? cs : cs?.data || []);
      } catch {
      }
    })();
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        setErr("");
        const params = {
          q: q || undefined,
          brandId: brandId || undefined,
          categoryId: categoryId || undefined,
          priceMin: priceMin || undefined,
          priceMax: priceMax || undefined,
          sort: sort !== "relevance" ? sort : undefined,
          page,
          pageSize,
        };
        const res = await listProducts(params);
        const list = Array.isArray(res) ? res : res?.data || [];
        const m = Array.isArray(res) ? {} : res?.meta || {};
        setItems(list);
        setMeta(m);
      } catch (e) {
        setErr(
          e?.response?.data?.error || e?.message || "Falha ao carregar produtos."
        );
        setItems([]);
        setMeta({});
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [q, brandId, categoryId, priceMin, priceMax, sort, page, pageSize]);

  const totalPages = useMemo(() => {
    if (meta.totalPages) return Number(meta.totalPages);
    if (meta.total && (meta.pageSize || pageSize)) {
      return Math.max(
        1,
        Math.ceil(Number(meta.total) / Number(meta.pageSize || pageSize))
      );
    }
    return 1;
  }, [meta, pageSize]);

  function resetAndSearch() {
    setPage(1);
  }

  return (
    <div className="fade-in">
      <h2 className="mb-2">Produtos</h2>

      <div
        className="grid mb-3"
        style={{
          gridTemplateColumns:
            "2fr 1fr 1fr minmax(140px,1fr) minmax(140px,1fr) 1fr",
          gap: "0.5rem",
          alignItems: "center",
        }}
      >
        <input
          className="form-control"
          placeholder="Buscar..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            resetAndSearch();
          }}
        />

        <select
          className="form-control"
          value={brandId}
          onChange={(e) => {
            setBrandId(e.target.value);
            resetAndSearch();
          }}
        >
          <option value="">Marca</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          className="form-control"
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            resetAndSearch();
          }}
        >
          <option value="">Categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          className="form-control"
          type="number"
          min="0"
          placeholder="Preço mín."
          value={priceMin}
          onChange={(e) => {
            setPriceMin(e.target.value);
            resetAndSearch();
          }}
        />

        <input
          className="form-control"
          type="number"
          min="0"
          placeholder="Preço máx."
          value={priceMax}
          onChange={(e) => {
            setPriceMax(e.target.value);
            resetAndSearch();
          }}
        />

        <select
          className="form-control"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            resetAndSearch();
          }}
        >
          <option value="relevance">Ordenar</option>
          <option value="price_asc">Menor preço</option>
          <option value="price_desc">Maior preço</option>
          <option value="name_asc">Nome A-Z</option>
          <option value="name_desc">Nome Z-A</option>
        </select>
      </div>

      {err && <div className="alert alert-error mb-2">{err}</div>}
      {loading && <div className="spinner" />}

      {!loading && items.length > 0 && (
        <div className="products-grid">
          {items.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="card product-card">
              <div className="product-thumb">
                <img
                  src={p.images?.[0]?.url || "/placeholder.png"}
                  alt={p.name}
                  loading="lazy"
                />
              </div>
              <div>
                <h3 className="product-title">{p.name}</h3>
                <p className="product-sub muted">
                  {p.brand?.name || "Genérica"}
                  {p.category ? ` • ${p.category.name}` : ""}
                </p>
                <strong className="product-price">{money(p.price)}</strong>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && !items.length && !err && (
        <div className="card">
          <h3 className="mb-2">Nenhum produto encontrado</h3>
          <p className="mb-2">Tente ajustar os filtros ou pesquisar por outro termo.</p>
          {user?.role === "SELLER" && (
            <Link to="/admin/products/new" className="btn btn-primary">
              + Adicionar produto
            </Link>
          )}
        </div>
      )}

      {!loading && (
        <div className="d-flex align-center gap-2 mt-2">
          <button
            className="btn btn-outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button
            className="btn btn-outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Próxima
          </button>

          <span className="text-right" style={{ marginLeft: "auto" }}>
            Por página:
          </span>
          <select
            className="form-control"
            style={{ maxWidth: 100 }}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {[12, 24, 48].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      )}

      {user?.role === "SELLER" && (
        <Link to="/admin/products/new" className="fab btn btn-primary">
          + Adicionar
        </Link>
      )}
    </div>
  );
}
