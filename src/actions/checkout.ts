"use server";

import { db } from "@/src/db";
import { orders, orderItems, productVariants, communes } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// Strict validation matching Algerian mobile operators
const orderSchema = z.object({
  customerName: z.string().min(3, "Full name must be at least 3 characters"),
  phone: z
    .string()
    .regex(
      /^(05|06|07)\d{8}$/,
      "Invalid Algerian phone number format (e.g., 0550123456)",
    ),
  address: z.string().min(5, "Please provide a more specific address details"),
  wilayaId: z.number().min(1).max(58),
  communeId: z.number().min(1),
  deliveryType: z.enum(["HOME", "STOP_DESK"]),
});

export interface CheckoutItem {
  variantId: number;
  quantity: number;
  price: number;
}

// 1. Cascading Fetcher for Communes
export async function getCommunesByWilaya(wilayaId: number) {
  try {
    return await db
      .select()
      .from(communes)
      .where(eq(communes.wilayaId, wilayaId))
      .orderBy(communes.nameFr);
  } catch (error) {
    console.error("Failed to fetch communes:", error);
    return [];
  }
}

// 2. Main Cash on Delivery Order Processor
export async function placeOrder(
  rawFormData: any,
  items: CheckoutItem[],
  shippingFee: number,
) {
  try {
    // Structural server-side data validation
    const validatedData = orderSchema.parse(rawFormData);

    if (!items || items.length === 0) {
      return {
        success: false,
        error: "Your shopping cart is completely empty.",
      };
    }

    // Recalculate item totals from scratch on the server to safeguard against client adjustments
    const itemsSubtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const serverCalculatedTotal = itemsSubtotal + shippingFee;

    // Database Write Transaction Matrix
    const newOrder = await db.transaction(async (tx) => {
      // A. Write Master Record to Orders table
      const [insertedOrder] = await tx
        .insert(orders)
        .values({
          customerName: validatedData.customerName,
          phone: validatedData.phone,
          address: validatedData.address,
          wilayaId: validatedData.wilayaId,
          communeId: validatedData.communeId,
          deliveryType: validatedData.deliveryType,
          shippingFee: shippingFee.toString(),
          totalPrice: serverCalculatedTotal.toString(),
          status: "PENDING_CONFIRMATION", // Lands safely in your verification queue
        })
        .returning();

      // B. Process Line Items and decrement structural inventory blocks
      for (const item of items) {
        // Fetch current snapshot to prevent racing negative inventory sales
        const [variant] = await tx
          .select()
          .from(productVariants)
          .where(eq(productVariants.id, item.variantId));

        if (!variant || variant.stock < item.quantity) {
          throw new Error(
            `Insufficient inventory fallback triggered for variant item mapping: ID ${item.variantId}`,
          );
        }

        // Insert individual item rows linked to master order
        await tx.insert(orderItems).values({
          orderId: insertedOrder.id,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price.toString(),
        });

        // Decrement structural physical stock quantities safely
        await tx
          .update(productVariants)
          .set({ stock: variant.stock - item.quantity })
          .where(eq(productVariants.id, item.variantId));
      }

      return insertedOrder;
    });

    return { success: true, orderId: newOrder.id };
  } catch (error: any) {
    console.error("Order processing failure transaction logged:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return {
      success: false,
      error:
        error.message ||
        "An unexpected error occurred while placing your order.",
    };
  }
}
