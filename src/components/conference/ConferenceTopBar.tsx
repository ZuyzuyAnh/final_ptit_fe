import React from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

interface ConferenceTopBarProps {
	title: string;
	navItems?: Array<{ label: string; to: string }>;
}

export const ConferenceTopBar: React.FC<ConferenceTopBarProps> = ({ title }) => {
	const location = useLocation();

	return (
		<div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
			<div className="max-w-7xl mx-auto px-0 py-4">
				<div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
					<h1 className="text-xl md:text-4xl font-heading font-semibold">{title}</h1>
				</div>
			</div>
		</div>
	);
};

export default ConferenceTopBar;
