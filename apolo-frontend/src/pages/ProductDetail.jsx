import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductBySlug } from "../api/products";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { isFavorite: checkIsFavorite, toggleFavorite } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [status, setStatus] = useState(null); // 'adding' | 'added' | 'error' | 'needs-login'
  const [favoriteBusy, setFavoriteBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    getProductBySlug(slug)
      .then((p) => {
        setProduct(p);
        const firstVariant = p.variants?.[0];
        setSelectedColor(firstVariant?.color || null);
        setSelectedSize(firstVariant?.size || null);
        setActiveImage(0);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p className="text-center py-24 text-apolo-steel">Cargando producto…</p>;
  if (!product) return <p className="text-center py-24 text-apolo-steel">Producto no encontrado.</p>;

  const colors = [...new Map(product.variants.map((v) => [v.color, v])).values()];
  const sizesForColor = product.variants.filter((v) => v.color === selectedColor);
  const activeVariant = product.variants.find((v) => v.color === selectedColor && v.size === selectedSize);
  const price = product.offer_price ?? product.base_price;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setStatus("needs-login");
      setTimeout(() => {
        navigate("/login", { state: { from: `/producto/${slug}` } });
      }, 3000);
      return;
    }
    if (!activeVariant) return;

    setStatus("adding");
    try {
      await addItem(activeVariant.id, 1);
      setStatus("added");
      setTimeout(() => setStatus(null), 2000);
    } catch {
      setStatus("error");
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      setStatus("needs-login");
      setTimeout(() => {
        navigate("/login", { state: { from: `/producto/${slug}` } });
      }, 3000);
      return;
    }
    setFavoriteBusy(true);
    try {
      await toggleFavorite(product.id);
    } finally {
      setFavoriteBusy(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-10">
      <div>
        <div className="flex gap-3">
          {product.media?.length > 1 && (
            <div className="flex flex-col gap-2 shrink-0">
              {product.media.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    activeImage === i ? "border-apolo-blue" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div
            className="flex-1 aspect-square bg-apolo-ice rounded-xl overflow-hidden relative cursor-zoom-in"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              setZoomOrigin({ x, y });
            }}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
          >
            {product.media?.length > 0 ? (
              <img
                src={product.media[activeImage]?.url}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-150 ease-out"
                style={{
                  transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                  transform: isZooming ? "scale(2.2)" : "scale(1)",
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-apolo-steel/40 font-display text-3xl">
                APOLO
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-apolo-steel uppercase tracking-widest mb-2">{product.category_name}</p>
        <h1 className="font-display font-bold text-5xl leading-tight tracking-tight text-apolo-navy mb-3">{product.name}</h1>
        <div className="flex items-baseline gap-3 mb-6">
          <p className="text-2xl font-semibold text-apolo-navy">{formatPrice(price)}</p>
          {product.offer_price && (
            <p className="text-lg text-apolo-steel line-through">{formatPrice(product.base_price)}</p>
          )}
        </div>

        {product.short_description && <p className="text-apolo-steel mb-6">{product.short_description}</p>}

        {product.description && (
          <div className="mb-6">
            <h3 className="font-medium text-apolo-navy mb-2">Descripción</h3>
            <p className="text-apolo-steel whitespace-pre-line">{product.description}</p>
          </div>
        )}

        {colors.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-apolo-navy mb-2">Color: {selectedColor}</p>
            <div className="flex gap-2">
              {colors.map((v) => (
                <button
                  key={v.color}
                  onClick={() => {
                    setSelectedColor(v.color);
                    const firstSize = product.variants.find((x) => x.color === v.color);
                    setSelectedSize(firstSize?.size || null);
                  }}
                  className={`w-9 h-9 rounded-full border-2 ${
                    selectedColor === v.color ? "border-apolo-blue" : "border-transparent"
                  }`}
                  style={{ backgroundColor: v.color_hex || "#334155" }}
                  aria-label={v.color}
                  title={v.color}
                />
              ))}
            </div>
          </div>
        )}

        {sizesForColor.length > 0 && (
          <div className="mb-8">
            <p className="text-sm font-medium text-apolo-navy mb-2">Talla</p>
            <div className="flex flex-wrap gap-2">
              {sizesForColor.map((v) => (
                <button
                  key={v.size}
                  onClick={() => setSelectedSize(v.size)}
                  disabled={v.stock === 0}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    selectedSize === v.size
                      ? "bg-apolo-navy text-white border-apolo-navy"
                      : "border-apolo-navy/20 text-apolo-navy hover:border-apolo-navy"
                  } ${v.stock === 0 ? "opacity-30 cursor-not-allowed line-through" : ""}`}
                >
                  {v.size}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeVariant && activeVariant.stock > 0 && activeVariant.stock <= activeVariant.low_stock_threshold && (
          <p className="text-sm text-amber-600 mb-4">¡Pocas unidades disponibles!</p>
        )}
        {activeVariant && activeVariant.stock === 0 && (
          <p className="text-sm text-red-600 mb-4">Sin stock en esta combinación.</p>
        )}

        {status === "needs-login" && (
          <p className="text-sm text-apolo-blue bg-apolo-blue/10 rounded-lg px-4 py-2.5 mb-4">
            Debes iniciar sesión para poder agregar al carrito. Te llevamos al login…
          </p>
        )}

        <button
          onClick={handleAddToCart}
          disabled={(!activeVariant && isAuthenticated) || activeVariant?.stock === 0 || status === "adding" || status === "needs-login"}
          className={`w-full text-white font-semibold py-3 rounded-full transition-all duration-200 ease-out
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
            ${status === "added"
              ? "bg-green-600 scale-100"
              : "bg-apolo-blue hover:bg-apolo-blue-light hover:scale-[1.02] active:scale-[0.98]"
            }`}
        >
          <span className={`inline-flex items-center justify-center gap-2 transition-transform duration-200 ${status === "added" ? "scale-105" : ""}`}>
            {status === "added" ? (
              <svg className="w-5 h-5 animate-[bounce_0.5s_ease-in-out_1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : status === "adding" || status === "needs-login" ? null : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.895-4.75 2.278-7.286a1.125 1.125 0 00-1.11-1.293H5.51M6.106 5.273L5.106 1.5M7.5 14.25L5.106 5.273M9.75 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm9 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
            )}
            {status === "adding" && "Agregando…"}
            {status === "added" && "¡Agregado al carrito!"}
            {status === "error" && "Error, intenta de nuevo"}
            {status === "needs-login" && "Redirigiendo…"}
            {!status && "Agregar al carrito"}
          </span>
        </button>

        <button
          type="button"
          onClick={handleToggleFavorite}
          disabled={favoriteBusy}
          className={`w-full flex items-center justify-center gap-2 mt-3 py-3 rounded-full text-sm font-semibold border transition-all duration-200 ease-out hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 ${
            checkIsFavorite(product.id)
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-apolo-navy/20 text-apolo-navy hover:border-apolo-navy/40"
          }`}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${checkIsFavorite(product.id) ? "scale-110" : ""}`}
            fill={checkIsFavorite(product.id) ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 20.25c-.28 0-.55-.09-.78-.27C7.9 17.45 3.75 13.9 3.75 9.75 3.75 7.13 5.88 5 8.5 5c1.4 0 2.73.63 3.5 1.68C12.77 5.63 14.1 5 15.5 5c2.62 0 4.75 2.13 4.75 4.75 0 4.15-4.15 7.7-7.47 10.23-.23.18-.5.27-.78.27z"
            />
          </svg>
          {checkIsFavorite(product.id) ? "Guardado en favoritos" : "Agregar a favoritos"}
        </button>
      </div>
    </div>
  );
}