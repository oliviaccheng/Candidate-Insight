"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Progress } from "../../components/ui/progress";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  TrendingUp, 
  Twitter,
  Facebook,
  Globe,
  Heart,
  Share2,
  MessageCircle,
  DollarSign,
  Award,
  FileText
} from "lucide-react";

// Mock data - in real app would come from API/props
const candidateData = {
  id: 1,
  name: "Sarah Mitchell",
  party: "Democrat",
  position: "Senate Candidate",
  state: "California",
  image: "https://images.unsplash.com/photo-1645106281521-86da01d1031d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2xpdGljaWFuJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcwMjQ4NTAwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  coverImage: "https://images.unsplash.com/photo-1691026336764-f24456f76e03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2xpdGljaWFuJTIwc3BlYWtpbmclMjBwb2RpdW18ZW58MXx8fHwxNzcwMjQ5MDI4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  bio: "Sarah Mitchell has dedicated her career to public service, with 15 years of experience as a state legislator. A strong advocate for healthcare reform, education, and environmental protection, she has consistently worked across the aisle to deliver results for her constituents.",
  experience: [
    "State Senator (2015-Present)",
    "State Assembly Member (2011-2015)",
    "City Council Member (2008-2011)",
    "Community Organizer (2005-2008)"
  ],
  education: [
    "J.D., Stanford Law School",
    "B.A. Political Science, UC Berkeley"
  ],
  policies: [
    {
      title: "Healthcare Reform",
      description: "Universal healthcare access for all Californians, lowering prescription drug costs, and expanding mental health services.",
      support: 78
    },
    {
      title: "Climate Action",
      description: "100% renewable energy by 2035, green jobs initiative, and protecting California's natural resources.",
      support: 72
    },
    {
      title: "Education",
      description: "Increased funding for public schools, free community college, and student debt relief programs.",
      support: 85
    },
    {
      title: "Economic Growth",
      description: "Support for small businesses, infrastructure investment, and job training programs.",
      support: 68
    }
  ],
  stats: {
    funding: "$12.4M",
    volunteers: "8,500+",
    endorsements: 145,
    townHalls: 67
  },
  socialMedia: [
    {
      id: 1,
      platform: "Twitter",
      content: "Excited to announce our new healthcare initiative! Together, we can ensure every family has access to quality care. #HealthcareForAll #CA2026",
      timestamp: "2 hours ago",
      likes: 1243,
      retweets: 342,
      comments: 89
    },
    {
      id: 2,
      platform: "Twitter",
      content: "Thank you to everyone who joined our town hall in Sacramento tonight. Your voices matter, and I'm committed to fighting for your priorities in Washington.",
      timestamp: "1 day ago",
      likes: 892,
      retweets: 234,
      comments: 56
    }
  ],
  news: [
    {
      id: 1,
      title: "Mitchell Unveils Comprehensive Healthcare Plan",
      source: "California Tribune",
      timestamp: "3 hours ago",
      excerpt: "Senate candidate Sarah Mitchell released detailed healthcare reform proposal focusing on universal access and affordability."
    },
    {
      id: 2,
      title: "Poll Shows Mitchell Leading in Key Demographics",
      source: "Political Wire",
      timestamp: "1 day ago",
      excerpt: "Latest survey indicates strong support among suburban voters and young professionals."
    }
  ],
  endorsements: [
    "California Teachers Association",
    "Sierra Club",
    "National Nurses United",
    "AFL-CIO",
    "League of Conservation Voters"
  ]
};

export default function CandidateProfilePage() {
  const params = useParams();
  const id = params?.id;
  
  const getPartyColor = (party: string) => {
    switch(party) {
      case "Democrat":
        return "bg-blue-600 hover:bg-blue-700";
      case "Republican":
        return "bg-red-600 hover:bg-red-700";
      case "Independent":
        return "bg-purple-600 hover:bg-purple-700";
      default:
        return "bg-gray-600 hover:bg-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-slate-900 overflow-hidden">
        <img 
          src={candidateData.coverImage}
          alt="Campaign"
          className="w-full h-full object-cover opacity-40"
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
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-5xl font-bold text-white mb-2">{candidateData.name}</h1>
              <div className="flex items-center gap-3 mb-3">
                <Badge className={`${getPartyColor(candidateData.party)} text-lg px-4 py-1`}>
                  {candidateData.party}
                </Badge>
                <span className="text-xl text-blue-300">{candidateData.position}</span>
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
                <span className="text-2xl font-bold">{candidateData.stats.funding}</span>
              </div>
              <p className="text-sm text-blue-100">Raised</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-5 h-5" />
                <span className="text-2xl font-bold">{candidateData.stats.volunteers}</span>
              </div>
              <p className="text-sm text-blue-100">Volunteers</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Award className="w-5 h-5" />
                <span className="text-2xl font-bold">{candidateData.stats.endorsements}</span>
              </div>
              <p className="text-sm text-blue-100">Endorsements</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <MessageCircle className="w-5 h-5" />
                <span className="text-2xl font-bold">{candidateData.stats.townHalls}</span>
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
            <TabsTrigger value="overview" className="py-3">Overview</TabsTrigger>
            <TabsTrigger value="policies" className="py-3">Policy Positions</TabsTrigger>
            <TabsTrigger value="social" className="py-3">Social Media</TabsTrigger>
            <TabsTrigger value="news" className="py-3">News Coverage</TabsTrigger>
            <TabsTrigger value="endorsements" className="py-3">Endorsements</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold">Biography</h2>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-6">{candidateData.bio}</p>
                
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
                      <span className="font-semibold text-blue-700">{policy.support}%</span>
                    </div>
                    <Progress value={policy.support} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social" className="space-y-6">
            <div className="flex gap-4 mb-6">
              <Button variant="outline" className="gap-2">
                <Twitter className="w-4 h-4" />
                Follow on Twitter
              </Button>
              <Button variant="outline" className="gap-2">
                <Facebook className="w-4 h-4" />
                Follow on Facebook
              </Button>
              <Button variant="outline" className="gap-2">
                <Globe className="w-4 h-4" />
                Visit Website
              </Button>
            </div>
            
            {candidateData.socialMedia.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Twitter className="w-5 h-5 text-blue-500" />
                      <span className="font-semibold">{candidateData.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{post.timestamp}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{post.content}</p>
                  <div className="flex gap-6 text-gray-600">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <MessageCircle className="w-4 h-4" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Share2 className="w-4 h-4" />
                      {post.retweets}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Heart className="w-4 h-4" />
                      {post.likes}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-6">
            {candidateData.news.map((article) => (
              <Card key={article.id}>
                <CardHeader>
                  <h3 className="text-xl font-bold text-gray-900">{article.title}</h3>
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
                <p className="text-gray-600">Organizations and groups supporting this campaign</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {candidateData.endorsements.map((endorsement, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
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
