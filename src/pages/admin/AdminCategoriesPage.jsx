import { useEffect, useState } from 'react';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';

const empty = { name:'' };

export default function AdminCategoriesPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

async function load() {
  try {
    setLoading(true);
    setErr('');
   const data = await listCategories(q ? { q } : {});
   setItems(Array.isArray(data) ? data : data.items || []);
  } catch(e) {
    setErr(e?.response?.data?.error || 'Falha ao carregar categorias.');
   setItems([]);
  } finally {
    setLoading(false);
  }
}


  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [q]);

  async function save(e){
    e.preventDefault();
    try {
      if (editing) await updateCategory(editing, form);
      else await createCategory(form);
      setForm(empty); setEditing(null);
      await load();
    } catch(e){ alert(e?.response?.data?.error || 'Falha ao salvar.'); }
  }

  async function del(id){
    if(!confirm('Excluir categoria?')) return;
    try { await deleteCategory(id); await load(); } catch(e){ alert(e?.response?.data?.error || 'Falha ao excluir.'); }
  }

  return (
    <div style={{padding:16, display:'grid', gap:12}}>
      <h2>Categorias</h2>
      <div style={{display:'flex', gap:8}}>
        <input placeholder="Buscar..." value={q} onChange={e=>setQ(e.target.value)} />
      </div>

      <form onSubmit={save} style={{display:'flex', gap:8, alignItems:'center'}}>
        <input placeholder="Nome da categoria" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <button>{editing ? 'Atualizar' : 'Adicionar'}</button>
        {editing && <button type="button" onClick={()=>{setEditing(null); setForm(empty);}}>Cancelar</button>}
      </form>

      {err && <div style={{color:'tomato'}}>{err}</div>}
      {loading && <div>Carregando…</div>}

      <div style={{display:'grid', gap:8}}>
        {items.map(c => (
          <div key={c.id} style={{border:'1px solid #eee', padding:10, borderRadius:8, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div><b>{c.name}</b></div>
            <div style={{display:'flex', gap:8}}>
              <button onClick={()=>{ setEditing(c.id); setForm({ name:c.name||'' }); }}>Editar</button>
              <button onClick={()=>del(c.id)}>Excluir</button>
            </div>
          </div>
        ))}
        {!loading && !items.length && <div>Nenhuma categoria.</div>}
      </div>
    </div>
  );
}
