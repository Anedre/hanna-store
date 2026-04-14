/**
 * Category filter configuration — defines subcategories and
 * dynamic filters per category (inspired by AliExpress).
 *
 * Each category has:
 *  - subcategories: browsable sections within the category
 *  - filters: faceted search options, some scoped to specific subcategories
 */

export interface FilterOption {
  value: string;
  label: string;
  color?: string; // hex for color swatches
}

export interface CategoryFilter {
  key: string;
  label: string;
  type: "checkbox" | "color" | "range";
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  subcategory?: string; // only show when this subcategory is active (null = always show)
}

export interface SubcategoryDef {
  slug: string;
  name: string;
  icon?: string;
}

export interface CategoryFilterConfig {
  subcategories: SubcategoryDef[];
  filters: CategoryFilter[];
  brands: string[]; // brands relevant to this category
}

// ---------------------------------------------------------------------------
// Helper to create options from string array
// ---------------------------------------------------------------------------
function opts(values: string[]): FilterOption[] {
  return values.map((v) => ({ value: v, label: v }));
}

function colorOpts(colors: [string, string][]): FilterOption[] {
  return colors.map(([label, hex]) => ({ value: label.toLowerCase(), label, color: hex }));
}

// ---------------------------------------------------------------------------
// FILTER CONFIGS PER CATEGORY
// ---------------------------------------------------------------------------

export const CATEGORY_FILTERS: Record<string, CategoryFilterConfig> = {
  tecnologia: {
    subcategories: [
      { slug: "televisores", name: "Televisores", icon: "Monitor" },
      { slug: "audifonos", name: "Audifonos", icon: "Headphones" },
      { slug: "smartphones", name: "Smartphones", icon: "Smartphone" },
      { slug: "computacion", name: "Computacion", icon: "Laptop" },
      { slug: "accesorios-tech", name: "Accesorios", icon: "Usb" },
      { slug: "wearables", name: "Wearables", icon: "Watch" },
    ],
    brands: ["Samsung", "Apple", "Xiaomi", "Ugreen", "JBL", "Sony", "LG", "Huawei", "Anker", "Baseus"],
    filters: [
      { key: "brand", label: "Marca", type: "checkbox", options: opts(["Samsung", "Apple", "Xiaomi", "Ugreen", "JBL", "Sony", "LG", "Huawei", "Anker", "Baseus"]) },
      { key: "screen_size", label: "Tamano de Pantalla", type: "checkbox", options: opts(["32\"", "43\"", "50\"", "55\"", "65\"", "75\""]), subcategory: "televisores" },
      { key: "resolution", label: "Resolucion", type: "checkbox", options: opts(["HD", "Full HD", "4K UHD", "8K"]), subcategory: "televisores" },
      { key: "panel_type", label: "Tipo de Panel", type: "checkbox", options: opts(["LED", "OLED", "QLED", "Mini LED", "Neo QLED"]), subcategory: "televisores" },
      { key: "connectivity", label: "Conectividad", type: "checkbox", options: opts(["Bluetooth 5.0", "Bluetooth 5.3", "WiFi", "USB-C", "Lightning", "Jack 3.5mm"]), subcategory: "audifonos" },
      { key: "audio_type", label: "Tipo de Audio", type: "checkbox", options: opts(["In-ear", "Over-ear", "On-ear", "True Wireless", "Neckband"]), subcategory: "audifonos" },
      { key: "noise_cancel", label: "Cancelacion de Ruido", type: "checkbox", options: opts(["ANC Activa", "ANC Hibrida", "Sin ANC"]), subcategory: "audifonos" },
      { key: "storage", label: "Almacenamiento", type: "checkbox", options: opts(["64GB", "128GB", "256GB", "512GB", "1TB"]), subcategory: "smartphones" },
      { key: "ram", label: "Memoria RAM", type: "checkbox", options: opts(["4GB", "6GB", "8GB", "12GB", "16GB"]), subcategory: "smartphones" },
      { key: "price", label: "Precio", type: "range", min: 0, max: 5000, step: 50, unit: "S/" },
    ],
  },

  moda: {
    subcategories: [
      { slug: "ropa", name: "Ropa", icon: "Shirt" },
      { slug: "calzado", name: "Calzado", icon: "Footprints" },
      { slug: "accesorios-moda", name: "Accesorios", icon: "Watch" },
      { slug: "bolsos", name: "Bolsos y Mochilas", icon: "Briefcase" },
      { slug: "lentes", name: "Lentes", icon: "Glasses" },
    ],
    brands: ["Nike", "Adidas", "Zara", "Uniqlo", "Samsonite", "Ray-Ban", "Casio", "Fossil", "Levi's", "Puma"],
    filters: [
      { key: "brand", label: "Marca", type: "checkbox", options: opts(["Nike", "Adidas", "Zara", "Uniqlo", "Samsonite", "Ray-Ban", "Casio", "Fossil", "Levi's", "Puma"]) },
      { key: "size", label: "Talla", type: "checkbox", options: opts(["XS", "S", "M", "L", "XL", "XXL"]), subcategory: "ropa" },
      { key: "shoe_size", label: "Talla de Calzado", type: "checkbox", options: opts(["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"]), subcategory: "calzado" },
      { key: "color", label: "Color", type: "color", options: colorOpts([
        ["Negro", "#000000"], ["Blanco", "#FFFFFF"], ["Azul", "#2563eb"],
        ["Rojo", "#dc2626"], ["Verde", "#16a34a"], ["Rosa", "#ec4899"],
        ["Gris", "#6b7280"], ["Marron", "#92400e"], ["Beige", "#d4a574"],
      ]) },
      { key: "material", label: "Material", type: "checkbox", options: opts(["Algodon", "Poliester", "Cuero genuino", "Cuero sintetico", "Nylon", "Lona"]) },
      { key: "gender", label: "Genero", type: "checkbox", options: opts(["Hombre", "Mujer", "Unisex"]) },
      { key: "price", label: "Precio", type: "range", min: 0, max: 1000, step: 20, unit: "S/" },
    ],
  },

  hogar: {
    subcategories: [
      { slug: "iluminacion", name: "Iluminacion", icon: "Lightbulb" },
      { slug: "cocina", name: "Cocina", icon: "CookingPot" },
      { slug: "organizacion", name: "Organizacion", icon: "LayoutGrid" },
      { slug: "decoracion", name: "Decoracion", icon: "Palette" },
      { slug: "jardin", name: "Jardin y Exteriores", icon: "TreePine" },
    ],
    brands: ["Xiaomi", "Philips", "IKEA", "OXO", "KitchenAid", "Dyson", "Muji", "WMF"],
    filters: [
      { key: "brand", label: "Marca", type: "checkbox", options: opts(["Xiaomi", "Philips", "IKEA", "OXO", "KitchenAid", "Dyson", "Muji", "WMF"]) },
      { key: "room", label: "Ambiente", type: "checkbox", options: opts(["Sala", "Dormitorio", "Cocina", "Bano", "Oficina", "Jardin"]) },
      { key: "material", label: "Material", type: "checkbox", options: opts(["Madera", "Metal", "Vidrio", "Ceramica", "Bambu", "Plastico", "Silicona"]) },
      { key: "smart", label: "Inteligente", type: "checkbox", options: opts(["WiFi", "Bluetooth", "Alexa", "Google Home"]), subcategory: "iluminacion" },
      { key: "price", label: "Precio", type: "range", min: 0, max: 2000, step: 25, unit: "S/" },
    ],
  },

  deportes: {
    subcategories: [
      { slug: "fitness", name: "Fitness", icon: "Dumbbell" },
      { slug: "running", name: "Running", icon: "PersonStanding" },
      { slug: "outdoor", name: "Outdoor", icon: "Mountain" },
      { slug: "yoga", name: "Yoga y Pilates", icon: "Heart" },
      { slug: "accesorios-deporte", name: "Accesorios", icon: "Backpack" },
    ],
    brands: ["Nike", "Adidas", "Under Armour", "Puma", "Reebok", "Decathlon", "GymShark", "Rogue"],
    filters: [
      { key: "brand", label: "Marca", type: "checkbox", options: opts(["Nike", "Adidas", "Under Armour", "Puma", "Reebok", "Decathlon", "GymShark", "Rogue"]) },
      { key: "sport", label: "Deporte", type: "checkbox", options: opts(["Gym", "Running", "Yoga", "Natacion", "Ciclismo", "CrossFit"]) },
      { key: "resistance", label: "Resistencia", type: "checkbox", options: opts(["Ligera", "Media", "Fuerte", "Extra Fuerte"]), subcategory: "fitness" },
      { key: "gender", label: "Genero", type: "checkbox", options: opts(["Hombre", "Mujer", "Unisex"]) },
      { key: "price", label: "Precio", type: "range", min: 0, max: 1500, step: 25, unit: "S/" },
    ],
  },

  belleza: {
    subcategories: [
      { slug: "skincare", name: "Skincare", icon: "Droplets" },
      { slug: "maquillaje", name: "Maquillaje", icon: "Palette" },
      { slug: "cuidado-capilar", name: "Cuidado Capilar", icon: "Scissors" },
      { slug: "fragancias", name: "Fragancias", icon: "Flower2" },
      { slug: "herramientas-belleza", name: "Herramientas", icon: "Wand2" },
    ],
    brands: ["COSRX", "The Ordinary", "Morphe", "MAC", "Maybelline", "L'Oreal", "Innisfree", "Laneige", "Etude House"],
    filters: [
      { key: "brand", label: "Marca", type: "checkbox", options: opts(["COSRX", "The Ordinary", "Morphe", "MAC", "Maybelline", "L'Oreal", "Innisfree", "Laneige", "Etude House"]) },
      { key: "skin_type", label: "Tipo de Piel", type: "checkbox", options: opts(["Grasa", "Seca", "Mixta", "Sensible", "Normal"]), subcategory: "skincare" },
      { key: "concern", label: "Preocupacion", type: "checkbox", options: opts(["Acne", "Arrugas", "Manchas", "Hidratacion", "Poros", "Ojeras"]), subcategory: "skincare" },
      { key: "finish", label: "Acabado", type: "checkbox", options: opts(["Mate", "Natural", "Luminoso", "Satinado"]), subcategory: "maquillaje" },
      { key: "origin", label: "Origen", type: "checkbox", options: opts(["Corea del Sur", "Japon", "Francia", "USA"]) },
      { key: "price", label: "Precio", type: "range", min: 0, max: 500, step: 10, unit: "S/" },
    ],
  },

  juguetes: {
    subcategories: [
      { slug: "educativos", name: "Educativos", icon: "GraduationCap" },
      { slug: "stem-robotica", name: "STEM y Robotica", icon: "Cpu" },
      { slug: "construccion", name: "Construccion", icon: "Blocks" },
      { slug: "peluches", name: "Peluches", icon: "Heart" },
      { slug: "juegos-mesa", name: "Juegos de Mesa", icon: "Dice5" },
    ],
    brands: ["LEGO", "Mattel", "Hasbro", "Fisher-Price", "Playmobil", "Hot Wheels", "Nerf", "Funko"],
    filters: [
      { key: "brand", label: "Marca", type: "checkbox", options: opts(["LEGO", "Mattel", "Hasbro", "Fisher-Price", "Playmobil", "Hot Wheels", "Nerf", "Funko"]) },
      { key: "age", label: "Edad", type: "checkbox", options: opts(["0-2 anos", "3-5 anos", "6-8 anos", "9-12 anos", "13+ anos"]) },
      { key: "skill", label: "Habilidad", type: "checkbox", options: opts(["Motricidad", "Logica", "Creatividad", "Ciencia", "Lenguaje", "Social"]), subcategory: "educativos" },
      { key: "pieces", label: "Cantidad de Piezas", type: "checkbox", options: opts(["1-50", "51-100", "101-500", "500+"]), subcategory: "construccion" },
      { key: "price", label: "Precio", type: "range", min: 0, max: 800, step: 20, unit: "S/" },
    ],
  },
};

// ---------------------------------------------------------------------------
// Helper to get config for a category slug
// ---------------------------------------------------------------------------
export function getCategoryFilters(categorySlug: string): CategoryFilterConfig | null {
  return CATEGORY_FILTERS[categorySlug] || null;
}

// ---------------------------------------------------------------------------
// Get active filters for a category + subcategory combination
// ---------------------------------------------------------------------------
export function getActiveFilters(categorySlug: string, subcategorySlug?: string): CategoryFilter[] {
  const config = CATEGORY_FILTERS[categorySlug];
  if (!config) return [];

  return config.filters.filter((f) => {
    // Always show filters without subcategory restriction
    if (!f.subcategory) return true;
    // Show subcategory-specific filters only when that subcategory is active
    if (subcategorySlug && f.subcategory === subcategorySlug) return true;
    return false;
  });
}
