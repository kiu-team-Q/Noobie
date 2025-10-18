import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

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
    <div className="space-y-4">
      <Card className="border-border bg-card p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Code Editor</h3>
          <p className="text-sm text-muted-foreground">
            Test your knowledge by writing code following the company rules
          </p>
        </div>
        
        <div className="border rounded-lg overflow-hidden mb-4">
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
            }}
          />
        </div>

        <Button
          onClick={handleCheckCode}
          disabled={isChecking}
          className="w-full"
        >
          {isChecking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking code...
            </>
          ) : (
            "Check Code Against Rules"
          )}
        </Button>
      </Card>

      {feedback && (
        <Card className="border-border bg-card p-4">
          <h3 className="text-lg font-semibold mb-2">AI Feedback</h3>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-sm">{feedback}</pre>
          </div>
        </Card>
      )}
    </div>
  );
};
