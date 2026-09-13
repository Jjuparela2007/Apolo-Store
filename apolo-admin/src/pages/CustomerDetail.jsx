import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCustomer } from "../api/admin";

const STATUS_LABELS = {
  pending_payment: "Pago pendiente",
  paid: "Pagado",
  processing: "En preparación",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};
const STATUS_COLORS = {
  pending_payment: "#F5A623",
  paid: "#1E7FE8",
  processing: "#4FA0FF",
  shipped: "#0A1830",
  delivered: "#22C55E",
  cancelled: "#EF4444",
  refunded: "#94A3B8",
};

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCustomer(id)
      .then((data) => {
        setCustomer(data.customer);
        setOrders(data.orders);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-apolo-steel">Cargando…</p>;
  if (!customer) return <p className="text-apolo-steel">Cliente no encontrado.</p>;

  const paidOrders = orders.filter((o) =>
    ["paid", "processing", "shipped", "delivered"].includes(o.status)
  );
  const totalSpent = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/clientes" className="text-apolo-blue hover:underline text-sm">← Clientes</Link>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-apolo-navy">{customer.full_name}</h1>
          <p className="text-apolo-steel">{customer.email}</p>
          {customer.phone && <p className="text-apolo-steel text-sm">{customer.phone}</p>}
        </div>
        <p className="text-sm text-apolo-steel">
          Cliente desde {new Date(customer.created_at).toLocaleDateString("es-CO")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5">
          <p className="text-sm text-apolo-steel mb-1">Total de pedidos</p>
          <p className="text-2xl font-display font-bold text-apolo-navy">{orders.length}</p>
        </div>
        <div className="bg-apolo-navy text-white rounded-xl p-5">
          <p className="text-sm text-white/70 mb-1">Total gastado (pedidos pagados)</p>
          <p className="text-2xl font-display font-bold">{formatPrice(totalSpent)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6">
        <h2 className="font-medium text-apolo-navy mb-4">Historial de compras</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-apolo-steel">Este cliente aún no tiene pedidos.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-apolo-steel border-b">
                <th className="pb-2">ID Pedido</th>
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Estado</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-apolo-navy/5">
                  <td className="py-2 font-medium text-apolo-navy">{o.order_number}</td>
                  <td className="py-2 text-apolo-steel">{new Date(o.created_at).toLocaleDateString("es-CO")}</td>
                  <td className="py-2">{formatPrice(o.total)}</td>
                  <td className="py-2">
                    <span
                      className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{ backgroundColor: `${STATUS_COLORS[o.status]}20`, color: STATUS_COLORS[o.status] }}
                    >
                      {STATUS_LABELS[o.status] || o.status}
                    </span>
                  </td>
                  <td className="py-2 text-right">
                    <Link to={`/pedidos/${o.id}`} className="text-apolo-blue hover:underline">Ver</Link>
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
