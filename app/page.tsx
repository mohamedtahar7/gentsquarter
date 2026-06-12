import CheckoutForm from "@/components/CheckoutForm";
import Collections from "@/components/Collections";
import HeroSection from "@/components/Hero";
import Image from "next/image";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <Collections />
    </main>
  );
}
