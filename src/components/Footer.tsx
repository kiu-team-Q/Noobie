import { Link } from "react-router-dom";
import { NoobieLogo } from "./NoobieLogo";
import { Mail, Phone, MapPin } from "lucide-react";
export const Footer = () => {
  return <footer className="border-t border-border/40 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 animate-fade-in" style={{
          animationDelay: "0.1s"
        }}>
            <NoobieLogo textSize="text-xl" />
            <p className="text-sm text-muted-foreground">
              AI-powered developer onboarding platform
            </p>
          </div>

          <div className="animate-fade-in" style={{
          animationDelay: "0.2s"
        }}>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </h3>
            <a href="mailto:support@noobie.dev" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              support@noobie.dev
            </a>
          </div>

          <div className="animate-fade-in" style={{
          animationDelay: "0.3s"
        }}>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone
            </h3>
            <a href="tel:+15551234567" className="text-sm text-muted-foreground hover:text-foreground transition-colors">+995 (555) 123-4567</a>
          </div>

          <div className="animate-fade-in" style={{
          animationDelay: "0.4s"
        }}>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Office
            </h3>
            <address className="text-sm text-muted-foreground not-italic">
              Tskhinvali Str. N3<br />
              Kutaisi
            </address>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/40">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Noobie. All rights reserved.
          </p>
        </div>
      </div>
    </footer>;
};