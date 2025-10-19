import { Card } from "@/components/ui/card";
import { Code2, Shield, Zap, Upload, MessageSquare, Users } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Features = () => {
  const features = [
    {
      icon: Code2,
      title: "Style Compliance",
      description: "Ensure consistent code style across your team with automated style checking and real-time suggestions.",
      color: "violation-style"
    },
    {
      icon: Shield,
      title: "Security First",
      description: "Catch security vulnerabilities early with intelligent analysis that flags unsafe patterns and suggests fixes.",
      color: "violation-security"
    },
    {
      icon: Zap,
      title: "Workflow Optimization",
      description: "Guide developers through company-specific workflows and best practices for faster, more effective onboarding.",
      color: "violation-workflow"
    },
    {
      icon: Upload,
      title: "Custom Rule Sets",
      description: "Upload your company's coding standards as ZIP files. Noobie adapts to your unique requirements.",
      color: "primary"
    },
    {
      icon: MessageSquare,
      title: "AI Mentorship",
      description: "Get contextual explanations, code suggestions, and learning resources powered by advanced AI models.",
      color: "primary"
    },
    {
      icon: Users,
      title: "Secure Invites",
      description: "OTP-based invite system ensures secure onboarding for companies and interns without manual key management.",
      color: "primary"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-6 pt-32 pb-20">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">Features</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to accelerate developer onboarding and maintain code quality
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="border-border bg-card p-6 transition-all hover:border-primary/50">
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-${feature.color}/10`}>
                <feature.icon className={`h-6 w-6 text-${feature.color}`} />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Features;
