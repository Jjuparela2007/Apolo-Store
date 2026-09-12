import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getSalesReport, getTopProductsReport, getSummaryReport } from "../api/admin";

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

// Rangos de fecha rápidos — evita que el usuario tenga que escribir fechas a mano
// para lo más común (últimos 7/30/90 días).
function daysAgoISO(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

const RANGE_OPTIONS = [
  { label: "Últimos 7 días", days: 7 },
  { label: "Últimos 30 días", days: 30 },
  { label: "Últimos 90 días", days: 90 },
  { label: "Todo el historial", days: null },
];

export default function Reports() {
  const [rangeIndex, setRangeIndex] = useState(1); // 30 días por defecto
  const [summary, setSummary] = useState(null);
  const [sales, setSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedRange = RANGE_OPTIONS[rangeIndex];
  const from = selectedRange.days ? daysAgoISO(selectedRange.days) : undefined;
  const groupBy = selectedRange.days && selectedRange.days <= 30 ? "day" : selectedRange.days ? "day" : "month";

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSummaryReport({ from }),
      getSalesReport({ from, groupBy }),
      getTopProductsReport({ from, limit: 8 }),
    ])
      .then(([s, sa, tp]) => {
        setSummary(s);
        setSales(sa);
        setTopProducts(tp);
      })
      .finally(() => setLoading(false));
  }, [rangeIndex]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-3xl text-apolo-navy">Reportes</h1>
        <div className="flex gap-2">
          {RANGE_OPTIONS.map((opt, i) => (
            <button
              key={opt.label}
              onClick={() => setRangeIndex(i)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                rangeIndex === i ? "bg-apolo-navy text-white" : "bg-white text-apolo-steel hover:bg-apolo-navy/5"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-apolo-steel">Cargando reportes…</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5">
              <p className="text-sm text-apolo-steel mb-1">Ingresos</p>
              <p className="text-2xl font-display font-bold text-apolo-navy">{formatPrice(summary?.revenue || 0)}</p>
            </div>
            <div className="bg-white rounded-xl p-5">
              <p className="text-sm text-apolo-steel mb-1">Pedidos (pagados o en curso)</p>
              <p className="text-2xl font-display font-bold text-apolo-navy">{summary?.order_count || 0}</p>
            </div>
            <div className="bg-white rounded-xl p-5">
              <p className="text-sm text-apolo-steel mb-1">Valor promedio por pedido</p>
              <p className="text-2xl font-display font-bold text-apolo-navy">{formatPrice(summary?.average_order_value || 0)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 mb-6">
            <h2 className="font-medium text-apolo-navy mb-4">Ingresos en el tiempo</h2>
            {sales.length === 0 ? (
              <p className="text-sm text-apolo-steel">No hay ventas registradas en este período.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={sales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E9F2" />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatPrice(v)} />
                  <Line type="monotone" dataKey="revenue" stroke="#1E7FE8" strokeWidth={2} dot={{ r: 3 }} name="Ingresos" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-xl p-6">
            <h2 className="font-medium text-apolo-navy mb-4">Productos más vendidos</h2>
            {topProducts.length === 0 ? (
              <p className="text-sm text-apolo-steel">No hay ventas registradas en este período.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-apolo-steel border-b">
                    <th className="pb-2">Producto</th>
                    <th className="pb-2">Unidades vendidas</th>
                    <th className="pb-2">Ingresos generados</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p) => (
                    <tr key={p.product_name} className="border-b border-apolo-navy/5">
                      <td className="py-2 font-medium text-apolo-navy">{p.product_name}</td>
                      <td className="py-2">{p.units_sold}</td>
                      <td className="py-2">{formatPrice(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}