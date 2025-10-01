import { useEffect, useMemo, useState } from 'react';
import {
  getMyCart,
  ensureCart,
  updateCartItem,
  removeCartItem,
  checkoutCart,
} from '../api/cart.me';
import { listMyAddresses } from '../api/addresses.me';
import { useAuth } from '../context/AuthContext';

function currency(n) {
  return Number(n || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function CartPage() {
  const { user } = useAuth();

  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState('');

  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  async function loadAll() {
    try {
      setLoading(true);
      setErr('');
      setMsg('');

      let currentCart = null;
      try {
        currentCart = await getMyCart();
      } catch (e) {
        if (e?.response?.status === 404) {
          currentCart = await ensureCart().catch(() => null);
        } else {
          throw e;
        }
      }
      setCart(currentCart);

      const as = await listMyAddresses();
      const list = Array.isArray(as) ? as : [];
      setAddresses(list);
      if (list.length && !addressId) setAddressId(String(list[0].id));
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || 'Falha ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) loadAll();
  }, [user]);

  const items = cart?.items ?? [];
  const total = useMemo(
    () =>
      items.reduce(
        (acc, it) => acc + Number(it.unitPrice || 0) * Number(it.quantity || 0),
        0
      ),
    [items]
  );

  async function changeQty(it, q) {
    try {
      setActing(true);
      setErr('');
      const qty = Math.max(1, Number(q) || 1);
      await updateCartItem(it.id, { quantity: qty });
      const fresh = await getMyCart();
      setCart(fresh);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Falha ao atualizar quantidade.');
    } finally {
      setActing(false);
    }
  }

  async function removeLine(it) {
    try {
      setActing(true);
      setErr('');
      await removeCartItem(it.id);
      const fresh = await getMyCart();
      setCart(fresh);
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
      if (!items.length) return;
      if (!addressId) {
        setErr('Selecione um endereço para entrega.');
        return;
      }
      setActing(true);
      const order = await checkoutCart(Number(addressId));
      setMsg(`Pedido #${order.id} criado! Total: ${currency(order.total)}`);
      await loadAll();
    } catch (e) {
      setErr(e?.response?.data?.error || 'Erro no checkout.');
    } finally {
      setActing(false);
    }
  }

  if (!user) {
    return <div style={{ padding: 16 }}>Faça login para ver o carrinho.</div>;
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
            borderBottom: '1px solid #eee',
          }}
        >
          <div style={{ flex: 1 }}>
            <div>
              <strong>{it.product?.name}</strong>
            </div>
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
          <button onClick={() => removeLine(it)} disabled={acting}>
            Remover
          </button>
        </div>
      ))}

      <div style={{ marginTop: 8 }}>
        Total: <strong>{currency(total)}</strong>
      </div>

      <div>
        <h3 style={{ margin: '8px 0' }}>Endereço de entrega</h3>
        {!addresses.length ? (
          <div style={{ opacity: 0.7 }}>Nenhum endereço cadastrado.</div>
        ) : (
          <div style={{ display: 'grid', gap: 6 }}>
            {addresses.map((a) => (
              <label key={a.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="radio"
                  name="addr"
                  value={a.id}
                  checked={String(addressId) === String(a.id)}
                  onChange={() => setAddressId(String(a.id))}
                />
                <span>
                  {a.street}, {a.number} — {a.city}/{a.state} — {a.zipCode}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div>
        <button onClick={doCheckout} disabled={!items.length || !addressId || acting}>
          {acting ? 'Processando…' : 'Fechar pedido'}
        </button>
      </div>
    </div>
  );
}
