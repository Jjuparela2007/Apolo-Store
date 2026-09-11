import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useWishlist();
  const navigate = useNavigate();

  const price = product.offer_price ?? product.base_price;
  const hasDiscount = product.offer_price && product.offer_price < product.base_price;
  const favorited = isFavorite(product.id);

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate("/login", { state: { from: `/producto/${product.slug}` } });
    toggleFavorite(product.id);
  };

  return (
    <Link
      to={`/producto/${product.slug}`}
      className="group bg-white rounded-xl border border-apolo-navy/5 hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
    >
      <div className="relative aspect-square bg-apolo-ice overflow-hidden">
        {product.thumbnail_url ? (
          <img
            src={product.thumbnail_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-apolo-steel/40 font-display text-2xl">
            APOLO
          </div>
        )}
        {product.featured && (
          <span className="absolute top-3 left-3 bg-apolo-blue text-white text-xs font-semibold px-2 py-1 rounded">
            Destacado
          </span>
        )}
        <button
          type="button"
          onClick={handleToggleFavorite}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center transition-colors ${
            favorited ? "text-red-500" : "text-apolo-navy hover:text-apolo-blue"
          }`}
          aria-label={favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <HeartIcon filled={favorited} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-1 flex-1">
        <span className="text-xs text-apolo-steel">{product.category_name}</span>
        <h3 className="font-medium text-apolo-navy leading-snug">{product.name}</h3>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-apolo-navy">{formatPrice(price)}</span>
            {hasDiscount && (
              <span className="text-xs text-apolo-steel line-through">{formatPrice(product.base_price)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}
