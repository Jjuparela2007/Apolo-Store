import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function Login() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "No pudimos iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-apolo-navy flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] rounded-full bg-apolo-blue/20 blur-3xl -top-40 -right-20" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-apolo-blue/10 blur-3xl bottom-0 left-0" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Logo className="h-14 w-14 mb-3" />
          <h1 className="font-display font-bold text-2xl text-white tracking-wide">APOLO SPORTS</h1>
          <p className="text-white/50 text-sm">Admin Panel</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm space-y-4"
        >
          <h2 className="text-white font-medium text-lg mb-2">Iniciar Sesión</h2>

          <div>
            <label className="text-xs text-white/60 mb-1 block">Correo Electrónico</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/30 outline-none focus:border-apolo-blue"
              placeholder="admin@apolosports.com"
            />
          </div>

          <div>
            <label className="text-xs text-white/60 mb-1 block">Contraseña</label>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/30 outline-none focus:border-apolo-blue"
              placeholder="••••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-apolo-blue hover:bg-apolo-blue-light disabled:opacity-50 text-white font-semibold py-3 rounded-full transition-colors mt-2"
          >
            {loading ? "Ingresando…" : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
