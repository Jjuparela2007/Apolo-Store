import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api/products";
import ProductRow from "../components/ProductRow";
import StoreCarousel from "../components/StoreCarousel";

const PROMISES = [
  { icon: <TruckIcon />, label: "Envíos a todo el país" },
  { icon: <ShieldIcon />, label: "Compra segura" },
  { icon: <CardIcon />, label: "Múltiples métodos de pago" },
];

const CATEGORY_CARDS = [
  { to: "/categoria/hombre", title: "Ropa Hombre", subtitle: "Rendimiento y estilo", image: "/images/category-hombre.png" },
  { to: "/categoria/mujer", title: "Ropa Mujer", subtitle: "Comodidad y actitud", image: "/images/category-mujer.png" },
  { to: "/categoria/accesorios", title: "Accesorios", subtitle: "Completa tu equipo", image: "/images/category-accesorios.png" },
];

const FAQS = [
  {
    id: "envios",
    question: "¿Cuánto tarda el envío?",
    answer: "Los pedidos se despachan en 1-2 días hábiles y llegan entre 2 y 5 días hábiles según tu ciudad. Te avisamos por correo en cada paso: confirmado, en preparación, enviado y entregado.",
  },
  {
    id: "cambios",
    question: "¿Cómo hago un cambio o devolución?",
    answer: "Tienes hasta 30 días desde que recibes tu pedido para solicitar un cambio de talla o una devolución. Escríbenos desde 'Mis pedidos' con el número de tu orden y te guiamos en el proceso.",
  },
  {
    id: "pago",
    question: "¿Qué métodos de pago aceptan?",
    answer: "Tarjetas de crédito y débito, Nequi, PSE y pago contra entrega en algunas ciudades, todo procesado de forma segura a través de Wompi.",
  },
  {
    id: "tallas",
    question: "¿Cómo sé qué talla pedir?",
    answer: "Cada ficha de producto muestra las tallas disponibles con su stock. Si tienes dudas entre dos tallas, en general recomendamos la más grande para un ajuste más cómodo.",
  },
];

// Dirección de la tienda física — cámbiala aquí cuando tengas la dirección real.
const STORE_ADDRESS = "Calle 100 #15-20, Bogotá, Colombia";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    getProducts({ limit: 16 })
      .then((data) => {
        const products = data.products || [];
        setFeatured(products.filter((p) => p.featured).slice(0, 8));
        setNewArrivals(products.slice(0, 8)); // ya vienen ordenados por más reciente desde el backend
      })
      .finally(() => setLoading(false));
  }, []);

  const hasAnyProducts = featured.length > 0 || newArrivals.length > 0;

  return (
    <div>
      {/* Hero */}
      <section className="bg-apolo-navy text-white relative overflow-hidden">
        {/* Foto de fondo — coloca tu archivo en public/images/hero-home.png */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-90"
          style={{ backgroundImage: "url(/images/hero-home.png)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-apolo-navy via-apolo-navy/85 to-apolo-navy/20" />

        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative z-10">
          <p className="font-display tracking-wide text-apolo-blue-light text-sm mb-2">APOLO SPORTS</p>
          <h1 className="font-display font-bold text-5xl md:text-7xl leading-[0.95] mb-4">
            SUPERA TUS
            <br />
            <span className="text-apolo-blue-light">LIMITES</span>
          </h1>
          <p className="text-white/70 max-w-md mb-8">Rendimiento, estilo y actitud en cada movimiento.</p>

          <div className="flex flex-wrap gap-x-8 gap-y-3 mb-8 text-sm">
            {PROMISES.map((p) => (
              <div key={p.label} className="flex items-center gap-2 text-white/80">
                <span className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
                  {p.icon}
                </span>
                {p.label}
              </div>
            ))}
          </div>

          <Link
            to="/categoria/hombre"
            className="inline-flex items-center gap-2 bg-apolo-blue hover:bg-apolo-blue-light transition-colors text-white font-semibold px-6 py-3 rounded-full"
          >
            Comprar ahora
          </Link>
        </div>
      </section>

      {/* Accesos a categorías */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-3 gap-4">
          {CATEGORY_CARDS.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group relative rounded-xl h-40 flex flex-col justify-end overflow-hidden bg-apolo-navy bg-cover bg-center"
              style={{ backgroundImage: `url(${c.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-apolo-navy via-apolo-navy/50 to-transparent group-hover:from-apolo-navy/90 transition-colors" />
              <div className="relative p-6">
                <h3 className="font-display font-semibold text-2xl text-white">{c.title}</h3>
                <p className="text-white/80 text-sm">{c.subtitle} →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Destacados — mientras carga, muestra el esqueleto en vez de nada */}
      {(loading || featured.length > 0) && (
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-3xl text-apolo-navy">Destacados</h2>
            {!loading && <Link to="/destacados" className="text-sm text-apolo-blue hover:underline">Ver todo →</Link>}
          </div>
          <ProductRow products={featured} loading={loading} />
        </section>
      )}

      {/* Lo más nuevo */}
      {(loading || newArrivals.length > 0) && (
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-3xl text-apolo-navy">Lo más nuevo</h2>
          </div>
          <ProductRow products={newArrivals} loading={loading} />
        </section>
      )}

      {!loading && !hasAnyProducts && (
        <section className="max-w-7xl mx-auto px-6 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-apolo-ice flex items-center justify-center mx-auto mb-4 text-apolo-steel">
            <BoxIcon />
          </div>
          <p className="text-apolo-steel mb-1">Muy pronto vas a encontrar aquí nuestros productos.</p>
          <p className="text-sm text-apolo-steel/70">Síguenos en redes para enterarte apenas abramos el catálogo.</p>
        </section>
      )}

      {/* Sobre Apolo Sports */}
      <section className="bg-apolo-navy text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="font-display tracking-wide text-apolo-blue-light text-sm mb-2">NUESTRA HISTORIA</p>
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">Sobre Apolo Sports</h2>
            <p className="text-white/70 mb-4 leading-relaxed">
              Nacimos con una idea simple: la ropa deportiva debería verse tan bien fuera del gimnasio como dentro.
              Cada prenda de Apolo Sports está pensada para acompañarte en el entrenamiento y en el día a día,
              sin sacrificar comodidad ni estilo.
            </p>
            <p className="text-white/70 leading-relaxed">
              Trabajamos con materiales de alta calidad y control cuidadoso de cada pedido, para que lo que compres
              en línea llegue exactamente como lo esperas.
            </p>
          </div>
          <div
            className="aspect-video md:aspect-square rounded-xl bg-apolo-navy-light bg-cover bg-center"
            style={{ backgroundImage: "url(/images/about-apolo.jpeg)" }}
          >
            {/* Foto de equipo/marca — coloca tu archivo en public/images/about-apolo.jpeg */}
          </div>
        </div>
      </section>

      {/* Nuestro local */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="font-display font-bold text-3xl text-apolo-navy mb-2 text-center">Visítanos</h2>
        <p className="text-apolo-steel text-center mb-8">{STORE_ADDRESS}</p>
        <StoreCarousel />
      </section>

      {/* Preguntas frecuentes */}
      <section id="preguntas-frecuentes" className="bg-apolo-ice py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display font-bold text-3xl text-apolo-navy mb-8 text-center">Preguntas frecuentes</h2>
          <div className="space-y-3">
            {FAQS.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div key={faq.id} className="bg-white rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-apolo-navy"
                  >
                    {faq.question}
                    <span className={`transition-transform ${isOpen ? "rotate-45" : ""} text-apolo-blue text-xl leading-none`}>+</span>
                  </button>
                  {isOpen && (
                    <p className="px-5 pb-4 text-sm text-apolo-steel leading-relaxed">{faq.answer}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function TruckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="3" width="15" height="13" /><path d="M16 8h4l3 3v5h-7V8Z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5Z" />
    </svg>
  );
}
function CardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" />
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 8 12 3 3 8l9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" />
    </svg>
  );
}