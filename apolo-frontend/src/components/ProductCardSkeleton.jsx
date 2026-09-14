// Placeholder animado con la misma forma que ProductCard, para mostrar mientras
// los productos cargan — se percibe más rápido y pulido que un texto de "Cargando"
// o una sección vacía que aparece de golpe.
export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-apolo-navy/5 overflow-hidden animate-pulse">
      <div className="aspect-square bg-apolo-ice" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-apolo-ice rounded w-1/3" />
        <div className="h-4 bg-apolo-ice rounded w-4/5" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 bg-apolo-ice rounded w-1/3" />
          <div className="h-9 w-9 bg-apolo-ice rounded-lg" />
        </div>
      </div>
    </div>
  );
}
