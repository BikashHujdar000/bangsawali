import { useEffect, useState } from "react";
import StatCard from "../components/common/StatCard";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import { getDashboardStats } from "../services/dashboardService";

export default function HomePage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch {
        setStats(null);
      }
    }

    loadStats();
  }, []);

  return (
    <AppLayout>
      <Card
        className="mb-6 border-0 bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] text-white shadow-md"
        padding="p-6 md:p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">Overview</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Bangsawali administration</h1>
        <p className="mt-2 max-w-2xl text-sm text-blue-100">
          Manage families, members, and community transactions from one panel.
        </p>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total families" value={stats?.totalFamilies ?? "—"} />
        <StatCard label="Total persons" value={stats?.totalPersons ?? "—"} />
        <StatCard label="Monthly deposits" value={stats?.monthlyDeposits ?? "—"} />
        <StatCard label="Monthly withdrawals" value={stats?.monthlyWithdrawals ?? "—"} />
      </div>
    </AppLayout>
  );
}
