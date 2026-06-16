import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function DemoDashboardPage() {
  const positions = [
    { id: "1", title: "Junior Financial Analyst", opportunity_type: "Full-time employment", location: "México City", description: "Join our finance team to support investment analysis and client reporting.", is_active: true },
    { id: "2", title: "Social Impact Intern", opportunity_type: "Internship", location: "Remote", description: "Work with our CSR team on community impact measurement projects.", is_active: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <span className="font-brand text-xl text-blue-700">LaLa Match</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Grupo Financiero Demo</span>
          <Button variant="outline" size="sm">Edit profile</Button>
          <Button variant="ghost" size="sm">Sign out</Button>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome, Grupo Financiero Demo</h1>
          <p className="text-gray-500 mt-1">Manage your positions and find the best LaLideres for your team.</p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your positions</h2>
            <Button size="sm">+ Post position</Button>
          </div>
          <div className="grid gap-4">
            {positions.map((pos) => (
              <Card key={pos.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{pos.title}</CardTitle>
                      <CardDescription>{pos.opportunity_type} · {pos.location}</CardDescription>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{pos.description}</p>
                </CardContent>
                <CardFooter>
                  <Link href="/demo/matches">
                    <Button size="sm">View AI matches</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
