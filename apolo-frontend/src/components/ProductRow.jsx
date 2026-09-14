import { useRef } from "react";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";

// Fila de productos con scroll horizontal (patrón típico de apps de compras) en vez
// de un grid que se aprieta y corta contenido en pantallas angostas. Cada tarjeta
// tiene un ancho fijo cómodo, así siempre se ve completa sin importar el viewport.
// En mobile se desliza con el dedo; en desktop (sin pantalla táctil) las flechas
// son la única forma cómoda de seguir viendo productos, por eso se agregan aparte.
export default function ProductRow({ products, loading, skeletonCount = 4 }) {
  const scrollRef = useRef(null);

  const scrollByAmount = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    // Se desplaza casi una pantalla completa del carrusel a la vez, no una tarjeta sola.
    const amount = el.clientWidth * 0.8 * direction;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  const items = loading ? Array.from({ length: skeletonCount }) : products;

  return (
    <div className="relative group/row">
      {/* Flechas — solo tienen sentido con mouse (hover), en mobile se ignoran por el pointer:coarse */}
      <button
        type="button"
        onClick={() => scrollByAmount(-1)}
        aria-label="Ver productos anteriores"
        className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-1/2
                   w-10 h-10 rounded-full bg-white shadow-lg border border-apolo-navy/10 items-center justify-center
                   text-apolo-navy opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-apolo-ice"
      >
        <ChevronIcon direction="left" />
      </button>
      <button
        type="button"
        onClick={() => scrollByAmount(1)}
        aria-label="Ver más productos"
        className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-1/2
                   w-10 h-10 rounded-full bg-white shadow-lg border border-apolo-navy/10 items-center justify-center
                   text-apolo-navy opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-apolo-ice"
      >
        <ChevronIcon direction="right" />
      </button>

      <div ref={scrollRef} className="-mx-6 px-6 overflow-x-auto scrollbar-hide scroll-smooth">
        <div className="flex gap-4 snap-x snap-mandatory">
          {loading
            ? items.map((_, i) => (
                <div key={i} className="shrink-0 w-40 sm:w-52">
                  <ProductCardSkeleton />
                </div>
              ))
            : items.map((p) => (
                <div key={p.id} className="snap-start shrink-0 w-40 sm:w-52">
                  <ProductCard product={p} />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

function ChevronIcon({ direction }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      {direction === "left" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}