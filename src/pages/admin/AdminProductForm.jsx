import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  adminCreateProduct,
  adminGetProduct,
  adminUpdateProduct,
  adminAddVariant,
  adminUpdateVariant,
  adminRemoveVariant,
} from "../../api/products.admin";
import { listBrands } from "../../api/brands";
import { listCategories } from "../../api/categories";
import ImagesPanel from "./ImagesPanel";

function unwrapList(res) {
  if (Array.isArray(res)) return res;
  if (res?.data && Array.isArray(res.data)) return res.data;
  if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
  return [];
}
function unwrapObj(res) {
  if (res?.data && !Array.isArray(res.data)) return res.data;
  return res;
}

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const nav = useNavigate();

  const [form, setForm] = useState({ name: "", description: "", price: "" });
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [variants, setVariants] = useState([]);
  const [vForm, setVForm] = useState({ size: "", color: "", stock: 0 });

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const [bs, cs] = await Promise.all([listBrands(), listCategories()]);
        setBrands(unwrapList(bs));
        setCategories(unwrapList(cs));

        if (isEdit) {
          const p = unwrapObj(await adminGetProduct(id));
          if (p) {
            setForm({
              name: p.name || "",
              description: p.description || "",
              price: p.price !== undefined && p.price !== null ? String(p.price) : "",
            });
            setBrandId(p.brandId != null ? String(p.brandId) : "");
            setCategoryId(p.categoryId != null ? String(p.categoryId) : "");
            setVariants(Array.isArray(p.variants) ? p.variants : []);
          }
        }
      } catch (e) {
        console.error(e);
        setErr(e?.response?.data?.error || e?.message || "Falha ao carregar dados.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  async function save(e) {
    e.preventDefault();
    try {
      setMsg("");
      setErr("");

      if (!form.name?.trim()) throw new Error("Nome é obrigatório.");
      const payload = {
        name: form.name?.trim(),
        description: form.description ?? null,
        price: Number(form.price || 0),
        brandId: brandId ? Number(brandId) : null,
        categoryId: categoryId ? Number(categoryId) : null,
      };

      if (isEdit) {
        await adminUpdateProduct(id, payload);
        setMsg("Salvo com sucesso!");
      } else {
        const created = unwrapObj(await adminCreateProduct(payload));
        return nav(`/admin/products/${created.id}`);
      }
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.error || e?.message || "Falha ao salvar.");
    }
  }

async function addV(e){
  e.preventDefault();
  try {
    setErr('');

    if (!vForm.size?.trim() || !vForm.color?.trim()) {
      throw new Error('Informe tamanho e cor.');
    }

    const sku =
      (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? `SKU-${crypto.randomUUID()}`
        : `SKU-${Date.now()}-${Math.floor(Math.random()*1e6)}`;

    const payload = {
      size: vForm.size.trim(),
      color: vForm.color.trim(),
      stock: Number(vForm.stock || 0),
      sku,
    };

    const list = await adminAddVariant(id, payload);
    setVariants(list);
    setVForm({ size:'', color:'', stock:0 });
  } catch (e) {
    setErr(e?.response?.data?.error || e?.message || 'Falha ao adicionar variante.');
  }
}

  async function updV(v) {
    if (!isEdit) return;
    const nv = prompt("Novo estoque para " + (v.size + "/" + v.color), v.stock);
    if (nv == null) return;
    try {
      setErr("");
      const list = unwrapList(await adminUpdateVariant(id, v.id, { stock: Number(nv) }));
      setVariants(list);
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.error || "Falha ao atualizar estoque.");
    }
  }

  async function delV(v) {
    if (!isEdit) return;
    if (!confirm("Remover variante?")) return;
    try {
      setErr("");
      const list = unwrapList(await adminRemoveVariant(id, v.id));
      setVariants(list);
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.error || "Falha ao remover variante.");
    }
  }

  async function updV(v) {
  if (!isEdit) return;
  const nv = prompt('Novo estoque para ' + (v.size + '/' + v.color), v.stock);
  if (nv == null) return;

  try {
    setErr('');
    await adminUpdateVariant(v.id, { stock: Number(nv) });

    const p = await adminGetProduct(id);
    setVariants(Array.isArray(p.variants) ? p.variants : []);
  } catch (e) {
    console.error(e);
    setErr(e?.response?.data?.error || 'Falha ao atualizar estoque.');
  }
}

async function delV(v) {
  if (!isEdit) return;
  if (!confirm('Remover variante?')) return;

  try {
    setErr('');
    await adminRemoveVariant(v.id);

    const p = await adminGetProduct(id);
    setVariants(Array.isArray(p.variants) ? p.variants : []);
  } catch (e) {
    console.error(e);
    setErr(e?.response?.data?.error || 'Falha ao remover variante.');
  }
}

  if (loading) return <div style={{ padding: 16 }}>Carregando…</div>;

  return (
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <h2>{isEdit ? "Editar" : "Novo"} Produto</h2>

      <form onSubmit={save} style={{ display: "grid", gap: 8, maxWidth: 640 }}>
        <input
          className="form-control"
          placeholder="Nome"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <textarea
          className="form-control"
          placeholder="Descrição"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
        />

        <input
          className="form-control"
          type="number"
          step="0.01"
          min="0"
          placeholder="Preço"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />

        <div style={{ display: "flex", gap: 8 }}>
          <select
            className="form-control"
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="">Marca</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            className="form-control"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="">Categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary">Salvar</button>
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => nav("/admin/products")}
          >
            Voltar
          </button>
        </div>
      </form>

      {err && <div className="alert alert-error">{err}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      {isEdit && (
        <>
          <ImagesPanel productId={id} />

          <h3>Variantes</h3>
          <form onSubmit={addV} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              className="form-control"
              placeholder="Tamanho"
              value={vForm.size}
              onChange={(e) => setVForm({ ...vForm, size: e.target.value })}
              required
            />
            <input
              className="form-control"
              placeholder="Cor"
              value={vForm.color}
              onChange={(e) => setVForm({ ...vForm, color: e.target.value })}
              required
            />
            <input
              className="form-control"
              type="number"
              min="0"
              placeholder="Estoque"
              value={vForm.stock}
              onChange={(e) => setVForm({ ...vForm, stock: e.target.value })}
              required
            />
            <button className="btn btn-primary">Adicionar</button>
          </form>

          <div style={{ display: "grid", gap: 8 }}>
            {variants.map((v) => (
              <div
                key={v.id}
                className="card"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  {v.size} / {v.color} — estoque {v.stock}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-outline" onClick={() => updV(v)}>
                    Alterar estoque
                  </button>
                  <button className="btn btn-danger" onClick={() => delV(v)}>
                    Excluir
                  </button>
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
