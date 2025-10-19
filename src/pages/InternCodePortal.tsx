import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CodeEditor } from "@/components/CodeEditor";
import { useNavigate } from "react-router-dom";

const InternCodePortal = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const [positionData, setPositionData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);

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

  const handleGenerateTasks = async (): Promise<string | null> => {
    setIsGeneratingTasks(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-training-tasks", {
        body: { rules: positionData.rules },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Tasks Generated!",
        description: "Practice tasks have been created based on your company guidelines.",
      });

      return data.tasks;
    } catch (error: any) {
      console.error('Error generating tasks:', error);
      
      let errorMessage = "Failed to generate tasks";
      if (error.message?.includes("Rate limit")) {
        errorMessage = "Too many requests. Please wait a moment.";
      } else if (error.message?.includes("credits")) {
        errorMessage = "AI credits exhausted. Please contact admin.";
      }
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGeneratingTasks(false);
    }
  };

  const handleSubmitCode = async (code: string): Promise<string | null> => {
    if (!user || !code.trim()) return null;

    setIsSubmitting(true);
    try {
      // First get AI feedback
      const { data: aiData, error: aiError } = await supabase.functions.invoke("check-code", {
        body: { code, rules: positionData.rules },
      });

      if (aiError) throw aiError;
      if (aiData.error) throw new Error(aiData.error);

      const feedback = aiData.feedback;

      // Insert submission with feedback (no points)
      const { error: insertError } = await supabase
        .from("code_submissions")
        .insert({
          intern_id: user.id,
          code: code,
          feedback: feedback,
          points_awarded: 0,
          status: 'submitted'
        });

      if (insertError) throw insertError;

      toast({
        title: "Code Submitted!",
        description: "Your code has been reviewed and submitted.",
      });

      // Return feedback to display
      return feedback;
    } catch (error: any) {
      console.error('Error submitting code:', error);
      
      let errorMessage = "Failed to submit code";
      if (error.message?.includes("Rate limit")) {
        errorMessage = "Too many requests. Please wait a moment.";
      } else if (error.message?.includes("credits")) {
        errorMessage = "AI credits exhausted. Please contact admin.";
      }
      
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
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
        {positionData?.rules ? (
          <CodeEditor 
            rules={positionData.rules} 
            onSubmit={handleSubmitCode}
            isSubmitting={isSubmitting}
            onGenerateTasks={handleGenerateTasks}
            isGeneratingTasks={isGeneratingTasks}
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
  );
};

export default InternCodePortal;