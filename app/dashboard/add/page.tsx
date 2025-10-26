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
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Settings } from 'lucide-react';
import Link from 'next/link';
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

const ACTIVITIES = [
  "1M Coin - Fish it",
  "Big Shiny Elshark Gran Maja - Fish It!",
  "Big El Shark Gran Maja - Fish It!",
  "Megalodon Shiny - Fish it!",
  "Megalodon Stone - Fish It!",
  "Carry Terror Shark / Blox Fruit",
  "Kill User Lightning (Awaken 3 Pain) / Blox Fruit",
  "Carry Raid Dough / Blox Fruit",
  "Sparkling Shiny Big Phantom Megalodon",
  "Mega Peacock",
  "Requiem Eagle/Eagle Skin",
  "Glacier Eagle/Blue Eagle",
  "Matrix Eagle/Green Eagle",
  "Celestial Pain / Blox Fruit",
  "Carry Raid Order / Blox Fruit",
  "Bantu V2 & V3 All Race / Blox Fruit",
  "Carry Prehistoric Island / Blox Fruit",
  "Carry Trial V4 / Blox Fruit",
  "Enchanted Relic",
  "Sparkling Shiny Lovestorm",
  "Carry Leviathan / Blox Fruit",
  "Carry Raid Biasa / Blox Fruit",
  "Cockatrice",
  "Pink Diamond",
  "Yeti",
  "Carry Raid Buddha / Blox Fruit",
  "Mythical Phantom Megalodon",
  "Yellow Rumble/Yellow Lightning",
  "Sheckels 1.97SX VIA BONE BLOSSOM",
  "SHECKELS 3.2SX BONE BLOSSOM FRUIT",
  "Leopard",
  "Griffin",
  "Pain",
  "Gravity",
  "Private Sever Sharing / Blox Fruit (1 Month)",
  "Green Rumble/ Green Lightning",
  "Kitsune",
  "Lightning",
  "Portal",
  "Dough",
  "Buddha",
  "T-Rex",
  "Rainbow Dilophosaurus",
  "Golden Goose",
  "PET TUMBAL AGE 60+75",
  "SHECKELS 1SX",
  "Rainbow French Fry Ferret",
  "Mega Dilophosaurus",
  "Mega Mimic Octopus",
  "Venom",
  "Gas",
  "Mythical Chest / Grand Piece Online",
  "Corrupted Kitsune / Grow A Garden",
  "Radiant Admiral Cape / Grand Piece Online (GPO)",
  "Radiant Shades / Grand Piece Online (GPO)",
  "Radiant Admiral Outfit / Grand Piece Online (GPO)",
  "Inverted Spear Of Heaven / Grand Piece Online (GPO)",
  "Legendary chest GPO",
  "Mochi Mochi No Mi / Grand Piece Online (GPO)",
  "Tori Tori No Mi / Grand Piece Online (GPO)",
  "10k Bounty / Grand Piece Online (GPO)",
  "Hoverboard / Grand Piece Online (GPO)",
  "World Ender / Grand Piece Online (GPO)",
  "Prestige Bag / Grand Piece Online (GPO)",
  "All Seeing Eye / Grand Piece Online (GPO)",
  "Shiryu Hat / Grand Piece Online (GPO)",
  "Shiryu Cape / Grand Piece Online (GPO)",
  "Spirit Color Essence / Grand Piece Online (GPO)",
  "Buddha Buddha No Mi / Grand Piece Online (GPO)",
  "True Baal's Snake Head / Grand Piece Online (GPO)",
  "True Baal's Guard / Grand Piece Online (GPO)",
  "Resurrected Baal's Head / Grand Piece Online (GPO)",
  "Resurrected Baal's Outfit / Grand Piece Online (GPO)",
  "Hollow's Great Sword / Grand Piece Online (GPO)",
  "Hollow's Halberd / Grand Piece Online (GPO)",
  "Stark Gun / Grand Piece Online (GPO)",
  "SP Reset Essence / Grand Piece Online (GPO)",
  "Dark Root / Grand Piece Online (GPO)",
  "50K Peli (Bonus Peli 5k) - Grand Piece Online (GPO)",
  "100K Peli (Bonus Peli 10k) - Grand Piece Online | GPO",
  "Kikoku / Grand Piece Online (GPO)",
  "Jester Outfit / Grand Piece Online (GPO)",
  "Mero Mero No Mi ( GPO / Grand Piece Online)",
  "Ito Ito No Mi ( GPO / Grand Piece Online)"
];

// 💰 Daftar harga otomatis — bisa kamu ubah kapan aja
const ACTIVITY_PRICES: Record<string, number> = {
  "1M Coin - Fish it": 21560,
  "Big Shiny Elshark Gran Maja - Fish It!": 154000,
  "Big El Shark Gran Maja - Fish It!": 132000,
  "Megalodon Shiny - Fish it!": 88000,
  "Megalodon Stone - Fish It!": 110000,
  "Carry Terror Shark / Blox Fruit": 1531,
  "Kill User Lightning (Awaken 3 Pain) / Blox Fruit": 704,
  "Carry Raid Dough / Blox Fruit": 3610,
  "Sparkling Shiny Big Phantom Megalodon": 8800,
  "Mega Peacock": 35200,
  "Requiem Eagle/Eagle Skin": 44000,
  "Glacier Eagle/Blue Eagle": 28160,
  "Matrix Eagle/Green Eagle": 105600,
  "Celestial Pain / Blox Fruit": 105600,
  "Carry Raid Order / Blox Fruit": 3001,
  "Bantu V2 & V3 All Race / Blox Fruit": 10120,
  "Carry Prehistoric Island / Blox Fruit": 15004,
  "Carry Trial V4 / Blox Fruit": 15004,
  "Enchanted Relic": 88,
  "Sparkling Shiny Lovestorm": 8800,
  "Carry Leviathan / Blox Fruit": 26400,
  "Carry Raid Biasa / Blox Fruit": 1540,
  "Cockatrice": 7920,
  "Pink Diamond": 44000,
  "Yeti": 44000,
  "Carry Raid Buddha / Blox Fruit": 3001,
  "Mythical Phantom Megalodon": 8800,
  "Yellow Rumble/Yellow Lightning": 74800,
  "Sheckels 1.97SX VIA BONE BLOSSOM": 2640,
  "SHECKELS 3.2SX BONE BLOSSOM FRUIT": 4400,
  "Leopard": 22000,
  "Griffin": 10560,
  "Pain": 10560,
  "Gravity": 10560,
  "Private Sever Sharing / Blox Fruit (1 Month)": 1012,
  "Green Rumble/ Green Lightning": 44000,
  "Kitsune": 74800,
  "Lightning": 22000,
  "Portal": 5280,
  "Dough": 10560,
  "Buddha": 6160,
  "T-Rex": 8800,
  "Rainbow Dilophosaurus": 880000,
  "Golden Goose": 10560,
  "PET TUMBAL AGE 60+75": 6600,
  "SHECKELS 1SX": 2200,
  "Rainbow French Fry Ferret": 176000,
  "Mega Dilophosaurus": 44000,
  "Mega Mimic Octopus": 52800,
  "Venom": 7040,
  "Gas": 22000,
  "Mythical Chest / Grand Piece Online": 132000,
  "Corrupted Kitsune / Grow A Garden": 17600,
  "Radiant Admiral Cape / Grand Piece Online (GPO)": 48400,
  "Radiant Shades / Grand Piece Online (GPO)": 35200,
  "Radiant Admiral Outfit / Grand Piece Online (GPO)": 52800,
  "Inverted Spear Of Heaven / Grand Piece Online (GPO)": 198000,
  "Legendary chest GPO": 17600,
  "Mochi Mochi No Mi / Grand Piece Online (GPO)": 110000,
  "Tori Tori No Mi / Grand Piece Online (GPO)": 88000,
  "10k Bounty / Grand Piece Online (GPO)": 22000,
  "Hoverboard / Grand Piece Online (GPO)": 48400,
  "World Ender / Grand Piece Online (GPO)": 272800,
  "Prestige Bag / Grand Piece Online (GPO)": 616000,
  "All Seeing Eye / Grand Piece Online (GPO)": 334400,
  "Shiryu Hat / Grand Piece Online (GPO)": 22000,
  "Shiryu Cape / Grand Piece Online (GPO)": 35200,
  "Spirit Color Essence / Grand Piece Online (GPO)": 35200,
  "Buddha Buddha No Mi / Grand Piece Online (GPO)": 132000,
  "True Baal's Snake Head / Grand Piece Online (GPO)": 44000,
  "True Baal's Guard / Grand Piece Online (GPO)": 66000,
  "Resurrected Baal's Head / Grand Piece Online (GPO)": 140800,
  "Resurrected Baal's Outfit / Grand Piece Online (GPO)": 35200,
  "Hollow's Great Sword / Grand Piece Online (GPO)": 30800,
  "Hollow's Halberd / Grand Piece Online (GPO)": 48400,
  "Stark Gun / Grand Piece Online (GPO)": 132000,
  "SP Reset Essence / Grand Piece Online (GPO)": 2640,
  "Dark Root / Grand Piece Online (GPO)": 5720,
  "50K Peli (Bonus Peli 5k) - Grand Piece Online (GPO)": 6600,
  "100K Peli (Bonus Peli 10k) - Grand Piece Online | GPO": 13200,
  "Kikoku / Grand Piece Online (GPO)": 286000,
  "Jester Outfit / Grand Piece Online (GPO)": 396000,
  "Mero Mero No Mi ( GPO / Grand Piece Online)": 7040,
  "Ito Ito No Mi ( GPO / Grand Piece Online)": 8800
};

export default function AddTransactionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [allMembers, setAllMembers] = useState<{ id: string; name: string }[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(true);

  const activityPrices = ACTIVITY_PRICES;
  const [selectedActivityPrice, setSelectedActivityPrice] = useState<number>(0);

  const [formData, setFormData] = useState({
    activity_name: '',
    quantity: '1',
    total_amount: '',
    count: '1',
    split_type: '3',
    selected_members: [] as string[], 
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    async function fetchMembers() {
      setIsMembersLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('id, name')
        .order('name', { ascending: true });

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
  }, [toast]);

  // 💡 PERUBAHAN: Logika untuk membatasi checklist
  const handleMemberToggle = (memberName: string) => {
    setFormData((prev) => {
      const limit = parseInt(prev.split_type);
      const currentSelection = prev.selected_members;
      const isSelected = currentSelection.includes(memberName);

      if (isSelected) {
        // SELALU izinkan MENGHAPUS (uncheck)
        return {
          ...prev,
          selected_members: currentSelection.filter((m) => m !== memberName),
        };
      } else {
        // Periksa batas saat MENAMBAHKAN (check)
        if (currentSelection.length >= limit) {
          // Jika sudah mencapai batas, tampilkan error dan jangan ubah state
          toast({
            title: 'Batas Anggota Tercapai',
            description: `Anda hanya dapat memilih ${limit} anggota untuk pembagian ini.`,
            variant: 'destructive',
          });
          return prev; // Kembalikan state sebelumnya (tidak ada perubahan)
        }
        
        // Jika belum mencapai batas, tambahkan anggota
        return {
          ...prev,
          selected_members: [...currentSelection, memberName],
        };
      }
    });
  };
  
  // (Logika harga unit tidak berubah)
  useEffect(() => {
    if (formData.activity_name) {
      const unitPrice = activityPrices[formData.activity_name] || 0;
      setSelectedActivityPrice(unitPrice);
      setFormData(prev => ({ 
        ...prev, 
        total_amount: unitPrice.toString()
      }));
    }
  }, [formData.activity_name, activityPrices]);


  const calculatePerPerson = () => {
    const unitPrice = parseFloat(formData.total_amount) || 0;
    const count = parseInt(formData.count) || 1;
    const split = parseInt(formData.split_type) || 1;
    const totalCalculated = unitPrice * count;
    return totalCalculated / split;
  };

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // (Validasi tetap sama)
      if (formData.selected_members.length === 0) {
        throw new Error('Pilih minimal 1 anggota');
      }
      if (formData.selected_members.length !== parseInt(formData.split_type)) {
        throw new Error(
          `Jumlah anggota yang dipilih (${formData.selected_members.length}) harus sesuai dengan pembagian (${formData.split_type} orang)`
        );
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // --- 💡 DEBUGGING 1: Cek Tipe user.id ---
      console.log('User ID:', user.id, '(Tipe:', typeof user.id, ')'); // Seharusnya 'string'
      
      const unitPrice = parseFloat(formData.total_amount) || 0;
      const count = parseInt(formData.count) || 1;
      const totalCalculated = unitPrice * count;
      const perPerson = calculatePerPerson();

      // Siapkan data untuk insert
      const transactionData = {
        activity_name: formData.activity_name,
        total_amount: totalCalculated,
        count: count,
        split_type: parseInt(formData.split_type),
        per_person: perPerson,
        members: formData.selected_members, // Ini adalah string[] (text[])
        notes: formData.notes || null,
        date: formData.date,
        created_by: user.id, // Ini adalah string (uuid)
      };

      // --- 💡 DEBUGGING 2: Cek data yang akan dikirim ---
      console.log('Data yang akan di-insert:', transactionData);

      // Kirim data
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert(transactionData)
        .single(); 

      if (transactionError) {
        // Error pasti datang dari sini
        throw transactionError;
      }
      
      // (Sisa logika tidak berubah)
      toast({
        title: 'Transaksi berhasil ditambahkan',
        description: `Rp ${totalCalculated.toLocaleString(
          'id-ID'
        )} telah dibagi ke ${formData.selected_members.join(', ')}`,
      });
      
      // 💡 PERUBAHAN: Ganti router.push dengan window.location.href
      // Ini akan memaksa hard reload di halaman dashboard
      window.location.href = '/dashboard';
      
    } catch (error: any) {
      console.error("Submission Error:", error);
      toast({
        title: 'Error',
        description: error.message || 'Terjadi kesalahan saat menyimpan transaksi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* ... (Header tidak berubah) ... */}
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
            
            {/* ... (Form Aktivitas, Harga, Jumlah, Tanggal tidak berubah) ... */}

            {/* Aktivitas (searchable) */}
            <div className="space-y-2">
              <Label htmlFor="activity">Nama Aktivitas</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {formData.activity_name
                      ? formData.activity_name
                      : "Pilih atau ketik aktivitas"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Cari aktivitas..." />
                    <CommandList>
                      <CommandEmpty>Aktivitas tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {ACTIVITIES.map((activity) => (
                          <CommandItem
                            key={activity}
                            value={activity}
                            onSelect={(currentValue) => {
                                const newActivityName = currentValue;
                                const unitPrice = ACTIVITY_PRICES[newActivityName] || 0;
                                setFormData((prev) => ({
                                  ...prev,
                                  activity_name: newActivityName,
                                  total_amount: unitPrice.toString(), 
                                }));
                            }}
                          >
                            {activity}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Harga per Aktivitas (Harga Unit) */}
            <div className="space-y-2">
              <Label htmlFor="total">Harga per Aktivitas (Rp)</Label>
              <Input
                id="total"
                type="number"
                value={formData.total_amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, total_amount: e.target.value }))
                }
                required
              />
            </div>

            {/* Jumlah kali */}
            <div className="space-y-2">
              <Label htmlFor="count">Jumlah (kali)</Label>
              <Input
                id="count"
                type="number"
                min="1"
                value={formData.count}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, count: e.target.value }))
                }
                required
              />
            </div>

            {/* Tanggal */}
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

            {/* Pembagian */}
            <div className="space-y-3">
              <Label>Pembagian</Label>
              <RadioGroup
                value={formData.split_type}
                // 💡 PERUBAHAN: Memotong array anggota saat pembagian diubah
                onValueChange={(value) => {
                  const newLimit = parseInt(value);
                  setFormData((prev) => ({ 
                    ...prev, 
                    split_type: value,
                    // Potong array anggota agar sesuai batas baru
                    selected_members: prev.selected_members.slice(0, newLimit) 
                  }));
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="sendiri" />
                  <Label htmlFor="sendiri">Sendiri (tidak dibagi)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="bagi2" />
                  <Label htmlFor="bagi2">Bagi 2</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="bagi3" />
                  <Label htmlFor="bagi3">Bagi 3</Label>
                </div>
              </RadioGroup>
            </div>


            {/* Anggota */}
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
                        id={member.id} // id HTML tetap pakai ID unik
                        checked={formData.selected_members.includes(member.name)} 
                        // 💡 PERUBAHAN: Handler onCheckedChange sekarang memanggil fungsi baru
                        onCheckedChange={() => handleMemberToggle(member.name)} 
                      />
                      <Label htmlFor={member.id} className="font-normal cursor-pointer truncate">
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

            {/* ... (Kalkulasi, Catatan, Tombol tidak berubah) ... */}
            
            {/* Kalkulasi */}
            {formData.total_amount && formData.count && formData.split_type && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-slate-700">
                  Perhitungan: Rp {parseFloat(formData.total_amount).toLocaleString('id-ID')} × {formData.count} ÷ {formData.split_type} ={' '}
                  <span className="font-bold text-blue-700">
                    Rp {calculatePerPerson().toLocaleString('id-ID')}
                  </span>{' '}
                  per orang
                </p>
              </div>
            )}

            {/* Catatan */}
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (Opsional)</Label>
              <Textarea
                id="notes"
                placeholder="Tambahkan catatan..."
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Tombol */}
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