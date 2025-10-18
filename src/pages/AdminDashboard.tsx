import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowLeft, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  position?: string;
  company_id?: string;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const { user, role, loading, signOut } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

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
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } else if (data) {
      setUsers(data as User[]);
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
          <h2 className="mb-4 text-xl font-semibold text-foreground">All Users</h2>
          
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
                          u.role === 'admin' 
                            ? "bg-red-500/10 text-red-500 border-red-500/20" 
                            : u.role === 'company'
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            : "bg-green-500/10 text-green-500 border-green-500/20"
                        }>
                          {u.role}
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
