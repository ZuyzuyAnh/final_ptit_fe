import React from "react";

interface CountdownProps {
	startAt: string | Date; // ISO string or Date
	endAt?: string | Date; // optional to determine in-progress state
}

function toDate(value: string | Date): Date {
	return value instanceof Date ? value : new Date(value);
}

function formatTwo(n: number): string {
	return n.toString().padStart(2, "0");
}

export const Countdown: React.FC<CountdownProps> = ({ startAt, endAt }) => {
	const start = React.useMemo(() => toDate(startAt), [startAt]);
	const end = React.useMemo(() => (endAt ? toDate(endAt) : undefined), [endAt]);
	const [now, setNow] = React.useState(() => new Date());

	React.useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(id);
	}, []);

	const isBefore = now < start;
	const isDuring = !!end && now >= start && now <= end;

	if (isDuring) {
		return (
			<div className="rounded-2xl bg-primary text-primary-foreground px-6 py-3 font-semibold text-base md:text-lg">
				Đang diễn ra
			</div>
		);
	}

	if (!isBefore) {
		return null;
	}

	const diff = Math.max(0, start.getTime() - now.getTime());
	const totalSeconds = Math.floor(diff / 1000);
	const days = Math.floor(totalSeconds / 86400);
	const hours = Math.floor((totalSeconds % 86400) / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	return (
		<div className="flex items-center gap-3 rounded-xl bg-muted px-5 py-3">
			<div className="text-xs text-muted-foreground leading-4 px-5">Diễn ra:</div>
			<div className="flex items-center gap-3 font-semibold">
				<div className="text-center">
					<div className="text-lg">{formatTwo(days)}</div>
					<div className="text-[10px] text-muted-foreground -mt-0.5">Ngày</div>
				</div>
				<span className="text-muted-foreground">:</span>
				<div className="text-center">
					<div className="text-lg">{formatTwo(hours)}</div>
					<div className="text-[10px] text-muted-foreground -mt-0.5">Giờ</div>
				</div>
				<span className="text-muted-foreground">:</span>
				<div className="text-center">
					<div className="text-lg">{formatTwo(minutes)}</div>
					<div className="text-[10px] text-muted-foreground -mt-0.5">Phút</div>
				</div>
				<span className="text-muted-foreground">:</span>
				<div className="text-center">
					<div className="text-lg">{formatTwo(seconds)}</div>
					<div className="text-[10px] text-muted-foreground -mt-0.5">Giây</div>
				</div>
			</div>
		</div>
	);
};

export default Countdown;
