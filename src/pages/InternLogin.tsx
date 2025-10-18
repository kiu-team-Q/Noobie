import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const InternLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const internId = localStorage.getItem("intern_id");
    if (internId) {
      navigate("/intern");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("interns")
        .select("*, roles(*), companies(name)")
        .eq("email", email)
        .eq("otp", otp)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        localStorage.setItem("intern_id", data.id);
        localStorage.setItem("intern_email", data.email);
        localStorage.setItem("intern_role", data.roles?.role_name || "");
        localStorage.setItem("intern_role_id", data.role_id || "");
        localStorage.setItem("company_name_intern", data.companies?.name || "");
        
        toast({
          title: "Login Successful",
          description: `Welcome! Role: ${data.roles?.role_name || "No role assigned"}`,
        });
        
        navigate("/intern");
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or OTP",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card className="border-border bg-card p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Code2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-card-foreground">Intern Portal</h1>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to start learning</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="intern@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="otp">One-Time Password</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter your OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="mt-2"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default InternLogin;