
import React from "react";
import { Link } from "react-router-dom";
import { Shield, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header: React.FC = () => {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl">NodeSafe</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-foreground/80 hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/documents" className="text-foreground/80 hover:text-foreground transition-colors">
            Documents
          </Link>
          <Link to="/about" className="text-foreground/80 hover:text-foreground transition-colors">
            About
          </Link>
        </nav>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>Connect</span>
          </Button>
          <Button size="sm" className="items-center gap-2">
            Upload
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
