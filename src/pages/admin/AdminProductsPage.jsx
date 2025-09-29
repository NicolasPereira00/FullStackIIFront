import { useEffect, useState } from 'react';
import { adminListProducts, adminDeleteProduct } from '../../api/products.admin';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminProductsPage() {
  const [data, setData] = useState({ data: [], meta: {} });
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        setErr('');
        const res = await adminListProducts(q ? { q } : undefined);
        setData(res);
      } catch (e) {
        setErr(e?.response?.data?.error || 'Falha ao carregar produtos.');
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  async function del(id){
    if(!confirm('Excluir produto?')) return;
    try {
      setErr('');
      await adminDeleteProduct(id);
      const res = await adminListProducts(q ? { q } : undefined);
      setData(res);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Falha ao excluir.');
    }
  }

  return (
    <div style={{padding:16}}>
      <h2>Produtos (Admin)</h2>
      <div style={{display:'flex', gap:8}}>
        <input placeholder="Buscar..." value={q} onChange={e=>setQ(e.target.value)}/>
        <button onClick={()=>nav('/admin/products/new')}>+ Novo</button>
      </div>

      {err && <div style={{color:'tomato', marginTop:12}}>{err}</div>}
      {loading && <div style={{marginTop:12}}>Carregando…</div>}

      <div style={{display:'grid', gap:12, marginTop:12}}>
        {data.data.map(p => (
          <div key={p.id} style={{border:'1px solid #eee', padding:12, borderRadius:8, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <b>{p.name}</b> — R$ {Number(p.price).toFixed(2)}
              <div style={{opacity:.7}}>{p.brand?.name} · {p.category?.name}</div>
            </div>
            <div style={{display:'flex', gap:8}}>
              <Link to={`/admin/products/${p.id}`}>Editar</Link>
              <button onClick={()=>del(p.id)}>Excluir</button>
            </div>
          </div>
        ))}
        {!loading && !data.data.length && <div>Nenhum produto encontrado.</div>}
      </div>
    </div>
  );
}
