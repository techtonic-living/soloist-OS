import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { colord } from "colord";

interface GenerativeGlobePickerProps {
	onChange: (hex: string) => void;
	onHoverColor?: (hex: string | null) => void;
	size?: number;
}

export const GenerativeGlobePicker = ({
	onChange,
	onHoverColor,
	size = 380,
}: GenerativeGlobePickerProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		let frame = 0;
		const render = () => {
			const canvas = canvasRef.current;
			if (!canvas) return;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			ctx.clearRect(0, 0, size, size);
			frame++;

			const centerX = size / 2;
			const centerY = size / 2;
			const radius = size / 2 - 20;

			// Draw Globe
			ctx.beginPath();
			ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
			ctx.fillStyle = "#111";
			ctx.fill();

			// Draw Atmospheric Orbs
			for (let i = 0; i < 5; i++) {
				const angle = frame * 0.01 + (i * Math.PI * 2) / 5;
				const x = centerX + Math.cos(angle) * (radius * 0.6);
				const y = centerY + Math.sin(angle * 1.5) * (radius * 0.6);
				const color = colord({
					h: (frame + i * 72) % 360,
					s: 80,
					l: 60,
				}).toHex();

				const grad = ctx.createRadialGradient(
					x,
					y,
					0,
					x,
					y,
					radius * 0.4
				);
				grad.addColorStop(0, color);
				grad.addColorStop(1, "transparent");

				ctx.fillStyle = grad;
				ctx.beginPath();
				ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
				ctx.fill();
			}

			// Rim Glow
			const rimGrad = ctx.createRadialGradient(
				centerX,
				centerY,
				radius - 2,
				centerX,
				centerY,
				radius + 2
			);
			rimGrad.addColorStop(0, "rgba(255,255,255,0)");
			rimGrad.addColorStop(0.5, "rgba(255,255,255,0.4)");
			rimGrad.addColorStop(1, "rgba(255,255,255,0)");
			ctx.strokeStyle = rimGrad;
			ctx.lineWidth = 4;
			ctx.stroke();

			requestAnimationFrame(render);
		};
		const id = requestAnimationFrame(render);
		return () => cancelAnimationFrame(id);
	}, [size]);

	const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const ctx = canvas.getContext("2d", { willReadFrequently: true });
		if (!ctx) return;

		const data = ctx.getImageData(x, y, 1, 1).data;
		const hex = colord({ r: data[0], g: data[1], b: data[2] }).toHex();
		onChange(hex);
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const ctx = canvas.getContext("2d", { willReadFrequently: true });
		if (!ctx) return;

		const data = ctx.getImageData(x, y, 1, 1).data;
		const hex = colord({ r: data[0], g: data[1], b: data[2] }).toHex();
		onHoverColor?.(hex);
	};

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			className="relative pointer-events-auto shadow-neon-glow rounded-full overflow-hidden"
			style={{ width: size, height: size }}
		>
			<canvas
				ref={canvasRef}
				width={size}
				height={size}
				onClick={handleClick}
				onMouseMove={handleMouseMove}
				onMouseLeave={() => onHoverColor?.(null)}
				className="cursor-crosshair"
			/>
		</motion.div>
	);
};
