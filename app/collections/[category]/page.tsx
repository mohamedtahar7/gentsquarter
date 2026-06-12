import { db } from "@/src/db";
import { products } from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import ProductGrid, { GridProduct } from "@/components/ProductGrid";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function CategoryCollectionPage({
  params,
}: CategoryPageProps) {
  const resolvedParams = await params;

  // Ensure the parameter string handles any accidental capitalization differences cleanly
  const currentCategorySlug = resolvedParams.category.toLowerCase();

  // 1. Fetch products matching this exact category column entry (e.g. 'shoes', 'accessories')
  const catalogRows = await db
    .select({
      id: products.id,
      name: products.name,
      basePrice: products.basePrice,
      images: products.images,
      category: products.category,
    })
    .from(products)
    .where(eq(products.category, currentCategorySlug)) // Direct match fix
    .orderBy(desc(products.createdAt));

  // 2. Map database rows safely to match your layout requirements
  const formattedProducts: GridProduct[] = catalogRows.map((item) => ({
    id: item.id,
    name: item.name,
    price: `${parseFloat(item.basePrice).toLocaleString()} DA`,
    category:
      currentCategorySlug.charAt(0).toUpperCase() +
      currentCategorySlug.slice(1),
    image:
      item.images[0] ||
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600",
  }));

  const displayTitle =
    currentCategorySlug.charAt(0).toUpperCase() + currentCategorySlug.slice(1);

  return (
    <main className="w-full min-h-screen bg-[#F9F8F4] pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1600px] mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-baseline gap-4 mb-12 border-b border-[#111E38]/10 pb-6">
          <div>
            <h1 className="font-sans text-3xl mb-2 tracking-[0.2em] uppercase text-[#111E38] font-semibold">
              {displayTitle}
            </h1>
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#111E38]/50">
              {formattedProducts.length} Essentials Available
            </p>
          </div>

          <div className="flex gap-8 font-sans text-[10px] tracking-[0.2em] uppercase text-[#111E38]/80 items-center">
            <button className="flex items-center gap-2 hover:text-[#5A6049] transition-colors">
              <HiOutlineAdjustmentsHorizontal className="text-sm" /> Filter
            </button>
            <button className="hover:text-[#5A6049] transition-colors">
              Sort By: Featured
            </button>
          </div>
        </header>

        <ProductGrid products={formattedProducts} />
      </div>
    </main>
  );
}
