import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import RequireAuth from "./components/RequireAuth";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/olvide-contrasena" element={<ForgotPassword />} />
          <Route path="/restablecer-contrasena" element={<ResetPassword />} />
          <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/categorias" element={<RequireAuth><Categories /></RequireAuth>} />
          <Route path="/productos" element={<RequireAuth><Products /></RequireAuth>} />
          <Route path="/productos/nuevo" element={<RequireAuth><ProductForm /></RequireAuth>} />
          <Route path="/productos/:id" element={<RequireAuth><ProductForm /></RequireAuth>} />
          <Route path="/pedidos" element={<RequireAuth><Orders /></RequireAuth>} />
          <Route path="/pedidos/:id" element={<RequireAuth><OrderDetail /></RequireAuth>} />
          <Route path="/reportes" element={<RequireAuth><Reports /></RequireAuth>} />
          <Route path="/configuracion" element={<RequireAuth><Settings /></RequireAuth>} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}