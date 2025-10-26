'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Member {
  id: string;
  name: string;
  total_earned: number;
  total_transactions: number;
}

interface MemberTransaction {
  transaction_id: string;
  amount: number;
  transactions: {
    activity_name: string;
    date: string;
    total_amount: number;
  };
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [memberTransactions, setMemberTransactions] = useState<MemberTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (selectedMember) {
      fetchMemberTransactions(selectedMember);
    }
  }, [selectedMember]);

  async function fetchMembers() {
    try {
      const { data } = await supabase
        .from('members')
        .select('*')
        .order('name');

      if (data) {
        setMembers(data);
        if (data.length > 0 && !selectedMember) {
          setSelectedMember(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMemberTransactions(memberId: string) {
  try {
    const { data } = await supabase
      .from('member_transactions')
      .select(`
        transaction_id,
        amount,
        transactions (
          activity_name,
          date,
          total_amount
        )
      `)
      .eq('member_id::uuid', memberId)  // <- cast ke uuid
      .order('created_at', { ascending: false });

    if (data) {
      setMemberTransactions(data as any);
    }
  } catch (error) {
    console.error('Error fetching member transactions:', error);
  }
}


  const getActivityStats = () => {
    const stats: { [key: string]: { count: number; total: number } } = {};

    memberTransactions.forEach((mt) => {
      const activityName = mt.transactions.activity_name;
      if (!stats[activityName]) {
        stats[activityName] = { count: 0, total: 0 };
      }
      stats[activityName].count += 1;
      stats[activityName].total += mt.amount;
    });

    return Object.entries(stats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const currentMember = members.find((m) => m.id === selectedMember);
  const activityStats = getActivityStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Pendapatan Anggota</h1>
        <p className="text-slate-600 mt-1">Detail pendapatan per anggota dan aktivitas</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {members.map((member) => (
          <Card
            key={member.id}
            className={`cursor-pointer transition-all ${
              selectedMember === member.id
                ? 'ring-2 ring-blue-500 shadow-lg'
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedMember(member.id)}
          >
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

      {currentMember && (
        <Card>
          <CardHeader>
            <CardTitle>Detail: {currentMember.name}</CardTitle>
            <CardDescription>Riwayat dan statistik pendapatan</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="history" className="w-full">
              <TabsList>
                <TabsTrigger value="history">Riwayat Transaksi</TabsTrigger>
                <TabsTrigger value="stats">Statistik Aktivitas</TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="mt-4">
                {memberTransactions.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">Belum ada transaksi</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Aktivitas</TableHead>
                        <TableHead className="text-right">Total Transaksi</TableHead>
                        <TableHead className="text-right">Pendapatan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {memberTransactions.map((mt) => (
                        <TableRow key={mt.transaction_id}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(mt.transactions.date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="font-medium">
                            {mt.transactions.activity_name}
                          </TableCell>
                          <TableCell className="text-right text-slate-600">
                            Rp {mt.transactions.total_amount.toLocaleString('id-ID')}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-blue-600">
                            Rp {mt.amount.toLocaleString('id-ID')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="stats" className="mt-4">
                {activityStats.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">Belum ada data</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Aktivitas</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                        <TableHead className="text-right">Total Pendapatan</TableHead>
                        <TableHead className="text-right">Rata-rata</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activityStats.map((stat) => (
                        <TableRow key={stat.name}>
                          <TableCell className="font-medium">{stat.name}</TableCell>
                          <TableCell className="text-right">{stat.count}x</TableCell>
                          <TableCell className="text-right font-semibold text-blue-600">
                            Rp {stat.total.toLocaleString('id-ID')}
                          </TableCell>
                          <TableCell className="text-right text-slate-600">
                            Rp {Math.round(stat.total / stat.count).toLocaleString('id-ID')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
