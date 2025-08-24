import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/hooks/store/cartStore';
import { useFirebaseProducts } from '@/hooks/useFirebaseProducts';
import { Minus, Plus, Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import { Header } from '@/components/shopping/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/types/product';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalTax } = useCartStore();
  const { products, loading: productsLoading } = useFirebaseProducts();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleOrdersClick = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    navigate('/orders');
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header
          onLogin={handleLogin}
          onLogout={logout}
          onAdminClick={() => navigate('/admin')}
          onOrdersClick={handleOrdersClick}
        />
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header
          onLogin={handleLogin}
          onLogout={logout}
          onAdminClick={() => navigate('/admin')}
          onOrdersClick={handleOrdersClick}
        />
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">Your cart is empty</h3>
          <p className="text-sm text-muted-foreground">Add some products to get started!</p>
          <Button
            onClick={() => navigate('/')}
            className="mt-4"
            variant="outline"
          >
            Back to Store
          </Button>
        </div>
      </div>
    );
  }

  const subtotalWithoutTax = getTotalPrice(products);
  const totalTax = getTotalTax(products);
  const shipping = 5;
  const finalTotal = subtotalWithoutTax + totalTax + shipping;
  const subtotalWithoutDiscount = items.reduce((total, item) => {
    const product = products.find((p) => p.productId === item.productId);
    const price = Number(product?.price || item.price) || 0;
    return total + price * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header
        onLogin={handleLogin}
        onLogout={logout}
        onAdminClick={() => navigate('/admin')}
        onOrdersClick={handleOrdersClick}
      />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          Shopping Cart
        </h2>
        <div className="space-y-4">
          <div className="space-y-3">
            {items.map((item) => {
              const product = products.find((p) => p.productId === item.productId);
              const price = Number(product?.discountedPrice || product?.price || item.price) || 0;
              const taxRate = product?.taxRate || 0;
              const taxAmount = price * item.quantity * (taxRate / 100);
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
                      {taxRate > 0 && (
                        <p className="text-sm text-muted-foreground">Tax: {taxRate}% (₹{Number(taxAmount).toFixed(2)})</p>
                      )}
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
              <span>Subtotal (without discount):</span>
              <span>₹{Number(subtotalWithoutDiscount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Subtotal (with discount):</span>
              <span>₹{Number(subtotalWithoutTax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Tax:</span>
              <span>₹{Number(totalTax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping:</span>
              <span>₹{Number(shipping).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Final Total:</span>
              <span>₹{Number(finalTotal).toFixed(2)}</span>
            </div>
          </div>
          <Button
            onClick={handleCheckout}
            className="w-full"
            size="lg"
            disabled={items.length === 0}
          >
            Proceed to Checkout
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="w-full"
            variant="outline"
            size="lg"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
};