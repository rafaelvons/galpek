'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { computeMembersStats } from '@/lib/computeMembers';

interface Member {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  activity_name: string;
  total_amount: number;
  per_person: number;
  date: string;
  members: string[];
}

export default function DashboardPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberNameMap, setMemberNameMap] = useState<any>({});

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      // Ambil member
      const { data: memberData } = await supabase
        .from("members")
        .select("id, name")
        .order("name");

      // Buat mapping ID → nama
      const map = Object.fromEntries(
      (memberData || []).map((m: any) => [m.id, m.name])
      );

      setMemberNameMap(map);

      // Ambil transaksi lengkap
      const { data: trxData } = await supabase
        .from("transactions")
        .select("id, activity_name, total_amount, per_person, date, members")
        .order("created_at", { ascending: false });

      setAllTransactions(trxData || []);

      // 5 transaksi terbaru
      setRecentTransactions((trxData || []).slice(0, 5));

      // Hitung pendapatan setiap member
      const computed = computeMembersStats(trxData || [], memberData || []);
      setMembers(computed);

    } finally {
      setLoading(false);
    }
  }

  // ======================================
  // EXPORT CSV
  // ======================================
  function exportExcel() {
  const ws = XLSX.utils.json_to_sheet(
    allTransactions.map((t) => ({
      Tanggal: new Date(t.date).toLocaleDateString("id-ID"),
      Aktivitas: t.activity_name,
      Total: t.total_amount,
      Per_Orang: t.per_person,
      Anggota: t.members.map(id => memberNameMap[id] || id).join(" & "),
    }))
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Transaksi");
  XLSX.writeFile(wb, "semua_transaksi.xlsx");
}


  // ======================================
  // EXPORT EXCEL
  // ======================================
  function exportCSV() {
  if (!allTransactions.length) return;

  const rows = [
    ["Tanggal", "Aktivitas", "Total", "Per Orang", "Anggota"]
  ];

  allTransactions.forEach((t) => {
    const memberNames = t.members.map(id => memberNameMap[id] || id).join(" & ");

    rows.push([
      new Date(t.date).toLocaleDateString("id-ID"),
      t.activity_name,
      t.total_amount,
      t.per_person,
      memberNames,
    ]);
  });

  const csv =
    "data:text/csv;charset=utf-8," +
    rows.map((r) => r.join(",")).join("\n");

  const link = document.createElement("a");
  link.href = encodeURI(csv);
  link.download = "semua_transaksi.csv";
  link.click();
}


  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-slate-600 mt-1">Ringkasan pendapatan carry/raid</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={exportCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>

          <Button onClick={exportExcel} variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export Excel
          </Button>

          <Link href="/dashboard/add">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Tambah Transaksi
            </Button>
          </Link>
        </div>
      </div>

      {/* SUMMARY PER MEMBER */}
      <div className="grid gap-6 md:grid-cols-3">
        {members.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <CardTitle className="text-lg">{member.name}</CardTitle>
              <CardDescription>Total Pendapatan</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                Rp {member.total_earned.toLocaleString("id-ID")}
              </p>
              <p className="text-sm text-slate-600">
                {member.total_transactions} transaksi
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* TRANSAKSI TERBARU */}
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
          <CardDescription>5 transaksi terakhir</CardDescription>
        </CardHeader>

        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              Belum ada transaksi
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((t) => (
                <div 
                  key={t.id}
                  className="flex justify-between items-center border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">{t.activity_name}</p>
                    <p className="text-sm text-slate-600">
                      {new Date(t.date).toLocaleDateString("id-ID")}
                    </p>
                  </div>

                  <p className="font-semibold">
                    Rp {t.total_amount.toLocaleString("id-ID")}
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
