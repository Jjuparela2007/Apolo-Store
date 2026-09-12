import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Logo from "../components/Logo";
import { adminResetPassword } from "../api/admin";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setExpired(false);
    try {
      await adminResetPassword({ token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "El enlace es inválido o ya expiró.");
      setExpired(true);
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

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          {!token ? (
            <p className="text-white/70 text-sm">
              Este enlace no es válido.{" "}
              <Link to="/olvide-contrasena" className="text-apolo-blue-light hover:underline">Solicita uno nuevo</Link>.
            </p>
          ) : success ? (
            <p className="text-white/70 text-sm">✓ Contraseña actualizada. Te llevamos a iniciar sesión…</p>
          ) : (
            <>
              <h2 className="text-white font-medium text-lg mb-1">Nueva contraseña</h2>
              <p className="text-white/50 text-xs mb-4">Debe tener al menos 8 caracteres, con letras y números.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 pr-10 text-white placeholder-white/30 outline-none focus:border-apolo-blue"
                    placeholder="••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                {expired ? (
                  <div className="space-y-2">
                    <Link
                      to="/olvide-contrasena"
                      className="block text-center w-full bg-apolo-blue hover:bg-apolo-blue-light text-white font-semibold py-3 rounded-full transition-colors"
                    >
                      Solicitar un enlace nuevo
                    </Link>
                    <Link to="/login" className="block text-center w-full text-white/50 hover:text-white text-sm py-2">
                      Ir a iniciar sesión
                    </Link>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-apolo-blue hover:bg-apolo-blue-light disabled:opacity-50 text-white font-semibold py-3 rounded-full transition-colors"
                  >
                    {loading ? "Guardando…" : "Guardar contraseña"}
                  </button>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
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