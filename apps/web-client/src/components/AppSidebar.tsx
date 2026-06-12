import { Link, useRouterState } from "@tanstack/react-router";
import {
  FileText,
  Search,
  Network,
  FileJson,
  Heart,
  Stethoscope,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const items = [
  { title: "Upload Patient Charts", url: "/", icon: FileText, desc: "Import case logs" },
  { title: "Patient History Search", url: "/search", icon: Search, desc: "Clinical assistant" },
  { title: "Disease Lineage Visualizer", url: "/ontology", icon: Network, desc: "Medical chart history" },
  { title: "PhilHealth & EMR Export", url: "/export", icon: FileJson, desc: "Standard medical data" },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (p: string) => currentPath === p;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/60 px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 shadow-soft">
            <Heart className="h-5 w-5 fill-primary text-primary" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-semibold tracking-tight">SampaguitaRAG</div>
            <div className="truncate text-xs text-muted-foreground">Intelligent Clinical Assistant</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] uppercase tracking-widest text-muted-foreground/70">
            Workflow
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="h-auto rounded-2xl px-3 py-2.5 data-[active=true]:bg-primary/15 data-[active=true]:text-foreground data-[active=true]:shadow-soft hover:bg-accent/70"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-medium leading-tight">{item.title}</span>
                        <span className="text-[11px] text-muted-foreground">{item.desc}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/60 px-3 py-4 group-data-[collapsible=icon]:hidden">
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-sage/40 p-3">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Stethoscope className="h-3.5 w-3.5 text-primary" />
            DOH-Linked Registry
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Synced with PhilHealth Konsulta &amp; eHATID-LGU
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
