import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRazorpayEnabled = () => {
  return useQuery({
    queryKey: ["razorpay-enabled"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_razorpay_enabled");
      if (error) return false;
      return !!data;
    },
  });
};
