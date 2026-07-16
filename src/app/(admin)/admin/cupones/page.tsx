import { getCouponsAdmin } from "@/actions/coupons";
import { Card } from "@/components/ui/card";
import { CouponsClient } from "./CouponsClient";

export default async function CuponesPage() {
  const result = await getCouponsAdmin();

  if (!result.success) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-cream-900 mb-4">Cupones</h1>
        <Card className="p-6 text-sm text-red-600">{result.error}</Card>
      </div>
    );
  }

  return <CouponsClient coupons={result.data} />;
}
