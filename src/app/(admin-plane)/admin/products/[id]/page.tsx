import ProductDetailsPage from "../_components/product-details-page";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetailsPage productId={id} />;
}
