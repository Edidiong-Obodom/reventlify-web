import OwnerRegimeDashboardPage from "@/components/regimes/owner-regime-dashboard-page";

interface RegimeDashboardPageProps {
  params: Promise<{ id: string }>;
}

export default async function RegimeDashboardPage({
  params,
}: Readonly<RegimeDashboardPageProps>) {
  const { id } = await params;
  return <OwnerRegimeDashboardPage regimeId={id} />;
}

