import { createUserAction, resetUserPasswordAction, updateUserAction } from "@/app/actions/admin";
import { prisma } from "@/lib/db/prisma";

export default async function AdminUsersPage() {
  const users = await prisma.users.findMany({
    orderBy: [{ created_at: "desc" }],
    select: {
      id: true,
      username: true,
      display_name: true,
      role: true,
      is_active: true,
      has_paid: true,
      created_at: true,
    },
  });

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <h2 className="text-lg font-semibold">Crear usuario</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Registro manual de cuentas privadas para la quiniela.
        </p>

        <form action={createUserAction} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm text-zinc-300">
            Username
            <input
              name="username"
              required
              minLength={3}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
          </label>
          <label className="text-sm text-zinc-300">
            Nombre visible
            <input
              name="display_name"
              required
              minLength={2}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
          </label>
          <label className="text-sm text-zinc-300">
            Contraseña inicial
            <input
              type="password"
              name="password"
              required
              minLength={8}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
          </label>
          <label className="text-sm text-zinc-300">
            Rol
            <select
              name="role"
              defaultValue="user"
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" name="is_active" defaultChecked />
            Cuenta activa
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" name="has_paid" />
            Cuota pagada
          </label>
          <button
            type="submit"
            className="md:col-span-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
          >
            Crear usuario
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <h2 className="text-lg font-semibold">Usuarios registrados</h2>
        <div className="mt-4 space-y-4">
          {users.map((user) => (
            <article key={user.id} className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
              <div className="mb-3">
                <p className="font-semibold text-zinc-100">
                  {user.display_name} <span className="text-zinc-400">(@{user.username})</span>
                </p>
                <p className="text-xs text-zinc-500">
                  Creado: {user.created_at.toLocaleDateString("es-MX")} • rol actual: {user.role}
                </p>
              </div>

              <form action={updateUserAction} className="grid gap-3 md:grid-cols-2">
                <input type="hidden" name="user_id" value={user.id} />
                <label className="text-sm text-zinc-300">
                  Nombre visible
                  <input
                    name="display_name"
                    defaultValue={user.display_name}
                    minLength={2}
                    required
                    className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
                  />
                </label>
                <label className="text-sm text-zinc-300">
                  Rol
                  <select
                    name="role"
                    defaultValue={user.role}
                    className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input type="checkbox" name="is_active" defaultChecked={user.is_active} />
                  Activo
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input type="checkbox" name="has_paid" defaultChecked={user.has_paid} />
                  Pagado
                </label>
                <button
                  type="submit"
                  className="md:col-span-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100 hover:border-emerald-500 hover:text-emerald-300"
                >
                  Guardar cambios de usuario
                </button>
              </form>

              <form action={resetUserPasswordAction} className="mt-3 grid gap-3 md:grid-cols-2">
                <input type="hidden" name="user_id" value={user.id} />
                <label className="text-sm text-zinc-300">
                  Nueva contraseña
                  <input
                    type="password"
                    name="new_password"
                    minLength={8}
                    required
                    placeholder="Mínimo 8 caracteres"
                    className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
                  />
                </label>
                <button
                  type="submit"
                  className="self-end rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100 hover:border-emerald-500 hover:text-emerald-300"
                >
                  Resetear password
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
