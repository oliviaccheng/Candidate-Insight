import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

const races = [
  {
    id: 1,
    title: "Presidential Race 2026",
    state: "National",
    type: "Presidential",
    status: "Active",
    image: "https://images.unsplash.com/photo-1637768315794-c8345fc33a9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3Zlcm5tZW50JTIwYnVpbGRpbmclMjBjYXBpdG9sfGVufDF8fHx8MTc3MDI0ODUwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: 2,
    title: "Senate Race - California",
    state: "California",
    type: "Senate",
    status: "Active",
    image: "https://images.unsplash.com/photo-1730303905185-5d86f03907fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2xpdGljYWwlMjBjYW1wYWlnbiUyMHJhbGx5fGVufDF8fHx8MTc3MDI0ODUwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: 3,
    title: "Gubernatorial - Texas",
    state: "Texas",
    type: "Governor",
    status: "Upcoming",
    image: "https://images.unsplash.com/photo-1637768315794-c8345fc33a9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3Zlcm5tZW50JTIwYnVpbGRpbmclMjBjYXBpdG9sfGVufDF8fHx8MTc3MDI0ODUwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  }
];

export function FeaturedRaces() {
  return (
    <section className="bg-blue-700 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-white text-center mb-8">Featured Races</h2>
        
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-12">
            {races.map((race) => (
              <Card key={race.id} className="overflow-hidden hover:shadow-2xl transition-shadow bg-red-800 border-0">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={race.image} 
                    alt={race.title}
                    className="w-full h-full object-cover opacity-70"
                  />
                </div>
                <CardContent className="p-6 text-white">
                  <div className="flex gap-2 mb-3">
                    <Badge className="bg-blue-600 hover:bg-blue-700">{race.type}</Badge>
                    <Badge variant="outline" className="border-white text-white">{race.status}</Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{race.title}</h3>
                  <p className="text-blue-100">{race.state}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </div>
      </div>
    </section>
  );
}
