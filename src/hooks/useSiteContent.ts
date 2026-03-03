import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteContent {
  id: string;
  section: string;
  key: string;
  value: string | null;
  image_url: string | null;
  sort_order: number;
}

interface CategoryRow {
  id: string;
  name: string;
  name_hindi: string | null;
  description: string | null;
  image_url: string | null;
}

// Helper to bypass strict typing for new tables not yet in generated types
const db = () => supabase as any;

export const useSiteContent = (section?: string) => {
  return useQuery({
    queryKey: ["site-content", section],
    queryFn: async () => {
      let query = db().from("site_content").select("*").order("sort_order");
      if (section) query = query.eq("section", section);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as SiteContent[];
    },
  });
};

export const useSiteContentBySection = (section: string) => {
  const { data, ...rest } = useSiteContent(section);
  const contentMap: Record<string, SiteContent> = {};
  data?.forEach((item) => {
    contentMap[item.key] = item;
  });
  return { contentMap, data, ...rest };
};

export const useUpsertSiteContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: { section: string; key: string; value?: string; image_url?: string; sort_order?: number }) => {
      const { data: existing } = await db()
        .from("site_content")
        .select("id")
        .eq("section", item.section)
        .eq("key", item.key)
        .maybeSingle();

      if (existing) {
        const { error } = await db()
          .from("site_content")
          .update({ value: item.value, image_url: item.image_url, sort_order: item.sort_order, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await db().from("site_content").insert(item);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
    },
  });
};

export const useDeleteSiteContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db().from("site_content").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await db().from("categories").select("*").order("name");
      if (error) throw error;
      return data as CategoryRow[];
    },
  });
};
