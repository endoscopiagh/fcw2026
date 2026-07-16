import Link from "next/link";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/results", label: "Resultados" },
  { href: "/admin/semifinal-predictions", label: "Pred. semifinales" },
];

export function AdminNav() {
  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition hover:border-emerald-500 hover:text-emerald-300"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
