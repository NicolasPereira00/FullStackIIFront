import { useEffect, useRef, useState } from "react";
import {
  listProductImages,
  uploadProductImage,
  deleteProductImage,
} from "../../api/images"; // ajuste o path se necessário

function unwrapList(res) {
  if (Array.isArray(res)) return res;
  if (res?.data && Array.isArray(res.data)) return res.data;
  if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
  return [];
}

export default function ImagesPanel({ productId }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const inputRef = useRef(null);

  async function refresh() {
    try {
      setErr("");
      setLoading(true);
      const res = await listProductImages(productId);
      setImages(unwrapList(res));
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.error || e?.message || "Falha ao carregar imagens.");
      setImages([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!productId) return;
    refresh();
  }, [productId]);

  async function onUploadChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setErr("");
      setUploading(true);
      await uploadProductImage(productId, file);
      await refresh();
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.error || e?.message || "Falha ao enviar imagem.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function onDelete(img) {
    if (!confirm("Excluir esta imagem?")) return;
    try {
      setErr("");
      setUploading(true);
      await deleteProductImage(productId, img.id);
      await refresh();
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.error || e?.message || "Falha ao excluir imagem.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="card">
      <h3 className="mb-2">Imagens</h3>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onUploadChange}
        disabled={uploading}
      />

      {loading ? (
        <div className="mt-2">Carregando…</div>
      ) : (
        <>
          {err && <div className="alert alert-error mt-2">{err}</div>}
          {!images.length && <div className="mt-2">Nenhuma imagem.</div>}

          {!!images.length && (
            <div
              className="mt-2"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 12,
              }}
            >
              {images.map((img) => (
                <div
                  key={img.id}
                  className="card"
                  style={{ padding: 8, textAlign: "center" }}
                >
                  <img
                    src={img.url}
                    alt=""
                    style={{
                      width: "100%",
                      height: 120,
                      objectFit: "cover",
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                  />
                  <div className="d-flex justify-center gap-2">
                    <button
                      className="btn btn-danger"
                      onClick={() => onDelete(img)}
                      disabled={uploading}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
