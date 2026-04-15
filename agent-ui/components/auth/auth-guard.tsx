"use client";

import { useEffect, useState, type ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ children, redirectTo = "/login" }: AuthGuardProps) {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "customer") {
      window.location.href = redirectTo;
      return;
    }
    setChecked(true);
  }, [redirectTo]);

  if (!checked) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-[var(--color-muted-foreground)]">Checking access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
