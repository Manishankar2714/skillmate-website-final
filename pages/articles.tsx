import { useEffect, useState } from "react";
import axios from "axios";
import Head from "next/head";

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(() => Math.floor(Math.random() * 10) + 1); // 🎯 random start page
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchArticles = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://dev.to/api/articles?tag=skills&per_page=5&page=${pageNum}`
      );
      if (res.data.length === 0) {
        setError("No more articles found.");
      } else {
        setArticles((prev) => [...prev, ...res.data]);
        console.log(`✅ Fetched ${res.data.length} articles. Total: ${articles.length + res.data.length}`);
      }
    } catch (err) {
      setError("Failed to load articles.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch when `page` changes
  useEffect(() => {
    fetchArticles(page);
  }, [page]);

  // Scroll-to-bottom detection
  useEffect(() => {
    const handleScroll = () => {
      const bottomReached =
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 50;

      if (bottomReached && !loading) {
        setPage((prev) => prev + 1); // 🚀 Load next page
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading]);

  return (
    <>
      <Head>
        <title>Skill Articles | Skillmate</title>
      </Head>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-green-600">📰 Skill Articles</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="space-y-4">
          {articles.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition"
            >
              <h2 className="text-xl font-semibold text-blue-600">{article.title}</h2>
              <p className="text-sm text-gray-600 mt-1">By {article.user.name}</p>
            </a>
          ))}
        </div>

        {loading && (
          <p className="text-center mt-6 text-gray-500">Loading more articles...</p>
        )}
      </div>
    </>
  );
}
