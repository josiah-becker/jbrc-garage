import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import type { Session } from "../schemas/GetSessions";

export default function SessionCard({ session }: { session: Session }) {
  const date = new Date(`${session.session_date}T00:00:00`);

  return (
    <Link to="/sessions/$sessionId" params={{ sessionId: session.id }}>
      <Card>
        <CardHeader>
          <CardTitle>{session.name}</CardTitle>
          <CardDescription>
            {date.toLocaleDateString(undefined, { dateStyle: "medium" })}
            {session.location ? ` · ${session.location}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {session.vehicles.map((vehicle) => (
              <Badge key={vehicle.id} variant="secondary">
                {vehicle.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
