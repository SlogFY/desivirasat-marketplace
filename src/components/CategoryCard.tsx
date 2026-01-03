import { Link } from "react-router-dom";
import { Category } from "@/types";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link
      to={`/shop?category=${category.id}`}
      className="group relative overflow-hidden rounded-2xl aspect-[4/5] block"
    >
      {/* Background Image */}
      <img
        src={category.image}
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-background">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-background/70 mb-1">
              {category.productCount} Products
            </p>
            <h3 className="font-display text-2xl font-bold mb-1">
              {category.name}
            </h3>
            {category.nameHindi && (
              <p className="text-sm text-background/80">{category.nameHindi}</p>
            )}
          </div>
          <div className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-secondary group-hover:text-secondary-foreground transition-all duration-300">
            <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
