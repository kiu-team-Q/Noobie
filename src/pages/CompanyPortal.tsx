import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileCode, Shield, GitBranch, Lightbulb, Mail, Plus, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface RuleFile {
  name: string;
  type: "style" | "security" | "workflow" | "mentorship";
  rulesCount: number;
}

interface Intern {
  id: string;
  email: string;
  inviteLink: string;
  otp: string;
  status: "pending" | "active";
}

const CompanyPortal = () => {
  const { toast } = useToast();
  const [uploadedRules, setUploadedRules] = useState<RuleFile[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [internEmail, setInternEmail] = useState("");
  const [testCode, setTestCode] = useState("");
  const [testResults, setTestResults] = useState<any>(null);

  const handleRuleUpload = () => {
    // Simulate ZIP upload and parsing
    const mockRules: RuleFile[] = [
      { name: "style_rules.json", type: "style", rulesCount: 8 },
      { name: "security_rules.json", type: "security", rulesCount: 12 },
      { name: "workflow_rules.json", type: "workflow", rulesCount: 6 },
      { name: "mentorship_tips.json", type: "mentorship", rulesCount: 15 },
    ];
    
    setUploadedRules(mockRules);
    toast({
      title: "Rules Uploaded Successfully",
      description: "All rule files have been parsed and loaded",
    });
  };

  const handleInviteIntern = () => {
    if (!internEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an intern email address",
        variant: "destructive",
      });
      return;
    }

    const newIntern: Intern = {
      id: Date.now().toString(),
      email: internEmail,
      inviteLink: `https://devbuddy.app/intern/invite/${Math.random().toString(36).substring(2, 9)}`,
      otp: Math.random().toString(36).substring(2, 10).toUpperCase(),
      status: "pending",
    };

    setInterns([...interns, newIntern]);
    setInternEmail("");
    
    toast({
      title: "Intern Invited",
      description: `Invitation sent to ${newIntern.email}`,
    });
  };

  const handleTestCode = () => {
    // Simulate AI analysis
    const mockResults = {
      violations: [
        {
          type: "style",
          line: 1,
          message: "Function names must be camelCase",
          fix: "def myFunction():",
        },
        {
          type: "security",
          line: 2,
          message: "Avoid using eval() - potential code injection",
          fix: "safe_parse(user_input)",
        },
      ],
      onboarding_steps: [
        "1️⃣ Rename functions using camelCase convention",
        "2️⃣ Replace eval() with safe parsing methods",
        "3️⃣ Review company security standards (Section 2.3)",
      ],
    };

    setTestResults(mockResults);
    toast({
      title: "Analysis Complete",
      description: "Code has been analyzed for violations",
    });
  };

  const getRuleIcon = (type: string) => {
    switch (type) {
      case "style":
        return <FileCode className="h-5 w-5 text-violation-style" />;
      case "security":
        return <Shield className="h-5 w-5 text-violation-security" />;
      case "workflow":
        return <GitBranch className="h-5 w-5 text-violation-workflow" />;
      case "mentorship":
        return <Lightbulb className="h-5 w-5 text-primary" />;
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
          <h1 className="text-3xl font-bold text-foreground">Company Portal</h1>
          <p className="text-muted-foreground">Manage rules, interns, and test AI feedback</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="rules" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="rules">Rule Management</TabsTrigger>
            <TabsTrigger value="interns">Invite Interns</TabsTrigger>
            <TabsTrigger value="test">Test AI</TabsTrigger>
          </TabsList>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-6">
            <Card className="border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold text-card-foreground">Upload Rule Files</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Upload a ZIP file containing your company's coding standards, security rules, and workflow guidelines
              </p>

              <div className="flex gap-4">
                <Input type="file" accept=".zip" className="flex-1" />
                <Button onClick={handleRuleUpload} className="gap-2 bg-primary hover:bg-primary/90">
                  <Upload className="h-4 w-4" />
                  Upload ZIP
                </Button>
              </div>
            </Card>

            {uploadedRules.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-foreground">Loaded Rules</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {uploadedRules.map((rule, index) => (
                    <Card key={index} className="border-border bg-card p-4">
                      <div className="flex items-center gap-3">
                        {getRuleIcon(rule.type)}
                        <div>
                          <p className="font-semibold text-card-foreground">{rule.name}</p>
                          <p className="text-sm text-muted-foreground">{rule.rulesCount} rules loaded</p>
                        </div>
                        <CheckCircle2 className="ml-auto h-5 w-5 text-green-500" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Interns Tab */}
          <TabsContent value="interns" className="space-y-6">
            <Card className="border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold text-card-foreground">Invite Intern</h2>
              
              <div className="flex gap-4">
                <Input
                  type="email"
                  placeholder="intern@email.com"
                  value={internEmail}
                  onChange={(e) => setInternEmail(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleInviteIntern} className="gap-2 bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4" />
                  Send Invite
                </Button>
              </div>
            </Card>

            {interns.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-foreground">Invited Interns</h3>
                <div className="space-y-4">
                  {interns.map((intern) => (
                    <Card key={intern.id} className="border-border bg-card p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-semibold text-card-foreground">{intern.email}</p>
                            <p className="text-sm text-muted-foreground">OTP: {intern.otp}</p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-500/10 text-yellow-500">
                          {intern.status}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Test AI Tab */}
          <TabsContent value="test" className="space-y-6">
            <Card className="border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold text-card-foreground">Test AI Feedback</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Paste code to see how DevBuddy will analyze it for your interns
              </p>

              <Label htmlFor="testCode">Code Sample</Label>
              <Textarea
                id="testCode"
                placeholder="def MyFunction():&#10;    eval(user_input)&#10;    compute()"
                value={testCode}
                onChange={(e) => setTestCode(e.target.value)}
                className="mt-2 font-mono"
                rows={10}
              />

              <Button onClick={handleTestCode} className="mt-4 gap-2 bg-primary hover:bg-primary/90">
                Analyze Code
              </Button>
            </Card>

            {testResults && (
              <Card className="border-border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold text-card-foreground">Analysis Results</h3>
                
                <div className="mb-6 space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">Violations Found</h4>
                  {testResults.violations.map((violation: any, index: number) => (
                    <div
                      key={index}
                      className={`rounded-lg border p-4 ${
                        violation.type === "style"
                          ? "border-violation-style/30 bg-violation-style/5"
                          : "border-violation-security/30 bg-violation-security/5"
                      }`}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <Badge
                          className={
                            violation.type === "style"
                              ? "bg-violation-style/20 text-violation-style"
                              : "bg-violation-security/20 text-violation-security"
                          }
                        >
                          {violation.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">Line {violation.line}</span>
                      </div>
                      <p className="mb-2 text-sm text-card-foreground">{violation.message}</p>
                      <code className="block rounded bg-code-bg p-2 text-sm text-foreground">
                        {violation.fix}
                      </code>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-semibold text-muted-foreground">Onboarding Steps</h4>
                  <div className="space-y-2">
                    {testResults.onboarding_steps.map((step: string, index: number) => (
                      <p key={index} className="text-sm text-card-foreground">
                        {step}
                      </p>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CompanyPortal;