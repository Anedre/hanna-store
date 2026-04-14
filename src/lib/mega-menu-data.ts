/**
 * Mega Menu configuration for the Navbar
 * Each nav link can have a dropdown with columns of links
 */

export interface MegaMenuItem {
  label: string;
  href: string;
  description?: string;
  icon?: string; // lucide icon name
  image?: string; // optional featured image
  badge?: string; // e.g. "Nuevo", "Hot"
}

export interface MegaMenuColumn {
  title: string;
  items: MegaMenuItem[];
}

export interface MegaMenuDropdown {
  columns: MegaMenuColumn[];
  featured?: {
    title: string;
    description: string;
    image: string;
    href: string;
    cta: string;
  };
}

export const MEGA_MENU: Record<string, MegaMenuDropdown> = {
  "/productos": {
    columns: [
      {
        title: "Categorias",
        items: [
          { label: "Tecnologia", href: "/categorias/tecnologia", icon: "Cpu", description: "Gadgets y dispositivos" },
          { label: "Hogar", href: "/categorias/hogar", icon: "House", description: "Articulos para tu hogar" },
          { label: "Moda", href: "/categorias/moda", icon: "Shirt", description: "Ropa y accesorios" },
          { label: "Deportes", href: "/categorias/deportes", icon: "Dumbbell", description: "Fitness y outdoor" },
          { label: "Belleza", href: "/categorias/belleza", icon: "Sparkles", description: "Skincare y maquillaje" },
          { label: "Juguetes", href: "/categorias/juguetes", icon: "Gamepad2", description: "Educativos y divertidos" },
        ],
      },
      {
        title: "Explorar",
        items: [
          { label: "Todos los Productos", href: "/productos", icon: "LayoutGrid" },
          { label: "Nuevos Ingresos", href: "/productos?sortBy=createdAt", icon: "Sparkles", badge: "Nuevo" },
          { label: "Mas Vendidos", href: "/productos?sortBy=popular", icon: "TrendingUp" },
          { label: "Ofertas", href: "/productos?sortBy=price_asc", icon: "BadgePercent", badge: "Hot" },
        ],
      },
    ],
    featured: {
      title: "Coleccion de Temporada",
      description: "Descubre los productos mas buscados de la temporada con envio gratis",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop",
      href: "/productos?sortBy=popular",
      cta: "Ver Coleccion",
    },
  },
  "/nosotros": {
    columns: [
      {
        title: "Conocenos",
        items: [
          { label: "Nuestra Historia", href: "/nosotros", icon: "BookOpen", description: "Como empezamos" },
          { label: "Mision y Valores", href: "/nosotros#valores", icon: "Heart" },
          { label: "Proceso de Importacion", href: "/nosotros#proceso", icon: "Truck" },
        ],
      },
      {
        title: "Soporte",
        items: [
          { label: "Centro de Ayuda", href: "/faq", icon: "HelpCircle" },
          { label: "Contacto", href: "/contacto", icon: "Mail" },
          { label: "WhatsApp", href: "https://wa.me/51969333173", icon: "MessageCircle" },
        ],
      },
    ],
  },
};
