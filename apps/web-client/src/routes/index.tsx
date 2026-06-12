import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UploadCloud, FileText, Sparkles, CheckCircle2, Activity } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

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

type Token = {
  text: string;
  type: "phrase" | "plain";
  code?: string;
  system?: string;
  label?: string;
};

const NARRATIVE: Token[] = [
  { text: "Pt. is a ", type: "plain" },
  { text: "54M", type: "phrase", code: "Demographics", system: "HL7", label: "54-year-old Male" },
  { text: ", referred from ", type: "plain" },
  { text: "Brgy. Ungka II", type: "phrase", code: "PSGC: 063022014", system: "PSGC", label: "Barangay Ungka II, Pavia, Iloilo" },
  { text: " RHU. ", type: "plain" },
  { text: "s/p acute MI", type: "phrase", code: "I21.9", system: "ICD-10", label: "Acute Myocardial Infarction, unspecified" },
  { text: ". ", type: "plain" },
  { text: "Post-PCI", type: "phrase", code: "00.66", system: "ICD-10-PCS", label: "Percutaneous Coronary Angioplasty" },
  { text: " done at ", type: "plain" },
  { text: "WVMC", type: "phrase", code: "DOH-FAC-06-001", system: "DOH Registry", label: "Western Visayas Medical Center, Iloilo City" },
  { text: " (Mar 2024). ", type: "plain" },
  { text: "Co-morbid: ", type: "plain" },
  { text: "PTB", type: "phrase", code: "A15.0", system: "ICD-10", label: "Pulmonary Tuberculosis, bacteriologically confirmed" },
  { text: " (completed intensive phase under ", type: "plain" },
  { text: "NTP-DOTS", type: "phrase", code: "DOH-NTP", system: "Program", label: "National Tuberculosis Program – DOTS" },
  { text: "), ", type: "plain" },
  { text: "severe HTN", type: "phrase", code: "I10", system: "ICD-10", label: "Essential (primary) Hypertension – Stage 2" },
  { text: ", ", type: "plain" },
  { text: "T2DM", type: "phrase", code: "E11.9", system: "ICD-10", label: "Type 2 Diabetes Mellitus w/o complications" },
  { text: ". Maintenance: ", type: "plain" },
  { text: "Aspirin 81mg OD", type: "phrase", code: "1191", system: "RxNorm", label: "Aspirin 81 mg, once daily — antiplatelet" },
  { text: ", ", type: "plain" },
  { text: "Atorvastatin 40mg OD HS", type: "phrase", code: "83367", system: "RxNorm", label: "Atorvastatin 40 mg, nightly — HMG-CoA reductase inhibitor" },
  { text: ", ", type: "plain" },
  { text: "Metformin 500mg BID", type: "phrase", code: "6809", system: "RxNorm", label: "Metformin 500 mg, twice daily — biguanide" },
  { text: ". BP today: ", type: "plain" },
  { text: "150/95", type: "phrase", code: "85354-9", system: "LOINC", label: "Blood Pressure panel — elevated" },
  { text: ". Advised f/u for ", type: "plain" },
  { text: "ECG", type: "phrase", code: "11524-6", system: "LOINC", label: "EKG / Electrocardiogram study" },
  { text: " and ", type: "plain" },
  { text: "FBS", type: "phrase", code: "1558-6", system: "LOINC", label: "Fasting Blood Sugar measurement" },
  { text: ". Enrolled in ", type: "plain" },
  { text: "Konsulta Package", type: "phrase", code: "PHIC-KON", system: "PhilHealth", label: "PhilHealth Konsulta primary care benefit" },
  { text: ".", type: "plain" },
];

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
            <div className="font-semibold">28 tokens · 11 mapped</div>
            <div className="text-muted-foreground">ontology coverage 92%</div>
          </div>
        </div>
      </header>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        className={`rounded-3xl border-2 border-dashed p-10 text-center transition-all ${
          dragOver
            ? "border-primary bg-primary/10"
            : "border-primary/40 bg-primary/5 hover:bg-primary/8"
        }`}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary shadow-soft">
          <UploadCloud className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Drop discharge summary, lab PDF, or eKonsulta CSV</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Supports PDF, Word, Text Documents, and eKonsulta CSV · Up to 25 MB per file
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition hover:bg-primary/90">
            Browse files
          </button>
          <button className="rounded-2xl border border-border bg-card px-5 py-2.5 text-sm font-medium transition hover:bg-accent">
            Paste raw text
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PanelCard
          title="Raw Unstructured Narrative"
          subtitle="Discharge Summary · M.R.# 06-2024-0418"
          tone="cream"
        >
          <pre className="whitespace-pre-wrap font-mono text-[12.5px] leading-relaxed text-foreground/85">
{`====================================================
WESTERN VISAYAS MEDICAL CENTER — DEPT. OF MEDICINE
Discharge Summary  ·  Bed 3B  ·  Service: Cardiology
----------------------------------------------------
PT NAME : DELA CRUZ, JUAN B.       AGE/SEX: 54/M
MR#     : 06-2024-0418             BRGY   : Ungka II
ADMITTED: 02 Mar 2024              D/C    : 09 Mar 2024
----------------------------------------------------

Pt. is a 54M, referred from Brgy. Ungka II RHU.
s/p acute MI. Post-PCI done at WVMC (Mar 2024).
Co-morbid: PTB (completed intensive phase under
NTP-DOTS), severe HTN, T2DM.

Maintenance:
  - Aspirin 81mg OD
  - Atorvastatin 40mg OD HS
  - Metformin 500mg BID

BP today: 150/95.
Advised f/u for ECG and FBS.
Enrolled in Konsulta Package.

-- end of summary --`}
          </pre>
        </PanelCard>

        <PanelCard
          title="Identified Medical Concepts"
          subtitle=""
          tone="card"
          accessory={
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/50 px-2.5 py-1 text-[11px] font-medium text-sage-foreground">
              <CheckCircle2 className="h-3 w-3" /> streaming
            </span>
          }
        >
          <p className="text-[13.5px] leading-[1.95] text-foreground/90">
            {NARRATIVE.map((tok, i) => {
              if (tok.type === "plain") return <span key={i}>{tok.text}</span>;
              const tint = tok.system ? systemTint[tok.system] ?? "bg-accent" : "bg-accent";
              return (
                <Popover key={i}>
                  <PopoverTrigger asChild>
                    <button
                      className={`mx-0.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-medium leading-none transition hover:-translate-y-0.5 hover:shadow-soft ${tint}`}
                    >
                      <Sparkles className="h-2.5 w-2.5 opacity-70" />
                      {tok.text}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 rounded-2xl border-border/70 bg-card p-4 shadow-soft-lg">
                    <div className="flex items-start justify-between gap-2">
                      <Badge className="rounded-full bg-primary/15 text-primary-foreground/90 hover:bg-primary/15">
                        {tok.system}
                      </Badge>
                      <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                        {tok.code}
                      </code>
                    </div>
                    <div className="mt-3 text-sm font-semibold leading-snug">{tok.label}</div>
                    <p className="mt-2 text-[12px] text-muted-foreground">
                      Mapped via Sampaguita ontology tree → cardiovascular_disease ▸ ischemic ▸
                      acute_event. Confidence 0.984.
                    </p>
                    <button className="mt-3 w-full rounded-xl bg-primary/10 px-3 py-1.5 text-[12px] font-medium text-primary-foreground/90 hover:bg-primary/20">
                      Inspect ontology branch →
                    </button>
                  </PopoverContent>
                </Popover>
              );
            })}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border/60 pt-4 text-center">
            <Stat label="Conditions" value="6" />
            <Stat label="Medications" value="3" />
            <Stat label="Labs & Vitals" value="2" />
          </div>
        </PanelCard>
      </div>
    </div>
  );
}

function PanelCard({
  title,
  subtitle,
  children,
  accessory,
  tone = "card",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accessory?: React.ReactNode;
  tone?: "card" | "cream";
}) {
  return (
    <section
      className={`rounded-3xl border border-border/60 p-6 shadow-soft ${
        tone === "cream" ? "bg-cream" : "bg-card"
      }`}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/15 text-primary">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
            {subtitle && (
              <p className="text-[12px] text-muted-foreground">{subtitle}</p>
            )}
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
      <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
