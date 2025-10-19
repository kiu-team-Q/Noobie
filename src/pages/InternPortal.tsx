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

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Profile & Guidelines */}
          <div className="space-y-6">
            {/* Compact Profile Card */}
            <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20 shadow-lg animate-fade-in">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60">
                    <User className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-card-foreground truncate">
                      {profile?.first_name} {profile?.last_name}
                    </h2>
                    <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="text-center p-3 rounded-lg bg-primary/5">
                    <Award className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-2xl font-bold text-primary">{profile?.rating_points || 100}</p>
                    <p className="text-xs text-muted-foreground">Points</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-accent/5">
                    <Briefcase className="h-5 w-5 text-accent-foreground mx-auto mb-1" />
                    <p className="text-sm font-semibold text-card-foreground truncate">
                      {positionData?.name || "None"}
                    </p>
                    <p className="text-xs text-muted-foreground">Position</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary/5">
                    <Building2 className="h-5 w-5 text-secondary-foreground mx-auto mb-1" />
                    <p className="text-sm font-semibold text-card-foreground truncate">
                      {companyData?.first_name || "None"}
                    </p>
                    <p className="text-xs text-muted-foreground">Company</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Company Guidelines */}
            {positionData?.rules && (
              <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20 shadow-lg animate-fade-in flex-1" style={{ animationDelay: '100ms' }}>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-card-foreground">Company Guidelines</h3>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg border border-border/50 max-h-[600px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-foreground/90 leading-relaxed">
{positionData.rules}
                    </pre>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Code Editor */}
          {positionData?.rules && (
            <div className="animate-fade-in lg:sticky lg:top-8 lg:self-start" style={{ animationDelay: '200ms' }}>
              <CodeEditor rules={positionData.rules} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternPortal;
