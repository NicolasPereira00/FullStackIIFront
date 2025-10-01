import { useEffect, useState } from 'react';
import { listMyOrders } from '../api/orders.me';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { money, dateTime } from '../utils/format';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const data = await listMyOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e?.response?.data?.error || e?.message || 'Falha ao carregar pedidos.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  if (!user) return <div style={{ padding: 16 }}>Faça login para ver seus pedidos.</div>;
  if (loading) return <div style={{ padding: 16 }}>Carregando pedidos...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Meus pedidos</h2>

      {err && <div style={{ color: 'tomato', marginBottom: 12 }}>{err}</div>}
      {!orders.length && !err && <p>Nenhum pedido ainda.</p>}

      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        {orders.map((o) => (
          <Link
            key={o.id}
            to={`/orders/${o.id}`}
            style={{
              border: '1px solid #eee',
              padding: 12,
              borderRadius: 8,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div><b>#{o.id}</b> · {dateTime(o.createdAt)}</div>
            <div>Status: {o.status || 'PENDING'}</div>
            <div>Total: {money(o.total)}</div>

            {Array.isArray(o.items) && o.items.length > 0 && (
              <div style={{ marginTop: 8, opacity: 0.9 }}>
                <div style={{ marginBottom: 4 }}>Itens:</div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {o.items.map((it) => (
                    <li key={it.id}>
                      {it.product?.name}{' '}
                      {it.variant ? `(${it.variant.size}/${it.variant.color})` : ''}
                      {' — '}
                      {it.quantity} × {money(it.unitPrice)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
