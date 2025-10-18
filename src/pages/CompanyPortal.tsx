import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, LogOut, User, Plus, Copy, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CompanyPortal = () => {
  const { toast } = useToast();
  const { user, role, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [newPosition, setNewPosition] = useState({
    name: "",
    rules: "",
  });

  useEffect(() => {
    if (!loading && (!user || role !== 'company')) {
      window.location.href = "/auth";
      return;
    }
    
    if (user && role === 'company') {
      loadProfile();
      loadPositions();
    }
  }, [user, role, loading]);

  const loadProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  const loadPositions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("positions")
      .select("*")
      .eq("company_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPositions(data);
    }
  };

  const handleCreatePosition = async () => {
    if (!user || !newPosition.name.trim()) return;

    const { error } = await supabase
      .from("positions")
      .insert({
        name: newPosition.name,
        rules: newPosition.rules,
        company_id: user.id,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create position",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Position created successfully",
    });

    setNewPosition({ name: "", rules: "" });
    setIsCreateOpen(false);
    loadPositions();
  };

  const handleGenerateInvite = async (positionId: string) => {
    if (!user) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke("create-invitation", {
        body: { position_id: positionId },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.error) throw response.error;

      setInviteUrl(response.data.invite_url);
      setSelectedPosition(positionId);
      setIsInviteOpen(true);

      toast({
        title: "Invite created",
        description: "Share this link with interns",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate invite",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "Copied!",
      description: "Invite link copied to clipboard",
    });
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
              <h1 className="text-3xl font-bold text-foreground">Company Portal</h1>
              <p className="text-muted-foreground">Welcome {profile?.first_name}</p>
            </div>
            <Button onClick={signOut} variant="outline" className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-6">
        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-card-foreground">
                {profile?.first_name} {profile?.last_name}
              </h2>
              <p className="text-muted-foreground">{profile?.email}</p>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Briefcase className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-card-foreground">Positions</h2>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Position
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Position</DialogTitle>
                  <DialogDescription>
                    Add a new position that you can invite interns to.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Position Name</Label>
                    <Input
                      id="name"
                      value={newPosition.name}
                      onChange={(e) =>
                        setNewPosition({ ...newPosition, name: e.target.value })
                      }
                      placeholder="e.g. Frontend Developer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rules">Rules</Label>
                    <Textarea
                      id="rules"
                      value={newPosition.rules}
                      onChange={(e) =>
                        setNewPosition({ ...newPosition, rules: e.target.value })
                      }
                      placeholder="List the rules for this position..."
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePosition}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {positions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No positions yet. Create one to start inviting interns.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Rules</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => (
                  <TableRow key={position.id}>
                    <TableCell className="font-medium">{position.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {position.rules || "No rules set"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateInvite(position.id)}
                      >
                        Generate Invite
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Link Generated</DialogTitle>
              <DialogDescription>
                Share this link with interns to invite them to this position.
                The link expires in 7 days.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <Input value={inviteUrl} readOnly />
              <Button size="icon" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CompanyPortal;
