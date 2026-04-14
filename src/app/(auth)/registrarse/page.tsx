"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { registerUser } from "@/actions/auth";
import { UserPlus, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FieldErrors {
  dni?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function RegistrarsePage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const validateForm = (formData: FormData): FieldErrors => {
    const fieldErrors: FieldErrors = {};

    const dni = (formData.get("dni") as string) || "";
    const nombre = (formData.get("nombre") as string) || "";
    const apellido = (formData.get("apellido") as string) || "";
    const email = (formData.get("email") as string) || "";
    const telefono = (formData.get("telefono") as string) || "";
    const password = (formData.get("password") as string) || "";
    const confirmPassword = (formData.get("confirmPassword") as string) || "";

    if (!/^\d{8}$/.test(dni)) {
      fieldErrors.dni = "El DNI debe tener exactamente 8 digitos";
    }

    if (nombre.trim().length < 2) {
      fieldErrors.nombre = "El nombre debe tener al menos 2 caracteres";
    }

    if (apellido.trim().length < 2) {
      fieldErrors.apellido = "El apellido debe tener al menos 2 caracteres";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fieldErrors.email = "Ingresa un correo electronico valido";
    }

    if (telefono && !/^\d{9}$/.test(telefono)) {
      fieldErrors.telefono = "El telefono debe tener 9 digitos";
    }

    if (password.length < 6) {
      fieldErrors.password = "La contrasena debe tener al menos 6 caracteres";
    }

    if (password !== confirmPassword) {
      fieldErrors.confirmPassword = "Las contrasenas no coinciden";
    }

    return fieldErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);

    // Client-side validation
    const fieldErrors = validateForm(formData);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    const dni = formData.get("dni") as string;
    const nombre = formData.get("nombre") as string;
    const apellido = formData.get("apellido") as string;
    const email = formData.get("email") as string;
    const telefono = formData.get("telefono") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    try {
      const result = await registerUser({
        dni,
        name: nombre,
        lastName: apellido,
        email,
        phone: telefono || undefined,
        password,
        confirmPassword,
      });

      if (!result.success) {
        setErrors({ general: result.error || "Error al crear la cuenta" });
        setIsLoading(false);
        return;
      }

      // Auto-login after successful registration
      const signInResult = await signIn("credentials", {
        dni,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Registration succeeded but auto-login failed -- redirect to login
        router.push("/iniciar-sesion");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setErrors({ general: "Ocurrio un error inesperado. Intenta nuevamente." });
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-hanna-100 flex items-center justify-center mx-auto mb-4">
          <UserPlus className="h-6 w-6 text-hanna-600" />
        </div>
        <h1 className="font-display text-2xl font-bold text-cream-900">
          Crear Cuenta
        </h1>
        <p className="text-sm text-cream-500 mt-1">
          Registrate para empezar a comprar con nosotros
        </p>
      </div>

      {errors.general && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="DNI"
          name="dni"
          placeholder="12345678"
          maxLength={8}
          error={errors.dni}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre"
            name="nombre"
            placeholder="Tu nombre"
            error={errors.nombre}
            required
          />
          <Input
            label="Apellido"
            name="apellido"
            placeholder="Tu apellido"
            error={errors.apellido}
            required
          />
        </div>

        <Input
          label="Correo electronico"
          name="email"
          type="email"
          placeholder="correo@ejemplo.com"
          error={errors.email}
          required
        />

        <Input
          label="Telefono"
          name="telefono"
          type="tel"
          placeholder="999 999 999"
          error={errors.telefono}
        />

        <div className="relative">
          <Input
            label="Contrasena"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Minimo 6 caracteres"
            error={errors.password}
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

        <div className="relative">
          <Input
            label="Confirmar contrasena"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="Repite tu contrasena"
            error={errors.confirmPassword}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-[38px] text-cream-400 hover:text-cream-600 transition-colors cursor-pointer"
          >
            {showConfirm ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        <label className="flex items-start gap-2 text-sm cursor-pointer pt-1">
          <input
            type="checkbox"
            required
            className="rounded border-cream-300 text-hanna-500 focus:ring-hanna-500 mt-0.5"
          />
          <span className="text-cream-600">
            Acepto los{" "}
            <span className="text-hanna-600 font-medium">
              Terminos y Condiciones
            </span>{" "}
            y la{" "}
            <span className="text-hanna-600 font-medium">
              Politica de Privacidad
            </span>
          </span>
        </label>

        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          className="w-full"
        >
          Crear Mi Cuenta
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-cream-500">
        Ya tienes una cuenta?{" "}
        <Link
          href="/iniciar-sesion"
          className="text-hanna-600 hover:text-hanna-700 font-medium transition-colors"
        >
          Inicia sesion
        </Link>
      </div>
    </div>
  );
}
