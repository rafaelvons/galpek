'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Member {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  activity_name: string;
  date: string;
  total_amount: number;
  per_person: number;
  members: string[];
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      // Ambil semua member
      const { data: membersData } = await supabase
        .from("members")
        .select("id, name")
        .order("name");

      // Ambil semua transaksi
      const { data: transactionData } = await supabase
        .from("transactions")
        .select("id, activity_name, date, total_amount, per_person, members")
        .order("created_at", { ascending: false });

      if (membersData) setMembers(membersData);
      if (transactionData) setTransactions(transactionData);

      if (membersData && membersData.length > 0) {
        setSelectedMemberId(membersData[0].id); // default pilih pertama
      }

    } finally {
      setLoading(false);
    }
  }

  // ================================
  // COMPUTE TOTAL PER MEMBER
  // ================================
  const computedMembers = members.map((member) => {
    const related = transactions.filter((t) => t.members.includes(member.id));

    const totalEarned = related.reduce((sum, t) => sum + t.per_person, 0);
    const totalTransactions = related.length;

    return {
      ...member,
      totalEarned,
      totalTransactions,
    };
  });

  // detail per member yang dipilih
  const selectedMember = computedMembers.find(m => m.id === selectedMemberId);
  const selectedHistory = transactions.filter(t => t.members.includes(selectedMemberId!));

  // statistik aktivitas
  const activityStats = (() => {
    const stats: Record<string, { count: number; total: number }> = {};

    selectedHistory.forEach((t) => {
      if (!stats[t.activity_name]) {
        stats[t.activity_name] = { count: 0, total: 0 };
      }
      stats[t.activity_name].count++;
      stats[t.activity_name].total += t.per_person;
    });

    return Object.entries(stats).map(([name, s]) => ({
      name,
      count: s.count,
      total: s.total,
    }));
  })();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pendapatan Anggota</h1>
        <p className="text-slate-600">Detail pendapatan per anggota berdasarkan transaksi</p>
      </div>

      {/* MEMBER LIST */}
      <div className="grid gap-6 md:grid-cols-3">
        {computedMembers.map((member) => (
          <Card
            key={member.id}
            onClick={() => setSelectedMemberId(member.id)}
            className={`cursor-pointer transition-all ${
              selectedMemberId === member.id ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"
            }`}
          >
            <CardHeader>
              <CardTitle>{member.name}</CardTitle>
              <CardDescription>Total Pendapatan</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                Rp {member.totalEarned.toLocaleString("id-ID")}
              </p>
              <p className="text-sm text-slate-600">
                {member.totalTransactions} transaksi
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DETAILS */}
      {selectedMember && (
        <Card>
          <CardHeader>
            <CardTitle>Detail: {selectedMember.name}</CardTitle>
            <CardDescription>Riwayat & statistik aktivitas</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="history">
              <TabsList>
                <TabsTrigger value="history">Riwayat Transaksi</TabsTrigger>
                <TabsTrigger value="stats">Statistik Aktivitas</TabsTrigger>
              </TabsList>

              {/* TAB RIWAYAT */}
              <TabsContent value="history" className="mt-4">
                {selectedHistory.length === 0 ? (
                  <p className="text-center text-slate-500 py-6">Tidak ada transaksi</p>
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
                      {selectedHistory.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>{new Date(t.date).toLocaleDateString("id-ID")}</TableCell>
                          <TableCell>{t.activity_name}</TableCell>
                          <TableCell className="text-right">
                            Rp {t.total_amount.toLocaleString("id-ID")}
                          </TableCell>
                          <TableCell className="text-right text-blue-600">
                            Rp {t.per_person.toLocaleString("id-ID")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* TAB STATISTIK */}
              <TabsContent value="stats" className="mt-4">
                {activityStats.length === 0 ? (
                  <p className="text-center text-slate-500 py-6">Tidak ada data</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Aktivitas</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                        <TableHead className="text-right">Total Pendapatan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activityStats.map((stat) => (
                        <TableRow key={stat.name}>
                          <TableCell>{stat.name}</TableCell>
                          <TableCell className="text-right">{stat.count}x</TableCell>
                          <TableCell className="text-right text-blue-600">
                            Rp {stat.total.toLocaleString("id-ID")}
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
