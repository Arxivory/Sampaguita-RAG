import { MapPin, ChevronDown, Bell, Loader2 } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { api } from "@/lib/api";

interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  role?: string;
  facility?: string;
}

export function TopHeader() {
  const router = useRouter();
  const rootContext = router.state.matches[0]?.context as { session?: any };
  const userId = rootContext?.session?.user?.id;

  const { data: user, isLoading } = useQuery<UserProfile>({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No active authenticated user ID found.");
      const res = await api.get(`/users/${userId}`);
      return res.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  const getInitials = () => {
    if (user?.fullName) {
      return `${user.fullName[0].toUpperCase()}`;
    }
    return user?.email ? user.email.slice(0, 2).toUpperCase() : "NA";
  };

  const fullName = user?.fullName
    ? `${user?.fullName}`
    : user?.email || "Loading user...";

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
            {user?.facility || "No Facility"}
          </div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      <div className="ml-auto flex items-center gap-3">
        
        <button className="relative grid h-9 w-9 place-items-center rounded-2xl bg-accent/60 transition hover:bg-accent">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>
        
        <div className="flex items-center gap-2.5 rounded-2xl bg-card px-2 py-1.5 pr-3 shadow-soft">
          <Avatar className="h-8 w-8 ring-2 ring-primary/30">
            <AvatarFallback className="bg-primary/20 text-xs font-semibold text-primary-foreground/90">
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden leading-tight md:block">
            <div className="text-xs font-semibold tracking-tight">{fullName}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {user?.role || "No Role"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}