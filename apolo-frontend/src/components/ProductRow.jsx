import ProductCard from "./ProductCard";

// Fila de productos con scroll horizontal (patrón típico de apps de compras) en vez
// de un grid que se aprieta y corta contenido en pantallas angostas. Cada tarjeta
// tiene un ancho fijo cómodo, así siempre se ve completa sin importar el viewport.
export default function ProductRow({ products }) {
  return (
    <div className="-mx-6 px-6 overflow-x-auto scrollbar-hide">
      <div className="flex gap-4 snap-x snap-mandatory">
        {products.map((p) => (
          <div key={p.id} className="snap-start shrink-0 w-40 sm:w-52">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
