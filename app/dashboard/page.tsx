'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface Member {
  id: string;
  name: string;
  total_earned: number;
  total_transactions: number;
}

interface RecentTransaction {
  id: string;
  activity_name: string;
  total_amount: number;
  date: string;
  members: string[];
}

export default function DashboardPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const { data: membersData } = await supabase
        .from('members')
        .select('*')
        .order('name');

      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('id, activity_name, total_amount, date, members')
        .order('created_at', { ascending: false })
        .limit(5);

      if (membersData) setMembers(membersData);
      if (transactionsData) setRecentTransactions(transactionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Ringkasan pendapatan carry/raid</p>
        </div>
        <Link href="/dashboard/add">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Transaksi
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {members.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <CardTitle className="text-lg">{member.name}</CardTitle>
              <CardDescription>Total Pendapatan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-blue-600">
                  Rp {member.total_earned.toLocaleString('id-ID')}
                </p>
                <p className="text-sm text-slate-600">
                  {member.total_transactions} transaksi
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
          <CardDescription>5 transaksi terakhir yang tercatat</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Belum ada transaksi</p>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium text-slate-900">{transaction.activity_name}</p>
                    <p className="text-sm text-slate-600">
                      {transaction.members.join(', ')} • {new Date(transaction.date).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <p className="font-semibold text-slate-900">
                    Rp {transaction.total_amount.toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
