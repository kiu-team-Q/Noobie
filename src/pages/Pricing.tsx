import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$49",
      period: "/month",
      description: "Perfect for small teams getting started",
      features: [
        "Up to 5 team members",
        "Basic code analysis",
        "Email support",
        "1 custom rule set",
      ]
    },
    {
      name: "Professional",
      price: "$149",
      period: "/month",
      description: "For growing teams with advanced needs",
      features: [
        "Up to 25 team members",
        "Advanced AI mentorship",
        "Priority support",
        "Unlimited rule sets",
        "Security scanning",
        "Custom integrations"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations",
      features: [
        "Unlimited team members",
        "Dedicated support",
        "Custom AI training",
        "SLA guarantee",
        "On-premise deployment",
        "Advanced analytics"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-6 pt-32 pb-20">
        <div className="mb-12 text-center animate-fade-in">
          <h1 className="mb-4 text-4xl font-bold text-foreground">Pricing</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your team's onboarding needs
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`border-border bg-card p-8 relative transition-all duration-300 hover:-translate-y-2 hover:shadow-xl animate-fade-in ${plan.popular ? 'border-primary shadow-lg' : ''}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-card-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/auth">
                <Button 
                  className="w-full transition-all duration-300 hover:scale-105" 
                  variant={plan.popular ? "default" : "outline"}
                >
                  Get Started
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Pricing;
