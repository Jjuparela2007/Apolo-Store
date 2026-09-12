import { useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { updateMyAdminProfile, changeMyAdminPassword } from "../api/admin";

export default function Settings() {
  const { admin, updateSession } = useAdminAuth();

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-apolo-navy mb-6">Configuración</h1>
      <div className="grid lg:grid-cols-2 gap-6 max-w-3xl">
        <ProfileForm admin={admin} onUpdated={updateSession} />
        <PasswordForm />
      </div>
    </div>
  );
}

function ProfileForm({ admin, onUpdated }) {
  const [fullName, setFullName] = useState(admin?.fullName || "");
  const [emailValue, setEmailValue] = useState(admin?.email || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const { token, user } = await updateMyAdminProfile({ fullName, email: emailValue });
      onUpdated(token, user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.error || "No pudimos guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6">
      <h2 className="font-medium text-apolo-navy mb-4">Mi perfil</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-green-600 font-medium">✓ Perfil actualizado</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-apolo-blue hover:bg-apolo-blue-light disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
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
      await changeMyAdminPassword({ currentPassword, newPassword });
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
    <div className="bg-white rounded-xl p-6">
      <h2 className="font-medium text-apolo-navy mb-1">Cambiar contraseña</h2>
      <p className="text-xs text-apolo-steel mb-4">Debe tener al menos 8 caracteres, con letras y números.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          className="bg-apolo-navy hover:bg-apolo-blue disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
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