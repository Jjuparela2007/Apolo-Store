import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-apolo-navy text-white/80">
      <div className="bg-apolo-navy-light">
       
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
          <h4 className="text-white font-semibold mb-3">Cuenta</h4>
          <ul className="space-y-2">
            <li><Link to="/login" className="hover:text-white">Iniciar sesión</Link></li>
            <li><Link to="/mis-pedidos" className="hover:text-white">Mis pedidos</Link></li>
            
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Síguenos</h4>
          <ul className="space-y-3">
            <li>
              <a
                href="https://wa.me/573144912703"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white"
              >
                <WhatsAppIcon /> WhatsApp
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com/APOLOSPORTS2"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white"
              >
                <InstagramIcon /> @APOLOSPORTS2
              </a>
            </li>
            <li>
              <a
                href="https://www.tiktok.com/@APOLOSPORTS2"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white"
              >
                <TikTokIcon /> APOLOSPORTS2
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Ubicación</h4>
          <a
            href="https://www.google.com/maps/search/?api=1&query=CRA+47+%23+59C+39+SUR+Bogota"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 hover:text-white"
          >
            <LocationIcon />
            <span>CRA 47 # 59C 39 SUR</span>
          </a>
        </div>

      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Apolo Sports. Todos los derechos reservados.
      </div>
    </footer>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.08L2 22l5.08-1.33A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2Zm0 18c-1.6 0-3.09-.44-4.37-1.2l-.31-.18-3.02.79.81-2.95-.2-.31A7.94 7.94 0 0 1 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8Zm4.38-5.98c-.24-.12-1.43-.7-1.65-.79-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1-.37-1.9-1.17-.7-.62-1.18-1.39-1.32-1.63-.14-.24-.02-.36.1-.48.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.15-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <path d="M16.5 2c.3 2.1 1.6 3.8 3.7 4.2v3c-1.3.1-2.6-.3-3.7-1v6.6c0 3.5-2.8 6.2-6.2 6.2S4.1 18.3 4.1 14.8s2.8-6.2 6.2-6.2c.3 0 .6 0 .9.1v3.1c-.3-.1-.6-.2-.9-.2-1.7 0-3.1 1.4-3.1 3.1s1.4 3.1 3.1 3.1 3.2-1.3 3.2-3V2h3Z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5">
      <path d="M12 22s7-7.5 7-12.5A7 7 0 0 0 5 9.5C5 14.5 12 22 12 22Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}