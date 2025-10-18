import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileCode, Shield, GitBranch, Lightbulb, Mail, Plus, ArrowLeft, CheckCircle2, LogOut, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RuleFile {
  name: string;
  type: "style" | "security" | "workflow" | "mentorship";
  rulesCount: number;
}

interface Intern {
  id: string;
  email: string;
  invite_link: string;
  otp: string;
  status: "pending" | "active";
  role_id?: string;
  roles?: {
    role_name: string;
  };
}

interface Role {
  id: string;
  role_name: string;
  description: string;
}

const CompanyPortal = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [uploadedRules, setUploadedRules] = useState<RuleFile[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [internEmail, setInternEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [testCode, setTestCode] = useState("");
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    const id = localStorage.getItem("company_id");
    const name = localStorage.getItem("company_name");
    
    if (!id || !name) {
      navigate("/company/login");
      return;
    }
    
    setCompanyId(id);
    setCompanyName(name);
    loadRoles(id);
    loadInterns(id);
  }, [navigate]);

  const loadRoles = async (compId: string) => {
    const { data, error } = await supabase
      .from("roles")
      .select("*")
      .eq("company_id", compId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRoles(data);
    }
  };

  const loadInterns = async (compId: string) => {
    const { data, error } = await supabase
      .from("interns")
      .select("*, roles(role_name)")
      .eq("company_id", compId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setInterns(data as Intern[]);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName) {
      toast({
        title: "Role Name Required",
        description: "Please enter a role name",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("roles")
      .insert({
        company_id: companyId,
        role_name: newRoleName,
        description: newRoleDescription,
      });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Role Created",
      description: `Role "${newRoleName}" has been created`,
    });

    setNewRoleName("");
    setNewRoleDescription("");
    loadRoles(companyId);
  };

  const handleRuleUpload = () => {
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

  const handleInviteIntern = async () => {
    if (!internEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an intern email address",
        variant: "destructive",
      });
      return;
    }

    if (!selectedRole) {
      toast({
        title: "Role Required",
        description: "Please select a role for the intern",
        variant: "destructive",
      });
      return;
    }

    const otp = Math.random().toString(36).substring(2, 10).toUpperCase();
    const inviteLink = `${window.location.origin}/intern/login?invite=${Math.random().toString(36).substring(2, 9)}`;

    const { error } = await supabase
      .from("interns")
      .insert({
        company_id: companyId,
        role_id: selectedRole,
        email: internEmail,
        password_hash: "$2a$10$placeholder",
        otp: otp,
        invite_link: inviteLink,
        status: "pending",
      });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setInternEmail("");
    setSelectedRole("");
    
    toast({
      title: "Intern Invited",
      description: `Invitation sent to ${internEmail}`,
    });

    loadInterns(companyId);
  };

  const handleTestCode = () => {
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

  const handleLogout = () => {
    localStorage.removeItem("company_id");
    localStorage.removeItem("company_name");
    navigate("/company/login");
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
          <div className="flex items-center justify-between">
            <div>
              <Link to="/" className="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
              <h1 className="text-3xl font-bold text-foreground">Company Portal</h1>
              <p className="text-muted-foreground">{companyName}</p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="roles" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="roles">Role Management</TabsTrigger>
            <TabsTrigger value="rules">Rule Files</TabsTrigger>
            <TabsTrigger value="interns">Invite Interns</TabsTrigger>
            <TabsTrigger value="test">Test AI</TabsTrigger>
          </TabsList>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <Card className="border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold text-card-foreground">Create New Role</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Define roles like "Backend Developer", "Frontend Developer", etc. before inviting interns
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="roleName">Role Name</Label>
                  <Input
                    id="roleName"
                    placeholder="e.g., Backend Developer"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="roleDescription">Description (Optional)</Label>
                  <Input
                    id="roleDescription"
                    placeholder="e.g., Works on server-side logic"
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <Button onClick={handleCreateRole} className="mt-4 gap-2 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Create Role
              </Button>
            </Card>

            {roles.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-foreground">Created Roles</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {roles.map((role) => (
                    <Card key={role.id} className="border-border bg-card p-4">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold text-card-foreground">{role.role_name}</p>
                          {role.description && (
                            <p className="text-sm text-muted-foreground">{role.description}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

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
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="internEmail">Intern Email</Label>
                  <Input
                    id="internEmail"
                    type="email"
                    placeholder="intern@email.com"
                    value={internEmail}
                    onChange={(e) => setInternEmail(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="roleSelect">Assign Role</Label>
                  <select
                    id="roleSelect"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="">Select a role...</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.role_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button onClick={handleInviteIntern} className="mt-4 gap-2 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Send Invite
              </Button>
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
                            <p className="text-sm text-muted-foreground">
                              Role: {intern.roles?.role_name || "Not assigned"} | OTP: {intern.otp}
                            </p>
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