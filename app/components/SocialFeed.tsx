"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { MessageCircle, Heart, Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { XIcon } from "./ui/XIcon";

type Post = {
  id: string;
  candidate: string;
  handle: string;
  content: string;
  timestamp: string;
};

type Tweet = {
  text: string;
};

const demoCandidates = [
  "Michaela Barnett",
  "Mike Davis",
  "Tim Burchett",
];

export function SocialFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeed() {
      try {
        const tweetResults = await Promise.all(
          demoCandidates.map(async (candidateName) => {
            const res = await fetch(
              `/api/tweets?candidate=${encodeURIComponent(candidateName)}`,
              { cache: "no-store" }
            );

            const tweets: Tweet[] = res.ok ? await res.json() : [];

            return tweets.slice(0, 2).map((tweet, index) => ({
              id: `${candidateName}-${index}`,
              candidate: candidateName,
              handle: `@${candidateName.toLowerCase().replaceAll(" ", "")}`,
              content: tweet.text,
              timestamp: "Recent",
            }));
          })
        );

        setPosts(tweetResults.flat());
      } catch (err) {
        console.error("Failed to load social feed:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <XIcon className="w-8 h-8 text-blue-500" />
          <h2 className="text-3xl font-bold text-gray-900">
            Latest Updates
          </h2>
        </div>

        {loading && (
          <p className="text-gray-600 mb-6">Loading updates...</p>
        )}

        {!loading && posts.length === 0 && (
          <p className="text-gray-600 mb-6">
            No updates available yet.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="hover:shadow-lg transition-shadow border-2 border-gray-200"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {post.candidate}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {post.handle}
                    </p>
                  </div>
                  <XIcon className="w-5 h-5 text-blue-500" />
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-gray-700 mb-4 leading-relaxed break-words">
                  {post.content}
                </p>

{/*                 <p className="text-sm text-gray-500 mb-4">
                  {post.timestamp}
                </p> */}

        
               {/*  <div className="flex gap-6 text-gray-600">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 hover:text-blue-600"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">—</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 hover:text-green-600"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">—</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 hover:text-red-600"
                  >
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">—</span>
                  </Button>
                </div> */}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}