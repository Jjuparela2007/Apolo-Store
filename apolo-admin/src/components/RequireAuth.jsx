import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function RequireAuth({ children, title }) {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen bg-apolo-ice">
        <Topbar title={title} />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
