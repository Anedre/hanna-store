export const SITE_NAME = "Hanna";
export const SITE_TAGLINE = "Tu Tienda Global";
export const SITE_DESCRIPTION =
  "Importamos productos internacionales de calidad con envio seguro a todo el Peru. Tu tienda global de confianza.";
export const SITE_URL = "https://hanna.com";

export const CONTACT = {
  email: "Hanna.manager@gmail.com",
  phone: "969333173",
  whatsapp: "51969333173",
  whatsappMessage: "Hola, quiero informacion sobre sus productos",
  address: "Lima, Peru",
} as const;

export const SOCIAL_LINKS = {
  facebook: "https://facebook.com/hannakids",
  instagram: "https://instagram.com/hannakids",
  tiktok: "https://tiktok.com/@hannakids",
} as const;

export const NAV_LINKS = [
  { label: "Inicio", href: "/" },
  { label: "Productos", href: "/productos" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Servicios", href: "/servicios" },
  { label: "Contacto", href: "/contacto" },
  { label: "FAQ", href: "/faq" },
] as const;

export const SHIPPING = {
  freeThreshold: 150,
  cost: 10,
  currency: "PEN",
} as const;

export const CATEGORIES = [
  { name: "Tecnologia", slug: "tecnologia", icon: "Cpu" },
  { name: "Hogar", slug: "hogar", icon: "Home" },
  { name: "Moda", slug: "moda", icon: "Shirt" },
  { name: "Deportes", slug: "deportes", icon: "Dumbbell" },
  { name: "Belleza", slug: "belleza", icon: "Sparkles" },
  { name: "Juguetes", slug: "juguetes", icon: "Gamepad2" },
] as const;
