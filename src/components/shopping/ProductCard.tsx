import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Minus, Plus, Star } from 'lucide-react';
import { Product } from '@/types/product';
import { useCartStore } from '@/hooks/store/cartStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick }) => {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const cartItem = items.find((item) => item.productId === product.productId);
  const isInCart = !!cartItem;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleUpdateQuantity = (e: React.MouseEvent, newQuantity: number) => {
    e.stopPropagation();
    if (newQuantity <= 0) {
      removeItem(product.productId);
      toast.success(`${product.name} removed from cart!`);
    } else {
      updateQuantity(product.productId, newQuantity);
      toast.success(`Updated ${product.name} quantity to ${newQuantity}!`);
    }
  };

  const discount = product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-card flex flex-col"
      onClick={() => onProductClick(product)}
    >
      <CardContent className="p-0 flex flex-col flex-1">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
              {discount}% OFF
            </Badge>
          )}

          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              toast.success('Added to wishlist!');
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>

          {product.stock <= 10 && product.stock > 0 && (
            <Badge variant="outline" className="absolute bottom-2 left-2 bg-white/90">
              Only {product.stock} left
            </Badge>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 space-y-2 flex flex-col flex-1">
          {/* First Row: Name (Left-Aligned) and Rating (Right-Aligned), Top-Aligned */}
          <div className="flex justify-between items-start gap-4">
            <h3 className="font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors w-[48%] self-start leading-tight">
              {product.name}
            </h3>
            <div className="flex items-start gap-1 text-[0.65rem] sm:text-xs text-muted-foreground w-[48%] justify-end self-start">
              <div className="flex items-start mt-[6px]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <div className="flex items-start mt-[3px]">
                <span className="self-start">(4.5)</span>
              </div>

            </div>
          </div>

          {/* Second Row: Prices (Right-Aligned) */}
          <div className="flex justify-end items-center gap-2">
            <span className="font-bold text-primary text-sm sm:text-base">
              ${Number(product.discountedPrice || product.price).toFixed(2)}
            </span>
            {product.discountedPrice && (
              <span className="text-xs sm:text-sm text-muted-foreground line-through">
                ${Number(product.price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Spacer to push buttons to bottom */}
          <div className="flex-1"></div>

          {/* Third Row: Add to Cart or Quantity Controls (Stuck to Bottom) */}
          {isInCart ? (
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleUpdateQuantity(e, cartItem.quantity - 1)}
                disabled={cartItem.quantity <= 1}
                className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
              >
                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <span className="flex-1 text-center text-sm sm:text-base font-medium">
                {cartItem.quantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleUpdateQuantity(e, cartItem.quantity + 1)}
                disabled={product.stock !== undefined && cartItem.quantity >= product.stock}
                className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full h-8 sm:h-9 text-xs sm:text-sm"
            >
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Add to Cart
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};