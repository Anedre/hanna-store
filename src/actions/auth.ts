"use server";

import { queryByIndex, putItem, generateId, TABLES } from "@/lib/dynamo";
import { registerSchema } from "@/lib/validators";
import bcrypt from "bcryptjs";

// ---------------------------------------------------------------------------
// registerUser
// ---------------------------------------------------------------------------

export async function registerUser(data: {
  dni: string;
  name: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}) {
  try {
    // Validate with Zod schema
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Datos invalidos";
      return { success: false, error: firstError };
    }

    const { dni, name, lastName, email, phone, password } = parsed.data;

    // Check DNI uniqueness via dni-index GSI
    const existingDni = await queryByIndex<Record<string, any>>(
      TABLES.users,
      "dni-index",
      "dni",
      dni,
      { limit: 1 }
    );

    if (existingDni.length > 0) {
      return { success: false, error: "Ya existe una cuenta con este DNI" };
    }

    // Check email uniqueness via email-index GSI
    const existingEmail = await queryByIndex<Record<string, any>>(
      TABLES.users,
      "email-index",
      "email",
      email,
      { limit: 1 }
    );

    if (existingEmail.length > 0) {
      return { success: false, error: "Ya existe una cuenta con este correo electronico" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const now = new Date().toISOString();
    const id = generateId();

    // Create user
    const user = await putItem(TABLES.users, {
      id,
      dni,
      name,
      lastName,
      email,
      phone: phone || null,
      password: hashedPassword,
      role: "USER",
      address: null,
      city: null,
      district: null,
      postalCode: null,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          lastName: user.lastName,
          email: user.email,
          dni: user.dni,
        },
        message: "Cuenta creada exitosamente. Ya puedes iniciar sesion.",
      },
    };
  } catch (error) {
    console.error("registerUser error:", error);
    return { success: false, error: "Error al crear la cuenta" };
  }
}
