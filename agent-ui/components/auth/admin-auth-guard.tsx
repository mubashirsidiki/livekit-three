"use client";

import { useEffect, useState, type ReactNode } from "react";

interface AdminAuthGuardProps {
  children: ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "admin") {
      window.location.href = "/admin/login";
      return;
    }
    setChecked(true);
  }, []);

  if (!checked) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-[var(--color-muted-foreground)]">Checking access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
