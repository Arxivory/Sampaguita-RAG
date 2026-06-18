import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { ZoomIn, ZoomOut, Maximize2, Network as NetIcon, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

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

type BackendNode = {
  id: string;
  label: string;
  level: number;
};

type RenderNode = BackendNode & {
  x: number;
  y: number;
};

type Edge = {
  from: string;
  to: string;
};

function OntologyPage() {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("ROOT");
  
  const [nodes, setNodes] = useState<RenderNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopology() {
      try {
        setIsLoading(true);
        const response = await api.get("/documents/ontology-topology");
        const data = response.data;

        const rawNodes: BackendNode[] = data.nodes || [];
        const rawEdges: Edge[] = data.edges || [];

        const levelCounts: { [key: number]: number } = {};
        rawNodes.forEach((n) => {
          levelCounts[n.level] = (levelCounts[n.level] || 0) + 1;
        });

        const currentLevelIndices: { [key: number]: number } = {};
        const canvasWidth = 1000;
        const rowHeight = 120;
        const startY = 60;

        const positionedNodes: RenderNode[] = rawNodes.map((node) => {
          const totalInLevel = levelCounts[node.level];
          const currentIndex = currentLevelIndices[node.level] || 0;
          currentLevelIndices[node.level] = currentIndex + 1;

          const y = startY + node.level * rowHeight;
          const segmentWidth = canvasWidth / (totalInLevel + 1);
          const x = segmentWidth * (currentIndex + 1);

          return { ...node, x, y };
        });

        setNodes(positionedNodes);
        setEdges(rawEdges);
        
        if (positionedNodes.length > 0 && !positionedNodes.some(n => n.id === "ROOT")) {
          setSelectedNodeId(positionedNodes[0].id);
        }
      } catch (err: any) {
        console.error("Failed to load clinical topology:", err);
        setError("Could not retrieve ontological mapping structures from database graph.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTopology();
  }, []);

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodeMap.get(selectedNodeId) || null;
  }, [selectedNodeId, nodeMap]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Assembling clinical relationship hierarchies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
        <h3 className="mt-3 text-sm font-semibold text-foreground">Topology Resolution Failure</h3>
        <p className="mt-1 text-xs text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge className="mb-2 rounded-full bg-primary/15 text-primary-foreground/90 hover:bg-primary/20">
            Clinical Core Engine
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Interactive Ontology Topology
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visual medical history tree mapping the relationships of diagnosed conditions for this patient.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="relative h-[560px] overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-background to-primary/8 shadow-soft">
          
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: "radial-gradient(oklch(0.74 0.12 12 / 0.18) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

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

          <div className="absolute left-4 top-4 z-20 rounded-2xl border border-border/60 bg-card/90 px-3 py-2 text-[11px] shadow-soft backdrop-blur">
            <div className="flex items-center gap-2">
              <NetIcon className="h-3 w-3 text-primary" />
              <span className="font-semibold">ICD-10 Taxonomy Branch</span>
            </div>
            <div className="mt-1.5 flex items-center gap-3 text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-primary" /> active concept
              <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/30" /> traversable
            </div>
          </div>

          <div className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing">
            <svg
              viewBox="0 0 1000 560"
              className="h-full w-full"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center",
                transition: "transform 0.25s ease",
              }}
            >
              <defs>
                <linearGradient id="lit" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="oklch(0.78 0.13 15)" />
                  <stop offset="100%" stopColor="oklch(0.85 0.08 150)" />
                </linearGradient>
              </defs>

              {edges.map((e, index) => {
                const a = nodeMap.get(e.from);
                const b = nodeMap.get(e.to);
                if (!a || !b) return null;

                const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 20 };
                return (
                  <path
                    key={`edge-${e.from}-${e.to}-${index}`}
                    d={`M${a.x},${a.y + 22} Q${mid.x},${mid.y} ${b.x},${b.y - 22}`}
                    fill="none"
                    stroke="url(#lit)"
                    strokeWidth={2}
                  />
                );
              })}

              {nodes.map((n) => {
                const isSel = selectedNodeId === n.id;
                return (
                  <g
                    key={`node-${n.id}`}
                    transform={`translate(${n.x}, ${n.y})`}
                    onClick={() => setSelectedNodeId(n.id)}
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
                        isSel
                          ? "oklch(0.88 0.08 15)"
                          : n.level === 0
                          ? "oklch(0.94 0.04 15)"
                          : "oklch(0.97 0.02 15)"
                      }
                      stroke={isSel ? "oklch(0.7 0.13 15)" : "oklch(0.88 0.02 15)"}
                      strokeWidth={isSel ? 3 : 1.5}
                    />
                    
                    <circle r={8} fill={isSel ? "oklch(0.7 0.13 15)" : "oklch(0.88 0.02 15)"} />
                    
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
            zoom {(zoom * 100).toFixed(0)}%
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Selected Node
            </div>
            {selectedNode ? (
              <>
                <h3 className="mt-1 text-base font-semibold leading-snug">{selectedNode.label}</h3>
                <code className="mt-1 inline-block rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                  ontology.clinical.{selectedNode.id.toLowerCase()}
                </code>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-[12px]">
                  <Field k="Classification Level" v={`L${selectedNode.level}`} />
                  <Field k="Identity Key" v={selectedNode.id} />
                  <Field k="Active Node Status" v="Synchronized" />
                  <Field k="Graph Context" v="Neo4j Layer" />
                </dl>
              </>
            ) : (
              <p className="text-xs text-muted-foreground italic mt-2">Select a node in the graph layout to review its clinical hierarchy properties.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function CtrlBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-xl text-foreground/80 transition hover:bg-primary/15 hover:text-foreground"
    >
      {children}
    </button>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-muted/60 px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="text-[12.5px] font-semibold">{v}</div>
    </div>
  );
}