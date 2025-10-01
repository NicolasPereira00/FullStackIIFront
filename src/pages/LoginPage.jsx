import { useState } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'CUSTOMER' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      const user = mode === 'login'
        ? await apiLogin({ email: form.email, password: form.password })
        : await apiRegister({ name: form.name, email: form.email, password: form.password, role: form.role });
      login(user);
      nav('/products');
    } catch (e) {
      setErr(e?.response?.data?.error || 'Falha');
    } finally { setLoading(false); }
  }

  return (
    <div style={{maxWidth:420, margin:'40px auto'}}>
      <h2>{mode === 'login' ? 'Entrar' : 'Registrar'}</h2>
      <form onSubmit={onSubmit} style={{display:'grid', gap:10}}>
        {mode === 'register' && (
          <>
            <input placeholder="Nome" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
            <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
              <option value="CUSTOMER">Cliente</option>
              <option value="SELLER">Vendedor</option>
            </select>
          </>
        )}
        <input placeholder="E-mail" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
        <input placeholder="Senha" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
        <button disabled={loading}>{loading ? '...' : 'Enviar'}</button>
      </form>
      {err && <p style={{color:'tomato'}}>{err}</p>}
      <button style={{marginTop:12}} onClick={()=>setMode(mode==='login'?'register':'login')}>
        {mode==='login'?'Criar conta':'Já tenho conta'}
      </button>
    </div>
  );
}
