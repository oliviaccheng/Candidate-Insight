import { FeaturedRaces } from "./components/FeaturedRaces";
import { CandidateGrid } from "./components/CandidateGrid";
import { SocialFeed } from "./components/SocialFeed";
import { NewsSection } from "./components/NewsSection";
import { ArticleGrid } from "./components/ArticleGrid";

export default function HomePage() {
  return (
    <main>
      {/*  <FeaturedRaces /> */}
      <CandidateGrid />
      <ArticleGrid />
      <SocialFeed />
      {/* <NewsSection /> */}
    </main>
  );
}
