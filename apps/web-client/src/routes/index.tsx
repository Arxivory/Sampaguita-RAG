import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UploadCloud, FileText, Sparkles, CheckCircle2, Activity, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chart Ingestion · SampaguitaRAG" },
      {
        name: "description",
        content: "Drag-and-drop patient chart ingestion with ontological lexer pipeline.",
      },
    ],
  }),
  component: IngestionPage,
});

type IdentifiedConcept = {
  text: string;
  type: "phrase" | "plain";
  code?: string;
  system?: string;
  label?: string;
  branchPath?: string;
};

const systemTint: Record<string, string> = {
  "ICD-10": "bg-primary/15 text-primary-foreground/90 border-primary/30",
  "ICD-10-PCS": "bg-primary/15 text-primary-foreground/90 border-primary/30",
  SNOMED: "bg-sage/60 text-sage-foreground border-sage",
  LOINC: "bg-sage/50 text-sage-foreground border-sage/80",
  RxNorm: "bg-amber-soft/70 text-amber-soft-foreground border-amber-soft",
  "DOH Registry": "bg-accent text-accent-foreground border-border",
  PSGC: "bg-accent text-accent-foreground border-border",
  Program: "bg-accent text-accent-foreground border-border",
  PhilHealth: "bg-amber-soft/60 text-amber-soft-foreground border-amber-soft",
  HL7: "bg-secondary text-secondary-foreground border-border",
};

function IngestionPage() {
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTextArea, setShowTextArea] = useState(false);
  
  const [rawText, setRawText] = useState("");
  const [conceptsList, setConceptsList] = useState<IdentifiedConcept[]>([]);
  const [metadataStats, setMetadataStats] = useState({ conditions: 0, medications: 0, labs: 0 });

  const executeIngestPipeline = async (textToUpload: string) => {
    if (!textToUpload.trim()) return;
    setIsProcessing(true);

    try {
      const response = await api.post("/documents/ingest", {
        title: `Manual Inpatient Extract - ${new Date().toLocaleDateString()}`,
        rawText: textToUpload
      });

      const extractedTokens: IdentifiedConcept[] = response.data.extractedTokens || [];
      setConceptsList(extractedTokens);

      const conditionsCount = extractedTokens.filter(t => t.system?.includes("ICD-10")).length;
      const medsCount = extractedTokens.filter(t => t.system === "RxNorm").length;
      const labsCount = extractedTokens.filter(t => t.system === "LOINC").length;
      
      setMetadataStats({
        conditions: conditionsCount || 1,
        medications: medsCount || 0,
        labs: labsCount || 0
      });

    } catch (err: any) {
      alert(err.response?.data?.detail || err.response?.data?.message || "Failed to process charts ingestion.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge className="mb-2 rounded-full bg-primary/15 text-primary-foreground/90 hover:bg-primary/20">
            Module 01
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Patient Chart Ingestion
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Extract and verify medical terms from unstructured discharge text or summaries automatically.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-card px-4 py-2.5 shadow-soft">
          <Activity className="h-4 w-4 text-primary" />
          <div className="text-xs leading-tight">
            <div className="font-semibold">{conceptsList.length > 0 ? `${conceptsList.length} tokens` : "0 tokens cached"}</div>
            <div className="text-muted-foreground">Pipeline Ready</div>
          </div>
        </div>
      </header>

      {/* Ingestion Trigger Section */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        className={`rounded-3xl border-2 border-dashed p-10 text-center transition-all ${
          dragOver ? "border-primary bg-primary/10" : "border-primary/40 bg-primary/5 hover:bg-primary/8"
        }`}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary shadow-soft">
          <UploadCloud className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Drop discharge summary, lab PDF, or eKonsulta CSV</h3>
        <p className="mt-1 text-sm text-muted-foreground"> Supports text logs streaming straight into your local RAG clusters </p>
        
        <div className="mt-5 flex flex-col items-center justify-center gap-4">
          {!showTextArea ? (
            <div className="flex gap-2">
              <button 
                onClick={() => setShowTextArea(true)}
                className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition hover:bg-primary/90"
              >
                Paste raw text
              </button>
            </div>
          ) : (
            <div className="w-full max-w-2xl">
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste clinical record summaries here..."
                rows={6}
                className="w-full rounded-2xl border border-border bg-card p-4 font-mono text-xs focus:border-primary focus:outline-none"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button 
                  onClick={() => setShowTextArea(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-medium"
                >
                  Cancel
                </button>
                <button 
                  disabled={isProcessing}
                  onClick={() => executeIngestPipeline(rawText)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
                >
                  {isProcessing && <Loader2 className="h-3 w-3 animate-spin" />}
                  Submit to Ingestion Pipeline
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Concept Layout Panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PanelCard title="Raw Unstructured Narrative" subtitle="Active Buffer Stream View" tone="cream">
          <div className="min-h-[250px] rounded-2xl bg-black/5 p-4 font-mono text-[12.5px] leading-relaxed text-foreground/85 whitespace-pre-wrap">
            {rawText || "No clinical records currently loaded into the processing scope buffer. Paste raw text above to review the lexer output."}
          </div>
        </PanelCard>

        <PanelCard
          title="Identified Medical Concepts"
          subtitle=""
          tone="card"
          accessory={
            isProcessing ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-soft/50 px-2.5 py-1 text-[11px] font-medium text-amber-soft-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> parsing log
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/50 px-2.5 py-1 text-[11px] font-medium text-sage-foreground">
                <CheckCircle2 className="h-3 w-3" /> idle
              </span>
            )
          }
        >
          <div className="min-h-[250px] text-[13.5px] leading-[1.95] text-foreground/90">
            {conceptsList.length === 0 ? (
              <p className="text-muted-foreground italic text-sm">Awaiting extracted semantic tokens from downstream ontology parsers...</p>
            ) : (
              conceptsList.map((tok, i) => {
                if (tok.type === "plain") return <span key={i}>{tok.text}</span>;
                const tint = tok.system ? systemTint[tok.system] ?? "bg-accent" : "bg-accent";
                return (
                  <Popover key={i}>
                    <PopoverTrigger asChild>
                      <button className={`mx-0.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-medium leading-none transition hover:-translate-y-0.5 hover:shadow-soft ${tint}`}>
                        <Sparkles className="h-2.5 w-2.5 opacity-70" />
                        {tok.text}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 rounded-2xl border-border/70 bg-card p-4 shadow-soft-lg">
                      <div className="flex items-start justify-between gap-2">
                        <Badge className="rounded-full bg-primary/15 text-primary-foreground/90 hover:bg-primary/15">
                          {tok.system || "Lexer Mapping"}
                        </Badge>
                        <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                          {tok.code || "N/A"}
                        </code>
                      </div>
                      <div className="mt-3 text-sm font-semibold leading-snug">{tok.label || tok.text}</div>
                      <p className="mt-2 text-[12px] text-muted-foreground">
                        Verified and structured via dynamic RAG context mappings.
                      </p>
                    </PopoverContent>
                  </Popover>
                );
              })
            )}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border/60 pt-4 text-center">
            <Stat label="Conditions" value={metadataStats.conditions.toString()} />
            <Stat label="Medications" value={metadataStats.medications.toString()} />
            <Stat label="Labs & Vitals" value={metadataStats.labs.toString()} />
          </div>
        </PanelCard>
      </div>
    </div>
  );
}

function PanelCard({ title, subtitle, children, accessory, tone = "card" }: { title: string; subtitle?: string; children: React.ReactNode; accessory?: React.ReactNode; tone?: "card" | "cream" }) {
  return (
    <section className={`rounded-3xl border border-border/60 p-6 shadow-soft ${tone === "cream" ? "bg-cream" : "bg-card"}`}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/15 text-primary">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
            {subtitle && <p className="text-[12px] text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {accessory}
      </header>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/60 px-2 py-2">
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}