import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseProducts } from '@/hooks/useFirebaseProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/shopping/Header';
import { Footer } from '@/components/shopping/Footer';
import { useAuth } from '@/contexts/AuthContext';

export const ProductsPage: React.FC = () => {
  const { products, loading, error } = useFirebaseProducts();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 text-gray-200">
        <p>Error loading products: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 text-gray-200 flex flex-col">
      <Header
        onLogin={handleLogin}
        onLogout={logout}
        onAdminClick={() => navigate('/admin')}
        onOrdersClick={handleOrdersClick}
      />
      <div className="container mx-auto px-4 py-12 flex-grow">
        <h1 className="text-3xl font-bold text-center mb-8">Our Products</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.productId} className="bg-background border-border">
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <p className="text-sm text-muted-foreground">{product.description}</p>
                <p className="mt-2 font-semibold">
                  ${product.discountedPrice || product.price}
                  {product.discountedPrice && (
                    <span className="line-through text-muted-foreground ml-2">${product.price}</span>
                  )}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => navigate(`/cart`)}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};