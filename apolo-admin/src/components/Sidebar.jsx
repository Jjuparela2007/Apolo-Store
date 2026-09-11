import { NavLink } from "react-router-dom";
import Logo from "./Logo";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: HomeIcon, end: true },
  { to: "/categorias", label: "Categorías", icon: TagIcon },
  { to: "/productos", label: "Productos", icon: ShirtIcon },
  { to: "/pedidos", label: "Pedidos", icon: CartIcon },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-apolo-navy text-white flex flex-col shrink-0 min-h-screen">
      <div className="p-6 flex items-center gap-2">
        <Logo />
        <div className="leading-tight">
          <p className="font-display font-bold text-lg tracking-wide">APOLO SPORTS</p>
          <p className="text-xs text-white/50 -mt-1">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-white text-apolo-navy" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Icon /> {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 text-xs text-white/40 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-400" /> Online
      </div>
    </aside>
  );
}

function HomeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><path d="M9 22V12h6v10" /></svg>;
}
function TagIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3H4a1 1 0 0 0-1 1v5.59a2 2 0 0 0 .59 1.41l9.58 9.59a2 2 0 0 0 2.82 0l4.59-4.59a2 2 0 0 0 .01-2.99Z" /><circle cx="7.5" cy="7.5" r="1.5" /></svg>;
}
function ShirtIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z" /></svg>;
}
function CartIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>;
}
