import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import ThreatBadge from "./ThreatBadge";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

type ThreatLevel = "benign" | "suspicious" | "malicious" | "scanning";

interface ScanHistory {
  id: string;
  url: string;
  threatLevel: ThreatLevel;
  confidence: number;
  timestamp: Date;
}

interface ScanHistoryTableProps {
  scans: ScanHistory[];
  onRowClick?: (scan: ScanHistory) => void;
}

export default function ScanHistoryTable({ scans, onRowClick }: ScanHistoryTableProps) {
  if (scans.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No scan history yet</p>
        <p className="text-sm mt-2">Your scanned URLs will appear here</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg" data-testid="table-scan-history">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>URL</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Scanned</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scans.map((scan) => (
            <TableRow
              key={scan.id}
              className="cursor-pointer hover-elevate"
              onClick={() => onRowClick?.(scan)}
              data-testid={`row-scan-${scan.id}`}
            >
              <TableCell className="font-mono text-sm max-w-md truncate" data-testid={`text-url-${scan.id}`}>
                {scan.url}
              </TableCell>
              <TableCell>
                <ThreatBadge level={scan.threatLevel} />
              </TableCell>
              <TableCell data-testid={`text-confidence-${scan.id}`}>{scan.confidence}%</TableCell>
              <TableCell className="text-muted-foreground text-sm" data-testid={`text-timestamp-${scan.id}`}>
                {formatDistanceToNow(scan.timestamp, { addSuffix: true })}
              </TableCell>
              <TableCell>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  asChild
                  onClick={(e) => e.stopPropagation()}
                  data-testid={`button-visit-${scan.id}`}
                >
                  <a href={scan.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
