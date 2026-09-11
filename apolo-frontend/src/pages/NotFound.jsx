import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      <h1 className="font-display font-bold text-5xl text-apolo-navy mb-4">404</h1>
      <p className="text-apolo-steel mb-6">No encontramos esta página.</p>
      <Link to="/" className="text-apolo-blue hover:underline">Volver al inicio</Link>
    </div>
  );
}
