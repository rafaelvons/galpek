'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Plus, History, Users, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { signOut } from '@/lib/supabase/auth';
import { useToast } from '@/hooks/use-toast';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Tambah Transaksi', href: '/dashboard/add', icon: Plus },
  { name: 'Riwayat Transaksi', href: '/dashboard/history', icon: History },
  { name: 'Pendapatan Anggota', href: '/dashboard/members', icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Logout berhasil',
      description: 'Sampai jumpa!',
    });
    router.push('/login');
  };

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-slate-800">
        <h1 className="text-xl font-bold">Carry/Raid Tracker</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-800 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
