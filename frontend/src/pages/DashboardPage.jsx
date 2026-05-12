import { useEffect, useState } from "react";
import api from "../api";
import StatCard from "../components/common/StatCard";
import AppLayout from "../layouts/AppLayout";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then((response) => setStats(response.data))
      .catch(() => setStats(null));
  }, []);

  return (
    <AppLayout>
      <h1 className="mb-4 text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Total Families" value={stats?.totalFamilies ?? "-"} />
        <StatCard label="Total Persons" value={stats?.totalPersons ?? "-"} />
        <StatCard
          label="Monthly Deposits"
          value={stats?.monthlyDeposits ?? "-"}
        />
        <StatCard
          label="Monthly Withdrawals"
          value={stats?.monthlyWithdrawals ?? "-"}
        />
      </div>
    </AppLayout>
  );
}
