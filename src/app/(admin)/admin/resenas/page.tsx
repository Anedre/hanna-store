"use client";

import { useState, useEffect } from "react";
import { Star, Check, X, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { formatDate } from "@/lib/format";

export default function AdminResenas() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  async function load() {
    const res = await fetch("/api/admin/reviews");
    const json = await res.json();
    if (json.success) setReviews(json.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleApproval(productId: string, id: string, approved: boolean) {
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, id, approved }),
    });
    setReviews((prev) =>
      prev.map((r) => (r.id === id && r.productId === productId ? { ...r, approved } : r))
    );
  }

  const filtered = reviews.filter((r) => {
    if (filter === "pending") return !r.approved;
    if (filter === "approved") return r.approved;
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.approved).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream-900">Resenas</h1>
          <p className="text-sm text-cream-500 mt-1">{reviews.length} resenas en total, {pendingCount} pendientes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "all", label: "Todas" },
          { key: "pending", label: `Pendientes (${pendingCount})` },
          { key: "approved", label: "Aprobadas" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              filter === f.key ? "bg-hanna-500 text-white" : "bg-white text-cream-600 border border-cream-200 hover:bg-cream-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="h-4 bg-cream-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-cream-200 rounded w-full" />
            </Card>
          ))
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <Star className="h-10 w-10 text-cream-300 mx-auto mb-3" />
            <p className="text-cream-500">No hay resenas {filter !== "all" ? "con este filtro" : ""}</p>
          </Card>
        ) : (
          filtered.map((r) => (
            <Card key={`${r.productId}-${r.id}`} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={r.approved ? "success" : "warning"} size="sm">
                      {r.approved ? "Aprobada" : "Pendiente"}
                    </Badge>
                    <span className="text-xs text-cream-400">{formatDate(r.createdAt)}</span>
                  </div>
                  <p className="text-sm font-medium text-cream-900 mb-1">
                    <span className="text-cream-500">Producto:</span> {r.productName}
                  </p>
                  <p className="text-sm text-cream-600 mb-2">
                    <span className="text-cream-500">Por:</span> {r.userName}
                  </p>
                  <StarRating rating={r.rating} size="sm" />
                  <p className="mt-2 text-sm text-cream-700 bg-cream-50 rounded-lg p-3">
                    &ldquo;{r.comment}&rdquo;
                  </p>
                </div>
                <div className="flex gap-1.5 ml-4 shrink-0">
                  {!r.approved ? (
                    <button
                      onClick={() => toggleApproval(r.productId, r.id, true)}
                      className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors cursor-pointer"
                      title="Aprobar"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleApproval(r.productId, r.id, false)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                      title="Rechazar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
