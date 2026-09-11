import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../api/auth";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await resetPassword({ token, newPassword });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "El enlace es inválido o ya expiró.");
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
        <input
          required
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-apolo-blue hover:bg-apolo-blue-light disabled:opacity-50 text-white font-semibold py-3 rounded-full transition-colors"
        >
          {loading ? "Guardando…" : "Guardar contraseña"}
        </button>
      </form>
    </div>
  );
}
