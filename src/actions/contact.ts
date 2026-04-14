"use server";

import { putItem, generateId, TABLES } from "@/lib/dynamo";
import { contactSchema } from "@/lib/validators";

// ---------------------------------------------------------------------------
// sendContactMessage
// ---------------------------------------------------------------------------

export async function sendContactMessage(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  try {
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Datos invalidos";
      return { success: false, error: firstError };
    }

    const id = generateId();

    await putItem(TABLES.contactMessages, {
      id,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject,
      message: parsed.data.message,
      read: false,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      data: {
        id,
        message: "Tu mensaje ha sido enviado exitosamente. Te responderemos pronto.",
      },
    };
  } catch (error) {
    console.error("sendContactMessage error:", error);
    return { success: false, error: "Error al enviar el mensaje" };
  }
}
