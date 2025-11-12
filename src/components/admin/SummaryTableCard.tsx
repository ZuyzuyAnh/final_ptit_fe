interface SummaryTableItem {
  id: number;
  title: string;
  count: string;
  subtitle: string;
}

interface SummaryTableCardProps {
  title: string;
  items: SummaryTableItem[];
  linkText?: string;
}

export const SummaryTableCard = ({ title, items, linkText = "Xem tất cả" }: SummaryTableCardProps) => {
  return (
    <div className="bg-secondary rounded-xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <button className="text-sm text-primary hover:underline">
          {linkText}
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className="w-8 h-8 bg-foreground text-background rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm">
              {item.id}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-2">
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {item.count}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
