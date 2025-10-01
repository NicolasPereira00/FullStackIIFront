import { useState } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CUSTOMER' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      const user =
        mode === 'login'
          ? await apiLogin({ email: form.email, password: form.password })
          : await apiRegister({
              name: form.name,
              email: form.email,
              password: form.password,
              role: form.role,
            });
      login(user);
      nav('/products');
    } catch (e) {
      setErr(e?.response?.data?.error || 'Falha');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: '64px 0 0 0', // ajusta se sua navbar tiver outra altura
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        background:
          'radial-gradient(1200px 600px at 20% -10%, #f7f7ff, transparent), radial-gradient(1200px 600px at 120% 110%, #eef2ff, transparent)',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '380px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <button
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: mode === 'login' ? 'linear-gradient(90deg, #6a11cb, #2575fc)' : '#f3f3f3',
              color: mode === 'login' ? 'white' : '#333',
              marginRight: 8,
              fontWeight: 'bold',
            }}
          >
            Entrar
          </button>
          <button
            onClick={() => setMode('register')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: mode === 'register' ? 'linear-gradient(90deg, #6a11cb, #2575fc)' : '#f3f3f3',
              color: mode === 'register' ? 'white' : '#333',
              fontWeight: 'bold',
            }}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          {mode === 'register' && (
            <>
              <input
                placeholder="Nome"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                }}
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                }}
              >
                <option value="CUSTOMER">Cliente</option>
                <option value="SELLER">Vendedor</option>
              </select>
            </>
          )}
          <input
            placeholder="E-mail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
            }}
          />
          <input
            placeholder="Senha"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
            }}
          />
          <button
            disabled={loading}
            style={{
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              background: 'linear-gradient(90deg, #6a11cb, #2575fc)',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            {loading ? '...' : mode === 'login' ? 'Entrar' : 'Registrar'}
          </button>
        </form>

        {err && <p style={{ color: 'tomato', marginTop: 10 }}>{err}</p>}

        <button
          style={{
            marginTop: 16,
            background: 'none',
            border: 'none',
            color: '#2575fc',
            cursor: 'pointer',
            fontSize: '14px',
          }}
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'Não tem conta? Registrar' : 'Já tenho conta'}
        </button>
      </div>
    </div>
  );
}
