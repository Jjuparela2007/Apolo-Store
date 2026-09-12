import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import { adminForgotPassword } from "../api/admin";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminForgotPassword(email);
      setSent(true); // el backend siempre responde igual, exista o no la cuenta
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
          <h2 className="text-white font-medium text-lg mb-4">Recuperar contraseña</h2>

          {sent ? (
            <p className="text-white/70 text-sm">
              Si el correo existe en el sistema, te enviamos un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-white/60 mb-1 block">Correo Electrónico</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/30 outline-none focus:border-apolo-blue"
                  placeholder="admin@apolosports.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-apolo-blue hover:bg-apolo-blue-light disabled:opacity-50 text-white font-semibold py-3 rounded-full transition-colors"
              >
                {loading ? "Enviando…" : "Enviar enlace"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-6">
          <Link to="/login" className="text-white/50 hover:text-white text-sm">← Volver a iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}