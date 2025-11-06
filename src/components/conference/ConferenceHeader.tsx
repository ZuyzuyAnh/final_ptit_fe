import React from "react";
import { Calendar, MapPin } from "lucide-react";
import { Countdown } from "@/components/common/Countdown";

export interface ConferenceHeaderProps {
  conference: {
    startDate: string;
    endDate: string;
    location: string;
    countdown?: {
      days: number;
      hours: number;
      minutes: number;
      seconds: number;
    };
    startAt?: string; // ISO string for countdown
    endAt?: string; // ISO string for countdown state
  };
}

export const ConferenceHeader: React.FC<ConferenceHeaderProps> = ({
  conference,
}) => {
  const { startDate, endDate, location, startAt, endAt } = conference;

  return (
    <div className="p-6">
    

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
        {/* Info rows */}
        <div className="sm:col-span-2 grid gap-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{startDate}</span>
            <span className="text-muted-foreground">•</span>
            <span>{endDate}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{location}</span>
          </div>
        </div>

        {/* Countdown */}
        <div className="flex sm:justify-end items-center">
          {startAt ? (
            <Countdown startAt={startAt} endAt={endAt} />
          ) : null}
        </div>
      </div>
    </div>
  );
};
