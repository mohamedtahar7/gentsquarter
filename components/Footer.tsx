import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#F9F8F4] text-[#111E38] font-sans">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-[#111E38]/5">
        {/* Stark Logo Alignment */}
        <Link href="/" className="transition hover:opacity-75">
          <img
            src="https://i.postimg.cc/RZhBwYjF/navbar-logo.png"
            alt="Gent's Quarter"
            className="h-5 w-auto object-contain"
          />
        </Link>

        {/* Compressed Single-Line Navigation */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-[10px] tracking-[0.25em] uppercase text-[#111E38]/70">
          <Link href="/shop" className="hover:text-[#5A6049] transition-colors">
            Shop
          </Link>
          <Link
            href="#collections"
            className="hover:text-[#5A6049] transition-colors"
          >
            Collections
          </Link>
          <Link
            href="#about"
            className="hover:text-[#5A6049] transition-colors"
          >
            Story
          </Link>
          <Link
            href="/contact"
            className="hover:text-[#5A6049] transition-colors"
          >
            Contact
          </Link>
        </div>

        {/* Clean Copyright Stamp */}
        <div className="text-[9px] tracking-[0.2em] uppercase text-[#111E38]/40">
          &copy; {new Date().getFullYear()} Gent's Quarter.
        </div>
      </div>
    </footer>
  );
}
