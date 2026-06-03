import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getCurrentSessionFromCookies } from "@/lib/auth/session";

export default async function LoginPage() {
  const session = await getCurrentSessionFromCookies();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background:radial-gradient(circle_at_20%_10%,rgba(34,197,94,.14),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(245,158,11,.12),transparent_28%)]" />
      <LoginForm />
    </main>
  );
}
