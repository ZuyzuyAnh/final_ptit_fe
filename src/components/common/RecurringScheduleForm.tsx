import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import type {
  CommonCronPattern,
  CronValidationResponse,
} from "@/types/notifications";
import { format } from "date-fns";

interface RecurringScheduleFormProps {
  cronPattern: string;
  timezone: string;
  recurrenceEndDate: string;
  onCronPatternChange: (pattern: string) => void;
  onTimezoneChange: (timezone: string) => void;
  onRecurrenceEndDateChange: (date: string) => void;
  commonPatterns: CommonCronPattern[];
  validation: CronValidationResponse | null;
  isValidating: boolean;
}

const COMMON_TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "Asia/Ho_Chi_Minh", label: "Asia/Ho Chi Minh (GMT+7)" },
  { value: "America/New_York", label: "America/New York (EST)" },
  { value: "Europe/London", label: "Europe/London (GMT)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST)" },
];

export const RecurringScheduleForm = ({
  cronPattern,
  timezone,
  recurrenceEndDate,
  onCronPatternChange,
  onTimezoneChange,
  onRecurrenceEndDateChange,
  commonPatterns,
  validation,
  isValidating,
}: RecurringScheduleFormProps) => {
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [hasEndDate, setHasEndDate] = useState(false);

  // Group patterns by category
  const groupedPatterns = commonPatterns.reduce((acc, pattern) => {
    if (!acc[pattern.category]) acc[pattern.category] = [];
    acc[pattern.category].push(pattern);
    return acc;
  }, {} as Record<string, CommonCronPattern[]>);

  // Detect user's timezone
  useEffect(() => {
    if (!timezone) {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      onTimezoneChange(userTimezone || "Asia/Ho_Chi_Minh");
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "preset" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("preset")}
        >
          Mẫu có sẵn
        </Button>
        <Button
          type="button"
          variant={mode === "custom" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("custom")}
        >
          Tùy chỉnh
        </Button>
      </div>

      {/* Pattern Selection */}
      {mode === "preset" ? (
        <div>
          <Label htmlFor="cron_pattern">Lịch lặp lại *</Label>
          <Select value={cronPattern} onValueChange={onCronPatternChange}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn lịch lặp lại..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(groupedPatterns).map(([category, patterns]) => (
                <div key={category}>
                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                    {category}
                  </div>
                  {patterns.map((p) => (
                    <SelectItem key={p.pattern} value={p.pattern}>
                      {p.description}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div>
          <Label htmlFor="custom_pattern">Cron Pattern *</Label>
          <Input
            id="custom_pattern"
            value={cronPattern}
            onChange={(e) => onCronPatternChange(e.target.value)}
            placeholder="VD: 0 9 * * 1 (Mỗi thứ 2 lúc 9:00)"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Format: phút giờ ngày tháng thứ (5 trường)
          </p>
        </div>
      )}

      {/* Timezone */}
      <div>
        <Label htmlFor="timezone">Múi giờ *</Label>
        <Select value={timezone} onValueChange={onTimezoneChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COMMON_TIMEZONES.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Validation Preview */}
      {cronPattern && (
        <div className="rounded-lg border p-4 space-y-3">
          {isValidating ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang kiểm tra...</span>
            </div>
          ) : validation ? (
            <>
              {validation.isValid ? (
                <>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium">
                      {validation.description}
                    </span>
                  </div>
                  {validation.nextExecutions &&
                    validation.nextExecutions.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4" />5 lần gửi tiếp theo:
                        </div>
                        <ul className="text-sm space-y-1">
                          {validation.nextExecutions.map((time, index) => (
                            <li key={index} className="text-muted-foreground">
                              {format(new Date(time), "dd/MM/yyyy HH:mm:ss")}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="w-4 h-4" />
                  <span>{validation.error || "Cron pattern không hợp lệ"}</span>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* End Date */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Switch
            id="has_end_date"
            checked={hasEndDate}
            onCheckedChange={(checked) => {
              setHasEndDate(checked);
              if (!checked) onRecurrenceEndDateChange("");
            }}
          />
          <Label htmlFor="has_end_date" className="cursor-pointer">
            Đặt ngày kết thúc
          </Label>
        </div>
        {hasEndDate && (
          <div>
            <Input
              type="datetime-local"
              value={recurrenceEndDate}
              onChange={(e) => onRecurrenceEndDateChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Thông báo sẽ ngừng gửi sau ngày này
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
