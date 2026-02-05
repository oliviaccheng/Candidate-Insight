import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import "./styles/index.css";

export const metadata = {
  title: "Candidate Insight - Political Candidate Tracker",
  description: "Track and compare political candidates across the nation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-white">
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
