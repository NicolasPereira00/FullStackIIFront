import { useEffect, useRef, useState } from 'react';
import { listProductImages, uploadProductImage, removeProductImage } from '../../api/images';

export default function ImagesPanel({ productId }) {
  const [imgs, setImgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);

  async function load() {
    setLoading(true);
    const data = await listProductImages(productId);
    setImgs(data);
    setLoading(false);
  }

  useEffect(() => { if (productId) load(); }, [productId]);

  async function onPick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    await uploadProductImage(productId, f);
    inputRef.current.value = '';
    await load();
  }

  async function del(id) {
    if(!confirm('Excluir imagem?')) return;
    await removeProductImage(productId, id);
    await load();
  }

  if (!productId) return null;

  return (
    <div style={{display:'grid', gap:8}}>
      <h3>Imagens</h3>
      <input ref={inputRef} type="file" accept="image/*" onChange={onPick} />
      {loading && <div>Carregando…</div>}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px,1fr))', gap:8}}>
        {imgs.map(img => (
          <div key={img.id} style={{border:'1px solid #eee', borderRadius:8, overflow:'hidden', position:'relative'}}>
            <img src={img.url} alt="" style={{width:'100%', height:120, objectFit:'cover'}} />
            <button onClick={()=>del(img.id)} style={{position:'absolute', top:6, right:6}}>Excluir</button>
          </div>
        ))}
        {!loading && !imgs.length && <div>Nenhuma imagem.</div>}
      </div>
    </div>
  );
}
