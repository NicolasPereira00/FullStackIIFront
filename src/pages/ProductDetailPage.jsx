import { useEffect, useState } from 'react';
import { getProduct } from '../api/products';
import { startCart, addItem } from '../api/cart';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function money(n) {
  return Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [p, setP] = useState(null);
  const [variantId, setVariantId] = useState(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [hero, setHero] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const prod = await getProduct(id);
        setP(prod);
        const first = prod?.images?.[0]?.url;
        if (first) setHero(first);
      } catch (e) {
        setErr(e?.response?.data?.error || 'Falha ao carregar produto.');
      }
    })();
  }, [id]);

  async function handleAdd() {
    try {
      setMsg('');
      setErr('');
      if (!user?.customerId) {
        setErr('Faça login como CUSTOMER para comprar.');
        return;
      }
      const cart = await startCart(user.customerId);
      await addItem(cart.id, {
        productId: Number(id),
        variantId: variantId ? Number(variantId) : null,
        quantity: Number(qty),
      });
      setMsg('Item adicionado ao carrinho!');
    } catch (e) {
      setErr(e?.response?.data?.error || 'Erro ao adicionar.');
    }
  }

  if (!p) return <div style={{padding:16}}>Carregando...</div>;

  return (
    <div style={{padding:16, display:'grid', gap:16, gridTemplateColumns:'1fr 1fr'}}>
      <div>
        {hero ? (
          <img src={hero} alt="" style={{ width:'100%', height: 360, objectFit:'cover', borderRadius:8, background:'#f2f2f2' }}/>
        ) : (
          <div style={{ width:'100%', height:360, borderRadius:8, background:'#f5f5f5' }}/>
        )}

        {p.images?.length > 1 && (
          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            {p.images.map(img => (
              <button key={img.id} onClick={()=>setHero(img.url)} style={{ border:'1px solid #eee', padding:0, borderRadius:6, overflow:'hidden', width:72, height:72 }}>
                <img src={img.url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 style={{ marginTop:0 }}>{p.name}</h2>
        <div style={{ opacity:.8, marginBottom:6 }}>{p.brand?.name} · {p.category?.name}</div>
        <div style={{ fontSize:22, fontWeight:700, marginBottom:12 }}>{money(p.price)}</div>
        <p style={{ whiteSpace:'pre-wrap' }}>{p.description}</p>

        {p.variants?.length > 0 && (
          <div style={{marginTop:12}}>
            <label>Variante: </label>
            <select value={variantId ?? ''} onChange={e=>setVariantId(e.target.value || null)}>
              <option value="">Selecione</option>
              {p.variants.map(v => (
                <option key={v.id} value={v.id}>
                  {v.size} / {v.color} — estoque {v.stock}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{marginTop:12}}>
          <label>Qtd: </label>
          <input type="number" min={1} value={qty} onChange={e=>setQty(e.target.value)} />
        </div>

        <button style={{marginTop:12}} onClick={handleAdd}>Adicionar ao carrinho</button>

        {msg && <p style={{marginTop:8, color:'seagreen'}}>{msg}</p>}
        {err && <p style={{marginTop:8, color:'tomato'}}>{err}</p>}
      </div>
    </div>
  );
}
