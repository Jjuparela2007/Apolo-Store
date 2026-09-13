import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Link } from "react-router-dom";
import { getOrders, getLowStock, getProducts } from "../api/admin";

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

function StatCard({ label, value, accent }) {
  return (
    <div className={`rounded-xl p-5 ${accent ? "bg-apolo-navy text-white" : "bg-white text-apolo-navy"}`}>
      <p className={`text-sm mb-1 ${accent ? "text-white/70" : "text-apolo-steel"}`}>{label}</p>
      <p className="text-2xl font-display font-bold">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [productCount, setProductCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getOrders({ limit: 100 }),
      getLowStock(),
      getProducts({ status: "published", limit: 1 }),
    ])
      .then(([ordersData, lowStockData, productsData]) => {
        setOrders(ordersData);
        setLowStock(lowStockData);
        setProductCount(productsData.total);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-apolo-steel">Cargando dashboard…</p>;

  const totalPaid = orders.filter((o) => o.status === "paid" || o.status === "delivered" || o.status === "shipped")
    .reduce((sum, o) => sum + Number(o.total), 0);
  const pendingCount = orders.filter((o) => o.status === "pending_payment").length;

  const statusCounts = Object.keys(STATUS_LABELS).map((status) => ({
    name: STATUS_LABELS[status],
    value: orders.filter((o) => o.status === status).length,
    color: STATUS_COLORS[status],
  })).filter((s) => s.value > 0);

  const recentOrders = orders.slice(0, 5);

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-apolo-navy mb-6">Dashboard - Vista General</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Ingresos (pedidos pagados)" value={formatPrice(totalPaid)} accent />
        <StatCard label="Total de pedidos" value={orders.length} />
        <StatCard label="Pedidos pendientes de pago" value={pendingCount} />
        <StatCard label="Productos publicados" value={productCount ?? "—"} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 lg:col-span-1">
          <h2 className="font-medium text-apolo-navy mb-4">Pedidos por estado</h2>
          {statusCounts.length === 0 ? (
            <p className="text-sm text-apolo-steel">Aún no hay pedidos.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusCounts} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                  {statusCounts.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-apolo-navy">Alertas de stock bajo</h2>
            <Link to="/productos" className="text-sm text-apolo-blue hover:underline">Ver productos</Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-apolo-steel">Todo el inventario está en niveles saludables.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-apolo-steel border-b">
                  <th className="pb-2">Producto</th>
                  <th className="pb-2">Variante</th>
                  <th className="pb-2">Stock</th>
                  <th className="pb-2">Umbral</th>
                  <th className="pb-2">Faltan</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.slice(0, 6).map((v) => (
                  <tr
                    key={v.variant_id}
                    className="border-b border-apolo-navy/5 hover:bg-apolo-ice/40 cursor-pointer"
                  >
                    <td className="py-2">
                      <Link to={`/productos/${v.product_id}`} className="block">
                        <p className="font-medium text-apolo-navy hover:text-apolo-blue hover:underline">
                          {v.product_name}
                        </p>
                        <p className="text-xs text-apolo-steel">{v.product_sku}</p>
                      </Link>
                    </td>
                    <td className="py-2">Talla {v.size} · {v.color}</td>
                    <td className="py-2 font-medium text-amber-600">{v.stock}</td>
                    <td className="py-2 text-apolo-steel">{v.low_stock_threshold}</td>
                    <td className="py-2 text-apolo-steel">{v.deficit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6">
        <h2 className="font-medium text-apolo-navy mb-4">Pedidos recientes</h2>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-apolo-steel">Aún no hay pedidos.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-apolo-steel border-b">
                <th className="pb-2">ID Pedido</th>
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-apolo-navy/5">
                  <td className="py-2 font-medium text-apolo-navy">{o.order_number}</td>
                  <td className="py-2 text-apolo-steel">{new Date(o.created_at).toLocaleDateString("es-CO")}</td>
                  <td className="py-2">{formatPrice(o.total)}</td>
                  <td className="py-2">
                    <span
                      className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{ backgroundColor: `${STATUS_COLORS[o.status]}20`, color: STATUS_COLORS[o.status] }}
                    >
                      {STATUS_LABELS[o.status]}
                    </span>
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