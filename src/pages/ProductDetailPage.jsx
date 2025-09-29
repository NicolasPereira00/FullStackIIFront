import { useEffect, useState } from 'react';
import { getProduct } from '../api/products';
import { startCart, addItem } from '../api/cart';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [p, setP] = useState(null);
  const [variantId, setVariantId] = useState(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => setP(await getProduct(id)))();
  }, [id]);

  async function handleAdd() {
    try {
      setMsg('');
      if (!user?.customerId) {
        setMsg('Faça login como CUSTOMER para comprar.');
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
      setMsg(e?.response?.data?.error || 'Erro ao adicionar.');
    }
  }

  if (!p) return <div style={{padding:16}}>Carregando...</div>;

  return (
    <div style={{padding:16}}>
      <h2>{p.name}</h2>
      <p>{p.description}</p>
      <div>Preço: <strong>R$ {Number(p.price).toFixed(2)}</strong></div>

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
      {msg && <p style={{marginTop:8}}>{msg}</p>}
    </div>
  );
}
