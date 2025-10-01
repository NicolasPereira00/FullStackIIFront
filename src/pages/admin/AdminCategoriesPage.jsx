import { useEffect, useMemo, useRef, useState } from 'react';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';

const empty = { name: '' };

export default function AdminCategoriesPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const abortRef = useRef(null);
  const params = useMemo(() => (q?.trim() ? { q: q.trim() } : {}), [q]);

  async function load(signal) {
    try {
      setLoading(true);
      setErr('');
      const data = await listCategories(params);
      if (signal?.aborted) return;
      setItems(data);
    } catch (e) {
      if (signal?.aborted) return;
      setErr(e?.response?.data?.error || e?.message || 'Falha ao carregar categorias.');
      setItems([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    load(ac.signal);
    return () => ac.abort();
  }, []);

  useEffect(() => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const t = setTimeout(() => load(ac.signal), 300);
    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [params]);

  async function save(e) {
    e.preventDefault();
    try {
      setErr('');
      if (!form.name?.trim()) throw new Error('Nome é obrigatório.');
      if (editing) await updateCategory(editing, { name: form.name.trim() });
      else await createCategory({ name: form.name.trim() });
      setForm(empty);
      setEditing(null);

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      await load(ac.signal);
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || 'Falha ao salvar.');
    }
  }

  async function del(id) {
    if (!confirm('Excluir categoria?')) return;
    try {
      setErr('');
      await deleteCategory(id);

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      await load(ac.signal);
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || 'Falha ao excluir.');
    }
  }

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h2>Categorias</h2>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="form-control"
          placeholder="Buscar..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: 300 }}
        />
      </div>

      <form onSubmit={save} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          className="form-control"
          placeholder="Nome da categoria"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={{ maxWidth: 300 }}
        />
        <button className="btn btn-primary">{editing ? 'Atualizar' : 'Adicionar'}</button>
        {editing && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setEditing(null);
              setForm(empty);
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      {err && <div className="alert alert-error">{err}</div>}
      {loading && <div>Carregando…</div>}

      <div style={{ display: 'grid', gap: 8 }}>
        {items.map((c) => (
          <div
            key={c.id}
            className="card"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div><b>{c.name}</b></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setEditing(c.id);
                  setForm({ name: c.name || '' });
                }}
              >
                Editar
              </button>
              <button className="btn btn-danger" onClick={() => del(c.id)}>
                Excluir
              </button>
            </div>
          </div>
        ))}
        {!loading && !items.length && <div>Nenhuma categoria.</div>}
      </div>
    </div>
  );
}
