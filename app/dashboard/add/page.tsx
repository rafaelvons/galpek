'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";

interface Member {
  id: string;
  name: string;
}

interface ActivityPrice {
  activity_name: string;
  price: number;
}

export default function AddTransactionPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<ActivityPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  const [formData, setFormData] = useState({
    activity_name: "",
    total_amount: "0",
    count: "1",
    selected_members: [] as string[],
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Load Members
  useEffect(() => {
    async function loadMembers() {
      setIsLoadingMembers(true);
      const { data } = await supabase.from("members").select("id, name").order("name");
      setMembers(data || []);
      setIsLoadingMembers(false);
    }
    loadMembers();
  }, []);

  // Load Activities (from DB)
  useEffect(() => {
    async function loadActivities() {
      const { data } = await supabase
        .from("activity_prices")
        .select("activity_name, price")
        .order("activity_name");

      setActivities(data || []);
    }
    loadActivities();
  }, []);

  // Select Activity
  const handleSelectActivity = (activity: ActivityPrice) => {
    setFormData(prev => ({
      ...prev,
      activity_name: activity.activity_name,
      total_amount: activity.price.toString(),
    }));
  };

  // Toggle Member
  const toggleMember = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selected_members: prev.selected_members.includes(id)
        ? prev.selected_members.filter(m => m !== id)
        : [...prev.selected_members, id]
    }));
  };

  // Calculation
  const totalAmount = Number(formData.total_amount) * Number(formData.count);
  const memberCount = formData.selected_members.length;
  const perPerson = memberCount > 0 ? totalAmount / memberCount : 0;

  // Submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.activity_name) throw new Error("Pilih aktivitas terlebih dahulu.");
      if (memberCount === 0) throw new Error("Pilih minimal 1 anggota.");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User tidak ditemukan.");

      const { error } = await supabase.from("transactions").insert({
        activity_name: formData.activity_name,
        total_amount: totalAmount,
        count: Number(formData.count),
        split_type: memberCount, // otomasi jadi jumlah orang
        per_person: perPerson,
        members: formData.selected_members,
        notes: formData.notes || null,
        date: formData.date,
        created_by: user.id,
      });

      if (error) throw error;

      toast({
        title: "Transaksi berhasil ditambahkan",
        description: `Total Rp ${totalAmount.toLocaleString("id-ID")} untuk ${memberCount} orang.`,
      });

      router.replace("/dashboard");

    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl space-y-6">

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Tambah Transaksi</h1>
          <p className="text-slate-600">Catat aktivitas carry/raid baru</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Transaksi</CardTitle>
          <CardDescription>Isi detail transaksi</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* PILIH AKTIVITAS */}
            <div className="space-y-2">
              <Label>Nama Aktivitas</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {formData.activity_name || "Pilih aktivitas"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Cari aktivitas..." />
                    <CommandList>
                      <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {activities.map(a => (
                          <CommandItem
                            key={a.activity_name}
                            value={a.activity_name}
                            onSelect={() => handleSelectActivity(a)}
                          >
                            {a.activity_name} — Rp {a.price.toLocaleString("id-ID")}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* HARGA */}
            <div>
              <Label>Harga per Aktivitas</Label>
              <Input
                type="number"
                value={formData.total_amount}
                onChange={e => setFormData(prev => ({ ...prev, total_amount: e.target.value }))}
              />
            </div>

            {/* JUMLAH */}
            <div>
              <Label>Jumlah</Label>
              <Input
                type="number"
                min={1}
                value={formData.count}
                onChange={e => setFormData(prev => ({ ...prev, count: e.target.value }))}
              />
            </div>

            {/* LIST ANGGOTA */}
            <div>
              <Label>Anggota yang Terlibat</Label>

              {isLoadingMembers ? (
                <p>Memuat...</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {members.map(m => (
                    <div key={m.id} className="flex items-center space-x-2 border p-2 rounded">
                      <Checkbox
                        checked={formData.selected_members.includes(m.id)}
                        onCheckedChange={() => toggleMember(m.id)}
                      />
                      <Label>{m.name}</Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* KALKULASI */}
            {memberCount > 0 && (
              <div className="p-3 bg-blue-50 border rounded">
                Total: Rp {totalAmount.toLocaleString("id-ID")}
                <br />
                Dibagi {memberCount} orang →  
                <b>Rp {perPerson.toLocaleString("id-ID")} / orang</b>
              </div>
            )}

            {/* CATATAN */}
            <div>
              <Label>Catatan</Label>
              <Textarea
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Opsional"
              />
            </div>

            <Button className="w-full" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>

          </form>
        </CardContent>
      </Card>

    </div>
  );
}
