import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Sparkles, Gauge, GitBranch, Zap, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Clinical Search Workspace · SampaguitaRAG" },
      {
        name: "description",
        content: "Dual-engine clinical retrieval — fuzzy vector vs hierarchical ontological.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [ontological, setOntological] = useState(true);
  const [query, setQuery] = useState(
    "Summarize cardiovascular history and check pulmonary contraindications for beta-blocker initiation."
  );

  const fuzzyResults = [
    { title: "Discharge Summary — WVMC Cardiology", score: 0.78, snippet: "…s/p acute MI. Post-PCI done…" },
    { title: "RHU Konsulta Visit Note · 12 Apr 2024", score: 0.71, snippet: "…BP 150/95, c/o chest tightness…" },
    { title: "NTP-DOTS Treatment Card · 2023", score: 0.62, snippet: "…PTB completed intensive phase…" },
    { title: "Pharmacy Refill Log", score: 0.58, snippet: "…Aspirin 81mg, Atorvastatin 40mg…" },
  ];

  const ontoResults = [
    {
      branch: "Cardiovascular ▸ Ischemic ▸ Acute MI",
      score: 0.984,
      snippet: "Verified post-PCI status, dual antiplatelet maintained, no current ST changes.",
      sources: 3,
    },
    {
      branch: "Respiratory ▸ Infectious ▸ Pulmonary TB (resolved)",
      score: 0.962,
      snippet: "Intensive phase complete; bronchospastic reactivity absent — beta-blocker safe.",
      sources: 2,
    },
    {
      branch: "Endocrine ▸ Metabolic ▸ T2DM (uncomplicated)",
      score: 0.94,
      snippet: "HbA1c monitoring scheduled; metformin tolerated; no hypoglycemic episodes.",
      sources: 2,
    },
  ];

  const results = ontological ? ontoResults : null;

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      <header>
        <Badge className="mb-2 rounded-full bg-primary/15 text-primary-foreground/90 hover:bg-primary/20">
          Module 02
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Dual-Engine Clinical Search Workbench
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search across historical records using natural questions to identify patient patterns and conditions.
        </p>
      </header>

      {/* Search input */}
      <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
        <div className="flex items-center gap-3 rounded-2xl bg-muted/50 px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
            placeholder="Ask in natural language…"
          />
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90">
            <Sparkles className="h-3.5 w-3.5" /> Retrieve
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <EngineToggle ontological={ontological} setOntological={setOntological} />
          <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            {["chest pain workup", "asa contraindications", "PTB f/u protocol", "konsulta benefit check"].map(
              (s) => (
                <button
                  key={s}
                  className="rounded-full border border-border/70 bg-background px-2.5 py-1 transition hover:border-primary/40 hover:bg-primary/8"
                >
                  {s}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Results */}
        <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold tracking-tight">
                {ontological ? "Hierarchical Ontological Results" : "Fuzzy Vector Matches"}
              </h2>
            </div>
            <span className="text-[11px] text-muted-foreground">
              showing top {results ? ontoResults.length : fuzzyResults.length} of 1,284 nodes
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {(ontological ? ontoResults : fuzzyResults).map((r, i) => {
              const isOnto = "branch" in r;
              return (
                <article
                  key={i}
                  className="group rounded-2xl border border-border/60 bg-background p-4 transition hover:border-primary/40 hover:shadow-soft"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                        {isOnto ? "ontology branch" : "document"} · #{i + 1}
                      </div>
                      <h3 className="mt-1 text-sm font-semibold leading-snug">
                        {isOnto ? (r as typeof ontoResults[0]).branch : (r as typeof fuzzyResults[0]).title}
                      </h3>
                      <p className="mt-1 text-[12.5px] text-muted-foreground">
                        {(r as { snippet: string }).snippet}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="rounded-full bg-sage/50 px-2.5 py-1 font-mono text-[11px] text-sage-foreground">
                        {((r as { score: number }).score * 100).toFixed(1)}%
                      </span>
                      {isOnto && (
                        <span className="text-[10px] text-muted-foreground">
                          {(r as typeof ontoResults[0]).sources} source notes
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
                    <div className="flex flex-wrap gap-1.5">
                      {(isOnto
                        ? ["traversed", "cited", "verified"]
                        : ["embedded", "cosine 0.7+", "raw"]
                      ).map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <button className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-foreground/90 opacity-0 transition group-hover:opacity-100">
                      view trace <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Telemetry HUD */}
        <aside className="space-y-4">
          <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-card to-primary/5 p-5 shadow-soft">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Gauge className="h-3.5 w-3.5 text-primary" /> Search Reassurance Info
            </div>
            <div className="mt-4 space-y-4">
              <RingMetric label="Processing Time" value={42} unit="ms" max={120} good />
              <RingMetric
                label="Related Medical Terms Scanned"
                value={14}
                unit=""
                max={32}
              />
              <RingMetric
                label="Clinical Match Accuracy"
                value={98.4}
                unit="%"
                max={100}
                good
              />
            </div>
          </div>

          <div className="rounded-3xl border border-amber-soft/70 bg-amber-soft/30 p-4 shadow-soft">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-amber-soft-foreground">
              <Zap className="h-3.5 w-3.5" /> Engine Note
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-amber-soft-foreground/90">
              Ontological mode traversed 3 root branches and pruned 89 leaves via PhilHealth
              clinical-pathway constraints, returning fewer but verifiable matches.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function EngineToggle({
  ontological,
  setOntological,
}: {
  ontological: boolean;
  setOntological: (v: boolean) => void;
}) {
  return (
    <div className="relative grid grid-cols-2 rounded-2xl bg-muted/60 p-1 text-[12px] font-medium">
      <div
        className={`pointer-events-none absolute inset-y-1 w-[calc(50%-4px)] rounded-xl bg-card shadow-soft transition-transform duration-300 ${
          ontological ? "translate-x-[calc(100%+4px)]" : "translate-x-1"
        }`}
      />
      <button
        onClick={() => setOntological(false)}
        className={`relative z-10 px-4 py-2 transition ${
          !ontological ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        Broad Text Match
      </button>
      <button
        onClick={() => setOntological(true)}
        className={`relative z-10 flex items-center justify-center gap-1.5 px-4 py-2 transition ${
          ontological ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        <GitBranch className="h-3.5 w-3.5" /> Smart Medical Match
      </button>
    </div>
  );
}

function RingMetric({
  label,
  value,
  unit,
  max,
  good,
}: {
  label: string;
  value: number;
  unit: string;
  max: number;
  good?: boolean;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const c = 2 * Math.PI * 22;
  const offset = c - (pct / 100) * c;
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-14 w-14">
        <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
          <circle cx="28" cy="28" r="22" className="fill-none stroke-muted" strokeWidth="6" />
          <circle
            cx="28"
            cy="28"
            r="22"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className={`fill-none transition-all duration-700 ${
              good ? "stroke-sage-foreground" : "stroke-primary"
            }`}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-[11px] font-semibold tabular-nums">
          {value}
          {unit && <span className="text-[8px]">{unit}</span>}
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="text-[13px] font-semibold tabular-nums">
          {value}
          {unit}
        </div>
      </div>
    </div>
  );
}
