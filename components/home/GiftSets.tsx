"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getProductHref } from "@/lib/products/urls";

const supabase = createClient();

const GIFT_PACKAGING_IMAGE = "/gift/packaging.jpg";

type Product = {
  id: string;
  slug?: string | null;
  name: string;
  brand: string;
  price: number;
  sale_price?: number;
  images: string[];
  description?: string;
};

export default function GiftSets() {
  const [giftSets, setGiftSets] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGiftSets = async () => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", "gift-sets") // Matches the category we will use in the admin panel
        .limit(4);

      if (!data || data.length === 0 || error) {
        setGiftSets([
          {
            id: "gs-1",
            name: "The Signature Trio",
            brand: "T40 Exclusive",
            price: 250000,
            images: ["https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop"],
            description: "Includes: Sweet Noble (50ml), 24th Oud (50ml), Re'venge (50ml)",
          },
          {
            id: "gs-2",
            name: "Evening Collection",
            brand: "T40 Exclusive",
            price: 180000,
            images: ["https://images.unsplash.com/photo-1541643600914-78a08468325f?q=80&w=800&auto=format&fit=crop"],
            description: "Includes: Midnight Rose (100ml), Oud Wood (50ml)",
          },
          {
            id: "gs-3",
            name: "Fresh Start Duo",
            brand: "Designer",
            price: 120000,
            images: ["https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=800&auto=format&fit=crop"],
            description: "Includes: Ocean Breeze (100ml), Citrus Morning (100ml)",
          }
        ]);
      } else {
        setGiftSets(data as Product[]);
      }
      
      setIsLoading(false);
    };

    fetchGiftSets();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!isLoading && giftSets.length === 0) return null;

  return (
    <section className="w-full bg-t40-light py-20 lg:py-32">
      <div className="t40-container px-4 md:px-8">
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* LEFT: STATIC PACKAGING IMAGE */}
          <div className="w-full lg:w-1/2">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="sticky top-32"
            >
              <div className="relative aspect-[4/5] w-full bg-t40-light overflow-hidden">
                <Image
                  src={GIFT_PACKAGING_IMAGE}
                  alt="T40 premium gift packaging — The Art of Gifting"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-t40-black/70 via-t40-black/15 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <p className="text-t40-white text-[10px] font-bold uppercase tracking-[0.4em] mb-2 font-heading">
                    Premium Packaging
                  </p>
                  <h2 className="text-2xl md:text-4xl font-bold md:font-black text-t40-white uppercase tracking-tighter font-heading">
                    The Art of Gifting
                  </h2>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: GIFT SET LIST */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <div className="mb-12">
              <p className="text-[#d94625] text-[10px] font-bold uppercase tracking-[0.4em] mb-3 font-heading">
                Gift Sets
              </p>
              <h3 className="text-2xl md:text-4xl font-bold md:font-black text-t40-black uppercase tracking-tighter font-heading mb-4">
                Exclusive Bundles
              </h3>
              <p className="text-t40-grey text-sm md:text-base leading-relaxed max-w-md">
                Hand-picked combinations in our signature T40 boxes. A strong choice for birthdays, holidays, and special occasions.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-t40-grey" size={32} />
                </div>
              ) : (
                giftSets.map((set, index) => (
                  <motion.div 
                    key={set.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-t40-white p-4 border border-t40-grey/10 hover:border-t40-black transition-colors"
                  >
                    <div className="relative w-full sm:w-32 aspect-square bg-t40-light flex-shrink-0 overflow-hidden">
                      <img 
                        src={set.images[0]} 
                        alt={set.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-t40-grey text-[9px] font-bold uppercase tracking-[0.2em] mb-1 font-heading">
                        {set.brand}
                      </p>
                      <h4 className="text-lg font-black text-t40-black uppercase tracking-tight font-heading mb-2">
                        {set.name}
                      </h4>
                      {set.description && (
                        <p className="text-xs text-t40-grey mb-4 line-clamp-2 leading-relaxed">
                          {set.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#d94625]">
                          {formatPrice(set.sale_price || set.price)}
                        </span>
                        <Link 
                          href={getProductHref(set)}
                          className="text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-t40-black hover:text-[#d94625] flex items-center gap-2 transition-colors"
                        >
                          View Set <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="mt-12">
              <Link 
                href="/shop/gift-sets"
                className="inline-flex items-center justify-center gap-2 border border-t40-black px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] font-heading text-t40-black hover:bg-t40-black hover:text-t40-white transition-colors w-full sm:w-auto"
              >
                View All Gift Sets
              </Link>
            </div>
            
          </div>

        </div>
      </div>
    </section>
  );
}