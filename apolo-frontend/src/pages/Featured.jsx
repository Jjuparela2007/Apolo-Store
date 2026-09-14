import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api/products";
import ProductCard from "../components/ProductCard";

export default function Featured() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProducts({ featured: "true" })
      .then((data) => setProducts(data.products))
      .catch(() => setError("No pudimos cargar los destacados. Intenta de nuevo en un momento."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="bg-apolo-navy text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-xs text-white/50 mb-2">
            <Link to="/" className="hover:text-white">Inicio</Link> / Destacados
          </p>
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-2">DESTACADOS</h1>
          <p className="text-white/70 max-w-lg">Lo mejor de Apolo Sports, elegido por nosotros.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-8">
        {loading && <p className="text-apolo-steel py-12 text-center">Cargando productos…</p>}
        {error && <p className="text-red-600 py-12 text-center">{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p className="text-apolo-steel py-12 text-center">Todavía no hay productos destacados.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
