import { useEffect, useMemo, useState } from 'react';
import { listProducts } from '../api/products';
import { listBrands } from '../api/brands';
import { listCategories } from '../api/categories';
import { Link } from 'react-router-dom';

function money(n) {
  return Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [q, setQ] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sort, setSort] = useState('relevance');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    (async () => {
      try {
        const [bs, cs] = await Promise.all([listBrands(), listCategories()]);
        setBrands(Array.isArray(bs) ? bs : (bs?.data || []));
        setCategories(Array.isArray(cs) ? cs : (cs?.data || []));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        setErr('');
        const params = {
          q: q || undefined,
          brandId: brandId || undefined,
          categoryId: categoryId || undefined,
          priceMin: priceMin || undefined,
          priceMax: priceMax || undefined,
          sort: sort !== 'relevance' ? sort : undefined,
          page,
          pageSize
        };
        const res = await listProducts(params);
        const list = Array.isArray(res) ? res : (res?.data || []);
        const m = Array.isArray(res) ? {} : (res?.meta || {});
        setItems(list);
        setMeta(m);
      } catch (e) {
        setErr(e?.response?.data?.error || e?.message || 'Falha ao carregar produtos.');
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
      return Math.max(1, Math.ceil(Number(meta.total) / Number(meta.pageSize || pageSize)));
    }
    return 1;
  }, [meta, pageSize]);

  function resetAndSearch() {
    setPage(1);
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Produtos</h2>

      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', alignItems: 'center' }}>
        <input placeholder="Buscar..." value={q} onChange={e => { setQ(e.target.value); resetAndSearch(); }} />
        <select value={brandId} onChange={e => { setBrandId(e.target.value); resetAndSearch(); }}>
          <option value="">Marca</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={categoryId} onChange={e => { setCategoryId(e.target.value); resetAndSearch(); }}>
          <option value="">Categoria</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="number" min="0" placeholder="Preço mín." value={priceMin}
               onChange={e => { setPriceMin(e.target.value); resetAndSearch(); }} />
        <input type="number" min="0" placeholder="Preço máx." value={priceMax}
               onChange={e => { setPriceMax(e.target.value); resetAndSearch(); }} />
        <select value={sort} onChange={e => { setSort(e.target.value); resetAndSearch(); }}>
          <option value="relevance">Ordenar</option>
          <option value="price_asc">Menor preço</option>
          <option value="price_desc">Maior preço</option>
          <option value="name_asc">Nome A-Z</option>
          <option value="name_desc">Nome Z-A</option>
        </select>
      </div>

      <div style={{ marginTop: 8 }}>
        {err && <span style={{ color: 'tomato' }}>{err}</span>}
        {loading && <span> Carregando…</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 16, marginTop: 16 }}>
        {items.map(p => (
          <Link key={p.id} to={`/products/${p.id}`} style={{ border: '1px solid #eee', padding: 12, borderRadius: 8, textDecoration: 'none', color: 'inherit', background:'#fff' }}>
            {p.images?.[0]?.url && (
              <img src={p.images[0].url} alt="" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }} />
            )}
            <strong style={{ display:'block', marginBottom:4 }}>{p.name}</strong>
            <div style={{ opacity: .7, fontSize: 13 }}>{p.brand?.name} · {p.category?.name}</div>
            <div style={{ marginTop: 8, fontWeight: 600 }}>{money(p.price)}</div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems:'center', marginTop: 16 }}>
        <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</button>
        <span>Página {page} de {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Próxima</button>
        <span style={{ marginLeft: 'auto' }}>Por página:</span>
        <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
          {[12, 24, 48].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {!loading && !items.length && !err && <div style={{ marginTop: 12 }}>Nenhum produto encontrado.</div>}
    </div>
  );
}
