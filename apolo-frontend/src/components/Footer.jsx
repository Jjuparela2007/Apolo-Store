import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-apolo-navy text-white/80">
      <div className="bg-apolo-navy-light">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="font-display text-2xl font-semibold text-white tracking-wide">
            MÁS QUE ROPA, <span className="text-apolo-blue-light">ES UNA ACTITUD</span>
          </p>
          <div className="flex gap-6 text-sm">
            <span>Comodidad todo el día</span>
            <span>Transpirabilidad y frescura</span>
            <span>Estilo en cada detalle</span>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
        <div>
          <h4 className="text-white font-semibold mb-3">Categorías</h4>
          <ul className="space-y-2">
            <li><Link to="/categoria/hombre" className="hover:text-white">Hombre</Link></li>
            <li><Link to="/categoria/mujer" className="hover:text-white">Mujer</Link></li>
            <li><Link to="/categoria/accesorios" className="hover:text-white">Accesorios</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Ayuda</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white">Envíos</a></li>
            <li><a href="#" className="hover:text-white">Cambios y devoluciones</a></li>
            <li><Link to="/#preguntas-frecuentes" className="hover:text-white">Preguntas frecuentes</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Cuenta</h4>
          <ul className="space-y-2">
            <li><Link to="/login" className="hover:text-white">Iniciar sesión</Link></li>
            <li><Link to="/mis-pedidos" className="hover:text-white">Mis pedidos</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Apolo Sports</h4>
          <p>Rendimiento, estilo y actitud en cada movimiento.</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Apolo Sports. Todos los derechos reservados.
      </div>
    </footer>
  );
}