import { NoobieLogo } from "./NoobieLogo";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex-1" />
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <NoobieLogo textSize="text-2xl" className="text-primary" />
        </Link>
      </div>
    </header>
  );
};
