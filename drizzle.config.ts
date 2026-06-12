import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts", // Points to your newly updated schema
  out: "./drizzle", // Where generated migration files will be stored
  dialect: "postgresql", // Tells drizzle we are targeting Postgres
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Uses the link from your .env.local file
  },
});
