import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, MapPin, Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
  const cartItem = cartItems.find((item) => item.product.id === product.id);
  const quantity = cartItem?.quantity || 0;

  return (
    <div className="group bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-warm transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.originalPrice && (
          <div className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-full">
            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
            <span className="bg-background text-foreground px-4 py-2 rounded-lg font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category & Location */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="uppercase tracking-wide">{product.category}</span>
          {product.village && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {product.village}
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={`/product/${product.id}`}>
          <h3 className="font-display font-semibold text-lg leading-tight hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.nameHindi && (
            <p className="text-xs text-muted-foreground mt-0.5">{product.nameHindi}</p>
          )}
        </Link>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-secondary text-secondary" />
              <span className="text-sm font-medium">{product.rating}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviews} reviews)
            </span>
          </div>
        )}

        {/* Artisan */}
        {product.artisan && (
          <p className="text-xs text-muted-foreground">
            By <span className="text-foreground">{product.artisan}</span>
          </p>
        )}

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
          {quantity > 0 ? (
            <div className="flex items-center gap-1 bg-secondary rounded-lg overflow-hidden">
              <button
                className="p-2 hover:bg-secondary/80 transition-colors text-secondary-foreground"
                onClick={() => {
                  if (quantity === 1) {
                    removeFromCart(product.id);
                  } else {
                    updateQuantity(product.id, quantity - 1);
                  }
                }}
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-sm font-bold text-secondary-foreground min-w-[24px] text-center">
                {quantity}
              </span>
              <button
                className="p-2 hover:bg-secondary/80 transition-colors text-secondary-foreground"
                onClick={() => updateQuantity(product.id, quantity + 1)}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="mustard"
              onClick={() => addToCart(product)}
              disabled={!product.inStock}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
