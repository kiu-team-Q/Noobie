import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CompanyLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const companyId = localStorage.getItem("company_id");
    if (companyId) {
      navigate("/company");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("email", email)
        .eq("otp", otp)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Clear intern session if exists
        localStorage.removeItem("intern_id");
        localStorage.removeItem("intern_email");
        localStorage.removeItem("intern_role");
        localStorage.removeItem("intern_role_id");
        localStorage.removeItem("company_name_intern");
        
        localStorage.setItem("company_id", data.id);
        localStorage.setItem("company_name", data.name);
        
        toast({
          title: "Login Successful",
          description: `Welcome, ${data.name}!`,
        });
        
        navigate("/company");
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

  const handlePasswordChange = async () => {
    if (!newPassword) {
      toast({
        title: "Error",
        description: "Please enter a new password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: company } = await supabase
        .from("companies")
        .select("*")
        .eq("email", email)
        .eq("otp", otp)
        .maybeSingle();

      if (company) {
        const { error } = await supabase
          .from("companies")
          .update({ otp: newPassword })
          .eq("id", company.id);

        if (error) throw error;

        toast({
          title: "Password Changed",
          description: "Your OTP has been updated successfully",
        });
        
        setShowPasswordChange(false);
        setNewPassword("");
        setOtp(newPassword);
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
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-card-foreground">Company Portal</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {showPasswordChange ? "Change your password" : "Sign in to manage your team"}
            </p>
          </div>

          {!showPasswordChange ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="email">Company Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="company@example.com"
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

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowPasswordChange(true)}
              >
                Change Password
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <Label htmlFor="email">Company Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="company@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="current-otp">Current OTP</Label>
                <Input
                  id="current-otp"
                  type="text"
                  placeholder="Enter current OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>

              <Button 
                type="button"
                onClick={handlePasswordChange}
                className="w-full bg-primary hover:bg-primary/90" 
                disabled={isLoading}
              >
                {isLoading ? "Changing..." : "Change Password"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowPasswordChange(false)}
              >
                Back to Login
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CompanyLogin;