import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { GetSessionsForVehicleQuery } from "../queries/GetSessionsForVehicle";
import SessionCard from "./SessionCard";

export default function VehicleSessionsTab({
  vehicleId,
}: {
  vehicleId: string;
}) {
  const {
    data: sessions,
    isPending,
    isError,
  } = useQuery(GetSessionsForVehicleQuery(vehicleId));

  if (isPending) return <Skeleton className="w-full h-32" />;
  if (isError)
    return (
      <p className="text-sm text-destructive">Failed to load sessions.</p>
    );

  if (sessions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This vehicle hasn't been out on any sessions yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}
