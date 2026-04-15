"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminAuthGuard } from "@/components/auth/admin-auth-guard";
import {
  LayoutDashboard,
  Phone,
  Settings,
  FileText,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/calls", label: "Calls", icon: Phone },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/reports", label: "Reports", icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide the root header on admin pages
  useEffect(() => {
    const header = document.getElementById("root-header");
    if (header) header.style.display = "none";
    return () => { if (header) header.style.display = ""; };
  }, []);

  // Login page — no auth guard, no sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/admin/login");
  };

  return (
    <AdminAuthGuard>
      <div className="flex h-screen bg-[var(--color-background)]">
        {/* Sidebar */}
        <aside className="flex w-60 flex-col border-r border-[var(--color-border)] bg-[var(--color-card)]">
          <div className="border-b border-[var(--color-border)] p-4">
            <h1 className="text-lg font-bold text-[var(--color-foreground)]">Admin Panel</h1>
            <p className="text-xs text-[var(--color-muted-foreground)]">Sterling & Associates</p>
            {process.env.NEXT_PUBLIC_FIRM_PHONE && (
              <p className="mt-1 text-xs font-medium text-[var(--color-primary)]">
                {process.env.NEXT_PUBLIC_FIRM_PHONE}
              </p>
            )}
          </div>
          <nav className="flex-1 space-y-1 p-2">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-background)]"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-[var(--color-border)] p-2">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-[var(--color-muted-foreground)] hover:bg-[var(--color-background)]"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </AdminAuthGuard>
  );
}
