// pages/debug.tsx
import { useSession } from "next-auth/react";

export default function DebugPage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading session...</p>;

  return (
    <div>
      <h2>Session Debug:</h2>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
