import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, LogOut, User, Award, Briefcase, Building2, Code, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Leaderboard } from "@/components/Leaderboard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
const InternProfile = () => {
  const {
    toast
  } = useToast();
  const {
    user,
    role,
    loading,
    signOut
  } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [positionData, setPositionData] = useState<any>(null);
  const [companyData, setCompanyData] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);
  useEffect(() => {
    if (!loading && (!user || role !== 'intern')) {
      window.location.href = "/auth";
      return;
    }
    if (user && role === 'intern') {
      loadProfile();
      loadSubmissions();
    }
  }, [user, role, loading]);
  const loadProfile = async () => {
    if (!user) return;
    const {
      data,
      error
    } = await supabase.from("users").select("*").eq("id", user.id).single();
    if (!error && data) {
      setProfile(data);
      if (data.position_id) {
        const {
          data: position
        } = await supabase.from("positions").select("id, name, rules, company_id").eq("id", data.position_id).single();
        if (position) {
          setPositionData(position);
        }
      }
      if (user) {
        const {
          data: companyInfo
        } = await supabase.rpc("get_intern_company_info", {
          _user_id: user.id
        });
        if (companyInfo && companyInfo.length > 0) {
          setCompanyData(companyInfo[0]);
        }
      }
    }
  };
  const loadSubmissions = async () => {
    if (!user) return;
    const {
      data,
      error
    } = await supabase.from("code_submissions").select("*").eq("intern_id", user.id).order("submitted_at", {
      ascending: false
    }).limit(10);
    if (!error && data) {
      setSubmissions(data);
    }
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="border-b border-border/40 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-muted-foreground">Welcome back, {profile?.first_name}</p>
            </div>
            <Button onClick={signOut} variant="outline" className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Top Section - Profile & Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-start">
          {/* Profile Card */}
          <Card className="border-border/50 bg-card shadow-sm animate-fade-in h-fit">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-sm">
                  <User className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-card-foreground">
                    {profile?.first_name} {profile?.last_name}
                  </h2>
                  <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
                </div>
              </div>

              <div className="border-t border-border/50"></div>

              {companyData && <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white uppercase tracking-wide">Company</p>
                    <p className="text-sm font-semibold text-white truncate">
                      {companyData.first_name} {companyData.last_name}
                    </p>
                  </div>
                </div>}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="h-4 w-4 text-primary" />
                    <p className="text-xs font-medium text-muted-foreground">Rating</p>
                  </div>
                  <p className="text-2xl font-bold text-primary">{profile?.rating_points || 100}</p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="h-4 w-4 text-accent-foreground" />
                    <p className="text-xs font-medium text-muted-foreground">Position</p>
                  </div>
                  <p className="text-sm font-semibold text-card-foreground truncate">
                    {positionData?.name || "Not assigned"}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Leaderboard */}
          {profile?.company_id && profile?.position_id && user && <div className="animate-fade-in" style={{
          animationDelay: '100ms'
        }}>
              <Leaderboard companyId={profile.company_id} positionId={profile.position_id} currentUserId={user.id} />
            </div>}
        </div>

        {/* Guidelines */}
        {positionData?.rules && <Card className="border-border/50 bg-card shadow-sm animate-fade-in" style={{
        animationDelay: '100ms'
      }}>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">Company Guidelines</h3>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg border border-border/50 max-h-[300px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono text-foreground/90 leading-relaxed">
              {positionData.rules}
                </pre>
              </div>
            </div>
          </Card>}

        {/* Submission History */}
        <Card className="border-border/50 bg-card shadow-sm animate-fade-in" style={{
        animationDelay: '200ms'
      }}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Code className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">Submission History</h3>
              </div>
              <Link to="/intern/portal">
                <Button className="gap-2">
                  <Code className="h-4 w-4" />
                  Go to Code Portal
                </Button>
              </Link>
            </div>

            {submissions.length === 0 ? <div className="text-center py-8">
                <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No submissions yet</p>
                <Link to="/intern/portal">
                  
                </Link>
              </div> : <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map(submission => <>
                      <TableRow key={submission.id} className={submission.feedback ? "cursor-pointer hover:bg-muted/50" : ""} onClick={() => submission.feedback && setExpandedSubmission(expandedSubmission === submission.id ? null : submission.id)}>
                        <TableCell className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(submission.submitted_at).toLocaleDateString()} {new Date(submission.submitted_at).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              submission.status === 'approved' 
                                ? 'bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400' 
                                : submission.status === 'rejected'
                                ? 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400'
                                : ''
                            }
                          >
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right flex items-center justify-end gap-2">
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            {submission.points_awarded >= 0 ? '+' : ''}{submission.points_awarded} pts
                          </Badge>
                          {submission.feedback && (expandedSubmission === submission.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />)}
                        </TableCell>
                      </TableRow>
                      {expandedSubmission === submission.id && submission.feedback && <TableRow>
                          <TableCell colSpan={3} className="bg-muted/30 border-t">
                            <div className="p-4 space-y-2">
                              <h4 className="font-semibold text-sm flex items-center gap-2">
                                <Code className="h-4 w-4" />
                                AI Code Review
                              </h4>
                              <pre className="text-sm whitespace-pre-wrap text-muted-foreground font-sans leading-relaxed">{submission.feedback}</pre>
                            </div>
                          </TableCell>
                        </TableRow>}
                    </>)}
                </TableBody>
              </Table>}
          </div>
        </Card>
      </div>
    </div>;
};
export default InternProfile;