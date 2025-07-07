// pages/dashboard.tsx
import { useSession } from "next-auth/react";
import Head from "next/head";
import Sidebar from "../components/Sidebar";
import UserCard from "../components/UserCard";
import NotificationBell from "../components/NotificationBell";
import StatsChart from "../components/StatsChart";
import {
  ChatBubbleBottomCenterTextIcon,
  PlusIcon,
  NewspaperIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showFeedModal, setShowFeedModal] = useState(false);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [posts, setPosts] = useState([]);
  const [isDark, setIsDark] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const currentUser = session?.user?.name;
  const userName = (currentUser || "User").toUpperCase();

  useEffect(() => {
    const savedTheme = localStorage.getItem("dashboard-theme");
    setIsDark(savedTheme === "dark");
    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      if (!currentUser) return;
      try {
        const res = await fetch(`/api/unread?user=${currentUser}`);
        const data = await res.json();
        const total = data.unread.reduce((sum: number, u: any) => sum + u.count, 0);
        setUnreadCount(total);
      } catch (err) {
        console.error("Failed to fetch unread count:", err);
      }
    };

    fetchUnread();
  }, [currentUser]);
   useEffect(() => {
    if (uploadStatus) {
      const timer = setTimeout(() => setUploadStatus(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [uploadStatus]);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (res.ok) setPosts(data.posts);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  
  

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: userName, message }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedbackStatus("✅ Feedback sent successfully!");
        setMessage("");
      } else {
        setFeedbackStatus(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Feedback error:", error);
      setFeedbackStatus("❌ Something went wrong. Please try again later.");
    }
  };
   const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setUploadStatus("❌ Please select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("user", userName);
    formData.append("description", description);
    formData.append("image", imageFile);

    const res = await fetch("/api/posts", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      setDescription("");
      setImageFile(null);
      setShowPostModal(false);
      fetchPosts();
      setTimeout(() => setUploadStatus("✅ Post uploaded!"), 300);
    } else {
      setUploadStatus(`❌ Error: ${data.error}`);
    }
  };

  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        Access Denied. Please login.
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - {userName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`flex flex-col sm:flex-row h-screen ${isDark ? "bg-slate-950 text-white" : "bg-white text-black"}`}>
        <Sidebar isDark={isDark} unreadCount={unreadCount} />

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6">Hi, {userName}</h1>

          {globalError && (
            <div className="mb-4 p-4 rounded bg-red-100 border border-red-400 text-red-700">
              {globalError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-12">
            <UserCard userName={userName} email={session.user?.email || ""} />
            <StatsChart />
          </div>
        </main>

        {/* Notification Bell */}
        <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-[60]">
          <div className={`p-2 rounded-full shadow ${isDark ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
            <NotificationBell userName={userName} isDark={isDark} />
          </div>
        </div>

        {/* Upload Button */}
        <button
          onClick={() => setShowPostModal(true)}
          className="fixed top-4 sm:top-6 right-20 sm:right-24 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg flex items-center transition z-[60]"
        >
          <PlusIcon className="h-6 w-6" />
        </button>

        {/* ➕ Add Post Button */}
        <button
          onClick={() => setShowPostModal(true)}
          className="fixed top-6 right-24 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg flex items-center transition z-50"
          title="Add Post"
        >
          <PlusIcon className="h-6 w-6" />
        </button>
          {/* 📰 Aesthetic Feeds Button */}
<button
  onClick={() => setShowFeedModal(true)}
  className="fixed top-6 right-[11rem] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition duration-300 ease-in-out z-50"
  title="View Feeds"
>
  <NewspaperIcon className="h-5 w-5" />
  <span className="text-sm font-medium">View Feeds</span>
</button>
 {/* ✅ Upload Success Message */}
        {uploadStatus && (
          <div className="fixed bottom-24 right-6 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg shadow z-50">
            {uploadStatus}
          </div>
        )}
        {/* 🖼️ Post Modal */}
        {showPostModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">📸 Create a Post</h2>
                <button onClick={() => setShowPostModal(false)} title="Close">
                  <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-red-500" />
                </button>
              </div>
              <form onSubmit={handlePostSubmit} className="space-y-4">
                <input
                  type="file"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 p-2 rounded text-gray-700 bg-white"
                  required
                />
                {imageFile && (
                  <p className="text-sm text-gray-500 mt-1">Selected: {imageFile.name}</p>
                )}
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  className="w-full p-3 border border-gray-300 rounded text-gray-800 bg-white placeholder-gray-400"
                  rows={3}
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl transition"
                >
                  Upload Post
                </button>
              </form>
            </div>
          </div>
        )} 
        {/* 📰 Feeds Modal */}
        {showFeedModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-2xl h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">📰 All Posts</h2>
                <button onClick={() => setShowFeedModal(false)} title="Close">
                  <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-red-500" />
                </button>
              </div>
              {posts.length === 0 ? (
                <p className="text-gray-500">No posts yet.</p>
              ) : (
                posts.map((post, idx) => (
                  <div key={idx} className="mb-6 bg-gray-50 p-4 rounded-lg shadow">
                    <img
                      src={`/uploads/${post.imagePath}`}
                      alt="Post"
                      className="w-full h-56 object-cover rounded mb-2"
                    />
                    <p className="text-gray-800">{post.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}


        {/* Dark Mode Toggle */}
        <button
          onClick={() => {
            const newMode = !isDark;
            localStorage.setItem("dashboard-theme", newMode ? "dark" : "light");
            setIsDark(newMode);
          }}
          className={`fixed top-4 sm:top-6 right-60 sm:right-[20rem] p-3 rounded-full shadow-md transition z-[60] ${isDark ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-800"}`}
        >
          {isDark ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.485-8.485l-.707.707M4.222 4.222l.707.707M21 12h1M2 12H1m16.243 4.243l.707.707M4.222 19.778l.707-.707" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="h-5 w-5">
              <path d="M17.293 13.293a8 8 0 01-10.586-10.586 8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>

        {/* Feedback Button */}
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 z-[60]"
        >
          <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Feedback</span>
        </button>

        {/* Feedback Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
            <div className={`p-6 w-full max-w-md rounded-lg shadow-lg ${isDark ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Send Feedback</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-red-600">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleFeedbackSubmit}>
                <textarea
                  className="w-full h-24 p-2 border rounded mb-4 text-black"
                  placeholder="Enter your feedback..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                >
                  Submit
                </button>
              </form>
              {feedbackStatus && (
                <div className="mt-3 text-sm font-medium">
                  {feedbackStatus}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
