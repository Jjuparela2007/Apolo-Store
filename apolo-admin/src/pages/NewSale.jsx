import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, getProduct, createManualSale } from "../api/admin";

const PAYMENT_METHODS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "tarjeta", label: "Tarjeta (datáfono)" },
  { value: "transferencia", label: "Transferencia" },
];

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

export default function NewSale() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [items, setItems] = useState([]); // { variantId, productName, size, color, unitPrice, quantity, stock }
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setSearching(true);
    try {
      // status=all para que tambi\u00e9n aparezcan borradores si el admin quiere venderlos igual
      const data = await getProducts({ search, status: "all", limit: 10 });
      setResults(data.products);
    } finally {
      setSearching(false);
    }
  };

  const addVariantToSale = (product, variant) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === variant.id);
      if (existing) {
        return prev.map((i) => (i.variantId === variant.id ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) } : i));
      }
      return [
        ...prev,
        {
          variantId: variant.id,
          productName: product.name,
          thumbnailUrl: product.thumbnail_url,
          size: variant.size,
          color: variant.color,
          unitPrice: product.offer_price ?? product.base_price,
          quantity: 1,
          stock: variant.stock,
        },
      ];
    });
  };

  const updateQuantity = (variantId, quantity) => {
    setItems((prev) =>
      prev
        .map((i) => (i.variantId === variantId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i))
    );
  };

  const removeItem = (variantId) => setItems((prev) => prev.filter((i) => i.variantId !== variantId));

  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("Agrega al menos un producto antes de registrar la venta.");
      return;
    }
    if (!customerEmail.trim()) {
      setError("El correo del cliente es obligatorio.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const order = await createManualSale({
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        paymentMethod,
        customerEmail: customerEmail.trim(),
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
      });
      setSuccess({
        orderNumber: order.order_number,
        isNewCustomer: order.is_new_customer,
      });
      setItems([]);
      setCustomerEmail("");
      setCustomerName("");
      setCustomerPhone("");
      setResults([]);
      setSearch("");
    } catch (err) {
      setError(err.response?.data?.error || "No pudimos registrar la venta.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-apolo-navy mb-6">Nueva venta en tienda</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl p-6">
            <h2 className="font-medium text-apolo-navy mb-3">Buscar producto</h2>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre del producto..."
                className="flex-1 border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
              />
              <button type="submit" disabled={searching} className="bg-apolo-navy text-white text-sm font-medium px-4 rounded-lg">
                {searching ? "Buscando…" : "Buscar"}
              </button>
            </form>

            {results.length > 0 && (
              <div className="space-y-3">
                {results.map((p) => (
                  <ProductSearchResult key={p.id} product={p} onPick={addVariantToSale} />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6">
            <h2 className="font-medium text-apolo-navy mb-3">Productos en esta venta</h2>
            {items.length === 0 ? (
              <p className="text-sm text-apolo-steel">Busca un producto arriba y elige la talla/color para agregarlo aquí.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {items.map((i) => (
                    <tr key={i.variantId} className="border-b border-apolo-navy/5">
                      <td className="py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-apolo-ice rounded-lg overflow-hidden shrink-0">
                            {i.thumbnailUrl && (
                              <img src={i.thumbnailUrl} alt={i.productName} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-apolo-navy">{i.productName}</p>
                            <p className="text-xs text-apolo-steel">Talla {i.size} · {i.color}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2">
                        <input
                          type="number" min="1" max={i.stock} value={i.quantity}
                          onChange={(e) => updateQuantity(i.variantId, Number(e.target.value))}
                          className="w-16 border border-apolo-navy/20 rounded px-2 py-1"
                        />
                      </td>
                      <td className="py-2 text-right font-medium text-apolo-navy">
                        {formatPrice(i.unitPrice * i.quantity)}
                      </td>
                      <td className="py-2 text-right">
                        <button type="button" onClick={() => removeItem(i.variantId)} className="text-red-600 text-xs hover:underline">Quitar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 h-fit space-y-4">
          <h2 className="font-medium text-apolo-navy">Resumen</h2>
          <div className="flex justify-between text-sm">
            <span className="text-apolo-steel">Total</span>
            <span className="font-semibold text-apolo-navy text-lg">{formatPrice(total)}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-apolo-steel mb-1 block">Método de pago</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-apolo-steel mb-1 block">Correo del cliente</label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="cliente@correo.com"
                className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
              />
              <p className="text-[11px] text-apolo-steel mt-1">
                Si ya está registrado, la venta se guarda en su historial. Si no, se le crea una cuenta.
              </p>
            </div>
            <div>
              <label className="text-xs text-apolo-steel mb-1 block">Nombre del cliente (opcional)</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-apolo-steel mb-1 block">Teléfono (opcional)</label>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && (
              <p className="text-sm text-green-600 font-medium">
                ✓ Venta registrada: {success.orderNumber}. El stock ya quedó descontado.
                {success.isNewCustomer && " Se creó una cuenta nueva para el cliente."}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="w-full bg-apolo-blue hover:bg-apolo-blue-light disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {submitting ? "Registrando…" : "Registrar venta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ProductSearchResult({ product, onPick }) {
  const hasVariants = product.variants?.length > 0;
  // El listado de búsqueda no trae variantes (viene del catálogo) — se piden aparte
  // solo cuando el admin expande este producto, para no cargar todo de una.
  const [expanded, setExpanded] = useState(false);
  const [variants, setVariants] = useState(product.variants || null);
  const [loadingVariants, setLoadingVariants] = useState(false);

  const toggle = async () => {
    if (!expanded && variants === null) {
      setLoadingVariants(true);
      const full = await getProduct(product.id);
      setVariants(full.variants);
      setLoadingVariants(false);
    }
    setExpanded((v) => !v);
  };

  return (
    <div className="border border-apolo-navy/10 rounded-lg">
      <button type="button" onClick={toggle} className="w-full flex items-center justify-between px-3 py-2 text-left">
        <span className="flex items-center gap-3">
          <span className="w-10 h-10 bg-apolo-ice rounded-lg overflow-hidden shrink-0 block">
            {product.thumbnail_url && (
              <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover" />
            )}
          </span>
          <span className="text-sm font-medium text-apolo-navy">{product.name}</span>
        </span>
        <span className="text-xs text-apolo-steel">{expanded ? "Ocultar" : "Ver tallas"}</span>
      </button>
      {expanded && (
        <div className="px-3 pb-3">
          {loadingVariants ? (
            <p className="text-xs text-apolo-steel">Cargando…</p>
          ) : variants.length === 0 ? (
            <p className="text-xs text-apolo-steel">Este producto no tiene variantes cargadas.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  disabled={v.stock === 0}
                  onClick={() => onPick(product, v)}
                  className="text-xs border border-apolo-navy/20 rounded-lg px-2 py-1.5 hover:bg-apolo-ice disabled:opacity-30 disabled:cursor-not-allowed"
                  title={v.stock === 0 ? "Sin stock" : `Stock: ${v.stock}`}
                >
                  {v.size} · {v.color} ({v.stock})
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}