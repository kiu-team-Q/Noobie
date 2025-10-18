import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Key, Plus, ArrowLeft, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Company {
  id: string;
  name: string;
  email: string;
  status: "pending" | "active" | "suspended";
  invite_link: string;
  otp: string;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newCompany, setNewCompany] = useState<Company | null>(null);

  useEffect(() => {
    // Check authentication
    const isLoggedIn = localStorage.getItem("admin_logged_in");
    if (!isLoggedIn) {
      navigate("/admin/login");
      return;
    }

    loadCompanies();
  }, [navigate]);

  const loadCompanies = async () => {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive",
      });
    } else if (data) {
      setCompanies(data as Company[]);
    }
  };

  const generateOTP = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const generateInviteLink = () => {
    const id = Math.random().toString(36).substring(2, 9);
    return `${window.location.origin}/company/login?invite=${id}`;
  };

  const handleInviteCompany = async () => {
    if (!companyName || !companyEmail) {
      toast({
        title: "Missing Information",
        description: "Please provide both company name and email",
        variant: "destructive",
      });
      return;
    }

    const otp = generateOTP();
    const inviteLink = generateInviteLink();

    const { data, error } = await supabase
      .from("companies")
      .insert({
        name: companyName,
        email: companyEmail,
        password_hash: "$2a$10$placeholder",
        otp: otp,
        invite_link: inviteLink,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setNewCompany(data as Company);
    setShowInviteModal(true);
    setCompanyName("");
    setCompanyEmail("");
    
    toast({
      title: "Company Invited",
      description: `Invitation sent to ${companyEmail}`,
    });

    loadCompanies();
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    navigate("/admin/login");
  };

  const getStatusColor = (status: Company["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "suspended":
        return "bg-red-500/10 text-red-500 border-red-500/20";
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
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage companies and invitations</p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Invite Company Form */}
        <Card className="mb-8 border-border bg-card p-6">
          <h2 className="mb-6 text-xl font-semibold text-card-foreground">Invite New Company</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="e.g., TechCorp Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="companyEmail">Company Email</Label>
              <Input
                id="companyEmail"
                type="email"
                placeholder="admin@company.com"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <Button 
            onClick={handleInviteCompany} 
            className="mt-6 gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Send Invitation
          </Button>
        </Card>

        {/* Invite Details Modal */}
        {showInviteModal && newCompany && (
          <Card className="mb-8 border-primary/50 bg-primary/5 p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Invitation Created Successfully!</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg bg-card p-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Invite Link</p>
                  <p className="font-mono text-sm text-foreground">{newCompany.invite_link}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 rounded-lg bg-card p-3">
                <Key className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">One-Time Password</p>
                  <p className="font-mono text-lg font-semibold text-foreground">{newCompany.otp}</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => setShowInviteModal(false)} 
              variant="outline" 
              className="mt-4"
            >
              Close
            </Button>
          </Card>
        )}

        {/* Companies List */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-foreground">Registered Companies</h2>
          
          <div className="grid gap-4">
            {companies.map((company) => (
              <Card key={company.id} className="border-border bg-card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    
                    <div>
                      <h3 className="mb-1 text-lg font-semibold text-card-foreground">{company.name}</h3>
                      <p className="mb-2 text-sm text-muted-foreground">{company.email}</p>
                      
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(company.status)}>
                          {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 grid gap-2 rounded-lg bg-muted/30 p-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Invite Link</p>
                    <p className="font-mono text-sm text-foreground">{company.invite_link}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">OTP</p>
                    <p className="font-mono text-sm font-semibold text-foreground">{company.otp}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;