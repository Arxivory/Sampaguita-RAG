import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, Mail, Lock, User, Building2, ArrowRight, Loader2, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [facility, setFacility] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: POST request to backend /auth/signup
    // Example:
    // const response = await axios.post('/api/auth/signup', {
    //   fullName, email, password, role, facility
    // });

    // Mock success delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    setIsLoading(false);
    navigate({ to: "/" }); // Route to main dashboard
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      {/* Subtle background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Heart className="absolute -right-16 -top-16 h-80 w-80 text-primary/[0.04]" strokeWidth={1} />
        <Stethoscope
          className="absolute -left-12 bottom-0 h-64 w-64 text-primary/[0.04]"
          strokeWidth={1}
        />
      </div>

      <Card className="relative z-10 w-full max-w-md rounded-2xl border border-border/60 bg-card/95 shadow-soft-lg backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 shadow-soft">
            <Heart className="h-7 w-7 fill-primary text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold tracking-tight">Request Access</CardTitle>
            <CardDescription className="mt-1.5 text-sm text-muted-foreground">
              Join your Rural Health Unit on SampaguitaRAG
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Dr. Althea Santos"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-xl pl-10"
                  required
                />
              </div>
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger id="role" className="rounded-xl">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MHO">MHO</SelectItem>
                  <SelectItem value="Epidemiologist">Epidemiologist</SelectItem>
                  <SelectItem value="Clinician">Clinician</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="facility">Facility</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="facility"
                  type="text"
                  placeholder="Pavia Municipal Health Unit"
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  className="rounded-xl pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl bg-primary text-primary-foreground shadow-soft transition-colors hover:bg-primary/90"
              disabled={isLoading || !role}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have access?{" "}
            <Link to="/login" className="font-medium text-primary transition-colors hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
