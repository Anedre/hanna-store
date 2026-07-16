"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (json.success) {
        setStatus("ok");
        setMessage("¡Listo! Te avisaremos de lo nuevo.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(json.error || "No se pudo suscribir. Intenta de nuevo.");
      }
    } catch {
      setStatus("error");
      setMessage("Error de conexión. Intenta de nuevo.");
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl bg-cream-950 text-white px-6 sm:px-12 py-12 sm:py-16 text-center">
          <div className="absolute -left-20 -bottom-24 w-72 h-72 rounded-full bg-hanna-500/20 blur-3xl" aria-hidden />
          <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full bg-gold-500/10 blur-3xl" aria-hidden />

          <div className="relative max-w-xl mx-auto">
            <span className="inline-flex w-11 h-11 rounded-2xl bg-white/10 border border-white/15 items-center justify-center mb-5">
              <Mail className="h-5 w-5" />
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-balance">
              Nuevos ingresos y ofertas, antes que nadie
            </h2>
            <p className="mt-3 text-white/70 text-sm sm:text-base">
              Sin spam. Solo cuando llega algo que vale la pena.
            </p>

            <form onSubmit={submit} className="mt-7 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-hanna-400"
              />
              <Button type="submit" size="lg" isLoading={status === "loading"}>
                Suscribirme
              </Button>
            </form>

            {message && (
              <p className={`mt-3 text-sm ${status === "ok" ? "text-hanna-300" : "text-red-300"}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
