"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Progress } from "../../components/ui/progress";
import { XIcon } from "../../components/ui/XIcon.tsx";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  Heart,
  Share2,
  MessageCircle,
  DollarSign,
  Award,
  FileText,
} from "lucide-react";

type Candidate = {
  name: string;
  party: string;
  state: string;
  county: string;
  electoral_district: string;
  bio: string;
  image: string;
};

type Tweet = {
  text: string;
};

type SocialPost = {
  id: number;
  platform: string;
  type: string;
  content?: string;
  timestamp: string;
  likes?: number;
  comments?: number;
  shares?: number;
};

function slugToName(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function CandidateProfilePage() {
  const params = useParams();
  const id = params?.id as string;

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);

  const candidateNameFromSlug = useMemo(() => slugToName(id || ""), [id]);

  useEffect(() => {
    async function loadCandidate() {
      if (!candidateNameFromSlug) return;

      setLoading(true);

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(candidateNameFromSlug)}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error(`Candidate fetch failed: ${res.status}`);
        }

        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const foundCandidate = data[0];
          setCandidate(foundCandidate);

          const tweetsRes = await fetch(
            `/api/tweets?candidate=${encodeURIComponent(foundCandidate.name)}`,
            { cache: "no-store" }
          );

          if (tweetsRes.ok) {
            const tweetData = await tweetsRes.json();
            setTweets(Array.isArray(tweetData) ? tweetData : []);
          } else {
            setTweets([]);
          }
        } else {
          setCandidate(null);
          setTweets([]);
        }
      } catch (error) {
        console.error("Error loading candidate page:", error);
        setCandidate(null);
        setTweets([]);
      } finally {
        setLoading(false);
      }
    }

    loadCandidate();
  }, [candidateNameFromSlug]);

  const getPartyColor = (party: string) => {
    switch (party) {
      case "Democrat":
      case "Democratic":
        return "bg-blue-600";
      case "Republican":
        return "bg-red-600";
      case "Independent":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };

  const imageUrl =
    candidate?.image && candidate.image.trim() !== ""
      ? `http://127.0.0.1:5000${candidate.image}`
      : "";

  const socialPosts: SocialPost[] = tweets.map((tweet, index) => ({
    id: index + 1,
    platform: "X",
    type: "text",
    content: tweet.text,
    timestamp: "",
    likes: undefined,
    comments: undefined,
    shares: undefined,
  }));

  const demoPolicies = [
    {
      title: "Economic Growth",
      description:
        "Policy details not yet available from the database. This section is currently a frontend placeholder for demo purposes.",
      support: 68,
    },
    {
      title: "Education",
      description:
        "This candidate's education platform can be added once more structured policy data is available in the backend.",
      support: 72,
    },
    {
      title: "Healthcare",
      description:
        "Database integration is currently focused on candidate identity, biography, and tweets.",
      support: 64,
    },
  ];

  const demoStats = {
    funding: "N/A",
    volunteers: "N/A",
    endorsements: "N/A",
    townHalls: "N/A",
  };

  const demoNews = [
    {
      id: 1,
      title: "More detailed news coverage coming soon",
      source: "Candidate Insight",
      timestamp: "Demo Data",
      excerpt:
        "This tab is still using placeholder content until article data is added to the backend.",
    },
  ];

  const demoEndorsements = [
    "No endorsement data loaded yet",
    "Backend support can be added later",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading candidate...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-xl font-semibold text-gray-800">
          Candidate not found.
        </p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-96 bg-slate-900 overflow-hidden">
        {imageUrl ? (
          <img
            src="http://127.0.0.1:5000/static/images/profile_background.jpg"
            alt={candidate.name}
            className="w-full h-full object-cover opacity-30"
          />
        ) : (
          <div className="w-full h-full bg-slate-800" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

        <div className="absolute top-6 left-6">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
          <div className="flex items-end gap-6">
            <div className="w-40 h-40 rounded-lg overflow-hidden border-4 border-white shadow-xl bg-gray-200 flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={candidate.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-600 text-sm">No image</span>
              )}
            </div>

            <div className="flex-1 pb-2">
              <h1 className="text-5xl font-bold text-white mb-2">
                {candidate.name}
              </h1>

              <div className="flex items-center gap-3 mb-3">
                <Badge
                  className={`${getPartyColor(candidate.party)} text-lg px-4 py-1`}
                >
                  {candidate.party}
                </Badge>
                <span className="text-xl text-blue-300">
                  {candidate.electoral_district}
                </span>
              </div>

              <div className="flex items-center gap-4 text-gray-300 flex-wrap">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {candidate.state}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Election: November 2026
                </span>
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  County: {candidate.county}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-700 text-white py-6">
        <div className="container mx-auto px-4">
{/*           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <DollarSign className="w-5 h-5" />
                <span className="text-2xl font-bold">{demoStats.funding}</span>
              </div>
              <p className="text-sm text-blue-100">Raised</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-5 h-5" />
                <span className="text-2xl font-bold">
                  {demoStats.volunteers}
                </span>
              </div>
              <p className="text-sm text-blue-100">Volunteers</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Award className="w-5 h-5" />
                <span className="text-2xl font-bold">
                  {demoStats.endorsements}
                </span>
              </div>
              <p className="text-sm text-blue-100">Endorsements</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <MessageCircle className="w-5 h-5" />
                <span className="text-2xl font-bold">
                  {demoStats.townHalls}
                </span>
              </div>
              <p className="text-sm text-blue-100">Town Halls</p>
            </div>
          </div> */}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 h-auto">
            <TabsTrigger value="overview" className="py-3">
              Overview
            </TabsTrigger>
            <TabsTrigger value="policies" className="py-3">
              Policy Positions
            </TabsTrigger>
            <TabsTrigger value="social" className="py-3">
              Social Media
            </TabsTrigger>
{/*             <TabsTrigger value="news" className="py-3">
              News Coverage
            </TabsTrigger>
            <TabsTrigger value="endorsements" className="py-3">
              Endorsements
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold">Biography</h2>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {candidate.bio || "No biography available."}
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-lg mb-3">District Info</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">
                          Office: {candidate.electoral_district}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">
                          State: {candidate.state}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">
                          County: {candidate.county}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            {demoPolicies.map((policy, index) => (
              <Card key={index}>
                <CardHeader>
                  <h3 className="text-xl font-bold">{policy.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{policy.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Public Support</span>
                      <span className="font-semibold text-blue-700">
                        {policy.support}%
                      </span>
                    </div>
                    <Progress value={policy.support} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="social" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {socialPosts.length === 0 ? (
              <Card>
                <CardContent className="py-6">
                  <p className="text-gray-600">No tweets found for this candidate.</p>
                </CardContent>
              </Card>
            ) : (
              socialPosts.map((post) => (
                <Card key={post.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {post.platform === "X" && (
                          <XIcon className="w-5 h-5 text-blue-500" />
                        )}
                        <span className="font-semibold">{candidate.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {post.timestamp}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-2 pb-3">
                    {post.content && (
                      <p className="text-gray-700 mb-6">{post.content}</p>
                    )}

                    {(post.likes || post.comments || post.shares) && (
                      <div className="flex gap-6 text-gray-600">
                        {post.comments && (
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {post.comments}
                          </span>
                        )}
                        {post.shares && (
                          <span className="flex items-center gap-1">
                            <Share2 className="w-4 h-4" />
                            {post.shares}
                          </span>
                        )}
                        {post.likes && (
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {post.likes}
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            {demoNews.map((article) => (
              <Card key={article.id}>
                <CardHeader>
                  <h3 className="text-xl font-bold text-gray-900">
                    {article.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{article.source}</span>
                    <span>{article.timestamp}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{article.excerpt}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="endorsements">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold">Official Endorsements</h2>
                <p className="text-gray-600">
                  Endorsement data is not yet connected to the backend.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {demoEndorsements.map((endorsement, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <Award className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">{endorsement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}