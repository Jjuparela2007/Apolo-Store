import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createCustomer } from "../api/admin";

export default function CustomerForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const customer = await createCustomer(form);
      navigate(`/clientes/${customer.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo crear el cliente. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/clientes" className="text-apolo-blue hover:underline text-sm">← Clientes</Link>
      </div>
      <h1 className="font-display font-bold text-3xl text-apolo-navy mb-6">Añadir cliente</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-apolo-navy mb-1">Nombre completo</label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
            className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-apolo-navy mb-1">Correo electrónico</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-apolo-navy mb-1">Teléfono (opcional)</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-apolo-navy mb-1">Contraseña</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
            className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
          />
          <p className="text-xs text-apolo-steel mt-1">Mínimo 8 caracteres. El cliente podrá cambiarla después.</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-apolo-blue hover:bg-apolo-blue-light text-white font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {saving ? "Creando…" : "Crear cliente"}
        </button>
      </form>
    </div>
  );
}
