import { Card, CardContent, CardHeader } from "./ui/card";
import { MessageCircle, Heart, Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { XIcon } from "./ui/XIcon.tsx";

const posts = [
  {
    id: 1,
    candidate: "Sarah Mitchell",
    handle: "@sarahmitchell",
    content: "Excited to announce our new healthcare initiative! Together, we can ensure every family has access to quality care. #HealthcareForAll #CA2026",
    timestamp: "2 hours ago",
    likes: 1243,
    retweets: 342,
    comments: 89
  },
  {
    id: 2,
    candidate: "James Rodriguez",
    handle: "@jamesrodriguez",
    content: "Met with small business owners today in Houston. Their stories inspire our economic plan. Let's build a stronger Texas together! 🇺🇸",
    timestamp: "5 hours ago",
    likes: 892,
    retweets: 234,
    comments: 56
  },
  {
    id: 3,
    candidate: "Emily Chen",
    handle: "@emilychen",
    content: "Climate change isn't a partisan issue—it's a human issue. Our children deserve a sustainable future. Here's our plan: [link]",
    timestamp: "1 day ago",
    likes: 2156,
    retweets: 678,
    comments: 234
  }
];

export function SocialFeed() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <XIcon className="w-8 h-8 text-blue-500" />
          <h2 className="text-3xl font-bold text-gray-900">Latest Updates</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow border-2 border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{post.candidate}</h3>
                    <p className="text-sm text-gray-500">{post.handle}</p>
                  </div>
                  <XIcon className="w-5 h-5 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>
                <p className="text-sm text-gray-500 mb-4">{post.timestamp}</p>
                
                <div className="flex gap-6 text-gray-600">
                  <Button variant="ghost" size="sm" className="gap-2 hover:text-blue-600">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{post.comments}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2 hover:text-green-600">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">{post.retweets}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2 hover:text-red-600">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{post.likes}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
