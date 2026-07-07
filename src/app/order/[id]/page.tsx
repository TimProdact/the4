import { OrderPageClient } from "./order-page-client";

export function generateStaticParams() {
  return Array.from({ length: 50 }, (_, i) => ({ id: String(1001 + i) }));
}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  return <OrderPageClient params={params} />;
}
