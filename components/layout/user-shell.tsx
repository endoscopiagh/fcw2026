import type { ReactNode } from "react";
import Link from "next/link";

import { logoutAction } from "@/app/actions/session";

type UserShellProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  userDisplayName: string;
  showAdminLink?: boolean;
};

export function UserShell({
  title,
  subtitle,
  children,
  userDisplayName,
  showAdminLink = false,
}: UserShellProps) {
  const navigation = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/predicciones", label: "Predicciones" },
    { href: "/partidos", label: "Partidos" },
    { href: "/grupos", label: "Grupos" },
    { href: "/leaderboard", label: "Tabla de Posiciones" },
  ];

  if (showAdminLink) {
    navigation.push({ href: "/admin", label: "Admin" });
  }

  return (
    <main className="min-h-screen text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="glass-panel mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-4">
          <div>
            <p className="text-sm text-zinc-400">Sesión iniciada como</p>
            <p className="fifa-title-glow font-semibold text-emerald-400">{userDisplayName}</p>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-700 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-200 hover:border-emerald-500 hover:text-emerald-300"
            >
              Cerrar sesión
            </button>
          </form>
        </header>

        <nav className="glass-panel mb-6 flex flex-wrap gap-2 rounded-2xl p-3">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-zinc-700 bg-zinc-950/55 px-3 py-2 text-sm text-zinc-200 hover:-translate-y-[1px] hover:border-emerald-500 hover:text-emerald-300"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <section className="glass-panel rounded-2xl p-6">
          <h1 className="fifa-title-glow text-2xl font-bold">{title}</h1>
          {subtitle ? <p className="mt-2 text-zinc-400">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
