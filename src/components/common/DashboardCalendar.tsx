import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const DashboardCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(9); // October (0-indexed)
  const [currentYear, setCurrentYear] = useState(2025);
  const today = 2; // Today is October 2nd

  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const generateCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }
    
    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today;
      const isPassed = day < today;
      const isUpcoming = day > today;

      let bgColor = "";
      let textColor = "";

      if (isToday) {
        bgColor = "#000000";
        textColor = "text-white";
      } else if (isPassed) {
        bgColor = "#DCDCDC";
        textColor = "text-foreground";
      } else if (isUpcoming) {
        bgColor = "#FFFFFF";
        textColor = "text-foreground";
      }

      days.push(
        <button
          key={day}
          className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${textColor}`}
          style={{ backgroundColor: bgColor }}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: "#F4F4F6" }}>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-lg bg-white hover:bg-white/80 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-heading font-semibold text-lg">
          {monthNames[currentMonth]} năm {currentYear}
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg bg-white hover:bg-white/80 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {generateCalendarDays()}
      </div>
    </div>
  );
};
