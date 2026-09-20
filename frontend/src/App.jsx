import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Login";
import AddSale from "./pages/AddSale";
import MySales from "./pages/MySales";
import AdminSales from "./adminpages/AdminSales";
import AdminEmployees from "./adminpages/AdminEmployees";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";

function TopNav() {
  const { isAuthenticated, isAdmin, isEmployee, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Hide nav entirely on login page
  if (location.pathname === "/login") return null;

  const linkBase =
    "px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap";

  const linkCls = ({ isActive }) =>
    `${linkBase} ${isActive
      ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25"
      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* ===== BRAND ===== */}
        <NavLink
          to={
            isAdmin
              ? "/admin/sales"
              : isEmployee
                ? "/add-sale"
                : "/login"
          }
          className="flex items-center gap-3 group"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:rotate-3 transition-transform duration-300">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            {isAuthenticated && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white shadow-sm animate-pulse" />
            )}
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">
            Sales Manager
          </span>
        </NavLink>

        {/* ===== DESKTOP NAV ===== */}
        <nav className="hidden md:flex items-center gap-1">
          {isEmployee && (
            <>
              <NavLink to="/add-sale" className={linkCls}>
                Add Sale
              </NavLink>
              <NavLink to="/my-sales" className={linkCls}>
                My Sales
              </NavLink>
            </>
          )}

          {isAdmin && (
            <>
              <NavLink to="/admin/sales" className={linkCls}>
                Sales
              </NavLink>
              <NavLink to="/admin/employees" className={linkCls}>
                Employees
              </NavLink>
              <NavLink to="/add-sale" className={linkCls}>
                Add Sale
              </NavLink>
              <NavLink to="/my-sales" className={linkCls}>
                My Sales
              </NavLink>
            </>
          )}
          {isAuthenticated && (
            <div className="flex items-center gap-3 ml-3 pl-3 border-l border-slate-200">
              {/* User chip */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold text-xs shadow-md shadow-indigo-500/20">
                  {user?.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-semibold text-slate-900 leading-tight">
                    {user?.name}
                  </p>
                  <p className="text-[10px] text-slate-500 capitalize leading-tight">
                    {user?.role}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 px-3 py-2 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50 transition-all"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          )}
        </nav>

        {/* ===== MOBILE TOGGLE ===== */}
        {isAuthenticated && (
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* ===== MOBILE MENU ===== */}
      {mobileOpen && isAuthenticated && (
        <div className="md:hidden border-t border-slate-200/70 bg-white/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {/* User card */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
                {user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>

            {/* Links */}
            {isEmployee && (
              <>
                <NavLink
                  to="/add-sale"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block ${linkBase} ${isActive
                      ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25"
                      : "text-slate-700 hover:bg-slate-100"
                    }`
                  }
                >
                  Add Sale
                </NavLink>
                <NavLink
                  to="/my-sales"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block ${linkBase} ${isActive
                      ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25"
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
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block ${linkBase} ${isActive
                      ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25"
                      : "text-slate-700 hover:bg-slate-100"
                    }`
                  }
                >
                  Sales
                </NavLink>
                <NavLink
                  to="/admin/employees"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block ${linkBase} ${isActive
                      ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25"
                      : "text-slate-700 hover:bg-slate-100"
                    }`
                  }
                >
                  Employees
                </NavLink>
                <NavLink
                  to="/add-sale"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block ${linkBase} ${isActive
                      ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25"
                      : "text-slate-700 hover:bg-slate-100"
                    }`
                  }
                >
                  Add Sale
                </NavLink>
                <NavLink
                  to="/my-sales"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block ${linkBase} ${isActive
                      ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25"
                      : "text-slate-700 hover:bg-slate-100"
                    }`
                  }
                >
                  My Sales
                </NavLink>
              </>
            )}

            {/* Logout */}
            <button
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-rose-600 px-4 py-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-all mt-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 flex flex-col relative">
          {/* Ambient gradient orbs — global, behind everything */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
            <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-200/25 blur-[140px]" />
            <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-violet-200/25 blur-[140px]" />
            <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-sky-200/20 blur-[140px]" />
          </div>

          <div className="relative z-10 flex flex-col min-h-screen">
            <TopNav />
            <main className="flex-1">
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
                    <div className="min-h-[60vh] flex items-center justify-center px-4">
                      <div className="text-center rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl shadow-xl shadow-slate-200/50 p-12 max-w-md">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 mb-5">
                          <svg
                            className="w-8 h-8 text-indigo-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                          404
                        </h2>
                        <p className="text-sm text-slate-500">
                          Page not found.
                        </p>
                      </div>
                    </div>
                  }
                />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}