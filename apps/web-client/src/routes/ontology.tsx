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
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const streamGraphTopology = async () => {
      try {
        setIsLoading(true);
        setErrorMsg("");
        
        const response = await api.get("/documents/ontology-topology");
        
        const rawNodes: BackendNode[] = response.data.nodes || [];
        const rawEdges: Edge[] = response.data.edges || [];

        const levelGroupCount: Record<number, number> = {};
        rawNodes.forEach((node) => {
          levelGroupCount[node.level] = (levelGroupCount[node.level] || 0) + 1;
        });

        const currentPositionTracker: Record<number, number> = {};

        const calculatedRenderNodes: RenderNode[] = rawNodes.map((node) => {
          const totalNodesAtTier = levelGroupCount[node.level];
          const currentIndex = currentPositionTracker[node.level] || 0;
          currentPositionTracker[node.level] = currentIndex + 1;

          const canvasWidth = 1000;
          const partitionSegment = canvasWidth / (totalNodesAtTier + 1);
          
          const x = partitionSegment * (currentIndex + 1);
          const y = 70 + node.level * 150;

          return {
            ...node,
            x,
            y,
          };
        });

        setNodes(calculatedRenderNodes);
        setEdges(rawEdges);

        if (calculatedRenderNodes.length > 0) {
          const defaultNode = calculatedRenderNodes.find(n => n.id === "ROOT") || calculatedRenderNodes[0];
          setSelectedNodeId(defaultNode.id);
        }
      } catch (err: any) {
        console.error("Failed to stream clinical graph layers:", err);
        setErrorMsg("Downstream ontology pipeline disconnected. Verify your FastAPI and Neo4j endpoints.");
      } finally {
        setIsLoading(false);
      }
    };

    streamGraphTopology();
  }, []);

  const nodeMap = useMemo(() => {
    const map: Record<string, RenderNode> = {};
    nodes.forEach((n) => {
      map[n.id] = n;
    });
    return map;
  }, [nodes]);

  const selectedNode = selectedNodeId ? nodeMap[selectedNodeId] : null;

  const activePaths = useMemo(() => {
    if (!selectedNodeId) return [];
    return edges.filter((e) => e.from === selectedNodeId || e.to === selectedNodeId);
  }, [selectedNodeId, edges]);

  if (isLoading) {
    return (
      <div className="flex min-h-[450px] flex-col items-center justify-center gap-2.5 text-sm text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span>Traversing structural node hierarchies from Neo4j AuraDB instance...</span>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 p-4 text-sm font-medium text-destructive mx-auto max-w-[1400px]">
        <AlertCircle className="h-4 w-4" />
        {errorMsg}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      <header>
        <Badge className="mb-2 rounded-full bg-primary/15 text-primary-foreground/90 hover:bg-primary/20">
          Module 03
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Disease Lineage Visualizer
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Interactive relational map showing real parent/child linkages extracted from your ontology schema.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Interactive SVG Rendering Graph Panel */}
        <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft">
          <div className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-2xl border border-border/60 bg-card p-1.5 shadow-soft">
            <CtrlBtn onClick={() => setZoom((z) => Math.min(2, z + 0.1))}><ZoomIn className="h-4 w-4" /></CtrlBtn>
            <CtrlBtn onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}><ZoomOut className="h-4 w-4" /></CtrlBtn>
            <CtrlBtn onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}><Maximize2 className="h-3.5 w-3.5" /></CtrlBtn>
          </div>

          <div className="absolute right-4 top-4 z-10 flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-3 text-[11px] font-medium shadow-soft bg-card/90 backdrop-blur-sm">
            <div className="flex items-center gap-2"><LegendDot className="bg-primary" /> Root Anchor</div>
            <div className="flex items-center gap-2"><LegendDot className="bg-emerald-600" /> Category Chapter</div>
            <div className="flex items-center gap-2"><LegendDot className="bg-amber-500" /> Terminal Sub-Code</div>
          </div>

          <div className="h-[520px] w-full cursor-grab bg-muted/20 active:cursor-grabbing">
            <svg
              className="h-full w-full select-none"
              viewBox="0 0 1000 520"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
                transition: "transform 0.15s ease-out",
              }}
            >
              {/* Render Connections */}
              {edges.map((edge, i) => {
                const source = nodeMap[edge.from];
                const target = nodeMap[edge.to];
                if (!source || !target) return null;

                const isPathActive = activePaths.some(
                  (p) => p.from === edge.from && p.to === edge.to
                );

                return (
                  <g key={i}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      className={`stroke-2 transition-colors duration-300 ${
                        isPathActive ? "stroke-primary" : "stroke-border/70"
                      }`}
                      strokeDasharray={edge.from === "ROOT" ? "4 4" : undefined}
                    />
                  </g>
                );
              })}

              {/* Render Node Points */}
              {nodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                let colorClasses = "fill-primary";
                if (node.level === 1) colorClasses = "fill-emerald-600";
                if (node.level === 2) colorClasses = "fill-amber-500";

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNodeId(node.id)}
                    className="cursor-pointer"
                  >
                    <circle
                      r={isSelected ? 18 : 13}
                      className={`${colorClasses} stroke-background stroke-[3px] transition-all duration-200 hover:r-20`}
                    />
                    <text
                      y={30}
                      className="font-sans text-[11px] font-bold fill-foreground/90 text-center"
                      textAnchor="middle"
                    >
                      {node.id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </section>

        {/* Focus Inspector Card */}
        <aside className="space-y-4">
          <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              <NetIcon className="h-4 w-4 text-primary" /> Concept Inspector
            </div>

            {selectedNode ? (
              <div className="space-y-3">
                <Field k="Ontology Identifier Code" v={selectedNode.id} />
                <Field k="Descriptive Medical Name" v={selectedNode.label} />
                <Field k="Hierarchy Domain Tier" v={`Level Depth Rank: ${selectedNode.level}`} />
                <Field 
                  k="Active Local Bounds" 
                  v={`${edges.filter(e => e.from === selectedNode.id || e.to === selectedNode.id).length} direct mappings`} 
                />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Select any node point to inspect its semantic layout.</p>
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

function LegendDot({ className }: { className: string }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${className}`} />;
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-muted/50 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="mt-0.5 text-[12.5px] font-semibold leading-tight text-foreground/90">{v}</div>
    </div>
  );
}