import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../api/auth";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState(null);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setExpired(false);
    try {
      await resetPassword({ token, newPassword });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "El enlace es inválido o ya expiró.");
      setExpired(true); // cualquier error en este paso significa que el token ya no sirve
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-sm mx-auto px-6 py-20 text-center">
        <p className="text-apolo-steel">
          Este enlace no es válido. <Link to="/olvide-contrasena" className="text-apolo-blue hover:underline">Solicita uno nuevo</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <h1 className="font-display font-bold text-3xl text-apolo-navy mb-2">Nueva contraseña</h1>
      <p className="text-sm text-apolo-steel mb-6">Debe tener al menos 8 caracteres, con letras y números.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            required
            type={showPassword ? "text" : "password"}
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-apolo-steel hover:text-apolo-navy"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}

        {expired ? (
          <div className="space-y-2">
            <Link
              to="/olvide-contrasena"
              className="block text-center w-full bg-apolo-blue hover:bg-apolo-blue-light text-white font-semibold py-3 rounded-full transition-colors"
            >
              Solicitar un enlace nuevo
            </Link>
            <Link
              to="/login"
              className="block text-center w-full text-apolo-steel text-sm hover:text-apolo-navy py-2"
            >
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