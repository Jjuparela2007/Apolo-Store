import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useWishlist();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [cartStatus, setCartStatus] = useState(null); // 'adding' | 'added'

  const price = product.offer_price ?? product.base_price;
  const hasDiscount = product.offer_price && product.offer_price < product.base_price;
  const favorited = isFavorite(product.id);

  // Solo se puede agregar directo desde la tarjeta si el producto tiene una única
  // variante (ej. un balón). Si tiene varias tallas/colores, no hay forma de saber
  // cuál quiere el cliente sin preguntarle — para eso lo mandamos a la ficha.
  const canQuickAdd = product.variant_count === 1 && product.default_variant_id;

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate("/login", { state: { from: `/producto/${product.slug}` } });
    toggleFavorite(product.id);
  };

  const handleCartClick = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate("/login", { state: { from: `/producto/${product.slug}` } });
    if (!canQuickAdd) return navigate(`/producto/${product.slug}`);

    setCartStatus("adding");
    try {
      await addItem(product.default_variant_id, 1);
      setCartStatus("added");
      setTimeout(() => setCartStatus(null), 1500);
    } catch {
      setCartStatus(null);
    }
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
        <div className="mt-auto pt-2 flex items-end justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-apolo-navy truncate">{formatPrice(price)}</span>
            {hasDiscount && (
              <span className="text-xs text-red-500 line-through truncate">{formatPrice(product.base_price)}</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleCartClick}
            disabled={cartStatus === "adding"}
            title={canQuickAdd ? "Agregar al carrito" : "Elegir talla/color"}
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              cartStatus === "added" ? "bg-green-500 text-white" : "bg-apolo-navy text-white hover:bg-apolo-blue"
            }`}
          >
            {cartStatus === "added" ? <CheckIcon /> : <CartIcon />}
          </button>
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
function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}