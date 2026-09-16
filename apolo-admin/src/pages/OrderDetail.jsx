import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrder, updateOrderStatus } from "../api/admin";

const STATUS_LABELS = {
  pending_payment: "Pago pendiente", paid: "Pagado", processing: "En preparación",
  shipped: "Enviado", delivered: "Entregado", cancelled: "Cancelado", refunded: "Reembolsado",
};
const STATUS_OPTIONS = Object.keys(STATUS_LABELS);

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getOrder(id).then((o) => { setOrder(o); setSelectedStatus(o.status); }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-apolo-steel">Cargando…</p>;
  if (!order) return <p className="text-apolo-steel">Pedido no encontrado.</p>;

  const handleSaveStatus = async () => {
    if (selectedStatus === order.status) return;
    // Cancelar libera automáticamente el stock reservado — vale la pena confirmar antes.
    if (selectedStatus === "cancelled" && !confirm("Al cancelar, el stock reservado de este pedido se libera automáticamente. ¿Continuar?")) {
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await updateOrderStatus(order.id, selectedStatus);
      setOrder(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.error || "No pudimos actualizar el estado.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Link to="/pedidos" className="text-sm text-apolo-steel hover:text-apolo-navy">← Volver a Pedidos</Link>
      <div className="flex items-center justify-between mb-6 mt-2">
        <h1 className="font-display font-bold text-3xl text-apolo-navy">{order.order_number}</h1>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${order.channel === "local" ? "bg-purple-100 text-purple-700" : "bg-apolo-blue/10 text-apolo-blue"}`}>
            {order.channel === "local" ? "Venta en tienda" : "Pedido online"}
          </span>
          <span className="text-sm font-medium px-3 py-1.5 rounded-full bg-apolo-blue/10 text-apolo-blue">
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6">
          <h2 className="font-medium text-apolo-navy mb-4">Productos</h2>
          <table className="w-full text-sm">
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-apolo-navy/5">
                  <td className="py-3">
                    <p className="font-medium text-apolo-navy">{item.product_name}</p>
                    <p className="text-apolo-steel text-xs">Talla {item.size} · {item.color} · x{item.quantity}</p>
                  </td>
                  <td className="py-3 text-right font-medium text-apolo-navy">
                    {formatPrice(item.unit_price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between pt-4 mt-2 border-t font-semibold text-apolo-navy">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6">
            <h2 className="font-medium text-apolo-navy mb-3">Estado del pedido</h2>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm mb-3"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <button
              onClick={handleSaveStatus}
              disabled={saving || selectedStatus === order.status}
              className="w-full bg-apolo-navy hover:bg-apolo-blue disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
            >
              {saving ? "Guardando…" : "Actualizar estado"}
            </button>
            {saved && <p className="text-sm text-green-600 mt-2">✓ Estado actualizado y cliente notificado</p>}
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>

          <div className="bg-white rounded-xl p-6">
            <h2 className="font-medium text-apolo-navy mb-2">Cliente</h2>
            {order.channel === "local" ? (
              <>
                <p className="text-sm text-apolo-steel">{order.walk_in_customer_name || "Cliente de mostrador (sin nombre)"}</p>
                {order.walk_in_customer_phone && <p className="text-sm text-apolo-steel">{order.walk_in_customer_phone}</p>}
              </>
            ) : (
              <p className="text-sm text-apolo-steel">{order.customer_email}</p>
            )}
          </div>
          {order.channel === "online" && (
            <div className="bg-white rounded-xl p-6">
              <h2 className="font-medium text-apolo-navy mb-2">Envío</h2>
              <p className="text-sm text-apolo-steel">{order.shipping_address_line}</p>
              <p className="text-sm text-apolo-steel">{order.shipping_city}, {order.shipping_department}</p>
            </div>
          )}
          {order.payments?.length > 0 && (
            <div className="bg-white rounded-xl p-6">
              <h2 className="font-medium text-apolo-navy mb-2">Pagos</h2>
              {order.payments.map((p) => (
                <p key={p.id} className="text-sm text-apolo-steel">
                  {p.payment_method} — {p.status} — {formatPrice(p.amount)}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}