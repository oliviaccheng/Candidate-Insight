export function Footer() {
  return (
    <footer className="bg-slate-800 text-gray-300 border-t-4 border-blue-600">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-white mb-3">About</h3>
            <p className="text-sm">
              Candidate Insight provides comprehensive tracking and analysis of political candidates in the East TN region.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-3">Data Sources</h3>
            <p className="text-sm">
              Information compiled from official campaign filings, verified news sources, public records, and social media.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-3">Policy</h3>
            <ul className="text-sm space-y-1">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Editorial Guidelines</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          <p>A website created by students to increase informed political engagement.</p>
          <p className="mt-2">© 2026 Candidate Insight. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
