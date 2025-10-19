import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, AlertCircle, Code2, Sparkles } from "lucide-react";

interface CodeEditorProps {
  rules: string;
}

export const CodeEditor = ({ rules }: CodeEditorProps) => {
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

          <Button
            onClick={handleCheckCode}
            disabled={isChecking}
            className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {isChecking ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing your code...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Check Code Against Rules
              </>
            )}
          </Button>
        </div>
      </Card>

      {feedback && (
        <Card className="border-border/50 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg animate-fade-in">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground">AI Feedback</h3>
            </div>
            
            <div className="space-y-4">
              {feedback.split('\n\n').map((section, idx) => {
                const lines = section.split('\n');
                const isPositive = section.toLowerCase().includes('good') || 
                                 section.toLowerCase().includes('correct') ||
                                 section.toLowerCase().includes('well done') ||
                                 section.toLowerCase().includes('great');
                const isNegative = section.toLowerCase().includes('issue') || 
                                 section.toLowerCase().includes('error') ||
                                 section.toLowerCase().includes('violat') ||
                                 section.toLowerCase().includes('missing');
                
                return (
                  <div 
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      isPositive 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : isNegative 
                        ? 'bg-destructive/10 border-destructive/30'
                        : 'bg-muted/30 border-border/50'
                    }`}
                  >
                    <div className="flex gap-3">
                      {isPositive && (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      )}
                      {isNegative && (
                        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 space-y-2">
                        {lines.map((line, lineIdx) => {
                          if (!line.trim()) return null;
                          
                          const isHeading = line === line.toUpperCase() || line.startsWith('##');
                          
                          if (isHeading) {
                            return (
                              <h4 key={lineIdx} className="font-bold text-base text-foreground">
                                {line.replace(/^#+\s*/, '')}
                              </h4>
                            );
                          }
                          
                          if (line.trim().match(/^[-*•]\s/)) {
                            return (
                              <div key={lineIdx} className="flex gap-2 ml-4">
                                <span className="text-primary mt-1">•</span>
                                <p className="text-sm text-foreground/90 leading-relaxed">
                                  {line.replace(/^[-*•]\s*/, '')}
                                </p>
                              </div>
                            );
                          }
                          
                          return (
                            <p key={lineIdx} className="text-sm text-foreground/90 leading-relaxed">
                              {line}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
