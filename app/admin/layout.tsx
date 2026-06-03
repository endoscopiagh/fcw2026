import type { ReactNode } from "react";

import { requireAdmin } from "@/lib/auth/guards";
import { AdminNav } from "@/components/admin/admin-nav";
import { UserShell } from "@/components/layout/user-shell";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await requireAdmin();

  return (
    <UserShell
      title="Panel de Administración"
      subtitle="Esta sección solo está disponible para cuentas admin."
      userDisplayName={user.display_name}
      showAdminLink
    >
      <AdminNav />
      {children}
    </UserShell>
  );
}
