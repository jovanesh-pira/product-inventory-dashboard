import { useContext } from "react";
import { NavLink, Outlet,Link } from "react-router-dom";
import { AuthContext } from "../providers/AuthProvider";
import { LogOut } from "@/feature/Auth/services/sevices.firebase";

function AppLayout() {
  const auth = useContext(AuthContext);

  const LogOutHandler = async () => {
    await LogOut();
  };

  const navItems = [
    { to: "/app/dashboard", label: "Dashboard" },
    { to: "/app/products", label: "Products" },
    { to: "/app/orders", label: "Orders" },
    { to: "/app/customers", label: "Customers" },
    { to: "/app/analytics", label: "Analytics" },
    { to: "/app/settings", label: "Settings" },
  ];

  return (
    <div className="w-full h-screen flex">
      {/* Sidebar */}
      <aside className="w-80 h-full bg-slate-950 text-slate-100 flex flex-col border-r border-slate-800">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 grid place-items-center">
              <span className="text-sm font-bold">IA</span>
            </div>
            <div className="leading-tight">
              <p className="font-semibold">Inventory Admin</p>
              <p className="text-xs text-slate-400">v1 • Dashboard</p>
            </div>
          </div>
        </div>
        
        {/* User */}
        <div className="px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-slate-800" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {auth?.username ?? "Guest"}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {auth?.user?.email ?? "Not signed in"}
              </p>
            </div>
          </div>

          {/* Role pill */}
          <div className="mt-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-slate-800 text-slate-200">
              Role: {auth?.role ?? "guest"}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-3 py-3 flex-1 overflow-auto">
          <p className="px-3 pb-2 text-xs font-semibold text-slate-400">
            MENU
          </p>

          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition",
                      "text-sm",
                      isActive
                        ? "bg-slate-800 text-white"
                        : "text-slate-300 hover:bg-slate-900 hover:text-white",
                    ].join(" ")
                  }
                >
                  {/* Icon placeholder */}
                  <span className="w-9 h-9 rounded-xl bg-slate-900 grid place-items-center border border-slate-800">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                  </span>

                  <span className="flex-1">{item.label}</span>

                  {/* Right dot / indicator */}
                  <span className="w-2 h-2 rounded-full bg-transparent" />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* btns for the login and logout */}
        {auth?.user ? <div className="px-5 py-4 border-t border-slate-800">
          <button
            onClick={LogOutHandler}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition text-sm font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Logout
          </button>
        </div>:<div className="px-5 py-4 border-t border-slate-800">
          <Link
            to="/login"
            onClick={LogOutHandler}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition text-sm font-medium"
          >
            
            login
          </Link>
        </div>}
        
      </aside>

      {/* Main */}
      <main className="flex-1 h-full bg-slate-50">
        <div className="px-6 py-5 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-slate-900">App</p>
              <p className="text-sm text-slate-500">
                Manage products, orders, and analytics
              </p>
            </div>

            {/* Search (UI only) */}
            <div className="w-full max-w-md">
              <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                <input
                  className="w-full bg-transparent outline-none text-sm"
                  placeholder="Search..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppLayout;
