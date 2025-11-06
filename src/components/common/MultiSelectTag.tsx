import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string;
}

interface MultiSelectTagProps {
  label?: string;
  placeholder?: string;
  options: Option[];
  value: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export const MultiSelectTag: React.FC<MultiSelectTagProps> = ({
  label,
  placeholder = "Chọn...",
  options,
  value,
  onChange,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`flex flex-wrap items-center gap-2 border
          bg-white rounded-full px-4 py-2 cursor-pointer min-h-11 ${
          isOpen ? 'border-primary border-2' : 'border-input' }`}
        >
          {value.length > 0 ? (
            value.map((val) => {
              const option = options.find((o) => o.value === val);
              return (
                <span
                  key={val}
                  className="flex items-center gap-1 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full"
                >
                  {option?.label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(value.filter((v) => v !== val));
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              );
            })
          ) : (
            <span className="text-muted-foreground text-sm">{placeholder}</span>
          )}
        </div>

        {isOpen && (
          <div className="absolute left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-10">
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={cn(
                  "px-4 py-2 text-sm cursor-pointer hover:bg-muted",
                  value.includes(opt.value) && "bg-muted text-primary font-medium"
                )}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
