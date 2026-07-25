import H1 from "@/components/H1";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import DeleteSessionDialog from "../components/DeleteSessionDialog";
import EditSessionDialog from "../components/EditSessionDialog";
import SessionMedia from "../components/SessionMedia";
import { GetSessionQuery } from "../queries/GetSession";

export default function SessionDetail({ sessionId }: { sessionId: string }) {
  const navigate = useNavigate();
  const {
    data: session,
    isPending,
    isError,
  } = useQuery(GetSessionQuery(sessionId));

  if (isPending) return <Skeleton className="w-full h-64" />;
  if (isError) return <p>Session not found.</p>;

  const date = new Date(`${session.session_date}T00:00:00`);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <H1>{session.name}</H1>
          <p className="text-muted-foreground">
            {date.toLocaleDateString(undefined, { dateStyle: "medium" })}
            {session.location ? ` · ${session.location}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <EditSessionDialog session={session} />
          <DeleteSessionDialog
            sessionId={sessionId}
            sessionName={session.name}
            onDeleted={() => navigate({ to: "/sessions" })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Vehicles used
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {session.vehicles.map((vehicle) => (
            <Link
              key={vehicle.id}
              to="/vehicles/$vehicleId"
              params={{ vehicleId: vehicle.id }}
            >
              <Badge variant="secondary">{vehicle.name}</Badge>
            </Link>
          ))}
        </div>
      </div>

      {session.notes && (
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-medium text-muted-foreground">
            Notable events
          </h2>
          <p className="whitespace-pre-wrap text-sm">{session.notes}</p>
        </div>
      )}

      <SessionMedia sessionId={sessionId} />
    </div>
  );
}
