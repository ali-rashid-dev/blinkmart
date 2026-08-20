import { Suspense } from "react";
import { AdminOrdersPage } from "@/components/admin/orders/AdminOrdersPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminOrdersPage />
    </Suspense>
  );
}
