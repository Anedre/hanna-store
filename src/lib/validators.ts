import { z } from "zod";

export const loginSchema = z.object({
  dni: z
    .string()
    .length(8, "El DNI debe tener 8 digitos")
    .regex(/^\d{8}$/, "El DNI debe contener solo numeros"),
  password: z
    .string()
    .min(6, "La contrasena debe tener al menos 6 caracteres"),
});

export const registerSchema = z
  .object({
    dni: z
      .string()
      .length(8, "El DNI debe tener 8 digitos")
      .regex(/^\d{8}$/, "El DNI debe contener solo numeros"),
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    lastName: z
      .string()
      .min(2, "El apellido debe tener al menos 2 caracteres"),
    email: z.string().email("Ingresa un correo electronico valido"),
    phone: z
      .string()
      .regex(/^\d{9}$/, "El telefono debe tener 9 digitos")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(6, "La contrasena debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contrasenas no coinciden",
    path: ["confirmPassword"],
  });

export const contactSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Ingresa un correo electronico valido"),
  phone: z
    .string()
    .regex(/^\d{9}$/, "El telefono debe tener 9 digitos")
    .optional()
    .or(z.literal("")),
  subject: z.string().min(1, "El asunto es requerido"),
  message: z
    .string()
    .min(10, "El mensaje debe tener al menos 10 caracteres"),
});

export const reviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "La calificacion minima es 1")
    .max(5, "La calificacion maxima es 5"),
  comment: z
    .string()
    .min(5, "El comentario debe tener al menos 5 caracteres"),
});

export const checkoutSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  dni: z
    .string()
    .length(8, "El DNI debe tener 8 digitos")
    .regex(/^\d{8}$/, "El DNI debe contener solo numeros"),
  phone: z
    .string()
    .regex(/^\d{9}$/, "El telefono debe tener 9 digitos"),
  email: z.string().email("Ingresa un correo electronico valido"),
  address: z.string().min(1, "La direccion es requerida"),
  district: z.string().min(1, "El distrito es requerido"),
  city: z.string().min(1, "La ciudad es requerida"),
  postalCode: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const newsletterSchema = z.object({
  email: z.string().email("Ingresa un correo electronico valido"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
