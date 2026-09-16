import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Logo from "../components/Logo";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function Login() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null); // guarda el nombre del admin al entrar
  const [showPassword, setShowPassword] = useState(false);

  const sessionExpired = searchParams.get("expired") === "1";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(form.email, form.password);
      setSuccess(user.fullName);
      setTimeout(() => navigate("/"), 5000);
    } catch (err) {
      setError(err.response?.data?.error || "No pudimos iniciar sesión.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-apolo-navy flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute w-[600px] h-[600px] rounded-full bg-apolo-blue/20 blur-3xl -top-52 -right-32" />
      <div className="absolute w-[450px] h-[450px] rounded-full bg-apolo-blue/10 blur-3xl -bottom-20 -left-20" />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-5">
            <div aria-hidden className="absolute -inset-4 rounded-full bg-apolo-blue/20 blur-2xl" />
            <Logo className="relative h-20 w-auto drop-shadow-[0_4px_16px_rgba(0,0,0,0.35)]" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white tracking-wide">APOLO SPORTS</h1>
          <div className="flex items-center gap-2.5 mt-2">
            <span className="h-px w-7 bg-apolo-blue-light/40" />
            <p className="text-white/50 text-sm">Panel administrativo</p>
            <span className="h-px w-7 bg-apolo-blue-light/40" />
          </div>
        </div>

        {success ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-md shadow-2xl shadow-black/40 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-5">
              <CheckIcon />
            </div>
            <h2 className="text-white font-medium text-xl mb-1.5">¡Bienvenido, {success}!</h2>
            <p className="text-white/60 text-sm">Entrando al panel…</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-md shadow-2xl shadow-black/40 space-y-5"
          >
            <h2 className="text-white font-medium text-xl mb-1">Iniciar sesión</h2>

            {sessionExpired && (
              <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg px-3 py-2.5 text-xs">
                <ClockIcon />
                <span>Tu sesión expiró. Inicia sesión de nuevo.</span>
              </div>
            )}

            <div>
              <label className="text-xs text-white/60 mb-1.5 block">Correo electrónico</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-apolo-navy/40">
                  <MailIcon />
                </span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-3 py-3 text-white placeholder-white/30 outline-none focus:border-apolo-blue focus:bg-white/[0.14] transition-colors"
                  placeholder="admin@apolosports.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/60 mb-1.5 block">Contraseña</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-apolo-navy/40">
                  <LockIcon />
                </span>
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-white/30 outline-none focus:border-apolo-blue focus:bg-white/[0.14] transition-colors"
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-apolo-navy/40 hover:text-apolo-navy/70 transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link to="/olvide-contrasena" className="text-sm text-apolo-blue-light hover:underline">
                Olvidé mi contraseña
              </Link>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-apolo-blue hover:bg-apolo-blue-light disabled:opacity-50 text-white font-semibold py-3.5 rounded-full transition-colors mt-2"
            >
              {loading ? "Ingresando…" : "Iniciar sesión"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2.5" />
      <path d="m3 6.5 9 6 9-6" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="10.5" width="16" height="10.5" rx="2" />
      <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <path d="M6.61 6.61A18.5 18.5 0 0 0 1 12s4 8 11 8a9.26 9.26 0 0 0 5.39-1.61" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 mt-0.5">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  );
}