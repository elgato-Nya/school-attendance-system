/**
 * Login page component
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { login, getAuthErrorMessage } from '@/services/auth.service';
import { validateEmail } from '@/utils/validators';
import { SCHOOL_NAME } from '@/utils/constants';
import { useAuth } from '@/hooks/useAuth';

export function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/teacher/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-accent/5">
        <div className="text-center space-y-6">
          {/* School Icon */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-elevation-lg flex items-center justify-center animate-pulse">
            <span className="text-4xl">🎓</span>
          </div>

          {/* Spinner */}
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-muted border-t-primary mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-primary/20"></div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">{SCHOOL_NAME}</p>
            <p className="text-sm text-muted-foreground">Initializing attendance system...</p>
          </div>

          {/* Loading Animation Dots */}
          <div className="flex gap-1.5 justify-center">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Invalid email');
      return;
    }

    // Validate password
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);

    try {
      const { user } = await login(email, password);

      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/teacher/dashboard', { replace: true });
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-elevation-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-elevation-md flex items-center justify-center">
            <span className="text-3xl">🎓</span>
          </div>
          <CardTitle className="text-2xl font-bold">{SCHOOL_NAME}</CardTitle>
          <CardDescription>Attendance Management System</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="shadow-elevation-sm">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="teacher@school.edu.my"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button type="submit" variant="accent" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Need help? Contact your administrator.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
