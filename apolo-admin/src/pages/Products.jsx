import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct } from "../api/admin";

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

const STATUS_STYLES = {
  published: "bg-green-100 text-green-700",
  draft: "bg-amber-100 text-amber-700",
  archived: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS = {
  published: "Publicado",
  draft: "Borrador",
  archived: "Archivado",
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getProducts({ search: search || undefined, status: status || "all" })
      .then((data) => setProducts(data.products))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Archivar este producto? Dejará de mostrarse en la tienda.")) return;
    await deleteProduct(id);
    load();
  };

  // Archivados al final, sin alterar el orden entre productos con el mismo estado.
  const sortedProducts = [...products].sort((a, b) => {
    const aArchived = a.status === "archived" ? 1 : 0;
    const bArchived = b.status === "archived" ? 1 : 0;
    return aArchived - bArchived;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-3xl text-apolo-navy">Productos</h1>
        <Link to="/productos/nuevo" className="bg-apolo-blue hover:bg-apolo-blue-light text-white font-semibold px-5 py-2.5 rounded-lg transition-colors">
          + Añadir producto
        </Link>
      </div>

      <div className="flex gap-3 mb-4">
        <form onSubmit={handleSearch} className="flex-1">
          <input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
          />
        </form>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm">
          <option value="">Todos los estados</option>
          <option value="published">Publicado</option>
          <option value="draft">Borrador</option>
          <option value="archived">Archivado</option>
        </select>
      </div>

      <div className="bg-white rounded-xl overflow-hidden">
        {loading ? (
          <p className="p-6 text-apolo-steel">Cargando…</p>
        ) : sortedProducts.length === 0 ? (
          <p className="p-6 text-apolo-steel">No se encontraron productos.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-apolo-steel border-b bg-apolo-ice/50">
                <th className="p-4">Producto</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Estado</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((p) => {
                const hasLowStock = p.low_stock_variant_count > 0;
                return (
                  <tr key={p.id} className="border-b border-apolo-navy/5">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-apolo-ice rounded-lg overflow-hidden shrink-0">
                        {p.thumbnail_url && <img src={p.thumbnail_url} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <span className="font-medium text-apolo-navy block">{p.name}</span>
                        <span className="text-xs text-apolo-steel">{p.sku}</span>
                      </div>
                    </td>
                    <td className="p-4 text-apolo-steel">{p.category_name}</td>
                    <td className="p-4">{formatPrice(p.offer_price ?? p.base_price)}</td>
                    <td className="p-4">
                      <span className={hasLowStock ? "font-medium text-amber-600" : "text-apolo-navy"}>
                        {p.total_stock}
                      </span>
                      {hasLowStock && (
                        <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          Stock bajo
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[p.status] || ""}`}>
                        {STATUS_LABELS[p.status] || p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <Link to={`/productos/${p.id}`} className="text-apolo-blue hover:underline">Editar</Link>
                      <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">Archivar</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}