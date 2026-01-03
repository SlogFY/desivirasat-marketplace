import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-lg">द</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">Desi Virasat</h3>
                <p className="text-xs text-background/60">देसी विरासत</p>
              </div>
            </div>
            <p className="text-sm text-background/70 leading-relaxed">
              Preserving India's rural heritage by connecting village artisans with conscious buyers. Every purchase supports a family, a tradition, a story.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { name: "Shop All", path: "/shop" },
                { name: "About Us", path: "/about" },
                { name: "Our Artisans", path: "/about#artisans" },
                { name: "Sell Your Product", path: "/help#sell" },
                { name: "Track Order", path: "/help#track" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              {[
                "Desi Food",
                "Handicrafts",
                "Pottery & Terracotta",
                "Textiles",
                "Home Décor",
              ].map((category) => (
                <li key={category}>
                  <Link
                    to={`/shop?category=${category.toLowerCase()}`}
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-secondary" />
                <span className="text-sm text-background/70">
                  Village Artisan Hub, Patna,<br />Bihar 800001, India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-secondary" />
                <a href="tel:+919876543210" className="text-sm text-background/70 hover:text-background">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-secondary" />
                <a href="mailto:namaste@desivirasat.store" className="text-sm text-background/70 hover:text-background">
                  namaste@desivirasat.store
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/50">
            <p>© 2024 Desi Virasat. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/privacy" className="hover:text-background">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-background">Terms of Service</Link>
              <Link to="/shipping" className="hover:text-background">Shipping Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
