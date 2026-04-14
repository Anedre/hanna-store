"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { LogIn, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const dni = formData.get("dni") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        dni,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciales invalidas");
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Ocurrio un error al iniciar sesion. Intenta nuevamente.");
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-hanna-100 flex items-center justify-center mx-auto mb-4">
          <LogIn className="h-6 w-6 text-hanna-600" />
        </div>
        <h1 className="font-display text-2xl font-bold text-cream-900">
          Iniciar Sesion
        </h1>
        <p className="text-sm text-cream-500 mt-1">
          Ingresa a tu cuenta para continuar comprando
        </p>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="DNI"
          name="dni"
          placeholder="12345678"
          maxLength={8}
          pattern="[0-9]{8}"
          title="El DNI debe tener exactamente 8 digitos"
          required
        />

        <div className="relative">
          <Input
            label="Contrasena"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Ingresa tu contrasena"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-cream-400 hover:text-cream-600 transition-colors cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-cream-300 text-hanna-500 focus:ring-hanna-500"
            />
            <span className="text-cream-600">Recordarme</span>
          </label>
          <button
            type="button"
            className="text-hanna-600 hover:text-hanna-700 font-medium transition-colors cursor-pointer"
          >
            Olvidaste tu contrasena?
          </button>
        </div>

        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          className="w-full"
        >
          Iniciar Sesion
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-cream-500">
        No tienes una cuenta?{" "}
        <Link
          href="/registrarse"
          className="text-hanna-600 hover:text-hanna-700 font-medium transition-colors"
        >
          Registrate aqui
        </Link>
      </div>
    </div>
  );
}

export default function IniciarSesionPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-2xl bg-cream-100 animate-pulse mx-auto mb-4" />
          <p className="text-cream-400 text-sm">Cargando...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
