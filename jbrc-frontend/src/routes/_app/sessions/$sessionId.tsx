import SessionDetail from "@/features/sessions/pages/SessionDetail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/sessions/$sessionId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { sessionId } = Route.useParams();
  return <SessionDetail sessionId={sessionId} />;
}
