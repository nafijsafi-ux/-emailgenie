import { useRoute } from "wouter";
import { Sparkles, Trophy, AlertCircle, Copy } from "lucide-react";
import { useGetShare } from "@workspace/api-client-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { EvaluationResult } from "@/hooks/use-history";

export default function SharePage() {
  const [, params] = useRoute("/share/:id");
  const id = params?.id || "";
  const { toast } = useToast();

  const { data: shareData, isLoading, isError } = useGetShare(id, {
    query: {
      enabled: !!id,
      retry: false,
    }
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
        <Skeleton className="w-[300px] h-10 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
          <Skeleton className="h-[500px] rounded-xl" />
          <Skeleton className="h-[500px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !shareData) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Comparison Not Found</h1>
        <p className="text-muted-foreground max-w-sm">This shared comparison link is invalid or has expired.</p>
      </div>
    );
  }

  // Type assertion since backend schema is generic object
  const data = shareData.data as any;
  const { inputs, models, evals } = data;
  const { modelA: evalA, modelB: evalB } = evals;

  const winner = evalA.overallScore >= evalB.overallScore ? "A" : "B";

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center pb-20">
      <div className="w-full bg-card border-b border-border/50 py-4 px-6 mb-8 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="bg-primary/20 p-1.5 rounded-md">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold tracking-tight">EmailGenie</span>
        </div>
        <Badge variant="secondary" className="font-normal text-xs bg-secondary/50">Shared Comparison</Badge>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Model Output Comparison</h1>
          <div className="inline-flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="bg-secondary/30 px-2 py-1 rounded">Business: {inputs.businessName}</span>
            <span className="bg-secondary/30 px-2 py-1 rounded">Tone: {inputs.tone}</span>
          </div>
          <p className="mt-4 text-sm max-w-2xl mx-auto italic text-muted-foreground">"{inputs.intent}"</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ReadonlyModelCard
            title="Model A"
            modelName="llama-3.3-70b-versatile"
            email={models.modelA}
            evalResult={evalA}
            isWinner={winner === "A"}
            onCopy={() => handleCopy(models.modelA)}
          />
          <ReadonlyModelCard
            title="Model B"
            modelName="openai/gpt-oss-120b"
            email={models.modelB}
            evalResult={evalB}
            isWinner={winner === "B"}
            onCopy={() => handleCopy(models.modelB)}
          />
        </div>
      </div>
    </div>
  );
}

function ReadonlyModelCard({
  title,
  modelName,
  email,
  evalResult,
  isWinner,
  onCopy,
}: {
  title: string;
  modelName: string;
  email: string;
  evalResult: EvaluationResult;
  isWinner: boolean;
  onCopy: () => void;
}) {
  return (
    <Card className={`overflow-hidden border ${isWinner ? "border-primary/50 shadow-lg shadow-primary/5" : "border-border/50"}`}>
      <div className="p-5 border-b border-border/50 bg-card/50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold">{title}</h2>
            {isWinner && (
              <Badge variant="default" className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-yellow-500/50">
                <Trophy className="w-3 h-3 mr-1" /> Winner
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground font-mono">{modelName}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Overall</div>
          <div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            {evalResult.overallScore}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span>Fact Recall</span>
              <span className="text-muted-foreground">{evalResult.factRecallScore}/100</span>
            </div>
            <Progress value={evalResult.factRecallScore} className="h-1.5" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span>Tone Accuracy</span>
              <span className="text-muted-foreground">{evalResult.toneAccuracyScore}/100</span>
            </div>
            <Progress value={evalResult.toneAccuracyScore} className="h-1.5" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span>Professional Quality</span>
              <span className="text-muted-foreground">{evalResult.professionalQualityScore}/100</span>
            </div>
            <Progress value={evalResult.professionalQualityScore} className="h-1.5" />
          </div>
        </div>

        <div className="bg-background/80 border border-border/30 rounded-lg overflow-hidden flex flex-col">
          <div className="px-3 py-2 bg-secondary/10 border-b border-border/30 flex justify-between items-center">
            <span className="text-xs font-medium text-muted-foreground">Generated Text</span>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={onCopy}>
              <Copy className="w-3 h-3 mr-1" /> Copy
            </Button>
          </div>
          <div className="p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {email}
          </div>
        </div>
      </div>
    </Card>
  );
}
