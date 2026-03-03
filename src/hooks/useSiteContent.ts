import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteContentRow {
  id: string;
  section: string;
  key: string;
  value: string | null;
  image_url: string | null;
  sort_order: number;
}

export const useSiteContent = (section: string) => {
  return useQuery({
    queryKey: ["site-content", section],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("site_content")
        .select("*")
        .eq("section", section)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      // Convert to key-value map
      const contentMap: Record<string, string> = {};
      const imageMap: Record<string, string> = {};
      (data as SiteContentRow[])?.forEach((row) => {
        if (row.value) contentMap[row.key] = row.value;
        if (row.image_url) imageMap[row.key] = row.image_url;
      });

      return { content: contentMap, images: imageMap, raw: data as SiteContentRow[] };
    },
  });
};

export const upsertSiteContent = async (
  section: string,
  key: string,
  value?: string | null,
  image_url?: string | null,
  sort_order?: number
) => {
  const { error } = await (supabase as any)
    .from("site_content")
    .upsert(
      {
        section,
        key,
        value: value ?? null,
        image_url: image_url ?? null,
        sort_order: sort_order ?? 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "section,key" }
    );
  if (error) throw error;
};

export const deleteSiteContent = async (section: string, key: string) => {
  const { error } = await (supabase as any)
    .from("site_content")
    .delete()
    .eq("section", section)
    .eq("key", key);
  if (error) throw error;
};
