import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateMyProfile, changeMyPassword } from "../api/auth";

export default function Account() {
  const { customer, isAuthenticated, updateSession } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="font-display font-bold text-3xl text-apolo-navy mb-4">Inicia sesión para ver tu cuenta</h1>
        <Link to="/login" className="inline-block bg-apolo-blue text-white font-semibold px-6 py-3 rounded-full">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display font-bold text-3xl text-apolo-navy mb-6">Mi cuenta</h1>
      <div className="space-y-6">
        <ProfileForm customer={customer} onUpdated={updateSession} />
        <PasswordForm />
      </div>
    </div>
  );
}

function ProfileForm({ customer, onUpdated }) {
  const [fullName, setFullName] = useState(customer?.fullName || "");
  const [emailValue, setEmailValue] = useState(customer?.email || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const { token, customer: updated } = await updateMyProfile({ fullName, email: emailValue, phone });
      onUpdated(token, updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.error || "No pudimos guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-apolo-navy/10 rounded-xl p-6">
      <h2 className="font-medium text-apolo-navy mb-4">Datos personales</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <div>
          <label className="text-xs text-apolo-steel mb-1 block">Nombre completo</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-apolo-steel mb-1 block">Correo electrónico</label>
          <input
            required
            type="email"
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
            className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
          />
          <p className="text-xs text-apolo-steel mt-1">Este es también el correo con el que inicias sesión.</p>
        </div>
        <div>
          <label className="text-xs text-apolo-steel mb-1 block">Teléfono</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Opcional"
            className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-green-600 font-medium">✓ Datos actualizados</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-apolo-blue hover:bg-apolo-blue-light disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await changeMyPassword({ currentPassword, newPassword });
      setSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.error || "No pudimos cambiar la contraseña.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-apolo-navy/10 rounded-xl p-6">
      <h2 className="font-medium text-apolo-navy mb-1">Cambiar contraseña</h2>
      <p className="text-xs text-apolo-steel mb-4">Debe tener al menos 8 caracteres, con letras y números.</p>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <div>
          <label className="text-xs text-apolo-steel mb-1 block">Contraseña actual</label>
          <div className="relative">
            <input
              required
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 pr-10 text-sm"
            />
            <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-apolo-steel hover:text-apolo-navy">
              {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs text-apolo-steel mb-1 block">Nueva contraseña</label>
          <div className="relative">
            <input
              required
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 pr-10 text-sm"
            />
            <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-apolo-steel hover:text-apolo-navy">
              {showNew ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-green-600 font-medium">✓ Contraseña actualizada</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-apolo-navy hover:bg-apolo-blue disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
        >
          {saving ? "Guardando…" : "Cambiar contraseña"}
        </button>
      </form>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <path d="M6.61 6.61A18.5 18.5 0 0 0 1 12s4 8 11 8a9.26 9.26 0 0 0 5.39-1.61" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
