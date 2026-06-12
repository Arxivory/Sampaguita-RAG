import { MapPin, ChevronDown, Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <SidebarTrigger className="rounded-xl" />
      <div className="hidden h-8 w-px bg-border/70 md:block" />

      <button className="hidden items-center gap-2 rounded-2xl bg-primary/8 px-3 py-1.5 text-left transition hover:bg-primary/15 md:flex">
        <MapPin className="h-4 w-4 text-primary" />
        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Active Facility
          </div>
          <div className="text-xs font-semibold">
            Pavia Municipal Health Unit · Iloilo
          </div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      <div className="ml-auto flex items-center gap-3">
        <Badge
          variant="outline"
          className="hidden rounded-full border-sage bg-sage/40 px-2.5 py-1 text-[11px] font-medium text-sage-foreground md:inline-flex"
        >
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-sage-foreground" />
          Engine Online · v2.4.1
        </Badge>
        <button className="relative grid h-9 w-9 place-items-center rounded-2xl bg-accent/60 transition hover:bg-accent">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>
        <div className="flex items-center gap-2.5 rounded-2xl bg-card px-2 py-1.5 pr-3 shadow-soft">
          <Avatar className="h-8 w-8 ring-2 ring-primary/30">
            <AvatarFallback className="bg-primary/20 text-xs font-semibold text-primary-foreground/90">
              AS
            </AvatarFallback>
          </Avatar>
          <div className="hidden leading-tight md:block">
            <div className="text-xs font-semibold">Dr. Althea Santos, MD</div>
            <div className="text-[11px] text-muted-foreground">Municipal Health Officer</div>
          </div>
        </div>
      </div>
    </header>
  );
}
