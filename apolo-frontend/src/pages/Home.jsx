import { Link } from "react-router-dom";

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

export default function Home() {
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