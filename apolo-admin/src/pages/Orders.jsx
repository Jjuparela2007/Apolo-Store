import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../api/admin";

const STATUS_LABELS = {
  pending_payment: "Pago pendiente",
  paid: "Pagado",
  processing: "En preparación",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};
const STATUS_STYLES = {
  pending_payment: "bg-amber-100 text-amber-700",
  paid: "bg-blue-100 text-blue-700",
  processing: "bg-sky-100 text-sky-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-600",
};

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getOrders({ status: status || undefined }).then(setOrders).finally(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-3xl text-apolo-navy">Pedidos</h1>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm">
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl overflow-hidden">
        {loading ? (
          <p className="p-6 text-apolo-steel">Cargando…</p>
        ) : orders.length === 0 ? (
          <p className="p-6 text-apolo-steel">No hay pedidos con este filtro.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-apolo-steel border-b bg-apolo-ice/50">
                <th className="p-4">ID Pedido</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Total</th>
                <th className="p-4">Estado</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-apolo-navy/5">
                  <td className="p-4 font-medium text-apolo-navy">{o.order_number}</td>
                  <td className="p-4 text-apolo-steel">{o.customer_email}</td>
                  <td className="p-4 text-apolo-steel">{new Date(o.created_at).toLocaleDateString("es-CO")}</td>
                  <td className="p-4">{formatPrice(o.total)}</td>
                  <td className="p-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[o.status] || ""}`}>
                      {STATUS_LABELS[o.status] || o.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link to={`/pedidos/${o.id}`} className="text-apolo-blue hover:underline">Ver detalle</Link>
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
