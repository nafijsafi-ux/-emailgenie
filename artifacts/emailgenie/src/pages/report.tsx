import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Printer, TrendingUp, TrendingDown, Target, Zap } from "lucide-react";
import { format } from "date-fns";

import { useHistory } from "@/hooks/use-history";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ReportPage() {
  const { entries } = useHistory();

  const stats = useMemo(() => {
    if (entries.length === 0) return null;

    let modelAWinCount = 0;
    let modelBWinCount = 0;
    
    let sumA = { overall: 0, fact: 0, tone: 0, quality: 0 };
    let sumB = { overall: 0, fact: 0, tone: 0, quality: 0 };

    entries.forEach(e => {
      if (e.modelAEval.overallScore > e.modelBEval.overallScore) modelAWinCount++;
      else if (e.modelBEval.overallScore > e.modelAEval.overallScore) modelBWinCount++;

      sumA.overall += e.modelAEval.overallScore;
      sumA.fact += e.modelAEval.factRecallScore;
      sumA.tone += e.modelAEval.toneAccuracyScore;
      sumA.quality += e.modelAEval.professionalQualityScore;

      sumB.overall += e.modelBEval.overallScore;
      sumB.fact += e.modelBEval.factRecallScore;
      sumB.tone += e.modelBEval.toneAccuracyScore;
      sumB.quality += e.modelBEval.professionalQualityScore;
    });

    const len = entries.length;
    return {
      total: len,
      modelA: {
        wins: modelAWinCount,
        avgOverall: Math.round(sumA.overall / len),
        avgFact: Math.round(sumA.fact / len),
        avgTone: Math.round(sumA.tone / len),
        avgQuality: Math.round(sumA.quality / len),
      },
      modelB: {
        wins: modelBWinCount,
        avgOverall: Math.round(sumB.overall / len),
        avgFact: Math.round(sumB.fact / len),
        avgTone: Math.round(sumB.tone / len),
        avgQuality: Math.round(sumB.quality / len),
      }
    };
  }, [entries]);

  const barChartData = useMemo(() => {
    if (!stats) return [];
    return [
      { metric: "Fact Recall", ModelA: stats.modelA.avgFact, ModelB: stats.modelB.avgFact },
      { metric: "Tone Accuracy", ModelA: stats.modelA.avgTone, ModelB: stats.modelB.avgTone },
      { metric: "Prof. Quality", ModelA: stats.modelA.avgQuality, ModelB: stats.modelB.avgQuality },
      { metric: "Overall", ModelA: stats.modelA.avgOverall, ModelB: stats.modelB.avgOverall },
    ];
  }, [stats]);

  const lineChartData = useMemo(() => {
    // Sort chronological
    const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp);
    return sorted.map((e, idx) => ({
      name: `Gen ${idx + 1}`,
      date: format(e.timestamp, "MMM d"),
      ModelA: e.modelAEval.overallScore,
      ModelB: e.modelBEval.overallScore,
    }));
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <Target className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-2xl font-bold mb-2">Insufficient Data</h2>
        <p className="text-muted-foreground max-w-md">Generate some emails and comparisons to view analytical reports and performance trends.</p>
      </div>
    );
  }

  const overallWinner = stats!.modelA.avgOverall >= stats!.modelB.avgOverall ? "Model A (llama-3.3-70b-versatile)" : "Model B (openai/gpt-oss-120b)";
  const losingModel = stats!.modelA.avgOverall < stats!.modelB.avgOverall ? stats!.modelA : stats!.modelB;
  
  // Find weakest metric for losing model
  const metrics = [
    { name: "Fact Recall", val: losingModel.avgFact },
    { name: "Tone Accuracy", val: losingModel.avgTone },
    { name: "Professional Quality", val: losingModel.avgQuality },
  ];
  metrics.sort((a, b) => a.val - b.val);
  const weakestMetric = metrics[0].name;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Report</h1>
          <p className="text-sm text-muted-foreground mt-1">Aggregated analytics across {stats!.total} generations.</p>
        </div>
        <Button variant="outline" onClick={() => window.print()} className="print:hidden">
          <Printer className="w-4 h-4 mr-2" /> Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">Total Generations</div>
            <div className="text-3xl font-black">{stats!.total}</div>
          </CardContent>
        </Card>
        
        <Card className={`border ${stats!.modelA.avgOverall > stats!.modelB.avgOverall ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-card/50'}`}>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">Model A Avg Score</div>
            <div className={`text-3xl font-black ${stats!.modelA.avgOverall > stats!.modelB.avgOverall ? 'text-primary' : ''}`}>
              {stats!.modelA.avgOverall}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{stats!.modelA.wins} wins</div>
          </CardContent>
        </Card>

        <Card className={`border ${stats!.modelB.avgOverall > stats!.modelA.avgOverall ? 'border-accent/50 bg-accent/5' : 'border-border/50 bg-card/50'}`}>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">Model B Avg Score</div>
            <div className={`text-3xl font-black ${stats!.modelB.avgOverall > stats!.modelA.avgOverall ? 'text-accent' : ''}`}>
              {stats!.modelB.avgOverall}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{stats!.modelB.wins} wins</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">Win Leader</div>
            <div className="text-xl font-bold truncate">
              {stats!.modelA.wins === stats!.modelB.wins ? "Tie" : (stats!.modelA.wins > stats!.modelB.wins ? "Model A" : "Model B")}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Average Metric Scores</CardTitle>
            <CardDescription>Comparison across specific evaluation criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <RechartsTooltip 
                    cursor={{fill: 'hsl(var(--accent)/0.1)'}}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="ModelA" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="ModelB" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Score Trend Over Time</CardTitle>
            <CardDescription>Overall performance trajectory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 100]} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="ModelA" stroke="hsl(var(--primary))" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="ModelB" stroke="hsl(var(--accent))" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-secondary/10 border-secondary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Zap className="w-5 h-5 text-yellow-500" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
          <p>
            Based on the analysis of <strong>{stats!.total}</strong> generations, <strong>{overallWinner}</strong> demonstrates superior overall performance with an average score of {Math.max(stats!.modelA.avgOverall, stats!.modelB.avgOverall)}.
          </p>
          <p>
            The competing model shows notable weakness in <strong>{weakestMetric}</strong>, scoring an average of only {metrics[0].val}. 
          </p>
          <p className="font-semibold text-foreground mt-4">
            Production Recommendation:
          </p>
          <p>
            Deploy <strong>{overallWinner}</strong> for production email generation workflows, as it consistently yields higher professional quality and better adherence to key facts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
