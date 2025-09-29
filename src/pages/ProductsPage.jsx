import { useEffect, useState } from 'react';
import { listProducts } from '../api/products';
import { Link } from 'react-router-dom';

export default function ProductsPage() {
  const [data, setData] = useState({ data: [], meta: {} });
  const [q, setQ] = useState('');

  useEffect(() => {
    const t = setTimeout(async () => {
      const res = await listProducts(q ? { q } : undefined);
      setData(res);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div style={{padding:16}}>
      <h2>Produtos</h2>
      <input placeholder="Buscar..." value={q} onChange={e=>setQ(e.target.value)} />
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:16, marginTop:16}}>
        {data.data.map(p => (
          <Link key={p.id} to={`/products/${p.id}`} style={{border:'1px solid #eee', padding:12, borderRadius:8, textDecoration:'none', color:'inherit'}}>
            <strong>{p.name}</strong>
            <div style={{opacity:.7}}>{p.brand?.name} · {p.category?.name}</div>
            <div style={{marginTop:8}}>R$ {Number(p.price).toFixed(2)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
