import { ArrowUpRight, ChartNoAxesCombined, CircleDollarSign, LayoutDashboard, LogOut, Tags } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ArrowUpRight },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/predictions", label: "Forecast", icon: ChartNoAxesCombined },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200/80 bg-neutral-50/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <NavLink to="/dashboard" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-neutral-900 text-white">
            <CircleDollarSign size={19} strokeWidth={1.8} />
          </span>
          <span>SmartFinance</span>
        </NavLink>

        <div className="hidden items-center gap-1 rounded-full border border-neutral-200 bg-white p-1 sm:flex">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                  isActive
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden max-w-40 truncate text-sm text-neutral-500 md:block">
            {user?.email}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium transition hover:border-neutral-300 hover:bg-neutral-100"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
