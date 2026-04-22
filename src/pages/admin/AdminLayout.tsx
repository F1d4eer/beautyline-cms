import { useState } from "react";
import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  LayoutDashboard, CalendarCheck, Star, Wrench, LogOut,
  Loader2, FileText, Navigation, Image, Menu, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const nav = [
  { to: "/admin",          label: "Дашборд",  icon: LayoutDashboard, end: true },
  { to: "/admin/bookings", label: "Заявки",   icon: CalendarCheck },
  { to: "/admin/reviews",  label: "Отзывы",   icon: Star },
  { to: "/admin/services", label: "Услуги",   icon: Wrench },
];

const cmsNav = [
  { to: "/admin/content",    label: "Контент",   icon: FileText },
  { to: "/admin/navigation", label: "Навигация", icon: Navigation },
  { to: "/admin/media",      label: "Медиа",     icon: Image },
];

const AdminLayout = () => {
  const { session, loading, signOut } = useAdminAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return <Navigate to="/admin/login" replace />;

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className="flex min-h-screen bg-surface-low">

      {/* ─── Desktop Sidebar ─────────────────────────────────────── */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border/20 bg-card md:flex">
        <div className="border-b border-border/20 px-6 py-5">
          <p className="font-display text-sm font-bold text-foreground">BEAUTYLINE</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Панель управления</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-surface-low hover:text-foreground"
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}

          <div className="my-2 border-t border-border/20" />
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            CMS
          </p>

          {cmsNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-surface-low hover:text-foreground"
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border/20 p-3">
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-low hover:text-foreground"
          >
            <LogOut size={17} />
            Выйти
          </button>
        </div>
      </aside>

      {/* ─── Mobile: Top Header ──────────────────────────────────── */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border/20 bg-card px-4 md:hidden">
        <p className="font-display text-sm font-bold tracking-wide text-foreground">BEAUTYLINE</p>
        <button
          onClick={() => setDrawerOpen((v) => !v)}
          className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-surface-low hover:text-foreground"
          aria-label="Меню"
        >
          {drawerOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ─── Mobile: Slide-out Drawer ────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={closeDrawer}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
            />

            {/* Drawer panel */}
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="fixed left-0 top-14 z-50 flex h-[calc(100dvh-3.5rem)] w-64 flex-col border-r border-border/20 bg-card md:hidden"
            >
              <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
                {nav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={closeDrawer}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-surface-low hover:text-foreground"
                      }`
                    }
                  >
                    <item.icon size={18} />
                    {item.label}
                  </NavLink>
                ))}

                <div className="my-2 border-t border-border/20" />
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  CMS
                </p>

                {cmsNav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeDrawer}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-surface-low hover:text-foreground"
                      }`
                    }
                  >
                    <item.icon size={18} />
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="border-t border-border/20 p-3">
                <button
                  onClick={() => { signOut(); closeDrawer(); }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-low hover:text-foreground"
                >
                  <LogOut size={18} />
                  Выйти
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── Mobile: Bottom Tab Bar ──────────────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/20 bg-card md:hidden">
        <div className="grid grid-cols-4">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-xl transition-colors ${
                      isActive ? "bg-primary/10" : ""
                    }`}
                  >
                    <item.icon size={18} />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* ─── Page Content ────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto p-4 pt-[4.5rem] pb-24 md:p-8 md:pt-8 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
