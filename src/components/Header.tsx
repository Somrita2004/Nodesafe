
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Database, Upload, Inbox, MessageSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import WalletConnect from "@/components/WalletConnect";

const Header: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl">NodeSafe</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className={`transition-colors ${
              isActive('/') 
                ? "text-primary font-medium" 
                : "text-foreground/80 hover:text-foreground"
            }`}
          >
            Home
          </Link>
          <Link 
            to="/documents" 
            className={`transition-colors ${
              isActive('/documents') 
                ? "text-primary font-medium" 
                : "text-foreground/80 hover:text-foreground"
            }`}
          >
            Documents
          </Link>
          <Link 
            to="/inbox" 
            className={`transition-colors ${
              isActive('/inbox') 
                ? "text-primary font-medium" 
                : "text-foreground/80 hover:text-foreground"
            }`}
          >
            Inbox
          </Link>
          <Link 
            to="/messages" 
            className={`transition-colors ${
              isActive('/messages') 
                ? "text-primary font-medium" 
                : "text-foreground/80 hover:text-foreground"
            }`}
          >
            Messages
          </Link>
          <Link 
            to="/about" 
            className={`transition-colors ${
              isActive('/about') 
                ? "text-primary font-medium" 
                : "text-foreground/80 hover:text-foreground"
            }`}
          >
            About
          </Link>
        </nav>
        <div className="flex items-center space-x-3">
          <WalletConnect />
          <Button 
            size="sm" 
            className="items-center gap-2"
            asChild
          >
            <Link to="/share">
              <Upload className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Share File</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
