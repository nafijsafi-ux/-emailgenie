import { useState } from "react";
import { format } from "date-fns";
import { Star, Search, Download, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useHistory, HistoryEntry } from "@/hooks/use-history";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function HistoryPage() {
  const { entries, updateEntry, clearAll } = useHistory();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.intent.toLowerCase().includes(search.toLowerCase()) ||
      entry.businessName.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" || (activeTab === "starred" && entry.starred);
    return matchesSearch && matchesTab;
  });

  const exportToCSV = () => {
    if (entries.length === 0) return;

    const headers = [
      "Date",
      "Business Name",
      "Intent",
      "Tone",
      "Model A Overall",
      "Model A Fact",
      "Model A Tone",
      "Model A Quality",
      "Model B Overall",
      "Model B Fact",
      "Model B Tone",
      "Model B Quality",
    ].join(",");

    const rows = entries.map((e) => {
      return [
        format(e.timestamp, "yyyy-MM-dd HH:mm"),
        `"${e.businessName}"`,
        `"${e.intent}"`,
        e.tone,
        e.modelAEval.overallScore,
        e.modelAEval.factRecallScore,
        e.modelAEval.toneAccuracyScore,
        e.modelAEval.professionalQualityScore,
        e.modelBEval.overallScore,
        e.modelBEval.factRecallScore,
        e.modelBEval.toneAccuracyScore,
        e.modelBEval.professionalQualityScore,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "emailgenie_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generation History</h1>
          <p className="text-sm text-muted-foreground mt-1">Review past comparisons and evaluation metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportToCSV} disabled={entries.length === 0}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={entries.length === 0}>
                <Trash2 className="w-4 h-4 mr-2" /> Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your generation history from this browser.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Yes, delete history
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <TabsList className="bg-card border border-border/50">
            <TabsTrigger value="all">All Generations ({entries.length})</TabsTrigger>
            <TabsTrigger value="starred">Starred ({entries.filter((e) => e.starred).length})</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search intent or business..."
              className="pl-9 bg-card/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="all" className="space-y-4 mt-0">
          {filteredEntries.length === 0 ? (
            <EmptyState search={search} />
          ) : (
            filteredEntries.map((entry) => (
              <HistoryCard key={entry.id} entry={entry} onToggleStar={() => updateEntry(entry.id, { starred: !entry.starred })} />
            ))
          )}
        </TabsContent>

        <TabsContent value="starred" className="space-y-4 mt-0">
          {filteredEntries.length === 0 ? (
            <EmptyState search={search} isStarredTab />
          ) : (
            filteredEntries.map((entry) => (
              <HistoryCard key={entry.id} entry={entry} onToggleStar={() => updateEntry(entry.id, { starred: !entry.starred })} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ search, isStarredTab }: { search: string; isStarredTab?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl border-dashed bg-card/20">
      <div className="bg-secondary/30 p-4 rounded-full mb-4">
        {isStarredTab ? <Star className="w-8 h-8 text-muted-foreground" /> : <Search className="w-8 h-8 text-muted-foreground" />}
      </div>
      <h3 className="text-xl font-semibold mb-2">No entries found</h3>
      <p className="text-muted-foreground text-sm max-w-sm">
        {search
          ? `We couldn't find any results matching "${search}".`
          : isStarredTab
          ? "You haven't starred any comparisons yet."
          : "You haven't generated any emails yet. Head over to the Generator to get started."}
      </p>
    </div>
  );
}

function HistoryCard({ entry, onToggleStar }: { entry: HistoryEntry; onToggleStar: () => void }) {
  const [expanded, setExpanded] = useState(false);

  const modelAWinner = entry.modelAEval.overallScore >= entry.modelBEval.overallScore;
  const modelBWinner = entry.modelBEval.overallScore >= entry.modelAEval.overallScore;

  return (
    <div className="border border-border/50 rounded-xl bg-card overflow-hidden transition-all hover:border-border">
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">{entry.businessName}</span>
            <Badge variant="outline" className="text-[10px] font-normal">{entry.tone}</Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate max-w-md">{entry.intent}</p>
          <div className="text-xs text-muted-foreground/60">{format(entry.timestamp, "MMM d, yyyy • h:mm a")}</div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">Model A</div>
              <div className={`text-xl font-bold ${modelAWinner ? "text-primary" : "text-muted-foreground"}`}>
                {entry.modelAEval.overallScore}
              </div>
            </div>
            <div className="w-px bg-border/50 self-stretch" />
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">Model B</div>
              <div className={`text-xl font-bold ${modelBWinner ? "text-accent" : "text-muted-foreground"}`}>
                {entry.modelBEval.overallScore}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" onClick={onToggleStar} className={entry.starred ? "text-yellow-500" : "text-muted-foreground"}>
              <Star className={`w-5 h-5 ${entry.starred ? "fill-current" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)} className="text-muted-foreground">
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-4 sm:p-6 border-t border-border/50 bg-background/50 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none">Model A</Badge>
              <span className="text-xs font-mono text-muted-foreground">llama-3.3-70b-versatile</span>
            </div>
            <div className="bg-background rounded-lg border border-border/50 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
              {entry.modelAEmail}
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-accent/20 text-accent hover:bg-accent/30 border-none">Model B</Badge>
              <span className="text-xs font-mono text-muted-foreground">openai/gpt-oss-120b</span>
            </div>
            <div className="bg-background rounded-lg border border-border/50 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
              {entry.modelBEmail}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
