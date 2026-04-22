import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", emoji: "🏠" },
  { to: "/users", label: "Students", emoji: "👨‍🎓" },
  { to: "/classes", label: "Standards", emoji: "📚" },
  { to: "/subjects", label: "Subjects", emoji: "📖" },
  { to: "/timetable", label: "Timetable", emoji: "📅" },
  { to: "/attendance", label: "Attendance", emoji: "📝" },
  { to: "/marks", label: "Tests & Marks", emoji: "🏆" },
  { to: "/materials", label: "Study Materials", emoji: "📂" },
  { to: "/fees", label: "Fees", emoji: "💰" },
  { to: "/notices", label: "Notices", emoji: "🔔" },
  { to: "/assistant", label: "AI Assistant", emoji: "🤖" },
  { to: "/profile", label: "My Profile", emoji: "👤" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Mobile Header - Innovative & Clean */}
      <header className="fixed top-0 left-0 right-0 z-[60] flex h-16 items-center border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md lg:hidden">
        <button 
          onClick={toggleMenu}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg active:scale-95 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <h2 className="ml-4 text-xl font-bold text-slate-900">Coaching ERP</h2>
        
        <div className="ml-auto h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white shadow-sm">
          <span className="text-xs font-bold text-indigo-600">{user?.name?.charAt(0)}</span>
        </div>
      </header>

      <div className="flex pt-16 lg:pt-0">
        {/* Sidebar - Glassmorphism & Modern */}
        <aside className={`
          fixed inset-0 z-[70] transform transition-all duration-300 ease-in-out lg:static lg:block lg:translate-x-0 lg:w-[280px]
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <div className="flex h-full flex-col bg-slate-900 text-white shadow-2xl lg:m-4 lg:h-[calc(100vh-2rem)] lg:rounded-[32px]">
            {/* Sidebar Header */}
            <div className="p-8">
              <div className="flex items-center justify-between lg:block">
                <div>
                  <h2 className="text-2xl font-black tracking-tight uppercase">EDUVERSE</h2>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-indigo-400 uppercase">Coaching Institute</p>
                </div>
                <button onClick={toggleMenu} className="rounded-full bg-slate-800 p-2 lg:hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/5 p-3 border border-white/10">
                <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center text-lg shadow-inner">👤</div>
                <div className="overflow-hidden">
                  <p className="truncate text-sm font-bold">{user?.name}</p>
                  <p className="truncate text-xs text-slate-400 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>

            {/* Navigation Scroll Area */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-4 custom-scrollbar">
              {navItems
                .filter((item) => {
                  if (user.role === "student") {
                    // Students cannot see management pages
                    if (item.to === "/users") return false;
                    if (item.to === "/classes") return false;
                    if (item.to === "/subjects") return false;
                  }

                  if (user.role === "admin" || user.role === "teacher") {
                    // Admin and Teacher don't need AI Assistant or My Profile
                    if (item.to === "/assistant") return false;
                    if (item.to === "/profile") return false;
                  }

                  return true;
                })
                .map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-white text-slate-900 shadow-lg shadow-indigo-500/10 scale-[1.02]"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    <span className="text-lg">{item.emoji}</span>
                    {item.label}
                  </NavLink>
                ))}
            </nav>

            {/* Logout Section */}
            <div className="p-4 border-t border-white/5">
              <button
                onClick={logout}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 py-4 text-sm font-bold text-red-500 transition-all hover:bg-red-500 hover:text-white"
              >
                <span>🚪</span>
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-[65] bg-slate-900/60 backdrop-blur-sm lg:hidden"
            onClick={toggleMenu}
          />
        )}

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 px-4 py-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}