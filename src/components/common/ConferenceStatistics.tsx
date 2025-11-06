interface StatItem {
    id: number;
    title: string;
    count: string;
    subtitle: string;
  }
  
  interface ConferenceStatisticsProps {
    stats: StatItem[];
  }
  
  export const ConferenceStatistics = ({ stats }: ConferenceStatisticsProps) => {
    return (
      <div className="rounded-xl p-6 shadow-md bg-secondary h-fit">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-lg">
            Thống kê tổng quan
          </h3>
          <button className="text-sm text-primary hover:underline">
            Hôm nay
          </button>
        </div>
        <hr className="w-full py-4"/>
  
        <div className="space-y-4">
          {stats.map((stat) => (
            <div key={stat.id} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-foreground text-background rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm">
                {stat.id}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2">
                  {stat.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.count}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stat.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  