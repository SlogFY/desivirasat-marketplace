import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";

// Fallback to local products if DB is empty
import { products as localProducts } from "@/data/products";

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("in_stock", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // If no products in DB, return local products
      if (!data || data.length === 0) {
        return localProducts;
      }

      // Map DB products to Product type
      return data.map((p) => ({
        id: p.id,
        name: p.name,
        nameHindi: p.name_hindi || undefined,
        description: p.description,
        price: Number(p.price),
        originalPrice: p.original_price ? Number(p.original_price) : undefined,
        image: p.image_url,
        category: p.category,
        artisan: p.artisan || undefined,
        village: p.village || undefined,
        state: p.state || undefined,
        inStock: p.in_stock ?? true,
        rating: p.rating ? Number(p.rating) : undefined,
        reviews: p.reviews_count || undefined,
        tags: p.tags || undefined,
      }));
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async (): Promise<Product | null> => {
      // First try DB
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error && !error.message.includes("invalid input syntax")) throw error;

      if (data) {
        return {
          id: data.id,
          name: data.name,
          nameHindi: data.name_hindi || undefined,
          description: data.description,
          price: Number(data.price),
          originalPrice: data.original_price ? Number(data.original_price) : undefined,
          image: data.image_url,
          category: data.category,
          artisan: data.artisan || undefined,
          village: data.village || undefined,
          state: data.state || undefined,
          inStock: data.in_stock ?? true,
          rating: data.rating ? Number(data.rating) : undefined,
          reviews: data.reviews_count || undefined,
          tags: data.tags || undefined,
        };
      }

      // Fallback to local products
      return localProducts.find((p) => p.id === id) || null;
    },
  });
};
