import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const InternPortal = () => {
  const { toast } = useToast();
  const { user, role, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);

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

      <div className="container mx-auto px-6 py-8">
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
          
          <div className="space-y-4">
            {profile?.position && (
              <div>
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="text-lg font-medium">{profile?.position}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InternPortal;
