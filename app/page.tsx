import { FeaturedRaces } from "./components/FeaturedRaces";
import { CandidateGrid } from "./components/CandidateGrid";
import { SocialFeed } from "./components/SocialFeed";
import { NewsSection } from "./components/NewsSection";

export default function HomePage() {
  return (
    <main>
      <FeaturedRaces />
      <CandidateGrid />
      <SocialFeed />
      <NewsSection />
    </main>
  );
}