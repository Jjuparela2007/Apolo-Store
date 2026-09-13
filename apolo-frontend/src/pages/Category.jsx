import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { getProducts, getCategories } from "../api/products";
import ProductCard from "../components/ProductCard";

const CATEGORY_TITLES = {
  hombre: { title: "Ropa Hombre", subtitle: "Rendimiento, comodidad y estilo para cada desafío." },
  mujer: { title: "Ropa Mujer", subtitle: "Comodidad y actitud en cada movimiento." },
  accesorios: { title: "Accesorios", subtitle: "Completa tu equipo." },
};

export default function Category() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const heading = slug ? CATEGORY_TITLES[slug] : { title: `Resultados para "${searchQuery}"`, subtitle: "" };

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  // Encuentra el id de la categoría raíz (Hombre/Mujer/Accesorios) a partir del slug de la URL
  const rootCategory = categories.find((c) => c.slug === slug && !c.parent_id);
  const subcategories = categories.filter((c) => c.parent_id === rootCategory?.id);

  useEffect(() => {
    setActiveSubcategory(null);
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // "Todos" (sin subcategoría activa) busca en la categoría raíz Y en todas sus
    // subcategorías — los productos casi siempre están asignados a la subcategoría
    // (ej. Camisetas), no a la raíz (ej. Hombre) directamente.
    const categoryId = activeSubcategory
      ? activeSubcategory
      : rootCategory
        ? [rootCategory.id, ...subcategories.map((s) => s.id)].join(",")
        : undefined;

    getProducts({ category: categoryId, search: searchQuery || undefined })
      .then((data) => setProducts(data.products))
      .catch(() => setError("No pudimos cargar el catálogo. Intenta de nuevo en un momento."))
      .finally(() => setLoading(false));
  }, [rootCategory?.id, subcategories.length, activeSubcategory, searchQuery]);

  return (
    <div>
      {slug && (
        <section className="bg-apolo-navy text-white">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <p className="text-xs text-white/50 mb-2">
              <Link to="/" className="hover:text-white">Inicio</Link> / {heading.title}
            </p>
            <h1 className="font-display font-bold text-4xl md:text-5xl mb-2">{heading.title.toUpperCase()}</h1>
            <p className="text-white/70 max-w-lg">{heading.subtitle}</p>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-6 py-8">
        {subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveSubcategory(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !activeSubcategory ? "bg-apolo-navy text-white" : "bg-apolo-ice text-apolo-steel hover:bg-apolo-navy/10"
              }`}
            >
              Todos
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActiveSubcategory(sub.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeSubcategory === sub.id ? "bg-apolo-navy text-white" : "bg-apolo-ice text-apolo-steel hover:bg-apolo-navy/10"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {loading && <p className="text-apolo-steel py-12 text-center">Cargando productos…</p>}
        {error && <p className="text-red-600 py-12 text-center">{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p className="text-apolo-steel py-12 text-center">No encontramos productos aquí todavía.</p>
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