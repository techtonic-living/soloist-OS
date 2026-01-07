import { ReactNode } from "react";

type CardProps = {
	children: ReactNode;
	className?: string;
};

export function Card({ children, className = "" }: Readonly<CardProps>) {
	return <div className={`depth-card ${className}`}>{children}</div>;
}
