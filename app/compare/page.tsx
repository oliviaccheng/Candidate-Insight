"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { 
  ArrowLeft, 
  Check, 
  X, 
  DollarSign, 
  Users, 
  Award,
  TrendingUp
} from "lucide-react";

// Mock data for comparison
const candidates = [
  {
    id: 1,
    name: "Sarah Mitchell",
    party: "Democrat",
    position: "Senate Candidate",
    state: "California",
    image: "https://images.unsplash.com/photo-1645106281521-86da01d1031d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2xpdGljaWFuJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcwMjQ4NTAwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    stats: {
      funding: "$12.4M",
      volunteers: "8,500",
      endorsements: 145,
      experience: "15 years"
    },
    positions: {
      healthcare: { support: true, detail: "Universal healthcare access" },
      climate: { support: true, detail: "100% renewable by 2035" },
      education: { support: true, detail: "Free community college" },
      taxes: { support: true, detail: "Tax relief for middle class" },
      immigration: { support: true, detail: "Path to citizenship" },
      gunControl: { support: true, detail: "Universal background checks" }
    }
  },
  {
    id: 2,
    name: "James Rodriguez",
    party: "Republican",
    position: "Senate Candidate",
    state: "California",
    image: "https://images.unsplash.com/photo-1645106281521-86da01d1031d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2xpdGljaWFuJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcwMjQ4NTAwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    stats: {
      funding: "$9.8M",
      volunteers: "6,200",
      endorsements: 98,
      experience: "12 years"
    },
    positions: {
      healthcare: { support: false, detail: "Market-based solutions" },
      climate: { support: true, detail: "Balanced energy approach" },
      education: { support: true, detail: "School choice programs" },
      taxes: { support: true, detail: "Lower taxes for businesses" },
      immigration: { support: false, detail: "Border security first" },
      gunControl: { support: false, detail: "Protect 2nd Amendment" }
    }
  },
  {
    id: 3,
    name: "Emily Chen",
    party: "Independent",
    position: "Senate Candidate",
    state: "California",
    image: "https://images.unsplash.com/photo-1645106281521-86da01d1031d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2xpdGljaWFuJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcwMjQ4NTAwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    stats: {
      funding: "$5.2M",
      volunteers: "4,100",
      endorsements: 62,
      experience: "8 years"
    },
    positions: {
      healthcare: { support: true, detail: "Public option system" },
      climate: { support: true, detail: "Green technology investment" },
      education: { support: true, detail: "Debt-free college" },
      taxes: { support: true, detail: "Progressive tax reform" },
      immigration: { support: true, detail: "Comprehensive reform" },
      gunControl: { support: true, detail: "Common-sense regulations" }
    }
  }
];

const policyAreas = [
  { key: "healthcare", label: "Healthcare Reform" },
  { key: "climate", label: "Climate Action" },
  { key: "education", label: "Education Funding" },
  { key: "taxes", label: "Tax Policy" },
  { key: "immigration", label: "Immigration Reform" },
  { key: "gunControl", label: "Gun Control" }
];

export default function CandidateComparisonPage() {
  const [selectedCandidates, setSelectedCandidates] = useState([0, 1, 2]);
  
  const getPartyColor = (party: string) => {
    switch(party) {
      case "Democrat":
        return "bg-blue-600";
      case "Republican":
        return "bg-red-600";
      case "Independent":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-slate-900 text-white py-8">
        <div className="container mx-auto px-4">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-4">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold">Compare Candidates</h1>
          <p className="text-blue-300 mt-2">Side-by-side comparison of positions and qualifications</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Candidate Headers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {selectedCandidates.map((index) => {
            const candidate = candidates[index];
            return (
              <Card key={candidate.id} className="overflow-hidden">
                <div className="h-48 overflow-hidden bg-gray-200">
                  <img 
                    src={candidate.image}
                    alt={candidate.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader className="text-center pb-4">
                  <h2 className="text-2xl font-bold mb-2">{candidate.name}</h2>
                  <Badge className={`${getPartyColor(candidate.party)} mx-auto`}>
                    {candidate.party}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">{candidate.position}</p>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Stats Comparison */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-bold">Campaign Statistics</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Funding */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-blue-700" />
                  <h3 className="font-bold">Campaign Funding</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedCandidates.map((index) => {
                    const candidate = candidates[index];
                    return (
                      <div key={candidate.id} className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-700">{candidate.stats.funding}</p>
                        <p className="text-sm text-gray-600 mt-1">{candidate.name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Volunteers */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-blue-700" />
                  <h3 className="font-bold">Active Volunteers</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedCandidates.map((index) => {
                    const candidate = candidates[index];
                    return (
                      <div key={candidate.id} className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-700">{candidate.stats.volunteers}</p>
                        <p className="text-sm text-gray-600 mt-1">{candidate.name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Endorsements */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-blue-700" />
                  <h3 className="font-bold">Official Endorsements</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedCandidates.map((index) => {
                    const candidate = candidates[index];
                    return (
                      <div key={candidate.id} className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-700">{candidate.stats.endorsements}</p>
                        <p className="text-sm text-gray-600 mt-1">{candidate.name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Experience */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-blue-700" />
                  <h3 className="font-bold">Public Service Experience</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedCandidates.map((index) => {
                    const candidate = candidates[index];
                    return (
                      <div key={candidate.id} className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-700">{candidate.stats.experience}</p>
                        <p className="text-sm text-gray-600 mt-1">{candidate.name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policy Positions Comparison */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold">Policy Positions</h2>
            <p className="text-gray-600">Compare stances on key issues</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {policyAreas.map((policy) => (
                <div key={policy.key} className="border-b border-gray-200 pb-6 last:border-0">
                  <h3 className="font-bold text-lg mb-4">{policy.label}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedCandidates.map((index) => {
                      const candidate = candidates[index];
                      const position = candidate.positions[policy.key as keyof typeof candidate.positions];
                      return (
                        <div 
                          key={candidate.id} 
                          className={`p-4 rounded-lg ${
                            position.support 
                              ? 'bg-green-50 border-2 border-green-200' 
                              : 'bg-red-50 border-2 border-red-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {position.support ? (
                              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                            ) : (
                              <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                            )}
                            <div>
                              <p className="font-semibold text-sm mb-1">{candidate.name}</p>
                              <p className="text-sm text-gray-700">{position.detail}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/candidate/1">
            <Button className="bg-blue-700 hover:bg-blue-800">
              View Sarah Mitchells Profile
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">
              Back to All Candidates
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
