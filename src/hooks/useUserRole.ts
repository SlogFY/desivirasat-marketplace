import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

type AppRole = "admin" | "support" | "product_manager" | "user";

export const useUserRole = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async (): Promise<AppRole[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) throw error;
      return data?.map((r) => r.role as AppRole) || [];
    },
    enabled: !!user,
  });
};

export const useIsAdmin = () => {
  const { data: roles = [], isLoading } = useUserRole();
  return {
    isAdmin: roles.includes("admin"),
    isProductManager: roles.includes("product_manager") || roles.includes("admin"),
    isSupport: roles.includes("support") || roles.includes("admin"),
    isLoading,
  };
};
