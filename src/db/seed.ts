// src/db/seed.ts
import { db } from "./index";
import wilayasData from "../lib/wilayas.json";
import communesData from "../lib/communes.json";
import { communes, wilayas } from "./schema";

async function main() {
  console.log(
    "⏳ Initializing 2026 administrative geography database layout...",
  );

  // ==========================================
  // 1. SEED WILAYAS
  // ==========================================
  console.log("-> Inserting 69 Wilayas...");

  const mappedWilayas = wilayasData.map((w: any) => ({
    id: Number(w.id),
    nameAr: w.ar_name,
    nameFr: w.name, // Maps "Batna" cleanly to nameFr
  }));

  await db.insert(wilayas).values(mappedWilayas).onConflictDoNothing();
  console.log("✅ Wilayas synchronized.");

  // ==========================================
  // 2. SEED COMMUNES (With Batch Chunking)
  // ==========================================
  console.log("-> Processing 1,541 Communes...");

  const mappedCommunes = communesData.map((c: any) => ({
    id: Number(c.id),
    wilayaId: Number(c.wilaya_id),
    nameAr: c.ar_name,
    nameFr: c.name, // Maps "Adrar" cleanly to nameFr
  }));

  // Chunking avoids "Too many SQL parameters" execution errors over Neon HTTP
  const CHUNK_SIZE = 250;
  let insertedCount = 0;

  for (let i = 0; i < mappedCommunes.length; i += CHUNK_SIZE) {
    const chunk = mappedCommunes.slice(i, i + CHUNK_SIZE);
    await db.insert(communes).values(chunk).onConflictDoNothing();

    insertedCount += chunk.length;
    console.log(
      `   [Progress] ${insertedCount} / ${mappedCommunes.length} records processed...`,
    );
  }

  console.log("✅ Complete Algerian geography dataset seeded successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeding run-time failure:", err);
  process.exit(1);
});
