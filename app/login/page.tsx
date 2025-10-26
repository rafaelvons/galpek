'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp } from '@/lib/supabase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;

        toast({
          title: 'Login berhasil',
          description: 'Selamat datang kembali!',
        });
        router.push('/dashboard');
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;

        toast({
          title: 'Registrasi berhasil',
          description: 'Akun Anda telah dibuat. Silakan login.',
        });
        setMode('login');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {mode === 'login' ? 'Login' : 'Register'}
          </CardTitle>
          <CardDescription className="text-center">
            {mode === 'login'
              ? 'Masuk ke sistem carry/raid tracker'
              : 'Buat akun baru untuk akses sistem'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : mode === 'login' ? 'Login' : 'Register'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {mode === 'login' ? (
              <p>
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Register
                </button>
              </p>
            ) : (
              <p>
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
