import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, LogOut, User, Plus, Copy, Briefcase, Pencil, FileText, Mail, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [interns, setInterns] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [newPosition, setNewPosition] = useState({
    name: "",
    rules: "",
  });
  const [editPosition, setEditPosition] = useState({
    id: "",
    name: "",
    rules: "",
  });
  const [editProfile, setEditProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  useEffect(() => {
    if (!loading && (!user || role !== 'company')) {
      window.location.href = "/auth";
      return;
    }
    
    if (user && role === 'company') {
      loadProfile();
      loadPositions();
      loadInterns();
      
      // Set up real-time listener for new interns
      const channel = supabase
        .channel('company-interns-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'users',
            filter: `company_id=eq.${user.id}`
          },
          () => {
            // Reload interns when changes occur
            loadInterns();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
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

  const loadInterns = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("users")
      .select(`
        *,
        user_roles(role),
        positions(name)
      `)
      .eq("company_id", user.id);

    console.log('loadInterns response:', { data, error });

    if (error) {
      console.error('Error loading interns:', error);
      return;
    }

    // Filter for interns only
    const internsData = data?.filter((u: any) => 
      Array.isArray(u.user_roles) && u.user_roles.some((role: any) => role.role === 'intern')
    ) || [];
    
    console.log('Filtered interns:', internsData);
    setInterns(internsData);
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

  const handleEditPosition = async () => {
    if (!user || !editPosition.name.trim()) return;

    const { error } = await supabase
      .from("positions")
      .update({
        name: editPosition.name,
        rules: editPosition.rules,
      })
      .eq("id", editPosition.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update position",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Position updated successfully",
    });

    setEditPosition({ id: "", name: "", rules: "" });
    setIsEditOpen(false);
    loadPositions();
  };

  const openEditDialog = (position: any) => {
    setEditPosition({
      id: position.id,
      name: position.name,
      rules: position.rules || "",
    });
    setIsEditOpen(true);
  };

  const handleEditProfile = async () => {
    if (!user || !editProfile.first_name.trim() || !editProfile.last_name.trim()) return;

    const { error } = await supabase
      .from("users")
      .update({
        first_name: editProfile.first_name,
        last_name: editProfile.last_name,
        email: editProfile.email,
      })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Profile updated successfully",
    });

    setIsEditProfileOpen(false);
    loadProfile();
  };

  const openEditProfileDialog = () => {
    if (profile) {
      setEditProfile({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
      });
      setIsEditProfileOpen(true);
    }
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
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-card-foreground">
                {profile?.first_name} {profile?.last_name}
              </h2>
              <p className="text-muted-foreground">{profile?.email}</p>
            </div>
            <Button variant="outline" onClick={openEditProfileDialog}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-card-foreground">Invite Interns</h2>
              <p className="text-sm text-muted-foreground">Generate invitation links for your positions</p>
            </div>
          </div>

          {positions.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Create a position first to invite interns
              </p>
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Position
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {positions.map((position) => (
                <div key={position.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{position.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {position.rules ? "Guidelines configured" : "No guidelines set"}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleGenerateInvite(position.id)}
                    className="gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Generate Invite Link
                  </Button>
                </div>
              ))}
            </div>
          )}
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
                  <TableHead>Position</TableHead>
                  <TableHead className="w-1/2">Guidelines</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => (
                  <TableRow key={position.id}>
                    <TableCell className="align-top">
                      <Badge variant="outline" className="gap-1.5 text-base px-3 py-1.5">
                        <Briefcase className="h-4 w-4" />
                        {position.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-top">
                      {position.rules ? (
                        <div className="space-y-1.5 py-1">
                          {position.rules.split('\n').map((rule: string, index: number) => 
                            rule.trim() && (
                              <div key={index} className="flex items-start gap-2 text-sm">
                                <span className="text-primary mt-0.5">•</span>
                                <span className="text-muted-foreground leading-relaxed">{rule.trim()}</span>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm italic">No guidelines set</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right align-top">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(position)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleGenerateInvite(position.id)}
                        >
                          Generate Invite
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold text-card-foreground">Interns</h2>
          </div>

          {interns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No interns have joined yet. Share invite links to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead className="text-right">Rating Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interns.map((intern) => (
                  <TableRow key={intern.id}>
                    <TableCell className="font-medium">
                      {intern.first_name} {intern.last_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {intern.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {intern.positions?.name || 'No position'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        {intern.rating_points} pts
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Company Profile</DialogTitle>
              <DialogDescription>
                Update your company information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="profile-first-name">First Name</Label>
                <Input
                  id="profile-first-name"
                  value={editProfile.first_name}
                  onChange={(e) =>
                    setEditProfile({ ...editProfile, first_name: e.target.value })
                  }
                  placeholder="First name"
                />
              </div>
              <div>
                <Label htmlFor="profile-last-name">Last Name</Label>
                <Input
                  id="profile-last-name"
                  value={editProfile.last_name}
                  onChange={(e) =>
                    setEditProfile({ ...editProfile, last_name: e.target.value })
                  }
                  placeholder="Last name"
                />
              </div>
              <div>
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={editProfile.email}
                  onChange={(e) =>
                    setEditProfile({ ...editProfile, email: e.target.value })
                  }
                  placeholder="email@company.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditProfile}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Position</DialogTitle>
              <DialogDescription>
                Update the position details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Position Name</Label>
                <Input
                  id="edit-name"
                  value={editPosition.name}
                  onChange={(e) =>
                    setEditPosition({ ...editPosition, name: e.target.value })
                  }
                  placeholder="e.g. Frontend Developer"
                />
              </div>
              <div>
                <Label htmlFor="edit-rules">Rules</Label>
                <Textarea
                  id="edit-rules"
                  value={editPosition.rules}
                  onChange={(e) =>
                    setEditPosition({ ...editPosition, rules: e.target.value })
                  }
                  placeholder="List the rules for this position..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditPosition}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
