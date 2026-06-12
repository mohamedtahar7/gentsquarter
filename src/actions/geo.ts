"use server";

import { db } from "@/src/db/index";
import { wilayas, communes } from "@/src/db/schema";
import { asc, eq } from "drizzle-orm";

/**
 * Fetches all 69 Algerian Wilayas ordered by their official ID
 */
export async function getWilayas() {
  try {
    const data = await db.select().from(wilayas).orderBy(asc(wilayas.id));

    return { success: true, data };
  } catch (error) {
    console.error("❌ Error fetching wilayas:", error);
    return { success: false, error: "Failed to load Wilayas" };
  }
}

/**
 * Fetches all communes belonging to a specific Wilaya
 * @param wilayaId The ID of the selected wilaya
 */
export async function getCommunesByWilaya(wilayaId: number) {
  if (!wilayaId || isNaN(wilayaId)) {
    return { success: false, error: "Invalid Wilaya ID provided" };
  }

  try {
    const data = await db
      .select()
      .from(communes)
      .where(eq(communes.wilayaId, wilayaId))
      .orderBy(asc(communes.nameFr)); // Ordered alphabetically for a clean frontend dropdown dropdown experience

    return { success: true, data };
  } catch (error) {
    console.error(`❌ Error fetching communes for wilaya ${wilayaId}:`, error);
    return { success: false, error: "Failed to load communes" };
  }
}
