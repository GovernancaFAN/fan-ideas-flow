import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { useAdmin } from "@/store/ideas";
import { ModuloKey } from "@/data/admin";

export function RequirePerm({ module, children }: { module: ModuloKey; children: ReactNode }) {
  const perfil = useAuth((s) => s.perfil);
  const perms = useAdmin((s) => s.permissoesDoPerfil(String(perfil)));
  if (!perms.includes(module)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
