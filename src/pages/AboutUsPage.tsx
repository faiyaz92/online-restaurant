import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/shopping/Header';
import { Footer } from '@/components/shopping/Footer';
import { useAuth } from '@/contexts/AuthContext';

export const AboutUs: React.FC = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 text-gray-200 flex flex-col">
      <Header
        onLogin={handleLogin}
        onLogout={logout}
        onAdminClick={() => navigate('/admin')}
        onOrdersClick={handleOrdersClick}
      />
      <div className="container mx-auto px-4 py-12 flex-grow">
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">About ABC Store</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg">
              Welcome to ABC Store, your one-stop destination for quality products and exceptional service. 
              Founded in 2020, we strive to bring you the best shopping experience with a wide range of 
              products tailored to your needs.
            </p>
            <p>
              Our mission is to provide high-quality goods at affordable prices while maintaining 
              excellent customer service. Whether you're looking for everyday essentials or unique 
              items, we have something for everyone.
            </p>
            <p>
              At ABC Store, we believe in building trust and fostering long-term relationships with 
              our customers. Our team is dedicated to ensuring your satisfaction, and we are always 
              here to assist you.
            </p>
            <div className="flex justify-center">
              <Button
                onClick={() => navigate('/contact-us')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Contact Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};