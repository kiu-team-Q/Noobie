import { Card } from "@/components/ui/card";
import { Target, Users, Lightbulb } from "lucide-react";
import { Header } from "@/components/Header";
import { NoobieLogo } from "@/components/NoobieLogo";
import { Footer } from "@/components/Footer";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-6 pt-32 pb-20">
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <NoobieLogo textSize="text-4xl" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-foreground">About Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transforming developer onboarding through intelligent AI mentorship
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-12">
          <Card className="border-border bg-card p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-card-foreground mb-3">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We believe that every developer deserves a smooth onboarding experience. Noobie was created 
                  to bridge the gap between traditional documentation and hands-on learning, providing intelligent, 
                  context-aware guidance that adapts to each company's unique coding standards and practices.
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-card-foreground mb-3">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We envision a world where new developers can become productive team members in days, not months. 
                  By combining AI-powered mentorship with company-specific knowledge, we're making this vision a reality 
                  for teams around the globe.
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-card-foreground mb-3">Our Team</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Built by developers, for developers. Our team combines expertise in AI, software engineering, 
                  and education to create tools that truly understand the challenges of learning new codebases 
                  and adapting to different coding cultures.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutUs;
