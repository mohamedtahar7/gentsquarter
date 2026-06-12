import { db } from "@/src/db";
import { wilayas } from "@/src/db/schema";
import CheckoutFormClient from "./checkout-form";

export const metadata = {
  title: "Checkout — Gent's Quarter",
  description: "Complete your premium collection cash on delivery order.",
};

export default async function CheckoutPage() {
  // Fetch geographic wilayas data during standard server layout assembly
  const wilayaList = await db.select().from(wilayas).orderBy(wilayas.id);

  return (
    <main className="min-h-screen bg-[#F9F8F4] pt-28 pb-20">
      <div className="max-w-[1400px] mx-auto px-6">
        <h1 className="font-sans text-xl uppercase tracking-[0.2em] text-[#111E38] font-medium mb-10 text-center md:text-left">
          Secure Express Checkout
        </h1>
        <CheckoutFormClient wilayas={wilayaList} />
      </div>
    </main>
  );
}
