import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, Mail, Lock, ArrowRight, Loader2, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { supabase } from "@/lib/api";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await api.post("/auth/login", {
        email: email,
        password: password,
      });

      if (response.data && response.data.access_token) {
        localStorage.setItem(
          "sampaguita_auth_session", 
          JSON.stringify(response.data)
        );

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        navigate({ to: "/" });
      } else {
        throw new Error("Invalid session signature returned from authentication gateway.");
      }
    } catch (err: any) {
      console.error("Login failure trace:", err);
      setErrorMsg(
        err.response?.data?.message || 
        "Authentication failed. Please verify your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Heart className="absolute -right-16 -top-16 h-80 w-80 text-primary/[0.04]" strokeWidth={1} />
        <Stethoscope className="absolute -left-12 bottom-0 h-64 w-64 text-primary/[0.04]" strokeWidth={1} />
      </div>

      <Card className="relative z-10 w-full max-w-md rounded-2xl border border-border/60 bg-card/95 shadow-soft-lg backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 shadow-soft">
            <Heart className="h-7 w-7 fill-primary text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold tracking-tight">Welcome Back</CardTitle>
            <CardDescription className="mt-1.5 text-sm text-muted-foreground">
              Sign in to SampaguitaRAG Clinical Assistant
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="rounded-xl bg-destructive/10 p-3 text-xs font-medium text-destructive">
                {errorMsg}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="dr.santos@pavia.gov.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl bg-primary text-primary-foreground shadow-soft transition-colors hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-primary transition-colors hover:underline">
              Request access
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}