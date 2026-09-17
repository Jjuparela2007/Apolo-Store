import { useState } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null); // guarda el nombre del cliente al entrar
  const [showPassword, setShowPassword] = useState(false);

  const justRegistered = Boolean(location.state?.justRegistered);
  const sessionExpired = searchParams.get("expired") === "1";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const customer = await login(form.email, form.password);
      setSuccess(customer.fullName);
      setTimeout(() => navigate(location.state?.from || "/"), 5000);
    } catch (err) {
      setError(err.response?.data?.error || "No pudimos iniciar sesión.");
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);
    try {
      const customer = await loginWithGoogle(credentialResponse.credential);
      setSuccess(customer.fullName);
      // Si la cuenta de Google no trae teléfono, lo pedimos antes de mandarlo
      // a donde iba — createOrder lo va a bloquear igual si se lo saltan.
      if (customer.needsPhone) {
        setTimeout(
          () => navigate("/completar-perfil", { state: { from: location.state?.from || "/" } }),
          5000
        );
      } else {
        setTimeout(() => navigate(location.state?.from || "/"), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "No pudimos iniciar sesión con Google.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-sm mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
          <CheckIcon />
        </div>
        <h1 className="font-display font-bold text-3xl text-apolo-navy mb-2">¡Bienvenido, {success}!</h1>
        <p className="text-apolo-steel">Iniciaste sesión correctamente. Te llevamos a la tienda…</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <h1 className="font-display font-bold text-3xl text-apolo-navy mb-6">Iniciar sesión</h1>

      {justRegistered && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-6">
          <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
            <CheckIcon small />
          </span>
          <p className="text-sm">Cuenta creada exitosamente. Inicia sesión para continuar.</p>
        </div>
      )}

      {sessionExpired && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-4 py-3 mb-6">
          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
            <ClockIcon />
          </span>
          <p className="text-sm">Tu sesión expiró. Inicia sesión de nuevo para continuar.</p>
        </div>
      )}

      <div className="flex justify-center mb-4">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError("No pudimos iniciar sesión con Google.")}
          text="continue_with"
          shape="pill"
          width="320"
        />
      </div>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-apolo-navy/10" />
        <span className="text-xs text-apolo-steel">o</span>
        <div className="flex-1 h-px bg-apolo-navy/10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          type="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2"
        />
        <div className="relative">
          <input
            required
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
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
function CheckIcon({ small }) {
  const size = small ? 12 : 28;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  );
}