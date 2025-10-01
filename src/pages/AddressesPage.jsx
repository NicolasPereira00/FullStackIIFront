import { useEffect, useState } from 'react';
import {
  listMyAddresses,
  createMyAddress,
  updateMyAddress,
  deleteMyAddress,
} from '../api/addresses.me';
import { useAuth } from '../context/AuthContext';

const empty = {
  street: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: '',
  zip: '',
};

const S = {
  page: { padding: 16, display: 'grid', gap: 16, maxWidth: 920, margin: '0 auto' },
  headerWrap: { display: 'grid', gap: 4 },
  header: { margin: 0 },
  sub: { color: '#6b7280', fontSize: 14 },

  card: {
    border: '1px solid #e9ebf0',
    background: '#fff',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 2px 10px rgba(18, 24, 40, .04)',
  },
  cardTitle: { margin: '0 0 12px', fontSize: 16, fontWeight: 700 },

  grid: {
    display: 'grid',
    gap: 12,
    gridTemplateColumns: 'repeat(12, minmax(0,1fr))',
  },
  col12: { gridColumn: 'span 12' },
  col8: { gridColumn: 'span 8' },
  col6: { gridColumn: 'span 6' },
  col4: { gridColumn: 'span 4' },
  col3: { gridColumn: 'span 3' },

  label: { display: 'block', fontSize: 12, color: '#556', marginBottom: 6 },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #dfe3ea',
    borderRadius: 10,
    outline: 'none',
  },
  row: { display: 'flex', gap: 8, alignItems: 'center' },

  btn: {
    padding: '9px 12px',
    borderRadius: 10,
    border: '1px solid transparent',
    cursor: 'pointer',
    fontWeight: 600,
  },
  primary: { background: '#7c3aed', color: '#fff' },
  outline: { background: '#fff', color: '#374151', border: '1px solid #dfe3ea' },
  danger: { background: '#ef4444', color: '#fff' },

  list: { display: 'grid', gap: 10 },
  item: {
    border: '1px solid #edf0f6',
    borderRadius: 12,
    padding: 14,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    background: '#fff',
  },
  itemTitle: { display: 'flex', gap: 8, alignItems: 'center' },
  muted: { color: '#6b7280' },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },

  alertError: {
    background: '#fee2e2',
    color: '#991b1b',
    borderRadius: 10,
    padding: '10px 12px',
  },
};

export default function AddressesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  async function load() {
    try {
      setLoading(true);
      setErr('');
      const data = await listMyAddresses();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Falha ao carregar endereços.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) load();
  }, [user]);

  function onChange(k, v) {
    if (k === 'state') v = String(v).toUpperCase().slice(0, 2);
    if (k === 'zip') v = String(v).replace(/\D/g, '').slice(0, 8);
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  const formValid =
    form.street &&
    form.number &&
    form.district &&
    form.city &&
    form.state?.length === 2 &&
    form.zip?.length >= 8;

  async function save(e) {
    e.preventDefault();
    if (!formValid) return;
    try {
      setErr('');
      const payload = {
        street: form.street,
        number: form.number,
        complement: form.complement || null,
        district: form.district,
        city: form.city,
        state: form.state,
        zipCode: form.zip,
      };
      if (editing) await updateMyAddress(editing, payload);
      else await createMyAddress(payload);
      setForm(empty);
      setEditing(null);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.error || 'Falha ao salvar endereço.');
    }
  }

  async function del(id) {
    if (!confirm('Remover este endereço?')) return;
    try {
      setErr('');
      await deleteMyAddress(id);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.error || 'Falha ao remover endereço.');
    }
  }

  if (!user) return <div style={{ padding: 16 }}>Faça login para ver seus endereços.</div>;
  if (loading) return <div style={{ padding: 16 }}>Carregando…</div>;

  return (
    <div style={S.page}>
      <div style={S.headerWrap}>
        <h2 style={S.header}>Meus endereços</h2>
        <p style={S.sub}>Gerencie os locais de entrega usados nas suas compras.</p>
      </div>

      {err && <div style={S.alertError}>{err}</div>}

      {/* Card do formulário */}
      <div style={S.card}>
        <h3 style={S.cardTitle}>{editing ? 'Editar endereço' : 'Adicionar endereço'}</h3>

        <form onSubmit={save} style={S.grid}>
          <div style={S.col8}>
            <label style={S.label}>Rua</label>
            <input
              style={S.input}
              placeholder="Rua"
              value={form.street}
              onChange={(e) => onChange('street', e.target.value)}
            />
          </div>

          <div style={S.col4}>
            <label style={S.label}>Número</label>
            <input
              style={S.input}
              placeholder="Número"
              value={form.number}
              onChange={(e) => onChange('number', e.target.value)}
            />
          </div>

          <div style={S.col6}>
            <label style={S.label}>Complemento</label>
            <input
              style={S.input}
              placeholder="Complemento"
              value={form.complement}
              onChange={(e) => onChange('complement', e.target.value)}
            />
          </div>

          <div style={S.col6}>
            <label style={S.label}>Bairro</label>
            <input
              style={S.input}
              placeholder="Bairro"
              value={form.district}
              onChange={(e) => onChange('district', e.target.value)}
            />
          </div>

          <div style={S.col6}>
            <label style={S.label}>Cidade</label>
            <input
              style={S.input}
              placeholder="Cidade"
              value={form.city}
              onChange={(e) => onChange('city', e.target.value)}
            />
          </div>

          <div style={S.col3}>
            <label style={S.label}>UF</label>
            <input
              style={S.input}
              placeholder="UF"
              value={form.state}
              onChange={(e) => onChange('state', e.target.value)}
              maxLength={2}
            />
          </div>

          <div style={S.col3}>
            <label style={S.label}>CEP</label>
            <input
              style={S.input}
              placeholder="CEP"
              value={form.zip}
              onChange={(e) => onChange('zip', e.target.value)}
            />
          </div>

          <div style={{ ...S.col12, ...S.row }}>
            <button
              style={{ ...S.btn, ...S.primary, opacity: formValid ? 1 : 0.6 }}
              disabled={!formValid}
            >
              {editing ? 'Atualizar' : 'Adicionar'}
            </button>
            {editing && (
              <button
                type="button"
                style={{ ...S.btn, ...S.outline }}
                onClick={() => {
                  setEditing(null);
                  setForm(empty);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista de endereços */}
      <div style={S.list}>
        {items.map((a) => (
          <div key={a.id} style={S.item}>
            <div>
              <div style={S.itemTitle}>
                <b>
                  {a.street}, {a.number}
                </b>
                {a.complement && <span style={S.muted}>— {a.complement}</span>}
              </div>
              <div style={S.muted}>
                {a.district} · {a.city}/{a.state} · CEP {a.zipCode}
              </div>
            </div>

            <div style={S.actions}>
              <button
                style={{ ...S.btn, ...S.outline }}
                onClick={() => {
                  setEditing(a.id);
                  setForm({
                    street: a.street || '',
                    number: a.number || '',
                    complement: a.complement || '',
                    district: a.district || '',
                    city: a.city || '',
                    state: a.state || '',
                    zip: a.zipCode || '',
                  });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Editar
              </button>
              <button style={{ ...S.btn, ...S.danger }} onClick={() => del(a.id)}>
                Excluir
              </button>
            </div>
          </div>
        ))}

        {!items.length && (
          <div style={{ ...S.card, textAlign: 'center' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Nenhum endereço cadastrado</div>
            <div style={S.muted}>Adicione um novo endereço no formulário acima.</div>
          </div>
        )}
      </div>
    </div>
  );
}
