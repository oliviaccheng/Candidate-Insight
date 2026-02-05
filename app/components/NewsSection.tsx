import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Newspaper, Clock } from "lucide-react";

const articles = [
  {
    id: 1,
    title: "Presidential Debate Highlights: Key Takeaways from Last Night's Discussion",
    source: "Political Times",
    category: "Presidential",
    timestamp: "3 hours ago",
    image: "https://images.unsplash.com/photo-1763674561330-5f87d703ea0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXdzJTIwbWVkaWElMjBicm9hZGNhc3R8ZW58MXx8fHwxNzcwMjEwODI4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    excerpt: "Candidates clashed on healthcare, economy, and foreign policy during the heated two-hour debate."
  },
  {
    id: 2,
    title: "California Senate Race Heats Up as Candidates Present Competing Plans",
    source: "Capitol Report",
    category: "Senate",
    timestamp: "6 hours ago",
    image: "https://images.unsplash.com/photo-1730303905185-5d86f03907fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2xpdGljYWwlMjBjYW1wYWlnbiUyMHJhbGx5fGVufDF8fHx8MTc3MDI0ODUwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    excerpt: "New polling shows tight race as both candidates unveil comprehensive infrastructure proposals."
  },
  {
    id: 3,
    title: "Texas Gubernatorial Candidates Focus on Border Security and Education",
    source: "State Politics Daily",
    category: "Governor",
    timestamp: "12 hours ago",
    image: "https://images.unsplash.com/photo-1637768315794-c8345fc33a9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3Zlcm5tZW50JTIwYnVpbGRpbmclMjBjYXBpdG9sfGVufDF8fHx8MTc3MDI0ODUwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    excerpt: "Campaign trail stops highlight contrasting approaches to state's biggest challenges."
  },
  {
    id: 4,
    title: "Independent Candidates Gain Momentum in Key House Races Nationwide",
    source: "Election Watch",
    category: "House",
    timestamp: "1 day ago",
    image: "https://images.unsplash.com/photo-1763674561330-5f87d703ea0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXdzJTIwbWVkaWElMjBicm9hZGNhc3R8ZW58MXx8fHwxNzcwMjEwODI4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    excerpt: "Third-party candidates see surge in support as voters seek alternatives to traditional parties."
  },
  {
    id: 5,
    title: "Campaign Finance Reports Reveal Major Fundraising Gaps",
    source: "Democracy Watch",
    category: "Analysis",
    timestamp: "1 day ago",
    image: "https://images.unsplash.com/photo-1637768315794-c8345fc33a9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3Zlcm5tZW50JTIwYnVpbGRpbmclMjBjYXBpdG9sfGVufDF8fHx8MTc3MDI0ODUwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    excerpt: "Latest quarterly filings show dramatic differences in campaign war chests across races."
  },
  {
    id: 6,
    title: "Town Hall Series Brings Candidates Directly to Voters",
    source: "Civic Voice",
    category: "Community",
    timestamp: "2 days ago",
    image: "https://images.unsplash.com/photo-1730303905185-5d86f03907fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2xpdGljYWwlMjBjYW1wYWlnbiUyMHJhbGx5fGVufDF8fHx8MTc3MDI0ODUwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    excerpt: "Interactive forums give constituents chance to directly question candidates on local issues."
  }
];

export function NewsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Newspaper className="w-8 h-8 text-blue-700" />
          <h2 className="text-3xl font-bold text-gray-900">Latest News</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-gray-200 flex flex-col">
              <div className="h-48 overflow-hidden bg-gray-200">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader className="pb-3 flex-grow">
                <div className="flex gap-2 mb-2">
                  <Badge variant="outline" className="border-blue-600 text-blue-600">
                    {article.category}
                  </Badge>
                </div>
                <h3 className="font-bold text-gray-900 leading-tight mb-2">{article.title}</h3>
                <p className="text-sm text-gray-600">{article.excerpt}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="font-medium">{article.source}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{article.timestamp}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
