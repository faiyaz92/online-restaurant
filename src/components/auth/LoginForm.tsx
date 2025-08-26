import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserInfo } from '@/hooks/useUserInfo';
import { useSignUp } from '@/hooks/useSignup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Eye, EyeOff, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Role, UserType } from '@/types/auth';

const GoogleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mr-2"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="currentColor"
    />
    <path
      d="M12 23c2.97 0 5.46-1.01 7.28-2.73l-3.57-2.77c-1.01.68-2.29 1.08-3.71 1.08-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4.01 20.36 7.74 23 12 23z"
      fill="currentColor"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="currentColor"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.74 1 4.01 3.64 2.18 7.07l3.66 2.84c.87-2.60 3.3-4.53 6.16-4.53z"
      fill="currentColor"
    />
  </svg>
);

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const { currentUser, login, resetPassword } = useAuth();
  const { signUpWithGoogle } = useSignUp();
  const userInfo = useUserInfo();
  const navigate = useNavigate();

  // Effect to handle redirect after userInfo updates
   useEffect(() => {
  if (currentUser && userInfo.isAuthenticated && !userInfo.loading) {
    // Add a small delay to ensure all state is updated
    const timer = setTimeout(() => {
      console.log('Redirecting based on userType:', userInfo.userType);
      if (userInfo.userType === UserType.Customer) {
        navigate('/', { replace: true });
      } else if (userInfo.userType === UserType.Employee) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }
}, [currentUser, userInfo.isAuthenticated, userInfo.userType, userInfo.loading, navigate]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      console.log('Email login successful, currentUser:', !!currentUser, 'userInfo:', userInfo);
      toast.success('Login successful!');
      // No manual set loading here - context handles it
    } catch (error: any) {
      console.error('Login error:', error.message, error.code, error.stack);
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      console.log('Password reset email sent');
      toast.success('Password reset email sent! Check your inbox.');
      setShowResetPassword(false);
    } catch (error: any) {
      console.error('Password reset error:', error.message, error.code, error.stack);
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signUpWithGoogle();
      console.log('Google sign-in successful, currentUser:', !!currentUser, 'userInfo:', userInfo);
      toast.success('Google sign-in successful!');
      // No manual set loading here - context handles it
    } catch (error: any) {
      console.error('Google sign-in error:', error.message, error.code, error.stack);
      let errorMessage = 'Google sign-in failed. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in cancelled.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'Account exists with a different sign-in method.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading UI while user info is being fetched
  if (userInfo.loading && currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary p-4">
        <Card className="w-full max-w-md shadow-elevation">
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading user information...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary p-4">
      <Card className="w-full max-w-md shadow-elevation">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <ShoppingCart className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Shopping Cart Admin</CardTitle>
          <CardDescription>
            {showResetPassword ? 'Reset your password' : 'Sign in to your admin account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={showResetPassword ? handleResetPassword : handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            {!showResetPassword && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {showResetPassword ? 'Sending...' : 'Signing in...'}
                  </>
                ) : (
                  showResetPassword ? 'Send Reset Email' : 'Sign In'
                )}
              </Button>

              {!showResetPassword ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setShowResetPassword(true)}
                    disabled={loading}
                  >
                    Forgot your password?
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full border border-gray-600 hover:bg-gray-800 flex items-center justify-center"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    <GoogleIcon />
                    Sign In with Google
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate('/signup')}
                    disabled={loading}
                  >
                    Create an Account
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowResetPassword(false)}
                  disabled={loading}
                >
                  Back to Sign In
                </Button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center space-x-1">
              <AlertCircle className="h-4 w-4" />
              <span>Demo credentials: admin@example.com / password</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;