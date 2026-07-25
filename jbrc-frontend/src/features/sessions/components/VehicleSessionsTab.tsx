import H2 from "@/components/H2";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { GetSessionsForVehicleQuery } from "../queries/GetSessionsForVehicle";
import AddSessionDialog from "./AddSessionDialog";
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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <H2>Sessions</H2>
        <AddSessionDialog defaultVehicleIds={[vehicleId]} />
      </div>

      {isPending && <Skeleton className="w-full h-32" />}
      {isError && (
        <p className="text-sm text-destructive">Failed to load sessions.</p>
      )}
      {sessions?.length === 0 && (
        <p className="text-sm text-muted-foreground">
          This vehicle hasn't been out on any sessions yet.
        </p>
      )}
      {sessions && sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
