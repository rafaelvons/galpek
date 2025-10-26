"use client";

import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SyncMembersButton() {
  async function handleSync() {
    const { data: members } = await supabase.from("members").select("id");
    if (!members) return;

    for (const m of members) {
      const { data: transactions } = await supabase
        .from("transactions")
        .select("total_amount, members")
        .contains("members", [m.id]);

      const total_earned =
        transactions?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;
      const total_transactions = transactions?.length || 0;

      await supabase
        .from("members")
        .update({ total_earned, total_transactions })
        .eq("id", m.id);
    }

    alert("✅ Semua data member sudah disinkronisasi ulang!");
  }

  return (
    <Button onClick={handleSync} className="ml-4">
      🔄 Recalculate
    </Button>
  );
}
