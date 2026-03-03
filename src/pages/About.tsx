import { Button } from "@/components/ui/button";
import { Heart, Users, Leaf, Award, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-crafts.jpg";
import { useSiteContent } from "@/hooks/useSiteContent";

const About = () => {
  const { data: missionData } = useSiteContent("about_mission");
  const { data: valuesData } = useSiteContent("about_values");
  const { data: villagesData } = useSiteContent("partner_villages");

  const missionTitle = missionData?.content?.title || "Bridging Generations Through Craft";
  const missionText = missionData?.content?.text || 'Founded by Divya Singh, Desi Virasat is a women-led startup born from a simple observation: India\'s villages hold centuries of craftsmanship, traditional recipes, and artistic heritage that risk being forgotten. We\'re here to change that.';
  const founderText = missionData?.content?.founder_text || "As a women-led initiative, we're committed to empowering rural artisans—especially women craftswomen—by connecting them directly with conscious consumers. Every purchase you make doesn't just bring you a product—it carries forward a tradition, supports a family, and keeps a heritage alive.";
  const aboutImg = missionData?.images?.about_image || heroImage;

  // Parse values from DB or use defaults
  const defaultValues = [
    { title: "Authenticity", description: "Every product is genuinely handmade using traditional techniques. No factory replicas.", icon: Heart },
    { title: "Fair Trade", description: "Artisans receive 80% of the product price. Real impact, fair compensation.", icon: Users },
    { title: "Sustainability", description: "Natural materials, eco-friendly packaging, carbon-conscious shipping.", icon: Leaf },
    { title: "Quality", description: "Each product is verified for quality and authenticity before listing.", icon: Award },
  ];

  const icons = [Heart, Users, Leaf, Award, Heart, Users, Leaf, Award];
  let valuesList = defaultValues;
  if (valuesData?.raw?.length) {
    const parsed: typeof defaultValues = [];
    const keys = new Set<string>();
    valuesData.raw.forEach((r) => {
      const match = r.key.match(/^(.+)_title$/);
      if (match) keys.add(match[1]);
    });
    let idx = 0;
    keys.forEach((k) => {
      parsed.push({
        title: valuesData.content[`${k}_title`] || "",
        description: valuesData.content[`${k}_description`] || "",
        icon: icons[idx % icons.length],
      });
      idx++;
    });
    if (parsed.length) valuesList = parsed;
  }

  // Parse villages
  const defaultVillages = [
    { state: "Bihar", villages: "Madhubani, Darbhanga, Bhagalpur", specialty: "Madhubani Art, Thekua" },
    { state: "Uttar Pradesh", villages: "Varanasi, Gorakhpur, Moradabad", specialty: "Brass Work, Pottery" },
    { state: "Rajasthan", villages: "Jaipur, Jodhpur, Bagru", specialty: "Block Printing, Textiles" },
  ];

  let villagesList = defaultVillages;
  if (villagesData?.raw?.length) {
    const parsed: typeof defaultVillages = [];
    const keys = new Set<string>();
    villagesData.raw.forEach((r) => {
      const match = r.key.match(/^(.+)_state$/);
      if (match) keys.add(match[1]);
    });
    keys.forEach((k) => {
      parsed.push({
        state: villagesData.content[`${k}_state`] || "",
        villages: villagesData.content[`${k}_villages`] || "",
        specialty: villagesData.content[`${k}_specialty`] || "",
      });
    });
    if (parsed.length) villagesList = parsed;
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center">
        <div className="absolute inset-0">
          <img src={aboutImg} alt="About Desi Virasat" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/60" />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center text-background">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Our Story</h1>
          <p className="text-xl text-background/80 max-w-2xl mx-auto">
            Preserving traditions, empowering artisans, one craft at a time.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm uppercase tracking-widest text-primary mb-4">Our Mission</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">{missionTitle}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{missionText}</p>
            <p className="text-lg text-muted-foreground leading-relaxed mt-4">{founderText}</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">What We Stand For</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valuesList.map((value) => (
              <div key={value.title} className="bg-background p-6 rounded-xl shadow-soft">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Villages */}
      <section className="py-16 md:py-24" id="artisans">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-primary mb-4">Our Network</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Partner Villages</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We work with artisan communities across India, bringing their heritage to your homes.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {villagesList.map((region) => (
              <div key={region.state} className="p-6 border border-border rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-xl font-semibold">{region.state}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Villages: {region.villages}</p>
                <p className="text-sm"><span className="font-medium">Specialty:</span> {region.specialty}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Whether you're an artisan looking to share your craft or a conscious consumer seeking authentic products, you're welcome here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="mustard" size="xl">Shop Now</Button>
            <Button variant="heroOutline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Become a Seller
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
