import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  adminCreateProduct, adminGetProduct, adminUpdateProduct,
  adminAddVariant, adminUpdateVariant, adminRemoveVariant
} from '../../api/products.admin';
import { listBrands } from '../../api/brands';
import { listCategories } from '../../api/categories';
import ImagesPanel from './ImagesPanel';

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const nav = useNavigate();

  const [form, setForm] = useState({ name:'', description:'', price:0 });
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [variants, setVariants] = useState([]);
  const [vForm, setVForm] = useState({ size:'', color:'', stock:0 });

  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(!!isEdit);

  useEffect(() => {
    (async () => {
      const [bs, cs] = await Promise.all([listBrands(), listCategories()]);
      setBrands(bs || []);
      setCategories(cs || []);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!isEdit) return;
      try {
        setLoading(true);
        setErr('');
        const p = await adminGetProduct(id);
        setForm({ name:p.name||'', description:p.description||'', price:Number(p.price||0) });
        setBrandId(p.brandId || '');
        setCategoryId(p.categoryId || '');
        setVariants(p.variants || []);
      } catch (e) {
        setErr(e?.response?.data?.error || 'Falha ao carregar produto.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  async function save(e){
    e.preventDefault();
    try{
      setMsg('');
      setErr('');
      if(!form.name) throw new Error('Nome é obrigatório.');
      const payload = {
        ...form,
        price: Number(form.price),
        brandId: brandId ? Number(brandId) : null,
        categoryId: categoryId ? Number(categoryId) : null
      };
      if(isEdit) {
        await adminUpdateProduct(id, payload);
      } else {
        const created = await adminCreateProduct(payload);
        return nav(`/admin/products/${created.id}`);
      }
      setMsg('Salvo com sucesso!');
    } catch(e){
      setErr(e?.response?.data?.error || e?.message || 'Falha');
    }
  }

  async function addV(e){
    e.preventDefault();
    try {
      setErr('');
      const v = await adminAddVariant(id, { ...vForm, stock: Number(vForm.stock) });
      setVariants(v);
      setVForm({ size:'', color:'', stock:0 });
    } catch (e) {
      setErr(e?.response?.data?.error || 'Falha ao adicionar variante.');
    }
  }

  async function updV(v){
    const nv = prompt('Novo estoque para ' + (v.size+'/'+v.color), v.stock);
    if(nv==null) return;
    try {
      setErr('');
      const list = await adminUpdateVariant(id, v.id, { stock: Number(nv) });
      setVariants(list);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Falha ao atualizar estoque.');
    }
  }

  async function delV(v){
    if(!confirm('Remover variante?')) return;
    try {
      setErr('');
      const list = await adminRemoveVariant(id, v.id);
      setVariants(list);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Falha ao remover variante.');
    }
  }

  if (loading) return <div style={{padding:16}}>Carregando…</div>;

  return (
    <div style={{padding:16, display:'grid', gap:16}}>
      <h2>{isEdit ? 'Editar' : 'Novo'} Produto</h2>

      <form onSubmit={save} style={{display:'grid', gap:8, maxWidth:620}}>
        <input placeholder="Nome" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <textarea placeholder="Descrição" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
        <input type="number" step="0.01" placeholder="Preço" value={form.price} onChange={e=>setForm({...form, price:e.target.value})}/>
        <div style={{display:'flex', gap:8}}>
          <select value={brandId} onChange={e=>setBrandId(e.target.value)} style={{flex:1}}>
            <option value="">Marca</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select value={categoryId} onChange={e=>setCategoryId(e.target.value)} style={{flex:1}}>
            <option value="">Categoria</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button>Salvar</button>
          <button type="button" onClick={()=>nav('/admin/products')}>Voltar</button>
        </div>
      </form>

      {err && <div style={{color:'tomato'}}>{err}</div>}
      {msg && <div>{msg}</div>}

      {isEdit && (
        <>
          <ImagesPanel productId={id} />

          <h3>Variantes</h3>
          <form onSubmit={addV} style={{display:'flex', gap:8, alignItems:'center'}}>
            <input placeholder="Tamanho" value={vForm.size} onChange={e=>setVForm({...vForm, size:e.target.value})}/>
            <input placeholder="Cor" value={vForm.color} onChange={e=>setVForm({...vForm, color:e.target.value})}/>
            <input type="number" placeholder="Estoque" value={vForm.stock} onChange={e=>setVForm({...vForm, stock:e.target.value})}/>
            <button>Adicionar</button>
          </form>

          <div style={{display:'grid', gap:8}}>
            {variants.map(v => (
              <div key={v.id} style={{border:'1px solid #eee', padding:10, borderRadius:8, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>{v.size} / {v.color} — estoque {v.stock}</div>
                <div style={{display:'flex', gap:8}}>
                  <button onClick={()=>updV(v)}>Alterar estoque</button>
                  <button onClick={()=>delV(v)}>Excluir</button>
                </div>
              </div>
            ))}
            {!variants.length && <div>Nenhuma variante.</div>}
          </div>
        </>
      )}
    </div>
  );
}
