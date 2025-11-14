import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
}

export const StatCard = ({ title, value, icon: Icon }: StatCardProps) => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <p className="text-4xl font-bold">{value}</p>
        </div>
        <div className="p-3 bg-muted rounded-lg">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
