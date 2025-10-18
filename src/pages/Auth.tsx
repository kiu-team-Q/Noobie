import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inviteData, setInviteData] = useState<any>(null);
  
  const { signIn, user, role, redirectToDashboard } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && role) {
      redirectToDashboard();
    }
  }, [user, role, redirectToDashboard]);

  useEffect(() => {
    if (inviteToken) {
      loadInviteData();
    }
  }, [inviteToken]);

  const loadInviteData = async () => {
    if (!inviteToken) return;

    const { data, error } = await supabase
      .from('invitations')
      .select(`
        *,
        positions (
          name,
          rules
        )
      `)
      .eq('token', inviteToken)
      .is('used_at', null)
      .single();

    if (error || !data) {
      toast({
        title: "Invalid Invite",
        description: "This invite link is invalid or has expired",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    // Check if invitation is expired
    if (new Date(data.expires_at) < new Date()) {
      toast({
        title: "Invite Expired",
        description: "This invite link has expired",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setInviteData(data);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn(email, password);
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteToken) {
      toast({
        title: "Error",
        description: "Invalid signup link",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: firstName,
            last_name: lastName,
            invite_token: inviteToken,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Account created! Please sign in.",
      });

      // Clear form and redirect to login
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Noobie
          </CardTitle>
          <CardDescription>
            {inviteToken ? 'Create your intern account' : 'Sign in to your account'}
          </CardDescription>
          {inviteData && (
            <div className="mt-4 p-4 bg-muted rounded-lg text-left">
              <p className="text-sm font-medium">You've been invited to:</p>
              <p className="text-lg font-semibold text-primary">{inviteData.positions?.name}</p>
              {inviteData.positions?.rules && (
                <p className="text-sm text-muted-foreground mt-1">
                  {inviteData.positions.rules}
                </p>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {inviteToken ? (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          )}
          
          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
