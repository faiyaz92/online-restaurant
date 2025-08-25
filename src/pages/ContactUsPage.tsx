import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContactUs } from '@/hooks/useContactUs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/shopping/Header';
import { Footer } from '@/components/shopping/Footer';
import { useAuth } from '@/contexts/AuthContext';

export const ContactUs: React.FC = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [messageType, setMessageType] = useState<'Become Seller' | 'Other' | 'Complaint'>('Other');
  const [message, setMessage] = useState('');
  const { submitContactForm, loading, error } = useContactUs();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitContactForm({ name, mobile, email, messageType, message });
      setName('');
      setMobile('');
      setEmail('');
      setMessageType('Other');
      setMessage('');
      navigate('/');
    } catch (err) {
      console.error('Contact form submission failed:', err);
    }
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
        <Card className="max-w-lg mx-auto bg-background border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                  disabled={loading}
                  className="bg-background border-border text-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+1234567890"
                  required
                  disabled={loading}
                  className="bg-background border-border text-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className="bg-background border-border text-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="messageType">Message Type</Label>
                <Select
                  value={messageType}
                  onValueChange={(value: 'Become Seller' | 'Other' | 'Complaint') => setMessageType(value)}
                  disabled={loading}
                >
                  <SelectTrigger className="bg-background border-border text-gray-200">
                    <SelectValue placeholder="Select message type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border text-gray-200">
                    <SelectItem value="Become Seller">Become Seller</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="Complaint">Complaint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Your message..."
                  className="w-full p-2 rounded-md bg-background border border-border text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={5}
                  required
                  disabled={loading}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};