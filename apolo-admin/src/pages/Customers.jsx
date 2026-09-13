import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCustomers } from "../api/admin";

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getCustomers({ search: search || undefined })
      .then((data) => setCustomers(data.customers))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-3xl text-apolo-navy">Clientes</h1>
        <Link to="/clientes/nuevo" className="bg-apolo-blue hover:bg-apolo-blue-light text-white font-semibold px-5 py-2.5 rounded-lg transition-colors">
          + Añadir cliente
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-4">
        <input
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
        />
      </form>

      <div className="bg-white rounded-xl overflow-hidden">
        {loading ? (
          <p className="p-6 text-apolo-steel">Cargando…</p>
        ) : customers.length === 0 ? (
          <p className="p-6 text-apolo-steel">No se encontraron clientes.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-apolo-steel border-b bg-apolo-ice/50">
                <th className="p-4">Cliente</th>
                <th className="p-4">Teléfono</th>
                <th className="p-4">Pedidos</th>
                <th className="p-4">Total gastado</th>
                <th className="p-4">Registrado</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-apolo-navy/5 hover:bg-apolo-ice/40">
                  <td className="p-4">
                    <Link to={`/clientes/${c.id}`} className="block">
                      <p className="font-medium text-apolo-navy hover:text-apolo-blue hover:underline">{c.full_name}</p>
                      <p className="text-xs text-apolo-steel">{c.email}</p>
                    </Link>
                  </td>
                  <td className="p-4 text-apolo-steel">{c.phone || "—"}</td>
                  <td className="p-4">{c.order_count}</td>
                  <td className="p-4">{formatPrice(c.total_spent)}</td>
                  <td className="p-4 text-apolo-steel">{new Date(c.created_at).toLocaleDateString("es-CO")}</td>
                  <td className="p-4 text-right">
                    <Link to={`/clientes/${c.id}`} className="text-apolo-blue hover:underline">Ver detalle</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
