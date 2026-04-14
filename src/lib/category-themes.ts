/**
 * Each category has its own visual personality:
 * unique gradient, accent color, tagline, and lifestyle image.
 */

export interface CategoryTheme {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  gradient: string;         // tailwind gradient classes
  accentColor: string;      // hex
  accentBg: string;         // tailwind bg class
  accentText: string;       // tailwind text class
  image: string;            // lifestyle hero image
  icon: string;             // lucide icon name
  featured: string[];       // featured product slugs to highlight
}

export const CATEGORY_THEMES: CategoryTheme[] = [
  {
    slug: "tecnologia",
    name: "Tecnologia",
    tagline: "El Futuro en tus Manos",
    description: "Gadgets, audio, wearables y accesorios tech importados de las mejores marcas del mundo.",
    gradient: "from-blue-900 via-indigo-900 to-purple-900",
    accentColor: "#6366f1",
    accentBg: "bg-indigo-500",
    accentText: "text-indigo-400",
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&h=500&fit=crop",
    icon: "Cpu",
    featured: ["audifonos-bluetooth-pro", "smartwatch-deportivo-x200"],
  },
  {
    slug: "hogar",
    name: "Hogar & Living",
    tagline: "Transforma tu Espacio",
    description: "Iluminacion, organizacion, cocina y decoracion con diseno moderno que hace la diferencia.",
    gradient: "from-amber-800 via-orange-800 to-yellow-900",
    accentColor: "#f59e0b",
    accentBg: "bg-amber-500",
    accentText: "text-amber-400",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=500&fit=crop",
    icon: "House",
    featured: ["lampara-led-inteligente-rgb", "set-utensilios-cocina-silicona"],
  },
  {
    slug: "moda",
    name: "Moda & Estilo",
    tagline: "Expresa Quien Eres",
    description: "Lentes, mochilas, relojes, billeteras y zapatillas de tendencia internacional.",
    gradient: "from-rose-900 via-pink-900 to-fuchsia-900",
    accentColor: "#ec4899",
    accentBg: "bg-pink-500",
    accentText: "text-pink-400",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=500&fit=crop",
    icon: "Shirt",
    featured: ["zapatillas-running-air-max", "mochila-urbana-antirrobo"],
  },
  {
    slug: "deportes",
    name: "Deportes & Fitness",
    tagline: "Supera tus Limites",
    description: "Equipamiento, accesorios y suplementos para entrenar con todo.",
    gradient: "from-green-900 via-emerald-900 to-teal-900",
    accentColor: "#10b981",
    accentBg: "bg-emerald-500",
    accentText: "text-emerald-400",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&h=500&fit=crop",
    icon: "Dumbbell",
    featured: ["botella-termica-750ml", "banda-resistencia-set-x5"],
  },
  {
    slug: "belleza",
    name: "Belleza & Cuidado",
    tagline: "Tu Mejor Version",
    description: "Skincare coreano, maquillaje profesional y tratamientos faciales importados.",
    gradient: "from-purple-900 via-violet-900 to-fuchsia-900",
    accentColor: "#a855f7",
    accentBg: "bg-purple-500",
    accentText: "text-purple-400",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=500&fit=crop",
    icon: "Sparkles",
    featured: ["set-skincare-coreano-5-pasos", "kit-brochas-maquillaje-x12"],
  },
  {
    slug: "juguetes",
    name: "Juguetes & Educacion",
    tagline: "Aprender Jugando",
    description: "Robots, bloques, kits de ciencia y juguetes interactivos para todas las edades.",
    gradient: "from-orange-800 via-red-800 to-rose-900",
    accentColor: "#f97316",
    accentBg: "bg-orange-500",
    accentText: "text-orange-400",
    image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=1200&h=500&fit=crop",
    icon: "Gamepad2",
    featured: ["robot-educativo-programable", "set-bloques-magneticos-x100"],
  },
];
