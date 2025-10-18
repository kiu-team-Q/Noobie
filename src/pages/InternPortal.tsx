import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Code2, ArrowLeft, Play, Lightbulb, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Violation {
  type: "style" | "security" | "workflow";
  line: number;
  message: string;
  fix: string;
}

const InternPortal = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [internEmail, setInternEmail] = useState("");
  const [internRole, setInternRole] = useState("");
  const [internRoleId, setInternRoleId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [rules, setRules] = useState<any[]>([]);
  const [selectedRuleType, setSelectedRuleType] = useState<string>("");
  const [code, setCode] = useState("");
  const [analysis, setAnalysis] = useState<{
    violations: Violation[];
    onboarding_steps: string[];
    explanation: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("intern_email");
    const role = localStorage.getItem("intern_role");
    const roleId = localStorage.getItem("intern_role_id");
    const company = localStorage.getItem("company_name");
    
    if (!email) {
      navigate("/intern/login");
      return;
    }
    
    setInternEmail(email);
    setInternRole(role || "No role assigned");
    setInternRoleId(roleId || "");
    setCompanyName(company || "");
    
    if (roleId) {
      loadRulesForRole(roleId);
    }
  }, [navigate]);

  const loadRulesForRole = async (roleId: string) => {
    const { data, error } = await supabase
      .from("rules_files")
      .select("*")
      .eq("role_id", roleId);

    if (!error && data && data.length > 0) {
      setRules(data);
      setSelectedRuleType(data[0].file_type);
    }
  };

  const getSelectedRule = () => {
    return rules.find(r => r.file_type === selectedRuleType);
  };

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

  const handleLogout = () => {
    localStorage.removeItem("intern_id");
    localStorage.removeItem("intern_email");
    localStorage.removeItem("intern_role");
    localStorage.removeItem("intern_role_id");
    localStorage.removeItem("company_name");
    navigate("/intern/login");
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
          <div className="flex items-center justify-between">
            <div>
              <Link to="/" className="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
              <h1 className="text-3xl font-bold text-foreground">Intern Portal</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {internEmail}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{internRole}</Badge>
                </div>
                {companyName && (
                  <div>at {companyName}</div>
                )}
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Rules Section */}
        {rules.length > 0 && (
          <Card className="mb-6 border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold text-card-foreground">
              Your Role's Coding Rules
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              These are the coding standards for your role: {internRole}
            </p>

            <div className="mb-4">
              <Label htmlFor="ruleType">Rule Type</Label>
              <select
                id="ruleType"
                value={selectedRuleType}
                onChange={(e) => setSelectedRuleType(e.target.value)}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {rules.map((rule) => (
                  <option key={rule.file_type} value={rule.file_type}>
                    {rule.file_name} ({rule.rules_count} rules)
                  </option>
                ))}
              </select>
            </div>

            {getSelectedRule() && (
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge
                    className={
                      selectedRuleType === "style"
                        ? "bg-violation-style/20 text-violation-style"
                        : selectedRuleType === "security"
                        ? "bg-violation-security/20 text-violation-security"
                        : selectedRuleType === "workflow"
                        ? "bg-violation-workflow/20 text-violation-workflow"
                        : "bg-primary/20 text-primary"
                    }
                  >
                    {selectedRuleType}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {getSelectedRule()?.rules_count} rules
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedRuleType === "style" && "Follow these naming conventions and code formatting standards"}
                  {selectedRuleType === "security" && "Security best practices to prevent vulnerabilities"}
                  {selectedRuleType === "workflow" && "Workflow patterns and function call sequences"}
                  {selectedRuleType === "mentorship" && "Advanced tips and best practices from senior developers"}
                </p>
              </div>
            )}
          </Card>
        )}

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