import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUser, updateUser } from "../api/users";

export default function ProfilePage() {
  const { user } = useAuth();
  const userId = user?.id;

  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      if (!userId) {
        setErr("Usuário não autenticado.");
        setLoading(false);
        return;
      }
      try {
        setErr("");
        setLoading(true);
        const u = await getUser(userId);
        setForm({
          name: u?.name || "",
          email: u?.email || "",
        });
      } catch (e) {
        setErr(e?.response?.data?.error || e?.message || "Falha ao carregar perfil.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!userId) return;
    try {
      setErr("");
      setMsg("");
      setSaving(true);

      const payload = {};
      if (form.name?.trim())  payload.name = form.name.trim();
      if (form.email?.trim()) payload.email = form.email.trim();

      await updateUser(userId, payload);
      setMsg("Perfil atualizado com sucesso!");
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || "Falha ao atualizar perfil.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: 16 }}>Carregando…</div>;

  return (
    <div style={{ maxWidth: 420, margin: "32px auto", padding: 16 }}>
      <h2 className="mb-2">Meu perfil</h2>

      {err && <div className="alert alert-error">{err}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      <form onSubmit={onSubmit} className="grid" style={{ gap: 8 }}>
        <input
          className="form-control"
          placeholder="Nome"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="form-control"
          placeholder="E-mail"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </button>

        <div style={{ opacity: 0.7, fontSize: 12, marginTop: 8 }}>
          ID do usuário: {userId} • Papel: {user?.role || "-"}
        </div>
      </form>
    </div>
  );
}
