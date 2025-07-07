import { useSession, signIn, signOut } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Home() {
  const { data: session, status } = useSession();
  const userName = session?.user?.name;

  return (
    <>
      <Head>
        <title>Welcome to Skillmate</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-white p-6 overflow-hidden">
        
        {/* Skillmate Logo with animation */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Image
            src="/skillmate image.jpg"
            alt="Skillmate Logo"
            width={64}
            height={64}
            className="rounded-full shadow-md"
          />
        </motion.div>

        {/* Animated Heading */}
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-green-700 mb-6 text-center"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Welcome to <span className="text-black">Skillmate</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          className="text-center text-gray-600 max-w-xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Skillmate connects mentors, creators, and professionals with aspiring learners and businesses to foster meaningful growth. Be your own brand — share knowledge, earn, and grow.
        </motion.p>

        {/* Authentication Section */}
        {status === "loading" ? (
          <p className="text-gray-500">Loading...</p>
        ) : session ? (
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-lg font-medium text-green-800">
              Hi, {userName} 👋
            </p>
            <Link
              href="/dashboard"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl transition"
            >
              Go to Dashboard
            </Link>
            <button
              onClick={() => signOut()}
              className="text-red-500 hover:underline"
            >
              Logout
            </button>
          </motion.div>
        ) : (
          <motion.button
            onClick={() => signIn("google")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-lg font-semibold transition"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Sign in with Google
          </motion.button>
        )}
      </div>
    </>
  );
}
