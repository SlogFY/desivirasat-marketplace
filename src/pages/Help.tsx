import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Upload, HelpCircle, Package, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Help = () => {
  const [activeTab, setActiveTab] = useState<"support" | "sell" | "track">("support");

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
  };

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Application Received!",
      description: "Our team will review your submission and contact you soon.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-muted/50 py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Help Center</h1>
          <p className="text-muted-foreground">
            How can we assist you today?
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {[
            { id: "support", icon: MessageCircle, label: "Get Support" },
            { id: "sell", icon: Package, label: "Sell Your Product" },
            { id: "track", icon: HelpCircle, label: "Track Order" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-warm"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Support Tab */}
        {activeTab === "support" && (
          <div className="max-w-2xl mx-auto" id="support">
            <div className="bg-card rounded-xl shadow-soft p-6 md:p-8">
              <h2 className="font-display text-2xl font-bold mb-6">Contact Support</h2>
              <form onSubmit={handleSupportSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Name</label>
                    <Input placeholder="Your name" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <Input type="email" placeholder="your@email.com" required />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Subject</label>
                  <Input placeholder="What do you need help with?" required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Message</label>
                  <Textarea
                    placeholder="Describe your issue in detail..."
                    rows={5}
                    required
                  />
                </div>
                <Button type="submit" variant="hero" className="w-full">
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Sell Tab */}
        {activeTab === "sell" && (
          <div className="max-w-2xl mx-auto" id="sell">
            <div className="bg-card rounded-xl shadow-soft p-6 md:p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-2">Become a Seller</h2>
                <p className="text-muted-foreground">
                  Share your craft with thousands of customers across India
                </p>
              </div>
              
              <form onSubmit={handleSellSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Full Name *</label>
                    <Input placeholder="Your name" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Phone Number *</label>
                    <Input type="tel" placeholder="+91 98765 43210" required />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Village/City *</label>
                    <Input placeholder="Your location" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">State *</label>
                    <Input placeholder="e.g., Bihar" required />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Type of Products *</label>
                  <Input placeholder="e.g., Handicrafts, Food items, Textiles" required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Tell us about your craft *</label>
                  <Textarea
                    placeholder="Describe what you make, how long you've been doing it, and any special techniques..."
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Upload Photos/Videos</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, MP4 up to 10MB each
                    </p>
                  </div>
                </div>
                <Button type="submit" variant="mustard" className="w-full" size="lg">
                  Submit Application
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Track Tab */}
        {activeTab === "track" && (
          <div className="max-w-xl mx-auto" id="track">
            <div className="bg-card rounded-xl shadow-soft p-6 md:p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
                <Package className="h-8 w-8 text-accent" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Track Your Order</h2>
              <p className="text-muted-foreground mb-6">
                Enter your order ID to see the current status
              </p>
              <form className="space-y-4">
                <Input
                  placeholder="Enter Order ID (e.g., DV-123456)"
                  className="text-center"
                />
                <Button variant="hero" className="w-full">
                  Track Order
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-4">
                You can find your order ID in the confirmation email
              </p>
            </div>

            {/* FAQs */}
            <div className="mt-12">
              <h3 className="font-display text-xl font-bold mb-6 text-center">
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                {[
                  {
                    q: "How long does delivery take?",
                    a: "Delivery typically takes 5-7 business days depending on your location. Remote areas may take 2-3 additional days.",
                  },
                  {
                    q: "What is your return policy?",
                    a: "We accept returns within 7 days of delivery if the product is unused and in original packaging. Food items are non-returnable.",
                  },
                  {
                    q: "Do you ship internationally?",
                    a: "Currently, we only ship within India. International shipping is coming soon!",
                  },
                ].map((faq, i) => (
                  <div key={i} className="bg-card rounded-lg p-4">
                    <h4 className="font-medium mb-2">{faq.q}</h4>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Help;
