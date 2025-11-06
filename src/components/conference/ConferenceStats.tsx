import React from "react";
import { Users, CheckCircle, Percent } from "lucide-react";

export interface ConferenceStatsProps {
  stats: {
    checkedIn: number;
    registered: number;
    participation: string;
  };
}

export const ConferenceStats: React.FC<ConferenceStatsProps> = ({ stats }) => {
  const statItems = [
    {
      icon: Users,
      label: "Số người đăng ký",
      value: stats.registered,
    },
    {
      icon: CheckCircle,
      label: "Số người đã check-in",
      value: stats.checkedIn,
    },
    {
      icon: Percent,
      label: "Tỷ lệ tham dự",
      value: stats.participation,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="rounded-2xl border bg-card p-6">
            <div className="flex flex-col gap-4">
              <div className="inline-flex items-center justify-center rounded-xl border bg-muted p-2.5 w-10 h-10">
                <Icon className="h-5 w-5 text-foreground/80" />
              </div>
              <div className="text-sm text-muted-foreground">{item.label}</div>
              <div className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
                {item.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
