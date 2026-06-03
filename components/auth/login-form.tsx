"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type LoginResponse = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok || !data.ok) {
        setErrorMessage(data.message ?? "No se pudo iniciar sesión.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("Ocurrió un error inesperado. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="glass-panel relative w-full max-w-md overflow-hidden rounded-2xl p-6"
    >
      <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-emerald-500/10 blur-2xl" />
      <h1 className="fifa-title-glow text-2xl font-bold text-zinc-50">Acceso privado FCW 2026</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Ingresa con tu usuario y contraseña asignados por el administrador.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="username" className="mb-1 block text-sm font-medium text-zinc-300">
            Usuario
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-zinc-300">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-6 w-full rounded-lg bg-gradient-to-r from-emerald-500 to-lime-400 px-4 py-2 font-semibold text-zinc-950 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
