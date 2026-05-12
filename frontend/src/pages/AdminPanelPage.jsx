import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import { getDashboardStats } from "../services/dashboardService";

const modules = ["Family registry", "People directory", "Financial controls"];

export default function AdminPanelPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadPanelData() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch {
        setStats(null);
      }
    }

    loadPanelData();
  }, []);

  return (
    <AppLayout>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-blue-100" padding="p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Families</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#2563EB]">{stats?.totalFamilies ?? "—"}</p>
        </Card>
        <Card className="border-emerald-100" padding="p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Persons</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-700">{stats?.totalPersons ?? "—"}</p>
        </Card>
        <Card className="border-amber-100" padding="p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Withdrawals (period)</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-amber-700">{stats?.monthlyWithdrawals ?? "—"}</p>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {modules.map((name) => (
          <Card key={name} title={name} />
        ))}
      </div>
    </AppLayout>
  );
}
