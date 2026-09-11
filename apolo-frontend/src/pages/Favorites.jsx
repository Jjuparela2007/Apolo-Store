import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

export default function Favorites() {
  const { isAuthenticated } = useAuth();
  const { items, toggleFavorite } = useWishlist();

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="font-display font-bold text-3xl text-apolo-navy mb-4">Inicia sesión para ver tus favoritos</h1>
        <Link to="/login" className="inline-block bg-apolo-blue text-white font-semibold px-6 py-3 rounded-full">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display font-bold text-3xl text-apolo-navy mb-6">Mis favoritos</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-apolo-steel mb-4">Todavía no has agregado productos a favoritos.</p>
          <Link to="/" className="text-apolo-blue hover:underline">Explorar el catálogo</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.wishlist_item_id} className="bg-white rounded-xl border border-apolo-navy/5 overflow-hidden">
              <Link to={`/producto/${item.slug}`} className="block aspect-square bg-apolo-ice">
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-apolo-steel/40 font-display text-2xl">
                    APOLO
                  </div>
                )}
              </Link>
              <div className="p-4">
                <Link to={`/producto/${item.slug}`} className="font-medium text-apolo-navy leading-snug hover:text-apolo-blue">
                  {item.name}
                </Link>
                <p className="font-semibold text-apolo-navy mt-1">{formatPrice(item.offer_price ?? item.base_price)}</p>
                <button
                  onClick={() => toggleFavorite(item.product_id)}
                  className="text-xs text-red-600 hover:underline mt-2"
                >
                  Quitar de favoritos
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
