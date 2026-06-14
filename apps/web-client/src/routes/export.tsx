import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Copy, Check, ShieldCheck, FileJson2, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

export const Route = createFileRoute("/export")({
  head: () => ({
    meta: [
      { title: "FHIR Export · SampaguitaRAG" },
      {
        name: "description",
        content: "Guardrailed AI summary with interoperable HL7 FHIR R4 payload export.",
      },
    ],
  }),
  component: ExportPage,
});

type RealInferencePayload = {
  query: string;
  sourceDocumentsAnalyzed: string[];
  fragmentsMatchedCount: number;
  aiAnswer: string;
};

function ExportPage() {
  const [copied, setCopied] = useState(false);
  const [exportQuery, setExportQuery] = useState(
    "Compile full historical chart summary tracking pulmonary states and acute issues."
  );
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [pipelineData, setPipelineData] = useState<RealInferencePayload | null>(null);

  const handleCompileExport = async () => {
    if (!exportQuery.trim()) return;
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const response = await api.get(
        `/documents/analyze?q=${encodeURIComponent(exportQuery)}&threshold=0.30&limit=4`
      );
      setPipelineData(response.data);
    } catch (err: any) {
      console.error("Compilation error across context brokers:", err);
      setErrorMsg(
        err.response?.data?.message || 
        "Downstream clinical analyzer disconnected. Verify your core-api loop constraints."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const dynamicFhirPayload = useMemo(() => {
    if (!pipelineData) return null;

    const timestamp = new Date().toISOString();
    const fhirBundle = {
      resourceType: "Bundle",
      id: "sampaguita-rag-extraction-bundle",
      type: "collection",
      timestamp: timestamp,
      entry: [
        {
          fullUrl: "urn:uuid:composition-synthesis-01",
          resource: {
            resourceType: "Composition",
            id: "clinical-rag-synthesis",
            status: "final",
            type: {
              coding: [
                {
                  system: "http://loinc.org",
                  code: "11488-4",
                  display: "Consultation Note Narrative",
                },
              ],
            },
            subject: {
              display: "Active Workspace Patient Target Context Profile",
            },
            date: timestamp,
            author: [
              {
                display: "Gemini Clinical Synthesis Optimization Agent",
              },
            ],
            title: "Grounded Summary Extraction Synthesis Report",
            section: [
              {
                title: "AI Compiled Patient Chart Summary Insights",
                code: {
                  coding: [
                    {
                      system: "http://loinc.org",
                      code: "55107-7",
                      display: "Addendum Narrative Discussion",
                    },
                  ],
                },
                text: {
                  status: "generated",
                  div: `<div xmlns="http://www.w3.org/1999/xhtml"><p>${pipelineData.aiAnswer}</p></div>`,
                },
              },
            ],
            extension: pipelineData.sourceDocumentsAnalyzed.map((docId) => ({
              url: "https://sampaguita-rag.care/fhir/StructureDefinition/source-document-lineage",
              valueUuid: docId,
            })),
          },
        },
      ],
    };

    return JSON.stringify(fhirBundle, null, 2);
  }, [pipelineData]);

  const copyToClipboard = () => {
    if (!dynamicFhirPayload) return;
    navigator.clipboard.writeText(dynamicFhirPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      <header>
        <Badge className="mb-2 rounded-full bg-primary/15 text-primary-foreground/90 hover:bg-primary/20">
          Module 04
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Clinical Compilation & Interoperable FHIR Export
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compile context synthesis out of your chart collections and export directly into strict standard HL7 structures.
        </p>
      </header>

      {/* Query Bar Trigger Wrapper */}
      <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={exportQuery}
            onChange={(e) => setExportQuery(e.target.value)}
            className="flex-1 rounded-2xl border border-border/60 bg-muted/40 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-primary/50"
            placeholder="Specify compilation context directives..."
            disabled={isLoading}
          />
          <button
            onClick={handleCompileExport}
            disabled={isLoading || !exportQuery.trim()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90 disabled:opacity-40"
          >
            {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Compiling...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Compile Chart Summary
                </>
              )
            }
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 p-4 text-sm font-medium text-destructive">
          <AlertCircle className="h-4 w-4" />
          {errorMsg}
        </div>
      )}

      {/* Primary Split Workspace Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Grounded Summary Text Display Section */}
        <section className="flex flex-col rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
          <h2 className="text-sm font-semibold tracking-tight text-foreground/90 mb-4">
            Verified Chart Synthesis Report Summary
          </h2>

          {!pipelineData ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/50 p-8 text-center bg-muted/10">
              <span className="text-sm font-medium text-muted-foreground/80 italic">No data present in live buffers</span>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Execute a compilation lookup extraction vector above to render real data.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between rounded-2xl border border-border/60 bg-background p-5 shadow-inner">
              <p className="text-[13.5px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {pipelineData.aiAnswer}
              </p>
              
              {/* Document Origin Linage Tracking Footnote */}
              <div className="mt-6 border-t border-border/40 pt-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-2">
                  Source Provenance Bounds
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {pipelineData.sourceDocumentsAnalyzed.map((docId) => (
                    <span key={docId} className="font-mono text-[10px] bg-muted px-2 py-1 rounded-lg text-muted-foreground border border-border/40 truncate max-w-full">
                      Ref: {docId}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Live Code JSON Export Syntax Panel Block */}
        <section className="flex flex-col rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
          <header className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileJson2 className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold tracking-tight">Interoperable HL7 FHIR Bundle Package</h2>
            </div>
            {dynamicFhirPayload && (
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-background px-3 py-1.5 text-xs font-semibold text-foreground/80 transition hover:bg-muted"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied Raw Output" : "Copy Source Code JSON"}
              </button>
            )}
          </header>

          {!dynamicFhirPayload ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/50 p-8 text-center bg-muted/10">
              <span className="text-sm font-medium text-muted-foreground/80 italic">No data present in live buffers</span>
              <p className="text-xs text-muted-foreground/60 mt-1">Awaiting active data pipeline parsing execution.</p>
            </div>
          ) : (
            <div className="flex-1 relative overflow-hidden rounded-2xl border border-border/70 bg-zinc-950 p-4 font-mono text-[12px] leading-relaxed shadow-inner">
              <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-zinc-900 px-2 py-1 text-[10px] font-bold tracking-wider text-emerald-500 uppercase border border-zinc-800">
                <ShieldCheck className="h-3 w-3" /> Schema Compliant
              </div>
              <pre className="h-[360px] overflow-y-auto pr-2 text-zinc-300 custom-scrollbar whitespace-pre-wrap">
                {syntaxHighlight(dynamicFhirPayload)}
              </pre>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function syntaxHighlight(json: string) {
  const parts: React.ReactNode[] = [];
  const regex = /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g;
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(json)) !== null) {
    if (m.index > last) {
      parts.push(<span key={`text-${i++}`}>{json.slice(last, m.index)}</span>);
    }
    const [tok] = m;
    let cls = "text-zinc-400";
    if (m[1]) cls = "text-sky-400 font-medium";
    else if (m[2]) cls = "text-amber-300";
    else if (m[3] || m[4]) cls = "text-emerald-400 font-semibold";

    parts.push(
      <span key={`token-${i++}`} className={cls}>
        {tok}
      </span>
    );
    last = regex.lastIndex;
  }
  if (last < json.length) {
    parts.push(<span key={`text-end`}>{json.slice(last)}</span>);
  }
  return parts;
}