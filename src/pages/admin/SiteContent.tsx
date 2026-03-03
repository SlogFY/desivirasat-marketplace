import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent, upsertSiteContent, deleteSiteContent } from "@/hooks/useSiteContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, X, Plus, Trash2, Save } from "lucide-react";

const AdminSiteContent = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Site Content</h1>
        <p className="text-muted-foreground">Manage your website content</p>
      </div>

      <Tabs defaultValue="home" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="home">Home Page</TabsTrigger>
          <TabsTrigger value="about">About Page</TabsTrigger>
          <TabsTrigger value="social">Social & Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="home"><HeroSection /></TabsContent>
        <TabsContent value="about"><AboutSection /></TabsContent>
        <TabsContent value="social"><SocialSection /></TabsContent>
      </Tabs>
    </div>
  );
};

// ===================== HERO SECTION =====================
const HeroSection = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useSiteContent("hero");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", badge_text: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (data) {
      setForm({
        title: data.content.title || "",
        subtitle: data.content.subtitle || "",
        badge_text: data.content.badge_text || "",
      });
      setImagePreview(data.images.hero_image || "");
    }
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      let heroImageUrl = imagePreview;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const name = `hero-${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("site-assets").upload(name, imageFile);
        if (error) throw error;
        heroImageUrl = supabase.storage.from("site-assets").getPublicUrl(name).data.publicUrl;
      }

      await Promise.all([
        upsertSiteContent("hero", "title", form.title),
        upsertSiteContent("hero", "subtitle", form.subtitle),
        upsertSiteContent("hero", "badge_text", form.badge_text),
        upsertSiteContent("hero", "hero_image", null, heroImageUrl),
      ]);

      queryClient.invalidateQueries({ queryKey: ["site-content", "hero"] });
      toast({ title: "Hero content saved!" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="bg-card rounded-xl shadow-soft p-6 space-y-4">
      <h2 className="font-display text-lg font-semibold">Hero Section</h2>
      <div className="space-y-2">
        <Label>Badge Text</Label>
        <Input value={form.badge_text} onChange={(e) => setForm({ ...form, badge_text: e.target.value })} placeholder="Authentic Rural Heritage" />
      </div>
      <div className="space-y-2">
        <Label>Title</Label>
        <Textarea value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} rows={2}
          placeholder="Bringing India's Desi Virasat To Your Doorstep" />
      </div>
      <div className="space-y-2">
        <Label>Subtitle</Label>
        <Textarea value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} rows={3}
          placeholder="Discover authentic handmade crafts..." />
      </div>
      <div className="space-y-2">
        <Label>Hero Background Image</Label>
        <ImageUploader preview={imagePreview} onFileSelect={(f, p) => { setImageFile(f); setImagePreview(p); }}
          onClear={() => { setImageFile(null); setImagePreview(""); }} />
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
        Save Hero Content
      </Button>
    </div>
  );
};

// ===================== ABOUT SECTION =====================
const AboutSection = () => {
  const queryClient = useQueryClient();
  const { data: missionData, isLoading: ml } = useSiteContent("about_mission");
  const { data: valuesData, isLoading: vl } = useSiteContent("about_values");
  const { data: villagesData, isLoading: pl } = useSiteContent("partner_villages");
  const [saving, setSaving] = useState(false);

  const [mission, setMission] = useState({ title: "", text: "", founder_text: "" });
  const [values, setValues] = useState<{ key: string; title: string; description: string }[]>([]);
  const [villages, setVillages] = useState<{ key: string; state: string; villages: string; specialty: string }[]>([]);
  const [aboutImage, setAboutImage] = useState("");
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (missionData) {
      setMission({
        title: missionData.content.title || "",
        text: missionData.content.text || "",
        founder_text: missionData.content.founder_text || "",
      });
      setAboutImage(missionData.images.about_image || "");
    }
  }, [missionData]);

  useEffect(() => {
    if (valuesData?.raw?.length) {
      const parsed: typeof values = [];
      const keys = new Set<string>();
      valuesData.raw.forEach((r) => {
        const match = r.key.match(/^(.+)_title$/);
        if (match) keys.add(match[1]);
      });
      keys.forEach((k) => {
        parsed.push({
          key: k,
          title: valuesData.content[`${k}_title`] || "",
          description: valuesData.content[`${k}_description`] || "",
        });
      });
      if (parsed.length) setValues(parsed);
    }
  }, [valuesData]);

  useEffect(() => {
    if (villagesData?.raw?.length) {
      const parsed: typeof villages = [];
      const keys = new Set<string>();
      villagesData.raw.forEach((r) => {
        const match = r.key.match(/^(.+)_state$/);
        if (match) keys.add(match[1]);
      });
      keys.forEach((k) => {
        parsed.push({
          key: k,
          state: villagesData.content[`${k}_state`] || "",
          villages: villagesData.content[`${k}_villages`] || "",
          specialty: villagesData.content[`${k}_specialty`] || "",
        });
      });
      if (parsed.length) setVillages(parsed);
    }
  }, [villagesData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      let aboutImageUrl = aboutImage;
      if (aboutImageFile) {
        const ext = aboutImageFile.name.split(".").pop();
        const name = `about-${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("site-assets").upload(name, aboutImageFile);
        if (error) throw error;
        aboutImageUrl = supabase.storage.from("site-assets").getPublicUrl(name).data.publicUrl;
      }

      const promises: Promise<void>[] = [
        upsertSiteContent("about_mission", "title", mission.title),
        upsertSiteContent("about_mission", "text", mission.text),
        upsertSiteContent("about_mission", "founder_text", mission.founder_text),
        upsertSiteContent("about_mission", "about_image", null, aboutImageUrl),
      ];

      values.forEach((v, i) => {
        promises.push(upsertSiteContent("about_values", `${v.key}_title`, v.title, null, i));
        promises.push(upsertSiteContent("about_values", `${v.key}_description`, v.description, null, i));
      });

      villages.forEach((v, i) => {
        promises.push(upsertSiteContent("partner_villages", `${v.key}_state`, v.state, null, i));
        promises.push(upsertSiteContent("partner_villages", `${v.key}_villages`, v.villages, null, i));
        promises.push(upsertSiteContent("partner_villages", `${v.key}_specialty`, v.specialty, null, i));
      });

      await Promise.all(promises);
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast({ title: "About content saved!" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addValue = () => {
    setValues([...values, { key: `value_${Date.now()}`, title: "", description: "" }]);
  };

  const removeValue = async (idx: number) => {
    const v = values[idx];
    try {
      await deleteSiteContent("about_values", `${v.key}_title`);
      await deleteSiteContent("about_values", `${v.key}_description`);
    } catch {}
    setValues(values.filter((_, i) => i !== idx));
  };

  const addVillage = () => {
    setVillages([...villages, { key: `region_${Date.now()}`, state: "", villages: "", specialty: "" }]);
  };

  const removeVillage = async (idx: number) => {
    const v = villages[idx];
    try {
      await deleteSiteContent("partner_villages", `${v.key}_state`);
      await deleteSiteContent("partner_villages", `${v.key}_villages`);
      await deleteSiteContent("partner_villages", `${v.key}_specialty`);
    } catch {}
    setVillages(villages.filter((_, i) => i !== idx));
  };

  if (ml || vl || pl) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      {/* Mission */}
      <div className="bg-card rounded-xl shadow-soft p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold">Our Mission</h2>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={mission.title} onChange={(e) => setMission({ ...mission, title: e.target.value })} placeholder="Bridging Generations Through Craft" />
        </div>
        <div className="space-y-2">
          <Label>Main Text</Label>
          <Textarea value={mission.text} onChange={(e) => setMission({ ...mission, text: e.target.value })} rows={4} />
        </div>
        <div className="space-y-2">
          <Label>Founder Text</Label>
          <Textarea value={mission.founder_text} onChange={(e) => setMission({ ...mission, founder_text: e.target.value })} rows={3} />
        </div>
        <div className="space-y-2">
          <Label>About Page Image</Label>
          <ImageUploader preview={aboutImage} onFileSelect={(f, p) => { setAboutImageFile(f); setAboutImage(p); }}
            onClear={() => { setAboutImageFile(null); setAboutImage(""); }} />
        </div>
      </div>

      {/* Values */}
      <div className="bg-card rounded-xl shadow-soft p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">What We Stand For</h2>
          <Button size="sm" variant="outline" onClick={addValue}><Plus className="h-4 w-4 mr-1" />Add Value</Button>
        </div>
        {values.map((v, i) => (
          <div key={v.key} className="flex gap-3 items-start p-3 border border-border rounded-lg">
            <div className="flex-1 space-y-2">
              <Input value={v.title} onChange={(e) => { const n = [...values]; n[i].title = e.target.value; setValues(n); }} placeholder="Title" />
              <Textarea value={v.description} onChange={(e) => { const n = [...values]; n[i].description = e.target.value; setValues(n); }} placeholder="Description" rows={2} />
            </div>
            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeValue(i)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>

      {/* Partner Villages */}
      <div className="bg-card rounded-xl shadow-soft p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Partner Villages</h2>
          <Button size="sm" variant="outline" onClick={addVillage}><Plus className="h-4 w-4 mr-1" />Add Region</Button>
        </div>
        {villages.map((v, i) => (
          <div key={v.key} className="flex gap-3 items-start p-3 border border-border rounded-lg">
            <div className="flex-1 space-y-2">
              <Input value={v.state} onChange={(e) => { const n = [...villages]; n[i].state = e.target.value; setVillages(n); }} placeholder="State (e.g., Bihar)" />
              <Input value={v.villages} onChange={(e) => { const n = [...villages]; n[i].villages = e.target.value; setVillages(n); }} placeholder="Villages (comma-separated)" />
              <Input value={v.specialty} onChange={(e) => { const n = [...villages]; n[i].specialty = e.target.value; setVillages(n); }} placeholder="Specialty (e.g., Madhubani Art)" />
            </div>
            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeVillage(i)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
        Save All About Content
      </Button>
    </div>
  );
};

// ===================== SOCIAL SECTION =====================
const SocialSection = () => {
  const queryClient = useQueryClient();
  const { data: socialData, isLoading: sl } = useSiteContent("social_links");
  const { data: contactData, isLoading: cl } = useSiteContent("contact");
  const [saving, setSaving] = useState(false);

  const [social, setSocial] = useState({ facebook_url: "", instagram_url: "", twitter_url: "" });
  const [contact, setContact] = useState({ phone: "", email: "", address: "" });

  useEffect(() => {
    if (socialData) {
      setSocial({
        facebook_url: socialData.content.facebook_url || "",
        instagram_url: socialData.content.instagram_url || "",
        twitter_url: socialData.content.twitter_url || "",
      });
    }
  }, [socialData]);

  useEffect(() => {
    if (contactData) {
      setContact({
        phone: contactData.content.phone || "",
        email: contactData.content.email || "",
        address: contactData.content.address || "",
      });
    }
  }, [contactData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        upsertSiteContent("social_links", "facebook_url", social.facebook_url),
        upsertSiteContent("social_links", "instagram_url", social.instagram_url),
        upsertSiteContent("social_links", "twitter_url", social.twitter_url),
        upsertSiteContent("contact", "phone", contact.phone),
        upsertSiteContent("contact", "email", contact.email),
        upsertSiteContent("contact", "address", contact.address),
      ]);
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast({ title: "Social & contact info saved!" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (sl || cl) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl shadow-soft p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold">Social Media Links</h2>
        <div className="space-y-2">
          <Label>Facebook URL</Label>
          <Input value={social.facebook_url} onChange={(e) => setSocial({ ...social, facebook_url: e.target.value })} placeholder="https://facebook.com/..." />
        </div>
        <div className="space-y-2">
          <Label>Instagram URL</Label>
          <Input value={social.instagram_url} onChange={(e) => setSocial({ ...social, instagram_url: e.target.value })} placeholder="https://instagram.com/..." />
        </div>
        <div className="space-y-2">
          <Label>Twitter URL</Label>
          <Input value={social.twitter_url} onChange={(e) => setSocial({ ...social, twitter_url: e.target.value })} placeholder="https://twitter.com/..." />
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-soft p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold">Contact Information</h2>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="+91 63888 86278" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="namaste@desivirasat.store" />
        </div>
        <div className="space-y-2">
          <Label>Address</Label>
          <Textarea value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} placeholder="Village Artisan Hub, Patna, Bihar" rows={2} />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
        Save Social & Contact
      </Button>
    </div>
  );
};

// ===================== IMAGE UPLOADER =====================
const ImageUploader = ({
  preview,
  onFileSelect,
  onClear,
}: {
  preview: string;
  onFileSelect: (file: File, previewUrl: string) => void;
  onClear: () => void;
}) => {
  return preview ? (
    <div className="relative inline-block">
      <img src={preview} alt="Preview" className="w-32 h-24 object-cover rounded-lg" />
      <button type="button" onClick={onClear}
        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
        <X className="h-4 w-4" />
      </button>
    </div>
  ) : (
    <label className="w-32 h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
      <Upload className="h-5 w-5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground mt-1">Upload</span>
      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) onFileSelect(f, URL.createObjectURL(f));
      }} />
    </label>
  );
};

export default AdminSiteContent;
