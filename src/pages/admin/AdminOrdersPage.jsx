import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminListOrders, adminUpdateOrderStatus } from '../../api/orders.admin';
import { money } from '../../utils/format';

const STATUS = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  async function load() {
    try {
      setLoading(true);
      setErr('');
      const res = await adminListOrders({ q: q || undefined, status: status || undefined });
      const data = Array.isArray(res) ? res : (res?.data || []);
      setList(data);
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || 'Falha ao carregar pedidos.');
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [q, status]); // eslint-disable-line react-hooks/exhaustive-deps

  async function quick(next, id, selectEl) {
    if (!next) return;
    try {
      await adminUpdateOrderStatus(id, next);
      await load();
    } catch (e) {
      alert(e?.response?.data?.error || 'Falha ao atualizar status.');
    } finally {
      if (selectEl) selectEl.value = '';
    }
  }

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h2>Pedidos (Admin)</h2>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="Buscar por cliente ou #id"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos</option>
          {STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {err && <div style={{ color: 'tomato' }}>{err}</div>}
      {loading && <div>Carregando…</div>}

      <div style={{ display: 'grid', gap: 10 }}>
        {list.map((o) => (
          <div
            key={o.id}
            style={{
              border: '1px solid #eee',
              borderRadius: 8,
              padding: 12,
              display: 'grid',
              gap: 6,
              background: '#fff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <b>#{o.id}</b> · {o.createdAt ? new Date(o.createdAt).toLocaleString() : '--'}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span>
                  Status: <b>{o.status}</b>
                </span>
                <select
                  defaultValue=""
                  onChange={(e) => quick(e.target.value, o.id, e.target)}
                >
                  <option value="" disabled>
                    Mudar…
                  </option>
                  {STATUS.filter((s) => s !== o.status).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <Link to={`/admin/orders/${o.id}`}>Detalhes</Link>
              </div>
            </div>
            <div>Cliente: {o.customer?.name || o.customer?.email || '-'}</div>
            <div>Total: {money(o.total)}</div>
          </div>
        ))}
        {!loading && !list.length && !err && <div>Nenhum pedido.</div>}
      </div>
    </div>
  );
}
