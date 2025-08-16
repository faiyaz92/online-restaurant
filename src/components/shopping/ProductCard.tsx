import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick }) => {
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  const discount = product.discountedPrice 
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-card"
      onClick={() => onProductClick(product)}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
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
        
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className="h-3 w-3 fill-yellow-400 text-yellow-400" 
                />
              ))}
            </div>
            <span>(4.5)</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {product.discountedPrice ? (
                  <>
                    <span className="font-bold text-primary">
                      ${Number(product.discountedPrice).toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      ${Number(product.price).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="font-bold text-primary">
                    ${Number(product.price).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            
            <Button 
              size="sm" 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};