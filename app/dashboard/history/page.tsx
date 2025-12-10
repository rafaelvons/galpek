'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  activity_name: string;
  total_amount: number;
  split_type: number;
  per_person: number;
  members: string[];
  notes: string | null;
  date: string;
  created_at: string;
}

interface Member {
  id: string;
  name: string;
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
    fetchTransactions();
  }, []);

  async function fetchMembers() {
    const { data, error } = await supabase.from("members").select("id, name");

    if (!error) setMembers(data || []);
  }

  async function fetchTransactions() {
    try {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Transaksi dihapus',
        description: 'Data transaksi berhasil dihapus',
      });

      fetchTransactions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }

  const getSplitLabel = (split: number) => {
    if (split === 1) return 'Sendiri';
    return `Bagi ${split}`;
  };

  // 🔥 Convert UUID ke Nama
  const idToName = (id: string) => {
    return members.find((m) => m.id === id)?.name || "Unknown";
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Riwayat Transaksi</h1>
        <p className="text-slate-600 mt-1">Semua transaksi carry/raid yang telah dicatat</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
          <CardDescription>Total {transactions.length} transaksi tercatat</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Belum ada transaksi</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Aktivitas</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Pembagian</TableHead>
                    <TableHead className="text-right">Per Orang</TableHead>
                    <TableHead>Anggota</TableHead>
                    <TableHead>Catatan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>

                      <TableCell className="font-medium">{t.activity_name}</TableCell>

                      <TableCell className="text-right">
                        Rp {t.total_amount.toLocaleString('id-ID')}
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary">{getSplitLabel(t.split_type)}</Badge>
                      </TableCell>

                      <TableCell className="text-right font-medium text-blue-600">
                        Rp {t.per_person.toLocaleString('id-ID')}
                      </TableCell>

                      {/* 🔥 Tampilkan nama, bukan UUID */}
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {t.members.map((id) => (
                            <Badge key={id} variant="outline" className="text-xs">
                              {idToName(id)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>

                      <TableCell className="max-w-xs truncate text-sm text-slate-600">
                        {t.notes || '-'}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(t.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
