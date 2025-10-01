import { useEffect, useState } from 'react';
import { listAddresses, createAddress, updateAddress, removeAddress, setDefaultAddress } from '../api/addresses';
import { useAuth } from '../context/AuthContext';

const empty = { street:'', number:'', complement:'', district:'', city:'', state:'', zip:'' };

export default function AddressesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!user?.customerId) return;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const data = await listAddresses(user.customerId);
        setItems(data);
      } catch (e) {
        setErr(e?.response?.data?.error || 'Falha ao carregar endereços.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.customerId]);

  async function reload() {
    const data = await listAddresses(user.customerId);
    setItems(data);
  }

  function onChange(k, v) {
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
      setErr('');
      const payload = { ...form, customerId: user.customerId };
      if (editing) await updateAddress(editing, payload);
      else await createAddress(payload);
      await reload();
      setForm(empty);
      setEditing(null);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Falha ao salvar endereço.');
    }
  }

  async function del(id){
    if(!confirm('Remover este endereço?')) return;
    try {
      setErr('');
      await removeAddress(id);
      await reload();
      if (editing === id) { setEditing(null); setForm(empty); }
    } catch (e) {
      setErr(e?.response?.data?.error || 'Falha ao remover endereço.');
    }
  }

  async function makeDefault(id){
    try {
      setErr('');
      await setDefaultAddress(id);
      await reload();
    } catch (e) {
      setErr(e?.response?.data?.error || 'Falha ao definir endereço padrão.');
    }
  }

  if (!user?.customerId) return <div style={{padding:16}}>Entre como <b>CUSTOMER</b>.</div>;
  if (loading) return <div style={{padding:16}}>Carregando…</div>;

  return (
    <div style={{padding:16, display:'grid', gap:16}}>
      <h2>Meus endereços</h2>

      <form onSubmit={save} style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8}}>
        <input placeholder="Rua" value={form.street} onChange={e=>onChange('street', e.target.value)}/>
        <input placeholder="Número" value={form.number} onChange={e=>onChange('number', e.target.value)}/>
        <input placeholder="Complemento" value={form.complement} onChange={e=>onChange('complement', e.target.value)}/>
        <input placeholder="Bairro" value={form.district} onChange={e=>onChange('district', e.target.value)}/>
        <input placeholder="Cidade" value={form.city} onChange={e=>onChange('city', e.target.value)}/>
        <input placeholder="UF" value={form.state} onChange={e=>onChange('state', e.target.value)}/>
        <input placeholder="CEP" value={form.zip} onChange={e=>onChange('zip', e.target.value)}/>
        <div style={{gridColumn:'1 / -1', display:'flex', gap:8}}>
          <button disabled={!formValid()}>{editing ? 'Atualizar' : 'Adicionar'}</button>
          {editing && <button type="button" onClick={()=>{ setEditing(null); setForm(empty); }}>Cancelar</button>}
        </div>
      </form>

      {err && <div style={{color:'tomato'}}>{err}</div>}

      <div style={{display:'grid', gap:8}}>
        {items.map(a => (
          <div key={a.id} style={{border:'1px solid #eee', padding:12, borderRadius:8, display:'flex', justifyContent:'space-between', gap:12, alignItems:'center'}}>
            <div>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <b>{a.street}, {a.number}</b> {a.complement && ` - ${a.complement}`}
                {a.default && <span style={{background:'#eef', color:'#334', padding:'2px 8px', borderRadius:999, fontSize:12}}>Padrão</span>}
              </div>
              <div>{a.district} · {a.city}/{a.state} · CEP {a.zip}</div>
            </div>
            <div style={{display:'flex', gap:8}}>
              {!a.default && <button onClick={()=>makeDefault(a.id)}>Definir como padrão</button>}
              <button onClick={()=>{ setEditing(a.id); setForm({
                street:a.street||'', number:a.number||'', complement:a.complement||'',
                district:a.district||'', city:a.city||'', state:a.state||'', zip:a.zip||''
              }); }}>Editar</button>
              <button onClick={()=>del(a.id)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
