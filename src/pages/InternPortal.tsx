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
      
      // Load company data if company_id exists
      if (data.company_id) {
        const { data: companyUser } = await supabase
          .from("users")
          .select("first_name, last_name, email")
          .eq("id", data.company_id)
          .single();
        
        if (companyUser) {
          setCompanyData(companyUser);
        }
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link to="/" className="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
              <h1 className="text-3xl font-bold text-foreground">Intern Portal</h1>
              <p className="text-muted-foreground">Welcome {profile?.first_name}</p>
            </div>
            <Button onClick={signOut} variant="outline" className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <Award className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Rating Points</h3>
            </div>
            <p className="text-3xl font-bold text-primary">{profile?.rating_points || 100}</p>
          </Card>

          <Card className="border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Position</h3>
            </div>
            <p className="text-lg font-medium">{positionData?.name || "Not assigned"}</p>
          </Card>

          <Card className="border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Company</h3>
            </div>
            <p className="text-lg font-medium">
              {companyData ? `${companyData.first_name} ${companyData.last_name}` : "Not assigned"}
            </p>
          </Card>
        </div>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-card-foreground">
                {profile?.first_name} {profile?.last_name}
              </h2>
              <p className="text-muted-foreground">{profile?.email}</p>
            </div>
          </div>
        </Card>

        {positionData?.rules && (
          <Card className="border-border bg-card p-6">
            <h3 className="text-xl font-semibold mb-4">Company Rules</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                {positionData.rules}
              </pre>
            </div>
          </Card>
        )}

        {positionData?.rules && (
          <CodeEditor rules={positionData.rules} />
        )}
      </div>
    </div>
  );
};

export default InternPortal;
