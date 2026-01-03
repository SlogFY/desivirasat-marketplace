import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Heart, Users } from "lucide-react";
import heroImage from "@/assets/hero-crafts.jpg";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import { products, categories } from "@/data/products";

const Index = () => {
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-pattern-subtle">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Indian artisan crafts"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        </div>

        {/* Content */}
        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-fade-up">
              <Leaf className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Authentic Rural Heritage</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Bringing India's
              <span className="text-gradient block">Desi Virasat</span>
              To Your Doorstep
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Discover authentic handmade crafts and traditional delicacies, 
              sourced directly from village artisans across India. Every purchase 
              preserves a heritage, supports a family.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Link to="/shop">
                <Button variant="hero" size="xl">
                  Explore Collection
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="heroOutline" size="xl">
                  Our Story
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12 pt-8 border-t border-border/50 animate-fade-up" style={{ animationDelay: "0.4s" }}>
              {[
                { value: "500+", label: "Artisans" },
                { value: "50+", label: "Villages" },
                { value: "10k+", label: "Happy Customers" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-2xl md:text-3xl font-bold text-primary">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-primary mb-2">Browse By</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Categories</h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <p className="text-sm uppercase tracking-widest text-primary mb-2">Handpicked For You</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold">Featured Products</h2>
            </div>
            <Link to="/shop" className="mt-4 md:mt-0">
              <Button variant="outline">
                View All Products
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Why Desi Virasat?
            </h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              We're not just a marketplace. We're a bridge connecting India's rich 
              rural heritage with conscious consumers worldwide.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "100% Authentic",
                description: "Every product is handcrafted by verified artisans using traditional techniques passed down through generations.",
              },
              {
                icon: Users,
                title: "Direct Impact",
                description: "80% of your payment goes directly to the artisan. No middlemen, fair prices, real support.",
              },
              {
                icon: Leaf,
                title: "Eco-Friendly",
                description: "Natural materials, traditional methods, minimal packaging. Good for you, good for the planet.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="text-center p-8 rounded-2xl bg-primary-foreground/5 backdrop-blur-sm hover:bg-primary-foreground/10 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-primary-foreground/70 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-pattern-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Are You an Artisan?
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Join our community of rural artisans and reach customers across India. 
              Share your craft, tell your story, and earn fair income from your skills.
            </p>
            <Link to="/help#sell">
              <Button variant="mustard" size="xl">
                Sell Your Products
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
