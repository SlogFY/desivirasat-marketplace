import { useState } from "react";
import { useSiteContent, useUpsertSiteContent, useDeleteSiteContent, SiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, Save, Plus, Trash2, X } from "lucide-react";

const AdminSiteContent = () => {
  const { data: allContent, isLoading } = useSiteContent();
  const upsertMutation = useUpsertSiteContent();
  const deleteMutation = useDeleteSiteContent();

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const getContent = (section: string, key: string) =>
    allContent?.find((c) => c.section === section && c.key === key);

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl font-bold mb-2">Site Content</h1>
      <p className="text-muted-foreground mb-6">Edit your website content from here</p>

      <Tabs defaultValue="hero">
        <TabsList className="mb-6">
          <TabsTrigger value="hero">Home Page</TabsTrigger>
          <TabsTrigger value="about">About Page</TabsTrigger>
          <TabsTrigger value="social">Social & Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <HeroSection content={allContent || []} upsert={upsertMutation} />
        </TabsContent>
        <TabsContent value="about">
          <AboutSection content={allContent || []} upsert={upsertMutation} deleteMut={deleteMutation} />
        </TabsContent>
        <TabsContent value="social">
          <SocialSection content={allContent || []} upsert={upsertMutation} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ─── Hero Section Editor ─────────────────────────
function HeroSection({ content, upsert }: { content: SiteContent[]; upsert: ReturnType<typeof useUpsertSiteContent> }) {
  const get = (key: string) => content.find((c) => c.section === "hero" && c.key === key);

  const [badge, setBadge] = useState(get("badge")?.value || "Authentic Rural Heritage");
  const [title, setTitle] = useState(get("title")?.value || "Bringing India's\nDesi Virasat\nTo Your Doorstep");
  const [subtitle, setSubtitle] = useState(get("subtitle")?.value || "Discover authentic handmade crafts and traditional delicacies, sourced directly from village artisans across India. Every purchase preserves a heritage, supports a family.");
  const [uploading, setUploading] = useState(false);
  const heroImageUrl = get("hero_image")?.image_url || "";

  const save = async () => {
    try {
      await upsert.mutateAsync({ section: "hero", key: "badge", value: badge });
      await upsert.mutateAsync({ section: "hero", key: "title", value: title });
      await upsert.mutateAsync({ section: "hero", key: "subtitle", value: subtitle });
      toast({ title: "Hero content saved!" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const uploadHeroImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const name = `hero-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("site-assets").upload(name, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("site-assets").getPublicUrl(name);
      await upsert.mutateAsync({ section: "hero", key: "hero_image", image_url: data.publicUrl });
      toast({ title: "Hero image updated!" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label>Hero Image</Label>
        <div className="flex items-center gap-4">
          {heroImageUrl && <img src={heroImageUrl} alt="Hero" className="w-40 h-24 object-cover rounded-lg" />}
          <label className="cursor-pointer">
            <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span className="text-sm">{uploading ? "Uploading..." : "Upload Image"}</span>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={uploadHeroImage} />
          </label>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Badge Text</Label>
        <Input value={badge} onChange={(e) => setBadge(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Title (use \n for line breaks)</Label>
        <Textarea value={title} onChange={(e) => setTitle(e.target.value)} rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Subtitle</Label>
        <Textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)} rows={3} />
      </div>
      <Button onClick={save} disabled={upsert.isPending}>
        <Save className="h-4 w-4 mr-2" />Save Hero Content
      </Button>
    </div>
  );
}

// ─── About Section Editor ────────────────────────
function AboutSection({ content, upsert, deleteMut }: { content: SiteContent[]; upsert: ReturnType<typeof useUpsertSiteContent>; deleteMut: ReturnType<typeof useDeleteSiteContent> }) {
  const getMission = () => content.find((c) => c.section === "about_mission" && c.key === "text");
  const getMissionTitle = () => content.find((c) => c.section === "about_mission" && c.key === "title");
  const getValues = () => content.filter((c) => c.section === "about_values").sort((a, b) => a.sort_order - b.sort_order);
  const getVillages = () => content.filter((c) => c.section === "partner_villages").sort((a, b) => a.sort_order - b.sort_order);

  const [missionTitle, setMissionTitle] = useState(getMissionTitle()?.value || "Bridging Generations Through Craft");
  const [missionText, setMissionText] = useState(getMission()?.value || "");
  const [uploading, setUploading] = useState(false);
  const aboutImageUrl = content.find((c) => c.section === "about_mission" && c.key === "hero_image")?.image_url || "";

  // Values
  const [values, setValues] = useState(getValues().map((v) => ({ id: v.id, title: v.key, description: v.value || "" })));
  const [newValue, setNewValue] = useState({ title: "", description: "" });

  // Villages
  const [villages, setVillages] = useState(getVillages().map((v) => {
    try {
      const parsed = JSON.parse(v.value || "{}");
      return { id: v.id, key: v.key, state: parsed.state || "", villages: parsed.villages || "", specialty: parsed.specialty || "" };
    } catch {
      return { id: v.id, key: v.key, state: "", villages: "", specialty: "" };
    }
  }));
  const [newVillage, setNewVillage] = useState({ state: "", villages: "", specialty: "" });

  const saveMission = async () => {
    try {
      await upsert.mutateAsync({ section: "about_mission", key: "title", value: missionTitle });
      await upsert.mutateAsync({ section: "about_mission", key: "text", value: missionText });
      toast({ title: "Mission content saved!" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const uploadAboutImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const name = `about-hero-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("site-assets").upload(name, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("site-assets").getPublicUrl(name);
      await upsert.mutateAsync({ section: "about_mission", key: "hero_image", image_url: data.publicUrl });
      toast({ title: "About hero image updated!" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const saveValue = async (title: string, description: string) => {
    await upsert.mutateAsync({ section: "about_values", key: title, value: description, sort_order: values.length });
    toast({ title: "Value saved!" });
  };

  const addValue = async () => {
    if (!newValue.title) return;
    await upsert.mutateAsync({ section: "about_values", key: newValue.title, value: newValue.description, sort_order: values.length });
    setValues([...values, { id: "", title: newValue.title, description: newValue.description }]);
    setNewValue({ title: "", description: "" });
    toast({ title: "Value added!" });
  };

  const addVillageRegion = async () => {
    if (!newVillage.state) return;
    const key = `region_${Date.now()}`;
    await upsert.mutateAsync({
      section: "partner_villages",
      key,
      value: JSON.stringify(newVillage),
      sort_order: villages.length,
    });
    setVillages([...villages, { id: "", key, ...newVillage }]);
    setNewVillage({ state: "", villages: "", specialty: "" });
    toast({ title: "Region added!" });
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* About Hero Image */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">About Page Hero Image</Label>
        <div className="flex items-center gap-4">
          {aboutImageUrl && <img src={aboutImageUrl} alt="About Hero" className="w-40 h-24 object-cover rounded-lg" />}
          <label className="cursor-pointer">
            <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span className="text-sm">{uploading ? "Uploading..." : "Upload Image"}</span>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={uploadAboutImage} />
          </label>
        </div>
      </div>

      {/* Mission */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Our Mission</h3>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={missionTitle} onChange={(e) => setMissionTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Content</Label>
          <Textarea value={missionText} onChange={(e) => setMissionText(e.target.value)} rows={5} />
        </div>
        <Button onClick={saveMission} disabled={upsert.isPending}>
          <Save className="h-4 w-4 mr-2" />Save Mission
        </Button>
      </div>

      {/* Values */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">What We Stand For</h3>
        {values.map((v, i) => (
          <div key={i} className="flex gap-2 items-start p-3 bg-muted rounded-lg">
            <div className="flex-1 space-y-2">
              <Input value={v.title} onChange={(e) => { const nv = [...values]; nv[i].title = e.target.value; setValues(nv); }} placeholder="Title" />
              <Textarea value={v.description} onChange={(e) => { const nv = [...values]; nv[i].description = e.target.value; setValues(nv); }} rows={2} placeholder="Description" />
            </div>
            <div className="flex flex-col gap-1">
              <Button size="icon" variant="ghost" onClick={() => saveValue(v.title, v.description)}><Save className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { if (v.id) deleteMut.mutate(v.id); setValues(values.filter((_, j) => j !== i)); }}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        <div className="flex gap-2 items-end p-3 border border-dashed border-border rounded-lg">
          <div className="flex-1 space-y-2">
            <Input value={newValue.title} onChange={(e) => setNewValue({ ...newValue, title: e.target.value })} placeholder="New value title" />
            <Textarea value={newValue.description} onChange={(e) => setNewValue({ ...newValue, description: e.target.value })} rows={2} placeholder="Description" />
          </div>
          <Button onClick={addValue} disabled={!newValue.title}><Plus className="h-4 w-4 mr-1" />Add</Button>
        </div>
      </div>

      {/* Partner Villages */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Partner Villages</h3>
        {villages.map((v, i) => (
          <div key={i} className="p-3 bg-muted rounded-lg space-y-2">
            <div className="flex gap-2">
              <Input value={v.state} onChange={(e) => { const nv = [...villages]; nv[i].state = e.target.value; setVillages(nv); }} placeholder="State" />
              <Button size="icon" variant="ghost" onClick={async () => {
                await upsert.mutateAsync({ section: "partner_villages", key: v.key, value: JSON.stringify({ state: v.state, villages: v.villages, specialty: v.specialty }), sort_order: i });
                toast({ title: "Saved!" });
              }}><Save className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { if (v.id) deleteMut.mutate(v.id); setVillages(villages.filter((_, j) => j !== i)); }}><Trash2 className="h-4 w-4" /></Button>
            </div>
            <Input value={v.villages} onChange={(e) => { const nv = [...villages]; nv[i].villages = e.target.value; setVillages(nv); }} placeholder="Villages (comma-separated)" />
            <Input value={v.specialty} onChange={(e) => { const nv = [...villages]; nv[i].specialty = e.target.value; setVillages(nv); }} placeholder="Specialty" />
          </div>
        ))}
        <div className="p-3 border border-dashed border-border rounded-lg space-y-2">
          <Input value={newVillage.state} onChange={(e) => setNewVillage({ ...newVillage, state: e.target.value })} placeholder="State" />
          <Input value={newVillage.villages} onChange={(e) => setNewVillage({ ...newVillage, villages: e.target.value })} placeholder="Villages (comma-separated)" />
          <Input value={newVillage.specialty} onChange={(e) => setNewVillage({ ...newVillage, specialty: e.target.value })} placeholder="Specialty" />
          <Button onClick={addVillageRegion} disabled={!newVillage.state}><Plus className="h-4 w-4 mr-1" />Add Region</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Social & Contact Section ────────────────────
function SocialSection({ content, upsert }: { content: SiteContent[]; upsert: ReturnType<typeof useUpsertSiteContent> }) {
  const get = (key: string) => content.find((c) => c.section === "social_links" && c.key === key);
  const getContact = (key: string) => content.find((c) => c.section === "contact_info" && c.key === key);

  const [facebook, setFacebook] = useState(get("facebook_url")?.value || "");
  const [instagram, setInstagram] = useState(get("instagram_url")?.value || "");
  const [twitter, setTwitter] = useState(get("twitter_url")?.value || "");
  const [phone, setPhone] = useState(getContact("phone")?.value || "+91 63888 86278");
  const [email, setEmail] = useState(getContact("email")?.value || "namaste@desivirasat.store");
  const [address, setAddress] = useState(getContact("address")?.value || "Village Artisan Hub, Patna, Bihar 800001, India");

  const save = async () => {
    try {
      await upsert.mutateAsync({ section: "social_links", key: "facebook_url", value: facebook });
      await upsert.mutateAsync({ section: "social_links", key: "instagram_url", value: instagram });
      await upsert.mutateAsync({ section: "social_links", key: "twitter_url", value: twitter });
      await upsert.mutateAsync({ section: "contact_info", key: "phone", value: phone });
      await upsert.mutateAsync({ section: "contact_info", key: "email", value: email });
      await upsert.mutateAsync({ section: "contact_info", key: "address", value: address });
      toast({ title: "Social & contact info saved!" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h3 className="text-lg font-semibold">Social Media Links</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Facebook URL</Label>
          <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/..." />
        </div>
        <div className="space-y-2">
          <Label>Instagram URL</Label>
          <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/..." />
        </div>
        <div className="space-y-2">
          <Label>Twitter URL</Label>
          <Input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://twitter.com/..." />
        </div>
      </div>

      <h3 className="text-lg font-semibold pt-4">Contact Info</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Address</Label>
          <Textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
        </div>
      </div>

      <Button onClick={save} disabled={upsert.isPending}>
        <Save className="h-4 w-4 mr-2" />Save All
      </Button>
    </div>
  );
}

export default AdminSiteContent;
