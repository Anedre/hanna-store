"use server";

import {
  scanTable,
  queryByIndex,
  getItem,
  TABLES,
} from "@/lib/dynamo";
import type { Product, Category, Subcategory } from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseProductImages(product: Record<string, any>): Record<string, any> & { images: string[] } {
  let parsed: string[];
  try {
    parsed = typeof product.images === "string" ? JSON.parse(product.images) : product.images ?? [];
  } catch {
    parsed = [];
  }
  return { ...product, images: parsed };
}

function computeRating(reviews: { rating: number }[]) {
  const count = reviews.length;
  if (count === 0) return { averageRating: 0, reviewCount: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return {
    averageRating: Math.round((sum / count) * 10) / 10,
    reviewCount: count,
  };
}

// ---------------------------------------------------------------------------
// getProducts  -- paginated product list with filters
// ---------------------------------------------------------------------------

interface GetProductsParams {
  categorySlug?: string;
  brand?: string;
  subcategorySlug?: string;
  attributes?: Record<string, string>;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: string; // "price_asc" | "price_desc" | "newest" | "name" | "popular"
  page?: number;
  perPage?: number;
}

export async function getProducts(params: GetProductsParams = {}) {
  try {
    const {
      categorySlug,
      brand,
      subcategorySlug,
      attributes,
      minPrice,
      maxPrice,
      search,
      sortBy = "newest",
      page = 1,
      perPage = 12,
    } = params;

    // If filtering by category slug, resolve categoryId first
    let categoryId: string | undefined;
    if (categorySlug) {
      const cats = await queryByIndex<Record<string, any>>(
        TABLES.categories,
        "slug-index",
        "slug",
        categorySlug,
        { limit: 1 }
      );
      if (cats.length === 0) {
        return { success: true, data: { products: [], total: 0, totalPages: 0 } };
      }
      categoryId = cats[0].id;
    }

    // Fetch products – use category-index GSI when possible, otherwise scan
    let allProducts: Record<string, any>[];
    if (categoryId) {
      allProducts = await queryByIndex<Record<string, any>>(
        TABLES.products,
        "category-index",
        "categoryId",
        categoryId,
        {
          filterExpression: "#active = :trueVal",
          expressionValues: { ":trueVal": true },
          expressionNames: { "#active": "active" },
        }
      );
    } else {
      allProducts = await scanTable<Record<string, any>>(TABLES.products, {
        filterExpression: "#active = :trueVal",
        expressionValues: { ":trueVal": true },
        expressionNames: { "#active": "active" },
      });
    }

    // Apply price filters in memory
    if (minPrice !== undefined) {
      allProducts = allProducts.filter((p) => p.price >= minPrice);
    }
    if (maxPrice !== undefined) {
      allProducts = allProducts.filter((p) => p.price <= maxPrice);
    }

    // Apply search filter in memory
    if (search) {
      const q = search.toLowerCase();
      allProducts = allProducts.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.tags && p.tags.toLowerCase().includes(q))
      );
    }

    // Apply brand filter (case-insensitive)
    if (brand) {
      const brandLower = brand.toLowerCase();
      allProducts = allProducts.filter((p) =>
        p.brand && p.brand.toLowerCase() === brandLower
      );
    }

    // Apply subcategory filter
    if (subcategorySlug) {
      allProducts = allProducts.filter((p) => p.subcategorySlug === subcategorySlug);
    }

    // Apply attribute filters
    if (attributes && Object.keys(attributes).length > 0) {
      allProducts = allProducts.filter((p) => {
        const pAttrs =
          typeof p.attributes === "string"
            ? (() => { try { return JSON.parse(p.attributes); } catch { return {}; } })()
            : p.attributes || {};
        return Object.entries(attributes).every(([k, v]) => pAttrs[k] === v);
      });
    }

    // Sort in memory
    switch (sortBy) {
      case "price_asc":
        allProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price_desc":
        allProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "name":
        allProducts.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "newest":
      case "popular":
      default:
        allProducts.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
        break;
    }

    const total = allProducts.length;
    const totalPages = Math.ceil(total / perPage);

    // Paginate
    const skip = (page - 1) * perPage;
    const paged = allProducts.slice(skip, skip + perPage);

    // Fetch categories for these products
    const catIds = [...new Set(paged.map((p) => p.categoryId).filter(Boolean))];
    const categories = new Map<string, Record<string, any>>();
    for (const cid of catIds) {
      const cat = await getItem<Record<string, any>>(TABLES.categories, { id: cid });
      if (cat) categories.set(cid, cat);
    }

    // Fetch approved reviews for rating computation
    const allReviews = await scanTable<Record<string, any>>(TABLES.reviews, {
      filterExpression: "#approved = :trueVal",
      expressionValues: { ":trueVal": true },
      expressionNames: { "#approved": "approved" },
    });
    const reviewsByProduct = new Map<string, { rating: number }[]>();
    for (const r of allReviews) {
      const pid = r.productId;
      if (!reviewsByProduct.has(pid)) reviewsByProduct.set(pid, []);
      reviewsByProduct.get(pid)!.push({ rating: r.rating });
    }

    const mapped = paged.map((p) => {
      const parsed = parseProductImages(p);
      const category = categories.get(p.categoryId) || undefined;
      const reviews = reviewsByProduct.get(p.id) || [];
      return {
        ...parsed,
        category,
        ...computeRating(reviews),
      };
    });

    return {
      success: true,
      data: {
        products: mapped as (Product & { averageRating: number; reviewCount: number })[],
        total,
        totalPages,
      },
    };
  } catch (error) {
    console.error("getProducts error:", error);
    return { success: false, error: "Error al obtener los productos" };
  }
}

// ---------------------------------------------------------------------------
// getProductBySlug
// ---------------------------------------------------------------------------

export async function getProductBySlug(slug: string) {
  try {
    const products = await queryByIndex<Record<string, any>>(
      TABLES.products,
      "slug-index",
      "slug",
      slug,
      { limit: 1 }
    );

    if (products.length === 0) {
      return { success: false, error: "Producto no encontrado" };
    }

    const product = products[0];

    // Fetch category
    let category = undefined;
    if (product.categoryId) {
      category = await getItem<Record<string, any>>(TABLES.categories, {
        id: product.categoryId,
      });
    }

    // Fetch approved reviews with user info
    const rawReviews = await scanTable<Record<string, any>>(TABLES.reviews, {
      filterExpression: "#pid = :pid AND #approved = :trueVal",
      expressionValues: { ":pid": product.id, ":trueVal": true },
      expressionNames: { "#pid": "productId", "#approved": "approved" },
    });

    // Enrich reviews with user name
    const reviews: (Record<string, any> & { user?: { name: string; lastName: string } })[] = [];
    for (const r of rawReviews) {
      let user: { name: string; lastName: string } | undefined;
      if (r.userId) {
        const u = await getItem<Record<string, any>>(TABLES.users, { id: r.userId });
        if (u) user = { name: u.name, lastName: u.lastName };
      }
      reviews.push({ ...r, user });
    }

    // Sort reviews by createdAt desc
    reviews.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );

    const parsed = parseProductImages(product);
    const { averageRating, reviewCount } = computeRating(
      reviews.map((r) => ({ rating: r.rating as number }))
    );

    return {
      success: true,
      data: {
        ...parsed,
        category,
        reviews,
        averageRating,
        reviewCount,
      } as Product & { averageRating: number; reviewCount: number },
    };
  } catch (error) {
    console.error("getProductBySlug error:", error);
    return { success: false, error: "Error al obtener el producto" };
  }
}

// ---------------------------------------------------------------------------
// getFeaturedProducts
// ---------------------------------------------------------------------------

export async function getFeaturedProducts(limit = 8) {
  try {
    const products = await scanTable<Record<string, any>>(TABLES.products, {
      filterExpression: "#featured = :trueVal AND #active = :trueVal2",
      expressionValues: { ":trueVal": true, ":trueVal2": true },
      expressionNames: { "#featured": "featured", "#active": "active" },
    });

    // Sort by createdAt desc
    products.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );

    const limited = products.slice(0, limit);

    // Fetch categories
    const catIds = [...new Set(limited.map((p) => p.categoryId).filter(Boolean))];
    const categories = new Map<string, Record<string, any>>();
    for (const cid of catIds) {
      const cat = await getItem<Record<string, any>>(TABLES.categories, { id: cid });
      if (cat) categories.set(cid, cat);
    }

    // Fetch approved reviews
    const allReviews = await scanTable<Record<string, any>>(TABLES.reviews, {
      filterExpression: "#approved = :trueVal",
      expressionValues: { ":trueVal": true },
      expressionNames: { "#approved": "approved" },
    });
    const reviewsByProduct = new Map<string, { rating: number }[]>();
    for (const r of allReviews) {
      if (!reviewsByProduct.has(r.productId)) reviewsByProduct.set(r.productId, []);
      reviewsByProduct.get(r.productId)!.push({ rating: r.rating });
    }

    const mapped = limited.map((p) => {
      const parsed = parseProductImages(p);
      const category = categories.get(p.categoryId) || undefined;
      const reviews = reviewsByProduct.get(p.id) || [];
      return { ...parsed, category, ...computeRating(reviews) };
    });

    return { success: true, data: mapped as (Product & { averageRating: number; reviewCount: number })[] };
  } catch (error) {
    console.error("getFeaturedProducts error:", error);
    return { success: false, error: "Error al obtener productos destacados" };
  }
}

// ---------------------------------------------------------------------------
// getProductsByCategory
// ---------------------------------------------------------------------------

export async function getProductsByCategory(categorySlug: string, limit?: number) {
  try {
    // Resolve category slug to id
    const cats = await queryByIndex<Record<string, any>>(
      TABLES.categories,
      "slug-index",
      "slug",
      categorySlug,
      { limit: 1 }
    );

    if (cats.length === 0) {
      return { success: true, data: [] };
    }

    const categoryId = cats[0].id;
    const category = cats[0];

    const products = await queryByIndex<Record<string, any>>(
      TABLES.products,
      "category-index",
      "categoryId",
      categoryId,
      {
        filterExpression: "#active = :trueVal",
        expressionValues: { ":trueVal": true },
        expressionNames: { "#active": "active" },
      }
    );

    // Sort by createdAt desc
    products.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );

    const limited = limit ? products.slice(0, limit) : products;

    // Fetch approved reviews
    const allReviews = await scanTable<Record<string, any>>(TABLES.reviews, {
      filterExpression: "#approved = :trueVal",
      expressionValues: { ":trueVal": true },
      expressionNames: { "#approved": "approved" },
    });
    const reviewsByProduct = new Map<string, { rating: number }[]>();
    for (const r of allReviews) {
      if (!reviewsByProduct.has(r.productId)) reviewsByProduct.set(r.productId, []);
      reviewsByProduct.get(r.productId)!.push({ rating: r.rating });
    }

    const mapped = limited.map((p) => {
      const parsed = parseProductImages(p);
      const reviews = reviewsByProduct.get(p.id) || [];
      return { ...parsed, category, ...computeRating(reviews) };
    });

    return { success: true, data: mapped as (Product & { averageRating: number; reviewCount: number })[] };
  } catch (error) {
    console.error("getProductsByCategory error:", error);
    return { success: false, error: "Error al obtener productos por categoria" };
  }
}

// ---------------------------------------------------------------------------
// searchProducts  -- lightweight, for autocomplete
// ---------------------------------------------------------------------------

export async function searchProducts(query: string, limit = 10) {
  try {
    if (!query || query.trim().length < 2) {
      return { success: true, data: [] };
    }

    const products = await scanTable<Record<string, any>>(TABLES.products, {
      filterExpression: "#active = :trueVal",
      expressionValues: { ":trueVal": true },
      expressionNames: { "#active": "active" },
    });

    const q = query.toLowerCase();
    const filtered = products.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.tags && p.tags.toLowerCase().includes(q))
    );

    const limited = filtered.slice(0, limit);

    const mapped = limited.map((p) => {
      let images: string[] = [];
      try {
        images = typeof p.images === "string" ? JSON.parse(p.images) : p.images ?? [];
      } catch {
        images = [];
      }
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        image: images[0] || "",
      };
    });

    return { success: true, data: mapped };
  } catch (error) {
    console.error("searchProducts error:", error);
    return { success: false, error: "Error en la busqueda" };
  }
}

// ---------------------------------------------------------------------------
// getCategories
// ---------------------------------------------------------------------------

export async function getCategories() {
  try {
    const categories = await scanTable<Record<string, any>>(TABLES.categories);

    // Count products per category
    const products = await scanTable<Record<string, any>>(TABLES.products, {
      filterExpression: "#active = :trueVal",
      expressionValues: { ":trueVal": true },
      expressionNames: { "#active": "active" },
    });

    const countMap = new Map<string, number>();
    for (const p of products) {
      if (p.categoryId) {
        countMap.set(p.categoryId, (countMap.get(p.categoryId) || 0) + 1);
      }
    }

    const withCounts = categories.map((c: Record<string, any>) => ({
      ...c,
      _count: { products: countMap.get(c.id) || 0 },
    }));

    // Sort by name asc
    withCounts.sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));

    return { success: true, data: withCounts as Category[] };
  } catch (error) {
    console.error("getCategories error:", error);
    return { success: false, error: "Error al obtener las categorias" };
  }
}

// ---------------------------------------------------------------------------
// getCategoryBySlug
// ---------------------------------------------------------------------------

export async function getCategoryBySlug(slug: string) {
  try {
    const cats = await queryByIndex<Record<string, any>>(
      TABLES.categories,
      "slug-index",
      "slug",
      slug,
      { limit: 1 }
    );

    if (cats.length === 0) {
      return { success: false, error: "Categoria no encontrada" };
    }

    const category = cats[0];

    // Count products in this category
    const products = await queryByIndex<Record<string, any>>(
      TABLES.products,
      "category-index",
      "categoryId",
      category.id,
      {
        filterExpression: "#active = :trueVal",
        expressionValues: { ":trueVal": true },
        expressionNames: { "#active": "active" },
      }
    );

    const result = {
      ...category,
      _count: { products: products.length },
    };

    return { success: true, data: result as Category };
  } catch (error) {
    console.error("getCategoryBySlug error:", error);
    return { success: false, error: "Error al obtener la categoria" };
  }
}

// ---------------------------------------------------------------------------
// getSubcategories -- fetch subcategories for a category by slug
// ---------------------------------------------------------------------------

export async function getSubcategories(categorySlug: string) {
  try {
    // Resolve slug to category id
    const cats = await queryByIndex<Record<string, any>>(
      TABLES.categories,
      "slug-index",
      "slug",
      categorySlug,
      { limit: 1 }
    );

    if (cats.length === 0) {
      return { success: true, data: [] };
    }

    const categoryId = cats[0].id;

    // Query subcategories by categoryId via category-index GSI
    const subcategories = await queryByIndex<Record<string, any>>(
      TABLES.subcategories,
      "category-index",
      "categoryId",
      categoryId
    );

    // Sort by order, then name
    subcategories.sort((a, b) => (a.order || 0) - (b.order || 0) || (a.name || "").localeCompare(b.name || ""));

    return { success: true, data: subcategories as Subcategory[] };
  } catch (error) {
    console.error("getSubcategories error:", error);
    return { success: true, data: [] };
  }
}

// ---------------------------------------------------------------------------
// getBrands -- get unique brand names, optionally filtered by category
// ---------------------------------------------------------------------------

export async function getBrands(categorySlug?: string) {
  try {
    let products: Record<string, any>[];

    if (categorySlug) {
      // Resolve slug to category id
      const cats = await queryByIndex<Record<string, any>>(
        TABLES.categories,
        "slug-index",
        "slug",
        categorySlug,
        { limit: 1 }
      );

      if (cats.length === 0) {
        return { success: true, data: [] };
      }

      products = await queryByIndex<Record<string, any>>(
        TABLES.products,
        "category-index",
        "categoryId",
        cats[0].id,
        {
          filterExpression: "#active = :trueVal",
          expressionValues: { ":trueVal": true },
          expressionNames: { "#active": "active" },
        }
      );
    } else {
      products = await scanTable<Record<string, any>>(TABLES.products, {
        filterExpression: "#active = :trueVal",
        expressionValues: { ":trueVal": true },
        expressionNames: { "#active": "active" },
      });
    }

    const brands = [...new Set(
      products
        .map((p) => p.brand)
        .filter((b): b is string => Boolean(b))
    )].sort();

    return { success: true, data: brands };
  } catch (error) {
    console.error("getBrands error:", error);
    return { success: true, data: [] };
  }
}
