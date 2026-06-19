import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Copy, Star, Trophy, ArrowLeft, Loader2, Share2, Save } from "lucide-react";
import { useEvaluateEmail, useCreateShare } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useHistory, EvaluationResult } from "@/hooks/use-history";

type LocationState = {
  models: { modelA: string; modelB: string };
  inputs: { intent: string; keyFacts: string; tone: string; businessName: string };
};

export default function ComparisonPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const history = useHistory();

  const [state, setState] = useState<LocationState | null>(null);
  const [modelAEval, setModelAEval] = useState<EvaluationResult | null>(null);
  const [modelBEval, setModelBEval] = useState<EvaluationResult | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [isStarred, setIsStarred] = useState(false);

  const evaluateEmailA = useEvaluateEmail();
  const evaluateEmailB = useEvaluateEmail();
  const createShare = useCreateShare();

  useEffect(() => {
    const raw = sessionStorage.getItem("comparisonData");
    if (!raw) {
      setLocation("/");
      return;
    }
    const historyState = JSON.parse(raw) as LocationState;
    if (!historyState?.models) {
      setLocation("/");
      return;
    }
    setState(historyState);

    // Trigger evaluations on mount — use separate mutation instances
    // to avoid the second call overwriting the first
    evaluateEmailA.mutate(
      {
        data: {
          emailText: historyState.models.modelA,
          keyFacts: historyState.inputs.keyFacts,
          tone: historyState.inputs.tone,
        },
      },
      {
        onSuccess: (data) => setModelAEval(data),
      }
    );

    evaluateEmailB.mutate(
      {
        data: {
          emailText: historyState.models.modelB,
          keyFacts: historyState.inputs.keyFacts,
          tone: historyState.inputs.tone,
        },
      },
      {
        onSuccess: (data) => setModelBEval(data),
      }
    );
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Email copied to clipboard",
    });
  };

  const handleSave = () => {
    if (!state || !modelAEval || !modelBEval) return;

    const id = history.addEntry({
      intent: state.inputs.intent,
      businessName: state.inputs.businessName,
      tone: state.inputs.tone,
      keyFacts: state.inputs.keyFacts,
      modelAEmail: state.models.modelA,
      modelBEmail: state.models.modelB,
      modelAEval,
      modelBEval,
      starred: isStarred,
    });
    setSavedId(id);
    toast({
      title: "Saved to History",
      description: "You can view this comparison later.",
    });
  };

  const toggleStar = () => {
    const newStarred = !isStarred;
    setIsStarred(newStarred);
    if (savedId) {
      history.updateEntry(savedId, { starred: newStarred });
    }
  };

  const handleShare = () => {
    if (!state || !modelAEval || !modelBEval) return;

    createShare.mutate(
      {
        data: {
          data: {
            inputs: state.inputs,
            models: state.models,
            evals: { modelA: modelAEval, modelB: modelBEval },
          },
        },
      },
      {
        onSuccess: (res) => {
          const url = `${window.location.origin}/share/${res.id}`;
          navigator.clipboard.writeText(url);
          toast({
            title: "Link Copied!",
            description: "Share link has been copied to your clipboard.",
          });
        },
      }
    );
  };

  if (!state) return null;

  const isEvaluating = !modelAEval || !modelBEval;
  const isComplete = modelAEval && modelBEval;

  let winner: "A" | "B" | "Tie" | null = null;
  if (isComplete) {
    if (modelAEval.overallScore > modelBEval.overallScore) winner = "A";
    else if (modelBEval.overallScore > modelAEval.overallScore) winner = "B";
    else winner = "Tie";
  }

  return (
    <div className="w-full flex flex-col relative pb-20">
      {/* Top Loading Bar */}
      {isEvaluating && (
        <div className="fixed top-0 left-0 right-0 h-1 z-50 overflow-hidden bg-primary/20">
          <div className="h-full bg-primary animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] w-full origin-left scale-x-50"></div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <Button variant="ghost" className="mb-2 -ml-2 text-muted-foreground hover:text-foreground" onClick={() => setLocation("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Generator
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Model Comparison</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Evaluating output against key facts and intended tone.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={toggleStar}
              className={isStarred ? "text-yellow-500 border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20" : ""}
            >
              <Star className={`w-4 h-4 mr-2 ${isStarred ? "fill-current" : ""}`} />
              {isStarred ? "Starred" : "Star"}
            </Button>
            <Button variant="secondary" onClick={handleSave} disabled={isEvaluating || !!savedId}>
              {savedId ? (
                <>Saved <Save className="w-4 h-4 ml-2" /></>
              ) : (
                <>Save to History</>
              )}
            </Button>
            <Button onClick={handleShare} disabled={isEvaluating || createShare.isPending}>
              {createShare.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
              Share
            </Button>
          </div>
        </div>

        {isComplete && winner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full p-4 rounded-lg border mb-8 flex items-center justify-center text-lg font-medium ${
              winner === "Tie"
                ? "bg-secondary/20 border-secondary/50"
                : "bg-primary/10 border-primary/30 text-primary-foreground"
            }`}
          >
            {winner === "Tie" ? (
              "It's a Tie! Both models performed equally well."
            ) : (
              <span className="flex items-center gap-2 text-primary">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Model {winner} is the recommended choice
              </span>
            )}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ModelCard
            title="Model A"
            modelName="llama-3.3-70b-versatile"
            badges={["70B params", "131K ctx"]}
            promptBadge="Advanced Prompt"
            email={state.models.modelA}
            evalResult={modelAEval}
            isWinner={winner === "A"}
            onCopy={() => handleCopy(state.models.modelA)}
            delay={0.1}
          />
          <ModelCard
            title="Model B"
            modelName="openai/gpt-oss-120b"
            badges={["120B params", "200K ctx"]}
            promptBadge="Basic Prompt"
            email={state.models.modelB}
            evalResult={modelBEval}
            isWinner={winner === "B"}
            onCopy={() => handleCopy(state.models.modelB)}
            delay={0.2}
          />
        </div>
      </div>
    </div>
  );
}

function ModelCard({
  title,
  modelName,
  badges,
  promptBadge,
  email,
  evalResult,
  isWinner,
  onCopy,
  delay
}: {
  title: string;
  modelName: string;
  badges: string[];
  promptBadge: string;
  email: string;
  evalResult: EvaluationResult | null;
  isWinner: boolean;
  onCopy: () => void;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative rounded-xl border bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col ${
        isWinner ? "border-primary/50 shadow-[0_0_30px_rgba(var(--primary),0.1)]" : "border-border/50"
      }`}
    >
      {isWinner && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] pointer-events-none" />
      )}
      
      <div className="p-5 border-b border-border/50 bg-background/50 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">{title}</h2>
            {isWinner && (
              <Badge variant="default" className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-yellow-500/50">
                <Trophy className="w-3 h-3 mr-1" /> Winner
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="font-mono text-xs">{promptBadge}</Badge>
        </div>
        
        <div>
          <div className="text-sm font-mono text-muted-foreground mb-2">{modelName}</div>
          <div className="flex gap-2">
            {badges.map((b) => (
              <Badge key={b} variant="secondary" className="text-[10px] px-1.5 py-0">
                {b}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-6">
        {/* Scores */}
        <div className="bg-background/40 rounded-lg p-4 border border-border/30">
          {!evalResult ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Evaluating...</span>
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-secondary/50 rounded-full w-full animate-pulse" />
                <div className="h-2 bg-secondary/50 rounded-full w-[80%] animate-pulse" />
                <div className="h-2 bg-secondary/50 rounded-full w-[90%] animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Overall Score</span>
                <span className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  {evalResult.overallScore}
                </span>
              </div>
              
              <ScoreBar label="Fact Recall" score={evalResult.factRecallScore} />
              <ScoreBar label="Tone Accuracy" score={evalResult.toneAccuracyScore} />
              <ScoreBar label="Professional Quality" score={evalResult.professionalQualityScore} />
            </div>
          )}
        </div>

        {/* Email Content */}
        <div className="flex-1 min-h-[300px] flex flex-col relative group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-muted-foreground">Generated Output</span>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground" onClick={onCopy}>
              <Copy className="w-3.5 h-3.5 mr-1" /> Copy
            </Button>
          </div>
          <div className="flex-1 bg-background/50 border border-border/30 rounded-lg p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[400px]">
            {email}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const [val, setVal] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setVal(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-medium">
        <span>{label}</span>
        <span className="text-muted-foreground">{score}/100</span>
      </div>
      <Progress value={val} className="h-1.5" />
    </div>
  );
}
