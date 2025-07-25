import Broadcast from "@/components/livestream/broadcaster";
import { notFound } from "next/navigation";

type Props = {
  params: { regimeId: string };
};

export default async function HostPage({ params }: Props) {
  const { regimeId } = await params;

  if (!regimeId) return notFound(); // optional

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-xl font-bold mb-2">
        Hosting Live for Regime ID: {regimeId}
      </h2>
      <Broadcast />
    </div>
  );
}
