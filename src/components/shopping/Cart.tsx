// src/components/Cart.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/hooks/store/cartStore';
import { useFirebaseProducts } from '@/hooks/useFirebaseProducts';
import { Minus, Plus, Trash2, ShoppingCart, Loader2 } from 'lucide-react';

interface CartProps {
  onCheckout: () => void;
}

export const Cart: React.FC<CartProps> = ({ onCheckout }) => {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();
  const { products, loading: productsLoading } = useFirebaseProducts();
  const navigate = useNavigate();

  if (productsLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
        <p className="text-sm text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">Your cart is empty</h3>
        <p className="text-sm text-muted-foreground">Add some products to get started!</p>
      </div>
    );
  }

  const calculatedTotal = getTotalPrice(products);
  const finalTotal = calculatedTotal + 5 + calculatedTotal * 0.1;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {items.map((item) => {
          const product = products.find((p) => p.productId === item.productId);
          const price = Number(product?.discountedPrice || product?.price || item.price) || 0;
          const itemTotal = price * item.quantity;

          return (
            <Card key={item.productId} className="p-4">
              <div className="flex items-center space-x-4">
                <img
                  src={item.image || '/placeholder.svg'}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">₹{Number(price).toFixed(2)}</p>
                  {product?.stock !== undefined && product.stock <= 10 && (
                    <Badge variant="destructive">Only {product.stock} left</Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    disabled={product?.stock !== undefined && item.quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(item.productId)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{Number(itemTotal).toFixed(2)}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span>₹{Number(calculatedTotal).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Shipping:</span>
          <span>₹5.00</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax (10%):</span>
          <span>₹{Number(calculatedTotal * 0.1).toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg pt-2 border-t">
          <span>Total:</span>
          <span>₹{Number(finalTotal).toFixed(2)}</span>
        </div>
      </div>
      <Button
        onClick={onCheckout}
        className="w-full"
        size="lg"
        disabled={items.length === 0}
      >
        Proceed to Checkout
      </Button>
    </div>
  );
};