import { useEffect, useState } from 'react';
import { getUser, updateUser } from '../api/users';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ name:'', email:'' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const u = await getUser(user.id);
        setForm({ name: u.name || '', email: u.email || '' });
      } catch (e) {
        setErr(e?.response?.data?.error || 'Falha ao carregar perfil.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  async function save(e){
    e.preventDefault();
    try {
      setSaving(true);
      setErr(''); setMsg('');
      const updated = await updateUser(user.id, { name: form.name, email: form.email });
      login(updated);
      setMsg('Perfil atualizado!');
    } catch (e) {
      setErr(e?.response?.data?.error || 'Falha ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  if (!user) return <div style={{padding:16}}>Faça login para acessar o perfil.</div>;
  if (loading) return <div style={{padding:16}}>Carregando…</div>;

  return (
    <main className='container'>
      <div style={{padding:16, maxWidth:520, display:'grid', gap:12}}>
        <h2 className='text-center'>Meu perfil</h2>
        {err && <div style={{color:'tomato'}}>{err}</div>}
        {msg && <div style={{color:'seagreen'}}>{msg}</div>}

        <form onSubmit={save} style={{display:'grid', gap:8}}>
          <div className='form-group'>
            <input className='form-control' placeholder="Nome" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
          </div>
          <div className='form-group'>
            <input className='form-control' placeholder="E-mail" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
          </div>
          <button className='btn btn-primary' disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</button>
        </form>

        <div style={{opacity:.8, fontSize:13}}>
          ID do usuário: {user.id} · Papel: {user.role}
        </div>
      </div>
    </main> 
  );
}
