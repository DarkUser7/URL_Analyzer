
import { useEffect, useState } from "react";
import { Shield, XCircle, Clock, Download } from "lucide-react";
import Header from "../components/Header";
import ScanHistoryTable from "../components/ScanHistoryTable";
import StatsCard from "../components/StatsCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
  const { user, token } = useAuth();
  const isAuthenticated = !!user;
  const [searchQuery, setSearchQuery] = useState("");
  const [filterThreat, setFilterThreat] = useState("all");
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError("");
    fetch("/api/scan/history", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setScans(
            (data || []).map((scan: any, i: number) => ({
              ...scan,
              id: scan.id || i.toString(),
              timestamp: scan.timestamp ? new Date(scan.timestamp) : new Date(),
            }))
          );
        } else {
          const err = await res.json();
          setError(err.message || "Failed to fetch scan history");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Network error");
        setLoading(false);
      });
  }, [isAuthenticated, token]);

  const filteredScans = scans.filter((scan) => {
    const matchesSearch = scan.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesThreat = filterThreat === "all" || scan.threatLevel === filterThreat;
    return matchesSearch && matchesThreat;
  });

  const handleExport = () => {
    // TODO: implement export
    alert("Export not implemented yet.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        isAuthenticated={isAuthenticated}
        user={user ? { name: user.username, email: user.username, avatar: undefined } : undefined}
        onLogout={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.reload();
        }}
        onProfile={() => {}}
      />
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
            <p className="text-muted-foreground">View and manage your URL scan history</p>
          </div>
          {!isAuthenticated ? (
            <div className="text-center py-12 text-muted-foreground text-lg">
              <p>You must be logged in to view scan history and stats.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                  title="Total Scans"
                  value={scans.length}
                  icon={Shield}
                  description="All time"
                />
                <StatsCard
                  title="Threats Detected"
                  value={scans.filter((s) => s.threatLevel === "malicious").length}
                  icon={XCircle}
                  description={`${scans.filter((s) => s.threatLevel === "suspicious").length} suspicious`}
                />
                <StatsCard
                  title="Safe URLs"
                  value={scans.filter((s) => s.threatLevel === "benign").length}
                  icon={Clock}
                  description={`${scans.length ? Math.round((scans.filter((s) => s.threatLevel === "benign").length / scans.length) * 100) : 0}% safe rate`}
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h2 className="text-2xl font-semibold">Scan History</h2>
                  <Button onClick={handleExport} variant="outline" data-testid="button-export">
                    <Download className="h-4 w-4 mr-2" />
                    Export History
                  </Button>
                </div>
                <div className="flex gap-4 flex-wrap">
                  <Input
                    placeholder="Search URLs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                    data-testid="input-search"
                  />
                  <Select value={filterThreat} onValueChange={setFilterThreat}>
                    <SelectTrigger className="w-[180px]" data-testid="select-filter-threat">
                      <SelectValue placeholder="Filter by threat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Threats</SelectItem>
                      <SelectItem value="benign">Safe</SelectItem>
                      <SelectItem value="suspicious">Suspicious</SelectItem>
                      <SelectItem value="malicious">Malicious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {error && <div className="text-red-500 text-center">{error}</div>}
                <ScanHistoryTable
                  scans={filteredScans}
                  onRowClick={(scan) => console.log("Clicked scan:", scan)}
                />
                {loading && <div className="text-center text-muted-foreground">Loading...</div>}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
