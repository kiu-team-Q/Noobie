import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, ArrowLeft, LogOut, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  position?: string;
  company_id?: string;
  user_roles: { role: string }[];
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const { user, role, loading, signOut } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    position: "",
  });

  useEffect(() => {
    if (!loading && (!user || role !== 'admin')) {
      window.location.href = "/auth";
      return;
    }
    
    if (user && role === 'admin') {
      loadUsers();
    }
  }, [user, role, loading]);

  const loadUsers = async () => {
    const { data: usersData, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
      return;
    }

    if (usersData) {
      // Fetch roles for all users
      const usersWithRoles = await Promise.all(
        usersData.map(async (user) => {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .single();
          
          return {
            ...user,
            user_roles: roleData ? [{ role: roleData.role }] : [],
          };
        })
      );
      
      setUsers(usersWithRoles);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          position: formData.position,
          role: 'company',
        },
      });

      if (authError) throw authError;

      toast({
        title: "Success",
        description: "Company user created successfully",
      });

      setIsDialogOpen(false);
      setFormData({ email: "", password: "", firstName: "", lastName: "", position: "" });
      loadUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create company user",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

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
              <p className="text-muted-foreground">Manage users and system</p>
            </div>
            <Button onClick={signOut} variant="outline" className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">All Users</h2>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Company
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Company User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateCompany} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full">Create Company</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid gap-4">
            {users.map((u) => (
              <Card key={u.id} className="border-border bg-card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    
                    <div>
                      <h3 className="mb-1 text-lg font-semibold text-card-foreground">
                        {u.first_name} {u.last_name}
                      </h3>
                      <p className="mb-2 text-sm text-muted-foreground">{u.email}</p>
                      
                      <div className="flex gap-2">
                        <Badge className={
                          u.user_roles[0]?.role === 'admin' 
                            ? "bg-red-500/10 text-red-500 border-red-500/20" 
                            : u.user_roles[0]?.role === 'company'
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            : "bg-green-500/10 text-green-500 border-green-500/20"
                        }>
                          {u.user_roles[0]?.role || 'No role'}
                        </Badge>
                        {u.position && (
                          <Badge variant="outline">{u.position}</Badge>
                        )}
                      </div>
                    </div>
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
