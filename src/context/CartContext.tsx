import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, Product } from "@/types";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  // Sync cart with database when user logs in
  useEffect(() => {
    if (user) {
      syncCartWithDatabase();
    } else {
      // Load from localStorage for guests
      const saved = localStorage.getItem("cart");
      if (saved) {
        try {
          setCartItems(JSON.parse(saved));
        } catch {
          setCartItems([]);
        }
      }
    }
  }, [user]);

  // Save to localStorage for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const syncCartWithDatabase = async () => {
    if (!user) return;

    try {
      // Get cart items from database
      const { data: dbCartItems, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          quantity,
          product_id,
          products (*)
        `)
        .eq("user_id", user.id);

      if (error) throw error;

      // Merge local cart with DB cart
      const localCart = localStorage.getItem("cart");
      const localItems: CartItem[] = localCart ? JSON.parse(localCart) : [];

      if (localItems.length > 0) {
        // Add local items to database
        for (const item of localItems) {
          await supabase
            .from("cart_items")
            .upsert({
              user_id: user.id,
              product_id: item.product.id,
              quantity: item.quantity,
            }, {
              onConflict: "user_id,product_id",
            });
        }
        localStorage.removeItem("cart");
      }

      // Fetch updated cart
      const { data: updatedCart } = await supabase
        .from("cart_items")
        .select(`
          id,
          quantity,
          product_id,
          products (*)
        `)
        .eq("user_id", user.id);

      if (updatedCart) {
        const items: CartItem[] = updatedCart
          .filter((item) => item.products)
          .map((item) => ({
            product: {
              id: item.products.id,
              name: item.products.name,
              nameHindi: item.products.name_hindi || undefined,
              description: item.products.description,
              price: Number(item.products.price),
              originalPrice: item.products.original_price ? Number(item.products.original_price) : undefined,
              image: item.products.image_url,
              category: item.products.category,
              artisan: item.products.artisan || undefined,
              village: item.products.village || undefined,
              state: item.products.state || undefined,
              inStock: item.products.in_stock ?? true,
              rating: item.products.rating ? Number(item.products.rating) : undefined,
              reviews: item.products.reviews_count || undefined,
              tags: item.products.tags || undefined,
            },
            quantity: item.quantity,
          }));
        setCartItems(items);
      }
    } catch (error) {
      console.error("Error syncing cart:", error);
    }
  };

  const addToCart = async (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        toast({
          title: "Updated Cart",
          description: `${product.name} quantity increased`,
        });
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart`,
      });
      return [...prev, { product, quantity: 1 }];
    });

    // Sync to database if logged in
    if (user) {
      const existing = cartItems.find((item) => item.product.id === product.id);
      await supabase
        .from("cart_items")
        .upsert({
          user_id: user.id,
          product_id: product.id,
          quantity: (existing?.quantity || 0) + 1,
        }, {
          onConflict: "user_id,product_id",
        });
    }
  };

  const removeFromCart = async (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    toast({
      title: "Removed from Cart",
      description: "Item has been removed",
    });

    if (user) {
      await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );

    if (user) {
      await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("user_id", user.id)
        .eq("product_id", productId);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    if (!user) {
      localStorage.removeItem("cart");
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
