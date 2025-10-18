import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Code2, Shield, Zap, Users, ArrowRight, Upload, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-violation-style/10" />
        
        <div className="container relative mx-auto px-6 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
              <Zap className="h-4 w-4" />
              AI-Powered Developer Onboarding
            </div>
            
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-6xl">
              Welcome to <span className="text-primary">DevBuddy 2.0</span>
            </h1>
            
            <p className="mb-8 text-xl text-muted-foreground">
              The intelligent mentor platform that helps new developers onboard faster with 
              company-specific AI guidance, real-time code analysis, and personalized learning paths.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/company/login">
                <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
                  Company Login
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/intern/login">
                <Button size="lg" variant="outline" className="gap-2">
                  Intern Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            Built for Modern Developer Teams
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to accelerate developer onboarding
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="group border-border bg-card p-6 transition-all hover:border-primary/50">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-violation-style/10">
              <Code2 className="h-6 w-6 text-violation-style" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              Style Compliance
            </h3>
            <p className="text-muted-foreground">
              Ensure consistent code style across your team with automated style checking 
              and real-time suggestions.
            </p>
          </Card>

          <Card className="group border-border bg-card p-6 transition-all hover:border-violation-security/50">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-violation-security/10">
              <Shield className="h-6 w-6 text-violation-security" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              Security First
            </h3>
            <p className="text-muted-foreground">
              Catch security vulnerabilities early with intelligent analysis that flags 
              unsafe patterns and suggests fixes.
            </p>
          </Card>

          <Card className="group border-border bg-card p-6 transition-all hover:border-violation-workflow/50">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-violation-workflow/10">
              <Zap className="h-6 w-6 text-violation-workflow" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              Workflow Optimization
            </h3>
            <p className="text-muted-foreground">
              Guide developers through company-specific workflows and best practices 
              for faster, more effective onboarding.
            </p>
          </Card>

          <Card className="border-border bg-card p-6 transition-all hover:border-primary/50">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              Custom Rule Sets
            </h3>
            <p className="text-muted-foreground">
              Upload your company's coding standards as ZIP files. DevBuddy adapts 
              to your unique requirements.
            </p>
          </Card>

          <Card className="border-border bg-card p-6 transition-all hover:border-primary/50">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              AI Mentorship
            </h3>
            <p className="text-muted-foreground">
              Get contextual explanations, code suggestions, and learning resources 
              powered by advanced AI models.
            </p>
          </Card>

          <Card className="border-border bg-card p-6 transition-all hover:border-primary/50">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              Secure Invites
            </h3>
            <p className="text-muted-foreground">
              OTP-based invite system ensures secure onboarding for companies and 
              interns without manual key management.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-card/50">
        <div className="container mx-auto px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Ready to Transform Your Onboarding?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Start using DevBuddy today and help your developers become productive faster.
            </p>
            <Link to="/company/login">
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;