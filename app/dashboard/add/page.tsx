'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const ACTIVITIES = [
  'V4 Carry/Trial',
  'Levi Carry',
  'Dough Raid',
  'Carry Raid',
  'Buddha Raid',
  'Raid Biasa',
  'Raid Order',
  'Enchanted Relic',
  'PH Carry',
  'Carry Dough',
  'Shekels',
  'Lightning',
];



export default function AddTransactionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // State untuk menampung anggota dari database
  const [allMembers, setAllMembers] = useState<{ id: string; name: string }[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(true);

  const [formData, setFormData] = useState({
    activity_name: '',
    total_amount: '',
    split_type: '3',
    selected_members: [] as string[],
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });
  // Gunakan useEffect untuk mengambil data saat komponen dimuat
  useEffect(() => {
    async function fetchMembers() {
      setIsMembersLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('id, name')
        .order('name', { ascending: true }); // Urutkan berdasarkan nama

      if (error) {
        toast({
          title: 'Error memuat anggota',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setAllMembers(data);
      }
      setIsMembersLoading(false);
    }

    fetchMembers();
  }, [toast]); // Tambahkan toast sebagai dependensi
  const handleMemberToggle = (member: string) => {
    setFormData((prev) => ({
      ...prev,
      selected_members: prev.selected_members.includes(member)
        ? prev.selected_members.filter((m) => m !== member)
        : [...prev.selected_members, member],
    }));
  };

  const calculatePerPerson = () => {
    const total = parseFloat(formData.total_amount) || 0;
    const split = parseInt(formData.split_type) || 1;
    return total / split;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.selected_members.length === 0) {
        throw new Error('Pilih minimal 1 anggota');
      }

      if (formData.selected_members.length !== parseInt(formData.split_type)) {
        throw new Error(`Jumlah anggota harus sesuai dengan pembagian (${formData.split_type} orang)`);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const perPerson = calculatePerPerson();

      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          activity_name: formData.activity_name,
          total_amount: parseFloat(formData.total_amount),
          split_type: parseInt(formData.split_type),
          per_person: perPerson,
          members: formData.selected_members,
          notes: formData.notes || null,
          date: formData.date,
          created_by: user.id,
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      const { data: membersList } = await supabase
        .from('members')
        .select('id, name')
        .in('name', formData.selected_members);

      if (membersList) {
        const memberTransactions = membersList.map((member) => ({
          member_id: member.id,
          transaction_id: transaction.id,
          amount: perPerson,
        }));

        const { error: mtError } = await supabase
          .from('member_transactions')
          .insert(memberTransactions);

        if (mtError) throw mtError;
      }

      toast({
        title: 'Transaksi berhasil ditambahkan',
        description: `Rp ${parseFloat(formData.total_amount).toLocaleString('id-ID')} telah dibagi ke ${formData.selected_members.length} anggota`,
      });

      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tambah Transaksi</h1>
          <p className="text-slate-600 mt-1">Catat aktivitas carry/raid baru</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Transaksi</CardTitle>
          <CardDescription>Isi detail transaksi carry/raid</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="activity">Nama Aktivitas</Label>
              <Select
                value={formData.activity_name}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, activity_name: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih aktivitas" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITIES.map((activity) => (
                    <SelectItem key={activity} value={activity}>
                      {activity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total">Total (Rp)</Label>
              <Input
                id="total"
                type="number"
                placeholder="100000"
                value={formData.total_amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, total_amount: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Pembagian</Label>
              <RadioGroup
                value={formData.split_type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, split_type: value }))
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="sendiri" />
                  <Label htmlFor="sendiri" className="font-normal cursor-pointer">
                    Sendiri (tidak dibagi)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="bagi2" />
                  <Label htmlFor="bagi2" className="font-normal cursor-pointer">
                    Bagi 2
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="bagi3" />
                  <Label htmlFor="bagi3" className="font-normal cursor-pointer">
                    Bagi 3
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
           
            <div className="space-y-3">
              <Label>Anggota yang Terlibat</Label>

              {isMembersLoading ? (
                <p className="text-sm text-slate-500">Memuat anggota...</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {allMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center space-x-2 border border-slate-200 rounded-md p-2 hover:bg-slate-50 transition"
                    >
                      <Checkbox
                        id={member.id}
                        checked={formData.selected_members.includes(member.name)}
                        onCheckedChange={() => handleMemberToggle(member.name)}
                      />
                      <Label
                        htmlFor={member.id}
                        className="font-normal cursor-pointer truncate"
                      >
                        {member.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm text-slate-600 mt-2">
                Pilih <span className="font-medium">{formData.split_type}</span> anggota sesuai pembagian
              </p>
            </div>

           

            {formData.total_amount && formData.split_type && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-slate-700">
                  Perhitungan: Rp {parseFloat(formData.total_amount).toLocaleString('id-ID')} ÷{' '}
                  {formData.split_type} ={' '}
                  <span className="font-bold text-blue-700">
                    Rp {calculatePerPerson().toLocaleString('id-ID')}
                  </span>{' '}
                  per orang
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (Opsional)</Label>
              <Textarea
                id="notes"
                placeholder="Tambahkan catatan..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
              </Button>
              <Link href="/dashboard">
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
