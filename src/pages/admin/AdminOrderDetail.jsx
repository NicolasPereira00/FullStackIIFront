import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { adminGetOrder, adminUpdateOrderStatus } from '../../api/orders.admin';
import { money } from '../../utils/format';

const STATUS = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [o, setO] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  async function load() {
    try {
      setLoading(true);
      setErr('');
      const data = await adminGetOrder(id);
      setO(data);
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || 'Falha ao carregar pedido.');
      setO(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function changeStatus(s, selectEl) {
    if (!s) return;
    try {
      await adminUpdateOrderStatus(id, s);
      await load();
    } catch (e) {
      alert(e?.response?.data?.error || 'Falha ao atualizar status.');
    } finally {
      if (selectEl) selectEl.value = '';
    }
  }

  if (loading) return <div style={{ padding: 16 }}>Carregando…</div>;
  if (err) return <div style={{ padding: 16, color: 'tomato' }}>{err}</div>;
  if (!o) return <div style={{ padding: 16 }}>Pedido não encontrado.</div>;

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h2>Pedido #{o.id}</h2>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div>
          Status: <b>{o.status}</b>
        </div>
        <select defaultValue="" onChange={(e) => changeStatus(e.target.value, e.target)}>
          <option value="" disabled>
            Mudar…
          </option>
          {STATUS.filter((s) => s !== o.status).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>Cliente: {o.customer?.name || o.customer?.email || '-'}</div>
      <div>Total: {money(o.total)}</div>

      <h3>Itens</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {(o.items || []).map((it) => (
          <div
            key={it.id}
            style={{
              display: 'flex',
              gap: 12,
              borderBottom: '1px solid #eee',
              padding: '6px 0',
              background: '#fff',
            }}
          >
            <div style={{ flex: 1 }}>
              <div>
                <b>{it.product?.name}</b>
              </div>
              <div style={{ opacity: 0.7 }}>
                {it.variant ? `${it.variant.size}/${it.variant.color}` : '—'}
              </div>
            </div>
            <div>Qtd: {it.quantity}</div>
            <div>Unit: {money(it.unitPrice)}</div>
            <div>Subtotal: {money(Number(it.unitPrice) * Number(it.quantity || 0))}</div>
          </div>
        ))}
      </div>

      {o.shippingAddress && (
        <>
          <h3>Endereço de entrega</h3>
          <div>
            {o.shippingAddress.street}, {o.shippingAddress.number}{' '}
            {o.shippingAddress.complement ? `- ${o.shippingAddress.complement}` : ''}
          </div>
          <div>
            {o.shippingAddress.district} · {o.shippingAddress.city}/{o.shippingAddress.state} · CEP{' '}
            {o.shippingAddress.zip}
          </div>
        </>
      )}
    </div>
  );
}
