import { Bot } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedOrbs from "./AnimatedOrbs";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Logo */}
      <div className="absolute top-6 left-6 z-10">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Bot className="w-4 h-4 md:w-6 md:h-6 text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Obot
          </h1>
        </Link>
      </div>

      {/* Animated Background Orbs */}
      <AnimatedOrbs />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
};

export default AuthLayout;
