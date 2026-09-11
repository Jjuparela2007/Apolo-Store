import { useAdminAuth } from "../context/AdminAuthContext";

export default function Topbar({ title }) {
  const { admin, logout } = useAdminAuth();

  return (
    <header className="bg-white border-b border-apolo-navy/10 px-8 py-4 flex items-center justify-between">
      <div className="flex-1 max-w-md">
        <input
          type="text"
          placeholder="Buscar en el panel..."
          className="w-full bg-apolo-ice rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-apolo-blue/30"
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-apolo-navy leading-tight">{admin?.fullName}</p>
          <p className="text-xs text-apolo-steel leading-tight">
            {admin?.role === "owner" ? "Admin" : "Staff"}
          </p>
        </div>
        <div className="w-9 h-9 rounded-full bg-apolo-navy text-white flex items-center justify-center text-sm font-semibold">
          {admin?.fullName?.[0]?.toUpperCase() || "A"}
        </div>
        <button onClick={logout} className="text-xs text-apolo-steel hover:text-apolo-navy border border-apolo-navy/15 rounded-lg px-3 py-2">
          Salir
        </button>
      </div>
    </header>
  );
}
