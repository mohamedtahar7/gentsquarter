import { db } from "@/src/db";
import { products } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ProductDetailClient from "./product-details";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.id);

  if (isNaN(productId)) {
    notFound();
  }

  // Fetch the product entry alongside all its matching variant configurations
  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
    with: {
      variants: true,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#F9F8F4] pt-28 pb-16">
      <ProductDetailClient product={product} />
    </main>
  );
}
