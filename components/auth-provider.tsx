"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import FullscreenLoader from "@/components/fullscreen-loader";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initAuth = useAuthStore((s) => s.initAuth);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (isLoading) {
    return <FullscreenLoader />;
  }

  return <>{children}</>;
}
