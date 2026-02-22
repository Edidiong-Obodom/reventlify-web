import AttendanceManagementPage from "@/components/regimes/attendance-management-page";

interface AttendancePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filter?: string }>;
}

export default async function AttendancePage({
  params,
  searchParams,
}: Readonly<AttendancePageProps>) {
  const { id } = await params;
  const { filter } = await searchParams;
  return <AttendanceManagementPage regimeId={id} initialFilter={filter} />;
}

