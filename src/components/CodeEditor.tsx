import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, AlertCircle, Code2, Sparkles } from "lucide-react";

interface CodeEditorProps {
  rules: string;
  onSubmit?: (code: string) => Promise<string | null>;
  isSubmitting?: boolean;
  onGenerateTasks?: () => Promise<string | null>;
  isGeneratingTasks?: boolean;
}

export const CodeEditor = ({ rules, onSubmit, isSubmitting = false, onGenerateTasks, isGeneratingTasks = false }: CodeEditorProps) => {
  const { toast } = useToast();
  const [code, setCode] = useState('// Write your code here\n\n');
  const [feedback, setFeedback] = useState<string>("");
  const [tasks, setTasks] = useState<string>("");
  const [mode, setMode] = useState<'practice' | 'submit'>('practice');

  const handleGenerateTasks = async () => {
    if (!onGenerateTasks) return;
    
    try {
      const tasksResult = await onGenerateTasks();
      if (tasksResult) {
        setTasks(tasksResult);
        setMode('practice');
      }
    } catch (error: any) {
      console.error('Error generating tasks:', error);
      toast({
        title: "Error",
        description: "Failed to generate training tasks",
        variant: "destructive",
      });
    }
  };

  const handleSubmitCode = async () => {
    if (!code.trim() || code.trim() === '// Write your code here') {
      toast({
        title: "No code",
        description: "Please write some code first",
        variant: "destructive",
      });
      return;
    }

    if (!onSubmit) return;

    try {
      // Get AI feedback first
      const feedbackResult = await onSubmit(code);
      
      if (feedbackResult) {
        setFeedback(feedbackResult);
      }
    } catch (error: any) {
      console.error('Error submitting code:', error);
      toast({
        title: "Error",
        description: "Failed to submit code",
        variant: "destructive",
      });
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

  const parseTasks = () => {
    const taskBlocks = tasks.split(/TASK \d+:/);
    return taskBlocks.filter(block => block.trim()).map(block => {
      const lines = block.trim().split('\n');
      const title = lines[0].trim();
      const content = lines.slice(1).join('\n');
      return { title, content };
    });
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-3">
        <Button
          onClick={() => setMode('practice')}
          variant={mode === 'practice' ? 'default' : 'outline'}
          className="flex-1"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Training Mode
        </Button>
        <Button
          onClick={() => setMode('submit')}
          variant={mode === 'submit' ? 'default' : 'outline'}
          className="flex-1"
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Submit Mode
        </Button>
      </div>

      {/* Training Tasks */}
      {mode === 'practice' && (
        <Card className="border-border/50 bg-gradient-to-br from-card to-purple-500/5 shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-card-foreground">Training Tasks</h3>
                  <p className="text-sm text-muted-foreground">
                    Practice coding with AI-generated tasks based on company guidelines
                  </p>
                </div>
              </div>
              {onGenerateTasks && (
                <Button
                  onClick={handleGenerateTasks}
                  disabled={isGeneratingTasks}
                  variant="outline"
                >
                  {isGeneratingTasks ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Tasks
                    </>
                  )}
                </Button>
              )}
            </div>

            {tasks ? (
              <div className="space-y-4 mt-6">
                {parseTasks().map((task, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-background/50 border border-border/50">
                    <h4 className="font-bold text-lg mb-2 text-foreground">Task {idx + 1}: {task.title}</h4>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">{task.content}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Click "Generate Tasks" to get AI-powered practice exercises
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20 shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Code2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-card-foreground">Code Editor</h3>
              <p className="text-sm text-muted-foreground">
                {mode === 'practice' 
                  ? 'Practice coding with the training tasks above' 
                  : 'Test your skills by writing code following the company guidelines'}
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

          {mode === 'submit' && onSubmit && (
            <Button
              onClick={handleSubmitCode}
              disabled={isSubmitting}
              className="w-full h-12 text-base font-semibold"
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
          
          {mode === 'practice' && onSubmit && (
            <Button
              onClick={handleSubmitCode}
              disabled={isSubmitting}
              className="w-full h-12 text-base font-semibold"
              variant="secondary"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Getting Feedback...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get AI Feedback
                </>
              )}
            </Button>
          )}
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