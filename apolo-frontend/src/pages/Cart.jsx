import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder, quoteOrder } from "../api/cart";
import { getCheckoutSignature } from "../api/payments";
import { getDepartments, getCitiesByDepartment } from "../data/colombia-locations";

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

// Abre el widget de pago de Wompi. La confirmación real del pago SIEMPRE llega
// después por el webhook al backend — este callback solo nos dice que el cliente
// terminó de interactuar con el widget (aprobado, rechazado, o simplemente lo cerró),
// nunca hay que confiar en esto para marcar la orden como pagada.
function openWompiWidget({ signature, reference, amountInCents, publicKey, onFinish }) {
  if (!window.WidgetCheckout) {
    onFinish({ error: "No pudimos cargar la pasarela de pago. Revisa tu conexión e intenta de nuevo." });
    return;
  }

  const checkout = new window.WidgetCheckout({
    currency: "COP",
    amountInCents,
    reference,
    publicKey,
    signature: { integrity: signature },
  });

  checkout.open((result) => onFinish({ transaction: result?.transaction }));
}

const DEPARTMENTS = getDepartments();

export default function Cart() {
  const { items, subtotal, updateItem, removeItem, refresh } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ shippingAddressLine: "", shippingCity: "", shippingDepartment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [quote, setQuote] = useState(null);

  // Ciudades disponibles según el departamento elegido (select en cascada).
  const availableCities = useMemo(
    () => (form.shippingDepartment ? getCitiesByDepartment(form.shippingDepartment) : []),
    [form.shippingDepartment]
  );

  const handleDepartmentChange = (departamento) => {
    // Al cambiar de departamento, la ciudad que tenía seleccionada ya no aplica.
    setForm((prev) => ({ ...prev, shippingDepartment: departamento, shippingCity: "" }));
  };

  // Pide el desglose (subtotal + envío = total) cada vez que cambian el
  // carrito o la ciudad — así el envío se calcula de verdad en cuanto el
  // cliente termina de elegirla, y el total que ve aquí es el mismo que se le
  // va a cobrar en Wompi. Se calcula en el backend, nunca confiamos en un
  // shippingCost que mande el cliente. El backend ya devuelve el envío con
  // la comisión de la pasarela incluida, así que aquí no hay nada aparte que mostrar.
  useEffect(() => {
    if (!isAuthenticated || items.length === 0) return;
    const timeout = setTimeout(() => {
      quoteOrder({ shippingCity: form.shippingCity, shippingDepartment: form.shippingDepartment })
        .then(setQuote)
        .catch(() => setQuote(null));
    }, 400); // debounce mientras el cliente sigue eligiendo
    return () => clearTimeout(timeout);
  }, [isAuthenticated, items, subtotal, form.shippingCity]);


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
      // 1. Crear la orden — esto ya reserva el stock del lado del backend.
      const order = await createOrder(form);
      await refresh();

      // 2. Pedir la firma de integridad para poder abrir el widget con este monto exacto.
      const { signature, reference, amountInCents, publicKey } = await getCheckoutSignature(order.id);

      // 3. Abrir el widget. Pase lo que pase ahí, llevamos al cliente a ver el estado
      //    real de su orden — el webhook es quien decide si quedó pagada.
      openWompiWidget({
        signature, reference, amountInCents, publicKey,
        onFinish: ({ error: widgetError }) => {
          if (widgetError) setError(widgetError);
          navigate(`/pedido/${order.id}`);
        },
      });
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
          <span className="font-medium text-apolo-navy">{formatPrice(quote?.subtotal ?? subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-apolo-steel">Envío</span>
          <span className="font-medium text-apolo-navy">
            {form.shippingCity
              ? (quote ? (quote.shippingCost === 0 ? "Gratis" : formatPrice(quote.shippingCost)) : "Calculando…")
              : "Elige tu ciudad"}
          </span>
        </div>
        <div className="flex justify-between text-sm font-semibold text-apolo-navy border-t border-apolo-navy/10 mt-2 pt-2 mb-4">
          <span>Total</span>
          <span>{quote ? formatPrice(quote.total) : formatPrice(subtotal)}</span>
        </div>

        <form onSubmit={handleCheckout} className="space-y-3">
          <input
            required
            placeholder="Dirección de envío"
            value={form.shippingAddressLine}
            onChange={(e) => setForm({ ...form, shippingAddressLine: e.target.value })}
            className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
          />
          <select
            required
            value={form.shippingDepartment}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm text-apolo-navy"
          >
            <option value="" disabled>Departamento</option>
            {DEPARTMENTS.map((dep) => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
          <select
            required
            disabled={!form.shippingDepartment}
            value={form.shippingCity}
            onChange={(e) => setForm({ ...form, shippingCity: e.target.value })}
            className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm text-apolo-navy disabled:opacity-50"
          >
            <option value="" disabled>
              {form.shippingDepartment ? "Ciudad" : "Elige primero el departamento"}
            </option>
            {availableCities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

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