import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import ChatWindow from "../components/ChatWindow";

interface UnreadMap {
  [username: string]: number;
}

export default function PeoplePage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<UnreadMap>({});
  const currentUser = session?.user?.name;

  // Fetch user list
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/users"); // Ensure this API is created
      const data = await res.json();
      const otherUsers = data.users.filter((u: string) => u !== currentUser);
      setUsers(otherUsers);
    };

    if (status === "authenticated") {
      fetchUsers();
    }
  }, [status]);

  // Fetch unread counts
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (!currentUser) return;

      const res = await fetch(`/api/unread?user=${encodeURIComponent(currentUser)}`);
      const data = await res.json();

      const counts: UnreadMap = {};
      for (const entry of data.unread) {
        counts[entry._id] = entry.count;
      }

      setUnreadCounts(counts);
    };

    if (status === "authenticated") {
      fetchUnreadCounts();
    }
  }, [status, selectedUser]); // Re-fetch when a chat is opened

  return (
    <>
      <Head>
        <title>People - Skillmate Chat</title>
      </Head>

      <div className="flex h-screen">
        {/* People Sidebar */}
        <div className="w-1/3 border-r p-4 overflow-y-auto bg-white dark:bg-gray-900">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">People</h2>

          {users.length === 0 && (
            <p className="text-gray-500">No users found.</p>
          )}

          <ul className="space-y-2">
            {users.map((user, i) => (
              <li
                key={i}
                onClick={() => setSelectedUser(user)}
                className={`cursor-pointer flex items-center justify-between p-2 rounded transition ${
                  selectedUser === user
                    ? "bg-green-100 dark:bg-green-800"
                    : "hover:bg-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                <span className="text-gray-800 dark:text-gray-200">{user}</span>

                {unreadCounts[user] > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadCounts[user]}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Window */}
        <div className="flex-1 p-4 bg-gray-100 dark:bg-gray-800">
          {selectedUser ? (
            <ChatWindow username={currentUser} recipient={selectedUser} />
          ) : (
            <p className="text-gray-500 dark:text-gray-300">
              Select a user to start chatting.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
