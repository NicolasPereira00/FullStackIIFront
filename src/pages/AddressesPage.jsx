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
    <div style={{ padding: 16, display: 'grid', gap: 16 }}>
      <h2>Meus endereços</h2>

      <form
        onSubmit={save}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}
      >
        <input
          placeholder="Rua"
          value={form.street}
          onChange={(e) => onChange('street', e.target.value)}
        />
        <input
          placeholder="Número"
          value={form.number}
          onChange={(e) => onChange('number', e.target.value)}
        />
        <input
          placeholder="Complemento"
          value={form.complement}
          onChange={(e) => onChange('complement', e.target.value)}
        />
        <input
          placeholder="Bairro"
          value={form.district}
          onChange={(e) => onChange('district', e.target.value)}
        />
        <input
          placeholder="Cidade"
          value={form.city}
          onChange={(e) => onChange('city', e.target.value)}
        />
        <input
          placeholder="UF"
          value={form.state}
          onChange={(e) => onChange('state', e.target.value)}
        />
        <input
          placeholder="CEP"
          value={form.zip}
          onChange={(e) => onChange('zip', e.target.value)}
        />
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
          <button disabled={!formValid}>{editing ? 'Atualizar' : 'Adicionar'}</button>
          {editing && (
            <button
              type="button"
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

      {err && <div style={{ color: 'tomato' }}>{err}</div>}

      <div style={{ display: 'grid', gap: 8 }}>
        {items.map((a) => (
          <div
            key={a.id}
            style={{
              border: '1px solid #eee',
              padding: 12,
              borderRadius: 8,
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <b>
                  {a.street}, {a.number}
                </b>{' '}
                {a.complement && ` - ${a.complement}`}
              </div>
              <div>
                {a.district} · {a.city}/{a.state} · CEP {a.zipCode}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
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
                }}
              >
                Editar
              </button>
              <button onClick={() => del(a.id)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
