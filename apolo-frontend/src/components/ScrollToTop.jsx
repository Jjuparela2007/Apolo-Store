import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router no resetea el scroll al navegar entre páginas (a diferencia de un
// sitio tradicional) — sin esto, si entras a Hombre habiendo scrolleado hasta el
// footer en otra página, la nueva página abre igual de abajo, no desde arriba.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
