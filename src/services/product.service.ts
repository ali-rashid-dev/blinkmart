import {
  listCustomerProducts,
  findCustomerProductById,
  findCustomerProductBySlug,
  countCustomerProducts,
  listAdminProducts,
  findAdminProductById,
  createProduct as dbCreateProduct,
  type ProductWithBrandAndCategory,
} from "@/repositories/product.repository";

export async function getCustomerProducts(params?: {
  categoryId?: string;
  brandId?: string;
  search?: string;
  take?: number;
  skip?: number;
}): Promise<ProductWithBrandAndCategory[]> {
  return listCustomerProducts(params);
}

export async function getCustomerProductById(id: string): Promise<ProductWithBrandAndCategory | null> {
  return findCustomerProductById(id);
}

export async function getCustomerProductBySlug(slug: string): Promise<ProductWithBrandAndCategory | null> {
  return findCustomerProductBySlug(slug);
}

export async function getAdminProducts(params?: {
  categoryId?: string;
  brandId?: string;
  search?: string;
  take?: number;
  skip?: number;
}): Promise<ProductWithBrandAndCategory[]> {
  return listAdminProducts(params);
}

export async function createProductService(data: {
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  enabled?: boolean;
  brandId?: string | null;
  categoryId?: string | null;
}): Promise<ProductWithBrandAndCategory> {
  return dbCreateProduct(data);
}
