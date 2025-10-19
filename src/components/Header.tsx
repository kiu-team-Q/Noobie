import { NoobieLogo } from "./NoobieLogo";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Building2, User } from "lucide-react";

export const Header = () => {
  const { user, role } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md animate-fade-in">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/">
            <NoobieLogo textSize="text-2xl" enableTracking={false} />
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About Us
            </Link>
          </nav>

          {user && role ? (
            <Link to={role === 'admin' ? '/admin' : role === 'company' ? '/company' : '/intern'}>
              <Button variant="outline" size="sm" className="gap-2">
                {role === 'company' ? (
                  <>
                    <Building2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Portal</span>
                  </>
                ) : role === 'intern' ? (
                  <>
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Portal</span>
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </>
                )}
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
