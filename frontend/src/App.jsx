import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/Login";
import AddSale from "./pages/AddSale";
import MySales from "./pages/MySales";
import AdminSales from "./adminpages/AdminSales";
import AdminEmployees from "./adminpages/AdminEmployees";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";

const linkBase = "px-3 py-2 rounded-lg text-sm font-medium transition-colors";

function TopNav() {
  const { isAuthenticated, isAdmin, isEmployee, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="font-semibold text-slate-900">Mudgarvale</div>

        <nav className="flex items-center gap-1">
          {isEmployee && (
            <>
              <NavLink
                to="/add-sale"
                className={({ isActive }) =>
                  `${linkBase} ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                Add Sale
              </NavLink>
              <NavLink
                to="/my-sales"
                className={({ isActive }) =>
                  `${linkBase} ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                My Sales
              </NavLink>
            </>
          )}

          {isAdmin && (
            <>
              <NavLink
                to="/admin/sales"
                className={({ isActive }) =>
                  `${linkBase} ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                Sales
              </NavLink>
              <NavLink
                to="/admin/employees"
                className={({ isActive }) =>
                  `${linkBase} ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                Employees
              </NavLink>
            </>
          )}

          {isAuthenticated && (
            <div className="flex items-center gap-3 ml-2">
              <span className="hidden sm:inline text-xs text-slate-500">
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded border border-slate-200"
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <TopNav />
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route
                path="/add-sale"
                element={
                  <ProtectedRoute allowedRole="employee">
                    <AddSale />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-sales"
                element={
                  <ProtectedRoute allowedRole="employee">
                    <MySales />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/sales"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <AdminSales />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/employees"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <AdminEmployees />
                  </ProtectedRoute>
                }
              />

              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route
                path="*"
                element={
                  <div className="text-center text-slate-500 py-20">
                    404 — Page not found
                  </div>
                }
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}