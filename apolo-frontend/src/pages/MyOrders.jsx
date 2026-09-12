import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../api/cart";

const STATUS_LABELS = {
  pending_payment: "Pago pendiente",
  paid: "Pagado",
  processing: "En preparación",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center py-24 text-apolo-steel">Cargando pedidos…</p>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display font-bold text-3xl text-apolo-navy mb-6">Mis pedidos</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-apolo-navy/15 rounded-xl">
          <p className="text-apolo-steel mb-4">Todavía no tienes pedidos.</p>
          <Link
            to="/categoria/hombre"
            className="inline-block bg-apolo-blue hover:bg-apolo-blue-light text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            Ir a pedir
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/pedido/${order.id}`}
              className="flex items-center justify-between border border-apolo-navy/10 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div>
                <p className="font-medium text-apolo-navy">{order.order_number}</p>
                <p className="text-sm text-apolo-steel">
                  {new Date(order.created_at).toLocaleDateString("es-CO")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-apolo-navy">{formatPrice(order.total)}</p>
                <p className="text-sm text-apolo-steel">{STATUS_LABELS[order.status] || order.status}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}