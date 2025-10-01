import { useEffect, useState } from 'react';
import { getOrder } from '../api/orders';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { money, dateTime } from '../utils/format';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [o, setO] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!user?.customerId) return;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const data = await getOrder(id);
        setO(data);
      } catch (e) {
        setErr(e?.response?.data?.error || 'Falha ao carregar pedido.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user?.customerId]);

  if (!user?.customerId) return <div style={{ padding: 16 }}>Entre como <b>CUSTOMER</b>.</div>;
  if (loading) return <div style={{ padding: 16 }}>Carregando…</div>;
  if (err) return <div style={{ padding: 16, color: 'tomato' }}>{err}</div>;
  if (!o) return <div style={{ padding: 16 }}>Pedido não encontrado.</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Pedido #{o.id}</h2>
      <div>Status: {o.status}</div>
      <div>Criado em: {dateTime(o.createdAt)}</div>

      <h3 style={{ marginTop: 16 }}>Itens</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {o.items?.map((it) => (
          <div
            key={it.id}
            style={{ display: 'flex', gap: 12, borderBottom: '1px solid #eee', padding: '6px 0' }}
          >
            <div style={{ flex: 1 }}>
              <div><b>{it.product?.name}</b></div>
              <div style={{ opacity: 0.7 }}>
                {it.variant ? `${it.variant.size}/${it.variant.color}` : '—'}
              </div>
            </div>
            <div>Qtd: {it.quantity}</div>
            <div>Unit: {money(it.unitPrice)}</div>
            <div>Subtotal: {money(Number(it.unitPrice) * it.quantity)}</div>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 16 }}>Total: {money(o.total)}</h3>

      {o.shippingAddress && (
        <>
          <h3 style={{ marginTop: 16 }}>Endereço de entrega</h3>
          <div>
            {o.shippingAddress.street}, {o.shippingAddress.number}{' '}
            {o.shippingAddress.complement ? `- ${o.shippingAddress.complement}` : ''}
          </div>
          <div>
            {o.shippingAddress.district} · {o.shippingAddress.city}/{o.shippingAddress.state} · CEP {o.shippingAddress.zip}
          </div>
        </>
      )}
    </div>
  );
}
