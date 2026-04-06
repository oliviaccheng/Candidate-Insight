"use client";

import { useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";

import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";

type Article = {
  id: number;
  people_id: number;
  title: string;
  url: string;
  date: string;
  excerpt: string;
  source: string;
  fetched_at: string;
  keywords: string;
};

export function ArticleGrid() {
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  async function runSearch(searchTerm: string) {
    const trimmed = searchTerm.trim();

    if (trimmed.length < 2) {
        setArticles([]);
        setHasSearched(false);
        return;
      }

    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(
        `/api/articles?q=${encodeURIComponent(trimmed)}`,
        {
          cache: "no-store",
        },
      );

      if (!res.ok) throw new Error("Failed to fetch articles");

      const data = await res.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Search error:", error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Users className="w-8 h-8 text-blue-700" />
          <h2 className="text-3xl font-bold text-gray-900">
            {hasSearched ? "Search Articles" : "Enter Keywords to Search"}
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter keywords or phrases"
            className="w-full sm:max-w-md rounded-md border border-gray-300 px-4 py-2 text-gray-900 bg-white"
          />
          <button
            onClick={() => runSearch(query)}
            className="rounded-md bg-blue-700 px-5 py-2 text-white hover:bg-blue-800 transition-colors"
          >
            Search
          </button>
        </div>

        {loading && <p className="text-gray-600 mb-6">Loading articles...</p>}

        {!loading && hasSearched && articles.length === 0 && (
          <p className="text-gray-600 mb-6">No articles found.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow border-2 border-gray-200 cursor-pointer">
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {article.title}
                  </h3>
                  <Badge className="bg-gray-600">{article.source}</Badge>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-gray-700 line-clamp-3 mb-2">
                    {article.excerpt}
                  </p>
                  <p className="text-xs text-gray-500">
                    Date: {new Date(article.date).toLocaleDateString()}
                  </p>
                  {article.keywords && (
                    <p className="text-xs text-gray-500 mt-1">
                      Keywords: {article.keywords}
                    </p>
                  )}
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}