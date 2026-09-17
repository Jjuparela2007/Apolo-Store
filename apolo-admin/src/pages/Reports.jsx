import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getSalesReport, getTopProductsReport, getSummaryReport } from "../api/admin";

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

// Rangos de fecha rápidos — evita que el usuario tenga que escribir fechas a mano
// para lo más común (últimos 7/30/90 días).
function daysAgoISO(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toISODate(d);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const RANGE_OPTIONS = [
  { label: "Últimos 7 días", days: 7 },
  { label: "Últimos 30 días", days: 30 },
  { label: "Últimos 90 días", days: 90 },
  { label: "Todo el historial", days: null },
];

const WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

// Construye la grilla del mes (6 semanas x 7 días) empezando en lunes.
function buildMonthGrid(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  // getDay(): 0=domingo..6=sábado -> lo convertimos a offset desde lunes
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = addDays(firstOfMonth, -startOffset);

  const days = [];
  for (let i = 0; i < 42; i++) {
    days.push(addDays(gridStart, i));
  }
  return days;
}

function MiniCalendar({ selectedDate, onSelect, onClose }) {
  const [viewMonth, setViewMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const today = new Date();
  const grid = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);
  const monthLabel = viewMonth.toLocaleDateString("es-CO", { month: "long", year: "numeric" });

  return (
    <div className="absolute right-0 top-full mt-2 z-20 bg-white rounded-xl shadow-lg border border-apolo-navy/10 p-4 w-72">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
          className="w-7 h-7 rounded-full hover:bg-apolo-navy/5 text-apolo-steel"
        >
          ‹
        </button>
        <p className="text-sm font-medium text-apolo-navy capitalize">{monthLabel}</p>
        <button
          type="button"
          onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
          className="w-7 h-7 rounded-full hover:bg-apolo-navy/5 text-apolo-steel"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((w, i) => (
          <div key={i} className="text-center text-xs text-apolo-steel font-medium">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map((d, i) => {
          const inMonth = d.getMonth() === viewMonth.getMonth();
          const isSelected = isSameDay(d, selectedDate);
          const isToday = isSameDay(d, today);
          const isFuture = d > today;
          return (
            <button
              type="button"
              key={i}
              disabled={isFuture}
              onClick={() => {
                onSelect(d);
                onClose();
              }}
              className={`h-8 rounded-full text-sm transition-colors ${
                !inMonth ? "text-apolo-steel/30" : "text-apolo-navy"
              } ${
                isSelected
                  ? "bg-apolo-navy text-white"
                  : isFuture
                  ? "cursor-not-allowed opacity-40"
                  : "hover:bg-apolo-navy/10"
              } ${isToday && !isSelected ? "ring-1 ring-apolo-navy/40" : ""}`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Reports() {
  const [mode, setMode] = useState("range"); // "range" | "day"
  const [rangeIndex, setRangeIndex] = useState(1); // 30 días por defecto
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [summary, setSummary] = useState(null);
  const [sales, setSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [compareData, setCompareData] = useState([]);
  const [loading, setLoading] = useState(true);

  let from, to, groupBy;
  if (mode === "day") {
    from = toISODate(selectedDay);
    to = toISODate(addDays(selectedDay, 1)); // cubre el día completo sin importar la hora
    groupBy = "day";
  } else {
    const selectedRange = RANGE_OPTIONS[rangeIndex];
    from = selectedRange.days ? daysAgoISO(selectedRange.days) : undefined;
    to = undefined;
    groupBy = selectedRange.days && selectedRange.days <= 30 ? "day" : selectedRange.days ? "day" : "month";
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSummaryReport({ from, to }),
      getSalesReport({ from, to, groupBy }),
      getTopProductsReport({ from, to, limit: 8 }),
    ])
      .then(([s, sa, tp]) => {
        setSummary(s);
        setSales(sa);
        setTopProducts(tp);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, rangeIndex, selectedDay.getTime()]);

  // En modo "día" traemos también el día anterior, para poder comparar ambos
  // en un mismo gráfico de barras. getSalesOverTime solo devuelve filas con
  // ventas, así que rellenamos con 0 el día que no tenga registros.
  useEffect(() => {
    if (mode !== "day") return;

    const previousDay = addDays(selectedDay, -1);
    const compareFrom = toISODate(previousDay);
    const compareTo = toISODate(addDays(selectedDay, 1));

    getSalesReport({ from: compareFrom, to: compareTo, groupBy: "day" }).then((rows) => {
      const byPeriod = Object.fromEntries(rows.map((r) => [r.period, r]));
      const previousISO = toISODate(previousDay);
      const selectedISO = toISODate(selectedDay);

      setCompareData([
        {
          label: "Día anterior",
          date: previousDay.toLocaleDateString("es-CO", { day: "numeric", month: "short" }),
          revenue: Number(byPeriod[previousISO]?.revenue || 0),
          order_count: Number(byPeriod[previousISO]?.order_count || 0),
        },
        {
          label: "Día seleccionado",
          date: selectedDay.toLocaleDateString("es-CO", { day: "numeric", month: "short" }),
          revenue: Number(byPeriod[selectedISO]?.revenue || 0),
          order_count: Number(byPeriod[selectedISO]?.order_count || 0),
        },
      ]);
    });
  }, [mode, selectedDay.getTime()]);

  const dayLabel = selectedDay.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-3xl text-apolo-navy">Reportes</h1>
        <div className="flex items-center gap-2">
          {mode === "range" &&
            RANGE_OPTIONS.map((opt, i) => (
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

          {mode === "day" && (
            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-apolo-navy text-white capitalize">
              {dayLabel}
            </span>
          )}

          <div className="relative">
            <button
              onClick={() => {
                setMode("day");
                setCalendarOpen((v) => !v);
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                mode === "day"
                  ? "bg-white text-apolo-navy border border-apolo-navy/20"
                  : "bg-white text-apolo-steel hover:bg-apolo-navy/5"
              }`}
            >
              📅 Elegir día
            </button>
            {calendarOpen && (
              <MiniCalendar selectedDate={selectedDay} onSelect={setSelectedDay} onClose={() => setCalendarOpen(false)} />
            )}
          </div>

          {mode === "day" && (
            <button
              onClick={() => setMode("range")}
              className="px-3 py-1.5 rounded-full text-sm font-medium text-apolo-steel hover:bg-apolo-navy/5"
              title="Volver a rangos"
            >
              ✕
            </button>
          )}
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

          {mode === "range" && (
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
          )}

          {mode === "day" && (
            <div className="bg-white rounded-xl p-6 mb-6">
              <h2 className="font-medium text-apolo-navy mb-4">Comparación con el día anterior</h2>
              {compareData.every((d) => d.revenue === 0) ? (
                <p className="text-sm text-apolo-steel">No hay ventas registradas en estos dos días.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={compareData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E4E9F2" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value, name) => (name === "revenue" ? formatPrice(value) : value)}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.label}
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const row = payload[0].payload;
                        return (
                          <div className="bg-white border border-apolo-navy/10 rounded-lg shadow-md p-3 text-sm">
                            <p className="font-medium text-apolo-navy mb-1">
                              {row.label} · {label}
                            </p>
                            <p className="text-apolo-steel">Ingresos: {formatPrice(row.revenue)}</p>
                            <p className="text-apolo-steel">Pedidos: {row.order_count}</p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="revenue" fill="#1E7FE8" radius={[6, 6, 0, 0]} name="Ingresos" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

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