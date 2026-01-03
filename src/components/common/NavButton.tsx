import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface NavButtonProps {
  label: string;
  path: string;
  icon: LucideIcon;
  isActive: boolean;
}

export const NavButton = ({ label, path, icon: Icon, isActive }: NavButtonProps) => {
  return (
    <Link
      to={path}
      className={`flex items-center gap-3 px-6 py-2 rounded-lg 
        font-medium font-heading transition-colors text-base bg-secondary ${
        isActive
          ? "bg-slate-900 text-white"
          : "text-foreground hover:bg-accent"
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </Link>
  );
};
