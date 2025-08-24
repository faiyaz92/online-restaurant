import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ShoppingCart, Heart, User, LogOut, Settings, Package, Menu, X } from 'lucide-react';
import { useCartStore } from '@/hooks/store/cartStore';
import { useUserInfo } from '@/hooks/useUserInfo';
import { Role } from '@/types/auth';

interface HeaderProps {
  onLogin: () => void;
  onLogout: () => void;
  onAdminClick?: () => void;
  onOrdersClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLogin,
  onLogout,
  onAdminClick,
  onOrdersClick,
}) => {
  const { getTotalItems } = useCartStore();
  const userInfo = useUserInfo();
  const totalItems = getTotalItems();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about-us' },
    { name: 'Our Products', path: '/products' },
    { name: 'Contact Us', path: '/contact-us' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-blue-950 to-gray-900 text-gray-200 border-b border-blue-900">
      <div className="container mx-auto px-3 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-700 rounded-md flex items-center justify-center">
            <Package className="h-5 w-5 text-blue-100" />
          </div>
          <span className="font-bold text-lg">ABC Store</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => navigate(link.path)}
              className="text-base font-medium hover:text-blue-300 transition-colors"
            >
              {link.name}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Button
            variant="ghost"
            size="sm"
            className="relative text-gray-200 hover:text-blue-300"
            onClick={() => navigate('/cart')}
            aria-label="View cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {totalItems}
              </Badge>
            )}
          </Button>

          {/* Wishlist */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-200 hover:text-blue-300"
            onClick={() => navigate('/wishlist')}
            aria-label="View wishlist"
          >
            <Heart className="h-5 w-5" />
          </Button>

          {/* User Dropdown */}
          {userInfo.isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="User menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={userInfo.userName} />
                    <AvatarFallback className="bg-blue-800 text-blue-100">
                      {userInfo.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-blue-950 text-gray-200 border-blue-900" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{userInfo.userName}</p>
                    <p className="text-xs text-gray-400">{userInfo.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-blue-900" />
                <DropdownMenuItem
                  className="hover:bg-blue-900 focus:bg-blue-900"
                  onClick={() => navigate('/profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="hover:bg-blue-900 focus:bg-blue-900"
                  onClick={onOrdersClick}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Orders
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="hover:bg-blue-900 focus:bg-blue-900"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                {(userInfo.role === Role.COMPANY_ADMIN || userInfo.role === Role.SUPER_ADMIN) && onAdminClick && (
                  <>
                    <DropdownMenuSeparator className="bg-blue-900" />
                    <DropdownMenuItem
                      className="hover:bg-blue-900 focus:bg-blue-900"
                      onClick={onAdminClick}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator className="bg-blue-900" />
                <DropdownMenuItem
                  className="hover:bg-blue-900 focus:bg-blue-900"
                  onClick={onLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={onLogin}
              size="sm"
              className="h-9 rounded-md bg-blue-700 text-blue-100 hover:bg-blue-600"
            >
              Sign In
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-gray-200 hover:text-blue-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-controls="mobile-menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div id="mobile-menu" className="lg:hidden bg-gradient-to-b from-blue-950 to-gray-900 border-t border-blue-900">
          <div className="container mx-auto px-3 py-4 flex flex-col space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => {
                  navigate(link.path);
                  setIsMobileMenuOpen(false);
                }}
                className="text-base font-medium text-gray-200 hover:text-blue-300 transition-colors text-left"
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};