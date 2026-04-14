/**
 * Mega Menu configuration with subcategories per category
 */

export interface MegaMenuItem {
  label: string;
  href: string;
  description?: string;
  icon?: string;
  badge?: string;
}

export interface MegaMenuColumn {
  title: string;
  titleHref?: string;
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
        title: "Tecnologia",
        titleHref: "/categorias/tecnologia",
        items: [
          { label: "Televisores", href: "/categorias/tecnologia?sub=televisores" },
          { label: "Audifonos", href: "/categorias/tecnologia?sub=audifonos" },
          { label: "Smartphones", href: "/categorias/tecnologia?sub=smartphones" },
          { label: "Wearables", href: "/categorias/tecnologia?sub=wearables" },
          { label: "Accesorios Tech", href: "/categorias/tecnologia?sub=accesorios-tech" },
        ],
      },
      {
        title: "Moda & Hogar",
        items: [
          { label: "Ropa", href: "/categorias/moda?sub=ropa" },
          { label: "Calzado", href: "/categorias/moda?sub=calzado" },
          { label: "Lentes", href: "/categorias/moda?sub=lentes" },
          { label: "Iluminacion", href: "/categorias/hogar?sub=iluminacion" },
          { label: "Cocina", href: "/categorias/hogar?sub=cocina" },
        ],
      },
      {
        title: "Mas Categorias",
        items: [
          { label: "Deportes y Fitness", href: "/categorias/deportes", icon: "Dumbbell" },
          { label: "Belleza Coreana", href: "/categorias/belleza", icon: "Sparkles" },
          { label: "Juguetes STEM", href: "/categorias/juguetes", icon: "Gamepad2" },
          { label: "Nuevos Ingresos", href: "/productos?sortBy=createdAt", badge: "Nuevo" },
          { label: "Ofertas", href: "/productos?sortBy=price_asc", badge: "Hot" },
        ],
      },
    ],
    featured: {
      title: "Top Marcas",
      description: "Samsung, Nike, JBL, COSRX, LEGO y mas marcas originales",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop",
      href: "/productos",
      cta: "Ver todo",
    },
  },
  "/nosotros": {
    columns: [
      {
        title: "Conocenos",
        items: [
          { label: "Nuestra Historia", href: "/nosotros", icon: "BookOpen", description: "Como empezamos" },
          { label: "Mision y Valores", href: "/nosotros", icon: "Heart" },
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
