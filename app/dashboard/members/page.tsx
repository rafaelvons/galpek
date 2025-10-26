'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Interface untuk data anggota dari tabel 'members'
interface Member {
  id: string;
  name: string;
  total_earned: number;
  total_transactions: number;
}

// 💡 BERUBAH: Interface untuk riwayat transaksi
// Kita ambil langsung dari tabel 'transactions'
interface MemberHistory {
  id: string;
  activity_name: string;
  date: string;
  total_amount: number;
  per_person: number; // Menggunakan per_person, bukan amount
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  
  // 💡 BERUBAH: State untuk menyimpan data dari tabel 'transactions'
  const [memberHistory, setMemberHistory] = useState<MemberHistory[]>([]);
  
  const [loading, setLoading] = useState(true);

  // 1. Ambil data semua anggota saat halaman dimuat
  useEffect(() => {
    async function fetchMembers() {
      try {
        const { data } = await supabase
          .from('members')
          .select('*')
          .order('name');

        if (data) {
          setMembers(data);
          // Set anggota pertama sebagai default
          if (data.length > 0 && !selectedMemberId) {
            setSelectedMemberId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMembers();
  }, []); // Hanya jalan sekali

  // 2. 💡 BERUBAH: Ambil data transaksi SETIAP KALI anggota yang dipilih berubah
  useEffect(() => {
    // Pastikan kita punya ID dan daftar anggota sudah dimuat
    if (!selectedMemberId || members.length === 0) {
      return;
    }

    // Cari nama anggota berdasarkan ID yang dipilih
    const memberName = members.find((m) => m.id === selectedMemberId)?.name;

    if (!memberName) {
      console.error("Tidak bisa menemukan nama anggota untuk ID:", selectedMemberId);
      return;
    }

    // Panggil fungsi baru untuk fetch data
    fetchMemberHistory(memberName);
    
  }, [selectedMemberId, members]); // Jalankan ulang jika ID atau list anggota berubah

  // 3. 💡 FUNGSI BARU: Mengambil dari tabel 'transactions'
  async function fetchMemberHistory(memberName: string) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, activity_name, date, total_amount, per_person')
        // Gunakan filter .contains() untuk mencari NAMA di dalam array 'members'
        .contains('members', [memberName]) 
        .order('date', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setMemberHistory(data as MemberHistory[]);
      }
    } catch (error) {
      console.error('Error fetching member history:', error);
    }
  }

  // 4. 💡 BERUBAH: Fungsi statistik sekarang menggunakan 'memberHistory'
  const getActivityStats = () => {
    const stats: { [key: string]: { count: number; total: number } } = {};

    memberHistory.forEach((mt) => {
      const activityName = mt.activity_name;
      if (!stats[activityName]) {
        stats[activityName] = { count: 0, total: 0 };
      }
      stats[activityName].count += 1;
      // Gunakan 'per_person' untuk total pendapatan
      stats[activityName].total += mt.per_person; 
    });

    return Object.entries(stats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const currentMember = members.find((m) => m.id === selectedMemberId);
  const activityStats = getActivityStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Pendapatan Anggota</h1>
        <p className="text-slate-600 mt-1">Detail pendapatan per anggota dan aktivitas</p>
      </div>

      {/* Tampilan Kartu Anggota (Tidak Berubah) */}
      <div className="grid gap-6 md:grid-cols-3">
        {members.map((member) => (
          <Card
            key={member.id}
            className={`cursor-pointer transition-all ${
              selectedMemberId === member.id
                ? 'ring-2 ring-blue-500 shadow-lg'
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedMemberId(member.id)}
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

      {/* Tampilan Detail (Tabs) */}
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

              {/* 💡 BERUBAH: Tab Riwayat Transaksi */}
              <TabsContent value="history" className="mt-4">
                {memberHistory.length === 0 ? (
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
                      {memberHistory.map((mt) => (
                        <TableRow key={mt.id}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(mt.date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="font-medium">
                            {mt.activity_name}
                          </TableCell>
                          <TableCell className="text-right text-slate-600">
                            Rp {mt.total_amount.toLocaleString('id-ID')}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-blue-600">
                            {/* Gunakan 'per_person' */}
                            Rp {mt.per_person.toLocaleString('id-ID')} 
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* 💡 BERUBAH: Tab Statistik Aktivitas */}
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