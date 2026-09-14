import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductBySlug } from "../api/products";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [status, setStatus] = useState(null); // 'adding' | 'added' | 'error' | 'needs-login'

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
        <p className="text-sm text-apolo-steel mb-1">{product.category_name}</p>
        <h1 className="font-display font-bold text-4xl text-apolo-navy mb-3">{product.name}</h1>
        <p className="text-2xl font-semibold text-apolo-navy mb-6">{formatPrice(price)}</p>

        {product.short_description && <p className="text-apolo-steel mb-6">{product.short_description}</p>}

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
          className="w-full bg-apolo-blue hover:bg-apolo-blue-light disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-full transition-colors"
        >
          {status === "adding" && "Agregando…"}
          {status === "added" && "¡Agregado al carrito!"}
          {status === "error" && "Error, intenta de nuevo"}
          {status === "needs-login" && "Redirigiendo…"}
          {!status && "Agregar al carrito"}
        </button>

        {product.description && (
          <div className="mt-8 pt-8 border-t border-apolo-navy/10">
            <h3 className="font-medium text-apolo-navy mb-2">Descripción</h3>
            <p className="text-apolo-steel whitespace-pre-line">{product.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}