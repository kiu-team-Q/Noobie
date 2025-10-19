import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Briefcase } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CodeEditor } from "@/components/CodeEditor";

const InternCodePortal = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const [positionData, setPositionData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<string>("");

  useEffect(() => {
    if (!loading && (!user || role !== 'intern')) {
      window.location.href = "/auth";
      return;
    }
    
    if (user && role === 'intern') {
      loadPosition();
    }
  }, [user, role, loading]);

  const loadPosition = async () => {
    if (!user) return;
    
    const { data: userData } = await supabase
      .from("users")
      .select("position_id")
      .eq("id", user.id)
      .single();

    if (userData?.position_id) {
      const { data: position } = await supabase
        .from("positions")
        .select("*")
        .eq("id", userData.position_id)
        .single();
      
      if (position) {
        setPositionData(position);
      }
    }
  };

  const handleSubmitCode = async (code: string, feedback?: string) => {
    if (!user || !code.trim()) return;

    setIsSubmitting(true);
    try {
      // Insert submission
      const { error: insertError } = await supabase
        .from("code_submissions")
        .insert({
          intern_id: user.id,
          code: code,
          feedback: feedback || lastFeedback || null,
          points_awarded: 10,
          status: 'submitted'
        });

      if (insertError) throw insertError;

      // Update user's rating
      const { data: currentUser } = await supabase
        .from("users")
        .select("rating_points")
        .eq("id", user.id)
        .single();

      if (currentUser) {
        const { error: updateError } = await supabase
          .from("users")
          .update({ rating_points: (currentUser.rating_points || 100) + 10 })
          .eq("id", user.id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Code Submitted!",
        description: "Your code has been submitted successfully. +10 points!",
      });

      // Navigate back to profile
      setTimeout(() => {
        navigate("/intern");
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
              <Link to="/intern" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Profile
              </Link>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Code Portal
              </h1>
              <p className="text-muted-foreground">Write and submit your code</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rules Sidebar */}
          {positionData?.rules && (
            <div className="lg:col-span-1">
              <Card className="border-border/50 bg-card shadow-sm sticky top-8">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <Briefcase className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-card-foreground">Company Rules</h3>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg border border-border/50 max-h-[600px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-foreground/90 leading-relaxed">
{positionData.rules}
                    </pre>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Code Editor */}
          <div className={positionData?.rules ? "lg:col-span-2" : "lg:col-span-3"}>
            {positionData?.rules ? (
              <CodeEditor 
                rules={positionData.rules} 
                onSubmit={handleSubmitCode}
                onFeedbackReceived={setLastFeedback}
                isSubmitting={isSubmitting}
              />
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No position assigned yet</p>
                <Link to="/intern">
                  <Button>Go to Profile</Button>
                </Link>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternCodePortal;