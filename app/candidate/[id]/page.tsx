"use client";

import { YouTubeEmbed } from "@next/third-parties/google";
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
  Facebook,
  Globe,
  Heart,
  Share2,
  MessageCircle,
  DollarSign,
  Award,
  FileText,
  Youtube,
} from "lucide-react";

type SocialPost = {
  id: number;
  platform: string;
  type: string;
  content?: string;
  videoId?: string;
  timestamp: string;
  likes?: number;
  comments?: number;
  shares?: number;
};

// Mock data - in future would come from an API
const candidateData = {
  id: 1,
  name: "Sarah Mitchell",
  party: "Democrat",
  position: "Senate Candidate",
  state: "California",
  image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Minister_Mitchell_July_20_headshot_DSC6710a.jpg/500px-Minister_Mitchell_July_20_headshot_DSC6710a.jpg",
  coverImage: "https://westernweekender.com.au/wp-content/uploads/mitchellmls.jpg",
  bio: "Sarah Mitchell has dedicated her career to public service, with 15 years of experience as a state legislator. A strong advocate for healthcare reform, education, and environmental protection, she has consistently worked across the aisle to deliver results for her constituents.",
  experience: [
    "State Senator (2015-Present)",
    "State Assembly Member (2011-2015)",
    "City Council Member (2008-2011)",
    "Community Organizer (2005-2008)",
  ],
  education: [
    "J.D., Stanford Law School",
    "B.A. Political Science, UC Berkeley",
  ],
  policies: [
    {
      title: "Healthcare Reform",
      description:
        "Universal healthcare access for all Californians, lowering prescription drug costs, and expanding mental health services.",
      support: 78,
    },
    {
      title: "Climate Action",
      description:
        "100% renewable energy by 2035, green jobs initiative, and protecting California's natural resources.",
      support: 72,
    },
    {
      title: "Education",
      description:
        "Increased funding for public schools, free community college, and student debt relief programs.",
      support: 85,
    },
    {
      title: "Economic Growth",
      description:
        "Support for small businesses, infrastructure investment, and job training programs.",
      support: 68,
    },
  ],
  stats: {
    funding: "$12.4M",
    volunteers: "8,500+",
    endorsements: 145,
    townHalls: 67,
  },

  socialMedia: [
    {
      id: 1,
      platform: "X",
      type: "text",
      content:
        "Excited to announce our new healthcare initiative! Together, we can ensure every family has access to quality care.",
      timestamp: "2 hours ago",
      likes: 1243,
      shares: 342,
      comments: 89,
    },
    {
      id: 2,
      platform: "X",
      type: "text",
      content:
        "Thank you to everyone who joined our town hall in Sacramento tonight.",
      timestamp: "1 day ago",
      likes: 892,
      shares: 234,
      comments: 56,
    },
    {
      id: 3,
      platform: "YouTube",
      type: "video",
      videoId: "pP9Hnv8vLls",
      content: "Watch my latest debate on Education with Prue Car.",
      timestamp: "3 days ago",
    },
  ],
  news: [
    {
      id: 1,
      title: "Mitchell Unveils Comprehensive Healthcare Plan",
      source: "California Tribune",
      timestamp: "3 hours ago",
      excerpt:
        "Senate candidate Sarah Mitchell released detailed healthcare reform proposal focusing on universal access and affordability.",
    },
    {
      id: 2,
      title: "Poll Shows Mitchell Leading in Key Demographics",
      source: "Political Wire",
      timestamp: "1 day ago",
      excerpt:
        "Latest survey indicates strong support among suburban voters and young professionals.",
    },
  ],
  endorsements: [
    "California Teachers Association",
    "Sierra Club",
    "National Nurses United",
    "AFL-CIO",
    "League of Conservation Voters",
  ],
};

export default function CandidateProfilePage() {
  useParams(); // kept for future routing

  const getPartyColor = (party: string) => {
    switch (party) {
      case "Democrat":
        return "bg-blue-600";
      case "Republican":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const socialPosts: SocialPost[] = candidateData.socialMedia;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-slate-900 overflow-hidden">
        <img
          src={candidateData.coverImage}
          alt="Campaign"
          className="w-900 h-160 object-cover opacity-40"
        />
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
            <div className="w-40 h-40 rounded-lg overflow-hidden border-4 border-white shadow-xl">
              <img
                src={candidateData.image}
                alt={candidateData.name}
                className="fill=true object-cover"
              />
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-5xl font-bold text-white mb-2">
                {candidateData.name}
              </h1>
              <div className="flex items-center gap-3 mb-3">
                <Badge
                  className={`${getPartyColor(
                    candidateData.party
                  )} text-lg px-4 py-1`}
                >
                  {candidateData.party}
                </Badge>
                <span className="text-xl text-blue-300">
                  {candidateData.position}
                </span>
              </div>
              <div className="flex items-center gap-4 text-gray-300">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {candidateData.state}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Election: November 2026
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-blue-700 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <DollarSign className="w-5 h-5" />
                <span className="text-2xl font-bold">
                  {candidateData.stats.funding}
                </span>
              </div>
              <p className="text-sm text-blue-100">Raised</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-5 h-5" />
                <span className="text-2xl font-bold">
                  {candidateData.stats.volunteers}
                </span>
              </div>
              <p className="text-sm text-blue-100">Volunteers</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Award className="w-5 h-5" />
                <span className="text-2xl font-bold">
                  {candidateData.stats.endorsements}
                </span>
              </div>
              <p className="text-sm text-blue-100">Endorsements</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <MessageCircle className="w-5 h-5" />
                <span className="text-2xl font-bold">
                  {candidateData.stats.townHalls}
                </span>
              </div>
              <p className="text-sm text-blue-100">Town Halls</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
            <TabsTrigger value="overview" className="py-3">
              Overview
            </TabsTrigger>
            <TabsTrigger value="policies" className="py-3">
              Policy Positions
            </TabsTrigger>
            <TabsTrigger value="social" className="py-3">
              Social Media
            </TabsTrigger>
            <TabsTrigger value="news" className="py-3">
              News Coverage
            </TabsTrigger>
            <TabsTrigger value="endorsements" className="py-3">
              Endorsements
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold">Biography</h2>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {candidateData.bio}
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-lg mb-3">Experience</h3>
                    <ul className="space-y-2">
                      {candidateData.experience.map((exp, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{exp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-3">Education</h3>
                    <ul className="space-y-2">
                      {candidateData.education.map((edu, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{edu}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-6">
            {candidateData.policies.map((policy, index) => (
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
          {/* Social Media Tab */}
          <TabsContent value="social" className="space-y-4">
            {socialPosts.map((post) => (
              <Card key={post.id}>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {post.platform === "X" && (
                        <XIcon className="w-5 h-5 text-blue-500 -mb-6" />
                      )}
                      {post.platform === "YouTube" && (
                        <Youtube className="w-5 h-5 text-red-500 -mb-6" />
                      )}
                      <span className="font-semibold -mb-6">
                        {candidateData.name}
                      </span>
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

                  {post.type === "video" && post.videoId && (
                    <div className="aspect-video -mb-68">
                      <YouTubeEmbed videoid={post.videoId} />
                    </div>
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
            ))}
          </TabsContent>
          {/* News Tab */}
          <TabsContent value="news" className="space-y-6">
            {candidateData.news.map((article) => (
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

          {/* Endorsements Tab */}
          <TabsContent value="endorsements">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold">Official Endorsements</h2>
                <p className="text-gray-600">
                  Organizations and groups supporting this campaign
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {candidateData.endorsements.map((endorsement, index) => (
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
