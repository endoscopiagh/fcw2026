import { ChangePasswordForm } from "@/components/account/change-password-form";
import { UserShell } from "@/components/layout/user-shell";
import { requireAuth } from "@/lib/auth/guards";

export default async function CuentaPage() {
  const user = await requireAuth();

  return (
    <UserShell
      title="Cuenta"
      subtitle="Administra la seguridad de tu cuenta."
      userDisplayName={user.display_name}
      showAdminLink={user.role === "admin"}
    >
      <section className="max-w-xl space-y-3">
        <h2 className="text-lg font-semibold">Cambiar contraseña</h2>
        <p className="text-sm text-zinc-400">
          Ingresa tu contraseña actual y define una nueva contraseña para seguir usando la plataforma.
        </p>
        <ChangePasswordForm />
      </section>
    </UserShell>
  );
}
