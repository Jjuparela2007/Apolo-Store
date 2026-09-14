import { useState } from "react";

// Carrusel simple de fotos del local físico. Cambia STORE_IMAGES para agregar,
// quitar o reordenar fotos — cada una debe existir en public/images/.
const STORE_IMAGES = [
  { src: "/images/local-1.png", alt: "Fachada de Apolo Sports" },
  { src: "/images/local-2.png", alt: "Interior de la tienda" },
  { src: "/images/local-3.png", alt: "Exhibición de productos" },
];

export default function StoreCarousel() {
  const [index, setIndex] = useState(0);

  const goTo = (i) => setIndex((i + STORE_IMAGES.length) % STORE_IMAGES.length);

  return (
    <div className="relative rounded-xl overflow-hidden border border-apolo-navy/10 bg-apolo-ice">
      <div className="aspect-video sm:aspect-[21/9] relative">
        {STORE_IMAGES.map((img, i) => (
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              i === index ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />
        ))}
      </div>

      {STORE_IMAGES.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Foto anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-apolo-navy flex items-center justify-center shadow"
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Foto siguiente"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-apolo-navy flex items-center justify-center shadow"
          >
            <ChevronIcon direction="right" />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {STORE_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ir a la foto ${i + 1}`}
                className={`w-2 h-2 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
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
