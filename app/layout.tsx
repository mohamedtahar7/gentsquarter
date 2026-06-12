import type { Metadata } from "next";
import { Italiana, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartProvider from "@/contexts/CartContext";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Gent's Quarter",
  description: "Premium Knitwear & Essentials",
};
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // Rename the variable
  display: "swap",
});
const italiana = Italiana({
  weight: "400", // Italiana only comes in a single regular weight
  subsets: ["latin"],
  variable: "--font-italiana", // Define a CSS variable name
  display: "swap",
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${italiana.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Toaster />
          <Navbar />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
