// Logo real de Apolo Sports. Coloca tu archivo en:
//   public/images/logo-apolo.png
// y aparece automáticamente aquí, sin tocar este componente.
export default function Logo({ className = "h-9 w-auto" }) {
  return <img src="/images/logo-apolo.png" alt="Apolo Sports" className={className} />;
}