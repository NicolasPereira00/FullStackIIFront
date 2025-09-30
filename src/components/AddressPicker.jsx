import { useEffect, useState } from 'react';
import { listAddresses, createAddress, setDefaultAddress } from '../api/addresses';

const empty = { street:'', number:'', complement:'', district:'', city:'', state:'', zip:'' };

export default function AddressPicker({ customerId, value, onChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const data = await listAddresses(customerId);
      setItems(data);
      if (!value && data.length) {
        const def = data.find(a => a.default) || data[0];
        onChange?.(def.id);
      }
    } catch (e) {
      setErr(e?.response?.data?.error || 'Falha ao carregar endereços.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!customerId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  function onField(k, v) {
    if (k === 'state') v = String(v).toUpperCase().slice(0, 2);
    if (k === 'zip') v = String(v).replace(/\D/g, '').slice(0, 8);
    setForm(prev => ({ ...prev, [k]: v }));
  }

  function formValid() {
    return form.street && form.number && form.district && form.city && form.state?.length === 2 && form.zip?.length >= 8;
  }

  async function save(e){
    e.preventDefault();
    if (!formValid()) return;
    try {
      setSaving(true);
      await createAddress({ ...form, customerId });
      setForm(empty);
      setOpenForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function makeDefault(id){
    try {
      await setDefaultAddress(id);
      await load();
      onChange?.(id);
    } catch {}
  }

  return (
    <div style={{display:'grid', gap:12}}>
      <h3>Endereço de entrega</h3>

      {err && <div style={{color:'tomato'}}>{err}</div>}
      {loading && <div>Carregando…</div>}

      {!loading && (
        <>
          <div style={{display:'grid', gap:8}}>
            {items.map(a => (
              <label key={a.id} style={{display:'flex', alignItems:'center', gap:8, border:'1px solid #eee', padding:10, borderRadius:8}}>
                <input
                  type="radio"
                  name="addr"
                  checked={String(value) === String(a.id)}
                  onChange={() => onChange?.(a.id)}
                />
                <div style={{flex:1}}>
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <b>{a.street}, {a.number}</b> {a.complement && `- ${a.complement}`}
                    {a.default && <span style={{background:'#eef', color:'#334', padding:'2px 8px', borderRadius:999, fontSize:12}}>Padrão</span>}
                  </div>
                  <div style={{opacity:.8}}>{a.district} · {a.city}/{a.state} · CEP {a.zip}</div>
                </div>
                {!a.default && <button type="button" onClick={()=>makeDefault(a.id)}>Tornar padrão</button>}
              </label>
            ))}
            {!items.length && <div>Nenhum endereço cadastrado.</div>}
          </div>

          <button type="button" onClick={()=>setOpenForm(v=>!v)}>{openForm ? 'Fechar' : '+ Novo endereço'}</button>

          {openForm && (
            <form onSubmit={save} style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, border:'1px solid #eee', padding:12, borderRadius:8}}>
              <input placeholder="Rua" value={form.street} onChange={e=>onField('street', e.target.value)} />
              <input placeholder="Número" value={form.number} onChange={e=>onField('number', e.target.value)} />
              <input placeholder="Complemento" value={form.complement} onChange={e=>onField('complement', e.target.value)} />
              <input placeholder="Bairro" value={form.district} onChange={e=>onField('district', e.target.value)} />
              <input placeholder="Cidade" value={form.city} onChange={e=>onField('city', e.target.value)} />
              <input placeholder="UF" value={form.state} onChange={e=>onField('state', e.target.value)} />
              <input placeholder="CEP" value={form.zip} onChange={e=>onField('zip', e.target.value)} />
              <div style={{gridColumn:'1 / -1', display:'flex', gap:8}}>
                <button disabled={!formValid() || saving}>{saving ? 'Salvando…' : 'Salvar'}</button>
                <button type="button" onClick={()=>{ setOpenForm(false); setForm(empty); }}>Cancelar</button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
