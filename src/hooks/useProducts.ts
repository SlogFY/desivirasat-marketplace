import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";

// Fallback to local products if DB is empty
import { products as localProducts } from "@/data/products";

const mapProduct = (p: any): Product => ({
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
  isFeatured: p.is_featured ?? false,
  stockQuantity: p.stock_quantity ?? 0,
});

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // If no products in DB, return local products
      if (!data || data.length === 0) {
        return localProducts;
      }

      return data.map(mapProduct);
    },
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: async (): Promise<Product[]> => {
      // 1. Try auto top-sellers from order history
      const { data: topIds } = await supabase.rpc("get_top_selling_product_ids", { _limit: 4 });

      if (topIds && topIds.length > 0) {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .in("id", topIds)
          .eq("in_stock", true);
        if (error) throw error;
        if (data && data.length > 0) {
          // Sort by sales rank
          const idOrder = topIds as string[];
          const sorted = [...data].sort((a, b) => idOrder.indexOf(a.id) - idOrder.indexOf(b.id));
          return sorted.map(mapProduct);
        }
      }

      // 2. Fallback: manually featured products
      const { data: featured, error: fErr } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .eq("in_stock", true)
        .order("created_at", { ascending: false })
        .limit(4);

      if (fErr) throw fErr;
      if (featured && featured.length > 0) return featured.map(mapProduct);

      // 3. Final fallback: local products
      return localProducts.slice(0, 4);
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["shop-categories"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as { id: string; name: string; name_hindi?: string; description?: string; image_url?: string }[];
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
        return mapProduct(data);
      }

      // Fallback to local products
      return localProducts.find((p) => p.id === id) || null;
    },
  });
};
