import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/users", label: "Students" },
  { to: "/classes", label: "Standards" },
  { to: "/subjects", label: "Subjects" },
  { to: "/timetable", label: "Timetable" },
  { to: "/attendance", label: "Attendance" },
  { to: "/marks", label: "Tests & Marks" },
  { to: "/fees", label: "Fees" },
  { to: "/notices", label: "Notices" },
  { to: "/assistant", label: "Assistant" },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 p-4 lg:p-6">
      <div className="grid min-h-[calc(100vh-2rem)] gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
          <div className="mb-8 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-blue-500/20 p-5">
            <h2 className="text-2xl font-black">Coaching Institute ERP</h2>
            <p className="mt-2 text-sm text-slate-200">
              {user?.name} • {user?.role}
            </p>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-white text-slate-900"
                      : "text-slate-200 hover:bg-slate-800"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={logout}
            className="mt-6 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold hover:bg-red-600"
          >
            Logout
          </button>
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}