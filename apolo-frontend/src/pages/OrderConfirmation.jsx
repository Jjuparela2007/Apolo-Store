import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrder } from "../api/cart";

const STATUS_LABELS = {
  pending_payment: "Esperando confirmación de pago",
  paid: "Pago confirmado",
  processing: "En preparación",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id).then(setOrder).finally(() => setLoading(false));

    // El webhook de Wompi puede tardar unos segundos en llegar y actualizar el
    // estado — refresca solo cada pocos segundos mientras siga en pago pendiente,
    // sin que el cliente tenga que recargar la página a mano.
    const interval = setInterval(() => {
      getOrder(id).then((o) => {
        setOrder(o);
        if (o.status !== "pending_payment") clearInterval(interval);
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <p className="text-center py-24 text-apolo-steel">Cargando pedido…</p>;
  if (!order) return <p className="text-center py-24 text-apolo-steel">Pedido no encontrado.</p>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      <div className="text-center mb-8">
        <h1 className="font-display font-bold text-3xl text-apolo-navy mb-2">¡Gracias por tu pedido!</h1>
        <p className="text-apolo-steel">
          Pedido <span className="font-medium text-apolo-navy">{order.order_number}</span> — {STATUS_LABELS[order.status]}
        </p>
        {order.status === "pending_payment" && (
          <p className="text-sm text-apolo-steel mt-2">
            Estamos confirmando tu pago. Esta página se actualiza sola en cuanto quede lista.
          </p>
        )}
      </div>

      <div className="border border-apolo-navy/10 rounded-xl divide-y">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between p-4">
            <div>
              <p className="font-medium text-apolo-navy">{item.product_name}</p>
              <p className="text-sm text-apolo-steel">Talla {item.size} · {item.color} · x{item.quantity}</p>
            </div>
            <p className="font-medium text-apolo-navy">{formatPrice(item.unit_price * item.quantity)}</p>
          </div>
        ))}
        <div className="p-4 flex justify-between font-semibold text-apolo-navy">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="text-center mt-8">
        <Link to="/" className="text-apolo-blue hover:underline">Volver a la tienda</Link>
      </div>
    </div>
  );
}