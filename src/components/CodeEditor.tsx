import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, AlertCircle, Code2, Sparkles } from "lucide-react";

interface CodeEditorProps {
  rules: string;
  onSubmit?: (code: string, feedback?: string) => Promise<void>;
  onFeedbackReceived?: (feedback: string) => void;
  isSubmitting?: boolean;
}

export const CodeEditor = ({ rules, onSubmit, onFeedbackReceived, isSubmitting = false }: CodeEditorProps) => {
  const { toast } = useToast();
  const [code, setCode] = useState('// Write your code here\n\n');
  const [feedback, setFeedback] = useState<string>("");
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckCode = async () => {
    if (!code.trim() || code.trim() === '// Write your code here') {
      toast({
        title: "No code",
        description: "Please write some code first",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);
    setFeedback("");

    try {
      const { data, error } = await supabase.functions.invoke("check-code", {
        body: { code, rules },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setFeedback(data.feedback);
      if (onFeedbackReceived) {
        onFeedbackReceived(data.feedback);
      }
      console.log('Feedback received:', data.feedback);
      toast({
        title: "Code checked",
        description: "Review the feedback below",
      });
    } catch (error: any) {
      console.error('Error checking code:', error);
      
      let errorMessage = "Failed to check code";
      if (error.message?.includes("Rate limit")) {
        errorMessage = "Too many requests. Please wait a moment.";
      } else if (error.message?.includes("credits")) {
        errorMessage = "AI credits exhausted. Please contact admin.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const parseFeedback = () => {
    const lines = feedback.split('\n');
    let currentSection = '';
    const sections: { [key: string]: string[] } = {
      score: [],
      strengths: [],
      issues: [],
      recommendations: []
    };
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      if (trimmed.startsWith('SCORE:')) {
        currentSection = 'score';
        sections.score.push(trimmed.replace('SCORE:', '').trim());
      } else if (trimmed.startsWith('STRENGTHS:')) {
        currentSection = 'strengths';
      } else if (trimmed.startsWith('ISSUES:')) {
        currentSection = 'issues';
      } else if (trimmed.startsWith('RECOMMENDATIONS:')) {
        currentSection = 'recommendations';
      } else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
        if (currentSection) {
          sections[currentSection].push(trimmed.replace(/^[-•]\s*/, ''));
        }
      }
    });
    
    return sections;
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20 shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Code2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-card-foreground">Code Editor</h3>
              <p className="text-sm text-muted-foreground">
                Test your skills by writing code following the company guidelines
              </p>
            </div>
          </div>
          
          <div className="border border-border/50 rounded-xl overflow-hidden mb-6 shadow-md">
            <Editor
              height="400px"
              defaultLanguage="javascript"
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleCheckCode}
              disabled={isChecking}
              variant="outline"
              className="flex-1 h-12 text-base font-semibold"
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Check Code
                </>
              )}
            </Button>

            {onSubmit && (
              <Button
                onClick={() => onSubmit(code, feedback)}
                disabled={isSubmitting || isChecking}
                className="flex-1 h-12 text-base font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Submit Code
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {feedback && (() => {
        const sections = parseFeedback();
        
        return (
          <Card className="border-border/50 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg animate-fade-in">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground">AI Code Review</h3>
              </div>
              
              <div className="space-y-4">
                {/* Score Section */}
                {sections.score.length > 0 && (
                  <div className="p-6 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-1">Code Quality Score</h4>
                        <p className="text-4xl font-bold text-primary">{sections.score[0]}</p>
                      </div>
                      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-10 w-10 text-primary" />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Strengths Section */}
                {sections.strengths.length > 0 && (
                  <div className="p-5 rounded-xl bg-green-500/10 border border-green-500/30">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                      <h4 className="text-lg font-bold text-foreground">Strengths</h4>
                    </div>
                    <div className="space-y-2">
                      {sections.strengths.map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                          <span className="text-green-500 mt-1 flex-shrink-0">✓</span>
                          <p className="text-sm text-foreground/90 leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Issues Section */}
                {sections.issues.length > 0 && (
                  <div className="p-5 rounded-xl bg-destructive/10 border border-destructive/30">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="h-6 w-6 text-destructive" />
                      <h4 className="text-lg font-bold text-foreground">Issues Found</h4>
                    </div>
                    <div className="space-y-2">
                      {sections.issues.map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                          <span className="text-destructive mt-1 flex-shrink-0">✕</span>
                          <p className="text-sm text-foreground/90 leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Recommendations Section */}
                {sections.recommendations.length > 0 && (
                  <div className="p-5 rounded-xl bg-blue-500/10 border border-blue-500/30">
                    <div className="flex items-center gap-3 mb-4">
                      <Code2 className="h-6 w-6 text-blue-500" />
                      <h4 className="text-lg font-bold text-foreground">Recommendations</h4>
                    </div>
                    <div className="space-y-2">
                      {sections.recommendations.map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                          <span className="text-blue-500 mt-1 flex-shrink-0">→</span>
                          <p className="text-sm text-foreground/90 leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })()}
    </div>
  );
};