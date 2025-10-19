import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, LogOut, User, Award, Briefcase, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CodeEditor } from "@/components/CodeEditor";

const InternPortal = () => {
  const { toast } = useToast();
  const { user, role, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [positionData, setPositionData] = useState<any>(null);
  const [companyData, setCompanyData] = useState<any>(null);

  useEffect(() => {
    if (!loading && (!user || role !== 'intern')) {
      window.location.href = "/auth";
      return;
    }
    
    if (user && role === 'intern') {
      loadProfile();
    }
  }, [user, role, loading]);

  const loadProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setProfile(data);
      
      // Load position data if position_id exists
      if (data.position_id) {
        const { data: position } = await supabase
          .from("positions")
          .select("id, name, rules, company_id")
          .eq("id", data.position_id)
          .single();
        
        if (position) {
          setPositionData(position);
        }
      }
      
      // Load company data using security definer function
      if (user) {
        const { data: companyInfo } = await supabase
          .rpc("get_intern_company_info", { _user_id: user.id });
        
        if (companyInfo && companyInfo.length > 0) {
          setCompanyData(companyInfo[0]);
        }
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="border-b border-border/40 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Intern Portal
              </h1>
              <p className="text-muted-foreground">Welcome back, {profile?.first_name}</p>
            </div>
            <Button onClick={signOut} variant="outline" className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-card to-card shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Rating Points</h3>
              </div>
              <p className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {profile?.rating_points || 100}
              </p>
              <p className="text-xs text-muted-foreground mt-2">Keep up the great work!</p>
            </div>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-accent/5 via-card to-card shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Briefcase className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-lg">Position</h3>
              </div>
              <p className="text-2xl font-bold text-card-foreground">
                {positionData?.name || "Not assigned"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">Your current role</p>
            </div>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-secondary/5 via-card to-card shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <Building2 className="h-6 w-6 text-secondary-foreground" />
                </div>
                <h3 className="font-semibold text-lg">Company</h3>
              </div>
              <p className="text-2xl font-bold text-card-foreground">
                {companyData ? `${companyData.first_name} ${companyData.last_name}` : "Not assigned"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">Your organization</p>
            </div>
          </Card>
        </div>

        <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20 shadow-lg animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg">
                <User className="h-10 w-10 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-card-foreground">
                  {profile?.first_name} {profile?.last_name}
                </h2>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                  {profile?.email}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {positionData?.rules && (
          <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20 shadow-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-card-foreground">Company Guidelines</h3>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="bg-muted/30 p-6 rounded-xl border border-border/50">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-foreground/90 leading-relaxed">
{positionData.rules}
                  </pre>
                </div>
              </div>
            </div>
          </Card>
        )}

        {positionData?.rules && (
          <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
            <CodeEditor rules={positionData.rules} />
          </div>
        )}
      </div>
    </div>
  );
};

export default InternPortal;
