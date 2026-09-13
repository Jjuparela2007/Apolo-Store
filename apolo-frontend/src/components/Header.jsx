import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const NAV_LINKS = [
  { to: "/", label: "Inicio", end: true },
  { to: "/categoria/hombre", label: "Hombre" },
  { to: "/categoria/mujer", label: "Mujer" },
  { to: "/categoria/accesorios", label: "Accesorios" },
];

export default function Header() {
  const { isAuthenticated, customer, logout } = useAuth();
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/buscar?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="bg-apolo-navy text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-8">
        <Link to="/" className="flex items-center shrink-0">
          <Logo className="h-10 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-6 font-medium text-sm uppercase tracking-wide">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `pb-1 border-b-2 transition-colors ${
                  isActive ? "border-apolo-blue text-white" : "border-transparent text-white/70 hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="flex-1 hidden sm:block">
          <div className="relative max-w-md ml-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full bg-white/10 placeholder-white/50 text-white text-sm rounded-full py-2 pl-4 pr-10 outline-none focus:bg-white/15 transition-colors"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70" aria-label="Buscar">
              <SearchIcon />
            </button>
          </div>
        </form>

        <div className="flex items-center gap-4 shrink-0">
          {isAuthenticated ? (
            <div className="relative group">
              <button className="text-white/80 hover:text-white" aria-label="Mi cuenta">
                <UserIcon />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white text-apolo-navy rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 text-sm">
                <div className="px-4 py-2 border-b text-apolo-steel truncate">{customer?.fullName}</div>
                <Link to="/mi-cuenta" className="block px-4 py-2 hover:bg-apolo-ice">Mi cuenta</Link>
                <Link to="/mis-pedidos" className="block px-4 py-2 hover:bg-apolo-ice">Mis pedidos</Link>
                <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-apolo-ice">Cerrar sesión</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="text-white/80 hover:text-white" aria-label="Iniciar sesión">
              <UserIcon />
            </Link>
          )}

          <Link to="/favoritos" className="relative text-white/80 hover:text-white" aria-label="Favoritos">
            <HeartIcon />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-apolo-blue text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          <Link to="/carrito" className="relative text-white/80 hover:text-white" aria-label="Carrito">
            <CartIcon />
            <span className="absolute -top-2 -right-2 bg-apolo-blue text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {itemCount}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21a8 8 0 1 0-16 0" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}
function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
} 