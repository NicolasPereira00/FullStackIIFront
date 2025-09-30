import { useEffect, useMemo, useState } from 'react';
import { startCart, listItems, updateItem, removeItem, checkout, clearCachedCartId } from '../api/cart';
import { useAuth } from '../context/AuthContext';
import AddressPicker from '../components/AddressPicker';

function currency(n) {
  return Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CartPage() {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [addressId, setAddressId] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (!user?.customerId) return;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const c = await startCart(user.customerId);
        setCart(c);
        const its = await listItems(c.id);
        setItems(its);
      } catch (e) {
        setErr(e?.response?.data?.error || 'Falha ao carregar carrinho.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.customerId]);

  async function changeQty(it, q) {
    try {
      setActing(true);
      const qty = Math.max(1, Number(q) || 1);
      await updateItem(it.id, { quantity: qty });
      setItems(await listItems(cart.id));
    } catch (e) {
      setErr(e?.response?.data?.error || 'Falha ao atualizar quantidade.');
    } finally {
      setActing(false);
    }
  }

  async function removeLine(it) {
    try {
      setActing(true);
      await removeItem(it.id);
      setItems(await listItems(cart.id));
    } catch (e) {
      setErr(e?.response?.data?.error || 'Falha ao remover item.');
    } finally {
      setActing(false);
    }
  }

  async function doCheckout() {
    try {
      setMsg('');
      setErr('');
      if (!cart?.id || !addressId) return;
      setActing(true);
      const order = await checkout(cart.id, Number(addressId));
      setMsg(`Pedido #${order.id} criado! Total: ${currency(order.total)}`);
      setItems([]);
      clearCachedCartId();
      setCart(null);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Erro no checkout');
    } finally {
      setActing(false);
    }
  }

  const total = useMemo(
    () => items.reduce((acc, it) => acc + Number(it.unitPrice) * it.quantity, 0),
    [items]
  );

  if (!user?.customerId) {
    return <div style={{ padding: 16 }}>Faça login como <b>CUSTOMER</b> para ver o carrinho.</div>;
  }
  if (loading) return <div style={{ padding: 16 }}>Carregando…</div>;

  return (
    <div style={{ padding: 16, display: 'grid', gap: 16 }}>
      <h2>Carrinho</h2>

      {err && <div style={{ color: 'tomato' }}>{err}</div>}
      {msg && <div style={{ color: 'seagreen' }}>{msg}</div>}

      {!items.length && <p>Seu carrinho está vazio.</p>}

      {items.map((it) => (
        <div
          key={it.id}
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px solid #eee'
          }}
        >
          <div style={{ flex: 1 }}>
            <div><strong>{it.product?.name}</strong></div>
            <div style={{ opacity: 0.7 }}>
              {it.variant ? `${it.variant.size}/${it.variant.color}` : 'Sem variante'}
            </div>
            <div>Preço: {currency(it.unitPrice)}</div>
          </div>
          <input
            type="number"
            min={1}
            value={it.quantity}
            onChange={(e) => changeQty(it, e.target.value)}
            style={{ width: 64 }}
            disabled={acting}
          />
          <button onClick={() => removeLine(it)} disabled={acting}>Remover</button>
        </div>
      ))}

      <div style={{ marginTop: 8 }}>
        Total: <strong>{currency(total)}</strong>
      </div>

      <AddressPicker customerId={user.customerId} value={addressId} onChange={setAddressId} />

      <div>
        <button onClick={doCheckout} disabled={!items.length || !addressId || acting}>
          {acting ? 'Processando…' : 'Fechar pedido'}
        </button>
      </div>
    </div>
  );
}
