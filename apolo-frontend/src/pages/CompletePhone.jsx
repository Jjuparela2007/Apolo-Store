import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateMyProfile } from "../api/auth";

// Se muestra cuando customer.needsPhone es true (justo después de un login con
// Google que no trae teléfono) o cuando el backend rechazó una acción con
// code: "PHONE_REQUIRED" (ver Cart.jsx). Guarda el teléfono con el mismo
// endpoint que usa el perfil normal y de ahí sigue a donde el usuario iba.
export default function CompletePhone() {
  const { customer, isAuthenticated, updateSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) {
    navigate("/login", { replace: true });
    return null;
  }

  const redirectTo = location.state?.from || "/carrito";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { token, customer: updated } = await updateMyProfile({ phone });
      // updated ya viene sin needsPhone (el backend no lo manda en updateMe),
      // así que la bandera queda limpia apenas se guarda la sesión.
      updateSession(token, updated);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "No pudimos guardar tu teléfono. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <h1 className="font-display font-bold text-3xl text-apolo-navy mb-2">Falta un dato</h1>
      <p className="text-sm text-apolo-steel mb-6">
        {customer?.fullName ? `Hola ${customer.fullName}, n` : "N"}
        ecesitamos tu número de teléfono para poder contactarte sobre tus pedidos antes de continuar.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          autoFocus
          type="tel"
          placeholder="Teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-apolo-blue hover:bg-apolo-blue-light disabled:opacity-50 text-white font-semibold py-3 rounded-full transition-colors"
        >
          {submitting ? "Guardando…" : "Continuar"}
        </button>
      </form>
      <p className="text-sm text-apolo-steel mt-6 text-center">
        <Link to="/" className="text-apolo-blue hover:underline">Volver al inicio</Link>
      </p>
    </div>
  );
}
