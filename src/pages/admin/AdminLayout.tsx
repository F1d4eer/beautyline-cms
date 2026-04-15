import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { LayoutDashboard, CalendarCheck, Star, Wrench, LogOut, Loader2, FileText, Navigation, Image } from "lucide-react";

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return <Navigate to="/admin/login" replace />;

  return (
    <div className="flex min-h-screen bg-surface-low">
      {/* Sidebar */}
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

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-border/20 bg-card px-4 py-3 md:hidden">
        <p className="font-display text-sm font-bold text-foreground">BEAUTYLINE</p>
        <div className="flex gap-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-lg p-2 transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"}`
              }
            >
              <item.icon size={18} />
            </NavLink>
          ))}
          <button
            onClick={() => signOut()}
            className="rounded-lg p-2 text-muted-foreground"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6 pt-20 md:p-8 md:pt-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
