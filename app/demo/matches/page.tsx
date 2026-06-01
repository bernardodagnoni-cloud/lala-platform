import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const matches = [
  {
    name: "María González",
    score: 9,
    matchReason: "María's background in economics from UNAM and her experience as a junior analyst at Banco Regional make her an excellent fit for this financial analyst role. Her data analysis and Python skills align directly with the position's requirements.",
    gaps: "Limited exposure to investment banking specifically, but her foundation is strong."
  },
  {
    name: "Carlos Ramírez",
    score: 8,
    matchReason: "Carlos has a finance degree from TEC de Monterrey and a data science internship at a fintech startup. His Python and Excel skills, combined with bilingual fluency, match the role's technical and communication needs well.",
    gaps: "No prior experience in traditional banking environments."
  },
  {
    name: "Ana Sofía Morales",
    score: 7,
    matchReason: "Ana's accounting background and recent CFA Level 1 preparation show strong financial acumen. Her work at a consulting firm adds practical business exposure relevant to client reporting tasks.",
    gaps: "Less hands-on experience with financial modeling tools compared to the top candidates."
  },
];

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8 ? "bg-green-100 text-green-800" :
    score >= 6 ? "bg-yellow-100 text-yellow-800" :
    "bg-orange-100 text-orange-800";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {score}/10
    </span>
  );
}

export default function DemoMatchesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-xl text-blue-700">LALA Platform</span>
        <Link href="/demo">
          <Button variant="ghost" size="sm">← Dashboard</Button>
        </Link>
      </nav>
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Junior Financial Analyst</h1>
          <p className="text-gray-500 mt-1">Full-time employment · México City</p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">3 matched candidates</h2>
            <Button variant="outline" size="sm">Re-run matching</Button>
          </div>
          {matches.map((match, i) => (
            <Card key={match.name}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">#{i + 1} — {match.name}</CardTitle>
                    <CardDescription>Match score</CardDescription>
                  </div>
                  <ScoreBadge score={match.score} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Why they fit</p>
                  <p className="text-sm text-gray-600">{match.matchReason}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Potential gaps</p>
                  <p className="text-sm text-gray-500">{match.gaps}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
