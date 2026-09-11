import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../api/cart";

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

export default function Cart() {
  const { items, subtotal, updateItem, removeItem, refresh } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ shippingAddressLine: "", shippingCity: "", shippingDepartment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="font-display font-bold text-3xl text-apolo-navy mb-4">Inicia sesión para ver tu carrito</h1>
        <Link to="/login" className="inline-block bg-apolo-blue text-white font-semibold px-6 py-3 rounded-full">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="font-display font-bold text-3xl text-apolo-navy mb-4">Tu carrito está vacío</h1>
        <Link to="/" className="inline-block bg-apolo-blue text-white font-semibold px-6 py-3 rounded-full">
          Ir a comprar
        </Link>
      </div>
    );
  }

  const handleCheckout = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const order = await createOrder(form);
      await refresh();
      navigate(`/pedido/${order.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "No pudimos crear tu pedido. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-10">
      <div className="md:col-span-2 space-y-4">
        <h1 className="font-display font-bold text-3xl text-apolo-navy mb-4">Tu carrito</h1>
        {items.map((item) => (
          <div key={item.cart_item_id} className="flex gap-4 border-b border-apolo-navy/10 pb-4">
            <div className="w-20 h-20 bg-apolo-ice rounded-lg overflow-hidden shrink-0">
              {item.thumbnail_url && <img src={item.thumbnail_url} alt={item.product_name} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1">
              <p className="font-medium text-apolo-navy">{item.product_name}</p>
              <p className="text-sm text-apolo-steel">Talla {item.size} · {item.color}</p>
              <p className="font-semibold text-apolo-navy mt-1">{formatPrice(item.unit_price)}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <select
                value={item.quantity}
                onChange={(e) => updateItem(item.cart_item_id, Number(e.target.value))}
                className="border border-apolo-navy/20 rounded-lg px-2 py-1 text-sm"
              >
                {Array.from({ length: Math.min(item.stock, 10) || 1 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <button onClick={() => removeItem(item.cart_item_id)} className="text-xs text-red-600 hover:underline">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-apolo-ice rounded-xl p-6 h-fit">
        <h2 className="font-medium text-apolo-navy mb-4">Resumen</h2>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-apolo-steel">Subtotal</span>
          <span className="font-medium text-apolo-navy">{formatPrice(subtotal)}</span>
        </div>
        <p className="text-xs text-apolo-steel mb-4">El envío se calcula después de confirmar tu dirección.</p>

        <form onSubmit={handleCheckout} className="space-y-3">
          <input
            required
            placeholder="Dirección de envío"
            value={form.shippingAddressLine}
            onChange={(e) => setForm({ ...form, shippingAddressLine: e.target.value })}
            className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Ciudad"
            value={form.shippingCity}
            onChange={(e) => setForm({ ...form, shippingCity: e.target.value })}
            className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Departamento"
            value={form.shippingDepartment}
            onChange={(e) => setForm({ ...form, shippingDepartment: e.target.value })}
            className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-apolo-blue hover:bg-apolo-blue-light disabled:opacity-50 text-white font-semibold py-3 rounded-full transition-colors"
          >
            {submitting ? "Procesando…" : "Continuar al pago"}
          </button>
        </form>
      </div>
    </div>
  );
}
