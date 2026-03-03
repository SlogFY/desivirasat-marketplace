

# Full Admin CMS - Product Inventory, Site Content, and Settings Management

## Overview
Build a complete admin CMS with 4 major features: (1) Product management with stock quantities and dynamic categories, (2) About page content editing, (3) Social media link management, (4) Home page hero content editing.

---

## Database Changes (3 Migrations)

### Migration 1: Add `stock_quantity` to products
```sql
ALTER TABLE products ADD COLUMN stock_quantity integer NOT NULL DEFAULT 0;
```

### Migration 2: Create `categories` table
```sql
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  name_hindi text,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

### Migration 3: Create `site_content` table + storage bucket
```sql
CREATE TABLE site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  key text NOT NULL,
  value text,
  image_url text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(section, key)
);
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read site_content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage site_content" ON site_content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for site assets
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true);
CREATE POLICY "Anyone can view site assets" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');
CREATE POLICY "Admins can upload site assets" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete site assets" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'));
```

The `site_content` table stores all editable content as key-value pairs organized by section:
- `hero` section: title, subtitle, badge_text, hero_image
- `about_mission`: title, text, founder_text
- `about_values`: value_1_title, value_1_description, etc. (dynamic via sort_order)
- `partner_villages`: region entries
- `social_links`: facebook_url, instagram_url, twitter_url
- `contact`: phone, email, address

---

## New Files

### `src/hooks/useSiteContent.ts`
Shared hook to fetch content from `site_content` table by section. Returns key-value map with fallback support.

### `src/pages/admin/Categories.tsx`
CRUD page for categories: add, edit, delete categories with name, Hindi name, description, and image.

### `src/pages/admin/SiteContent.tsx`
Tabbed admin page with sections:
- **Home Page Tab**: Edit hero title, subtitle, badge text, upload hero background image
- **About Page Tab**: Edit mission text, values cards (add/edit/remove), partner villages (add/edit/remove), about hero image
- **Social & Contact Tab**: Edit Facebook, Instagram, Twitter URLs; phone, email, address

Each section loads existing values from `site_content` and saves back via upsert.

---

## Modified Files

### `src/integrations/supabase/types.ts`
Add TypeScript types for `categories` and `site_content` tables, and `stock_quantity` column on products.

### `src/components/admin/AdminLayout.tsx`
Add nav items: "Categories" (`/admin/categories`) and "Site Content" (`/admin/site-content`).

### `src/App.tsx`
Add routes: `/admin/categories` and `/admin/site-content`.

### `src/components/admin/ProductFormDialog.tsx`
- Add `stock_quantity` number input
- Fetch categories from `categories` table dynamically instead of hardcoded list
- Add "New Category" inline button that opens a small form to create a category on-the-fly

### `src/pages/admin/Products.tsx`
- Show `stock_quantity` column in table
- Display stock count instead of just "In Stock / Out of Stock"

### `src/components/ProductCard.tsx`
- Show "X left" badge when `stock_quantity < 10` and `> 0`
- Show "Out of Stock" when `stock_quantity === 0`

### `src/pages/Index.tsx`
- Use `useSiteContent('hero')` to fetch dynamic hero title, subtitle, badge text, image
- Fallback to current hardcoded values if DB returns nothing

### `src/pages/About.tsx`
- Use `useSiteContent` for mission, values, partner villages sections
- Render dynamically; fallback to current hardcoded content

### `src/components/layout/Footer.tsx`
- Use `useSiteContent('social_links')` and `useSiteContent('contact')` for dynamic social URLs and contact info
- Fallback to current hardcoded values

### `src/pages/Checkout.tsx` (or order placement logic)
- On order placement, decrement `stock_quantity` for each ordered product

---

## File Summary

| File | Action |
|------|--------|
| Migration: stock_quantity | New |
| Migration: categories table | New |
| Migration: site_content + storage | New |
| `src/hooks/useSiteContent.ts` | New |
| `src/pages/admin/Categories.tsx` | New |
| `src/pages/admin/SiteContent.tsx` | New |
| `src/integrations/supabase/types.ts` | Edit |
| `src/components/admin/AdminLayout.tsx` | Edit |
| `src/App.tsx` | Edit |
| `src/components/admin/ProductFormDialog.tsx` | Edit |
| `src/pages/admin/Products.tsx` | Edit |
| `src/components/ProductCard.tsx` | Edit |
| `src/pages/Index.tsx` | Edit |
| `src/pages/About.tsx` | Edit |
| `src/components/layout/Footer.tsx` | Edit |
| `src/pages/Checkout.tsx` | Edit |

