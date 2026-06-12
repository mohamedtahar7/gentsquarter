"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineShoppingBag,
  HiOutlineMenu,
  HiOutlineX,
  HiPlus,
  HiMinus,
  HiOutlineTrash,
} from "react-icons/hi";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { usePathname } from "next/navigation";
export default function Navbar() {
  const {
    cart,
    isOpen: isCartOpen,
    setIsOpen: setIsCartOpen,
    itemAmount,
    total,
    increaseAmount,
    decreaseAmount,
    removeFromCart,
  } = useCart();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { title: "Home", link: "/" },
    { title: "Collections", link: "/#collections" },
  ];
  const pathname = usePathname();

  // Instantly kill the store navbar if the route points to the admin panel
  if (pathname?.startsWith("/admin")) return null;
  return (
    <>
      {/* Top Navigation Bar */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
          isScrolled
            ? "bg-[#F9F8F4]/90 backdrop-blur-md border-[#111E38]/10"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden text-2xl ${isScrolled ? "text-[#111E38]" : "text-[#F9F8F4]"}`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <HiOutlineX /> : <HiOutlineMenu />}
          </button>

          <Link href="/" className="transition hover:opacity-75">
            <img
              src="https://i.postimg.cc/RZhBwYjF/navbar-logo.png"
              alt="Gent's Quarter"
              className={`h-8 transition-all duration-300 ${isScrolled ? "brightness-100 invert-0" : "invert"}`}
            />
          </Link>

          <div
            className={`hidden md:flex gap-10 font-sans text-[12px] tracking-[0.2em] uppercase font-medium ${
              isScrolled ? "text-[#111E38]" : "text-[#F9F8F4]"
            }`}
          >
            {navLinks.map((link, id) => (
              <Link key={id} href={link.link} className="group relative py-2">
                {link.title}
                <span
                  className={`absolute bottom-0 left-0 w-0 h-[1px] transition-all group-hover:w-full ${
                    isScrolled ? "bg-[#5A6049]" : "bg-[#F9F8F4]"
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Cart Trigger Button with Dynamic Item Badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            className={`flex items-center cursor-pointer gap-2 transition-colors relative p-2 ${
              isScrolled ? "text-[#111E38]" : "text-[#F9F8F4]"
            }`}
            aria-label="Open cart"
          >
            <HiOutlineShoppingBag className="text-2xl" />
            {itemAmount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-[#5A6049] text-[#F9F8F4] font-sans text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
              >
                {itemAmount}
              </motion.span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="fixed top-20 left-0 w-full z-[60] bg-[#F9F8F4] border-b border-[#111E38]/10 overflow-hidden md:hidden"
          >
            <div className="flex flex-col p-6 gap-6">
              {navLinks.map((link, id) => (
                <Link
                  key={id}
                  href={link.link}
                  onClick={() => setIsMenuOpen(false)}
                  className="font-sans text-sm tracking-[0.2em] uppercase text-[#111E38] hover:text-[#5A6049] transition-colors py-2 border-b border-[#111E38]/5"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shopping Cart Slider Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-[#111E38]/20 backdrop-blur-sm"
              onClick={() => setIsCartOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full md:w-[460px] bg-[#F9F8F4] z-[70] shadow-2xl border-l border-[#111E38]/10 flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 md:p-8 border-b border-[#111E38]/5">
                <h2 className="font-sans text-xs tracking-[0.2em] uppercase text-[#111E38] font-semibold">
                  Your Selection ({itemAmount})
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-xl hover:rotate-90 transition-transform duration-300 text-[#111E38] p-1"
                >
                  <HiOutlineX />
                </button>
              </div>

              {/* Central Content Area */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col justify-center items-center text-[#111E38]/40 py-12">
                    <HiOutlineShoppingBag className="text-5xl mb-4 stroke-1" />
                    <p className="font-sans text-xs uppercase tracking-[0.15em]">
                      Your shopping bag is empty
                    </p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.variantId}
                      className="flex gap-4 pb-6 border-b border-[#111E38]/5 items-start"
                    >
                      {/* Item Preview Frame */}
                      <div className="w-20 aspect-[3/4] bg-[#111E38]/5 flex-shrink-0 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Line Item Data Meta Descriptions */}
                      <div className="flex-1 flex flex-col min-w-0 self-stretch justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-sans text-xs uppercase font-medium tracking-wider text-[#111E38] truncate">
                              {item.name}
                            </h3>
                            <span className="font-sans text-xs font-semibold text-[#111E38] flex-shrink-0">
                              {item.price} DA
                            </span>
                          </div>
                          <p className="font-sans text-[10px] text-[#111E38]/60 uppercase tracking-widest mt-1">
                            Size: {item.size} — Color: {item.color}
                          </p>
                        </div>

                        {/* Inventory Increment/Decrement Panel */}
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center border border-[#111E38]/10 bg-white">
                            <button
                              onClick={() => decreaseAmount(item.variantId)}
                              className="p-2 text-xs hover:bg-[#111E38]/5 text-[#111E38] transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <HiMinus className="w-3 h-3" />
                            </button>
                            <span className="px-3 font-sans text-xs text-[#111E38] font-medium min-w-[24px] text-center">
                              {item.amount}
                            </span>
                            <button
                              onClick={() => increaseAmount(item.variantId)}
                              className="p-2 text-xs hover:bg-[#111E38]/5 text-[#111E38] transition-colors"
                              aria-label="Increase quantity"
                            >
                              <HiPlus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.variantId)}
                            className="text-[#111E38]/40 hover:text-red-600 transition-colors p-1"
                            aria-label="Remove item"
                          >
                            <HiOutlineTrash className="text-base" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Fixed Footer Total Calculation Matrix */}
              {cart.length > 0 && (
                <div className="p-6 md:p-8 border-t border-[#111E38]/5 bg-white shadow-[0_-8px_24px_rgba(17,30,56,0.02)]">
                  <div className="flex justify-between mb-6 font-sans text-xs uppercase tracking-[0.15em] text-[#111E38]">
                    <span className="font-light">Subtotal</span>
                    <span className="font-semibold text-sm">
                      {total.toLocaleString()} DA
                    </span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="block w-full bg-[#111E38] text-[#F9F8F4] py-4 text-center text-[11px] font-medium tracking-[0.2em] uppercase hover:bg-[#5A6049] transition-colors duration-300"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
