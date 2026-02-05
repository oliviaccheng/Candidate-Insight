import { Eye } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link"; // Changed from react-router-dom

export function Header() {
  return (
    <header className="bg-slate-900 text-white border-b-4 border-blue-600">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Eye className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold tracking-tight">CANDIDATE INSIGHT</h1>
          </Link>
        </div>
        
        <nav className="flex justify-center flex gap-4 sm:gap-40 bg-slate-800 rounded-lg px-6 py-4 overflow-x-auto">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:text-blue-400 hover:bg-slate-700 whitespace-nowrap">
              Current Races
            </Button>
          </Link>
          <Link href="/candidate/1">
            <Button variant="ghost" className="text-white hover:text-blue-400 hover:bg-slate-700 whitespace-nowrap">
              Candidate Search
            </Button>
          </Link>
          <Link href="/compare">
            <Button variant="ghost" className="text-white hover:text-blue-400 hover:bg-slate-700 whitespace-nowrap">
              Compare Candidates
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}