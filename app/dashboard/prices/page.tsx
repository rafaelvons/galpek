'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface ActivityPrice {
  id: string;
  activity_name: string;
  unit_price: number;
}

export default function PricesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prices, setPrices] = useState<ActivityPrice[]>([]);

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('activity_prices')
      .select('*')
      .order('activity_name', { ascending: true });

    if (error) {
      toast({
        title: 'Error memuat harga',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setPrices(data || []);
    }
    setLoading(false);
  };

  const handlePriceChange = (id: string, value: string) => {
    setPrices((prev) =>
      prev.map((price) =>
        price.id === id ? { ...price, unit_price: parseFloat(value) || 0 } : price
      )
    );
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const updates = prices.map((price) =>
        supabase
          .from('activity_prices')
          .update({ unit_price: price.unit_price, updated_at: new Date().toISOString() })
          .eq('id', price.id)
      );

      await Promise.all(updates);

      toast({
        title: 'Harga berhasil disimpan',
        description: 'Semua harga aktivitas telah diperbarui',
      });
    } catch (error: any) {
      toast({
        title: 'Error menyimpan harga',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6">
        <p className="text-slate-600">Memuat harga...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pengaturan Harga</h1>
          <p className="text-slate-600 mt-1">Atur harga satuan untuk setiap aktivitas</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Harga Aktivitas</CardTitle>
          <CardDescription>
            Tentukan harga satuan untuk setiap jenis carry/raid
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prices.map((price) => (
              <div key={price.id} className="space-y-2">
                <Label htmlFor={price.id}>{price.activity_name}</Label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-700 font-medium">Rp</span>
                  <Input
                    id={price.id}
                    type="number"
                    min="0"
                    step="1000"
                    value={price.unit_price}
                    onChange={(e) => handlePriceChange(price.id, e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleSaveAll} disabled={saving} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Menyimpan...' : 'Simpan Semua Harga'}
            </Button>
            <Link href="/dashboard">
              <Button type="button" variant="outline">
                Kembali
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
