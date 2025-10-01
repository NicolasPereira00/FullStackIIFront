import { useEffect, useState } from 'react';
import { listOrders } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { money, dateTime } from '../utils/format';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.customerId) return;
    (async () => {
      try {
        setLoading(true);
        const data = await listOrders({ customerId: user.customerId });
        setOrders(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.customerId]);

  if (!user?.customerId) {
    return <div style={{ padding: 16 }}>Entre como <b>CUSTOMER</b>.</div>;
  }

  if (loading) {
    return <div style={{ padding: 16 }}>Carregando pedidos...</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Meus pedidos</h2>
      {!orders.length && <p>Nenhum pedido ainda.</p>}
      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        {orders.map(o => (
          <Link
            key={o.id}
            to={`/orders/${o.id}`}
            style={{
              border: '1px solid #eee',
              padding: 12,
              borderRadius: 8,
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div><b>#{o.id}</b> · {dateTime(o.createdAt)}</div>
            <div>Status: {o.status}</div>
            <div>Total: {money(o.total)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
