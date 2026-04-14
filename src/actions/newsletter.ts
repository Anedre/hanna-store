"use server";

import { getItem, putItem, updateItem, TABLES } from "@/lib/dynamo";
import { newsletterSchema } from "@/lib/validators";

// ---------------------------------------------------------------------------
// subscribeNewsletter
// ---------------------------------------------------------------------------

export async function subscribeNewsletter(email: string) {
  try {
    const parsed = newsletterSchema.safeParse({ email });
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Email invalido";
      return { success: false, error: firstError };
    }

    const normalizedEmail = parsed.data.email;

    // Check if already subscribed – Newsletter uses email as PK
    const existing = await getItem<Record<string, any>>(TABLES.newsletter, {
      email: normalizedEmail,
    });

    if (existing) {
      if (existing.active) {
        return { success: true, data: { message: "Ya estas suscrito a nuestro newsletter" } };
      }
      // Re-activate
      await updateItem(TABLES.newsletter, { email: normalizedEmail }, { active: true });
      return { success: true, data: { message: "Tu suscripcion ha sido reactivada" } };
    }

    // Create new subscription
    await putItem(TABLES.newsletter, {
      email: normalizedEmail,
      active: true,
      createdAt: new Date().toISOString(),
    });

    return { success: true, data: { message: "Te has suscrito exitosamente" } };
  } catch (error) {
    console.error("subscribeNewsletter error:", error);
    return { success: false, error: "Error al suscribirte al newsletter" };
  }
}
