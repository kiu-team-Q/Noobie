import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Code2, Shield, Zap, Users, ArrowRight, Upload, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { NoobieLogo } from "@/components/NoobieLogo";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-violation-style/10 animate-pulse" />
        
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-violation-style/5 rounded-full blur-3xl" />
        
        <div className="container relative mx-auto px-6 py-32 pt-32">
          <div className="mx-auto max-w-3xl text-center">
            
            <h1 className="mb-6 flex flex-col items-center gap-2 animate-fade-in">
              <span className="text-2xl font-medium text-muted-foreground">Welcome to</span>
              <NoobieLogo textSize="text-5xl md:text-7xl" className="text-primary" />
            </h1>
            
            <p className="mb-8 text-xl text-muted-foreground leading-relaxed animate-fade-in" style={{ animationDelay: "0.1s" }}>
              The intelligent mentor platform that helps new developers onboard faster with 
              company-specific AI guidance, real-time code analysis, and personalized learning paths.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <Link to="/auth">
                <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-primary/50">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-foreground">
            Built for Modern Developer Teams
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to accelerate developer onboarding
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="group border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-violation-style/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-violation-style/20">
              <Code2 className="h-6 w-6 text-violation-style transition-transform duration-300 group-hover:rotate-3" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              Style Compliance
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Ensure consistent code style across your team with automated style checking 
              and real-time suggestions.
            </p>
          </Card>

          <Card className="group border-border bg-card p-6 transition-all duration-300 hover:border-violation-security/50 hover:shadow-lg hover:shadow-violation-security/10 hover:-translate-y-1">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-violation-security/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-violation-security/20">
              <Shield className="h-6 w-6 text-violation-security transition-transform duration-300 group-hover:rotate-3" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              Security First
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Catch security vulnerabilities early with intelligent analysis that flags 
              unsafe patterns and suggests fixes.
            </p>
          </Card>

          <Card className="group border-border bg-card p-6 transition-all duration-300 hover:border-violation-workflow/50 hover:shadow-lg hover:shadow-violation-workflow/10 hover:-translate-y-1">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-violation-workflow/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-violation-workflow/20">
              <Zap className="h-6 w-6 text-violation-workflow transition-transform duration-300 group-hover:rotate-3" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              Workflow Optimization
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Guide developers through company-specific workflows and best practices 
              for faster, more effective onboarding.
            </p>
          </Card>

          <Card className="group border-border bg-card p-6 transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-accent/20">
              <Upload className="h-6 w-6 text-accent-foreground transition-transform duration-300 group-hover:rotate-3" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              Custom Rule Sets
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Upload your company's coding standards as ZIP files. Noobie adapts 
              to your unique requirements.
            </p>
          </Card>

          <Card className="group border-border bg-card p-6 transition-all duration-300 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-1">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-violet-500/20">
              <MessageSquare className="h-6 w-6 text-violet-500 transition-transform duration-300 group-hover:rotate-3" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              AI Mentorship
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Get contextual explanations, code suggestions, and learning resources 
              powered by advanced AI models.
            </p>
          </Card>

          <Card className="group border-border bg-card p-6 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500/20">
              <Users className="h-6 w-6 text-emerald-500 transition-transform duration-300 group-hover:rotate-3" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              Secure Invites
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              OTP-based invite system ensures secure onboarding for companies and 
              interns without manual key management.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative border-t border-border bg-card/50 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-violation-style/5 rounded-full blur-3xl" />
        
        <div className="container relative mx-auto px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-6 text-4xl font-bold text-foreground">
              Ready to Transform Your Onboarding?
            </h2>
            <div className="mb-8 flex flex-col items-center gap-3">
              <p className="text-lg text-muted-foreground">Start using</p>
              <NoobieLogo textSize="text-4xl" className="text-primary" />
              <p className="text-lg text-muted-foreground">today and help your developers become productive faster.</p>
            </div>
            <Link to="/auth">
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-primary/50">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {/* Admin Access Note */}
          <div className="mt-12 text-center">
            <p className="text-xs text-muted-foreground">
              Admin access available through the auth page
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;