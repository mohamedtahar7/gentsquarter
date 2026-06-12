"use server";

import { db } from "@/src/db/index";
import { orders } from "@/src/db/schema";
import { checkoutSchema } from "@/src/lib/validations/checkout";

interface OrderSummaryInput {
  shippingFee: number;
  totalPrice: number;
}

/**
 * Validates checkout inputs on the server and commits the order to Neon
 * @param checkoutData Raw inputs from the client-side checkout form
 * @param summary Computed pricing metrics (shipping fee + items total)
 */
export async function createOrder(
  checkoutData: unknown,
  summary: OrderSummaryInput,
) {
  // 1. Secure Server-Side Re-validation
  const validation = checkoutSchema.safeParse(checkoutData);

  if (!validation.success) {
    const errorMessages = validation.error.errors
      .map((err) => err.message)
      .join(", ");
    return {
      success: false,
      error: `Validation failed: ${errorMessages}`,
    };
  }

  // Extract perfectly structured data from Zod validation
  const { customerName, phone, deliveryType, address, wilayaId, communeId } =
    validation.data;

  try {
    // 2. Insert order directly into the Neon PostgreSQL instance
    const [newOrder] = await db
      .insert(orders)
      .values({
        customerName,
        phone,
        deliveryType,
        address: address || null, // Clean fallback if an empty string passes through
        wilayaId,
        communeId,
        // Pro-Tip: PostgreSQL 'decimal' columns expect strings in Drizzle to protect numeric precision
        shippingFee: summary.shippingFee.toString(),
        totalPrice: summary.totalPrice.toString(),
        status: "PENDING_CONFIRMATION", // Explicitly matching your schema's statusEnum
      })
      .returning({ id: orders.id });

    console.log(
      `🛒 COD Order #${newOrder.id} successfully queued for verification call.`,
    );

    return {
      success: true,
      orderId: newOrder.id,
      message: "Your order has been recorded successfully!",
    };
  } catch (error) {
    console.error(
      "❌ Critical database failure during order insertion:",
      error,
    );
    return {
      success: false,
      error: "Server side database error. Could not record transaction.",
    };
  }
}
