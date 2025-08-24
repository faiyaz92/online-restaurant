import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+1234567890" className="hover:text-primary transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:support@easy2solutions.com" className="hover:text-primary transition-colors">
                  support@easy2solutions.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>123 Commerce St, Tech City, TC 12345, USA</span>
              </li>
            </ul>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="hover:text-primary transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/cart')}
                  className="hover:text-primary transition-colors"
                >
                  Cart
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/orders')}
                  className="hover:text-primary transition-colors"
                >
                  Orders
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contact-us')}
                  className="hover:text-primary transition-colors"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Call to Action */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
            <p className="text-sm mb-4">
              Have questions? Reach out to us anytime!
            </p>
            <a
              href="tel:+1234567890"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto px-6 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Now
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm">
          <p>Powered by <a href="https://easy2solutions.com" className="text-primary hover:underline">Easy2Solutions</a></p>
          <p className="mt-2">&copy; {new Date().getFullYear()} Easy2Solutions. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};