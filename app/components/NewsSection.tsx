"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Newspaper, Clock } from "lucide-react";

type CandidateProfileResponse = {
  candidate: {
    people_id: number;
    name: string;
    party: string;
    role: string;
    district: string;
  };
  articles: {
    title: string;
    url: string;
    date: string;
    excerpt: string;
    source: string;
    fetched_at: string;
  }[];
};

type ArticleCard = {
  id: string;
  title: string;
  source: string;
  category: string;
  timestamp: string;
  excerpt: string;
  url: string;
  candidateName: string;
};

const demoCandidates = [
  //{ name: "Michaela Barnett", peopleId: 0 }, // replace with real ID
  // { name: "Mike Davis", peopleId: 0 },       // replace with real ID
  { name: "Timothy Hill", peopleId: 7178 }     // replace with real ID
];

function formatDate(dateString: string) {
  if (!dateString) return "Recent";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString();
}

export function NewsSection() {
  const [articles, setArticles] = useState<ArticleCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticles() {
      try {
        const results = await Promise.all(
          demoCandidates.map(async (candidate) => {
            if (!candidate.peopleId) return [];

            const res = await fetch(
              `/api/scrape/candidate/${candidate.peopleId}`,
              { cache: "no-store" }
            );

            if (!res.ok) return [];

            const data: CandidateProfileResponse = await res.json();
            console.log("candidate profile response", candidate.peopleId, data);

            return (data.articles || []).slice(6, 12).map((article, index) => ({
              id: `${candidate.peopleId}-${index}-${article.title}`,
              title: article.title,
              source: article.source || "Unknown Source",
              category: data.candidate?.district || "Local Race",
              timestamp: formatDate(article.date),
              excerpt: article.excerpt || "No excerpt available.",
              url: article.url,
              candidateName: data.candidate?.name || candidate.name,
            }));
          })
        );

        setArticles(results.flat());
      } catch (error) {
        console.error("Failed to load articles:", error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }

    loadArticles();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Newspaper className="w-8 h-8 text-blue-700" />
          <h2 className="text-3xl font-bold text-gray-900">Latest News</h2>
        </div>

        {loading && <p className="text-gray-600 mb-6">Loading articles...</p>}

        {!loading && articles.length === 0 && (
          <p className="text-gray-600 mb-6">No articles available yet.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-gray-200 flex flex-col h-full">
{/*                 <div className="h-48 overflow-hidden bg-gray-200 flex items-center justify-center">
                  <Newspaper className="w-12 h-12 text-gray-400" />
                </div> */}

                <CardHeader className="pb-3 flex-grow">
                  <div className="flex gap-2 mb-2 flex-wrap">
{/*                     <Badge variant="outline" className="border-blue-600 text-blue-600">
                      {article.category}
                    </Badge> */}
{/*                     <Badge variant="outline">
                      {article.candidateName}
                    </Badge> */}
                  </div>

                  <h3 className="font-bold text-gray-900 leading-tight mb-2">
                    {article.title}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-4">
                    {article.excerpt}
                  </p>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-gray-500 gap-4">
                    <span className="font-medium truncate">{article.source}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <Clock className="w-4 h-4" />
                      <span>{article.timestamp}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}