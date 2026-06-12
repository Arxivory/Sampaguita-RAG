import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, Play, Network as NetIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/ontology")({
  head: () => ({
    meta: [
      { title: "Ontology Mapping Graph · SampaguitaRAG" },
      {
        name: "description",
        content: "Interactive directed acyclic ontology topology of clinical concepts.",
      },
    ],
  }),
  component: OntologyPage,
});

type Node = { id: string; label: string; x: number; y: number; level: number };
type Edge = { from: string; to: string };

const NODES: Node[] = [
  { id: "root", label: "Cardiovascular Disease", x: 500, y: 60, level: 0 },
  { id: "isch", label: "Ischemic Heart Disease", x: 280, y: 200, level: 1 },
  { id: "hyper", label: "Hypertensive Disease", x: 720, y: 200, level: 1 },
  { id: "ami", label: "Acute Myocardial Infarction", x: 160, y: 340, level: 2 },
  { id: "angina", label: "Angina Pectoris", x: 400, y: 340, level: 2 },
  { id: "stage2", label: "HTN Stage 2", x: 640, y: 340, level: 2 },
  { id: "hhd", label: "Hypertensive Heart Dx", x: 860, y: 340, level: 2 },
  { id: "stemi", label: "STEMI (I21.0)", x: 70, y: 480, level: 3 },
  { id: "nstemi", label: "NSTEMI (I21.4)", x: 220, y: 480, level: 3 },
  { id: "unstable", label: "Unstable Angina", x: 380, y: 480, level: 3 },
  { id: "stable", label: "Stable Angina", x: 510, y: 480, level: 3 },
  { id: "essential", label: "Essential HTN (I10)", x: 640, y: 480, level: 3 },
  { id: "secondary", label: "Secondary HTN (I15)", x: 770, y: 480, level: 3 },
  { id: "hf", label: "Heart Failure", x: 900, y: 480, level: 3 },
];

const EDGES: Edge[] = [
  { from: "root", to: "isch" },
  { from: "root", to: "hyper" },
  { from: "isch", to: "ami" },
  { from: "isch", to: "angina" },
  { from: "hyper", to: "stage2" },
  { from: "hyper", to: "hhd" },
  { from: "ami", to: "stemi" },
  { from: "ami", to: "nstemi" },
  { from: "angina", to: "unstable" },
  { from: "angina", to: "stable" },
  { from: "stage2", to: "essential" },
  { from: "stage2", to: "secondary" },
  { from: "hhd", to: "hf" },
];

const ILLUMINATED_PATH = ["root", "isch", "ami", "nstemi"];

function OntologyPage() {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<string>("nstemi");

  const litEdges = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < ILLUMINATED_PATH.length - 1; i++) {
      set.add(`${ILLUMINATED_PATH[i]}->${ILLUMINATED_PATH[i + 1]}`);
    }
    return set;
  }, []);

  const litNodes = useMemo(() => new Set(ILLUMINATED_PATH), []);
  const nodeMap = useMemo(() => Object.fromEntries(NODES.map((n) => [n.id, n])), []);

  const selectedNode = nodeMap[selected];

  const onMouseDown = (e: React.MouseEvent) => {
    setDrag({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!drag) return;
    setPan({ x: e.clientX - drag.x, y: e.clientY - drag.y });
  };
  const onMouseUp = () => setDrag(null);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge className="mb-2 rounded-full bg-primary/15 text-primary-foreground/90 hover:bg-primary/20">
            Module 03
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Interactive Ontology Topology
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visual medical history tree mapping the relationships of diagnosed conditions for this patient.
          </p>
        </div>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90"
        >
          <Play className="h-3.5 w-3.5" /> Animate Traversal
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="relative h-[560px] overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-background to-primary/8 shadow-soft">
          {/* grid */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(oklch(0.74 0.12 12 / 0.18) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* canvas controls */}
          <div className="absolute right-4 top-4 z-20 flex flex-col gap-1.5 rounded-2xl border border-border/60 bg-card/90 p-1.5 shadow-soft backdrop-blur">
            <CtrlBtn onClick={() => setZoom((z) => Math.min(1.8, z + 0.1))}>
              <ZoomIn className="h-3.5 w-3.5" />
            </CtrlBtn>
            <CtrlBtn onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>
              <ZoomOut className="h-3.5 w-3.5" />
            </CtrlBtn>
            <CtrlBtn
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </CtrlBtn>
          </div>

          {/* legend */}
          <div className="absolute left-4 top-4 z-20 rounded-2xl border border-border/60 bg-card/90 px-3 py-2 text-[11px] shadow-soft backdrop-blur">
            <div className="flex items-center gap-2">
              <NetIcon className="h-3 w-3 text-primary" />
              <span className="font-semibold">ICD-10 Cardiovascular Branch</span>
            </div>
            <div className="mt-1.5 flex items-center gap-3 text-muted-foreground">
              <LegendDot className="bg-primary" /> illuminated path
              <LegendDot className="bg-muted-foreground/30" /> traversable
            </div>
          </div>

          <div
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            className={`absolute inset-0 z-10 ${drag ? "cursor-grabbing" : "cursor-grab"}`}
          >
            <svg
              viewBox="0 0 1000 560"
              className="h-full w-full"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center",
                transition: drag ? "none" : "transform 0.25s ease",
              }}
            >
              <defs>
                <linearGradient id="lit" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="oklch(0.78 0.13 15)" />
                  <stop offset="100%" stopColor="oklch(0.85 0.08 150)" />
                </linearGradient>
              </defs>

              {EDGES.map((e) => {
                const a = nodeMap[e.from];
                const b = nodeMap[e.to];
                const lit = litEdges.has(`${e.from}->${e.to}`);
                const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 20 };
                return (
                  <path
                    key={`${e.from}-${e.to}`}
                    d={`M${a.x},${a.y + 22} Q${mid.x},${mid.y} ${b.x},${b.y - 22}`}
                    fill="none"
                    stroke={lit ? "url(#lit)" : "oklch(0.85 0.02 15)"}
                    strokeWidth={lit ? 2.5 : 1.2}
                    strokeDasharray={lit && playing ? "6 4" : "0"}
                    className={lit && playing ? "animate-pulse" : ""}
                  />
                );
              })}

              {NODES.map((n) => {
                const lit = litNodes.has(n.id);
                const isSel = selected === n.id;
                return (
                  <g
                    key={n.id}
                    transform={`translate(${n.x}, ${n.y})`}
                    onClick={() => setSelected(n.id)}
                    className="cursor-pointer"
                  >
                    {isSel && (
                      <circle
                        r={32}
                        fill="oklch(0.74 0.12 12 / 0.18)"
                        className="animate-ping"
                      />
                    )}
                    <circle
                      r={22}
                      fill={
                        lit
                          ? "oklch(0.88 0.08 15)"
                          : n.level === 0
                          ? "oklch(0.94 0.04 15)"
                          : "oklch(0.97 0.02 15)"
                      }
                      stroke={lit ? "oklch(0.7 0.13 15)" : "oklch(0.88 0.02 15)"}
                      strokeWidth={isSel ? 3 : 1.5}
                    />
                    <circle r={8} fill={lit ? "oklch(0.7 0.13 15)" : "oklch(0.88 0.02 15)"} />
                    <text
                      y={42}
                      textAnchor="middle"
                      className="fill-foreground text-[10px] font-medium"
                    >
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="absolute bottom-3 right-4 z-20 rounded-full bg-card/80 px-3 py-1 font-mono text-[10px] text-muted-foreground backdrop-blur">
            zoom {(zoom * 100).toFixed(0)}% · drag to pan
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Selected Node
            </div>
            <h3 className="mt-1 text-base font-semibold leading-snug">{selectedNode.label}</h3>
            <code className="mt-1 inline-block rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px]">
              ontology.cardio.{selectedNode.id}
            </code>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-[12px]">
              <Field k="Classification Level" v={`L${selectedNode.level}`} />
              <Field k="Children" v="0" />
              <Field k="Supporting Charts Found" v="4 notes" />
              <Field k="Match Confidence" v="0.98" />
            </dl>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Medical Category Hierarchy
            </div>
            <ol className="mt-3 space-y-2">
              {ILLUMINATED_PATH.map((id, i) => (
                <li key={id} className="flex items-center gap-2.5">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary-foreground/90">
                    {i + 1}
                  </span>
                  <span className="text-[12.5px]">{nodeMap[id].label}</span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CtrlBtn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-xl text-foreground/80 transition hover:bg-primary/15 hover:text-foreground"
    >
      {children}
    </button>
  );
}

function LegendDot({ className }: { className: string }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${className}`} />;
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-muted/60 px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="text-[12.5px] font-semibold">{v}</div>
    </div>
  );
}
