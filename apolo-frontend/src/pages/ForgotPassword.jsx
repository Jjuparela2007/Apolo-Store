import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true); // el backend siempre responde igual, exista o no la cuenta
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <h1 className="font-display font-bold text-3xl text-apolo-navy mb-4">Recuperar contraseña</h1>
      {sent ? (
        <p className="text-apolo-steel">
          Si el correo existe en nuestro sistema, te enviamos un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            type="email"
            placeholder="Tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-apolo-blue hover:bg-apolo-blue-light disabled:opacity-50 text-white font-semibold py-3 rounded-full transition-colors"
          >
            {loading ? "Enviando…" : "Enviar enlace"}
          </button>
        </form>
      )}
      <p className="text-sm text-apolo-steel mt-6 text-center">
        <Link to="/login" className="text-apolo-blue hover:underline">Volver a iniciar sesión</Link>
      </p>
    </div>
  );
}
