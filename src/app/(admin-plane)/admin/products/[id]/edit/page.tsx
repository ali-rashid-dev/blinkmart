import { ProductFormPage } from "../../_components/product-form-page";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductFormPage productId={id} />;
}
