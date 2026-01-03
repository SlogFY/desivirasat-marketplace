import { Button } from "@/components/ui/button";
import { Heart, Users, Leaf, Award, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-crafts.jpg";

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="About Desi Virasat"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/60" />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center text-background">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Our Story
          </h1>
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
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Bridging Generations Through Craft
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Desi Virasat was born from a simple observation: India's villages hold 
              centuries of craftsmanship, traditional recipes, and artistic heritage 
              that risk being forgotten. We're here to change that.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mt-4">
              By connecting rural artisans directly with conscious consumers, we ensure 
              that every purchase you make doesn't just bring you a product—it carries 
              forward a tradition, supports a family, and keeps a heritage alive.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
            What We Stand For
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Heart,
                title: "Authenticity",
                description: "Every product is genuinely handmade using traditional techniques. No factory replicas.",
              },
              {
                icon: Users,
                title: "Fair Trade",
                description: "Artisans receive 80% of the product price. Real impact, fair compensation.",
              },
              {
                icon: Leaf,
                title: "Sustainability",
                description: "Natural materials, eco-friendly packaging, carbon-conscious shipping.",
              },
              {
                icon: Award,
                title: "Quality",
                description: "Each product is verified for quality and authenticity before listing.",
              },
            ].map((value) => (
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
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Partner Villages
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We work with artisan communities across India, bringing their heritage to your homes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { state: "Bihar", villages: ["Madhubani", "Darbhanga", "Bhagalpur"], specialty: "Madhubani Art, Thekua" },
              { state: "Uttar Pradesh", villages: ["Varanasi", "Gorakhpur", "Moradabad"], specialty: "Brass Work, Pottery" },
              { state: "Rajasthan", villages: ["Jaipur", "Jodhpur", "Bagru"], specialty: "Block Printing, Textiles" },
            ].map((region) => (
              <div key={region.state} className="p-6 border border-border rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-xl font-semibold">{region.state}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Villages: {region.villages.join(", ")}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Specialty:</span> {region.specialty}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Join Our Mission
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Whether you're an artisan looking to share your craft or a conscious 
            consumer seeking authentic products, you're welcome here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="mustard" size="xl">
              Shop Now
            </Button>
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
