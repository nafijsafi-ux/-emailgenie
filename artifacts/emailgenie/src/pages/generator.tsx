import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGenerateEmails } from "@workspace/api-client-react";
import { Sparkles, Loader2, Zap, BrainCircuit, X } from "lucide-react";
import { motion } from "framer-motion";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  intent: z.string().min(2, "Intent must be at least 2 characters"),
  keyFacts: z.string().min(10, "Provide some key facts to ground the generation"),
  tone: z.string().min(1, "Select a tone"),
  businessName: z.string().min(2, "Business name is required"),
});

type FormValues = z.infer<typeof formSchema>;

const PRESETS = [
  {
    name: "Sales Follow-Up",
    data: {
      intent: "Follow up after initial discovery call",
      keyFacts: "Met last Tuesday. Discussed Q3 pipeline. Offered 15% discount if signed by EOM.",
      tone: "Professional",
      businessName: "Acme Corp",
    },
  },
  {
    name: "Job Application",
    data: {
      intent: "Apply for Senior Frontend Engineer role",
      keyFacts: "5 years React experience. Led rewrite of core dashboard. Passionate about design systems.",
      tone: "Formal",
      businessName: "TechNova",
    },
  },
  {
    name: "Client Onboarding",
    data: {
      intent: "Welcome new enterprise client",
      keyFacts: "Contract signed yesterday. First meeting next week. Need them to fill out intake form.",
      tone: "Friendly",
      businessName: "Global Industries",
    },
  },
  {
    name: "Apology/Issue",
    data: {
      intent: "Apologize for unexpected downtime",
      keyFacts: "Service was down for 2 hours. Root cause identified and fixed. Giving 1 month credit.",
      tone: "Apologetic",
      businessName: "CloudServe",
    },
  },
  {
    name: "Partnership Pitch",
    data: {
      intent: "Propose API integration partnership",
      keyFacts: "Our users overlap by 40%. Integration would save them 5 hours/week. Looking for intro call.",
      tone: "Urgent",
      businessName: "SynergyTech",
    },
  },
];

const TONE_DESCRIPTIONS: Record<string, string> = {
  Formal: "Strictly business, traditional formatting.",
  Professional: "Business-appropriate but approachable.",
  Casual: "Relaxed and conversational.",
  Apologetic: "Sincere and responsibility-taking.",
  Empathetic: "Understanding and supportive.",
  Urgent: "Action-oriented and time-sensitive.",
  Friendly: "Warm, positive, and inviting.",
};

export default function GeneratorPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const generateEmails = useGenerateEmails();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      intent: "",
      keyFacts: "",
      tone: "",
      businessName: "",
    },
  });

  const selectedTone = form.watch("tone");

  const onSubmit = (data: FormValues) => {
    generateEmails.mutate(
      { data },
      {
        onSuccess: (result) => {
          sessionStorage.setItem(
            "comparisonData",
            JSON.stringify({ models: result, inputs: data })
          );
          setLocation("/comparison");
        },
        onError: (err) => {
          toast({
            title: "Generation failed",
            description: err.error || "Something went wrong",
            variant: "destructive",
          });
        },
      }
    );
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    form.reset(preset.data);
    setActivePreset(preset.name);
  };

  const clearPreset = () => {
    form.reset({
      intent: "",
      keyFacts: "",
      tone: "",
      businessName: "",
    });
    setActivePreset(null);
  };

  return (
    <div className="w-full relative pb-20">
      <div className="absolute inset-0 z-[-1] bg-dot-pattern"></div>
      <div className="absolute inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>

      <div className="container mx-auto px-4 pt-16 pb-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            Precision Email Generation
          </h1>
          <p className="text-lg text-muted-foreground">
            Harness dual models to engineer the perfect professional response.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-wrap items-center gap-2 justify-center"
        >
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-border/50 bg-card/50 hover:bg-accent/10 hover:text-accent-foreground transition-colors hover-elevate"
            >
              {preset.name}
            </button>
          ))}
        </motion.div>

        {activePreset && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between"
          >
            <span className="text-sm text-primary font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Active Preset: {activePreset}
            </span>
            <button
              type="button"
              onClick={clearPreset}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          </motion.div>
        )}

        <Card className="border-border/50 shadow-xl bg-card/60 backdrop-blur-xl mb-8">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sender / Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Acme Corp" {...field} className="bg-background/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tone</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50">
                              <SelectValue placeholder="Select a tone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.keys(TONE_DESCRIPTIONS).map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {selectedTone && TONE_DESCRIPTIONS[selectedTone] && (
                  <div className="text-xs text-muted-foreground bg-accent/5 px-3 py-2 rounded-md border border-accent/10">
                    <span className="font-semibold text-accent-foreground">{selectedTone}:</span> {TONE_DESCRIPTIONS[selectedTone]}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="intent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intent / Goal</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Follow up after an initial discovery call" {...field} className="bg-background/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="keyFacts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Facts & Context</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="List important facts to include in the email (bullet points work well)"
                          className="min-h-[120px] bg-background/50 resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={generateEmails.isPending}
                    className="w-full h-12 text-base font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:scale-[1.02] transition-all duration-300"
                  >
                    {generateEmails.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Models...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate with Dual Models
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/40"
          >
            <div className="bg-blue-500/20 p-2.5 rounded-lg border border-blue-500/30">
              <BrainCircuit className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm">Model A</span>
                <Badge variant="secondary" className="text-[10px] h-5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">Advanced Prompt</Badge>
              </div>
              <div className="text-xs text-muted-foreground font-mono">llama-3.3-70b-versatile</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/40"
          >
            <div className="bg-emerald-500/20 p-2.5 rounded-lg border border-emerald-500/30">
              <Zap className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm">Model B</span>
                <Badge variant="secondary" className="text-[10px] h-5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">Basic Prompt</Badge>
              </div>
              <div className="text-xs text-muted-foreground font-mono">openai/gpt-oss-120b</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
