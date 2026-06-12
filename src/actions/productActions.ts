"use server";

import { db } from "@/src/db";
import { products, productVariants } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface VariantInput {
  size: string;
  color: string;
  stock: number;
}

interface ProductPayload {
  name: string;
  basePrice: number;
  category: string;
  images: string[];
  variants: VariantInput[];
}

export async function createProductWithVariants(payload: ProductPayload) {
  try {
    const [insertedProduct] = await db
      .insert(products)
      .values({
        name: payload.name,
        basePrice: payload.basePrice.toString(),
        category: payload.category.toLowerCase().trim(),
        description: "Premium apparel collection item.",
        images: payload.images.filter((url) => url.trim() !== ""),
      })
      .returning({ id: products.id });

    if (!insertedProduct) {
      return {
        success: false,
        error: "Failed to write master product records.",
      };
    }

    const variantsRecords = payload.variants.map((variant) => ({
      productId: insertedProduct.id,
      size: variant.size.toUpperCase().trim(),
      color: variant.color.trim(),
      stock: Math.max(0, variant.stock),
    }));

    await db.insert(productVariants).values(variantsRecords);

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error executing database product write:", error);
    return {
      success: false,
      error: error.message || "Database execution fault.",
    };
  }
}

export async function deleteProductAction(id: number) {
  try {
    await db.delete(products).where(eq(products.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to execute database delete layout query.",
    };
  }
}

// 2. Updated Row Values Mutation Action with Variant Management Support
export async function updateProductAction(
  id: number,
  data: {
    name: string;
    basePrice: number;
    category: string;
    variants?: { id?: number; size: string; stock: number; color?: string }[];
  },
) {
  try {
    // Wrap operations inside an atomic transaction block using tx context
    await db.transaction(async (tx) => {
      // 1. Update the master product core info
      await tx
        .update(products)
        .set({
          name: data.name,
          basePrice: data.basePrice.toString(),
          category: data.category.toLowerCase().trim(),
        })
        .where(eq(products.id, id));

      // 2. Process variants update payload if explicitly provided by client
      if (data.variants) {
        // Clear out existing historical sizes for this target product id
        await tx
          .delete(productVariants)
          .where(eq(productVariants.productId, id));

        // Insert new records if variations exist inside the form payload state
        if (data.variants.length > 0) {
          const variantsRecords = data.variants.map((variant) => ({
            productId: id,
            size: variant.size.toUpperCase().trim(),
            // Preserves existing variant color properties, defaults to "Default" if undefined
            color: variant.color?.trim() || "Default",
            stock: Math.max(0, variant.stock),
          }));

          await tx.insert(productVariants).values(variantsRecords);
        }
      }
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    console.error("Error committing product and variant updates:", err);
    return {
      success: false,
      error: err.message || "Failed to commit row item updates.",
    };
  }
}
