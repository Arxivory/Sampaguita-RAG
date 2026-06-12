import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Check, AlertTriangle, ShieldCheck, FileJson2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

const SUMMARY = [
  {
    text: "54-year-old male, post-PCI for acute MI (Mar 2024 · WVMC), maintained on dual antiplatelet plus high-intensity statin.",
    cites: [1, 2],
  },
  {
    text: "Pulmonary tuberculosis intensive phase completed under NTP-DOTS; no active respiratory contraindications detected.",
    cites: [3],
  },
  {
    text: "BP elevated today at 150/95 mmHg — Stage 2 hypertension; titration of antihypertensive recommended.",
    cites: [1, 4],
  },
  {
    text: "Type 2 Diabetes Mellitus uncomplicated, metformin tolerated; FBS surveillance ordered.",
    cites: [2, 4],
  },
  {
    text: "Enrolled in PhilHealth Konsulta Package; eligible for Z-Benefit coronary follow-up bundle.",
    cites: [5],
  },
];

const SOURCES = [
  "WVMC Discharge Summary · 09 Mar 2024",
  "Cardiology Clinic Note · 22 Mar 2024",
  "NTP-DOTS Treatment Card · 2023",
  "RHU Konsulta Visit · 18 Apr 2024",
  "PhilHealth Member Data Record",
];

const FHIR = `{
  "resourceType": "Bundle",
  "id": "sampaguita-bundle-0418",
  "type": "collection",
  "timestamp": "2024-04-18T10:24:00+08:00",
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "id": "px-062024-0418",
        "identifier": [
          { "system": "ph.gov.philhealth", "value": "12-345678901-2" },
          { "system": "ph.gov.psgc",       "value": "063022014" }
        ],
        "name":      [{ "family": "Dela Cruz", "given": ["Juan", "B."] }],
        "gender":    "male",
        "birthDate": "1970-08-14",
        "address":   [{
          "use": "home",
          "line": ["Brgy. Ungka II"],
          "city": "Pavia",
          "district": "Iloilo",
          "country": "PH"
        }]
      }
    },
    {
      "resource": {
        "resourceType": "Condition",
        "code": {
          "coding": [
            { "system": "http://hl7.org/fhir/sid/icd-10", "code": "I21.4", "display": "NSTEMI" }
          ]
        },
        "clinicalStatus": { "coding": [{ "code": "active" }] },
        "onsetDateTime":  "2024-03-02"
      }
    },
    {
      "resource": {
        "resourceType": "MedicationStatement",
        "status": "active",
        "medicationCodeableConcept": {
          "coding": [{ "system": "rxnorm", "code": "1191", "display": "Aspirin 81 mg" }]
        },
        "dosage": [{ "text": "1 tablet PO once daily" }]
      }
    }
  ]
}`;

function ExportPage() {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(FHIR);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6 pb-8">
      <header>
        <Badge className="mb-2 rounded-full bg-primary/15 text-primary-foreground/90 hover:bg-primary/20">
          Module 04
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Guardrailed Synthesis &amp; FHIR Export
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Final verified payload — citations preserved, PhilHealth benefit-rules enforced.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* SUMMARY COL */}
        <section className="flex flex-col gap-4">
          <article className="rounded-3xl border border-border/60 bg-cream p-6 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold tracking-tight">
                    Verified Patient Summary
                  </h2>
                  <p className="text-[11.5px] text-muted-foreground">
                    5 Fact-Checked Statements • Verified Against 5 Clinical References
                  </p>
                </div>
              </div>
              <Badge className="rounded-full bg-sage/50 text-sage-foreground hover:bg-sage/60">
                guardrails pass
              </Badge>
            </div>

            <ul className="space-y-3">
              {SUMMARY.map((s, i) => (
                <li
                  key={i}
                  className="rounded-2xl border border-border/40 bg-card/70 p-3.5 text-[13px] leading-relaxed text-foreground/90"
                >
                  <span className="mr-2 font-semibold text-primary-foreground/70">▸</span>
                  {s.text}{" "}
                  {s.cites.map((c) => (
                    <button
                      key={c}
                      onMouseEnter={() => setHovered(c)}
                      onMouseLeave={() => setHovered(null)}
                      className={`mx-0.5 inline-flex items-center rounded-full px-1.5 py-0.5 font-mono text-[10.5px] font-medium transition ${
                        hovered === c
                          ? "bg-primary text-primary-foreground shadow-soft"
                          : "bg-primary/15 text-primary-foreground/90 hover:bg-primary/25"
                      }`}
                    >
                      [Source #{c}]
                    </button>
                  ))}
                </li>
              ))}
            </ul>

            <div className="mt-4 rounded-2xl border border-border/40 bg-card/70 p-3">
              <div className="text-[10.5px] uppercase tracking-widest text-muted-foreground">
                Source Register
              </div>
              <ol className="mt-2 space-y-1.5 text-[12px]">
                {SOURCES.map((s, i) => (
                  <li
                    key={i}
                    onMouseEnter={() => setHovered(i + 1)}
                    onMouseLeave={() => setHovered(null)}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1 transition ${
                      hovered === i + 1 ? "bg-primary/15" : "hover:bg-muted/60"
                    }`}
                  >
                    <span className="font-mono text-[10px] text-muted-foreground">
                      #{i + 1}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </article>

          <aside className="rounded-3xl border border-amber-soft bg-amber-soft/40 p-5 shadow-soft">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-soft text-amber-soft-foreground">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-amber-soft-foreground">
                  PhilHealth Case Rate Alert
                </div>
                <p className="mt-1 text-[13px] font-medium leading-snug text-amber-soft-foreground">
                  Patient qualifies for <strong>Z Benefit Package</strong> (Acute Coronary
                  Syndrome bundle, ₱550,000). Missing mandatory <strong>ECG confirmation</strong>{" "}
                  attachment — submission will be rejected by HCI portal.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="rounded-xl bg-amber-soft-foreground/90 px-3 py-1.5 text-[12px] font-semibold text-amber-soft hover:bg-amber-soft-foreground">
                    Attach ECG now
                  </button>
                  <button className="rounded-xl border border-amber-soft-foreground/30 bg-transparent px-3 py-1.5 text-[12px] font-medium text-amber-soft-foreground hover:bg-amber-soft/60">
                    Snooze 24h
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* FHIR COL */}
        <section className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft">
          <header className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-primary/10 to-sage/30 px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-2xl bg-card text-primary shadow-soft">
                <FileJson2 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold tracking-tight">
                  Standard EMR Data Package
                </h2>
                <p className="text-[11.5px] text-muted-foreground">
                  Transmittable Health Log
                </p>
              </div>
            </div>
            <button
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy to Clipboard"}
            </button>
          </header>

          <div className="relative max-h-[680px] overflow-auto bg-[oklch(0.985_0.012_30)] p-5">
            <pre className="font-mono text-[12px] leading-relaxed">
              <code>{syntaxHighlight(FHIR)}</code>
            </pre>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 bg-muted/40 px-5 py-3 text-[11px] text-muted-foreground">
            <span>3 resources · 1,284 bytes · sha256 7f3…ab21</span>
            <div className="flex gap-2">
              <span className="rounded-full bg-sage/50 px-2 py-0.5 text-sage-foreground">
                ✓ schema valid
              </span>
              <span className="rounded-full bg-sage/50 px-2 py-0.5 text-sage-foreground">
                ✓ ph-core conformant
              </span>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}

function syntaxHighlight(json: string) {
  const parts: React.ReactNode[] = [];
  const regex =
    /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g;
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(json)) !== null) {
    if (m.index > last) {
      parts.push(
        <span key={`t${i++}`} className="text-foreground/60">
          {json.slice(last, m.index)}
        </span>
      );
    }
    const [tok] = m;
    let cls = "text-foreground";
    if (m[1]) cls = "text-primary-foreground/90 font-medium"; // key
    else if (m[2]) cls = "text-[oklch(0.45_0.12_150)]"; // string
    else if (m[3]) cls = "text-[oklch(0.55_0.18_30)]"; // bool/null
    else if (m[4]) cls = "text-[oklch(0.5_0.16_60)]"; // num
    parts.push(
      <span key={`m${i++}`} className={cls}>
        {tok}
      </span>
    );
    last = m.index + tok.length;
  }
  parts.push(
    <span key="end" className="text-foreground/60">
      {json.slice(last)}
    </span>
  );
  return parts;
}
