import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSessionThumbnailUrl } from "@/lib/media";
import { Link } from "@tanstack/react-router";
import { ImageIcon } from "lucide-react";
import { useState } from "react";
import type { Session } from "../schemas/GetSessions";

export default function SessionCard({ session }: { session: Session }) {
  const [thumbnailMissing, setThumbnailMissing] = useState(false);
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
        <CardContent className="flex flex-col gap-2">
          {thumbnailMissing ? (
            <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-accent text-muted-foreground">
              <ImageIcon className="size-8" />
            </div>
          ) : (
            <img
              className="w-full aspect-square object-cover bg-accent rounded-xl"
              src={getSessionThumbnailUrl(session.id)}
              alt={`Thumbnail of ${session.name}`}
              onError={() => setThumbnailMissing(true)}
            />
          )}
          {session.notes && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {session.notes}
            </p>
          )}
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
