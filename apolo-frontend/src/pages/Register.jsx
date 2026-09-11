import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "No pudimos crear tu cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <h1 className="font-display font-bold text-3xl text-apolo-navy mb-2">Crear cuenta</h1>
      <p className="text-sm text-apolo-steel mb-6">La contraseña debe tener al menos 8 caracteres, con letras y números.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          placeholder="Nombre completo"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2"
        />
        <input
          required
          type="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2"
        />
        <input
          placeholder="Teléfono (opcional)"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2"
        />
        <input
          required
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-apolo-blue hover:bg-apolo-blue-light disabled:opacity-50 text-white font-semibold py-3 rounded-full transition-colors"
        >
          {loading ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>
      <p className="text-sm text-apolo-steel mt-6 text-center">
        ¿Ya tienes cuenta? <Link to="/login" className="text-apolo-blue hover:underline">Inicia sesión</Link>
      </p>
    </div>
  );
}
