import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  BarChart3,
  Trophy,
  Zap,
  FileText,
  Share2,
  Clock,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Dual-Model Generation",
    description:
      "Two leading LLMs write your email simultaneously — one with advanced prompt engineering, one with a basic prompt — so you can see exactly what technique wins.",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: BarChart3,
    title: "3-Metric AI Evaluation",
    description:
      "Every output is scored on Fact Recall, Tone Accuracy, and Professional Quality. Not just vibes — a structured rubric with an overall score out of 10.",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: Trophy,
    title: "Clear Winner Declaration",
    description:
      "The comparison page crowns a winner with a trophy badge and a plain-English recommendation. No ambiguity — just the best email, ready to send.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
  },
  {
    icon: Clock,
    title: "Full History & Search",
    description:
      "Every generation is saved locally. Search by intent or business name, star your best results, and export everything to CSV with all metrics included.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: FileText,
    title: "Performance Reports",
    description:
      "Charts, trends, and an auto-generated written analysis tell you which model consistently performs better across all your generations — over time.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    icon: Share2,
    title: "One-Click Sharing",
    description:
      "Generate a shareable link for any comparison. Send it to a client, a hiring manager, or a colleague — no login required to view.",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Describe your email",
    body: "Enter the intent, key facts, tone, and your business name. Or pick a preset to fill everything instantly.",
  },
  {
    number: "02",
    title: "Two models compete",
    body: "llama-3.3-70b-versatile uses an expert persona with few-shot examples. openai/gpt-oss-120b gets a plain instruction. Both run in parallel.",
  },
  {
    number: "03",
    title: "Read the verdict",
    body: "Three evaluation metrics, animated progress bars, a bold score, and a trophy for the winner. Save, share, or export.",
  },
];

const TONES = [
  "Formal",
  "Professional",
  "Casual",
  "Apologetic",
  "Empathetic",
  "Urgent",
  "Friendly",
];

const PRESETS = [
  "Sales Follow-Up",
  "Job Application",
  "Client Onboarding",
  "Apology/Issue",
  "Partnership Pitch",
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="w-full overflow-x-hidden text-foreground bg-background min-h-screen">
      {/* ── Sticky Nav ── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/20 p-1.5 rounded-md">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold tracking-tight text-lg">EmailGenie</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocation("/report")}
              className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-accent/10"
            >
              Report
            </button>
            <button
              onClick={() => setLocation("/history")}
              className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-accent/10"
            >
              History
            </button>
            <Button
              size="sm"
              onClick={() => setLocation("/generate")}
              className="font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Launch App
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </header>
      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 py-24 text-center overflow-hidden">
        {/* dot-grid + radial */}
        <div className="absolute inset-0 z-0 bg-dot-pattern opacity-60" />
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,hsl(var(--primary)/0.18),transparent_70%)]" />
        {/* bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-0" />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <Badge
              variant="outline"
              className="px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border-primary/30 bg-primary/10 text-primary"
            >
              AI Email Intelligence Platform
            </Badge>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] bg-clip-text text-transparent bg-gradient-to-b from-foreground via-foreground to-foreground/50"
          >
            Two models.
            <br />
            One winning email.
          </motion.h1>

          <motion.p
            variants={item}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
          >
            EmailGenie runs two frontier AI models head-to-head on your brief,
            evaluates every output against a structured rubric, and tells you
            exactly which one to send — and why.
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap gap-3 justify-center mt-2">
            <Button
              size="lg"
              onClick={() => setLocation("/generate")}
              className="h-13 px-8 text-base font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-[0_0_30px_hsl(var(--primary)/0.35)] hover:shadow-[0_0_40px_hsl(var(--primary)/0.5)] hover:scale-[1.03] transition-all duration-300"
            >
              Generate your first email
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setLocation("/report")}
              className="h-13 px-8 text-base font-semibold border-border/60 hover:bg-accent/10"
            >
              View sample report
            </Button>
          </motion.div>

          {/* tone pills */}
          <motion.div
            variants={item}
            className="flex flex-wrap gap-2 justify-center mt-4 max-w-lg"
          >
            {TONES.map((t) => (
              <span
                key={t}
                className="text-xs px-3 py-1 rounded-full border border-border/40 bg-card/40 text-muted-foreground"
              >
                {t}
              </span>
            ))}
            <span className="text-xs px-3 py-1 rounded-full border border-border/40 bg-card/40 text-muted-foreground">
              + 5 preset templates
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Metrics strip ── */}
      <section className="border-y border-border/40 bg-card/30 backdrop-blur-sm py-10 px-4">
        <motion.div
          className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {[
            { value: "2", label: "Frontier AI Models" },
            { value: "3", label: "Evaluation Metrics" },
            { value: "7", label: "Tone Profiles" },
            { value: "5", label: "Preset Templates" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
                {value}
              </span>
              <span className="text-sm text-muted-foreground font-medium">{label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-bold tracking-widest uppercase text-primary mb-3">
              How it works
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
              From brief to best email in three steps
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                className="relative p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.45 }}
              >
                <div className="text-5xl font-black text-primary/15 mb-4 leading-none select-none">
                  {step.number}
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-7 h-7 text-border z-10" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="py-24 px-4 bg-card/20 border-y border-border/40">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-bold tracking-widest uppercase text-primary mb-3">
              Features
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
              Everything you need to write better emails
            </h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={item}
                  className="p-5 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm hover:border-border transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${f.bg}`}>
                    <Icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <h3 className="font-bold mb-1.5">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Presets strip ── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm text-muted-foreground mb-5 font-medium">
              Jump-start with a ready-made template
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setLocation("/generate")}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/60 bg-card/50 hover:bg-accent/10 hover:border-primary/30 hover:text-primary transition-all text-sm font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary/60" />
                  {p}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="py-24 px-4">
        <motion.div
          className="max-w-3xl mx-auto rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/60 to-card/40 backdrop-blur-sm p-12 text-center relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.12),transparent_70%)] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
              Ready to find your best email?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Fill in your brief. Watch two AI models compete. Send the winner.
            </p>
            <Button
              size="lg"
              onClick={() => setLocation("/generate")}
              className="h-13 px-10 text-base font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-[0_0_30px_hsl(var(--primary)/0.35)] hover:scale-[1.03] transition-all duration-300"
            >
              Start generating
              <Zap className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 py-8 px-4 text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-bold text-sm text-foreground">EmailGenie</span>
        </div>
        <p>Powered by Groq · llama-3.3-70b-versatile · openai/gpt-oss-120b</p>
      </footer>
    </div>
  );
}
