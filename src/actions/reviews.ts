"use server";

import {
  getItem,
  putItem,
  queryByIndex,
  scanTable,
  generateId,
  TABLES,
} from "@/lib/dynamo";
import { auth } from "@/lib/auth";
import { reviewSchema } from "@/lib/validators";

// ---------------------------------------------------------------------------
// submitReview
// ---------------------------------------------------------------------------

export async function submitReview(
  productId: string,
  rating: number,
  comment: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Debes iniciar sesion para dejar una resena" };
    }

    // Validate input
    const parsed = reviewSchema.safeParse({ rating, comment });
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Datos invalidos";
      return { success: false, error: firstError };
    }

    // Verify the product exists
    const product = await getItem<Record<string, any>>(TABLES.products, { id: productId });
    if (!product) {
      return { success: false, error: "Producto no encontrado" };
    }

    // Check if user already reviewed this product via user-index GSI
    const existingReviews = await queryByIndex<Record<string, any>>(
      TABLES.reviews,
      "user-index",
      "userId",
      session.user.id,
      {
        filterExpression: "#pid = :pid",
        expressionValues: { ":pid": productId },
        expressionNames: { "#pid": "productId" },
      }
    );

    if (existingReviews.length > 0) {
      return { success: false, error: "Ya has dejado una resena para este producto" };
    }

    const now = new Date().toISOString();
    const reviewId = generateId();

    // Create review with composite key (productId + id)
    const review = await putItem(TABLES.reviews, {
      productId,
      id: reviewId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      userId: session.user.id,
      approved: false, // reviews require admin approval
      createdAt: now,
    });

    // Fetch user info to return with the review
    const user = await getItem<Record<string, any>>(TABLES.users, { id: session.user.id });
    const reviewWithUser = {
      ...review,
      user: user ? { name: user.name, lastName: user.lastName } : undefined,
    };

    return {
      success: true,
      data: reviewWithUser,
    };
  } catch (error) {
    console.error("submitReview error:", error);
    return { success: false, error: "Error al enviar la resena" };
  }
}

// ---------------------------------------------------------------------------
// getProductReviews
// ---------------------------------------------------------------------------

export async function getProductReviews(productId: string) {
  try {
    // Scan reviews for this product that are approved
    const reviews = await scanTable<Record<string, any>>(TABLES.reviews, {
      filterExpression: "#pid = :pid AND #approved = :trueVal",
      expressionValues: { ":pid": productId, ":trueVal": true },
      expressionNames: { "#pid": "productId", "#approved": "approved" },
    });

    // Enrich with user info
    const enriched: (Record<string, any> & { user?: { name: string; lastName: string } })[] = [];
    for (const r of reviews) {
      let user: { name: string; lastName: string } | undefined;
      if (r.userId) {
        const u = await getItem<Record<string, any>>(TABLES.users, { id: r.userId });
        if (u) user = { name: u.name, lastName: u.lastName };
      }
      enriched.push({ ...r, user });
    }

    // Sort by createdAt desc
    enriched.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );

    return { success: true, data: enriched };
  } catch (error) {
    console.error("getProductReviews error:", error);
    return { success: false, error: "Error al obtener las resenas" };
  }
}
