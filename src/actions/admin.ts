"use server";

import { db } from "@/src/db";
import { orders } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type OrderStatus =
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

// Update order status from the admin table dashboard boundary
export async function updateOrderStatus(
  orderId: number,
  newStatus: OrderStatus,
) {
  try {
    await db
      .update(orders)
      .set({ status: newStatus })
      .where(eq(orders.id, orderId));

    // Force Next.js to purge cached layouts and show fresh data instantly
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error(
      `Failed to transition order status for ID ${orderId}:`,
      error,
    );
    return {
      success: false,
      error: "Database mutation failed during status update.",
    };
  }
}
