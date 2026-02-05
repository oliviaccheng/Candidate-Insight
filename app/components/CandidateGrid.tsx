import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Users } from "lucide-react";
import Link from "next/link"; // Changed from react-router-dom
import Image from "next/image"; // Next.js Image optimization

const candidates = [
  {
    id: 1,
    name: "Sarah Mitchell",
    party: "Democrat",
    position: "Senate Candidate",
    state: "California",
    image: "https://images.unsplash.com/photo-1645106281521-86da01d1031d",
    bio: "Former state legislator with 15 years of public service experience."
  },
  // ... other candidates
];

export function CandidateGrid() {
  const getPartyColor = (party: string) => {
    switch(party) {
      case "Democrat": return "bg-blue-600 hover:bg-blue-700";
      case "Republican": return "bg-red-600 hover:bg-red-700";
      case "Independent": return "bg-purple-600 hover:bg-purple-700";
      default: return "bg-gray-600 hover:bg-gray-700";
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Users className="w-8 h-8 text-blue-700" />
          <h2 className="text-3xl font-bold text-gray-900">Featured Candidates</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {candidates.map((candidate) => (
            <Link key={candidate.id} href={`/candidate/${candidate.id}`}>
              <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow border-2 border-gray-200 cursor-pointer">
                <div className="relative h-64 bg-gray-200">
                  <Image 
                    src={candidate.image} 
                    alt={candidate.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>
                <CardHeader className="pb-3">
                  <h3 className="text-xl font-bold text-gray-900">{candidate.name}</h3>
                  <Badge className={getPartyColor(candidate.party)}>{candidate.party}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold text-blue-700 mb-2">{candidate.position}</p>
                  <p className="text-sm text-gray-600 mb-2">{candidate.state}</p>
                  <p className="text-sm text-gray-700 line-clamp-3">{candidate.bio}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}