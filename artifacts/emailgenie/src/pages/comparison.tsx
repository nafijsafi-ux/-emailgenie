import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Star, Trophy, ArrowLeft, Loader2, Share2, Save, CheckCheck } from "lucide-react";
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

// Smooth count-up from 0 → target over `duration` ms
function useCountUp(target: number | null, duration = 1200) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (target === null) { setDisplay(0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target * 10) / 10);
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return display;
}

export default function ComparisonPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const history = useHistory();

  const [state, setState] = useState<LocationState | null>(null);
  const [modelAEval, setModelAEval] = useState<EvaluationResult | null>(null);
  const [modelBEval, setModelBEval] = useState<EvaluationResult | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [isStarred, setIsStarred] = useState(false);
  const [winnerRevealed, setWinnerRevealed] = useState(false);

  const evaluateEmailA = useEvaluateEmail();
  const evaluateEmailB = useEvaluateEmail();
  const createShare = useCreateShare();

  useEffect(() => {
    const raw = sessionStorage.getItem("comparisonData");
    if (!raw) { setLocation("/"); return; }
    const historyState = JSON.parse(raw) as LocationState;
    if (!historyState?.models) { setLocation("/"); return; }
    setState(historyState);

    evaluateEmailA.mutate(
      { data: { emailText: historyState.models.modelA, keyFacts: historyState.inputs.keyFacts, tone: historyState.inputs.tone } },
      { onSuccess: (data) => setModelAEval(data) }
    );
    evaluateEmailB.mutate(
      { data: { emailText: historyState.models.modelB, keyFacts: historyState.inputs.keyFacts, tone: historyState.inputs.tone } },
      { onSuccess: (data) => setModelBEval(data) }
    );
  }, []);

  // Delay the winner reveal for drama — fires 900ms after both evals land
  useEffect(() => {
    if (modelAEval && modelBEval) {
      const t = setTimeout(() => setWinnerRevealed(true), 900);
      return () => clearTimeout(t);
    }
  }, [modelAEval, modelBEval]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Email copied to clipboard" });
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
    toast({ title: "Saved to History", description: "You can view this comparison later." });
  };

  const toggleStar = () => {
    const newStarred = !isStarred;
    setIsStarred(newStarred);
    if (savedId) history.updateEntry(savedId, { starred: newStarred });
  };

  const handleShare = () => {
    if (!state || !modelAEval || !modelBEval) return;
    createShare.mutate(
      { data: { data: { inputs: state.inputs, models: state.models, evals: { modelA: modelAEval, modelB: modelBEval } } } },
      {
        onSuccess: (res) => {
          const url = `${window.location.origin}/share/${res.id}`;
          navigator.clipboard.writeText(url);
          toast({ title: "Link Copied!", description: "Share link has been copied to your clipboard." });
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
      {/* Animated top loading bar */}
      <AnimatePresence>
        {isEvaluating && (
          <motion.div
            className="fixed top-0 left-0 right-0 h-[3px] z-50 bg-primary/20 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary w-1/2"
              animate={{ x: ["-100%", "250%"] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8">
        {/* Header row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <Button variant="ghost" className="mb-2 -ml-2 text-muted-foreground hover:text-foreground" onClick={() => setLocation("/generate")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Generator
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Model Comparison</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isEvaluating ? "Evaluating outputs — scoring fact recall, tone, and quality…" : "Evaluation complete. Results are in."}
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
              {savedId ? <><CheckCheck className="w-4 h-4 mr-2" /> Saved</> : <>Save to History</>}
            </Button>
            <Button onClick={handleShare} disabled={isEvaluating || createShare.isPending}>
              {createShare.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
              Share
            </Button>
          </div>
        </div>

        {/* Winner banner — slides in after delay */}
        <AnimatePresence>
          {winnerRevealed && winner && (
            <motion.div
              key="winner-banner"
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`w-full p-5 rounded-xl border mb-8 flex items-center justify-center gap-3 text-lg font-semibold ${
                winner === "Tie"
                  ? "bg-secondary/20 border-secondary/50 text-muted-foreground"
                  : "bg-gradient-to-r from-yellow-500/10 via-primary/10 to-yellow-500/10 border-yellow-500/30"
              }`}
            >
              {winner === "Tie" ? (
                "It's a Tie — both models are evenly matched."
              ) : (
                <>
                  <motion.div
                    initial={{ rotate: -20, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <Trophy className="w-7 h-7 text-yellow-500" />
                  </motion.div>
                  <span className="text-foreground">
                    <span className="text-yellow-500 font-black">Model {winner}</span> is the recommended choice
                  </span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ModelCard
            title="Model A"
            modelName="llama-3.3-70b-versatile"
            badges={["70B params", "131K ctx"]}
            promptBadge="Advanced Prompt"
            email={state.models.modelA}
            evalResult={modelAEval}
            isWinner={winnerRevealed && winner === "A"}
            onCopy={() => handleCopy(state.models.modelA)}
            cardDelay={0.05}
          />
          <ModelCard
            title="Model B"
            modelName="openai/gpt-oss-120b"
            badges={["120B params", "200K ctx"]}
            promptBadge="Basic Prompt"
            email={state.models.modelB}
            evalResult={modelBEval}
            isWinner={winnerRevealed && winner === "B"}
            onCopy={() => handleCopy(state.models.modelB)}
            cardDelay={0.12}
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
  cardDelay,
}: {
  title: string;
  modelName: string;
  badges: string[];
  promptBadge: string;
  email: string;
  evalResult: EvaluationResult | null;
  isWinner: boolean;
  onCopy: () => void;
  cardDelay: number;
}) {
  const score = useCountUp(evalResult?.overallScore ?? null, 1100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: cardDelay, duration: 0.45, ease: "easeOut" }}
      className="relative rounded-xl border bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col"
      style={{
        borderColor: isWinner ? "hsl(var(--primary) / 0.5)" : undefined,
      }}
    >
      {/* Winner glow — pulses after reveal */}
      <AnimatePresence>
        {isWinner && (
          <motion.div
            key="winner-glow"
            className="absolute inset-0 pointer-events-none rounded-xl z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.6] }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ boxShadow: "0 0 50px hsl(var(--primary) / 0.25) inset" }}
          />
        )}
      </AnimatePresence>

      {/* Ambient corner glow for winner */}
      {isWinner && (
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/15 blur-[60px] pointer-events-none z-0" />
      )}

      {/* Header */}
      <div className="relative z-10 p-5 border-b border-border/50 bg-background/50 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">{title}</h2>
            <AnimatePresence>
              {isWinner && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, x: -8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                >
                  <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/40 hover:bg-yellow-500/30">
                    <Trophy className="w-3 h-3 mr-1" /> Winner
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Badge variant="outline" className="font-mono text-xs">{promptBadge}</Badge>
        </div>
        <div>
          <div className="text-sm font-mono text-muted-foreground mb-2">{modelName}</div>
          <div className="flex gap-2">
            {badges.map((b) => (
              <Badge key={b} variant="secondary" className="text-[10px] px-1.5 py-0">{b}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 p-5 flex-1 flex flex-col gap-6">
        <div className="bg-background/40 rounded-lg p-4 border border-border/30">
          {!evalResult ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Evaluating…</span>
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
              <div className="space-y-2.5">
                {[100, 80, 90].map((w, i) => (
                  <div key={i} className={`h-2 bg-secondary/50 rounded-full animate-pulse`} style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Count-up overall score */}
              <div className="flex items-end justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Overall Score</span>
                <motion.span
                  className="text-5xl font-black leading-none tabular-nums bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary/60"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {score.toFixed(1)}
                </motion.span>
              </div>

              <div className="h-px bg-border/40 mb-1" />

              {/* Staggered metric bars */}
              <ScoreBar label="Fact Recall" score={evalResult.factRecallScore} barDelay={0} />
              <ScoreBar label="Tone Accuracy" score={evalResult.toneAccuracyScore} barDelay={120} />
              <ScoreBar label="Professional Quality" score={evalResult.professionalQualityScore} barDelay={240} />
            </div>
          )}
        </div>

        {/* Email output */}
        <div className="flex-1 min-h-[280px] flex flex-col">
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

function ScoreBar({ label, score, barDelay }: { label: string; score: number; barDelay: number }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setVal(score * 10), barDelay + 80);
    return () => clearTimeout(t);
  }, [score, barDelay]);

  const color =
    score >= 8 ? "hsl(var(--primary))" : score >= 5 ? "hsl(45 90% 55%)" : "hsl(0 72% 60%)";

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{score.toFixed(1)}<span className="text-muted-foreground font-normal">/10</span></span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary/40 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: "0%" }}
          animate={{ width: `${val}%` }}
          transition={{ duration: 0.9, ease: [0.34, 1.1, 0.64, 1], delay: barDelay / 1000 }}
        />
      </div>
    </div>
  );
}
