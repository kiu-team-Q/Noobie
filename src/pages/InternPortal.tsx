import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Code2, ArrowLeft, Play, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Violation {
  type: "style" | "security" | "workflow";
  line: number;
  message: string;
  fix: string;
}

const InternPortal = () => {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [analysis, setAnalysis] = useState<{
    violations: Violation[];
    onboarding_steps: string[];
    explanation: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis = {
        violations: [
          {
            type: "style" as const,
            line: 1,
            message: "Function names must be camelCase",
            fix: "def myFunction():",
          },
          {
            type: "security" as const,
            line: 2,
            message: "Avoid using eval() - potential code injection vulnerability",
            fix: "safe_parse(user_input)",
          },
          {
            type: "workflow" as const,
            line: 3,
            message: "Must call initConfig() before compute()",
            fix: "initConfig()\ncompute()",
          },
        ],
        onboarding_steps: [
          "1️⃣ Rename functions using camelCase convention (e.g., myFunction)",
          "2️⃣ Replace eval() with safe parsing methods to prevent code injection",
          "3️⃣ Always initialize configuration before running compute operations",
          "4️⃣ Review the company security handbook (Section 2.3) for best practices",
        ],
        explanation:
          "These rules ensure consistent naming conventions, prevent security vulnerabilities like code injection, and follow the company's workflow patterns. Following these standards helps maintain code quality and team collaboration.",
      };

      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis Complete",
        description: `Found ${mockAnalysis.violations.length} issues to address`,
      });
    }, 1500);
  };

  const getViolationColor = (type: string) => {
    switch (type) {
      case "style":
        return "border-violation-style/30 bg-violation-style/5";
      case "security":
        return "border-violation-security/30 bg-violation-security/5";
      case "workflow":
        return "border-violation-workflow/30 bg-violation-workflow/5";
      default:
        return "";
    }
  };

  const getViolationBadgeColor = (type: string) => {
    switch (type) {
      case "style":
        return "bg-violation-style/20 text-violation-style border-violation-style/30";
      case "security":
        return "bg-violation-security/20 text-violation-security border-violation-security/30";
      case "workflow":
        return "bg-violation-workflow/20 text-violation-workflow border-violation-workflow/30";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="container mx-auto px-6 py-6">
          <Link to="/" className="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Intern Portal</h1>
          <p className="text-muted-foreground">Get real-time AI feedback on your code</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Code Input */}
          <div className="space-y-4">
            <Card className="border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-card-foreground">Your Code</h2>
                <Code2 className="h-5 w-5 text-primary" />
              </div>

              <Textarea
                placeholder="def MyFunction():&#10;    eval(user_input)&#10;    compute()&#10;&#10;def compute():&#10;    print('Computing...')"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono text-sm"
                rows={20}
              />

              <Button
                onClick={handleAnalyze}
                disabled={!code || isAnalyzing}
                className="mt-4 w-full gap-2 bg-primary hover:bg-primary/90"
              >
                <Play className="h-4 w-4" />
                {isAnalyzing ? "Analyzing..." : "Analyze Code"}
              </Button>
            </Card>
          </div>

          {/* Analysis Results */}
          <div className="space-y-4">
            {!analysis ? (
              <Card className="border-border bg-card p-12 text-center">
                <Code2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                  Ready to Analyze
                </h3>
                <p className="text-sm text-muted-foreground">
                  Paste your code and click "Analyze Code" to get AI-powered feedback
                </p>
              </Card>
            ) : (
              <>
                {/* Violations */}
                <Card className="border-border bg-card p-6">
                  <h2 className="mb-4 text-xl font-semibold text-card-foreground">
                    Issues Found ({analysis.violations.length})
                  </h2>

                  <div className="space-y-4">
                    {analysis.violations.map((violation, index) => (
                      <div
                        key={index}
                        className={`rounded-lg border p-4 ${getViolationColor(violation.type)}`}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <Badge className={getViolationBadgeColor(violation.type)}>
                            {violation.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Line {violation.line}
                          </span>
                        </div>

                        <p className="mb-3 text-sm text-card-foreground">{violation.message}</p>

                        <div>
                          <p className="mb-2 text-xs font-semibold text-muted-foreground">
                            Suggested Fix:
                          </p>
                          <code className="block rounded-lg bg-code-bg p-3 text-sm text-foreground">
                            {violation.fix}
                          </code>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Onboarding Steps */}
                <Card className="border-border bg-card p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold text-card-foreground">
                      Next Steps
                    </h2>
                  </div>

                  <div className="mb-6 space-y-3">
                    {analysis.onboarding_steps.map((step, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex-shrink-0 text-sm text-card-foreground">{step}</div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg bg-primary/5 p-4">
                    <p className="text-sm font-semibold text-primary mb-2">Why This Matters:</p>
                    <p className="text-sm text-muted-foreground">{analysis.explanation}</p>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternPortal;