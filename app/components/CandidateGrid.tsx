"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users } from "lucide-react";

import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";

type Candidate = {
  name: string;
  party: string;
  role: string;
  district: string;
  bio: string;
  image_url: string | null;
};
function nameToSlug(name: string) {
  return name.toLowerCase().replaceAll(" ", "-");
}
const previewCandidates: Candidate[] = [
  {
    name: "Tim Burchett",
    party: "Republican",
    role: "Knox",
    district: "TN 2nd",
    bio: "Fiscal conservative and former businessman",
    image_url: "/images/tim_burchett.jpg",
  },
  {
    name: "Michaela Barnett",
    party: "Democratic",
    role: "Knox",
    district: "TN 2nd",
    bio: "Environmental activist, scientist, and entrepreneur",
    image_url: "/images/m_barnett.jpg",
  },
  {
    name: "Mike Davis",
    party: "Republican",
    role: "Knox",
    district: "Knox County Sheriff",
    bio: "Conservative candidate for sheriff with over 30 years of law enforcement experience.",
    image_url: "/images/mike_davis.jpg",
  },
];

export function CandidateGrid() {
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const getPartyColor = (party: string) => {
    switch (party) {
      case "Democrat":
      case "Democratic":
        return "bg-blue-600 hover:bg-blue-700";
      case "Republican":
        return "bg-red-600 hover:bg-red-700";
      case "Independent":
        return "bg-purple-600 hover:bg-purple-700";
      default:
        return "bg-gray-600 hover:bg-gray-700";
    }
  };

  async function runSearch(searchTerm: string) {
    const trimmed = searchTerm.trim();

    if (trimmed.length < 2) {
      setCandidates([]);
      setHasSearched(true);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch candidates");
      }

      const data = await res.json();
      setCandidates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Search error:", error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }

  const displayCandidates = hasSearched ? candidates : [];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Users className="w-8 h-8 text-blue-700" />
          <h2 className="text-3xl font-bold text-gray-900">
            {hasSearched ? "Search Candidates" : "Enter a Name to Search"}
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a candidate's name"
            className="w-full sm:max-w-md rounded-md border border-gray-300 px-4 py-2 text-gray-900 bg-white"
          />
          <button
            onClick={() => runSearch(query)}
            className="rounded-md bg-blue-700 px-5 py-2 text-white hover:bg-blue-800 transition-colors"
          >
            Search
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {!hasSearched &&
            previewCandidates.map((candidate) => {
              const slug = nameToSlug(candidate.name);
              const imageUrl =
                candidate.image_url && candidate.image_url.trim() !== ""
                  ? `${candidate.image_url}`
                  : null;

              return (
                <Link key={candidate.name} href={`/candidate/${slug}`}>
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow border-2 border-gray-200 cursor-pointer">
                    <div className="relative h-64 bg-gray-200">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={candidate.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-500 text-sm">
                          No image available
                        </div>
                      )}
                    </div>

                    <CardHeader className="pb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {candidate.name}
                      </h3>
                      <Badge className={getPartyColor(candidate.party)}>
                        {candidate.party}
                      </Badge>
                    </CardHeader>

                    <CardContent>
                      <p className="text-sm font-semibold text-blue-700 mb-2">
                        {candidate.district}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {candidate.bio}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
        </div>

        {loading && <p className="text-gray-600 mb-6">Loading candidates...</p>}

        {!loading && hasSearched && candidates.length === 0 && (
          <p className="text-gray-600 mb-6">No candidates found.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayCandidates.map((candidate) => {
            const slug = nameToSlug(candidate.name);
            const imageUrl =
              candidate.image_url && candidate.image_url.trim() !== ""
                ? `${candidate.image_url}`
                : null;

            return (
              <Link key={candidate.name} href={`/candidate/${slug}`}>
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow border-2 border-gray-200 cursor-pointer">
                  <div className="relative h-64 bg-gray-200">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={candidate.name}
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-500 text-sm">
                        No image available
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {candidate.name}
                    </h3>
                    <Badge className={getPartyColor(candidate.party)}>
                      {candidate.party}
                    </Badge>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm font-semibold text-blue-700 mb-2">
                      {candidate.district}
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {candidate.bio}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
