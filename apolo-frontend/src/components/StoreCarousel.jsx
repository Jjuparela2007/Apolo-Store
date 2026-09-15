import { useState } from "react";

// Carrusel simple del local físico. Cambia STORE_ITEMS para agregar, quitar o
// reordenar contenido — cada archivo debe existir en public/images/ (o public/videos/
// para el video). type puede ser "image" o "video".
const STORE_ITEMS = [
  { type: "image", src: "/images/local-1.jpeg", alt: "Fachada de Apolo Sports" },
  { type: "image", src: "/images/local-2.jpeg", alt: "Interior de la tienda" },
  { type: "image", src: "/images/local-3.jpeg", alt: "Exhibición de productos" },
  { type: "video", src: "/videos/local-tour.mp4", alt: "Recorrido por la tienda" },
];

export default function StoreCarousel() {
  const [index, setIndex] = useState(0);

  const goTo = (i) => setIndex((i + STORE_ITEMS.length) % STORE_ITEMS.length);

  return (
    <div className="relative rounded-xl overflow-hidden border border-apolo-navy/10 bg-apolo-ice">
      <div className="aspect-video sm:aspect-[21/9] relative">
        {STORE_ITEMS.map((item, i) => (
          <div
            key={item.src}
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
              i === index ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {item.type === "video" ? (
              <video
                src={item.src}
                className="w-full h-full object-cover"
                autoPlay={i === index}
                muted
                loop
                playsInline
                controls
              />
            ) : (
              <img src={item.src} alt={item.alt} className="w-full h-full object-cover" />
            )}
          </div>
        ))}
      </div>

      {STORE_ITEMS.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-apolo-navy flex items-center justify-center shadow"
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Siguiente"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-apolo-navy flex items-center justify-center shadow"
          >
            <ChevronIcon direction="right" />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {STORE_ITEMS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ir al elemento ${i + 1}`}
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