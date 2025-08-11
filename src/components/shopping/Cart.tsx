import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types/product';

interface CartProps {
  products: Product[];
  onCheckout: () => void;
}

export const Cart: React.FC<CartProps> = ({ products, onCheckout }) => {
  const { items, updateQuantity, removeItem, getTotalItems, getTotalPrice } = useCartStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice(products);

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground text-sm">
            Add some products to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Shopping Cart</span>
          <Badge variant="secondary">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => {
          const product = products.find(p => p.productId === item.productId);
          if (!product) return null;

          const price = product.discountedPrice || product.price;
          const subtotal = price * item.quantity;

          return (
            <div key={item.productId} className="flex gap-3">
              <img
                src={product.images[0] || "/placeholder.svg"}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-md"
              />
              
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-sm line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      ${price.toFixed(2)} each
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.productId)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <span className="font-semibold text-sm">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        
        <Separator />
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>${(totalPrice * 0.08).toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${(totalPrice * 1.08).toFixed(2)}</span>
          </div>
        </div>
        
        <Button 
          onClick={onCheckout} 
          className="w-full" 
          size="lg"
        >
          Proceed to Checkout
        </Button>
      </CardContent>
    </Card>
  );
};