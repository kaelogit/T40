"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Search, ShoppingBag, Menu, X, ChevronDown, Loader2 } from "lucide-react";

import { useCart } from "@/context/CartContext"; 
import CartDrawer from "../cart/CartDrawer"; 
import { createClient } from "@/lib/supabase/client";
import { getProductHref } from "@/lib/products/urls";
import { isSaleActive } from "@/lib/products/sale";
import { loadBrandOptions } from "@/lib/shop/brands";
import { SCENT_NAV_LINKS } from "@/lib/shop/scents";
import { SHOP_COLLECTIONS, shopCollectionHref } from "@/lib/shop/collections";
import { searchProducts } from "@/lib/search/searchProducts";

const supabase = createClient();
const LOGO_SRC = "/t40-logo.png";

function NavbarLogo() {
  const [logoError, setLogoError] = useState(false);

  return (
    <Link
      href="/"
      className="inline-flex shrink-0 w-fit leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d94625]"
      aria-label="T40 Perfumes home"
    >
      {!logoError ? (
        <Image
          src={LOGO_SRC}
          alt="T40 Perfumes"
          width={200}
          height={68}
          priority
          className="block h-12 w-auto lg:h-12 object-contain"
          onError={() => setLogoError(true)}
        />
      ) : (
        <span className="font-heading text-3xl lg:text-4xl font-black tracking-tighter uppercase text-t40-black">
          T40
        </span>
      )}
    </Link>
  );
}

const BASE_CATEGORIES = [
  { 
    label: "T40 Exclusives", 
    href: "/shop/t40-exclusives", 
    isSpecial: true,
    children: [] as { label: string; href: string }[],
  },
  { 
    label: "Shop All", 
    href: "/shop",
    children: SHOP_COLLECTIONS.map(({ label, slug }) => ({
      label,
      href: shopCollectionHref(slug),
    })),
  },
  { label: "Women", href: "/shop/women" },
  { label: "Men", href: "/shop/men" },
  { label: "Unisex", href: "/shop/unisex" },
  {
    label: "Brands",
    href: "/shop",
    children: [{ label: "View All Brands", href: "/shop" }],
  },
  {
    label: "Shop by Scent",
    href: "/shop/scent",
    children: SCENT_NAV_LINKS,
  },
];

const MOBILE_UTILITY_LINKS = [
  { label: "About", href: "/about" },
  { label: "Journal", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

export default function Navbar() {
  const router = useRouter();
  const { cartCount, isDrawerOpen, setDrawerOpen } = useCart(); 

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  const [menuItems, setMenuItems] = useState<any[]>(BASE_CATEGORIES);
  
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // SMART SCROLL STATE
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Handle Smart Scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // If mobile menu or search is open, DO NOT hide the navbar
      if (isMobileMenuOpen || isMobileSearchOpen) {
        setIsNavVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // If at the absolute top, always show
      if (currentScrollY < 50) {
        setIsNavVisible(true);
      } 
      // If scrolling down past 50px, hide it
      else if (currentScrollY > lastScrollY.current) {
        setIsNavVisible(false);
      } 
      // If scrolling up, show it
      else {
        setIsNavVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobileMenuOpen, isMobileSearchOpen]);

  // Auto-focus mobile search
  useEffect(() => {
    if (isMobileSearchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [isMobileSearchOpen]);

  // Load Subcategories
  useEffect(() => {
    fetch("/api/subcategories?parent=t40-exclusives")
      .then((r) => r.json())
      .then((d) => {
        const data = d.subcategories ?? [];
        if (!data.length) return;
        setMenuItems((prev) =>
          prev.map((item) =>
            item.label === "T40 Exclusives"
              ? {
                  ...item,
                  children: data.map((s: { name: string; slug: string }) => ({
                    label: s.name,
                    href: `/shop/t40-exclusives/${s.slug}`,
                  })),
                }
              : item
          )
        );
      });
  }, []);

  // Load Brands
  useEffect(() => {
    loadBrandOptions(supabase).then((brands) => {
      if (brands.length === 0) return;
      setMenuItems((prev) =>
        prev.map((item) =>
          item.label === "Brands"
            ? {
                ...item,
                href: `/shop/brand/${brands[0].value}`,
                children: [
                  ...brands.map((b) => ({
                    label: b.label,
                    href: `/shop/brand/${b.value}`,
                  })),
                  { label: "View All Brands", href: "/shop" },
                ],
              }
            : item
        )
      );
    });
  }, []);

  // Live Search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const delaySearch = setTimeout(async () => {
      setIsSearching(true);
      const { products, error } = await searchProducts(supabase, searchQuery.trim(), { limit: 5 });
      if (!error) setSearchResults(products);
      setIsSearching(false);
    }, 300); 

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const goToSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    closeSearch();
    closeMobileMenu();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goToSearch(searchQuery);
  };

  const closeSearch = () => {
    setIsMobileSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const toggleMobileMenu = () => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      setIsMobileMenuOpen(true);
    } else {
      closeMobileMenu();
    }
  };

  const closeMobileMenu = () => {
    document.body.style.overflow = '';
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  const toggleDropdown = (label: string) => {
    if (openDropdown === label) setOpenDropdown(null);
    else setOpenDropdown(label);
  };

  // Keyboard Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMobileMenu();
        closeSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Shared Search Results UI
  const SearchResultsDropdown = ({ isDesktop = false }) => (
    <div className={`absolute left-0 w-full bg-t40-white shadow-2xl border-t border-t40-light overflow-y-auto animate-in fade-in duration-200 z-50 ${isDesktop ? 'top-full mt-4 p-6' : 'top-full p-6 max-h-[70vh]'}`}>
      {isSearching ? (
        <div className="flex flex-col items-center justify-center py-8 text-t40-grey">
          <Loader2 className="animate-spin mb-3" size={24} />
          <p className="text-[10px] font-bold uppercase tracking-widest font-heading">Searching...</p>
        </div>
      ) : searchResults.length > 0 ? (
        <>
          <div className={`grid gap-6 ${isDesktop ? "grid-cols-1" : "grid-cols-2 md:grid-cols-4"}`}>
            {searchResults.map((product) => {
              const price = isSaleActive(product) && product.sale_price ? product.sale_price : product.price;
              return (
                <Link
                  href={getProductHref(product)}
                  key={product.id}
                  onClick={closeSearch}
                  className="group flex flex-col gap-3"
                >
                  <div className="aspect-square bg-t40-light overflow-hidden relative rounded-sm">
                    <img
                      src={product.images[0] || "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-t40-black truncate group-hover:text-t40-grey transition-colors font-heading uppercase tracking-widest">
                      {product.name}
                    </h3>
                    {product.brand && (
                      <p className="text-[9px] text-t40-grey uppercase tracking-widest font-heading mt-0.5">
                        {product.brand}
                      </p>
                    )}
                    <p className="text-[11px] font-bold text-t40-black mt-1">
                      ₦{Number(price).toLocaleString()}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
          <button
            onClick={() => goToSearch(searchQuery)}
            className="mt-6 block text-center w-full text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-[#d94625] hover:text-t40-black transition-colors"
          >
            View all results →
          </button>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-t40-grey font-heading">
            No products found for "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <header className={`sticky top-0 z-[60] w-full bg-t40-white border-b border-t40-grey/10 transition-transform duration-300 ease-in-out ${isNavVisible ? "translate-y-0" : "-translate-y-full"}`}>
        {/* If you add an AnnouncementBar component later, put it right here above the nav container */}
        
        <div className="t40-container relative">
          <div className="flex items-center justify-between h-20">
            
            {/* MOBILE SEARCH OVERLAY */}
            {isMobileSearchOpen ? (
              <div className="absolute inset-0 bg-t40-white z-50 flex items-center justify-between w-full h-full px-4 lg:hidden">
                <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center h-full">
                  <Search size={20} className="text-t40-grey mr-3 flex-shrink-0" />
                  <input 
                    ref={searchInputRef}
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..." 
                    className="flex-1 bg-transparent border-none outline-none text-xs text-t40-black placeholder-t40-grey/50 h-full tracking-widest font-heading font-bold uppercase"
                  />
                </form>
                <button onClick={closeSearch} className="ml-4 p-2 text-t40-black">
                  <X size={24} />
                </button>
                {searchQuery.trim().length >= 2 && <SearchResultsDropdown />}
              </div>
            ) : (
              <>
                {/* 1. MOBILE MENU BUTTON */}
                <div className="flex items-center lg:hidden flex-1">
                  <button
                    onClick={toggleMobileMenu}
                    className="p-2 -ml-2 text-t40-black hover:text-t40-grey transition-colors"
                    aria-label="Open menu"
                  >
                     <Menu size={24} strokeWidth={1.75} />
                  </button>
                </div>

                {/* 2. LOGO */}
                <div className="shrink-0 w-fit flex justify-center lg:justify-start">
                  <NavbarLogo />
                </div>

                {/* 3. DESKTOP NAVIGATION */}
                <div className="hidden lg:flex flex-1 justify-center space-x-6 xl:space-x-8 h-full">
                  {menuItems.map((item) => (
                    <div key={item.label} className="group relative flex items-center h-full">
                      <Link 
                        href={item.href}
                        className={`flex items-center text-[10px] xl:text-[11px] font-bold uppercase tracking-widest py-8 transition-colors font-heading ${item.isSpecial ? "text-[#d94625] hover:text-t40-black" : "text-t40-black hover:text-t40-grey"}`}
                      >
                        {item.label}
                        {item.children && <ChevronDown size={14} className="ml-1 opacity-50 group-hover:rotate-180 transition-transform duration-300" />}
                      </Link>

                      {item.children && (
                        <div className="absolute top-[100%] left-1/2 -translate-x-1/2 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 ease-out translate-y-4 group-hover:translate-y-0 z-50">
                          <div className="bg-t40-white/95 backdrop-blur-xl shadow-2xl border border-t40-light p-8 min-w-[240px] flex flex-col gap-5">
                            {item.children.map((child: any) => (
                              <Link 
                                key={child.label}
                                href={child.href} 
                                className="text-[10px] font-bold uppercase tracking-[0.2em] text-t40-grey hover:text-t40-black hover:translate-x-2 transition-all duration-300 block font-heading"
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 4. ACTIONS */}
                <div className="flex items-center justify-end space-x-4 lg:space-x-6 flex-1 lg:flex-none">
                  <button onClick={() => setIsMobileSearchOpen(true)} className="lg:hidden text-t40-black">
                    <Search size={20} strokeWidth={1.5} />
                  </button>

                  <form onSubmit={handleSearchSubmit} className="hidden lg:flex relative items-center border-b border-t40-grey/30 focus-within:border-t40-black transition-colors w-48 xl:w-64 pb-1">
                    <Search size={14} className="text-t40-grey mr-2 flex-shrink-0" strokeWidth={2} />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full bg-transparent border-none outline-none text-[9px] xl:text-[10px] font-bold tracking-widest text-t40-black placeholder-t40-grey/60 font-heading uppercase"
                    />
                    {searchQuery.trim().length >= 2 && <SearchResultsDropdown isDesktop={true} />}
                  </form>
                  
                  <button 
                    onClick={() => setDrawerOpen(true)} 
                    className="relative text-t40-black hover:text-t40-grey transition-colors"
                  >
                    <ShoppingBag size={20} strokeWidth={1.5} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-[#d94625] text-t40-white text-[9px] w-[16px] h-[16px] flex items-center justify-center rounded-full font-bold shadow-sm">
                        {cartCount}
                      </span>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 5. MOBILE MENU FULL-SCREEN OVERLAY */}
      {isMobileMenuOpen && !isMobileSearchOpen && (
        <div className="lg:hidden fixed inset-0 w-full bg-t40-white z-[100] flex flex-col animate-in slide-in-from-left duration-300">
          
          {/* Overlay Header */}
          <div className="flex items-center justify-between h-20 px-4 border-b border-t40-grey/10 shrink-0">
            <div className="flex-1"></div> {/* Spacer to keep logo centered */}
            
            <div className="shrink-0 w-fit flex justify-center">
              <NavbarLogo />
            </div>
            
            <div className="flex-1 flex items-center justify-end">
              <button
                onClick={closeMobileMenu}
                className="p-2 -mr-2 text-t40-black hover:text-t40-grey transition-colors"
                aria-label="Close menu"
              >
                <X size={24} strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {/* Scrollable Menu Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-10">
            <div className="flex flex-col space-y-2 mt-4">
              {menuItems.map((item) => (
                <div key={item.label} className="border-b border-t40-light last:border-none">
                  <div className="flex justify-between items-center">
                    <Link 
                      href={item.href}
                      className={`block py-4 text-xs font-bold uppercase tracking-widest font-heading ${item.isSpecial ? "text-[#d94625]" : "text-t40-black"}`}
                      onClick={closeMobileMenu} 
                    >
                      {item.label}
                    </Link>
                    {item.children && (
                      <button onClick={() => toggleDropdown(item.label)} className="p-4 text-t40-grey">
                        <ChevronDown size={16} className={`transform transition-transform duration-300 ${openDropdown === item.label ? "rotate-180" : ""}`} />
                      </button>
                    )}
                  </div>

                  {item.children && (
                    <div className={`overflow-hidden transition-all duration-300 bg-t40-light/30 ${openDropdown === item.label ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
                      <div className="pl-4 py-2 space-y-2 mb-2">
                        {item.children.map((child: any) => (
                          <Link 
                            key={child.label} 
                            href={child.href}
                            className="block py-3 text-[10px] text-t40-grey font-bold uppercase tracking-widest hover:text-t40-black transition-colors font-heading"
                            onClick={closeMobileMenu}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-8 mt-4 border-t border-t40-light">
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-t40-grey font-heading mb-4 px-2">
                  The House
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {MOBILE_UTILITY_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="py-3 text-[10px] font-bold uppercase tracking-widest font-heading text-t40-black hover:text-[#d94625] transition-colors border border-t40-light bg-t40-light/30 text-center"
                      onClick={closeMobileMenu}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <CartDrawer isOpen={isDrawerOpen} setIsOpen={setDrawerOpen} />
    </>
  );
}