import { Suspense } from "react";
import { OrderDetailContent } from "@/components/admin/orders/OrderDetailContent";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-4 md:p-6">
      <Suspense
        fallback={
          <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
            <div className="h-8 w-36 bg-muted rounded-lg" />
            <div className="h-32 w-full bg-muted rounded-xl" />
            <div className="h-64 w-full bg-muted rounded-xl" />
          </div>
        }
      >
        <OrderDetailContent orderId={id} />
      </Suspense>
    </div>
  );
}
