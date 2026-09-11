import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from || "/");
    } catch (err) {
      setError(err.response?.data?.error || "No pudimos iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <h1 className="font-display font-bold text-3xl text-apolo-navy mb-6">Iniciar sesión</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          type="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
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
        <div className="text-right">
          <Link to="/olvide-contrasena" className="text-sm text-apolo-blue hover:underline">
            Olvidé mi contraseña
          </Link>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-apolo-blue hover:bg-apolo-blue-light disabled:opacity-50 text-white font-semibold py-3 rounded-full transition-colors"
        >
          {loading ? "Ingresando…" : "Iniciar sesión"}
        </button>
      </form>
      <p className="text-sm text-apolo-steel mt-6 text-center">
        ¿No tienes cuenta? <Link to="/registro" className="text-apolo-blue hover:underline">Regístrate</Link>
      </p>
    </div>
  );
}
