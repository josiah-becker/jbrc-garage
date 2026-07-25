import H1 from "@/components/H1";
import { useSuspenseQuery } from "@tanstack/react-query";
import AddSessionDialog from "../components/AddSessionDialog";
import SessionCard from "../components/SessionCard";
import { GetAllSessionsQuery } from "../queries/GetAllSessions";

export default function Sessions() {
  const { data: sessions } = useSuspenseQuery(GetAllSessionsQuery);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <H1>Sessions</H1>
        <AddSessionDialog />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        {sessions?.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}
